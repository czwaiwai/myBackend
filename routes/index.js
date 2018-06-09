var express = require('express');
let router = express.Router();
var ccap=require('../utils/verifycode');
var _ = require('lodash');
// var schema=require('async-validator');
// var User =require('../models/user');
/* GET home page. */
let {formatFloat, bigImg} = require('../utils/tools')
let mail = require('../utils/email')
let {emailCode, validEmailCode, loginValid, submitGoodsValid} = require('../utils/helper')
let {queryOnlyCode} = require('../utils/kdniao')
let WxPay = require('../utils/wxPay')
let Wechat = require('../utils/wechat')
const wechat = Wechat.getInstance()
let EventProxy = require('eventproxy')
let dictCache = require('../utils/dictCache')
let cache = require('../utils/cache')
let {Page, User, Catalog, Goods, Article, Cart, Address, Order, Dict, Postage} = require('../viewModels')
// 对常见字段格式进行校验
// router.use((req,res,next) => {
//
// })
let dictCa = dictCache.getInstance()
router.use((req,res,next) => {
	let ep = EventProxy.create('catalogs', 'dicts', (catalogs, dicts) => {
		res.locals.catalogs = catalogs
		let dictObj = _.keyBy(dicts,'name')
		res.locals.frontInfo = _.keyBy(dictObj,'name')
		res.locals.webInfo = dictObj.webInfo.value
		res.locals.feeDf = dictObj.fee.value
		next()
	})
	ep.fail(next)
	Catalog.getFrontCatalog((err,catalogs)=>{
		if (err) { return ep.emit('error', err) }
		// cache.set('catalogs', catalogs)
		ep.emit('catalogs', catalogs);
	})
	// if(cache.has('catalogs')) {
	// 	console.log('存在catalogs', '我在缓存中取', cache.get('catalogs'))
	// 	ep.emit('catalogs', cache.get('catalogs'))
	// } else {
	// 	Catalog.getFrontCatalog((err,catalogs)=>{
	// 		if (err) { return ep.emit('error', err) }
	// 		cache.set('catalogs', catalogs)
	// 		ep.emit('catalogs', catalogs);
	// 	})
	// }
	// Dict.findByGroup('front',ep.done('dicts'))
	dictCa.getDicts('front',ep.done('dicts'))
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
	let ep = EventProxy.create('goodTypes', 'goods', 'news', 'articles','dicts', (goodTypes, goods, news, articles, dicts) => {
		let info = _.keyBy(dicts,'name')
		console.log(info, 'info -- - - ----------------------')
		res.render('index',{title:"首页", info, goodTypes, goods, news, articles,
			homeCompany: info.companyProfile.value,
			homeBanner: info.homeBanner.value,
			homeBlockImgs: info.homeBlockImgs.value
		})
	})
	ep.fail(next)
	Catalog.getChildrenByName('goods',ep.done('goodTypes'))
	Article.findTopArticle('news', 3, ep.done('news'))
	Article.findTopArticle('articles', 3, ep.done('articles'))
	Dict.findByGroup('home',ep.done('dicts'))
	let front =  res.locals.frontInfo
	if(front && front.notCatalogShow && front.notCatalogShow.value) {
		let tmpArr = front.notCatalogShow.value.split(',')
		Goods.getHotGoods ({onSale:1,catalogId: {$nin: [...tmpArr]}}, ep.done('goods'))
	} else {
		Goods.getHotGoods ({onSale:1}, ep.done('goods'))
	}
});
//清空缓存内容
router.post('/clearCache', (req, res, next) => {

})

