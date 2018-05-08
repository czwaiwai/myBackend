/**
 * Created by Administrator on 2018/4/9 0009.
 */
var express = require('express');
let router = express.Router();
var ccap=require('../utils/verifycode');
var _ = require('lodash');
// var schema=require('async-validator');
// var User =require('../models/user');
/* GET home page. */
const wechat = require('../utils/wechat').getInstance()
let {loginValid, isWeixin} = require('../utils/helper')
let EventProxy = require('eventproxy')
let {Page, User, Catalog, Goods, Article, Cart, Dict, Address, Order} = require('../viewModels')
let {formatFloat} = require('../utils/tools')
router.use((req, res, next) => {
	console.log('这个是app路径使用的router')
	// console.log(req.get('userAgent'))
	// console.log(req.headers)
	console.log(req.get('user-agent'))
	let url = req.protocol + '://' + req.get('host') + req.originalUrl
	if(isWeixin(req.get('user-agent'))){
		console.log('进入微信路径')
		wechat.getAccessToken().then(accessTokeken => {
			wechat.getJsApiTicket(accessTokeken).then(ticket => {
				res.locals.signJson = wechat.getSignTicket(ticket, url)
				console.log('signJson----', res.locals.signJson)
			  return next()
			}).catch(e => next(e))
		}).catch(e => next(e))
	} else {
		console.log('没有进去')
		return next()
	}
})
router.get('/', (req, res)=> {
	//console.log(req.session.user,"这里可以取到session");
	res.redirect('/app/index')
});
router.get('/index', (req,res,next) => {
	let ep = EventProxy.create('goodTypes', 'goods', 'news', 'articles','dicts', (goodTypes, goods, news, articles, dicts) => {
		let info = _.keyBy(dicts,'name')
		console.log(info, 'info -- - - ----------------------')
		res.render('app/index',{title:"首页", goodTypes, goods, news, articles,
			homeCompany: info.companyProfile.value,
			homeBanner: info.homeBanner.value,
			homeBlockImgs: info.homeBlockImgs.value
		})
	})
	ep.fail(next)
	Catalog.getChildrenByName('goods',ep.done('goodTypes'))
	Article.findTopArticle('news', ep.done('news'))
	Article.findTopArticle('articles', ep.done('articles'))
	Dict.findByGroup('home',ep.done('dicts'))
	Goods.getHotGoods (ep.done('goods'))
	
	
	// let ep = EventProxy.create('goodTypes', 'goods', 'news', 'articles', (goodTypes, goods, news, articles) => {
	// 	res.render('app/index',{title:"首页", goodTypes, goods, news, articles});
	// })
	// ep.fail(next)
	// Catalog.getChildrenByName('goods',ep.done('goodTypes'))
	// Article.findTopArticle('news', ep.done('news'))
	// Article.findTopArticle('articles', ep.done('articles'))
	// Goods.getHotGoods (ep.done('goods'))
})
router.get('/type', (req, res)=> {
	Catalog.getChildrenByName('goods', (err,catalogs) => {
		if (err) return next(err)
		let params = {}
		if (req.query.catalog) {
			let catalog = catalogs.find(item => item.name === req.query.catalog)
			params.catalogPath  = new RegExp(`^${catalog.calPath},${catalog.name}`)
		}
		Goods.findAllByPage(params, req.query.page, 10, (err, obj) => {
			res.render('app/type', Object.assign({title: '商品展示', goodTypes: catalogs}, obj))
		})
	})
})
// 商品详情
router.get('/goods/detail/:id', (req, res, next) => {
	let ep = EventProxy.create('goods', 'topGoods', 'newGoods', (goods, topGoods, newGoods) => {
		res.render('app/detail', {title: '商品详情', goods, topGoods, newGoods})
	})
	ep.fail(next)
	Goods.getHotGoodsByType(1, 4, ep.done('topGoods')) // 推荐产品
	Goods.getHotGoodsByType(3, 4, ep.done('newGoods')) // 新品上市
	Goods.findByIdAddView(req.params.id, ep.done('goods')) // 查找商品及更新访问次数
})
router.get('/cart', (req, res)=> {
	let user = req.session.user
	let carts = []
	let total = 0
	if (user) {
		carts = user.cart.map(item => {
			item.subTotal = formatFloat(item.goodsNum * item.price)
			item.payTotal = formatFloat(item.goodsNum * item.price)
			total += item.payTotal
			return item
		})
		total = formatFloat(total)
	}
	res.render('app/cart', {title: '购物车', carts, total})
})
router.get('/center',  (req, res)=> {
	//console.log(req.session.user,"这里可以取到session");
	res.render('app/center',{title:"个人中心"});
});

