const sqlite3 = require("sqlite3").verbose();
const path = require("path"); // 引入 path 模組

// 連接到實體資料庫文件
const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 建立銀行資料表
  db.run(
    `CREATE TABLE IF NOT EXISTS Bank (
            "user-id" INTEGER PRIMARY KEY,
            name TEXT,
            passwd TEXT,
            balance INTEGER
        )`
  );
  // 插入示範資料
  //   db.run(`INSERT INTO Bank (user, passwd, balance)
  //   SELECT 'Alice', '123', 10000
  //   WHERE NOT EXISTS (SELECT 1 FROM Bank WHERE user = 'Alice')`);

  //   db.run(`INSERT INTO Bank (user, passwd, balance)
  //   SELECT 'Bob', '123', 10000
  //   WHERE NOT EXISTS (SELECT 1 FROM Bank WHERE user = 'Bob')`);
  // 建立 Shop 資料表
  db.run(
    `CREATE TABLE IF NOT EXISTS Shop (
            "shop-id" INTEGER PRIMARY KEY,
            balance INTEGER
        )`
  );

  // 建立 Item 資料表
  db.run(
    `CREATE TABLE IF NOT EXISTS Item (
            id INTEGER PRIMARY KEY,
            name TEXT,
            price INTEGER,
            "shop-id" INTEGER,
            FOREIGN KEY("shop-id") REFERENCES Shop("shop-id")
        )`
  );

  // 建立 e-invoice 資料表
  db.run(
    `CREATE TABLE IF NOT EXISTS "e-invoice" (
            id TEXT PRIMARY KEY,
            "user-id" INTEGER,
            "shop-id" INTEGER,
            FOREIGN KEY("user-id") REFERENCES Shop("shop-id"),
            FOREIGN KEY("shop-id") REFERENCES Shop("shop-id")
        )`
  );

  // 建立 contains 資料表
  db.run(
    `CREATE TABLE IF NOT EXISTS contains (
            "id(e-invoice)" TEXT,
            "id(item)" INTEGER,
            amount INTEGER,
            FOREIGN KEY("id(e-invoice)") REFERENCES "e-invoice"(id),
            FOREIGN KEY("id(item)") REFERENCES Item(id)
        )`
  );
});

// 查詢資料
db.all("SELECT * FROM Bank", [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row);
  });
});

// 關閉資料庫連線
process.on("SIGINT", () => {
  db.close();
  process.exit();
});
