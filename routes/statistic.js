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

router.get('/statistic', function (req, res, next) {
    res.render("statistic", {
        layout: 'admin'
    });
});




module.exports = router;