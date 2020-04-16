var express = require('express');
var router = express.Router();
var categories = require('../data/categories.json');
var slides = require('../data/slides.json');
var catsMap = require('../data/catIdTitleMap.json');
var products = require('../data/products.json');
var newOrders = require('../data/newOrders.json');
var approvedOrders = require('../data/approvedOrders.json');
var doneOrders = require('../data/doneOrders.json');
var sentOrders = require('../data/sentOrders.json');
var feedback = require('../data/feedback.json');
var popularProducts = require('../data/popularProducts.json');
var multer = require('multer');
const uuid = require('uuid');
var fs = require('fs');


//GET Admin page
router.get('/admin', function (req, res, next) {
  res.render("admin", {
    layout: 'admin'
  });
});
router.get('/edit', function (req, res) {
  res.render("edit", {
    layout: 'admin'
  })
});
router.get("/getOrders", function (req, res) {
  var data = {
    newOrders,
    approvedOrders,
    doneOrders,
    sentOrders
  }
  return res.json(data);
});
router.get("/getNewFeedback", function (req, res) {
  var data = {
    newFeedback: feedback.filter(q => q.status == "new")
  }
  return res.json(data);
});

//
//main slider 
router.get("/main-slider", function (req, res) {
  return res.json("Поки не зробив. В теорії тут можна буде добавлять якісь нові слайди шоб юзери бачить тіпа з акціями, але я думаю це нахер не нада");
});

//CREATE PRODUCT
router.get('/create-product', function (req, res) {
  res.render("createProduct", {
    categories,
    layout: 'admin'
  });
});
router.post('/save-new-product', function (req, res, next) {
  try {
    console.log("========================");
    var newP = req.body;
    console.log(req.body);
    console.log(req.files);
    console.log("========================");
    var mainImagePath = ""; //req.body.mainImage;
    var imagesPath = []; // req.body.images;
    Object.values(req.files).forEach(f => {
      const uuid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
      if (mainImagePath == "") mainImagePath = "/images/products/" + uuid + "_" + f.name;
      else {
        imagesPath.push("/images/products/" + uuid + "_" + f.name);
      }
      f.mv('./public/images/products/' + uuid + "_" + f.name);

    });
    var id = 1;
    if (products.length > 0) id = products[products.length - 1].id + 1;
    var categoryNum = Number.parseInt(newP.category);
    var categoryName = categories.find(q => q.id == categoryNum).url.replace("/category/", "");
    console.log(categoryName);
    var desc = generateMegaDescription(newP.description);
    products.push({
      "id": id,
      "category": categoryNum,
      "categoryName": categoryName,
      "title": newP.title,
      "description": desc,
      "price": newP.price,
      "mainImage": mainImagePath,
      "images": imagesPath
    })

    console.log(products);
    var json = JSON.stringify(products);
    const data = new Uint8Array(Buffer.from(json));
    fs.writeFile('./data/products.json', data, (err) => {
      if (err) return res.json(err.message);
      console.log('The file has been saved!');
    });
    fs.close();
    return res.json("Ok");
  } catch (err) {
    return res.json(err);
  }
});
//
//CREATE CATEGORY
router.get('/create-category', function (req, res) {
  res.render("createCategory", {
    layout: 'admin'
  });
});
router.post('/save-new-category', function (req, res, next) {
  try {


    console.log("========================");
    var newC = req.body;
    var f = Object.values(req.files)[0];
    //console.log(req.body);
    console.log(f);
    console.log("========================");
    const uuid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();

    f.mv('./public/images/categories/' + uuid + "_" + f.name);
    var id = 1;
    if (categories.length > 0) id = categories[categories.length - 1].id + 1;
    categories.push({
      "id": id,
      "title": newC.title,
      "url": "/category/" + newC.url,
      "imageUrl": "/images/categories/" + uuid + "_" + f.name,

    })
    //console.log(categories);
    var json = JSON.stringify(categories);
    const data = new Uint8Array(Buffer.from(json));
    fs.writeFile('./data/categories.json', data, (err) => {
      if (err) return res.json(err.message);
      console.log('The Categories has been saved!');
    });


    var key = '/category/' + newC.url;
    catsMap[key] = id;
    console.log(catsMap);
    var json = JSON.stringify(catsMap);
    const data2 = new Uint8Array(Buffer.from(json));
    fs.writeFile('./data/catIdTitleMap.json', data2, (err) => {
      if (err) return res.json(err.message);
      console.log('The catsMap has been saved!');
    });


    return res.send("Ok");
  } catch (err) {
    return res.json(err);
  }

});
//
// POPULAR PRODUCTS
router.get('/popular-products', function (req, res) {
  res.render('popularProducts', {
    products,
    popularProducts,
    categories,
    layout: 'admin'
  });
});
router.post('/savePopularProducts', function (req, res) {
  try {
    var j = [];
    if (req.body == null || req.body == '') j = [];
    else j = req.body;
    //  console.log(j)
    j.forEach(e => {
      var resStr = "";
      var words = e.description.split(" ");
      if (words.length > 40) words.splice(40, words.length - 41);
      words.forEach(w => {
        resStr += w + " ";
      });
      resStr += "...";
      e.description = resStr;
    })
    console.log(j);
    var j2 = JSON.stringify(j);
    const data = new Uint8Array(Buffer.from(j2));
    fs.writeFile('./data/popularProducts.json', data, (err) => {
      if (err) return res.json(err.message);
      console.log('The Popular products has been saved!');
    });
    return res.send('Ok');
  } catch (err) {
    console.log(err);
    return res.json(err);
  }
});
router.get('/getPopularProducts', function (req, res) {
  return res.json(popularProducts);

});
//
// Card getOrders

