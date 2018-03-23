var mongoose = require('mongoose')
var Schema = mongoose.Schema
var CatalogSchema =  new Schema({
	nameCn: {type: String},
	name: {type: String},
	calPath: {type: String, default: null},
	shopName: {type: String},
	relativeUrl: {type: String},
	useTpl: {type: String},
	isValid: {type: Number , default: 0 },
	sort: {type: Number, default: 100}
}, {collection: 'catalog'})

CatalogSchema.index({shopName:1},{unique: true})

mongoose.model('Catalog', CatalogSchema)