/**
 * Created by waiwai on 17-12-1.
 */
let {formatFloat} = require('./tools')
let {Goods} = require('../viewModels')
module.exports.loginValid = function (req, res, next) {
	req.isAjax = false
	if (req.header('X-Requested-With') === 'XMLHttpRequest') {
		req.isAjax = true
	}
	if (req.session.user) {
		next()
	} else{
		if (req.isAjax) {
			return res.json({
				code:-1,
				message: '你还没有登录哦~',
				data: {}
			})
		}
		if(req.baseUrl === '/app') {
			return res.redirect('/app/login')
		}
		return res.redirect('/login')
	}
}
module.exports.isWeixin = function (useragent) {
	return /micromessenger/.test(useragent.toLocaleLowerCase())
}
module.exports.submitGoodsValid = function (req, res, next) {
	let goods = []
	if(formatFloat(req.body.needPrice) <= 0) return next(new Error('支付金额不一致1'))
	if(formatFloat(req.body.fee) <= 0) return next(new Error('支付金额不一致2'))
	if(formatFloat(parseFloat(req.body.totalPrice) + parseFloat(req.body.fee)) !== formatFloat(req.body.needPrice)) return next(new Error('支付金额不一致3'))
	try {
		goods = JSON.parse(req.body.goods)
	} catch (e) {
		return next(e)
	}
	if(!goods || goods.length === 0) return next(new Error('购买的商品不存在'))
	let goodsIds = []
	let goodTotal = 0
	goods.forEach((item) => {
		goodsIds.push(item.id)
		goodTotal += formatFloat(item.price * item.num)
	})
	goodTotal = formatFloat(goodTotal)
	if(formatFloat(goodTotal) !== formatFloat(req.body.totalPrice)) return next(new Error('支付金额不一致4'))
	Goods.findByIds(goodsIds, (err, realGoods) => {
		if(err) return next(err)
		if(realGoods.length !== goods.length) return next(new Error('商品数量不一致5'))
		let vaild = true
		let valTotal = 0
		realGoods.forEach(item => {
			var goodsOne = goods.find(sub => sub.id === item._id.toString())
			vaild = vaild && formatFloat(item.sellPrice) === formatFloat(goodsOne.price)
			valTotal += formatFloat(item.sellPrice * goodsOne.num)
		})
		valTotal = formatFloat(valTotal)
		if(valTotal !== formatFloat(req.body.totalPrice)) return next(new Error('支付金额不一致6'))
		if(vaild && valTotal === goodTotal) {
			next()
		} else {
			return next(new Error('支付金额不一致7'))
		}
	})
}