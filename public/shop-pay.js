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

function domReady(fn) {
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        setTimeout(fn, 1000);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
    generateQRCode('transferToShop/1');
}

domReady(function () {

    // If found your qr code
    function onScanSuccess(decodeText, decodeResult) {
        console.log(decodeText);

        if (decodeText.includes("transfer"))

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