router.post('/newOrder', function (req, res) {
  try {


    console.log(req.body)
    var d = req.body;
    // var productsInOrder = [];
    //  var prId = d.productIdInCard;
    // prId.forEach(id => {
    //   productsInOrder.push(products.find(q => q.id == id));
    // });
    var options = {
      era: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timezone: 'UTC',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    };
    var date = new Date;
    var id = new Date().getTime();
    var r = {
      id: id,
      userName: d.userName,
      tel: d.tel,
      email: d.email,
      delivery: d.delivery,
      paymethod: d.paymethod,
      status: "new", //new, approved, done,sent
      date: date.toLocaleString("ua", options),
      // productsInOrder: productsInOrder
      productIdInOrder: d.productIdInCard

    }
    newOrders.push(r);
    console.log(newOrders);
    var json = JSON.stringify(newOrders);
    fs.writeFile('./data/newOrders.json', json, (err) => {
      if (err) return res.json(err.message);
      console.log('The file has been saved!');
    });

    return res.json("ok")
  } catch (err) {
    return res.json(err)
  }
});
router.post("/setApproved", function (req, res) {
  try {
    console.log(req.body);
    var d = req.body;
    var newO = JSON.stringify(d.new);
    var approvedO = JSON.stringify(d.approved);
    console.log(d);
    fs.writeFile('./data/newOrders.json', newO, (err) => {
      if (err) return res.json(err.message);
      console.log('The file has been saved!');
    });
    fs.writeFile('./data/approvedOrders.json', approvedO, (err) => {
      if (err) return res.json(err.message);
      console.error('The file has been saved!');
    });
    return res.json("ok");
  } catch (err) {
    return res.json(err)
  }
});
router.post("/setDone", function (req, res) {
  try {
    console.log(req.body);
    var d = req.body;
    var doneO = JSON.stringify(d.done);
    var approvedO = JSON.stringify(d.approved);
    console.log(d);
    fs.writeFile('./data/approvedOrders.json', approvedO, (err) => {
      if (err) return res.json(err.message);
      console.log('The file has been saved!');
    });
    fs.writeFile('./data/doneOrders.json', doneO, (err) => {
      if (err) return res.json(err.message);
      console.log('The file has been saved!');
    });
    return res.json("ok");
  } catch (err) {
    return res.json(err)
  }
});
router.post("/setSent", function (req, res) {
  try {
    console.log("sent ==================================================================")
    console.log(req.body);
    var d = req.body;
    var doneO = JSON.stringify(d.done); //array
    sentOrders.push(d.sent);
    var sentO = JSON.stringify(sentOrders); // one object received

    console.log(d);
    fs.writeFile('./data/doneOrders.json', doneO, (err) => {
      if (err) return res.json(err.message);
      console.log('The file has been saved!');
    });
    fs.writeFile('./data/sentOrders.json', sentO, (err) => {
      if (err) return res.json(err.message);
      console.log('The file has been saved!');
    });
    return res.json("ok");
  } catch (err) {
    return res.json(err)
  }
});
//
// newFeedback
router.post("/newFeedback", function (req, res) {
  try {
    console.log(req.body)
    var d = req.body;
    var options = {
      era: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timezone: 'UTC',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    };
    var date = new Date;
    var id = 0;
    if (feedback.length == 0) id = 0;
    else id = (feedback[feedback.length - 1].id + 1);
    var r = {
      id: id,
      userName: d.userName,
      email: d.email,
      desc: d.desc,
      status: "new", //new viwed
      date: date.toLocaleString("ua", options)
    }

    feedback.push(r);
    var json = JSON.stringify(feedback);
    fs.writeFile('./data/feedback.json', json, (err) => {
      if (err) return res.json(err.message);
      console.log('The file has been saved!');
    });

    return res.json("ok")


  } catch (err) {
    res.json(err);
  }
});
router.post("/setFeedbackStatusViewed", function (req, res) {
  try {
    console.log(req.body);
    var f = req.body;
    feedback.find(q => q.id == f.id).status = f.status;
    var json = JSON.stringify(feedback);
    fs.writeFile('./data/feedback.json', json, (err) => {
      if (err) return res.json(err.message);
      console.log('The file has been saved!');
    });

    return res.json("ok");
  } catch (err) {
    return res.json(err)
  }
});
//
// orders-history
router.get("/orders-history", function (req, res) {
  return res.render("ordershistory", {
    layout: 'admin'
  })
});

router.get('/getProductsByCategory/:categoryId', function (req, res) {
  console.log(req.params.categoryId);
  res.json(getProducts(req.params.categoryId))
});

router.get('/get-categories', function (req, res) {
  res.json(categories);
});


function getProducts(catId) {
  console.log("catid " + catId);
  console.log(products);
  console.log(products.filter(x => x.category == catId));
  return products.filter(x => x.category == catId);

}

//UUID for img name
function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function generateMegaDescription(string) {
  var res = string.replace(/\r\n/g, "<br>");

  return res;
}




module.exports = router;