function buy(event) {
    //alert(event.currentTarget.id);
    var id = event.currentTarget.id.split("-")[0]
    var material = event.currentTarget.id.split("-")[1]
    var postprocessing = event.currentTarget.id.split("-")[2]

    var price = event.currentTarget.id.split("-")[3]

    //  var el = document.getElementById('girl' + id);

    event.preventDefault()
    if (postprocessing == "paint" && event.currentTarget.id.split("-").length > 4) {
        var color = event.currentTarget.id.split("-")[4]
        var item = {
            id,
            material,
            postprocessing,
            price,
            color
        }
    } else {
        var item = {
            id,
            material,
            postprocessing,
            price,
            color: ""

        }
    }

    var s = JSON.stringify(item)
    console.log(s);
    sessionStorage.setItem(Math.random(), s)
    setCounter()
    var r = window.confirm("Додано! Перейти до корзини?");
    if (r) {

        var prodIds = getProductsFromSessionStorage()
        console.log(prodIds);
        if (prodIds && prodIds.length) {
            document.getElementById('prodIds').value = prodIds
            document.getElementById('cartSubmit').click()
        }

    }
    // el.classList.toggle("fade");

    setTimeout(() => {
        el.classList.toggle("fade")
    }, 2000);
}

function removeProdyctFromCart(event) {
    // incorrect deleting somethimes
    var id = event.currentTarget.id
    //  console.log(id);
    event.preventDefault()
    document.getElementById('product-' + id).remove()
    var prods = sessionStorage;
    var prodIds = [];
    for (var propName in prods) {
        if (prods.hasOwnProperty(propName)) {
            prodIds.push(prods[propName]);
            // do something with each element here
        }
    }
    sessionStorage.clear()
    var id1 = id.split('-')[0];
    var id2 = id.split('-')[1];
    var id3 = id.split('-')[2];
    var id4 = id.split('-')[3];
    if (id.split('-').length > 4) var id5 = id.split('-')[4];
    // console.log(prodIds);
    for (let index = 0; index < prodIds.length; index++) {
        var p = JSON.parse(prodIds[index]);

        if (p.id == id1 && p.material == id2 && p.postprocessing == id3 && p.price == id4) {
            console.log(p)
            console.log(id)
            console.log(p.id)
            console.log(p.material)
            console.log(p.postprocessing)
            console.log(p.price)
            console.log(id1);
            console.log(id2);
            console.log(id3);
            console.log(id4);
            console.log(id5);
            var i = prodIds.indexOf(prodIds[index]);
            console.log(i);
            prodIds.splice(i, 1)

            break
        }
    }
    console.log(prodIds);
    prodIds.forEach((e) => {
        console.log(e);
        sessionStorage.setItem(Math.random(), e)
    })

    setCounter();
    countSum();
}

function setCounter() {
    var counter = sessionStorage.length
    var counterEl = document.getElementById('cart-counter')

    if (!counter) {
        counterEl.style.display = 'none'
    } else {
        counterEl.style.display = 'block'
        counterEl.textContent = counter
    }
}

function getProductsFromSessionStorage() {
    var prods = sessionStorage;
    var prodIds = [];
    for (var propName in prods) {
        if (prods.hasOwnProperty(propName)) {
            prodIds.push(prods[propName]);
            // do something with each element here
        }
    }
    return prodIds;
}

function setCartEventListener() {
    $('#cartBtn').click(function (e) {
        e.preventDefault()
        var prodIds = getProductsFromSessionStorage()
        console.log(prodIds);
        if (prodIds && prodIds.length) {
            document.getElementById('prodIds').value = prodIds
            document.getElementById('cartSubmit').click()
        }
    })
}

function countSum() {
    try {


        console.log("ready");
        var priceList = $('.price').text();
        var sum = 0;
        var list = priceList.split("₴");
        console.log(list);
        for (var i = 0; i < list.length; i++) {
            if (list[i].length > 0) {
                console.log(list[i]);
                sum += Number.parseInt(list[i]);
                $('#sum').text(sum);
            }
        }
    } catch (e) {
        $('#sum').text(sum);

    }
}
$(document).ready(function () {
    setCounter()
    setCartEventListener()
})