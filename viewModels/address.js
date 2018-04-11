/**
 * Created by Administrator on 2018/4/11 0011.
 */
var models = require('../models')
var User = models.User

exports.create = function (userId, obj, callback) {
	User.findById(userId,(err,user) => {
		console.log(user, 'user')
		user.address.push(obj)
		user.save(callback)
	})
}