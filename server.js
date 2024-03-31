const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path"); // 引入 path 模組
const session = require("express-session");
const { initializeDatabase } = require("./db_init");

const app = express();

const PORT = 3000;

// 解析 JSON 和 URL 編碼的數據
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 設置靜態文件目錄
app.use(express.static(path.join(__dirname, "public")));

// 連接到實體資料庫文件
const db = initializeDatabase();

// 設置 CORS
app.use(cors());

// 取得所有使用者資料
app.get("/users", (req, res) => {
  db.all("SELECT * FROM Bank", (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

// 設定 session 中介軟體
app.use(
  session({
    secret: "mySecretKey", // 建議使用隨機的字串
    resave: false,
    saveUninitialized: true,
  })
);

// 登入
app.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.send(
        "<script>alert('Username and password are required.'); window.location.href='/login.html';</script>"
      );
    }

    db.get(
      "SELECT * FROM Bank WHERE name = ? AND passwd = ?",
      [username, password],
      (err, row) => {
        if (err) {
          return res.send(
            `<script>alert('${err.message}'); window.location.href='/login.html';</script>`
          );
        }

        if (row) {
          // 將使用者名稱存入 session
          req.session.user = username;

          // 登入成功後重新導向到 home.html
          return res.send(
            "<script>alert('Login successful.'); window.location.href='/home.html';</script>"
          );
        } else {
          return res.send(
            "<script>alert('Invalid username or password.'); window.location.href='/login.html';</script>"
          );
        }
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.send(
      "<script>alert('Internal server error.'); window.location.href='/login.html';</script>"
    );
  }
});

// 登出
app.get("/logout", (req, res) => {
  try {
    // 檢查使用者是否已經登入
    if (!req.session.user) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    // 移除使用者資訊從 session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Internal server error." });
      }

      res.json({ success: true });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 註冊一筆用戶資料
app.post("/register", (req, res) => {
  try {
    const { username, password, confirm_password } = req.body;

    if (!username || !password || !confirm_password) {
      return res.send(
        "<script>alert('Username, password, and confirm password are required.'); window.location.href = '/register.html';</script>"
      );
    }

    if (password !== confirm_password) {
      return res.send(
        "<script>alert('Passwords do not match.'); window.location.href = '/register.html';</script>"
      );
    }

    // 檢查使用者是否已經存在
    db.get("SELECT * FROM Bank WHERE name = ?", [username], (err, row) => {
      if (err) {
        return res.send(
          `<script>alert('${err.message}'); window.location.href = '/register.html';</script>`
        );
      }

      if (row) {
        return res.send(
          "<script>alert('Username already exists.'); window.location.href = '/register.html';</script>"
        );
      }

      const balance = 0; // default balance is 0

      db.run(
        "INSERT INTO Bank (name, passwd, balance) VALUES (?, ?, ?)",
        [username, password, balance],
        function (err) {
          if (err) {
            return res.send(
              `<script>alert('${err.message}'); window.location.href = '/register.html';</script>`
            );
          }
          res.send(
            "<script>alert('Bank record added successfully.'); window.location.href = '/login.html';</script>"
          );
        }
      );
    });
  } catch (error) {
    console.error("Error:", error);
    res.send(
      "<script>alert('Internal server error.'); window.location.href = '/register.html';</script>"
    );
  }
});

// 獲取當前使用者
app.get("/currentuser", (req, res) => {
  const username = req.session.user;

  if (!username) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  res.json({ username: username });
});

// 獲取使用者餘額
app.get("/balance", (req, res) => {
  const username = req.session.user;

  if (!username) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  db.get("SELECT balance FROM Bank WHERE name = ?", username, (err, row) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Database error." });
    }

    if (!row) {
      console.error("User not found:", username);
      return res.status(404).json({ error: "User not found." });
    }

    if (row.balance === null || row.balance === undefined) {
      console.error("Balance is null or undefined for user:", username);
      return res.status(400).json({ error: "Balance is null or undefined." });
    }

    res.json({ balance: row.balance });
  });
});

app.get("/carrier", (req, res) => {
  const username = req.session.user;

  if (!username) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  db.get("SELECT carrier FROM Bank WHERE name = ?", username, (err, row) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Database error." });
    }

    if (!row) {
      console.error("User not found:", username);
      return res.status(404).json({ error: "User not found." });
    }

    if (row.carrier === null || row.carrier === undefined) {
      console.error("carrier is null or undefined for user:", username);
      return res.status(400).json({ error: "carrier is null or undefined." });
    }

    res.json({ carrier: row.carrier });
  });
});

