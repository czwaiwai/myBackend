var mongoose = require ('mongoose')
var Schema = mongoose.Schema
var BaseModel = require("./baseModel");
var ArticleSchema = new Schema({
	title:{type: String},
	subTitle: {type: String},
	catalog: {type: Schema.ObjectId},
	catalogName: {type: String},
	catalogPath: {type: String},
	imgUrl: {type: String}, // 相关图片
	isTop: {type: Number, default: 0 }, // 置顶
	isHot: {type: Number, default: 0 }, // 热门
	content: {type: String}, // 内容
	author: {type: String},  // 作者
	tag: {type: [] }, // 标签
	is_vaild: {type: Boolean, default: true}, //是否有效
	read_count: {type: Number, default: 0}, // 访问次数
	create_at:{type: Date, default: Date.now},
	update_at:{type: Date, default: Date.now},
})
ArticleSchema.plugin(BaseModel)
ArticleSchema.pre('save', function (next) {
	this.update_at =  new Date()
	next()
})
mongoose.model('Article', ArticleSchema)