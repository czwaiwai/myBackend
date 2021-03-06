var mongoose = require('mongoose')
var BaseModel = require("./baseModel");
var Schema = mongoose.Schema
var AddressSchema = new Schema({
	name: {type: String},
	mobile: {type: String},
	isDefault: {type: Number},
	address: {type: String},
	provinceId: {type: Number},
	province: {type:String},
	cityId: {type: Number},
	city: {type: String},
	areaId: {type: Number},
	area: {type: String}
})
var CartSchema = new Schema({
	goodsId: {type: Schema.ObjectId}, // 产品Id
	goodsName: {type: String}, // 产品名称
	goodsSubName: {type: String}, // 产品sub名称
	imgUrl: {type: String}, // 图片
	goodsNum: {type: Number, default:1}, //数量
	isCheck: {type: Boolean, default: false}, // 是否选中
	price: {type: Number}, // 单价
})
CartSchema.plugin(function(schema) {
	schema.methods.smallAllPrice = function () { // 小计
		return this.goodsNum * this.price
	}
	schema.methods.realPrice = function () { // 实付
		return this.goodsNum * this.price
	}
})
var UserSchema = new Schema({
	userName: {type: String}, // 登录用户名
	pwd: {type: String, default:''}, // 密码
	isAdmin: {type: Number, default: 0},
	isLock: {type: Number, default: 0},
	email: {type: String}, // 邮件
	emailCode: {type: String}, // 邮件激活码 随机数字 + 时间戳
	sex: {type:Number}, // 0 女 1男
	headImg: {type: String, default: '' }, // 图片url
	nickname: {type: String, default:''}, // 昵称
	realname: {type: String}, // 真实姓名
	card_id: {type: String}, // 用户证件
	mobile: {type: String}, // 手机号吗
	cart: {type: [CartSchema]},
	openId: {type: String}, // 微信OpenID
	token: {type: String},    // 微信access_token
	address: {type: [AddressSchema]}, // 地址
	create_at: {type: Date , default: Date.now},
	update_at: {type: Date , default: Date.now},
}, {collection: 'user'})
UserSchema.plugin(BaseModel)
UserSchema.plugin(function(schema){
	schema.methods.getCartNum = function() {
		return this.cart.reduce((before,item) => {
			 return before + item.goodsNum
		},0)
	}
})
UserSchema.index({userName: 1}, {unique: true, sparse: true})
UserSchema.index({mobile: 1}, {unique: true, sparse: true})
UserSchema.index({email: 1}, {unique: true, sparse: true})
UserSchema.index({openId:1}, {unique: true, sparse: true})
UserSchema.pre('save', function (next) {
	this.update_at = Date.now
	next()
})
mongoose.model('Cart',CartSchema)
mongoose.model('Address',AddressSchema)
mongoose.model('User',UserSchema)