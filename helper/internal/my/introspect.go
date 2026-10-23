package my

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/go-sql-driver/mysql"

	"github.com/rahuldr07/xray-extension/helper/internal/session"
)

// System schemas are left out.
const schemaFilter = `NOT IN ('mysql', 'information_schema', 'performance_schema', 'sys')`

const schemasSQL = `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME ` + schemaFilter + ` ORDER BY SCHEMA_NAME`

const columnsSQL = `SELECT c.TABLE_SCHEMA, c.TABLE_NAME, t.TABLE_TYPE = 'VIEW',
       c.COLUMN_NAME, c.COLUMN_TYPE, c.IS_NULLABLE = 'YES', c.COLUMN_DEFAULT, c.EXTRA, c.COLUMN_KEY = 'PRI'
FROM information_schema.COLUMNS c
JOIN information_schema.TABLES t ON t.TABLE_SCHEMA = c.TABLE_SCHEMA AND t.TABLE_NAME = c.TABLE_NAME
WHERE c.TABLE_SCHEMA ` + schemaFilter + `
ORDER BY c.TABLE_SCHEMA, c.TABLE_NAME, c.ORDINAL_POSITION`

const indexesSQL = `SELECT DISTINCT TABLE_SCHEMA, TABLE_NAME, INDEX_NAME
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA ` + schemaFilter + `
ORDER BY TABLE_SCHEMA, TABLE_NAME, INDEX_NAME`

// Introspect reads the schema tree from information_schema on a connection
// of its own.
func (s *mySession) Introspect(ctx context.Context) (*session.SchemaTree, error) {
	s.mu.Lock()
	closed := s.closed
	s.mu.Unlock()
	if closed {
		return nil, session.Errorf(session.CodeConnectionLost, "The session is closed.")
	}
	dctx, cancel := context.WithTimeout(ctx, connectTimeout)
	conn, err := s.db.Conn(dctx)
	cancel()
	if err != nil {
		if ctx.Err() != nil {
			return nil, cancelled()
		}
		return nil, s.dialErr(err)
	}
	defer conn.Close()
	tree, err := introspect(ctx, conn)
	if err != nil {
		var me *mysql.MySQLError
		switch {
		case ctx.Err() != nil:
			return nil, cancelled()
		case errors.As(err, &me):
			return nil, s.myError(me, "")
		}
		return nil, session.Errorf(session.CodeConnectionLost, "The connection to the database was lost.")
	}
	return tree, nil
}

type relKey struct{ schema, rel string }

func introspect(ctx context.Context, c *sql.Conn) (*session.SchemaTree, error) {
	tree := &session.SchemaTree{Schemas: []session.SchemaNode{}}
	schemaIdx := map[string]int{}

	rows, err := c.QueryContext(ctx, schemasSQL)
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
	rows, err = c.QueryContext(ctx, columnsSQL)
	if err != nil {
		return nil, err
	}
	for rows.Next() {
		var (
			schema, rel, col, typ, extra string
			isView, nullable, pk         bool
			def                          sql.NullString
		)
		if err := rows.Scan(&schema, &rel, &isView, &col, &typ, &nullable, &def, &extra, &pk); err != nil {
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
		var dv *string
		switch {
		case def.Valid:
			dv = &def.String
		case strings.Contains(strings.ToLower(extra), "auto_increment"):
			// COLUMN_DEFAULT is NULL for these; show where the value comes from.
			v := "auto_increment"
			dv = &v
		}
		list[p.idx].Columns = append(list[p.idx].Columns,
			session.ColumnNode{Name: col, Type: typ, Nullable: nullable, DefaultValue: dv, PK: pk})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	rows, err = c.QueryContext(ctx, indexesSQL)
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
