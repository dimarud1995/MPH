var express = require('express')
var router = express.Router()
var fs = require('fs');

var categories = require('../data/categories.json')
var slides = require('../data/slides.json')
var catsMap = require('../data/catIdTitleMap.json')
var products = require('../data/products.json')
var comments = require('../data/comments.json')
var popularProducts = require('../data/popularProducts.json')

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('home', {
        slides: slides,
        categories: categories,
        popularProducts: popularProducts,
    })
})

router.get('/category/:category', function (req, res, next) {
    var categories = categories
    var catId = catsMap[req._parsedOriginalUrl.path]
    var categoryName = getCategoryName(catId)
    var products = getProducts(catId)

    res.render('products', {
        category: categoryName,
        products: products,
    })
})

router.get('/product/:id', function (req, res, next) {
    var product = getProductById(req.params.id)
    var a = [];
    a.push(product);
    //  console.log(a);
    var pr = getInterestingProducts(a, 4);
    console.log(pr);
    res.render('product', {
        product: product,
        products: pr
    })
})
router.post("/getInterestingProducts", function (req, res) {
    console.log(req.body)
    var product = getProductById(req.body.id)
    //  console.log(product);
    var a = [];
    a.push(product);
    //  console.log(a);
    var pr = getInterestingProducts(a, 4);
    console.log(pr);
    return res.json(pr)
});
router.post('/cart', function (req, res, next) {
    var products = products
    var ids = req.body.prodIds.split(',')
    var bookedProducts = getProductsByIds(ids)
    var sum = getSum(bookedProducts)

    res.render('cart', {
        products: bookedProducts,
        sum: sum,
        interestingProducts: getInterestingProducts(bookedProducts, 4),
        interestingCategories: getInterestingCategories(bookedProducts, 4)
    })
})
router.get('/about-us', function (req, res) {
    res.render('aboutus')
})
router.get('/order', function (req, res) {
    res.render('order')
})
//
// COMMENTS

router.post("/getComments", function (req, res) {
    console.log(req.body.id);
    var c = getSmartComments(req.body.id, 20);
    return res.json(c);
})
router.post("/setComment", function (req, res) {
    try {
        var c = req.body;
        console.log(c);

        c.date = getDate();
        if (comments.length != 0) c.id = comments[comments.length - 1].id + 1;
        console.log(c);
        comments.push(c);
        var json = JSON.stringify(comments);
        //  console.log(json);
        fs.writeFile('./data/comments.json', json, (err) => {
            if (err) return res.json(err.message);
            console.log('The file has been saved!');
        });

        return res.json({
            comment: c,
            status: "ok"
        });

    } catch (err) {
        return res.json(err);
    }
})



///
// support functions
function getSum(bookedProducts) {
    return bookedProducts.map((x) => x.price).reduce((a, b) => a + b)
}

function getProducts(catId) {
    return products.filter((x) => x.category === catId)
}

function getProductById(id) {
    return products.find((x) => x.id == id)
}

function getProductsByIds(ids) {
    var res = []

    ids.forEach((x) => {
        var product = products.find((e) => e.id == x)

        if (product) {
            res.push(product)
        }
    })

    // var groupped = groupBy(res, prod => prod.id);

    return res
}

function getInterestingProducts(bookedPr, number) {
    var res = [];
    if (bookedPr.length > 0 && products.length > 0) {
        var tempRes = [];
        bookedPr.forEach(i => {
            tempRes = products.filter((e) => (e.category == i.category) && (e.id != i.id));
        });
        if (tempRes.length == 0) {
            tempRes = shuffle(products);
        }
        var j = 0;
        var curNumb = number;
        if (number > tempRes.length) curNumb = tempRes.length;

        while (j < curNumb) {
            var counter = Math.round(Math.random() * (tempRes.length - 1));
            if (res.length > 0) {
                if (tempRes[counter] != null) {
                    res.push(tempRes[counter]);
                    j++;
                }
            } else {
                if (tempRes[counter] != null) {
                    res.push(tempRes[counter]);
                    j++;
                }
            }
        }
        while (res.length < number) {
            var counter = Math.round(Math.random() * (products.length - 1));
            res.push(products[counter])
        }
    }
    return res;
};

function getInterestingCategories(bookedPr, number) {
    var tempRes = [];
    bookedPr.forEach(i => {
        tempRes = (categories.filter((e) => e.id != i.category));
    });
    var res = [];
    var j = 0;
    if (number > tempRes.length) number = tempRes.length;
    while (j < number) {
        var counter = Math.round(Math.random() * (tempRes.length - 1));
        if (res.length > 0) {
            if (tempRes[counter] != null) {
                res.push(tempRes[counter]);
                j++;
            }
        } else {
            if (tempRes[counter] != null) {
                res.push(tempRes[counter]);
                j++;
            }
        }
    }
    return res;
};

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// function groupBy(list, keyGetter) {
//   const map = new Map();
//   list.forEach((item) => {
//        const key = keyGetter(item);
//        const collection = map.get(key);
//        if (!collection) {
//            map.set(key, [item]);
//        } else {
//            collection.push(item);
//        }
//   });
//   return map;
// }

function getCategoryName(catId) {
    return categories.find((x) => {
        return x.id === catId
    }).title
}

function getDate() {
    var d = new Date;
    var day = d.getDate();
    if (day.toString().length == 1) day = "0" + day;
    var month = d.getMonth();
    if (month.toString().length == 1) month = "0" + month;
    var year = d.getFullYear();
    var hour = d.getHours();
    var minute = d.getMinutes();
    if (minute.toString().length == 1) minute = "0" + minute;
    return day + "." + month + "." + year + "  " + hour + ":" + minute;

}

function getSmartComments(id, number) {
    var res = [];
    try {
        var temp = comments.filter(q => q.prodid == id);
        if (tempp.length < number) {
            var prodByCategory = products.filter(w => w.catId == products.find(q => q.id == id).catId);
            prodByCategory.forEach(e => {

            });
        }
        while (temp.length < number) {
            var counter = Math.round(Math.random() * (comments.length - 1))
            var item =
                temp.push(item)
        }


        return res;
    } catch (err) {
        return [{
            "prodid": "0",
            "id": 0,
            "name": "My Plywood House",
            "text": "Залишайте відгуки до виробів, Ваша думка дуже цінна для нас, і сприяє підвищенню якості виробів та обслуговування :) \n",
            "date": getDate()
        }];
    }
}
module.exports = router