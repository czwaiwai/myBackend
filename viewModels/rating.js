var models = require('../models/')
var getPageNum =  require('../utils/tools').getPageNum
var Model = models.Rating
exports.findAll = function (params, callback) {
  Model.find(params, callback)
}
exports.findAllByPage = function (search = {}, pageNum = 1,pageSize = 10, callback) {
	pageNum = parseInt(pageNum)
	pageSize = parseInt(pageSize)
	Model.count(search,(err,count) => {
		if (err) return callback(err)
		var page = Model.find(search)
		// page.sort({create_at:-1})
		page.skip(pageSize*(pageNum-1))
		page.limit(pageSize)
		page.exec(function(err,list){
			if(err) return callback(err)
			callback(err,{
				list,
				page:pageNum,
				pageSize,
				total: count,
				count: getPageNum(count,pageSize)
			})
		})
	})
}
exports.insertMany =function(models, callback) {
  Model.insertMany(models,callback)
}
exports.newModel = function (page, callback) {
  var model = new Model(page)
  model.save(callback)
}
exports.findById = function (id, callback) {
	Model.findById(id,callback)
}
exports.findAndUpdate = function (id, obj, callback) {
	Model.findByIdAndUpdate(id, obj, callback)
}
exports.removeById = function (id, callback) {
  Model.findByIdAndRemove(id,callback)
}