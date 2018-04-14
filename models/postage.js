/**
 * Created by Administrator on 2018/4/14 0014.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PostageSchema = new Schema({
	fee: {type: Number},
	province: {type: String},
	city: {type: String},
	isDefault: {type: Boolean}
})
mongoose.model('Postage', PostageSchema)