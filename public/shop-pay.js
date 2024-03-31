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
    generateQRCode('pay/1');
}

domReady(function () {

    // If found your qr code
    function onScanSuccess(decodeText, decodeResult) {
        console.log(decodeText);

        fetch("barcode" + decodeText)
            .then(response => response.json())
            .then(data => {
                alert(data.success);
            })
            .catch(error => {
                console.error('Error fetching number:', error);
            });
        console.log("after fetch");
    }

    let htmlscanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbos: 250 }
    );
    htmlscanner.render(onScanSuccess);
});
