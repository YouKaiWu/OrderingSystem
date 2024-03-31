// Fetching users
fetch('users')
    .then(response => response.json())
    .then(data => {
        const userList = document.getElementById('userList');

        data.forEach(user => {
            const row = `
                <tr>
                    <td>${user.name}</td>   
                    <td>${user.balance} 元</td>
                </tr>
            `;
            userList.innerHTML += row;
        });
    })
    .catch(error => {
        console.error('Error fetching user list:', error);
        alert('資料取得失敗');
    });

// Fetching shops
fetch('shops')
    .then(response => response.json())
    .then(data => {
        const shopList = document.getElementById('shopList');

        data.forEach(shop => {
            const row = `
                <tr>
                    <td>${shop.id}</td>
                    <td>${shop.balance} 元</td>
                </tr>
            `;
            shopList.innerHTML += row;
        });
    })
    .catch(error => {
        console.error('Error fetching shop list:', error);
        alert('店家資料取得失敗');
    });
