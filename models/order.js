/**
 * Created by Administrator on 2018/4/14 0014.
 */
var mongoose = require('mongoose')
var BaseModel = require("./baseModel");
var Schema = mongoose.Schema

var OrderSchema = new Schema({
	orderId: {type:Number}, // 订单id简化
	userId: {type: Schema.ObjectId}, // 用户ID
	orderStatus: {type: Number }, // 10 为待支付，11为已取消, 12 为已退款 ，20为 已支付, 30待发货 31 为已发货
	create_at:{type:Date, default: Date.now},
	update_at:{type:Date, default: Date.now},
	goods: [{
		goodsId: {type:Schema.ObjectId},
		name: {type: String},      // 产品名称
		subName: {type: String},   // 规格名
		imgTmb: {type: String},    // 产品缩略图
		sellPrice: {type: String}, // 售卖的价格
		num: {type: Number}, // 售卖的数量
	}],
	address: {
		name:{type: String},
		mobile: {type: String},
		place: {type: String},
	},
	type: {type: String, default: 'wx'}, // 支付方式 'wx', 'ali'
	payId: {type: String, default: ''}, // 支付端信息编码 payId
	totalNum: {type: Number}, // 总数量
	totalPrice: {type: Number}, // 商品总价
	feePrice: {type:Number}, //邮费
	needPrice: {type: Number}, //应付金额
	pay_at:{type:Date}, // 支付时间
	out_at:{type:Date} // 退款时间
})
OrderSchema.plugin(BaseModel)
OrderSchema.pre('save', function (next) {
	this.updateTime = Date.now
	next()
})
mongoose.model('Order', OrderSchema)