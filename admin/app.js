/**
 * Created by waiwai on 17-7-12.
 */
var express = require('express');
var app = express();
var http=require('http');
var path = require('path');
var sassMiddleware = require('node-sass-middleware');
var index = require('./routes/index');
// app.locals.resoucePath = "/admin";
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(sassMiddleware({
    src: path.join(__dirname, 'public/css'),
    dest: path.join(__dirname, 'public/css'),
    indentedSyntax: false, // true = .sass and false = .scss
    sourceMap: false,
    // outputStyle: 'compressed',
    outputStyle: 'extended',
    prefix:  '/css'
}));

// app.use(function(req,res,next){ res.locals.staticUrl ='/admin' });
app.use(function(req,res,next){
    res.locals.path = req.path
    res.locals.assetsPath=app.path();
    next();
})

function checkLogin(req,res,next){
    if(req.path=="/login") return next();
    if(!req.session.user  || (req.session.user && req.session.user.isAdmin!==true)){
        return  res.redirect('/admin/login');
    }
    next();
}
app.use('/',checkLogin);
app.use('/',index);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error',{title:"网站错误"});
});
module.exports=app;