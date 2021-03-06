/**
 * Created by Administrator on 2018/4/14 0014.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var DictSchema = new Schema({
	// shopId:Schema.ObjectId,
	name:{type: String }, // 属性名
	group: {type: String}, // 分组名
	nameCn: {type: String}, // 属性显示名
	isValid: {type: Number, default: 0}, // 属性是否有效， 1为有效
	valueType: {type: String},
	value: Schema.Types.Mixed, // 属性值
	// rule: {type: String},
})
DictSchema.index({name:1},{ unique: true})
mongoose.model('Dict', DictSchema)