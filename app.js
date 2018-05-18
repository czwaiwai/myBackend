var express = require('express');
var session=require('express-session');
var FileStreamRotator = require('file-stream-rotator') // 日志分割
var compression = require('compression'); // 用户开启Gzip
var flash=require('connect-flash'); // 用于session提醒
var engine = require('ejs-mate');
var fs = require('fs')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser)
var expressValidator = require('express-validator');
var validatorMethods=require('./utils/validatorMethods');
var sassMiddleware = require('node-sass-middleware');
var index = require('./routes/index');
var wx = require('./routes/wx')
var mobile = require('./routes/mobile');
var tool = require('./routes/tool');
var admin = require('./admin/app');
var pathBlack = require('./utils/pathBlack')
var device = require('express-device');
var moment = require('moment')

var app = express();
app.set('env', 'production');
app.engine('ejs',engine);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.disable('x-powered-by');
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
var errorLogfile
var logDirectory = path.join(__dirname, 'log')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
if(app.get('env') !== 'production') {
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
}

app.use(compression()); // gzip压缩
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'admin/public')));
console.log(app.get('env'))
if (app.get('env') === 'development') {
	app.use(logger('dev', {stream: process.stdout}));
} else {
	errorLogfile = fs.createWriteStream(path.join(logDirectory,'error.log'), {flags: 'a'});
	var accessLogStream = FileStreamRotator.getStream({
		date_format: 'YYYYMMDD',
		filename: path.join(logDirectory, 'access-%DATE%.log'),
		frequency: 'daily',
		verbose: false
	})
	logger.token('type', function (req, res) { return req.headers['content-type'] })
	logger.token('date-moment', function (req, res) { return moment(new Date()).format('YYYY-MM-DD HH:mm:ss') })
	app.use(logger(':date-moment :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms', {stream: process.stdout}))
	app.use(logger(':date-moment :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms', {stream: accessLogStream}))
}
app.use(pathBlack)
app.use(bodyParser.xml({
	limit: '100kb',   // Reject payload bigger than 1 MB
	defaultCharset:'utf-8',
	xmlParseOptions: {
		normalize: true,     // Trim whitespace inside text nodes
		normalizeTags: true, // Transform tags to lowercase
		explicitArray: false // Only put nodes in array if >1
	},
	verify: function(req, res, buf, encoding) {
		console.log(buf, '------')
		if(buf && buf.length) {
			// Store the raw XML
			req.rawBody = buf.toString(encoding || "utf8");
		}
	}
}));
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
      title:"白石山农场",
      basePath:req.path,
      error:req.flash("error").toString(),
      success:req.flash("success").toString(),
      user:req.session.user
    })
	  res.locals.query= req.query
    next();
});

app.use('/', index);
app.use('/wx', wx);
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
  if (errorLogfile) {
		errorLogfile.write('[' + new Date() + '] ' + req.url + '\n' + err.stack)
	}
	if(req.xhr) {
		res.status(500).json({ code:-1, message:err.message, stack: err.stack })
	} else {
		// render the error page
		res.status(err.status || 500);
		res.render('error',{title:"网站错误"});
	}
});

module.exports = app;
