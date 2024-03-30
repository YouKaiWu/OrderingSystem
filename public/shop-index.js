var getMenuButton = document.getElementById("getMenuButton");
const targetShopID = 1;
console.log(`getting shop ${targetShopID}'s menu...`);
fetch("getMenu/" + targetShopID)
  .then((response) => response.json())
  .then((data) => {
    // console.log(data);
    var content = "";

    if (data.items.length == 0) {
      content += `<p>No item in shop ${targetShopID}.</p>\n`;
    } else {
      data.items.forEach((element) => {
        content += `<div class='item-block'><p class="item-name">${element.name}</p><div class="counter">\$${element.price}
                <button class="decrease">-</button>
                <span class="count">0</span>
                <button class="increase">+</button>
            </div></div>`;
      });
    }

    document.getElementById("item-list").innerHTML = content;
    const decreaseButtons = document.querySelectorAll(".decrease");
    decreaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const countSpan = this.parentNode.querySelector(".count");
        let count = parseInt(countSpan.textContent, 10);
        count = Math.max(count - 1, 0); // 防止数量小于0
        countSpan.textContent = count;
      });
    });

    // 处理加号按钮点击事件
    const increaseButtons = document.querySelectorAll(".increase");
    increaseButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const countSpan = this.parentNode.querySelector(".count");
        let count = parseInt(countSpan.textContent, 10);
        countSpan.textContent = count + 1;
      });
    });
  })
  .catch((error) => {
    console.error("Error fetching menu:", error);
  });

fetch("currentNumber/" + targetShopID)
  .then((response) => response.json())
  .then((data) => {
    document.getElementById("number").innerHTML = data.data.counter;
  })
  .catch((error) => {
    console.error("Error fetching number:", error);
  });
const submitButton = document.getElementById("submit");
submitButton.addEventListener("click", function () {
  let orderData = {
    items: [],
  };

  const itemBlocks = document.querySelectorAll(".item-block");
  itemBlocks.forEach((block) => {
    const itemName = block.querySelector(".item-name").textContent;
    const itemPrice = parseInt(
      block.querySelector(".counter").textContent.replace("$", ""),
      10
    );
    const itemCount = parseInt(block.querySelector(".count").textContent, 10);

    if (itemCount > 0) {
      orderData.items.push({
        name: itemName,
        price: itemPrice,
        amount: itemCount,
      });
    }
  });
  // 傳送訂單到後端
  fetch("submitOrder/" + targetShopID, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => response.json())
    .then((data) => {
      // 清空購物車或顯示訂單成功信息等
      console.log("Order submitted successfully:", data);
    })
    .catch((error) => {
      console.error("Error submitting order:", error);
    });
});
