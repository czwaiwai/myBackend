/**
 * Created by Administrator on 2018/3/27 0027.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var GoodSchema = new Schema({
	name: {type:String},
	subName: {type: String},
	imgTmb: {type: String},
	imgs: {type:[String]},
	catalogId: {type: Schema.ObjectId},
	catalogPath: {type: String}, // 商品所在类目
	tag: {type: [String]},
	virPrice: {type: String}, // 参考价格
	sort: {type: Number}, // 商品排序
	isTop: {type: Number, default: 0}, // 是否推荐
	isHot: {type: Number, default: 0}, // 热门商品
	viewCount: {type: Number, default: 0}, // 访问次数
	sellCount: {type: Number, default: 0}, // 卖出数量
	onSale: {type: Number, default: 0}, // 上下架
	isValid: {type: Number, default: 0}, // 是否有效
	isDelete: {type: Number, default: 0}, // 是否删除
	vars: {type: []}, // 规格
	place: {type: String}, // 产地
	postage: {type: Number},
	create_at: {type: Date, default: Date.now},
	update_at: {type: Date, default: Date.now},
	content: {type: String},
})