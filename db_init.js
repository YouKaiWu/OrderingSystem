const sqlite3 = require("sqlite3").verbose();
const path = require("path"); // 引入 path 模組

// 連接到實體資料庫文件
const dbPath = path.join(__dirname, "database.db");
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  db.serialize(() => {
    // 建立銀行資料表
    db.run(
      `CREATE TABLE IF NOT EXISTS bank (
            user_id INTEGER PRIMARY KEY,
            name TEXT,
            passwd TEXT,
            balance INTEGER,
            carrier TEXT
        )`
    );
    // 插入示範資料
    db.run(`INSERT INTO bank (name, passwd, balance, carrier)
    SELECT 'Alice', '123', 10000, '/ABC+123'
    WHERE NOT EXISTS (SELECT 1 FROM bank WHERE name = 'Alice')`);

    db.run(`INSERT INTO bank (name, passwd, balance, carrier)
    SELECT 'Bob', '123', 10000, '/DEF+123'
    WHERE NOT EXISTS (SELECT 1 FROM bank WHERE name = 'Bob')`);

    db.run(`INSERT INTO bank (name, passwd, balance, carrier)
    SELECT 'k', 'k', 10000, '/DEF+456'
    WHERE NOT EXISTS (SELECT 1 FROM bank WHERE name = 'k')`);

    // 建立 Shop 資料表
    db.run(
      `CREATE TABLE IF NOT EXISTS shop (
      id INTEGER PRIMARY KEY,
      counter INTEGER,
      balance INTEGER)`
    );

    // 插入示範資料
    db.run(
      `
    INSERT INTO shop (id, counter, balance)
    SELECT 1, 1, 0
    WHERE NOT EXISTS (SELECT 1 FROM shop WHERE id = 1)
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
      INSERT INTO shop (counter, balance)
      SELECT 1, 0
      WHERE NOT EXISTS (SELECT 1 FROM shop WHERE id = 2)
    `)

    db.run(`
      INSERT INTO shop (counter, balance)
      SELECT 1, 0
      WHERE NOT EXISTS (SELECT 1 FROM shop WHERE id = 3)
    `)

    // 建立 Item 資料表
    db.run(
      `CREATE TABLE IF NOT EXISTS item (
            id INTEGER PRIMARY KEY,
            name TEXT,
            price INTEGER,
            shop_id INTEGER,
            FOREIGN KEY(shop_id) REFERENCES shop(id)
        )`
    );

    db.run(
      `
      INSERT INTO item (name, price, shop_id)
      SELECT 'Item_A_in_shop_1', 10, 1
      WHERE NOT EXISTS (SELECT 1 FROM item WHERE name = 'Item_A_in_shop_1')
      `
    )

    db.run(
      `
      INSERT INTO item (name, price, shop_id)
      SELECT 'Item_B_in_shop_1', 10, 1
      WHERE NOT EXISTS (SELECT 1 FROM item WHERE name = 'Item_B_in_shop_1')
      `
    )

    db.run(
      `
      INSERT INTO item (name, price, shop_id)
      SELECT 'Item_A_in_shop_2', 10, 2
      WHERE NOT EXISTS (SELECT 1 FROM item WHERE name = 'Item_A_in_shop_2')
      `
    )

    db.run(
      `
      INSERT INTO item (name, price, shop_id)
      SELECT 'Item_B_in_shop_2', 10, 2
      WHERE NOT EXISTS (SELECT 1 FROM item WHERE name = 'Item_B_in_shop_2')
      `
    )

    db.run(
      `
      INSERT INTO item (name, price, shop_id)
      SELECT 'Item_A_in_shop_3', 10, 3
      WHERE NOT EXISTS (SELECT 1 FROM item WHERE name = 'Item_A_in_shop_3')
      `
    )

    db.run(
      `
      INSERT INTO item (name, price, shop_id)
      SELECT 'Item_B_in_shop_3', 10, 3
      WHERE NOT EXISTS (SELECT 1 FROM item WHERE name = 'Item_B_in_shop_3')
      `
    )

    // 建立 order_ 資料表
    db.run(
      `CREATE TABLE IF NOT EXISTS order_ (
            id INTEGER PRIMARY KEY,
            total_price INTEGER,
            user_num INTEGER,
            shop_id INTEGER,
            carrier_id TEXT NULL,
            FOREIGN KEY(shop_id) REFERENCES shop(id)
        )`
    );

    db.run(`
      INSERT INTO order_ (id, total_price, user_num, shop_id)
      SELECT 1, 100, 1, 1
      WHERE NOT EXISTS (SELECT 1 FROM order_ WHERE id = 1)
    `)

    // 建立 e_invoice 資料表
    db.run(
      `CREATE TABLE IF NOT EXISTS e_invoice (
            id TEXT PRIMARY KEY,
            order_id INTEGER,
            FOREIGN KEY(order_id) REFERENCES order_(id)
        )`
    );

    db.run(`
      INSERT INTO e_invoice (id, order_id)
      SELECT 'AB00000001', 1
      WHERE NOT EXISTS (SELECT 1 FROM e_invoice WHERE id = 'AB00000001')
    `)

    // 建立 contains 資料表
    db.run(
      `CREATE TABLE IF NOT EXISTS contains (
      order_id INTEGER,
      item_id INTEGER,
      amount INTEGER,
      FOREIGN KEY(order_id) REFERENCES order_(id),
      FOREIGN KEY(item_id) REFERENCES item(id)
        )`
    );

    db.run(`
      INSERT INTO contains (order_id, item_id, amount)
      SELECT 1, 1, 10
      WHERE NOT EXISTS (SELECT 1 FROM contains WHERE order_id = 1)
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