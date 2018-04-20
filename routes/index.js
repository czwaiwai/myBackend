var express = require('express');
let router = express.Router();
var ccap=require('../utils/verifycode');
var _ = require('lodash');
// var schema=require('async-validator');
// var User =require('../models/user');
/* GET home page. */
let {formatFloat} = require('../utils/tools')
let {loginValid} = require('../utils/helper')
let EventProxy = require('eventproxy')
let {Page, User, Catalog, Goods, Article, Cart, Address, Order} = require('../viewModels')

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
	let ep = EventProxy.create('goodTypes', 'goods', 'news', 'articles', (goodTypes, goods, news, articles) => {
		res.render('index',{title:"首页", goodTypes, goods, news, articles});
	})
	ep.fail(next)
	Catalog.getChildrenByName('goods',ep.done('goodTypes'))
	Article.findTopArticle('news', ep.done('news'))
	Article.findTopArticle('articles', ep.done('articles'))
	Goods.getHotGoods (ep.done('goods'))
});
router.get('/imgCode',(req,res)=>{
   var arr= ccap.get();
   req.session.imgCode=arr[0]+"";
   res.send(arr[1]);
});
// router.get('/chat',(req,res)=>{
//     console.log(req.path);
//     res.render('chat',{title:"聊天室"});
// });

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
	let ep = EventProxy.create('topArticles', 'obj', (topArticles, obj) => {
		// res.render('index',{title:"首页", goodTypes, goods});
		obj.topArticles = topArticles
		res.render('article/list', obj)
	})
	Article.findTopArticle(req.params.type,ep.done('topArticles'))
	Catalog.findByName(req.params.type, (err, catalog) => {
		if (err) return next(err)
		Article.findAllByPageCatalogs(catalog.name,req.query.page, 10, (err, obj) => {
			if (err)  return next(err)

			ep.emit('obj', Object.assign({title:catalog.nameCn}, obj));
		})
	})
})
router.get('/article/detail/:id', (req, res, next) => {
	Article.findByIdAddView(req.params.id, (err, article) => {
		if(err) return next(err)
		Article.findTopArticle(article.catalogName, (err, topArticles) => {
			if (err) return next(err)
			res.render('article/detail', {title: article.title, article, topArticles})
		})
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
// 商品详情
router.get('/goods/detail/:id' , (req, res, next) => {
	Goods.findById(req.params.id, (err, goods) => {
		if (err) return next(err)
		if (!goods) {
			res.status(404)
			return next(err)
		}
		res.render('goods/detail', {title: '商品详情', goods})
	})
})

// 购物车
router.get('/cart/index', (req, res, next) => {
	let user = req.session.user
	console.log(user, '-----------cart/index')
	let carts = []
	let total = 0
	console.log(user, '---------------')
	if (user) {
		console.log('user', user)
		carts = user.cart.map(item => {
			item.subTotal = formatFloat(item.goodsNum * item.price)
			item.payTotal = formatFloat(item.goodsNum * item.price)
			total += item.payTotal
			return item
		})
		total = formatFloat(total)
	}
	res.render('cart/index', {title: '购物车', carts, total})
})
router.post('/cart/clear', loginValid, (req, res, next) => {
	let user = req.session.user
	Cart.clear(user._id,  (err, user) => {
		if (err) return next(err)
		req.session.user.cart = []
		res.json({
			code: 0,
			message: '操作成功',
			data: {carts: user.cart}
		})
	})
})
// 购物车删除单个商品
router.post('/cart/removeOne', loginValid, (req, res, next) => {
	let user = req.session.user
	Cart.removeOne(user._id, req.body.cartId, (err, user) => {
		if (err) return next(err)
		req.session.user.cart = user.cart
		res.json({
			code: 0,
			message: '操作成功',
			data: {carts: user.cart}
		})
	})
})
router.post('/cart/checkAll', loginValid, (req, res, next) => {
	let user = req.session.user
	Cart.checkAll(user._id, req.body.check, (err, user) => {
		if (err) return next(err)
		req.session.user.cart = user.cart
		res.json({
			code: 0,
			message: '操作成功',
			data: {carts: user.cart}
		})
	})
})
router.post('/cart/changeCartCheck', loginValid, (req, res, next) => {
	let user = req.session.user
	Cart.changeCheck(user._id,req.body,(err, user) => {
		if (err) return next(err)
		req.session.user.cart = user.cart
		res.json({
			code:0,
			message: '操作成功',
			data: {carts:user.cart}
		})
	})
})
router.post('/cart/changeCartNum', loginValid, (req, res, next) => {
	let user = req.session.user
	Cart.changeNum(user._id,req.body,(err, user) => {
		if (err) return next(err)
		req.session.user.cart = [...user.cart]
		// console.log(user.cart, '-------------/cart/change')
		// console.log(req.session.user.cart, '----------------/cart/changeNum')
		res.json({
			code:0,
			message: '操作成功',
			data: {carts:user.cart}
		})
	})
})


//订单
router.post('/order/index', loginValid, (req, res, next) => {
	console.log(req.body)
	let address = null
	let addrList = []
	let totalPrice = req.body.totalPrice
	if (req.body.status === 'buy') {
		let user = req.session.user
		if (user.address && user.address.length>0) {
			address = user.address[0]
			addrList = user.addrList
		}
		Goods.findByIds([req.body.id], (err, goods) => {
			var goodOne = goods[0]
			let num = parseInt(req.body.num)
			var carts=[{
				id:goodOne._id,
				goods:goodOne,
				num:num,
				price:goodOne.sellPrice,
				subTotal:formatFloat(goodOne.sellPrice * num),
				payTotal:formatFloat(goodOne.sellPrice * num)
			}]
			// console.log(goodOne.sellPrice,parseFloat(goodOne.sellPrice))
			let totalPrice = formatFloat(goodOne.sellPrice * num)
			res.render('order/index', {title: '下单',goods:carts, address, fee:10, totalPrice, addrList})
		})
	}
	if (req.body.status === 'cart') {
		let user = req.session.user
		if (user.address && user.address.length>0) {
			address = user.address[0]
			addrList = user.addrList
		}
		let carts = JSON.parse(req.body.carts)
		let goodIds = carts.map(item => item.id)
		Goods.findByIds(goodIds, (err, goods) => {
			carts.map(item => {
				let newOne = goods.find(sub => {
					return sub._id.toString() === item.id})
				item.goods = newOne
				return item
			})
			res.render('order/index', {title: '下单', goods:carts, fee:10, totalPrice, address, addrList})
		})
	}
})

router.get('/order/pay/:orderId', loginValid, (req, res, next) => {
	Order.findById(req.params.orderId, (err, order) => {
		if (err) next(err)
		if (order.orderStatus === 10) {
			setTimeout(() => { //链接微信获取url
				res.render('order/pay', {title: '订单支付', order:order, totalPrice: order.needPrice, prepay_id : '12342342352562',
					code_url: 'www.http.com'})
			}, 2000)
		} else {
			return next(new Error('订单不是为支付状态'))
		}
	})
})
// 订单支付
router.post('/order/pay', loginValid, (req, res, next) => {
	let rb = req.body
	var addrId = rb.addressId
	let totalPrice = rb.totalPrice
	let fee = rb.fee
	var goods = []
	try {
		console.log(req.body.goods)
		goods = JSON.parse(req.body.goods)
	} catch (e) {
		return next(e)
	}
	let totalNum = 0;
	let orderGoods = goods.map(item => {
		totalNum += item.num
		return {
			goodsId:item.id,
			name: item.goods.name,
			subName: item.goods.subName,
			imgTmb: item.goods.imgTmb,
			sellPrice: item.goods.sellPrice,
			num: item.num
		}
	})
	let user = req.session.user
	let addrObj =user.address.find(item => item._id === addrId)
	if(!addrObj) {
		return next(new Error('订单地址没有找到'))
	}
	var order = {
		userId: user._id,
		orderStatus: 10, //为支付
		goods: orderGoods,
		address: {
			name: addrObj.name,
			mobile: addrObj.mobile,
			place: addrObj.province + addrObj.city + addrObj.area + addrObj.address
		},
		totalNum: totalNum,
		totalPrice: totalPrice,
		feePrice: fee,
		type: 'wx',
		needPrice: totalPrice,
	}
	// 请求微信接口返回二维码url
	setTimeout(() => {
		// 创建新订单
		console.log(order,'order---before')
		Order.create(order, (err, newOrder) => {
			if (err) return next(err)
			console.log(newOrder, 'newOrder ---- after')
			res.render('order/pay', {title: '订单支付', order:newOrder, totalPrice, prepay_id : '12342342352562',
				code_url: 'www.http.com'})
		})
	},2000)
})

router.get('/order/success', loginValid, (req, res, next) => {
	Order.findById('5ad741d9c361b72ee43ca252', (err, order) => {
		if(err) return next(err)
		res.render('order/success', {title: '订单支付完成', order})
	})
})

// goodsId: {type: Schema.ObjectId}, // 产品Id
// goodsName: {type: String}, // 产品名称
// goodsSubName: {type: String}, // 产品sub名称
// imgUrl: {type: String}, // 图片
// goodsNum: {type: Number, default:1}, //数量
// isCheck: {type: Boolean, default: false}, // 是否选中
// price: {type: Number}, // 单价

//添加到购物车
router.post('/add2Cart', loginValid, (req, res, next) => {
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
router.get('/account/index', loginValid, (req, res, next) => {
	Order.noPay(req.session.user._id, (err, orders) => {
		res.render('account/index', {title: '个人中心', orders})
	})
})

//地址管理
router.get('/account/address', loginValid, (req, res, next) => {
	Address.findAllAddress(req.session.user._id, (err, address) => {
		if (err) return next(err)
		res.render('account/address', {title: '地址管理', address:address.address})
	})
})

//个人信息
router.get('/account/accountInfo', loginValid, (req, res, next) => {
	res.render('account/accountInfo', {title: '个人信息'})
})
router.post('/account/accountInfo', loginValid, (req, res, next) => {
	// req.body
	let param = req.body
	User.saveById(req.session.user._id, param, (err, user) => {
		if (err) return next(err)
		req.session.user = user
		req.flash('success','保存成功')
		res.redirect('/account/accountInfo')
	})
})

router.get('/account/changePwd', loginValid, (req, res, next) => {
	res.render('account/changePwd', {title: '修改密码'})
})
router.post('/account/changePwd', loginValid, (req, res, next) => {
	req.checkBody('oldpwd',"原始密码不能为空").notEmpty()
		.isTooShort(6).withMessage("密码错误");
	req.checkBody('pwd',"密码不能为空").notEmpty()
		.isTooShort(6).withMessage("密码太短");
	req.checkBody('pwdRepeat').notEmpty()
		.isSame(req.body.pwd).withMessage('密码不一致')
	req.asyncValidationErrors().then(function(){
		// console.log(req.body)
		// User.findById
		User.findById(req.session.user._id, function(err,user){
			if (err) return next(err)
			if (user.pwd !== req.body.oldpwd) {
				req.flash("error","账户名或密码错误")
				return  res.redirect('/account/changePwd')
			}
			User.findAndUpdate(user._id, {pwd: req.body.pwd}, (err, newUser) => {
				// console.log(newUser)
				req.flash('success', '修改成功')
				res.redirect('/account/changePwd')
			})
				// req.flash('success', '修改成功')
				// res.redirect('/account/changePwd')
		});
	},function(errors){
		req.flash('error', errors[0].msg)
		res.redirect('/account/changePwd')
	});
	
})

//订单管理
router.get('/account/orderManage', loginValid, (req, res, next) => {
	// Order.findAllByPage({},req)
	res.render('account/orderManage', loginValid, {title: '订单管理'})
})
router.post('/account/orderManage', loginValid, (req, res, next) => {
	let type = {};
	switch (req.body.orderType) {
		case 'waitPay': type = {orderStatus: 10};break;
		case 'pay': type = {orderStatus: 20};break;
		case 'ship': type = {orderStatus: 30};break;
		case 'back': type = {orderStatus: 31};break;
	}
	
	// type.userId = req.session.user._id
	Order.findAllByPage(type, req.body.page, 1, (err, obj) => {
		if(err) return next(err)
		obj.orders = obj.orders.map(item => {
			let newObj = item.toObject()
			newObj.create_time = item.create_at_ago()
			newObj.statusName = item.statusName
			newObj.statusColor = item.statusColor
			return newObj
		})
		console.log(obj.orders, '----')
		res.json({
			code: 0,
			message: '操作成功',
			data: obj
		})
	})
})
router.get('/account/orderDetail/:id', loginValid, (req, res, next) => {
  Order.findById(req.params.id, (err, order) => {
	  res.render('account/orderDetail', {title: '订单详情', order, formatFloat:formatFloat})
  })
})

// 获取所有地址
router.get('/account/getAllAddress', loginValid, (req, res, next) => {
	Address.findAllAddress(req.session.user._id, (err, address) => {
		if (err) return next(err)
		res.json({
			code:0,
			message:'操作成功',
			data: address
		})
	})
})
// 地址保存
router.post('/account/address', loginValid, (req, res, next) => {
	// req.body
	var provArr = req.body.province.split(',')
	var cityArr = req.body.city.split(',')
	var areaArr = req.body.area.split(',')
	
	let param = {
		name: req.body.name,
		mobile: req.body.mobile,
		isDefault: false,
		address: req.body.address,
		provinceId: provArr[0],
		province: provArr[1],
		cityId: cityArr[0],
		city: cityArr[1],
		areaId: areaArr[0],
		area: areaArr[1]
	}
	let action = "create"
	if(req.body.isUpdate) {
		param._id = req.body.isUpdate
		action = "update"
	} else {
		action = "create"
	}
	Address[action](req.session.user._id,param, (err, address) => {
		if (err) return next(err)
		console.log(address, 'user -- -address')
		res.json({
			data: {address},
			code: 0,
			message: '操作成功'
		})
	})
})
router.post('/account/addressRemove', loginValid, (req, res, next) => {
	Address.remove(req.session.user._id,req.body._id, (err) => {
		if (err) return next(err)
		res.json({
			data: {},
			code: 0,
			message: '操作成功'
		})
	})
})
// 地址选择
router.get('/cityAndArea', loginValid, (req, res, next) => {
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
	} else {
		let addr = require('../utils/province')
		return res.json({
			data: {
				list: addr,
			},
			code: 0,
			message: '操作成功'
		})
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
					delete user.pwd
          req.session.user=user;
          return  res.redirect('/account/index');
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
router.get('/logout', loginValid, (req,res)=>{
    req.session.user=null;
    return res.redirect('/');
})
module.exports = router;
