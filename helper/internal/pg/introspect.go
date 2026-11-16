package pg

import (
	"context"

	"github.com/rahuldr07/xray-extension/helper/internal/session"
)

// System schemas are left out: pg_catalog, information_schema, pg_toast* and
// the per-session pg_temp* schemas.
const schemaFilter = `n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND n.nspname NOT LIKE 'pg\_toast%' AND n.nspname NOT LIKE 'pg\_temp\_%'`

const columnsSQL = `SELECT n.nspname, c.relname, c.relkind IN ('v', 'm'),
       a.attname, format_type(a.atttypid, a.atttypmod), NOT a.attnotnull,
       pg_get_expr(d.adbin, d.adrelid),
       EXISTS (SELECT 1 FROM pg_index i WHERE i.indrelid = c.oid AND i.indisprimary AND a.attnum = ANY (i.indkey))
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = a.attnum
WHERE c.relkind IN ('r', 'p', 'f', 'v', 'm') AND ` + schemaFilter + `
ORDER BY n.nspname, c.relname, a.attnum`

const indexesSQL = `SELECT n.nspname, t.relname, ic.relname
FROM pg_index x
JOIN pg_class ic ON ic.oid = x.indexrelid
JOIN pg_class t ON t.oid = x.indrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE ` + schemaFilter + `
ORDER BY n.nspname, t.relname, ic.relname`

const schemasSQL = `SELECT n.nspname FROM pg_namespace n WHERE ` + schemaFilter + ` ORDER BY n.nspname`

// Introspect reads the schema tree on the session's tab-less connection.
func (s *pgSession) Introspect(ctx context.Context) (*session.SchemaTree, error) {
	s.probeMu.Lock()
	defer s.probeMu.Unlock()
	s.mu.Lock()
	closed := s.closed
	s.mu.Unlock()
	if closed {
		return nil, session.Errorf(session.CodeConnectionLost, "The session is closed.")
	}
	if s.probe == nil || s.probe.conn.IsClosed() {
		c, err := s.dial(ctx)
		if err != nil {
			return nil, s.dialErr(err)
		}
		s.probe = c
	}
	tree, err := introspect(ctx, s.probe)
	if err != nil {
		t := &tab{c: s.probe}
		return nil, s.execErr(ctx, t, err)
	}
	return tree, nil
}

type relKey struct{ schema, rel string }

func introspect(ctx context.Context, c *tabConn) (*session.SchemaTree, error) {
	tree := &session.SchemaTree{Schemas: []session.SchemaNode{}}
	schemaIdx := map[string]int{}

	rows, err := c.conn.Query(ctx, schemasSQL)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			rows.Close()
			return nil, err
		}
		schemaIdx[name] = len(tree.Schemas)
		tree.Schemas = append(tree.Schemas, session.SchemaNode{Name: name, Tables: []session.TableNode{}, Views: []session.TableNode{}})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	type pos struct {
		schema int
		view   bool
		idx    int
	}
	rels := map[relKey]pos{}
	rows, err = c.conn.Query(ctx, columnsSQL)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var (
			schema, rel, col, typ string
			isView, nullable, pk  bool
			def                   *string
		)
		if err := rows.Scan(&schema, &rel, &isView, &col, &typ, &nullable, &def, &pk); err != nil {
			rows.Close()
			return nil, err
		}
		si, ok := schemaIdx[schema]
		if !ok {
			continue
		}
		k := relKey{schema, rel}
		p, ok := rels[k]
		sn := &tree.Schemas[si]
		if !ok {
			node := session.TableNode{Name: rel, Columns: []session.ColumnNode{}, Indexes: []string{}}
			if isView {
				p = pos{si, true, len(sn.Views)}
				sn.Views = append(sn.Views, node)
			} else {
				p = pos{si, false, len(sn.Tables)}
				sn.Tables = append(sn.Tables, node)
			}
			rels[k] = p
		}
		list := sn.Tables
		if p.view {
			list = sn.Views
		}
		list[p.idx].Columns = append(list[p.idx].Columns,
			session.ColumnNode{Name: col, Type: typ, Nullable: nullable, DefaultValue: def, PK: pk})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	rows, err = c.conn.Query(ctx, indexesSQL)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var schema, rel, idx string
		if err := rows.Scan(&schema, &rel, &idx); err != nil {
			rows.Close()
			return nil, err
		}
		p, ok := rels[relKey{schema, rel}]
		if !ok {
			continue
		}
		sn := &tree.Schemas[p.schema]
		list := sn.Tables
		if p.view {
			list = sn.Views
		}
		list[p.idx].Indexes = append(list[p.idx].Indexes, idx)
	}
	return tree, rows.Err()
}
