var models = require('../models')
var getPageNum =  require('../utils/tools').getPageNum
var Goods = models.Goods
var {parallel} = require('async')
exports.create = function (obj, callback) {
	let goods = new Goods(obj)
	goods.save(callback)
}
exports.findAndUpdate = function (id, obj, callback) {
	Goods.findByIdAndUpdate(id, obj, callback)
}
exports.findById = function (id, callback) {
	Goods.findById (id, callback)
}
exports.findByIdAddView = function (id, callback) {
	Goods.findByIdAndUpdate(id, {$inc:{viewCount:1}}, callback)
}
exports.updateMoreByArr = function (goods, callback) {
	let arr = []
	goods.forEach(item => {
		// console.log(item)
		arr.push(function (callback) {
			// console.log(callback, 'callback ------------')
			Goods.findByIdAndUpdate(item.goodsId, {$inc: {stock: -item.num, sellCount: item.num}}, {new: true}, callback)
		})
	})
	parallel(arr, callback)
}
exports.removeById = function (id, callback) {
	Goods.findByIdAndRemove(id,callback)
}
exports.getHotGoods = function (query = {onSale:1}, callback) {
	var goods = Goods.find(query, {content:0}) // 填入条件
	// goods.limit(12)
	goods.sort({sort:1,catalogId:1,create_at:-1})
	goods.exec(callback)
}
exports.getHotGoodsByType = function (hotNum, limit = 4, callback) {
	var goods = Goods.find({isHot: hotNum, onSale:1})
	goods.limit(limit)
	goods.exec(callback)
}
exports.findByIds = function (ids, callback) {
	Goods.find({_id:{$in:[...ids]}},{content:0,imgs:0}, callback)
}
exports.findAllByPage = function (query = {}, pageNum = 1,pageSize = 10, callback) {
	pageNum = parseInt(pageNum)
	pageSize = parseInt(pageSize)
	Goods.count(query, (err,count) => {
		if (err) return callback(err)
		var goods = Goods.find(query, {content:0})
		goods.sort({sort:1,catalogId:1,create_at:-1})
		goods.skip(pageSize*(pageNum-1))
		goods.limit(pageSize)
		goods.exec(function(err,res){
			console.log(err, res, '------res----------')
			if(err) return callback(err)
			callback(err,{
				goods:res,
				page:pageNum,
				pageSize,
				total: count,
				count: getPageNum(count,pageSize)
			})
		})
	})
}