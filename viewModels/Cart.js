var models = require('../models')
var User = models.User

exports.create = function (userId, obj, callback) {
	var user =  User.findById(userId)
	user.cart.create(obj)
	user.save(callback)
}