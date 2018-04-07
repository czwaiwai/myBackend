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
	catalog.sort({calPath:1,sort:1})
	catalog.exec(function(err,catalogs){
		if(err) return callback(err,[])
		callback(err,showByRootTree(catalogs))
	})
}
function showByRootTree (catalogs) {
	let res = [];
	for(let i=0;i<catalogs.length;i++) {
		if (catalogs[i].deep === 0) {
			res.push(catalogs[i])
			continue
		}
		let index = res.findIndex(item => item.name  === catalogs[i].name)
		if(index === -1) {
			res.push(catalogs[i])
		}
		let tmp = []
		for(let j=i+1;j<catalogs.length;j++) {
			if(catalogs[j].deep>catalogs[i].deep && catalogs[j].calPath === catalogs[i].calPath+','+catalogs[i].name) {
				tmp.push(catalogs[j])
			}
		}
		if (tmp.length > 0) {
			let newIndex = res.findIndex(item => item.name === catalogs[i].name)
			Array.prototype.splice.apply(res, [newIndex+1, 0, ...tmp])
		}
	}
	return res
}
// 获取前端页面列表
exports.getFrontCatalog = function (callback) {
	var catalog = Catalog.find({shopName: 'mShop', calPath: ',root,front' })
	catalog.sort({calPath: 1,sort:1})
	catalog.exec(callback)
}
// 返回当前路径的子目录
exports.getChildrenByName = function (name,callback) {
	Catalog.findOne({name:name},function(err,catalog) {
		if(err) return callback(err)
		var catalogs = Catalog.find({calPath:catalog.calPath+','+name})
		catalogs.sort({sort:1})
		catalogs.exec(callback)
	})
}
// 返回当前路径所有子目录
exports.getChildrenByNameAll = function (name,callback) {
	Catalog.findOne({name:name},function(err,catalog) {
		if(err) return callback(err)
		var catalogs = Catalog.find({calPath: new RegExp('^'+catalog.calPath+','+name)})
		catalogs.sort({sort:1})
		catalogs.exec(function(err,catalogs){
			if(err) return callback(err,[])
			callback(err,showByRootTree(catalogs))
		})
	})
}
exports.findByName = function (name, callback) {
	Catalog.findOne({name:name},callback)
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