// 查询邮件
router.post('/queryPostage/:id', (req, res, next) => {
	queryOnlyCode(req.params.id).then(data => {
		console.log('data:', data)
		res.json({
			code:0,
			message:'success',
			data:{
				postage:data,
			}
		})
	}).catch(err => {
		console.log(err, '--------------------err-----------------------')
		res.status(403).json({
			code: -1,
			message: err || '查询失败'
		})
	})
})
router.get('/authLogin', (req, res, next) => {
	let code = req.query.code
	let state = req.query.state
	console.log(state)
	
	console.log('查看是否存在user：',req.session.user)
	let url = decodeURIComponent(state)
	url = url.replace('bssfood_','')
	if (!code) {
		if (url.indexOf('/app') > -1) {
			var link = "?"
			if(url.indexOf('?')> -1) {
				link = "&"
			}
			return res.redirect(url + link + 'wxValid=true')
		} else {
			return res.redirect('/app/index?wxVaild=true')
		}
	}
	wechat.getCodeToken(code).then((json) => {
		console.log('json', json)
		console.log(typeof json)
		wechat.getUserInfo(json.access_token, json.openid).then(wxUser=> {
			console.log('得到微信User对象', wxUser)
			// { openid: 'o5W010h6MfsZS-j1ZEUE-ZwKPelA',
			// 	nickname: '歪歪😰',
			// 	sex: 1,
			// 	language: 'zh_CN',
			// 	city: '',
			// 	province: '维也纳',
			// 	country: '奥地利',
			// 	headimgurl: 'http://thirdwx.qlogo.cn/mmopen/vi_32/Vu0c5PibbGxXRRsjAUJnllGWGeXbibV2eQtgCOLCAnORQey6l5f46ZMyD0qgLiaez1fPIoWmFBicnZuQKmd7ibias4ww/132',
			// 	privilege: [] }
			
			User.findByOpenId (wxUser.openid, function(err, user) {
				if (err) return next(err)
				console.log('查找数据库user对象', user)
				if(user) { // 找到user并登录
					req.session.user = user
					if (url.indexOf('/app')> -1) {
						return res.redirect(url)
					} else {
						return res.redirect('/app/index?wxVaild=true')
					}
				} else { // 找不到user 创建新User
					console.log('找不到user对象，创建新user', user)
					let newUser = {
						nickname: wxUser.nickname,
						sex: wxUser.sex,
						headImg: wxUser.headimgurl,
						openId: wxUser.openid,
						token: json.access_token
					}
					User.create(newUser, (err, user) => {
						if (err) return next(err)
						req.session.user = user
						if (url.indexOf('/app') > -1) {
							var link = "?"
							if(url.indexOf('?')> -1) {
								link = "&"
							}
							return res.redirect(url + link + 'wxValid=true')
						} else {
							return res.redirect('/app/index?wxVaild=true')
						}
					})
				}
			})
			// console.log('跳转到首页')
		})
	}).catch(err => {
		return res.redirect('/app/index?wxVaild=true')
	})
})

router.get('/auth', (req, res) => {
	let code = req.query.code
	let state = req.query.state
	// 得到code
	console.log(code,state, 'code-------------state-------')
	wechat.getCodeToken(code).then((json) => {
		console.log('json', json)
		console.log(typeof json)
		req.session.openid = json.openid
		res.json({
			code:0,
			message:'success',
			data: {
				code,
				state
			}
		})
	})
	// {"code":0,"message":"success","data":{"code":"081BUZWE07xN3k2cCi0F00vWWE0BUZWT","state":"bssfood"}}
})

router.get('/imgCode',(req,res)=>{
   var arr= ccap.get();
   req.session.imgCode=arr[0]+"";
   res.send(arr[1]);
});
// router.get('/chat',(req,res)=>{
//     console.log(req.path);
//     res.render('chat',{title:"聊天室"});
// });

