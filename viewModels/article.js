var models = require('../models')
var Article = models.Article

exports.getListByCatalogPath = function (catalogName, callback) {
	var article = Article.find({catalogName})
	article.sort({create_at:1})
	article.exec(callback)
}

exports.create = function (obj, callback) {
	var article = new Article(obj)
	article.save(callback)
}