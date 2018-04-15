var models = require('../models')
var User = models.User

exports.create = function (userId, obj, callback) {
	User.findById(userId,(err,user) => {
		console.log(user, 'user')
		user.cart.push(obj)
		user.save(callback)
	})
}
exports.checkAll = function (userId, bool, callback) {
	User.findOneAndUpdate({_id: userId},
		{$set:{'cart.isCheck':bool}},
		{new:true},
		callback)
}
exports.changeCheck = function (userId, cartObj, callback) {
	User.findOneAndUpdate({_id: userId, 'cart._id': cartObj.id},
		{$set:{"cart.$.isCheck":cartObj.check}},
		{new:true},
		callback
	)
}
exports.changeNum = function (userId, cartObj, callback) {
	User.findOneAndUpdate({_id: userId, 'cart._id': cartObj.id},
		{$set:{"cart.$.goodsNum":cartObj.num}},
		{new:true},
		callback
		)
}
exports.add2Update = function (userId, cart, callback) {
	User.findOne({_id: userId, 'cart.goodsId': cart.goodsId},{"cart.$":1}, (err, carts) => {
		if (err) callback(err)
		console.log(carts,' carts - - - - - - ')
		if (!carts) {
			User.findOneAndUpdate({_id: userId},
				{$push:{'cart': cart}}, {new: true}, callback)
		} else {
			User.findOneAndUpdate({_id:userId, 'cart.goodsId': cart.goodsId},
				{$inc: {"cart.$.goodsNum": cart.goodsNum}}, {new:true}, callback)
		}
	})
}
exports.removeOne = function (userId, goodsId, callback) {
	User.findByIdAndUpdate(userId,
		{$pull:{ 'cart': {goodsId:goodsId}}},
		{new:true},
		callback
	)
}
exports.clear = function (userId, callback) {
	User.findByIdAndUpdate(userId,{$set:{cart:[]}},{new:true},callback)
}
exports.updateNum = function (userId, goodsId, num, callback) {
	User.findOneAndUpdate({_id:userId, 'cart.goodsId': goodsId},
		{$inc: {"cart.$.goodsNum": num}}, callback)
}