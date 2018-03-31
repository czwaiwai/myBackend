var mongoose = require ('mongoose')
var Schema = mongoose.Schema
var BaseModel = require("./baseModel");
var ImageSchema = new Schema({
	name:{type: String},
	url:{type: String},
	width: {type: String},
	height: {type: String},
	type: {type: String},
	thumb: {
		name: {type: String},
		width: {type: Number},
		height: {type: Number},
		url: {type: String}
	},
	create_at:{type: Date, default: Date.now},
	update_at:{type: Date, default: Date.now},
}, {collection: 'image'})
ImageSchema.plugin(BaseModel)
ImageSchema.index({name:1},{ unique: true})
ImageSchema.pre('save', function (next) {
	this.update_at =  new Date()
	next()
})
mongoose.model('Image', ImageSchema)