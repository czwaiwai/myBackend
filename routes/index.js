var express = require('express');
let router = express.Router();
var ccap=require('../utils/verifycode');
// var schema=require('async-validator');
// var User =require('../models/user');
/* GET home page. */
let EventProxy = require('eventproxy')
let {Page, User, Catalog, Goods, Article, Cart} = require('../viewModels')

router.use((req,res,next) => {
	Catalog.getFrontCatalog((err, catalogs) => {
		if(err) return next(err)
		res.locals.catalogs = catalogs
		next()
	})
})
router.use((req, res, next) => {
	var user = req.session.user
	if(user && user.cart && user.cart.length >0) {
		res.locals.cartNum= user.cart.reduce((before,item) => {
			return before + item.goodsNum
		}, 0)
	} else {
		res.locals.cartNum = 0
	}
	next()
})
// router.get(checkLogin);
router.get('/', (req, res, next)=> {
    //console.log(req.session.user,"这里可以取到session");
	let ep = EventProxy.create('goodTypes', 'goods', (goodTypes, goods) => {
		res.render('index',{title:"首页", goodTypes, goods});
	})
	ep.fail(next)
	Catalog.getChildrenByName('goods',ep.done('goodTypes'))
	Goods.getHotGoods (ep.done('goods'))
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
	let pages = res.locals.catalogs.filter(item => item.relativeUrl.indexOf('/page') === 0)
  Page.getPageByPathName(req.params.pageName, function(err, page) {
    if (err) {
      console.log(err)
      return next()
    }
    console.log(page, 'page')
    if (!page) {
      return next()
    } else {
      res.render('page', Object.assign({title:page.title,page}, {pages:pages}))
    }
  })
   // res.render('about', {title: '关于我们'})
})
// 文章管理
router.get('/article/list/:type', (req, res, next) => {
	Catalog.findByName(req.params.type, (err, catalog) => {
		if (err) return next(err)
		Article.findAllByPageCatalogs(catalog.name,req.query.page, 10, (err, obj) => {
			if (err)  return next(err)
			res.render('article/list', Object.assign({title:catalog.nameCn}, obj))
		})
	})
})
router.get('/article/detail/:id', (req, res, next) => {
	Article.findByIdAddView(req.params.id, (err, article) => {
		if(err) return next(err)
		res.render('article/detail', {title: article.title, article})
	})
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



//订单
router.post('/order/index', (req, res, next) => {
	let province = require('../utils/province')
	console.log(req.body)
	if (req.body.status === 'buy') {
		Goods.findInIds([req.body._id], (err, goods) => {
			res.render('order/index', {title: '下单', province, goods})
		})
	}
	if (req.body.status === 'cart') {

	}
})

// goodsId: {type: Schema.ObjectId}, // 产品Id
// goodsName: {type: String}, // 产品名称
// goodsSubName: {type: String}, // 产品sub名称
// imgUrl: {type: String}, // 图片
// goodsNum: {type: Number, default:1}, //数量
// isCheck: {type: Boolean, default: false}, // 是否选中
// price: {type: Number}, // 单价

//添加到购物车
router.post('/add2Cart', (req, res, next) => {
	Goods.findById(req.body._id, (err, goods) => {
		if (err) return  next(err)
		let cart = {
			goodsId: goods._id,
			goodsName: goods.name,
			imgUrl: goods.imgTmb,
			goodsNum: req.body.num || 1,
			isCheck: true,
			price: goods.sellPrice,
		}
		console.log(cart)
		if (req.session.user) {
			// console.log(req.session.user)
			Cart.add2Update(req.session.user._id, cart, (err, user) => {
				req.session.user.cart=user.cart
				res.json({
					data: {cart: user.cart},
					code:0,
					message:'操作成功'
				})
			})
			// Cart.create(req.session.user._id, cart, (err, newUser) => {
			// 	if (err) return next(err)
			// 	req.session.user.cart = newUser.cart
			// 	res.json({
			// 		data: {cart: newUser.cart},
			// 		code:0,
			// 		message:'操作成功'
			// 	})
			// })
		} else {
			res.json({
				data: {},
				code:-1,
				message:'您还没有登录哦～'
			})
		}
	})
})


// 个人中心
router.get('/account/index', (req, res, next) => {
	res.render('account/index', {title: '个人中心'})
})

//地址管理
router.get('/account/address', (req, res, next) => {
	res.render('account/address', {title: '地址管理'})
})

//个人信息
router.get('/account/accountInfo', (req, res, next) => {
	res.render('account/accountInfo', {title: '个人信息'})
})

router.get('/account/changePwd', (req, res, next) => {
	res.render('account/changePwd', {title: '修改密码'})
})

//订单管理
router.get('/account/orderManage', (req, res, next) => {
	res.render('account/orderManage', {title: '订单管理'})
})

// 地址选择
router.get('/cityAndArea', (req, res, next) => {
	if (req.query.addrId && req.query.name) {
		var nameList = ['city','area']
		if(nameList.indexOf(req.query.name)>-1) {
			let addr = require('../utils/'+req.query.name)
			return res.json({
				data: {
					list:addr[req.query.addrId]
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
