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

function getCurrentNumber(shopID) {
    currentNumber = 1;

}


const shopID = "001";

let number = 0; // 初始值

// 每隔1秒钟，执行一次updateNumber函数
const intervalId = setInterval(() => {
    number++;
    document.getElementById("number").textContent = number;
    generateQRCode(shopID + "&" + number)
}, 100000000);