/**
 * Created by Administrator on 2018/4/14 0014.
 */
var models = require('../models')
var getPageNum =  require('../utils/tools').getPageNum
var Order = models.Order


exports.create = function (obj, callback) {
	var order = new Order(obj)
	order.save(callback)
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

// 取消订单
exports.cancelById = function (id, callback) {
	Order.findByIdAndUpdate(id, {orderStatus: 11}, {isNew:true}, callback)
}
// 退款中
exports.backAmtById = function (id, callback) {
	Order.findByIdAndUpdate(id, {orderStatus: 12}, {isNew:true}, callback)
}
// 已退款
exports.backAmtByIdStore = function (id, callback) {
	Order.findByIdAndUpdate(id, {orderStatus: 13}, {isNew: true}, callback)
}
// 改价
exports.changeAmtById = function (id, amt, callback) {
	Order.findByIdAndUpdate(id, {orderStatus: 13}, {isNew: true}, callback)
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