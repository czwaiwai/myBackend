/**
 * Created by Administrator on 2018/4/14 0014.
 */
var models = require('../models/')
var getPageNum =  require('../utils/tools').getPageNum
var Postage = models.Postage
exports.findEqual = function (addr, callback) {
  let cityId = ''
	if (addr.cityId) {
		cityId = addr.cityId
	}
	Postage.find({provinceId:addr.provinceId,isValid:true}).or([
			{cityId: cityId},
			{cityId: null}
		]).sort({cityId:-1}).exec((err, postages) => {
		if(err) return callback(err)
		console.log(postages,'1111111111111111')
		if (postages && postages.length >0) {
			callback(err,postages[0])
		} else{
			callback(err,null)
		}
	})
}

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