var express = require('express');
let router = express.Router();
var ccap=require('../utils/verifycode');
// var schema=require('async-validator');
// var User =require('../models/user');
/* GET home page. */
let {Page, User, Catalog, Goods} = require('../viewModels')

router.use((req,res,next) => {
	Catalog.getFrontCatalog((err, catalogs) => {
		if(err) return next(err)
		res.locals.catalogs = catalogs
		next()
	})
})
// router.get(checkLogin);
router.get('/', (req, res)=> {
    //console.log(req.session.user,"这里可以取到session");

    res.render('index',{title:"首页"});
});
router.get('/imgCode',(req,res)=>{
   var arr= ccap.get();
   req.session.imgCode=arr[0]+"";
   res.send(arr[1]);
});
router.get('/chat',(req,res)=>{
    console.log(req.path);
    res.render('chat',{title:"聊天室"});
});

router.get('/about',(req,res)=>{
    res.render('about',{title:"关于我们"});
});
router.get('/page/:pageName', (req, res, next) => {
  Page.getPageByPathName(req.params.pageName, function(err, page) {
    if (err) {
      console.log(err)
      return next()
    }
    console.log(page, 'page')
    if (!page) {
      return next()
    } else {
      res.render('page', page.toObject())
    }
  })
   // res.render('about', {title: '关于我们'})
})
// 文章管理
router.get('/article/list/:type', (req, res, next) => {

	res.render('article/list', {title:'文章列表'})
})
router.get('/article/detail/:id', (req, res, next) => {

	res.render('article/detail', {title: '文章详情'})
})

// 商品列表
router.get('/goods/index' , (req, res, next) => {
	// req.query.catalogsId
	Catalog.getChildrenByName('goods', (err,catalogs) => {
		if (err) return next(err)
		let params = {}
		if (req.query.catalog) {
			let catalog = catalogs.find(item => item.name === req.query.catalog)
			params.catalogPath  = new RegExp(`^${catalog.calPath},${catalog.name}`)
		}
		Goods.findAllByPage(params, req.query.page, 10, (err, obj) => {
			res.render('goods/index', Object.assign({title: '商品展示', goodTypes: catalogs}, obj))
		})
	})
})
router.get('/goods/detail/:id' , (req, res, next) => {
	Goods.findById(req.params.id, (err, goods) => {
		if (err) next(err)
		res.render('goods/detail', {title: '商品详情', goods})
	})
})

// 购物车
router.get('/cart/index', (req, res, next) => {
	res.render('cart/index', {title: '购物车'})
})

// 个人中心
router.get('/account/index', (req, res, next) => {
	res.render('account/index', {title: '个人中心'})
})

//订单
router.get('/order/index', (req, res, next) => {
	let province = require('../utils/province')
	res.render('order/index', {title: '下单', province})
})

// 地址选择
router.get('/cityAndArea', (req, res, next) => {
	if (req.query.addrId && req.query.name) {
		var nameList = ['city','area']
		if(nameList.indexOf(req.query.name)>-1) {
			let res = require('../utils/'+req.query.name)
			return res.json({
				data:{
					list:res[req.query.adderId]
				},
				code:0,
				message:'操作成功'
			})
		} else {
			return res.sendStatus(404)
		}
	}
})


router.get('/test',(req,res)=>{
    res.render('test',{title:"测试"});
})
router.get('/test1',(req,res)=>{
    res.render('test1',{title:"测试"});
})
router.get('/login',(req,res)=>{
  res.render('login',{title:"用户登录"});
});
router.post('/login',(req,res, next)=>{
    req.checkBody('userName',"用户名不能为空").notEmpty()
        .isTooShort(6).withMessage("用户名太短");
    req.checkBody('password',"密码不能为空").notEmpty()
        .isTooShort(6).withMessage("密码太短");
    req.checkBody('verifyCode',"验证码不能为空").notEmpty()
        .isEqual(req.session.imgCode).withMessage("验证码不正确");
    req.asyncValidationErrors().then(function(){
    	console.log(req.body)
        User.findByUserName(req.body.userName,function(err,user){
        	if (err) {
        		return next(err)
	        }
	        if (!user) {
		        req.flash("error","账户名或密码错误")
        		return res.redirect('/login')
	        }
          if(user.pwd!=req.body.password){
        		req.flash("error","账户名或密码错误");
        		return  res.redirect('/login');
          }
          console.log(user, 'user')
          req.session.user=user;
          return  res.redirect('/');
        });
    },function(errors){
        req.flash("error",errors[0].msg);
        return   res.redirect('/login');
    });
});
router.get('/register',(req,res)=>{
    res.render('register',{title:"用户注册"});
})
router.post('/register', (req, res, next) => {
	req.checkBody('userName',"用户名不能为空").notEmpty()
		.isTooShort(6).withMessage("用户名太短");
	req.checkBody('pwd',"密码不能为空").notEmpty()
		.isTooShort(6).withMessage("密码太短");
	req.checkBody('pwdRepeat').notEmpty()
		.isSame(req.body.pwd).withMessage('密码不一致')
	req.checkBody('mobile', '手机号不能为空').notEmpty().isMobile().withMessage('手机号码不正确')
	req.checkBody('verifyCode',"验证码不能为空").notEmpty()
		.isEqual(req.session.imgCode).withMessage("验证码不正确");
	req.asyncValidationErrors().then(function(){
        User.create(req.body, (err, user) => {
			if (err) {
				console.error(err)
				req.flash("error",err.message)
				return res.redirect('/register')
			}
			req.flash('success', '注册成功')
			return res.redirect('/login')
		})
	},function(errors){
		req.flash("error",errors[0].msg);
		return res.redirect('/register');
	});
})
router.get('/logout',(req,res)=>{
    req.session.user=null;
    return res.redirect('/');
})
module.exports = router;
