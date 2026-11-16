// Builds the shared `shop` SQLite database used by the engine unit tests and the SQL client e2e test.
// It is built with the real sqlite-wasm so the bytes are a genuine database file.
let modulePromise = null;

export function loadSqlite() {
  modulePromise ??= import('@sqlite.org/sqlite-wasm').then((m) => m.default());
  return modulePromise;
}

const SHOP_SQL = `
  create table customers(id INTEGER PRIMARY KEY, email TEXT NOT NULL, created_at TEXT);
  insert into customers values
    (1, 'ada@example.test', '2026-01-01'),
    (2, 'grace@example.test', '2026-02-01'),
    (3, 'linus@example.test', null);
  create table orders(
    id INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total NUMERIC,
    meta TEXT,
    big INTEGER,
    photo BLOB
  );
  insert into orders values (1, 1, 1250.5, '{"gift":true}', 9007199254740993, zeroblob(300));
  with recursive n(i) as (select 2 union all select i + 1 from n where i < 2500)
    insert into orders select i, (i % 3) + 1, i * 1.5, null, i, null from n;
  create index orders_customer on orders(customer_id);
  create view big_orders as select * from orders where total > 1000;
`;

export async function shopDatabaseBytes() {
  const sqlite3 = await loadSqlite();
  const db = new sqlite3.oo1.DB(':memory:');
  try {
    db.exec(`begin; ${SHOP_SQL} commit;`);
    return sqlite3.capi.sqlite3_js_db_export(db);
  } finally {
    db.close();
  }
}
