/**
 * Created by Administrator on 2018/4/14 0014.
 */
var models = require('../models/')
var getPageNum =  require('../utils/tools').getPageNum
var Postage = models.Postage

exports.findByAddr = function (addr, callback) {
	Postage.find(addr, callback)
}
exports.findAll = function (callback) {
	Postage.find(callback)
}
exports.findById = function (id, callback) {
	Postage.findById(id, callback)
}
exports.update = function (id,obj,callback) {
	Postage.findByIdAndUpdate(id, obj, callback)
}
exports.create = function (obj, callback) {
	var postage = new Postage(obj)
	postage.save(callback)
}
exports.remove = function (id, callback) {
	Postage.findByIdAndRemove(id, callback)
}