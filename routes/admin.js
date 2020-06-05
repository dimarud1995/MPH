require('dotenv').config();
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
var newPostWarhouses = require('../data/newPostWarhouses.json');
var multer = require('multer');
const uuid = require('uuid');
var fs = require('fs');
const jwt = require('jsonwebtoken');



function auth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  console.log(authHeader);
  if (token == null) return res.render('/login');
  console.log(2);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err);

    if (err) return res.render("/")
    else {
      req.user = user;
      next();
    }

  })
}

function auth2(req, res, next) {
  const token = req.body.token;
  console.log(token);
  if (token == null) return res.render('/login');
  console.log(2);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err);

    if (err) return res.render("/")
    else {
      req.user = user;
      next();
    }

  })
}

//GET Admin page
router.post('/admin', auth2, function (req, res, next) {
  res.render("admin", {
    layout: 'admin'
  });
});

router.post('/edit', auth2, function (req, res) {
  res.render("edit", {
    layout: 'admin'
  })
});

router.get("/adminorder/:id", function (req, res) {
  console.log(req.params.id)
  var newO = newOrders.find(p => p.id == req.params.id);
  var approvedO = approvedOrders.find(p => p.id == req.params.id);
  var doneO = doneOrders.find(p => p.id == req.params.id);
  var sentO = sentOrders.find(p => p.id == req.params.id);
  var O = null;


  if (newO) O = newO;
  if (approvedO) O = approvedO;
  if (doneO) O = doneO;
  if (sentO) O = sentO;
  //console.log(O);

  var temp = [];
  var sum = 0;
  O.productIdInOrder.forEach(e => {
    var p = products.find(p => p.id == e.id);
    if (p) {

      console.log(p);
      var p1 = {
        id: e.id,
        price: e.price,
        material: e.material,
        postprocessing: e.postprocessing,
        color: e.color ? e.color : "",
        mainImage: p.mainImage,
        title: p.title

      }
      sum += Number.parseInt(e.price);
      temp.push(p1);
    }
  })
  console.log(temp);
  var post = O.delivery == "new_post" ? true : false;
  O["post"] = post;
  O["sum"] = sum;
  O.productInOrder = temp;
  console.log(O);
  res.render("adminorder", {
    order: O,
    layout: 'admin'


  })
});

router.get("/getOrders", auth, function (req, res) {
  var data = {
    newOrders,
    approvedOrders,
    doneOrders,
    sentOrders: QuickSort(sentOrders)
  }
  return res.json(data);
});
router.get("/getNewFeedback", auth, function (req, res) {
  var data = {
    newFeedback: feedback.filter(q => q.status == "new")
  }
  return res.json(data);
});


