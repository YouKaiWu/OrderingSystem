var getMenuButton = document.getElementById("getMenuButton");

getMenuButton.addEventListener('click', () => {
    var targetShopID = document.getElementById("targetShopID").value;
    console.log(`getting shop ${targetShopID}'s menu...`);
    fetch('getMenu/' + targetShopID)
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            var content = "";

            if (data.items.length == 0) {
                content += `<p>No item in shop ${targetShopID}.</p>\n`;
            } else {
                data.items.forEach(element => {
                    content += "<p> item: " + element.name + " price: " + element.price + "</p>\n"
                });
            }

            document.getElementById("menu").innerHTML = content;
        })
        .catch(error => {
            console.error('Error fetching menu:', error);
        });
});