var models = require('../models')
var getPageNum =  require('../utils/tools').getPageNum
var Dict = models.Dict
exports.create = function (obj, callback) {
	let dict =  new Dict(obj)
	dict.save(obj, callback)
}

exports.findByGroup = function (group, callback) {
	Dict.find({group:group},callback)
}
exports.findByName = function (name, callback) {
	Dict.findOne({name:name}, callback)
}
exports.findById = function (id, callback) {
	Dict.findById(id, callback)
}

exports.findAll = function (callback) {
	Dict.find({}, callback)
}
exports.update = function (id, obj, callback) {
	Dict.findByIdAndUpdate(id, obj, callback)
}
exports.remove = function (id, callback) {
	Dict.findByIdAndRemove(id, callback)
}
exports.findAllByPage = function (pageNum = 1,pageSize = 10, callback) {
	pageNum = parseInt(pageNum)
	pageSize = parseInt(pageSize)
	Dict.count((err,count) => {
		if (err) return callback(err)
		var dict = Dict.find({})
		dict.sort({_id:-1})
		dict.skip(pageSize*(pageNum-1))
		dict.limit(pageSize)
		dict.exec(function(err,dicts){
			if(err) return callback(err)
			callback(err,{
				dicts,
				page:pageNum,
				pageSize,
				total: count,
				count: getPageNum(count,pageSize)
			})
		})
	})
}
