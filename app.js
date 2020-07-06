var createError = require('http-errors')
var fs = require('fs');
var express = require('express')
var exphbs = require('express-handlebars')
var axios = require('axios')
var fileUpload = require('express-fileupload');
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var https = require('https')


var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var adminRouter = require('./routes/admin')
var loginRouter = require('./routes/login')
var statisticRouter = require('./routes/statistic')
var new_post_api_router = require('./routes/new_post_api')



var categories = require('./data/categories.json')
var slides = require('./data/slides.json')
var catsMap = require('./data/catIdTitleMap.json')
var products = require('./data/products.json')
var comments = require('./data/comments.json')
var popularProducts = require('./data/popularProducts.json')
var newPostWarhouses = require('./data/newPostWarhouses.json');







var app = express()
const cacheTime = 86400000 * 30;

// view engine setup
app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public'), {
    etag: true,
    maxAge: cacheTime
}))
app.use(fileUpload({
    createParentPath: true
}));
app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/admin', adminRouter)
app.use('/admin', statisticRouter)
app.use('/login', loginRouter)
//app.use(new_post_api_router)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('home', {
        slides: slides,
        categories: categories,
        popularProducts: popularProducts,
    })
})


module.exports = app