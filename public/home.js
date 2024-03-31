var userCarrier = "";

// 從後端獲取當前使用者
fetch('currentuser')
    .then(response => response.json())
    .then(data => {
        if (data.username !== undefined) {
            document.getElementById('currentUser').textContent = `當前使用者: ${data.username}`;
        } else {
            window.location.href = '/login.html';
            // document.getElementById('currentUser').textContent = '當前使用者: Unauthenticated';
        }
    })
    .catch(error => {
        console.error('Error fetching current user:', error);
        document.getElementById('currentUser').textContent = '當前使用者: 資料取得失敗';
    });

// 從後端獲取當前金額
fetch('balance')
    .then(response => response.json())
    .then(data => {
        if (data.balance !== undefined) {
            document.getElementById('currentBalance').textContent = `當前金額: ${data.balance} 元`;
        }
    })
    .catch(error => {
        console.error('Error fetching balance:', error);
        document.getElementById('currentBalance').textContent = '當前金額: 資料取得失敗';
    });
fetch('carrier')
    .then(response => response.json())
    .then(data => {
        if (data.carrier !== undefined) {
            JsBarcode("#code128", data.carrier);
            userCarrier = data.carrier;
        }
    })
    .catch(error => {
        console.error('Error fetching carrier:', error);
        alert('無法獲取運輸商資訊');
    });

document.getElementById("code128").addEventListener('click', handleClick);
// 新增的點擊事件處理函式
function handleClick(event) {
    // 防止事件冒泡
    event.stopPropagation();

    // 防止快速連續點擊觸發多個請求
    // this.removeEventListener('click', handleClick);

    fetch('/orders' + userCarrier, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            const orderList = document.getElementById('orderList');
            const orderTable = document.getElementById('orderTable');
            console.log(orderTable.style.visibility)
            orderTable.style.visibility = orderTable.style.visibility == "hidden" ? "visible" : "hidden"

            var rows = ''
            data.forEach(order => {
                rows += `
                <tr>
                    <td>${order.shop_id}</td>
                    <td>${order.total_price}</td>
                </tr>
            `;

            });
            orderList.innerHTML = rows;
        })
        .catch(error => {
            console.error('Error ask orders:', error);
            alert('要求訂單失敗');
        });
}