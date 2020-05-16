require('dotenv').config();
var express = require('express');
var router = express.Router();
var multer = require('multer');
const uuid = require('uuid');
var fs = require('fs');
const jwt = require('jsonwebtoken');

router.get('/', function (req, res, next) {
    res.render("login", {
        layout: 'login'
    });
});
router.post("/login-in", function (req, res) {
    try {


        if (req.body.login == "vasinahata.info@gmail.com" && req.body.pass == "r3w5hpmiu@hr") {

            console.log(req.body);
            var user = {
                login: req.body.login,
                pass: req.body.pass
            }
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            return res.json(token);

        } else {
            return res.json("false");
        }
    } catch (e) {
        return res.json("false");
    }
})

module.exports = router;