router.get('/address',loginValid, (req, res, next) => {
	Address.findAllAddress(req.session.user._id, (err, address) => {
		if (err) return next(err)
		res.render('app/address',  {title: '地址管理', address:address.address})
	})
})

router.get('/orders',loginValid, (req, res, next) => {
	res.render('app/orders', {title: '我的订单'})
})
router.get('/orders/detail/:id', (req, res, next) => {
	Order.findById(req.params.id, (err, order) => {
		let orderObj = order.toObject();
		orderObj.create_at_ago= order.create_at_ago()
		orderObj.update_at_ago= order.update_at_ago()
		orderObj.pay_at_ago = order.pay_at_ago()
		orderObj.statusName = order.statusName
		orderObj.statusColor = order.statusColor
		orderObj.goods.forEach(item => {
			item.subPrice = formatFloat(item.num * item.sellPrice)
		})
		res.json({
			code: 0,
			message: '查询成功',
			data: {title: '订单详情', order:orderObj}
		})
		// res.render('account/orderDetail', {title: '订单详情', order, formatFloat:formatFloat})
	})
})
// 下单 支付确认
router.post('/orderPay',loginValid,(req, res, next) => {
	let address = null
	let addrList = []
	let totalPrice = req.body.totalPrice
	let feeDf = res.locals.feeDf
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
			let needPrice = formatFloat((goodOne.sellPrice * num) + parseFloat(feeDf))
			res.render('app/orderPay', {title: '下单',goods:carts, address, feeDf: feeDf, totalPrice, needPrice, addrList})
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
			totalPrice = formatFloat(parseFloat(totalPrice))
			let needPrice = formatFloat(parseFloat(totalPrice) + parseFloat(feeDf))
			res.render('app/orderPay', {title: '下单', goods:carts, fee: feeDf, totalPrice, needPrice, address, addrList})
		})
	}
	// res.render('app/orderPay', {title: '订单确认'})
})
// 手机支付
router.post('/pay', loginValid, (req, res, next) => {

})
router.get('/paySucc',loginValid, (req, res, next) => {

	res.render('app/paySucc', {title: '支付成功'})
})

router.get('/setting',loginValid, (req, res, next) => {

	res.render('app/setting', {title: '个人设置'})
})


router.get('/page/:pageName', (req, res, next) => {
	let nav = res.locals.catalogs.filter(item => item.relativeUrl.indexOf('/page') === 0)
	let navPage = res.locals.catalogs.find(item => item.relativeUrl === '/page/' + req.params.pageName)
	Page.getPageByPathName(req.params.pageName, function(err, page) {
		if (err || !page) {
			return next(err)
		}
		if (!navPage) {
			navPage = {}
		}
		res.render('app/page', {title:page.title, page, nav, navPage})
	})
})

router.get('/login', (req, res, next) => {
	res.render('app/login', {title: '登录'})
})
router.post('/login', (req, res, next) => {
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
				return res.redirect('/app/login')
			}
			if(user.pwd!=req.body.password){
				req.flash("error","账户名或密码错误");
				return  res.redirect('/app/login');
			}
			console.log(user, 'user')
			delete user.pwd
			req.session.user=user;
			return  res.redirect('/app/center');
		});
	},function(errors){
		req.flash("error",errors[0].msg);
		return   res.redirect('/app/login');
	});
})
router.get('/logout', loginValid, (req,res)=>{
	req.session.openid = req.session.user.openId
	req.session.user=null;
	return res.redirect('/app/');
})
module.exports = router;