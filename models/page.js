var mongoose = require ('mongoose')
var Schema = mongoose.Schema
var BaseModel = require("./baseModel");
var PageSchema = new Schema({
	title:{type: String},
	path:{type: String},
	imgUrl: {type: String},
	content: {type: String},
	author: {type: String},
	is_vaild: {type: Boolean, default: true},
	read_count: {type: Number, default: 0},
	create_at:{type: Date, default: Date.now},
	update_at:{type: Date, default: Date.now},
})
PageSchema.plugin(BaseModel)
PageSchema.index({path:1},{ unique: true})
PageSchema.pre('save', function (next) {
	this.update_at =  new Date()
	next()
})
mongoose.model('Page', PageSchema)