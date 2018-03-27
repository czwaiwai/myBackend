/**
 * Created by Administrator on 2018/3/27 0027.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema

var GoodSchema = new Schema({
	name: {type:String},
	subName: {type: String},
	imgs: {type:[String]},
})