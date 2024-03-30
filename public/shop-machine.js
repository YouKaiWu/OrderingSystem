function generateQRCode(url) {
    const qrcodeDiv = document.getElementById('qrcode');
    qrcodeDiv.innerHTML = ''; // 清空先前的 QR code
    // 使用 QRCode.js 生成 QR code
    new QRCode(qrcodeDiv, {
        text: url,
        width: 300,
        height: 300
    });
}

const shopID = "1";

let number = 0; // 初始值

// 每隔1秒钟，执行一次updateNumber函数
const intervalId = setInterval(() => {

    fetch('currentNumber/' + shopID)
        .then(response => response.json())
        .then(data => {
            number = data.data.counter;
            document.getElementById("number").textContent = number;
            generateQRCode(shopID + "/" + number)
        })
        .catch(error => {
            console.error('Error fetching number:', error);
        });
}, 500);
