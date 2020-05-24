var mongoose = require('mongoose')
var Schema = mongoose.Schema
var RatingSchema =  new Schema({
	username: {type: String},
	mobile: {type: String},
	school: {type: String},
	phaseId: {type: Schema.ObjectId},
	phaseStat: {type: String},
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