// router.get('/about',(req,res)=>{
//     res.render('about',{title:"关于我们"});
// });
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
		if(navPage.imgUrl) {
			navPage.imgUrl = bigImg(navPage.imgUrl)
		}
		res.render('page', {title:page.title, page, nav, navPage})
  })
})
// 文章管理
router.get('/article/list/:type', (req, res, next) => {
	let navPage = res.locals.catalogs.find(item => item.relativeUrl === '/article/list/' + req.params.type)
	console.log(navPage)
	let ep = EventProxy.create('topArticles', 'obj', (topArticles, obj) => {
		// res.render('index',{title:"首页", goodTypes, goods});
		obj.topArticles = topArticles
		if (navPage) {
			obj.navPage = navPage
		} else {
			obj.navPage = {}
		}
		// if (!navPage) {
		// 	obj.navPage = {}
		// }
		if(navPage.imgUrl) {
			obj.navPage.imgUrl = bigImg(navPage.imgUrl)
		}
		res.render('article/list', obj)
	})
	ep.fail(next)
	Article.findTopArticle(req.params.type,ep.done('topArticles'))
	Catalog.findByName(req.params.type, (err, catalog) => {
		if (err || !catalog) return ep.emit('error', err || new Error('catalog 没有找到'))
		Article.findAllByPageCatalogs(catalog.name,req.query.page, 10, (err, obj) => {
			if (err)  return ep.emit('error', err)
			ep.emit('obj', Object.assign({title:catalog.nameCn}, obj));
		})
	})
})
router.get('/article/detail/:id', (req, res, next) => {
	Article.findByIdAddView(req.params.id, (err, article) => {
		if(err) return next(err)
		if(!article) return next()
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
		let params = {onSale: 1}
		if (req.query.catalog) {
			let catalog = catalogs.find(item => item.name === req.query.catalog)
			params.catalogPath  = new RegExp(`^${catalog.calPath},${catalog.name}`)
		} else {
			let front =  res.locals.frontInfo
			if(front && front.notCatalogShow && front.notCatalogShow.value) {
				let tmpArr = front.notCatalogShow.value.split(',')
				params.catalogId = {$nin: [...tmpArr]}
			}
		}
		if (req.query.search) {
			params.$text = {$search: req.query.search}
		}
		Goods.findAllByPage(params, req.query.page, 12, (err, obj) => {
			res.render('goods/index', Object.assign({title: '商品展示', goodTypes: catalogs}, obj))
		})
	})
})
// 商品详情
router.get('/goods/detail/:id' , (req, res, next) => {
	let ep = EventProxy.create('goods', 'topGoods', 'newGoods', (goods, topGoods, newGoods) => {
		if(!goods) return next()
		res.render('goods/detail', {title: '商品详情', goods, topGoods, newGoods})
	})
	ep.fail(next)
	Goods.getHotGoodsByType(1, 4, ep.done('topGoods')) // 推荐产品
	Goods.getHotGoodsByType(3, 4, ep.done('newGoods')) // 新品上市
	Goods.findByIdAddView(req.params.id, ep.done('goods')) // 查找商品及更新访问次数
})

