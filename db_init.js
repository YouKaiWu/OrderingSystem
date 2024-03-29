const sqlite3 = require("sqlite3").verbose();
const path = require("path"); // 引入 path 模組

// 連接到實體資料庫文件
const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  db.serialize(() => {
    // 建立銀行資料表
    db.run(
      `CREATE TABLE IF NOT EXISTS Bank (
            user_id INTEGER PRIMARY KEY,
            name TEXT,
            passwd TEXT,
            balance INTEGER
        )`
    );
    // 插入示範資料
    db.run(`INSERT INTO Bank (name, passwd, balance)
    SELECT 'Alice', '123', 10000
    WHERE NOT EXISTS (SELECT 1 FROM Bank WHERE name = 'Alice')`);

    db.run(`INSERT INTO Bank (name, passwd, balance)
    SELECT 'Bob', '123', 10000
    WHERE NOT EXISTS (SELECT 1 FROM Bank WHERE name = 'Bob')`);

    // 建立 Shop 資料表
    db.run(
      `CREATE TABLE IF NOT EXISTS Shop (
      id INTEGER PRIMARY KEY,
      counter INTEGER,
      balance INTEGER)`
    );

    // 插入示範資料
    db.run(
      `
    INSERT INTO Shop (id, counter, balance)
    SELECT 1, 1, 0
    WHERE NOT EXISTS (SELECT 1 FROM Shop WHERE id = 1)
  `,
      function (err) {
        if (err) {
          console.error(err.message);
        } else {
          // console.log("Inserted sample data into Shop table.");
        }
      }
    );

    db.run(`
      INSERT INTO Shop (counter, balance)
      SELECT 1, 0
      WHERE NOT EXISTS (SELECT 1 FROM Shop WHERE id = 2)
    `)

    db.run(`
      INSERT INTO Shop (counter, balance)
      SELECT 1, 0
      WHERE NOT EXISTS (SELECT 1 FROM Shop WHERE id = 3)
    `)

    // 建立 Item 資料表
    db.run(
      `CREATE TABLE IF NOT EXISTS Item (
            id INTEGER PRIMARY KEY,
            name TEXT,
            price INTEGER,
            shop_id INTEGER,
            FOREIGN KEY(shop_id) REFERENCES Shop(id)
        )`
    );

    db.run(
      `
      INSERT INTO Item (name, price, shop_id)
      SELECT 'Item_A_in_shop_1', 10, 1
      WHERE NOT EXISTS (SELECT 1 FROM Item WHERE name = 'Item_A_in_shop_1')
      `
    )

    db.run(
      `
      INSERT INTO Item (name, price, shop_id)
      SELECT 'Item_B_in_shop_1', 10, 1
      WHERE NOT EXISTS (SELECT 1 FROM Item WHERE name = 'Item_B_in_shop_1')
      `
    )

    db.run(
      `
      INSERT INTO Item (name, price, shop_id)
      SELECT 'Item_A_in_shop_2', 10, 2
      WHERE NOT EXISTS (SELECT 1 FROM Item WHERE name = 'Item_A_in_shop_2')
      `
    )

    db.run(
      `
      INSERT INTO Item (name, price, shop_id)
      SELECT 'Item_B_in_shop_2', 10, 2
      WHERE NOT EXISTS (SELECT 1 FROM Item WHERE name = 'Item_B_in_shop_2')
      `
    )

    db.run(
      `
      INSERT INTO Item (name, price, shop_id)
      SELECT 'Item_A_in_shop_3', 10, 3
      WHERE NOT EXISTS (SELECT 1 FROM Item WHERE name = 'Item_A_in_shop_3')
      `
    )

    db.run(
      `
      INSERT INTO Item (name, price, shop_id)
      SELECT 'Item_B_in_shop_3', 10, 3
      WHERE NOT EXISTS (SELECT 1 FROM Item WHERE name = 'Item_B_in_shop_3')
      `
    )

    // 建立 e_invoice 資料表
    db.run(
      `CREATE TABLE IF NOT EXISTS e_invoice (
            id TEXT PRIMARY KEY,
            total_price INTEGER,
            user_id INTEGER,
            shop_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES Bank(user_id),
            FOREIGN KEY(shop_id) REFERENCES Shop(id)
        )`
    );

    db.run(`
      INSERT INTO e_invoice (id, total_price, user_id, shop_id)
      SELECT 'AB00000001', 100, 1, 1
      WHERE NOT EXISTS (SELECT 1 FROM e_invoice WHERE id = 'AB00000001')
    `)

    // 建立 contains 資料表
    db.run(
      `CREATE TABLE IF NOT EXISTS contains (
      e_invoice_id TEXT,
      item_id INTEGER,
      amount INTEGER,
      FOREIGN KEY(e_invoice_id) REFERENCES e_invoice(id),
      FOREIGN KEY(item_id) REFERENCES Item(id)
        )`
    );

    db.run(`
      INSERT INTO contains (e_invoice_id, item_id, amount)
      SELECT 'AB00000001', 1, 10
      WHERE NOT EXISTS (SELECT 1 FROM contains WHERE e_invoice_id = 'AB00000001')
    `)
  });
  return db;
}

// 查詢資料
// db.all("SELECT * FROM Shop", [], (err, rows) => {
//   if (err) {
//     throw err;
//   }
//   rows.forEach((row) => {
//     console.log(row);
//   });
// });

// 關閉資料庫連線
process.on("SIGINT", () => {
  db.close();
  process.exit();
});
module.exports = { initializeDatabase };