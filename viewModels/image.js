var models = require('../models')
var getPageNum =  require('../utils/tools').getPageNum
var fs = require('fs')
var Image = models.Image
exports.create = function (obj, callback) {
	let image = new Image(obj)
	image.save(callback)
}

exports.findAllByPage = function (query= {}, pageNum = 1,pageSize = 10, callback) {
	pageNum = parseInt(pageNum)
	pageSize = parseInt(pageSize)
	Image.count((err,count) => {
		if (err) return callback(err)
		var image = Image.find(query)
		image.sort({create_at:-1})
		image.skip(pageSize*(pageNum-1))
		image.limit(pageSize)
		image.exec(function(err,images){
			if(err) return callback(err)
			callback(err,{
				images,
				page:pageNum,
				pageSize,
				total: count,
				count: getPageNum(count,pageSize)
			})
		})
	})
}
exports.removeById = function (id, callback) {
	Image.findByIdAndRemove(id, (err, image) => {
		if (err) return callback(err)
		fs.unlink("public"+image.url)
		if (image.thumb && image.thumb.url) {
			fs.unlink('public' + image.thumb.url)
		}
		callback(err, image)
	})
}
exports.removeByUrl = function (url, callback) {
	Image.findOneAndRemove({url:url}, (err, image) => {
		if (err) return callback(err)
		fs.unlink("public"+image.url)
		if (image.thumb && image.thumb.url) {
			fs.unlink('public' + image.thumb.url)
		}
		callback(err, image)
	})
}