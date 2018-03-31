
var models = require('../models/')
var getPageNum =  require('../utils/tools').getPageNum
var Page = models.Page

exports.getPageByPathName = function (pathname, callback) {
  Page.findOne({path: pathname},callback)
}
exports.findAll = function (callback) {
  Page.find({}, callback)
}

exports.findAllByPage = function (pageNum = 1,pageSize = 10, callback) {
	pageNum = parseInt(pageNum)
	pageSize = parseInt(pageSize)
	Page.count((err,count) => {
		if (err) return callback(err)
		var page = Page.find({})
		page.sort({create_at:-1})
		page.skip(pageSize*(pageNum-1))
		page.limit(pageSize)
		page.exec(function(err,pages){
			if(err) return callback(err)
			callback(err,{
				pages,
				page:pageNum,
				pageSize,
				total: count,
				count: getPageNum(count,pageSize)
			})
		})
	})
}
exports.newPage = function (page, callback) {
  var newPage = new Page(page)
  newPage.save(callback)
}
exports.findById = function (id, callback) {
	Page.findById(id,callback)
}
exports.findAndUpdate = function (id, obj, callback) {
	Page.findByIdAndUpdate(id, obj, callback)
}
exports.removeById = function (id, callback) {
  Page.findByIdAndRemove(id,callback)
}