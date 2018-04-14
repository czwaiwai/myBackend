/**
 * Created by Administrator on 2018/4/14 0014.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema
var DictSchema = new Schema({
	shopId:Schema.ObjectId,
	dist:{}
})
mongoose.model('Dict', DictSchema)