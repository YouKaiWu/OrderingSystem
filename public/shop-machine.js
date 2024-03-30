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


function domReady(fn) {
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        setTimeout(fn, 1000);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

domReady(function () {

    // If found your qr code
    function onScanSuccess(decodeText, decodeResult) {
        console.log(decodeText);
        fetch(decodeText, { method: "POST" })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('轉款成功');
                    window.location.href = '/scanner.html'; // 導向scanner.html頁面
                } else {
                    alert('轉款失敗 ' + data.error);
                }
            })
            .catch(error => {
                console.error('出事了', error);
                alert('轉款失敗');
            });
    }

    let htmlscanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbos: 250 }
    );
    htmlscanner.render(onScanSuccess);
});
