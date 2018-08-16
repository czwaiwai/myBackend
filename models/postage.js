/**
 * Created by Administrator on 2018/4/14 0014.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PostageSchema = new Schema({
	fee: {type: Number},
	isFreeRule: {type: Boolean, default: false}, // 是否开启满减
	feeRule: {type: Number, default: 0},  // 金额达到多少满减
	feeAmt: {type: Number, default: 0},   // 减为多少
	provinceId: {type: Number},
	province: {type: String},
	cityId: {type: Number},
	city: {type: String},
	isValid: {type: Boolean, default: false}
	// isDefault: {type: Boolean}
})
mongoose.model('Postage', PostageSchema)