var mongoose = require('mongoose')
var Schema = mongoose.Schema
var RatingSchema =  new Schema({
	username: {type: String}, // 姓名
	mobile: {type: String}, // 手机号
	school: {type: String}, // 学校全称
	grade: {type: String}, // 年级
	enterNo: {type: String}, // 考号
	teacher: {type: String}, // 指导老师
	phaseId: {type: Schema.ObjectId}, // 赛事活动id
	phaseStat: {type: String}, // 01|02|03|04 初评|复评|半决选|总决选
	joinStat: {type: String, default: '线上'}, // 参与方式 线上|线下
	score: {type: Number, default: 0}, // 成绩
	isUp: {type: String, default: ''}, // 是否晋级
	step01: {type: Number},
	isUp01: {type: String , default:''},
	step02: {type: Number},
	isUp02: {type: String , default:''},
	step03: {type:Number},
	isUp03: {type: String , default:''},
	step04: {type: Number},
	isUp04: {type:String, default:''},
	other: Schema.Types.Mixed,
	create_at: {type: Date, default: Date.now},
	update_at: {type: Date, default: Date.now},
}, {collection: 'rating'})

RatingSchema.index({username:1})
RatingSchema.index({mobile:1})
mongoose.model('Rating', RatingSchema)