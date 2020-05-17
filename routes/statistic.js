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

router.post('/statistic', auth2, function (req, res, next) {

    res.render("statistic", {
        layout: 'admin'
    });
});


function auth(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    console.log(authHeader);
    if (token == null) return res.redirect("/login")
    console.log(2);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        console.log(err);

        if (err) return res.redirect("/login")
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



module.exports = router;