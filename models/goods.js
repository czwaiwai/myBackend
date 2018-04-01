/**
 * Created by Administrator on 2018/3/27 0027.
 */
var mongoose = require('mongoose')
var BaseModel = require("./baseModel");
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
	sellPrice: {type: Number}, // 卖出价格
	stock: {type: Number, default: 0}, //库存 默认为0
	sort: {type: Number}, // 商品排序
	isTop: {type: Number}, // 是否置顶
	isHot: {type: Number, default: 0}, // 是否 1：推荐商品 2：热卖商品 3:新品上市
	viewCount: {type: Number, default: 0}, // 访问次数
	sellCount: {type: Number, default: 0}, // 卖出数量
	onSale: {type: Number, default: 0}, // 上下架 0为下架 1为上架
	// isValid: {type: Number, default: 0}, // 是否有效
	isDelete: {type: Number, default: 0}, // 是否删除
	vars: {type: []}, // 规格  规格暂时不支持
	place: {type: String}, // 产地
	brands: {type: String}, //品牌名称
	create_at: {type: Date, default: Date.now},
	update_at: {type: Date, default: Date.now},
	content: {type: String},
},{collection:'goods'})

GoodSchema.plugin(BaseModel)
GoodSchema.pre('save', function (next) {
	this.update_at =  new Date()
	next()
})
mongoose.model('Goods', GoodSchema)