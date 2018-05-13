/**
 * Created by Administrator on 2018/4/14 0014.
 */
var models = require('../models')
var {formatFloat, getPageNum } =  require('../utils/tools')
var Order = models.Order
var Counters = models.Counters


exports.create = function (obj, callback) {
	var order = new Order(obj)
	console.log(order, '-----------------------')
	Counters.findOneAndUpdate({name:'order'},{$inc: {index:1}},{new: true, upsert: true}, (err, counter) => {
		if (err) return  callback(err)
		console.log(counter, ' --------counter----------')
		order.orderId = 5200000000 + counter.index
		order.save(callback)
	})
}

// 查询支付订单
exports.noPay = function (userId, callback) {
	var orders = Order.find({userId: userId, orderStatus: 10})
	orders.sort({create_at: -1})
	orders.exec(callback)
}

// 查询订单详情
exports.findById = function (id, callback) {
	Order.findById(id,callback)
}
exports.findByOrderId = function (orderId, callback) {
	Order.findOne({orderId: orderId}, callback)
}

// 修改为已支付
exports.savePay = function (orderId, obj, callback) {
	Order.findOne({orderId: orderId}, (err, order) => {
		order.pay_at = new Date()
		order.orderStatus = 20
		order.type = 'wx'
		order.payId = obj.transaction_id || ''
		order.openId = obj.openid
		order.realPrice = formatFloat(obj.total_fee/100)
		order.save(callback)
	})
}

// 退款中...
exports.refunding = function (orderId, obj, callback) {
	Order.findOne({orderId: orderId}, (err, order) => {
		if(err) return callback(err)
		order.refund_at = new Date()
		order.orderStatus = 12 // 退款中
		order.refundCurrPrice =  formatFloat(obj.refund_fee/100)
		order.refundPrice = formatFloat((order.refundPrice || 0 ) + order.refundCurrPrice)
		order.save(callback)
	})
}

// 修改为已退款
exports.refunded = function (orderId, obj, callback) {
	Order.findOne({orderId: orderId}, (err, order) => {
		if(err) return callback(err)
		order.out_at = new Date()
		if(order.refundPrice === order.realPrice) {
			order.orderStatus = 13 // 已全额退款
		} else {
			order.orderStatus = 21 // 部分退款
		}
		order.save(callback)
	})
}
// 取消订单
exports.cancelById = function (id, callback) {
	Order.findByIdAndUpdate(id, {orderStatus: 11}, {new:true}, callback)
}
// // 退款中
// exports.backAmtById = function (id, callback) {
// 	Order.findByIdAndUpdate(id, {orderStatus: 12}, {new:true}, callback)
// }
// // 已退款
// exports.backAmtByIdStore = function (id, callback) {
// 	Order.findByIdAndUpdate(id, {orderStatus: 13}, {new: true}, callback)
// }
// 改价
exports.changeAmtById = function (id, amt, callback) {
	Order.findById(id,(err,order) => {
		if(err) return callback(order)
		order.needPrice = formatFloat(amt)
		order.offerPrice = formatFloat((order.totalPrice + order.feePrice) - formatFloat(amt))
		order.offerType = '客户优惠'
		order.save(callback)
	})
}


// 按查询分页
exports.findAllByPage = function (query = {}, pageNum = 1,pageSize = 10, callback) {
	pageNum = parseInt(pageNum)
	pageSize = parseInt(pageSize)
	Order.count(query, (err,count) => {
		if (err) return callback(err)
		var order = Order.find(query)
		order.sort({create_at:-1})
		order.skip(pageSize*(pageNum-1))
		order.limit(pageSize)
		order.exec(function(err,res){
			if(err) return callback(err)
			callback(err,{
				orders:res,
				page:pageNum || 1,
				pageSize,
				total: count ,
				count: getPageNum(count,pageSize) || 1
			})
		})
	})
}