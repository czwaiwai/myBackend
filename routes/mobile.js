/**
 * Created by Administrator on 2018/4/9 0009.
 */
var express = require('express');
let router = express.Router();
var ccap=require('../utils/verifycode');
// var schema=require('async-validator');
// var User =require('../models/user');
/* GET home page. */
let {Page, User, Catalog, Goods, Article} = require('../viewModels')

router.get('/', (req, res)=> {
	//console.log(req.session.user,"这里可以取到session");
	res.redirect('/index')
	
});
router.get('/index', (req,res) => {
	res.render('app/index',{title:"首页"});
})
router.get('/type', (req, res)=> {
	res.render('app/type',{title:"全部分类"});
})
router.get('/cart', (req, res)=> {
	res.render('app/cart',{title:"购物车"});
})
router.get('/center', (req, res)=> {
	//console.log(req.session.user,"这里可以取到session");
	res.render('app/center',{title:"个人中心"});
});


module.exports = router;