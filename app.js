var express = require('express');
var session=require('express-session');
var compression = require('compression'); // 用户开启Gzip
var flash=require('connect-flash'); // 用于session提醒
var engine = require('ejs-mate');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var validatorMethods=require('./utils/validatorMethods');
var sassMiddleware = require('node-sass-middleware');
var index = require('./routes/index');
var mobile = require('./routes/mobile');
var tool = require('./routes/tool');
var admin = require('./admin/app');
var device = require('express-device');

var app = express();

app.engine('ejs',engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.disable('x-powered-by');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(sassMiddleware({
	src: path.join(__dirname, 'public/css'),
	dest: path.join(__dirname, 'public/css'),
	// includePaths:[path.join(__dirname,"/node_modules/bootstrap-sass/assets/stylesheets/")],
	// includePaths:[path.join(__dirname,"node_modules/foundation-sites/assets/")],
	indentedSyntax: false, // true = .sass and false = .scss
	sourceMap: false,
	// outputStyle: 'compressed',
	debug: true,
	outputStyle: 'extended',
	prefix:  '/css'
}));
app.use(compression()); // gzip压缩
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(device.capture());
device.enableDeviceHelpers(app)
app.use(expressValidator(validatorMethods));
app.use(cookieParser());
app.use(session({
    resave: false,  // 新增
    saveUninitialized: false,  // 新增
    secret:'czwaiwai'}));
app.use(flash());
app.use(function(req,res,next){
    res.locals = Object.assign(res.locals, {
      title:"飞常赞",
      basePath:req.path,
      error:req.flash("error").toString(),
      success:req.flash("success").toString(),
      user:req.session.user
    })
	  res.locals.query= req.query
    next();
});

app.use('/', index);
app.use('/app', mobile);
app.use('/tool',tool);
app.use('/admin',admin);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('您要的页面没有找到');
  err.status = 404;
  // next(err);
	res.render('error404', {title:'页面未找到'})
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

module.exports = app;
