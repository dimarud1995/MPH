var express = require('express')
var router = express.Router()
var fs = require('fs');

var categories = require('../data/categories.json')
var slides = require('../data/slides.json')
var catsMap = require('../data/catIdTitleMap.json')
var products = require('../data/products.json')
var comments = require('../data/comments.json')
var popularProducts = require('../data/popularProducts.json')
var newPostWarhouses = require('../data/newPostWarhouses.json');
var koef = require('../data/koef.json');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('home', {
        slides: slides,
        categories: categories,
        popularProducts: popularProducts,
    })
})
router.get('/faq', function (req, res) {
    res.render("FAQ");
})
router.get('/aboutus', function (req, res) {
    res.render("aboutus");
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
    res.render('product', {
        product: product
    })
})
router.get("/get-popular-products", function (req, res) {
    return res.json(popularProducts);
})
router.post("/get-last-viewed", function (req, res) {
    var prod = [];
    req.body.lastViewedId.forEach(q => {
        var p = products.find(w => w.id == q);
        if (p != null) {
            prod.push(p);
        }
    })
    return res.json(prod);
});
router.post("/getRandomProducts", function (req, res) {
    if (products.length > 6)
        var prod = getRandomProducts(6);
    else prod = products;
    return res.json(prod);
});
router.post("/getProduct", function (req, res) {
    var p = getProductById(req.body.id)
    return res.json(p);
})
router.post("/getInterestingProducts", function (req, res) {
    var product = getProductById(req.body.id)
    var a = [];
    a.push(product);
    var pr = getInterestingProducts(a, 6);
    return res.json(pr)
});
router.get("/get-koef", function (req, res) {
    return res.json(koef);
})
router.post('/cart', function (req, res, next) {
    var products = products
    var ids = JSON.parse('[' + req.body.prodIds + ']');
    var bookedProducts = getProductsByIds(ids)
    var sum = getSum(bookedProducts)

    //  console.log(bookedProducts);
    // console.log("SUCCESS!!!!!!!!!!!!!!!!!");
    res.render('cart', {
        products: bookedProducts,
        sum: sum,
        interestingProducts: getInterestingProducts(bookedProducts, 6),
        interestingCategories: getInterestingCategories(bookedProducts, 6)
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
    var c = getSmartComments(req.body.id, 10);
    return res.json(c);
})
router.post("/setComment", function (req, res) {
    try {
        var c = req.body;
        c.date = getDate();
        if (comments.length != 0) c.id = comments[comments.length - 1].id + 1;
        c.about = " про цей виріб";
        c.category = products.find(e => e.id == c.prodid).category;
        console.log(c);
        comments.push(c);
        var json = JSON.stringify(comments);
        fs.writeFile('./data/comments.json', json, (err) => {
            if (err) return res.json(err.message);
        });
        var r = QuickSort(comments);
        return res.json({
            comments: r,
            status: "ok"
        });

    } catch (err) {
        return res.json(err);
    }
})

router.post("/get-cities", function (req, res) {

    var temp = newPostWarhouses.data.filter(q => q.SettlementDescription.includes(req.body.name)).map(function (w) {
        var obj = {
            SiteKey: w.SiteKey,
            city: w.CityDescription,
            cityRu: w.CityDescriptionRu,
        }
        return obj;
    })
    var temp2 = temp.filter((item, index) => temp.indexOf(item) === index);
    return res.json(temp2)
});

router.post("/get-warhouses", function (req, res) {

    var temp = newPostWarhouses.data.filter(q => q.SettlementDescription.includes(req.body.name)).map(function (w) {
        var obj = {
            SiteKey: w.SiteKey,
            Description: w.Description,
            ShortAddress: w.ShortAddress,
            SettlementDescription: w.SettlementDescription,
            SettlementAreaDescription: w.SettlementAreaDescription,
            SettlementRegionsDescription: w.SettlementRegionsDescription,

        }
        return obj;

    })
    return res.json(temp)
});
///
// support functions
router.post("/getProductsByCategory", function (req, res) {
    var id = req.body.id;
    var ps = products.filter(q => q.categoryName == id);
    return res.json(ps);
})

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

        var product = products.find((e) => e.id == x.id)
        if (product) {

            var p = {
                id: product.id,
                category: product.category,
                categoryName: product.categoryName,
                title: product.title,
                description: product.description,
                mainImage: product.mainImage,
                images: product.images,
                price: x.price,
                color: x.color ? x.color : "",
                material: x.material,
                postprocessing: x.postprocessing
            }
            //   console.log(p);
            res.push(p)
        }
    })

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
        } else {
            bookedPr.forEach(i => {
                var tempP = products.filter(e => e.category != i.category);
                var tempS = shuffle(tempP).slice(0, 6);
                tempS.forEach(q => tempRes.push(q));
            });
        }

        var j = 0;
        var errorExit = 0;
        var curNumb = number;
        if (number > tempRes.length) curNumb = tempRes.length;

        while (j < curNumb) {
            var counter = Math.round(Math.random() * (tempRes.length - 1));
            if (res.length > 0) {
                if (tempRes[counter] != null) {
                    if (!res.includes(tempRes[counter])) {
                        res.push(tempRes[counter]);
                        j++;
                    } else {
                        if (errorExit > 50) break;
                        errorExit++;
                    }

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

function getRandomProducts(number) {
    var res = [];
    while (res.length < number) {
        var i = Math.round(Math.random() * (products.length - 1));
        var p = products[i]
        if (!res.includes(p)) res.push(p);
    }
    return res;
}

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
    if (hour.toString().length == 1) hour = "0" + hour;

    var minute = d.getMinutes();
    if (minute.toString().length == 1) minute = "0" + minute;
    return day + "." + month + "." + year + "  " + hour + ":" + minute;

}

function getSmartComments(id, number) {
    var res = [];
    try {
        var tempComent = comments.filter(q => q.prodid == id);
        var category = products.find(e => e.id == id).category;
        console.log("tempComent");
        console.log(tempComent);
        var temp = [];
        tempComent.forEach(item => {
            if (item) {
                item.about = " про цей виріб";
                temp.push(item);
            }
        });
        console.log("category " + category)
        var prodByCategory = products.filter(w => w.category == category);
        console.log("probyCat");
        //  console.log(prodByCategory);
        console.log("=======================================================")
        prodByCategory.forEach(e => {
            //  console.log(e);
            var items = comments.filter(q => q.prodid == e.id);
            console.log("items");
            console.log(items);
            for (var i = 0; i < items.length; i++) {
                if (items[i]) {
                    console.log(items[i]);
                    var v = false;
                    temp.forEach(a => {
                        if (a.id == items[i].id) v = true;
                    })
                    if (!v) {
                        items[i].about = " про категорію";
                        temp.push(items[i]);
                    }
                }
            }
        });
        console.log("=======================================================")

        // }
        // if (comments.length > number)
        //     while (temp.length < number) {
        //         var counter = Math.round(Math.random() * (comments.length - 1))
        //         var item = comments[counter];
        //         var validation = false;
        //         temp.forEach(element => {
        //             if (element.id == item.id) validation = true;
        //         });
        //         if (!validation) {
        //             item.about = " про компанію";
        //             temp.push(item);
        //         }

        //     }
        //temp = comments;
        console.log("comments");
        console.log(temp);
        res = QuickSort(temp);
        return res;
    } catch (err) {
        console.log(err);
        return [{
            "prodid": "0",
            "id": 0,
            "name": "My Plywood House",
            "text": "Залишайте відгуки до виробів, Ваша думка дуже цінна для нас, і сприяє підвищенню якості виробів та обслуговування :) \n",
            "date": getDate()
        }];
    }
}


function QuickSort(B) {
    var A = Array.from(B);
    var res = [];
    while (A.length != 0) {
        var max = MDC(A[0].date);
        var maxi = 0;
        for (var i = 0; i < A.length; i++) {
            var t = MDC(A[i].date);
            if (max < t) {
                max = t;
                maxi = i;

            }
        }
        res.push(A[maxi]);
        A.splice(maxi, 1);

    }
    return res;
}

function MDC(date) {
    return Number.parseInt(date.substring(0, 2)) * 86400 +
        Number.parseInt(date.substring(3, 5)) * 31 * 86400 +
        Number.parseInt(date.substring(6, 10)) * 365 * 31 * 86400 +
        Number.parseInt(date.substring(12, 14)) * 3600 +
        Number.parseInt(date.substring(15)) * 60;
}


module.exports = router