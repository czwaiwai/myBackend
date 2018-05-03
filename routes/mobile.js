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
let {Page, User, Catalog, Goods, Article, Cart, Dict} = require('../viewModels')

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
	res.render('app/cart',{title:"购物车"});
})
router.get('/center', (req, res)=> {
	//console.log(req.session.user,"这里可以取到session");
	res.render('app/center',{title:"个人中心"});
});

router.get('/address', (req, res, next) => {
	res.render('app/address', {title:'地址管理'})
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

module.exports = router;