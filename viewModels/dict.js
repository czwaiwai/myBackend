var models = require('../models')
var Dict = models.Dict
exports.create = function (obj, callback) {
	let dict =  new Dict(obj)
	dict.save(obj, callback)
}

exports.findByGroup = function (group, callback) {
	Dict.find({group:group},callback)
}

exports.findAll = function (callback) {
	Dict.find({}, callback)
}
exports.update = function (id, obj, callback) {
	Dict.findByIdAndUpdate(id, obj, callback)
}
exports.remove = function (id, callback) {
	Dict.findByIdAndRemove(id, callback)
}
