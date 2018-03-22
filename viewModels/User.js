var models = require('../models')
var User = models.User

exports.create = function (obj, callback) {
	var user =  new User(obj)
	user.save(callback)
}
exports.findByUserName = function (userName , callback) {
	User.findOne({userName:userName}, callback)
}