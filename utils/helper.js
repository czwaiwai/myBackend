/**
 * Created by waiwai on 17-12-1.
 */
let {formatFloat} = require('./tools')
let crypto = require('crypto');
let {Goods} = require('../viewModels')
function md5 (str){
    return crypto.createHash('md5').update(str, 'utf8').digest('hex')
}
exports.emailCode = function (email) {
	let time = (new Date()).getTime()
    let rand = parseInt(Math.random()*90000+10000)
	let codeStr = rand+','+time + ',' + email
  	return {
		code:codeStr,
		md5Code: md5(codeStr)
	}
}
exports.md5 = md5
exports.validEmailCode = function (email, receiveCode, userCode) {
	if (!userCode) return false
	if (!email) return false
	if(userCode && receiveCode === md5(userCode)) {
	  let arr = userCode.split(',')
		if (arr.length !== 3) return false
		let em = arr[2]
		if (em !== arr[2]) return false
		let time = arr[1]
	  let now = (new Date()).getTime()
	  if ((now - time) < 60*60*3*1000 ) {  // 小于3个小时才能通过
	  	return true
	  } else {
	  	console.log('过了3个小时,验证失效了')
	  	return false
	  }
	  //大于3个小时记为失效
	} else {
		return false
	}
}
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
	if(formatFloat(req.body.fee) < 0) return next(new Error('支付金额不一致2'))
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
		let vaildStock = true
		let vaildSotckMsgArr = []
		let valTotal = 0
		realGoods.forEach(item => {
			var goodsOne = goods.find(sub => sub.id === item._id.toString())
			if (goodsOne.num > item.stock) {
                vaildSotckMsgArr.push(goodsOne)
			}
            vaildStock = vaildStock && parseInt(goodsOne.num) <= parseInt(item.stock)
			vaild = vaild && formatFloat(item.sellPrice) === formatFloat(goodsOne.price)
			valTotal += formatFloat(item.sellPrice * goodsOne.num)
		})
		if(!vaildStock) {
			return next(new Error('商品'+vaildSotckMsgArr[0].name + '库存不足'))
		}
		valTotal = formatFloat(valTotal)
		if(valTotal !== formatFloat(req.body.totalPrice)) return next(new Error('支付金额不一致6'))
		if(vaild && valTotal === goodTotal) {
			next()
		} else {
			return next(new Error('支付金额不一致7'))
		}
	})
}