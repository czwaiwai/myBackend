/**
 * Created by Administrator on 2018/3/23 0023.
 */
var models = require('../models')
var Catalog = models.Catalog

exports.getCatalogByShopName = function (shopName, path, callback) {
	Catalog.find({shopName:shopName,calPath:path}, callback)
}
exports.getCatalogMenu = function (callback) {
	var catalog = Catalog.find({shopName:'mShop'})
	catalog.sort({calPath:1})
	catalog.exec(callback)
}
// 获取前端页面列表
exports.getFrontCatalog = function (callback) {
	var catalog = Catalog.find({shopName: 'mShop', calPath: /^,root,front/ })
	catalog.sort({calPath: 1})
	catalog.exec(callback)
}

exports.findByTpl = function (useTpl, callback) {
	var catalog = Catalog.find({useTpl, shopName: 'mShop'})
	catalog.sort({calPath:1})
	catalog.exec(callback)
}

exports.removeById = function (id, callback) {
	Catalog.findByIdAndRemove(id,callback)
}
exports.findAndUpdate = function (id, obj, callback) {
	Catalog.findByIdAndUpdate(id, obj, callback)
}
exports.create = function (obj, callback) {
	var catalog = new Catalog(obj)
	catalog.save(callback)
}