// 存款
app.post("/deposit", (req, res) => {
  try {
    const username = req.session.user;
    const { amount } = req.body;

    if (!username) {
      return res.status(401).json({ error: "User not authenticated." });
    }

    if (!amount || amount <= 0 || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid deposit amount." });
    }

    // 更新用戶餘額
    db.run(
      "UPDATE Bank SET balance = balance + ? WHERE name = ?",
      [amount, username],
      function (err) {
        if (err) {
          console.error("Database error:", err.message);
          return res.status(500).json({ error: "Database error." });
        }

        // 獲取更新後的餘額
        db.get(
          "SELECT balance FROM Bank WHERE name = ?",
          username,
          (err, row) => {
            if (err) {
              console.error("Database error:", err.message);
              return res.status(500).json({ error: "Database error." });
            }

            if (!row) {
              console.error("User not found:", username);
              return res.status(404).json({ error: "User not found." });
            }

            res.json({ success: true, balance: row.balance });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 轉帳 user1 的錢轉給 user2
app.post("/transfer/:user2/:money", (req, res) => {
  const user1 = req.session.user;
  const { user2, money } = req.params;
  // 檢查 user1 和 user2 是否為同一使用者
  if (user1 === user2) {
    return res
      .status(400)
      .json({ error: "Cannot transfer money to the same user." });
  }

  // 查询 user1 和 user2 的余额
  db.get("SELECT balance FROM Bank WHERE name = ?", user1, (err, rowUser1) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.get(
      "SELECT balance FROM Bank WHERE name = ?",
      user2,
      (err, rowUser2) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // 检查 user1 和 user2 是否存在
        if (!rowUser1 || !rowUser2) {
          return res.status(404).json({ error: "User not found." });
        }

        // 检查 user1 的余额是否足够
        if (rowUser1.balance < money) {
          return res.status(400).json({ error: "Insufficient balance." });
        }

        // 开始转账
        db.serialize(() => {
          db.run(
            "UPDATE Bank SET balance = balance - ? WHERE name = ?",
            [money, user1],
            (err) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              db.run(
                "UPDATE Bank SET balance = balance + ? WHERE name = ?",
                [money, user2],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: err.message });
                  }

                  res.json({ success: true });
                }
              );
            }
          );
        });
      }
    );
  });
});

app.post("/pay/:shop_id", (req, res) => {
  const shop_id = req.params.shop_id;

  const user_num = req.session.number;
  console.log(req.session);
  // 使用 user_num 查询 total_price
  db.get(
    "SELECT total_price FROM order_ WHERE user_num = ?",
    [user_num],
    (err, row) => {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      }

      if (!row) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }
      // 获取客户端传递的银行用户ID和要转移的金额（假设从请求中获取）
      const bankUser = req.session.user; // 假设从会话中获取银行用户ID
      const payAmount = row.total_price; // 假设要转移的金额为100

      // 检查银行账户余额是否足够进行转移
      db.get(
        "SELECT balance FROM Bank WHERE name = ?",
        [bankUser],
        (err, row) => {
          if (err) {
            console.error(err.message);
            return res
              .status(500)
              .json({ success: false, message: "Database error" });
          }

          if (!row) {
            return res
              .status(404)
              .json({ success: false, message: "Bank account not found" });
          }

          const bankBalance = row.balance;

          // 检查银行账户余额是否足够进行转移
          if (bankBalance < payAmount) {
            return res
              .status(400)
              .json({ success: false, message: "Insufficient funds" });
          }

          // 开始转移资金
          db.serialize(() => {
            db.run(
              "UPDATE Bank SET balance = balance - ? WHERE name = ?",
              [payAmount, bankUser],
              (err) => {
                if (err) {
                  console.error(err.message);
                  return res
                    .status(500)
                    .json({
                      success: false,
                      message: "Failed to update bank balance",
                    });
                }

                // 更新商店账户余额
                db.run(
                  "UPDATE Shop SET balance = balance + ? WHERE id = ?",
                  [payAmount, shop_id],
                  (err) => {
                    if (err) {
                      console.error(err.message);
                      return res
                        .status(500)
                        .json({
                          success: false,
                          message: "Failed to update shop balance",
                        });
                    }
                    return res
                      .status(200)
                      .json({ success: true, message: "Pay successful" });
                  }
                );
              }
            );
          });
        }
      );
    }
  );
});

