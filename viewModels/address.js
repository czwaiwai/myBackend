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
exports.remove = function (userId, addressId, callback) {
	User.findById(userId,(err,user) => {
		var address = user.address.id(addressId)
		address.remove()
		user.save(callback)
	})
}
exports.update= function (userId, obj, callback) {
	User.findById(userId, (err,user) => {
		if (err) return callback(err)
		let address = user.address.id(obj._id)
		address.set(obj)
		user.save(function(err, user) {
			if (err) return callback(err)
			var addr = user.address.find(item => item._id === obj._id)
			callback(err, addr)
		})
	})
	// User.findOneAndUpdate(
	// 	{"_id": userId, 'address._id': obj._id},
	// 	{ $set: {
	// 		'address.$':obj
	// 	}},
	// 	callback
	// )
}

exports.findAllAddress = function (userId, callback) {
	User.findOne({_id:userId}, {address:1}, callback)
}