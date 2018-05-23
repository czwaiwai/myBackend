var models = require('../models')
var Article = models.Article
var getPageNum =  require('../utils/tools').getPageNum
exports.getListByCatalogPath = function (catalogName, callback) {
	var article = Article.find({catalogName})
	article.sort({create_at:1})
	article.exec(callback)
}
exports.findById = function (id, callback) {
	Article.findById(id, callback)
}
exports.findTopArticle =function (catalogName, limit = 5, callback) {
	console.log(limit)
	if(typeof limit === 'function') {
		callback = limit
		limit = 5
	}
	console.log(callback,limit)
	var article = Article.find({catalogName:catalogName,isHot:1},{title:1,imgUrl:1})
	article.sort({read_count:-1,create_at:-1})
	article.limit(limit)
	article.exec(callback)
}
exports.findByIdAddView = function (id, callback) {
	Article.findByIdAndUpdate(id, {$inc:{read_count:1}}, callback)
}
exports.findAllByPageCatalogs = function (catalogName,pageNum = 1,pageSize = 10, callback) {
	pageNum = parseInt(pageNum)
	pageSize = parseInt(pageSize)
	Article.count((err,count) => {
		if (err) return callback(err)
		var articles = Article.find({catalogName})
		articles.sort({create_at:-1})
		articles.skip(pageSize*(pageNum-1))
		articles.limit(pageSize)
		articles.exec(function(err,articles){
			if(err) return callback(err)
			callback(err,{
				articles,
				page:pageNum,
				pageSize,
				total: count,
				count: getPageNum(count,pageSize)
			})
		})
	})
}
exports.removeById = function (id, callback) {
	Article.findByIdAndRemove(id,callback)
}
exports.findAndUpdate = function (id, obj, callback) {
	Article.findByIdAndUpdate(id, obj, callback)
}
exports.create = function (obj, callback) {
	var article = new Article(obj)
	article.save(callback)
}