app.get("/getMenu/:shop_id", (req, res) => {
  var shop_id = req.params.shop_id;
  db.all(
    `
    SELECT * FROM Item WHERE shop_id = ${shop_id}
  `,
    (err, row) => {
      if (!row) {
        console.error("Item not found in shop ", shop_id);
        return res.status(404).json({ error: "Item not found." });
      }

      res.json({ items: row });
    }
  );
});

app.get("/currentNumber/:shop_id", (req, res) => {
  var shop_id = req.params.shop_id;
  db.get("SELECT counter FROM Shop WHERE id = ?", [shop_id], (err, row) => {
    if (err) {
      console.error(err.message);
      return;
    }
    res.json({ data: row });
  });
});

app.post("/barcode/:barcodeText", (req, res) => {
  var barcodeText = req.params.barcodeText;
  var user_num = req.session.number;
  // 更新 order_ 表中的 carrier_id
  db.run("UPDATE order_ SET carrier_id = ? WHERE user_num = ?", [barcodeText, user_num], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Failed to update carrier_id' });
    }
    
    // 檢查是否有更新成功的記錄
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'No matching record found' });
    }

    res.status(200).json({ success: true, message: 'Carrier ID updated successfully' });
  });
});

app.get("/clientGetNumber/:shop_id/:number", (req, res) => {
  const shop_id = req.params.shop_id;
  const client_number = req.params.number;

  // 從資料庫取得商店的 counter 值
  db.get("SELECT counter FROM Shop WHERE id = ?", [shop_id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.json({ success: false, message: "Database error" });
      return;
    }

    // 檢查 counter 是否與 client 要求的 number 相同
    if (row && row.counter == client_number) {
      // 將 session 的 number 設定為 counter
      req.session.number = row.counter;
      // 更新数据库中的counter值（counter加1）
      db.run(
        "UPDATE Shop SET counter = ? WHERE id = ?",
        [row.counter + 1, shop_id],
        function (err) {
          if (err) {
            console.error(err.message);
            res.json({
              success: false,
              message: "Failed to update counter in database",
            });
            return;
          }

          console.log("update compeleted");

          // 成功更新后响应
          res.json({
            success: true,
            message: "Number set and counter updated successfully",
          });
        }
      );
    } else {
      res.json({ success: false, message: "Number mismatch" });
    }
  });
});

// items{
//   name: itemName,
//   price: itemPrice,
//   amount: itemCount,
// });
app.post("/submitOrder/:shop_id", (req, res) => {
  var shop_id = req.params.shop_id;
  var items = req.body.items;

  // 1. 插入數據到order_表
  const total_price = calculateTotalPrice(items);
  const user_num = req.session.number;
  const orderQuery = `
    INSERT INTO order_ (total_price, user_num, shop_id)
    VALUES (?, ?, ?);
  `;
  db.run(orderQuery, [total_price, user_num, shop_id], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Error submitting order." });
    }

    const orderId = this.lastID;

    // 2. 插入數據到contains表
    // 定义一个函数来获取 item_id
    function getItemId(itemName, callback) {
      const query = `
      SELECT id FROM item
      WHERE name = ?;
  `;
      db.get(query, [itemName], function (err, row) {
        if (err) {
          console.error(err.message);
          callback(err, null);
        } else {
          callback(null, row.id);
        }
      });
    }

    // 循环 items 进行操作
    for (let item of items) {
      getItemId(item.name, function (err, itemId) {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ message: "Error retrieving item_id." });
        }

        const containsQuery = `
          INSERT INTO contains (order_id, item_id, amount)
          VALUES (?, ?, ?);
      `;

        db.run(containsQuery, [orderId, itemId, item.amount], function (err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Error submitting order." });
          }
        });
      });
    }

    res.status(200).json({ message: "Order submitted successfully!", orderId });
  });
});

// 計算總價格
function calculateTotalPrice(items) {
  let totalPrice = 0;
  for (let item of items) {
    totalPrice += item.price * item.amount;
  }
  return totalPrice;
}

// 關閉資料庫連線
process.on("SIGINT", () => {
  db.close();
  process.exit();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
