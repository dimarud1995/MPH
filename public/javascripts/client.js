function buy(event) {
    var id = event.currentTarget.id

    event.preventDefault()

    sessionStorage.setItem(Math.random(), id)
    setCounter()
}

function removeProdyctFromCart(event) {
    // incorrect deleting somethimes
    var id = event.currentTarget.id
    event.preventDefault()
    document.getElementById('product-' + id).remove()

    var prodsIds = getProductsFromSessionStorage()
    sessionStorage.clear()

    for (let index = 0; index < prodsIds.length; index++) {
        if (prodsIds[index] == id) {
            prodsIds.pop(prodsIds[index])
            break
        }
    }

    prodsIds.forEach((id) => {
        sessionStorage.setItem(Math.random(), id)
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
    return Object.values(sessionStorage)
}

function setCartEventListener() {
    $('#cartBtn').click(function (e) {
        e.preventDefault()
        var prodIds = getProductsFromSessionStorage()
        if (prodIds && prodIds.length) {
            document.getElementById('prodIds').value = prodIds
            document.getElementById('cartSubmit').click()
        }
    })
}

function countSum() {
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
}
$(document).ready(function () {
    setCounter()
    setCartEventListener()
})