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
let EventProxy = require('eventproxy')
let {Page, User, Catalog, Goods, Article, Cart, Dict, Address} = require('../viewModels')
let {formatFloat} = require('../utils/tools')
router.get('/', (req, res)=> {
	//console.log(req.session.user,"这里可以取到session");
	res.redirect('/index')
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
router.get('/center', (req, res)=> {
	//console.log(req.session.user,"这里可以取到session");
	res.render('app/center',{title:"个人中心"});
});

router.get('/address', (req, res, next) => {
	Address.findAllAddress(req.session.user._id, (err, address) => {
		if (err) return next(err)
		res.render('app/address',  {title: '地址管理', address:address.address})
	})
})

router.get('/orders', (req, res, next) => {
	res.render('app/orders', {title: '我的订单'})
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
module.exports = router;