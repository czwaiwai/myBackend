/**
 * Created by Administrator on 2018/4/14 0014.
 */
var mongoose = require('mongoose')
var BaseModel = require("./baseModel");
var Schema = mongoose.Schema
var tools = require('../utils/tools');

var OrderSchema = new Schema({
	orderId: {type:Number}, // 订单id简化
	userId: {type: Schema.ObjectId}, // 用户ID
	orderStatus: {type: Number }, // 10 为待支付，11为已取消, 12退款中 13已完全退款 ，20为 已支付 ,21为部分退款, 30 为已发货 40 已完成
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
	openId: {type: String, default: ''}, // 微信用户openid
	postageId: {type: String, default: ''}, // 物流单号 -----
	postageName: {type: String}, // 物流公司名称
	totalNum: {type: Number}, // 总数量
	totalPrice: {type: Number}, // 商品总价
	feePrice: {type:Number, default: 0}, // 邮费
	offerPrice: {type: Number, default: 0}, // 优惠金额
	needPrice: {type: Number}, // 应付金额
	offerType: {type: String}, // 优惠方式
	realPrice: {type: Number}, //实际支付
	refundCurrPrice: {type: Number}, // 当次退款金额
	refundPrice: {type: Number}, // 退款总金额
	refunding: {type: Number}, // 表示申请退款状态 1:退款中... 0:无意义
	pay_at:{type:Date}, // 支付时间
	refund_at:{type:Date}, //退款申请时间
	out_at:{type:Date} // 退款完成时间
})
OrderSchema.plugin(BaseModel)
OrderSchema.plugin(function (schema) {
	schema.methods.pay_at_ago = function () {
		if(this.pay_at) {
			return tools.formatDate(this.pay_at, true);
		} else {
			return ''
		}
	}
})
//10 为待支付，11为已取消, 12 为已退款 ，20为 已支付, 30待发货 31 为已发货
OrderSchema.virtual('statusName').get(function() {
	let sTxt = ''
	switch (this.orderStatus) {
		case 10: sTxt = '未付款';break;
		case 11: sTxt = '已取消';break;
		case 12: sTxt = '退款中';break;
		case 13: sTxt = '已全额退款';break;
		case 20: sTxt = '已支付';break;
		case 21: sTxt = '已部分退款';break;
		case 30: sTxt = '已发货';break;
		case 40: sTxt = '已完成';break;
		// case 31: sTxt = '已发货';break;
		default: sTxt ='未知状态'
	}
	if (this.orderStatus === 20 && this.refunding === 1) {
		sTxt = '退款中'
	}
	return sTxt
})
OrderSchema.virtual('statusColor').get(function() {
	let sTxt = ''
	switch (this.orderStatus) {
		case 10: sTxt = 'text-danger';break;
		case 11: sTxt = 'text-muted';break;
		case 12: sTxt = 'text-muted';break;
		case 20: sTxt = 'text-success';break;
		case 30: sTxt = 'text-info';break;
		case 31: sTxt = 'text-info';break;
		case 40: sTxt = 'text-success';break;
		default: sTxt ='text-danger'
	}
	return sTxt
})
OrderSchema.pre('save', function (next) {
	this.update_at = Date.now
	next()
})
mongoose.model('Order', OrderSchema)