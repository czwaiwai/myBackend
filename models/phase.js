var mongoose = require('mongoose')
var BaseModel = require("./baseModel");
var Schema = mongoose.Schema
var PhaseSchema =  new Schema({
  title: {type: String},
  no: {type: String},
  step: {type: String}, // 00 01 02 03 04
  content: {type: String},
  intro: {type: String},
  url: {type: String}, // 扫码用的url
  lineShow: {type: String}, // all 00 01 02 03 04
  linkName: {type: String}, // 00|标题名称
  linkUrl: {type: String},
  status: {type: Number, default: 0}, // 是否有效,
  isDel: {type: Number, default: 0}, // 是否删除
	create_at: {type: Date, default: Date.now},
	update_at: {type: Date, default: Date.now},
}, {collection: 'phase'})
PhaseSchema.plugin(BaseModel)
PhaseSchema.index({title:1},{unique: true})
PhaseSchema.index({no:1},{unique: true})
PhaseSchema.pre('save', function (next) {
	this.update_at =  new Date()
	next()
})
mongoose.model('Phase', PhaseSchema)