//CREATE PRODUCT
router.post('/create-product', auth2, function (req, res) {
  res.render("createProduct", {
    categories,
    layout: 'admin'
  });
});
router.post('/save-new-product', auth, function (req, res, next) {
  try {
    console.log("========================");
    var newP = req.body;
    console.log(req.body);
    console.log(req.files);
    console.log("========================");
    var mainImagePath = ""; //req.body.mainImage;
    var imagesPath = []; // req.body.images;
    var id = new Date().getTime();
    Object.values(req.files).forEach(f => {
      if (mainImagePath == "") mainImagePath = "/images/products/" + id + "_" + f.name;
      // set title image in recicler
      // else {
      imagesPath.push("/images/products/" + id + "_" + f.name);
      // }
      f.mv('./public/images/products/' + id + "_" + f.name);

    });

    var categoryNum = Number.parseInt(newP.category);
    var categoryName = categories.find(q => q.id == categoryNum).url.replace("/category/", "");
    console.log(categoryName);
    var desc = generateMegaDescription(newP.description);
    console.log()
    var tempPrice = JSON.parse(newP.price);
    console.log(tempPrice);

    products.push({
      "id": id,
      "category": categoryNum,
      "categoryName": categoryName,
      "title": newP.title,
      "description": desc,
      "material": newP.material.split(","),
      "postprocessing": newP.postprocessing.split(","),
      "price": tempPrice,
      "mainImage": mainImagePath,
      "images": imagesPath

    })
    var data = JSON.stringify(products);
    fs.writeFile('./data/products.json', data, (err) => {
      if (err) {
        return res.json(err.message.toString());
      }
      console.log('The file has been saved!');
    });
    return res.json("ok");
  } catch (err) {
    return res.json(err.message.toString());
  }
});
router.post('/save-edit-product', auth, function (req, res, next) {
  try {
    console.log("========================");
    var newP = req.body;
    console.log(req.body);
    console.log(req.files);
    console.log("========================");
    var mainImagePath = ""; //req.body.mainImage;
    var imagesPath = []; // req.body.images;
    var id = newP.id;
    if (req.files != null) {
      Object.values(req.files).forEach(f => {
        if (mainImagePath == "") mainImagePath = "/images/products/" + id + "_" + f.name;
        else {
          imagesPath.push("/images/products/" + id + "_" + f.name);
        }
        f.mv('./public/images/products/' + id + "_" + f.name);

      });
    }
    //  console.log(newP);

    var categoryNum = Number.parseInt(newP.category);
    var categoryName = categories.find(q => q.id == categoryNum).url.replace("/category/", "");
    var desc = generateMegaDescription(newP.description);
    var tempPrice = JSON.parse(newP.price);
    //    console.log(tempPrice);

    //Елемент передається по ссилці так як в масиві об*єкти, а вони ссилочного типа
    var tempP = products.filter(e => e.id == id);
    console.log(tempP);
    console.log(categoryNum);
    tempP[0].category = categoryNum;
    tempP[0].categoryName = categoryName;
    tempP[0].title = newP.title;
    tempP[0].description = desc;
    tempP[0].material = newP.material.split(",");
    tempP[0].postprocessing = newP.postprocessing.split(",");
    tempP[0].price = tempPrice;

    if (mainImagePath != '') tempP[0].mainImage = mainImagePath;
    if (imagesPath.length > 0) tempP[0].images = imagesPath;

    console.log(tempP);
    var data = JSON.stringify(products);
    fs.writeFile('./data/products.json', data, (err) => {
      if (err) {
        return res.json(err.message.toString());
      }
      console.log('The file has been saved!');
    });
    return res.json("ok");
  } catch (err) {
    return res.json(err.message.toString());
  }
});
router.post("/deleteProductById", auth, function (req, res) {
  try {
    var p = products.filter(q => q.id == req.body.id)[0];

    fs.unlink(p.imageUrl, (err) => {  
      if (err) return res.json(err.message.toString());
      console.log('successfully deleted ' + p.imageUrl);
    });
    p.images.forEach(i => {
      fs.unlink(i, (err) => {
        if (err) return res.json(err.message.toString());
        console.log('successfully deleted ' + i);
      });
    })
    products.splice(products.indexOf(p), 1);

    var data = JSON.stringify(products);
    fs.writeFile('./data/products.json', data, (err) => {
      if (err) {
        return res.json(err.message.toString());
      }
      console.log('The file has been saved!');
    });
    return res.json("Продукт успішно видалено!")
  } catch (err) {
    return res.json(err.message.toString());
  }

})


