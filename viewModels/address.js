/**
 * Created by Administrator on 2018/4/11 0011.
 */
var models = require('../models')
var User = models.User
var Address = models.Address

exports.create = function (userId, obj, callback) {
	User.findById(userId,(err,user) => {
		console.log(user, 'user')
		let address = new Address(obj)
		user.address.push(address)
		console.log(address._id)
		user.save((err,user) => {
			if (err) return callback(err)
			callback(err,address,user)
		})
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
		user.save(function(err, subUser) {
			if (err) return callback(err)
			let addr = subUser.address.find(item => item._id === address._id)
			callback(err, addr, subUser)
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