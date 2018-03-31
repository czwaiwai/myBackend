var models = require('../models')
var fs = require('fs')
var Image = models.Image
exports.create = function (obj, callback) {
	let image = new Image(obj)
	image.save(callback)
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