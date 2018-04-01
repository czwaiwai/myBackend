var models = require('../models')
var User = models.User
var getPageNum =  require('../utils/tools').getPageNum
exports.create = function (obj, callback) {
	var user =  new User(obj)
	user.save(callback)
}
exports.findAllByRegister = function (callback) {
	var users = User.find({isAdmin:0})
	users.sort({create_at:1})
	users.exec(callback)
}
exports.findById = function (id, callback) {
	User.findById(id, callback)
}
exports.findAndUpdate = function (id, obj, callback) {
	User.findByIdAndUpdate(id, obj, callback)
}
exports.findByUserName = function (userName , callback) {
	User.findOne({userName:userName}, callback)
}
exports.findAllByPage = function (pageNum = 1,pageSize = 10, callback) {
	pageNum = parseInt(pageNum)
	pageSize = parseInt(pageSize)
	User.count((err,count) => {
		if (err) return callback(err)
		var users = User.find({isAdmin:0})
		users.sort({create_at:-1})
		users.skip(pageSize*(pageNum-1))
		users.limit(pageSize)
		users.exec(function(err,users){
			if(err) return callback(err)
			callback(err,{
				users,
				page:pageNum,
				pageSize,
				total: count,
				count: getPageNum(count,pageSize)
			})
		})
	})
}