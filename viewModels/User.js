var models = require('../models')
var User = models.User

exports.create = function (obj, callback) {
	var user =  new User(obj)
	user.save(callback)
}
exports.findAllByRegister = function (callback) {
	var users = User.find({isAdmin:0})
	users.sort({create_at:1})
	users.exec(callback)
}
exports.findByUserName = function (userName , callback) {
	User.findOne({userName:userName}, callback)
}