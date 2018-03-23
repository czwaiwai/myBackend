/**
 * Created by Administrator on 2018/3/23 0023.
 */
var models = require('../models')
var Catalog = models.Catalog

exports.getCatalogByShopName = function (shopName, path, callback) {
	Catalog.find({shopName:shopName,calPath:path}, callback)
}
exports.create = function (obj, callback) {
	var catalog = new Catalog(obj)
	catalog.save(callback)
}