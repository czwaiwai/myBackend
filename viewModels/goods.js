var models = require('../models')
var getPageNum =  require('../utils/tools').getPageNum
var Goods = models.Goods

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
exports.findAllByPage = function (findObj = {}, pageNum = 1,pageSize = 10, callback) {
	pageNum = parseInt(pageNum)
	pageSize = parseInt(pageSize)
	Goods.count((err,count) => {
		if (err) return callback(err)
		var goods = Goods.find(findObj)
		goods.sort({create_at:-1})
		goods.skip(pageSize*(pageNum-1))
		goods.limit(pageSize)
		goods.exec(function(err,res){
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