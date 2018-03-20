var mongoose = require('mongoose')
var Schema = mongoose.Schema
var catalog =  new Schema({
	name: {type: String},
	path: {type: String},
	shopName: {type: String},
	children: {type: Schema.Types.Mixed}
})