// 购物车
router.get('/cart/index', (req, res, next) => {
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
router.post('/cart/removeOne/:cartId', loginValid, (req, res, next) => {
	let user = req.session.user
	console.log(req.body.cartId, '------cartId---------')
	Cart.removeOne(user._id, req.params.cartId, (err, user) => {
		if (err) return next(err)
		console.log(user, '---removeOne-------')
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
			res.render('order/index', {title: '下单',goods:carts, address, feeDf: feeDf, totalPrice, needPrice, addrList})
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
			res.render('order/index', {title: '下单', goods:carts, fee: feeDf, totalPrice, needPrice, address, addrList})
		})
	}
})
// 地址变更邮费按规则变更
router.post('/order/postage', (req, res, next) => {
	// Postage.
	let data = req.body
	let addr = {}
	let feeDf = res.locals.feeDf
	if(data) {
		let proArr =	data.province.split(',')
		let cityArr =	data.city.split(',')
		addr.provinceId = proArr[0]
		addr.province = proArr[1]
		addr.cityId = cityArr[0]
		addr.city = cityArr[1]
	}
	Postage.findEqual(addr, (err, postage) => {
		if(err) return next(err)
		console.log(postage, 'postage')
		let fee = feeDf
		if(postage) {
			fee = postage.fee
		}
		res.json({
			code: 0,
			message: '操作成功',
			data: {
				feePrice: fee
			}
		})
	})
})

router.get('/order/pay/:id', loginValid, (req, res, next) => {
	Order.findById(req.params.id, (err, order) => {
		if (err) next(err)
		if (order.orderStatus === 10) {
			// 请求微信接口返回二维码url
			WxPay.sacnOrder(order.userId, '白石山商品购买',order.orderId, order._id, order.needPrice).then((data) => {
				if (data.return_code === 'SUCCESS') {
					res.render('order/pay', {title: '订单支付', order:order, needPrice: order.needPrice, prepay_id : data.prepay_id,
						code_url: data.code_url})
				} else {
					return next(new Error({
						name:data.return_msg,
						message: data.return_msg + '/n' + JSON.stringify(data)
					}))
				}
			})
			// setTimeout(() => { //链接微信获取url
			// 	res.render('order/pay', {title: '订单支付', order:order, totalPrice: order.needPrice, prepay_id : '12342342352562',
			// 		code_url: 'www.http.com'})
			// }, 2000)
		} else {
			return next(new Error('订单不是未支付状态'))
		}
	})
})
// 订单支付
router.post('/order/pay', loginValid, submitGoodsValid, (req, res, next) => {
	// 验证req.body 数据真实性
	let rb = req.body
	var addrId = rb.addressId
	let totalPrice = rb.totalPrice
	let needPrice = rb.needPrice
	let fee = rb.fee
	var goods = []
	try {
		console.log(req.body.goods)
		goods = JSON.parse(req.body.goods)
	} catch (e) {
		return next(e)
	}
	let totalNum = 0
	let goodsIds = []
	let orderGoods = goods.map(item => {
		totalNum += item.num
		goodsIds.push(item.id)
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
		needPrice: needPrice,
	}
	Cart.clearByGoodsId(user._id, goodsIds, (err, user) => {
		if (err) return next(err)
		req.session.user.cart = [...user.cart]
		// 请求微信接口返回二维码url
		Order.create(order, (err, newOrder) => {
			if (err) return next(err)
			WxPay.sacnOrder(newOrder.userId, '白石山商品购买',newOrder.orderId, newOrder._id, newOrder.needPrice).then((data) => {
				if (data.return_code === 'SUCCESS') {
					res.render('order/pay', {title: '订单支付', order:newOrder, needPrice, prepay_id : data.prepay_id,
						code_url: data.code_url})
				} else {
					return next(new Error({
						name:data.return_msg,
						message: data.return_msg + '/n' + JSON.stringify(data)
					}))
				}
			})
		})
	})
})
/*
	_returnData = { xml:
		{ appid: 'wxbc8b10******************',
			attach: '支付功能',
			bank_type: 'CFT',
			cash_fee: '1',
			fee_type: 'CNY',
			is_subscribe: 'Y',
			mch_id: '137*******',
			nonce_str: '10fskie7bymn29',
			openid: 'ooqSov0HufIdX7YGY1ePDC5NJS-w',
			out_trade_no: 'pro_wxpay649',
			result_code: 'SUCCESS',
			return_code: 'SUCCESS',
			sign: '549B3D77F7C5E2766406A68BA3E27D78',
			time_end: '20160823162731',
			total_fee: '1',
			trade_type: 'JSAPI',
			transaction_id: '4000732001201608232045230805'
		}
	}
	*/
// 微信支付回调的地址
router.post('/order/notify', (req, res, next) => {
	console.log(req.body, '----notify---req--------')
	if(req.body &&  req.body.xml ) {
		let resData =  req.body.xml
		console.log(resData, '-------')
		// 更新订单状态
		Order.savePay(resData.out_trade_no, resData, (err, order) => {
			if (err) return next(err)
			let tpl = WxPay.notify(resData)
			res.send(tpl)
		})
	}
})
// 微信退款回调
router.post('/order/refund_notify', (req, res, next) => {
	console.log(req.body, '-refund-- - url---notify---req--------')
	//{ xml:
	// { return_code: 'SUCCESS',
	// 	appid: '****************',
	// 	mch_id: '',
	// 	nonce_str: '110623459b8651e6cfee2c7c3e76fc1b',
	// 	req_info: '4rEolCB8JJ7qJbV+kmjKYLS4MDyuZzjBUA/0RQAmwlwT+V0cUlrlKHtV4JIMgNAxw+qCQOYMkvyohvVbrDuURRqfoWQD6PSWFEgFjA4Z98dr3VA37kR+BZEhNRDSz/9KUgtBitZBnPjzw2szyuA5EKIerZDzrEJDT0rl+c/MsXXrzAWI0VmNRxeEZcTJPtIiphrRvSJzjvQPl9dLNKLaHr3Ld1xAC8/2bJf/FEaVFL8blyDVZ6oN8q3W6thPb2y/uKUO54QyeZU/avdLNNu14/xqgwVMMOaVGBtjd+GdAe8OzcD4AMU1Z9FnCmkypkPpoVOApDORsLQv3i4dC5UqOrEDG9/bsOxSdJkffG7Q58+uPdogDREa6k6M9RPiOZ6IQV+DPAq7Sje6JKZmr+LQPHsChCkLjvoS6g2nFfUHzYfNdBvH5Cwp99Y4uIwUL6bgWmQT/lCwlyFtfU5+Clo7qTugBw7EzzUioAXQM05Ux7plQmUK+gdrvlrg6jXFL5NjrCjFuH8O373ceqb4edTedT8/k/YsobRNUtwtLUUsIrnZ7Man0ia4ZOL/rzaUTa3aInsXO4Ivzn7lfX4ebTJ3741VAwLQm9OwJv7pFaxHRH4ieiHAp/cKEw5rZur5AV3gdbOa+rikOCqSq+1Kz+NRkqWBj0sFBi54NLJ55cIX1n/HUXg3AgcXNbgg7HMQ96xY3QrXUHn2VghZXKLVHQYnYxgIKaGsOMH5DwJ8nWPJkgZ9hZ/QNPnS4N3vWMVG96rJ0YsdXMgvelPvUA15aHq1e8yHAiOBraXI3Mzd2VMOgeOxQxrAJqwN2TROhYD11uSEzZUxvEe6+0nhdPMXlO3K+mVTOzGWV+wRwcqkDmtd/3QGvrp3UnrlxDauNy9TDALRiEhKuOCo7qH246L1tO8GTUtmY96V2943XqzG/EK21ExcM8JYzDR0isOmS2b9ws+YILPCyj0XvdZHteq44H9vSmFLXbOn7mc9kT7gVwVtR3a0FvADhf4nqo3QoIvdmzxn/YjHnryAhQAplkzCHHvNFA==' } }
	if(req.body &&  req.body.xml ) {
		let resData =  req.body.xml
		console.log(resData, '-------')
		// 进行数据解密
		WxPay.refundDeCodeJson(WxPay.refundDecode(resData.req_info)).then(resCodeData => {
			// 解密后更新数据订单状态
			// { out_refund_no: '5200000008',
			// 	out_trade_no: '5200000008',
			// 	refund_account: 'REFUND_SOURCE_RECHARGE_FUNDS',
			// 	refund_fee: '1',
			// 	refund_id: '50000506492018051404617935239',
			// 	refund_recv_accout: '支付用户零钱',
			// 	refund_request_source: 'API',
			// 	refund_status: 'SUCCESS',
			// 	settlement_refund_fee: '1',
			// 	settlement_total_fee: '1',
			// 	success_time: '2018-05-14 15:17:05',
			// 	total_fee: '1',
			// 	transaction_id: '4200000132201805020809878493' }
			console.log(resCodeData,'resCodeData----------------------')
			Order.refunded(resCodeData.out_trade_no, resCodeData, (err, order) => {
				if (err) return next(err)
				let tpl = WxPay.notify(resData)
				res.send(tpl)
			})
		})
	}
})

// 查询数据库，查看订单支付状态值是否更改
router.use('/order/isPay', (req, res, next) => {
	// let resData = req.body.xml
	let id = req.body.id
	let orderId = req.body.orderId
	WxPay.queryOrder(orderId).then(data => {
		console.log(data, 'queryOrder --------------------------')
		let {return_code, return_msg , result_code, out_trade_no, trade_state, trade_state_desc} = data
		res.json({
			code: 0,
			message: '操作成功',
			data: data
		})
	})
	// 订单未找到
	// {
	// 	"code": 0,
	// 	"message": "操作成功",
	// 	"data": {
	// 	"return_code": "SUCCESS",
	// 		"return_msg": "OK",
	// 		"appid": "",
	// 		"mch_id": "",
	// 		"nonce_str": "2QI0fLaDhnzupSWL",
	// 		"sign": "88A086F2D6EE8AAE9C8CFF88B5FDBFD0",
	// 		"result_code": "FAIL",
	// 		"err_code": "ORDERNOTEXIST",
	// 		"err_code_des": "order not exist"
	// 	}
	// }
	// 订单未支付
	// { return_code: 'SUCCESS',
	// 	return_msg: 'OK',
	// 	appid: '',
	// 	mch_id: '',
	// 	nonce_str: 'x9C3FVFngjH9BKPV',
	// 	sign: 'DBBADEA7851B39323C7CADA2A408078D',
	// 	result_code: 'SUCCESS',
	// 	out_trade_no: '5200000006',
	// 	trade_state: 'NOTPAY',
	// 	trade_state_desc: '订单未支付' }
	// 订单已支付
	// {
	// 	"code": 0,
	// 	"message": "操作成功",
	// 	"data": {
	// 	"return_code": "SUCCESS",
	// 		"return_msg": "OK",
	// 		"appid": "",
	// 		"mch_id": "",
	// 		"nonce_str": "oGhuTBn5iX5YT9l0",
	// 		"sign": "344731F36894202102041BD99399E2CF",
	// 		"result_code": "SUCCESS",
	// 		"openid": "o5W010h6MfsZS-j1ZEUE-ZwKPelA",
	// 		"is_subscribe": "Y",
	// 		"trade_type": "NATIVE",
	// 		"bank_type": "CFT",
	// 		"total_fee": "1",
	// 		"fee_type": "CNY",
	// 		"transaction_id": "4200000132201805020809878493",
	// 		"out_trade_no": "5200000008",
	// 		"attach": "5ab3bff3d0bbdf1871e62861",
	// 		"time_end": "20180502110841",
	// 		"trade_state": "SUCCESS",
	// 		"cash_fee": "1",
	// 		"trade_state_desc": "支付成功"
	//   }
	// }
})

router.get('/order/success', loginValid, (req, res, next) => {
	Order.findById(req.query.id, (err, order) => {
		if(err) return next(err)
		res.render('order/success', {title: '订单支付完成', order})
	})
})

//添加到购物车
router.post('/add2Cart', loginValid, (req, res, next) => {
	let id = req.body.id || req.body._id
	Goods.findById(id, (err, goods) => {
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
			Cart.add2Update(req.session.user._id, cart, (err, user) => {
				req.session.user.cart=user.cart
				res.json({
					data: {cart: user.cart},
					code:0,
					message:'操作成功'
				})
			})
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
// 退款申请
router.post('/account/applyBackAmt/:id', loginValid, (req, res, next) => {
	let id = req.params.id
	Order.refundApply(id, (err, order) => {
		if (err) return next(err)
		res.json({
			code:0,
			message: '申请成功，工作人员将在1～3个工作日退还,请耐心等待',
		})
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
	res.render('account/orderManage', {title: '订单管理'})
})
router.post('/account/orderManage', loginValid, (req, res, next) => {
	let type = {};
	switch (req.body.orderType) {
		case 'waitPay': type = {orderStatus: 10};break;
		case 'pay': type = {orderStatus: 20};break;
		case 'ship': type = {orderStatus: 30};break;
		case 'back': type = {orderStatus: 31};break;
	}
	type.userId = req.session.user._id
	Order.findAllByPage(type, req.body.page, 10, (err, obj) => {
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
router.post('/account/orderCancel/:id', loginValid, (req, res, next) => {
	Order.cancelById(req.params.id,(err, order) => {
		res.json({
			data: {
				order: order,
			},
			code: 0,
			message: '操作成功',
		})
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
	Address[action](req.session.user._id,param, (err, address, user) => {
		if (err) return next(err)
		console.log(address, 'user -- -address')
		req.session.user.address = [...user.address]
		res.json({
			data: {address},
			code: 0,
			message: '操作成功'
		})
	})
})
router.post('/account/addressRemove', loginValid, (req, res, next) => {
	Address.remove(req.session.user._id,req.body._id, (err, user) => {
		if (err) return next(err)
		req.session.user.address = [...user.address]
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
	        if (user.isLock === 1) {
        		req.flash("error", "账户名未激活")
		        return res.redirect('/login')
	        }
          if(user.pwd != req.body.password){
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
router.get('/registerSucc/id', (req, res) => {
	// mail.send('register')

})
router.post('/register', (req, res, next) => {
	req.checkBody('userName',"用户名不能为空").notEmpty()
		.isTooShort(6).withMessage("用户名太短");
	req.checkBody('pwd',"密码不能为空").notEmpty()
		.isTooShort(6).withMessage("密码太短");
	req.checkBody('pwdRepeat').notEmpty()
		.isSame(req.body.pwd).withMessage('密码不一致')
	req.checkBody('email', '邮箱不能为空').notEmpty().isEmail().withMessage('邮箱不正确')
	req.checkBody('mobile', '手机号不能为空').notEmpty().isMobile().withMessage('手机号码不正确')
	req.checkBody('verifyCode',"验证码不能为空").notEmpty()
		.isEqual(req.session.imgCode).withMessage("验证码不正确");
	req.asyncValidationErrors().then(function(){
       		let codeObj =  emailCode(req.body.email)
			let params = req.body
			params.isLock = 1
			params.emailCode = codeObj.code // 生成随机码
		  User.create(req.body, (err, user) => {
			if (err) {
				console.error(err)
				req.flash("error",err.message)
				return res.redirect('/register')
			}
			let tpl = `<h4>欢迎你注册白石山农场</h4>
<p>请点击下面的连接完成注册</p>
<p><a href="http://www.bssfood.com/">激活用户</a>
<p>3个小时有效</p>
</p>`
            // mail.send(to, content, title)
			// 这里发送邮件给注册的用户
			// Mail.send(user.email, [tplName], user.emailCode)
			req.flash('success', '注册成功')
			return res.redirect('/login')
		})
	},function(errors){
		req.flash("error",errors[0].msg);
		return res.redirect('/register');
	});
})
router.get('/emailPwd/:code', (req, res, next) => {
	req.params.code
	// if()
	User.findByEmail(req.query.email, (err, user) => {
		if (!user) {
			return  next(new Error('无效的用户'))
		}
        if (validEmailCode(req.params.code, user.emailCode)) {
			req.session.changePwd = true
			req.session.userId = user._id
			res.render('emailPwd', {title: '重置密码'})
		}
	})
})
router.post('/emailPwd', (req, res, next) => {
	if(!req.session.changePwd) {
		return next(new Error('无效操作'))
	}
    req.checkBody('pwd',"密码不能为空").notEmpty()
        .isTooShort(6).withMessage("密码太短");
    req.checkBody('pwdRepeat').notEmpty()
        .isSame(req.body.pwd).withMessage('密码不一致')
    req.checkBody('verifyCode',"验证码不能为空").notEmpty()
        .isEqual(req.session.imgCode).withMessage("验证码不正确");
    req.asyncValidationErrors().then(function(){
        let params = req.body
		User.updateById(user._id, {
            pwd:req.body.pwd
		}, (err, user) => {
			if (err) return next(err)
            return res.redirect('/emailPwd?success=true')
		})
    },function(errors){
        req.flash("error",errors[0].msg);
        return res.redirect('/forget');
    });
})
router.get('/forget', (req, res) => {
	return res.render('forget', {title: '忘记密码'})
})
router.post('/forget', (req, res, next) => {
    req.checkBody('email', '邮箱不能为空').notEmpty().isEmail().withMessage('邮箱不正确')
    req.checkBody('verifyCode',"验证码不能为空").notEmpty()
        .isEqual(req.session.imgCode).withMessage("验证码不正确");
    req.asyncValidationErrors().then(function(){
        let params = req.body
		User.findByEmail(params.email, (err, user) => {
			if (!user) {
                req.flash("error", '邮箱不存在');
                return res.redirect('/forget');
			}
            let codeObj = emailCode(user.email)
			User.updateById(user._id, {
				emailCode:codeObj.code
			}, (err, user) => {
				// 发送邮件给用户
               let tpl = `<h4>白石山农场重置密码</h4>
<p>点击下方连接重新修改你的密码</p>
<p><a href="http://www.bssfood.com/emailPwd/${codeObj.md5Code}?email=${user.email}">重置密码</a></p><p>重置密码仅3小时有效，请尽快操作</p>`
                 mail.send(user.email, tpl, '白石山农场---密码重置').then(()=> {
                     return res.redirect('/forget?success=true')
				 })

			})
		})
    },function(errors){
        req.flash("error",errors[0].msg);
        return res.redirect('/forget');
    });
})
router.get('/logout', loginValid, (req,res)=>{
    req.session.user=null;
    return res.redirect('/');
})
module.exports = router;
