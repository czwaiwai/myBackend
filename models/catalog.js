var mongoose = require('mongoose')
var Schema = mongoose.Schema
var CatalogSchema =  new Schema({
	nameCn: {type: String},
	name: {type: String},
	imgUrl: {type: String},
	calPath: {type: String, default: null},
	deep: {type: Number, default: 1}, //深度
	shopName: {type: String},
	relativeUrl: {type: String},
	useTpl: {type: String},
	isValid: {type: Number , default: 0 },
	sort: {type: Number, default: 100}
}, {collection: 'catalog'})

CatalogSchema.virtual('deepStr').get(function () {
	return Array(this.deep).fill('---').join('')
})
CatalogSchema.virtual('parent').get(function() {
	return this.calPath.replace(/,[^,]+$/,'')
})
CatalogSchema.index({name:1},{unique: true})
CatalogSchema.index({calPath:1})
mongoose.model('Catalog', CatalogSchema)