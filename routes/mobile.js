/**
 * Created by Administrator on 2018/4/9 0009.
 */
var express = require('express');
let router = express.Router();
var ccap=require('../utils/verifycode');
// var schema=require('async-validator');
// var User =require('../models/user');
/* GET home page. */
let EventProxy = require('eventproxy')
let {Page, User, Catalog, Goods, Article, Cart} = require('../viewModels')

router.get('/', (req, res)=> {
	//console.log(req.session.user,"这里可以取到session");
	res.redirect('/index')
	
});
router.get('/index', (req,res) => {
	let ep = EventProxy.create('goodTypes', 'goods', 'news', 'articles', (goodTypes, goods, news, articles) => {
		res.render('app/index',{title:"首页", goodTypes, goods, news, articles});
	})
	ep.fail(next)
	Catalog.getChildrenByName('goods',ep.done('goodTypes'))
	Article.findTopArticle('news', ep.done('news'))
	Article.findTopArticle('articles', ep.done('articles'))
	Goods.getHotGoods (ep.done('goods'))

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
router.get('/cart', (req, res)=> {
	res.render('app/cart',{title:"购物车"});
})
router.get('/center', (req, res)=> {
	//console.log(req.session.user,"这里可以取到session");
	res.render('app/center',{title:"个人中心"});
});


module.exports = router;