//
//CREATE CATEGORY
router.post('/create-category', auth2, function (req, res) {
  res.render("createCategory", {
    layout: 'admin'
  });
});
router.post('/save-new-category', auth, function (req, res, next) {
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
    var data = JSON.stringify(categories);
    //const data = new Uint8Array(Buffer.from(json));
    fs.writeFile('./data/categories.json', data, (err) => {
      if (err) return res.json(err.message.toString());
      console.log('The Categories has been saved!');
    });


    var key = '/category/' + newC.url;
    catsMap[key] = id;
    console.log(catsMap);
    var data2 = JSON.stringify(catsMap);
    // const data2 = new Uint8Array(Buffer.from(json));
    fs.writeFile('./data/catIdTitleMap.json', data2, (err) => {
      if (err) return res.json(err.message.toString());
      console.log('The catsMap has been saved!');
    });


    return res.send("Ok");
  } catch (err) {
    return res.json(err.message.toString());
  }

});
router.post('/delete-category', auth, function (req, res) {
  try {
    var cat = req.body.category;
    console.log(cat);
    var curCat = categories.filter(q => q.title == cat);
    if (curCat.length == 0) return res.send("Такої категорії не існує!")
    else {
      var curCatProd = products.filter(q => q.category == curCat[0].id);
      if (curCatProd.length > 0) return res.send("Ви не можете видалити категорю поки в ніє є продукти!")
      else {
        var index = categories.indexOf(curCat[0]);
        categories.splice(index);
        var data = JSON.stringify(categories);
        fs.writeFile('./data/categories.json', data, (err) => {
          if (err) return res.json(err.message.toString());
          console.log('The Categories has been saved!');
        });
        var key = curCat[0].url;
        delete catsMap[key];
        var data2 = JSON.stringify(catsMap);
        fs.writeFile('./data/catIdTitleMap.json', data2, (err) => {
          if (err) return res.json(err.message.toString());
          console.log('The catsMap has been saved!');
        });
        return res.send("Ok");
      }
    }
  } catch (e) {
    return res.send(e);
  }
});
//
// POPULAR PRODUCTS
router.post('/popular-products', auth2, function (req, res) {
  res.render('popularProducts', {
    products,
    popularProducts,
    categories,
    layout: 'admin'
  });
});
router.post('/savePopularProducts', auth, function (req, res) {
  try {
    if (req.body == null || req.body == '') popularProducts = [];
    else popularProducts = req.body;
    var temp = [];
    popularProducts.forEach(e => {
      var t = products.filter(q => q.id == e.id)
      t.forEach(t1 => temp.push(t1));
      console.log(t);
    })
    console.log(temp);
    // temp.forEach(e => {
    //   e.price = e.price[0].price;
    // })
    var data = JSON.stringify(temp);

    fs.writeFile('./data/popularProducts.json', data, (err) => {
      if (err) return res.json(err.message.toString());
      console.log('The Popular products has been saved!');
    });
    return res.send('Ok');
  } catch (err) {
    console.log(err);
    return res.json(err.message.toString());
  }
});
router.get('/getPopularProducts', auth, function (req, res) {
  return res.json(popularProducts);

});
//
// Card getOrders
router.post('/declineOrder', auth, function (req, res) {
  try {
    console.log(req.body);
    var d = req.body;
    newOrders = d.new;
    var newO = JSON.stringify(newOrders);
    fs.writeFile('./data/newOrders.json', newO, (err) => {
      if (err) return res.json(err.message.toString());
      console.log('Order deleted!');
    });
    return res.json("ok");
  } catch (err) {
    return res.json(err.message.toString())
  }
});
router.post('/newOrder', function (req, res) {
  try {


    console.log(req.body)
    var d = req.body;

    var id = new Date().getTime();
    var warhouse = newPostWarhouses.data.filter(q => q.SiteKey == d.warhouse).map(function (q) {
      var obj = {
        Description: q.Description,
        SettlementDescription: q.SettlementDescription,
        SettlementAreaDescription: q.SettlementAreaDescription,
        SettlementRegionsDescription: q.SettlementRegionsDescription
      }
      return obj
    })
    console.log(warhouse);
    var r = {
      id: id,
      userName: d.userName,
      tel: d.tel,
      email: d.email,
      paymethod: d.paymethod,
      delivery: d.delivery,
      city: d.city,
      warhouse: warhouse[0],
      comment: d.comment,
      status: "new", //new, approved, done,sent
      date: getDate(),
      // productsInOrder: productsInOrder
      productIdInOrder: d.productIdInCard

    }
    newOrders.push(r);
    console.log(newOrders);
    var json = JSON.stringify(newOrders);
    fs.writeFile('./data/newOrders.json', json, (err) => {
      if (err) return res.json(err.message.toString());
      console.log('The file has been saved!');
    });

    return res.json("ok")
  } catch (err) {
    return res.json(err.message.toString())
  }
});
router.post("/setApproved", auth, function (req, res) {
  try {
    console.log(req.body);
    var d = req.body;
    newOrders = d.new;
    approvedOrders = d.approved;
    var newO = JSON.stringify(newOrders);
    var approvedO = JSON.stringify(approvedOrders);
    //console.log(d);
    fs.writeFile('./data/newOrders.json', newO, (err) => {
      if (err) return res.json(err.message.toString());
      console.log('The new orders has been saved!');
    });
    fs.writeFile('./data/approvedOrders.json', approvedO, (err) => {
      if (err) return res.json(err.message.toString());
      console.error('The approved orders has been saved!');
    });
    return res.json(approved);
  } catch (err) {
    return res.json(err.message.toString())
  }
});
router.post("/setDone", auth, function (req, res) {
  try {
    console.log(req.body);
    var d = req.body;
    doneOrders = d.done;
    approvedOrders = d.approved;
    var doneO = JSON.stringify(doneOrders);
    var approvedO = JSON.stringify(approvedOrders);
    fs.writeFile('./data/approvedOrders.json', approvedO, (err) => {
      if (err) return res.json(err.message.toString());
      console.log('The file has been saved!');
    });
    fs.writeFile('./data/doneOrders.json', doneO, (err) => {
      if (err) return res.json(err.message.toString());
      console.log('The file has been saved!');
    });
    return res.json("ok");
  } catch (err) {
    return res.json(err.message.toString())
  }
});
router.post("/setSent", auth, function (req, res) {
  try {
    console.log("sent ==================================================================")
    console.log(req.body);
    var d = req.body;
    doneOrders = d.done;
    var doneO = JSON.stringify(doneOrders); //array
    sentOrders.push(d.sent);
    var sentO = JSON.stringify(sentOrders); // one object received

    console.log(d);
    fs.writeFile('./data/doneOrders.json', doneO, (err) => {
      if (err) return res.json(err.message.toString());
      console.log('The file has been saved!');
    });
    fs.writeFile('./data/sentOrders.json', sentO, (err) => {
      if (err) return res.json(err.message.toString());
      console.log('The file has been saved!');
    });
    return res.json("ok");
  } catch (err) {
    return res.json(err.message.toString())
  }
});
//
// newFeedback
router.post("/newFeedback", function (req, res) {
  try {
    console.log(req.body)
    var d = req.body;
    var id = 0;
    if (feedback.length == 0) id = 0;
    else id = (feedback[feedback.length - 1].id + 1);
    var r = {
      id: id,
      userName: d.userName,
      email: d.email,
      desc: d.desc,
      status: "new", //new viwed
      date: getDate()
    }

    feedback.push(r);
    var json = JSON.stringify(feedback);
    fs.writeFile('./data/feedback.json', json, (err) => {
      if (err) return res.json(err.message.toString());
      console.log('The file has been saved!');
    });

    return res.json("ok")


  } catch (err) {
    res.json(err.message.toString());
  }
});
router.post("/setFeedbackStatusViewed", auth, function (req, res) {
  try {
    console.log(req.body);
    var f = req.body;
    feedback.find(q => q.id == f.id).status = f.status;
    var json = JSON.stringify(feedback);
    fs.writeFile('./data/feedback.json', json, (err) => {
      if (err) return res.json(err.message.toString());
      console.log('The file has been saved!');
    });

    return res.json("ok");
  } catch (err) {
    return res.json(err.message.toString())
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



function QuickSort(B) {
  var A = Array.from(B);
  //console.log(A);
  var res = [];
  while (A.length != 0) {
    var max = MDC(A[0].date);
    var maxi = 0;
    //  console.log(maxi)
    for (var i = 0; i < A.length; i++) {
      //console.log("2")
      var t = MDC(A[i].date);
      //  console.log("if ----------all---t " + t)
      if (max < t) {
        max = t;
        maxi = i;
        //      console.log("if ----------------maxi " + maxi)
        //    console.log("if ----------------t " + t)

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

module.exports = router;