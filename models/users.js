var mongoose = require('mongoose')
var Schema = mongoose.Schema
var UserSchema = new Schema({
	username: {type: String}, // 登录用户名
	pwd: {type: String}, // 密码
	isAdmin: {type: Number, default: 0},
	isLock: {type: Number, default: 0},
	email: {type: String}, // 邮件
	headImg: {type: String}, // 图片url
	nickname: {type: String}, // 昵称
	realname: {type: String}, // 真实姓名
	token: {type: String},
	card_id: {type: String}, // 用户证件
	mobile: {type: String}, // 手机号吗
	cart: {type: []},
	address: {type: []}, // 地址
	create_at: {type: Date , default: Date.now},
	update_at: {type: Date , default: Date.now},
}, {collection: 'user'})
UserSchema.index({user_name: 1}, {unique: true})
UserSchema.index({mobile: 1}, {unique: true})
UserSchema.pre('save', function (next) {
	this.updateTime = Date.now
	next()
})
mongoose.model('User',UserSchema)