var models = require('../models')
var User = models.User
var getPageNum =  require('../utils/tools').getPageNum
var moment = require('moment')
exports.getInstance = function (obj) {
	return new User(obj)
}

exports.create = function (obj, callback) {
	var user =  new User(obj)
	user.save(callback)
}
exports.saveById = function (id, obj, callback) {
	User.findById(id,(err, user) => {
		if (err) return callback(err)
		user.set(obj)
		user.save(callback)
	})
}
exports.updateById = function (id, obj, callback) {
	User.findByIdAndUpdate(id, obj, {new: true}, callback)
}
exports.findByEmail = function (email, callback) {
	User.findOne({email:email}, callback)
}

// 用户总数
exports.userCount = function (callback) {
	User.count({isAdmin:0},callback)
}
exports.todayCount = function (callback) {
	var before = moment().format('YYYY-MM-DD 00:00:00')
	var after = moment().add(1, 'days').format('YYYY-MM-DD 00:00:00')
	User.count({isAdmin:0, create_at: {$gte:new Date(before),$lte:new Date(after)}},callback)
}

exports.findByOpenId = function(openId, callback) {
	User.findOne({openId:openId},callback)
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