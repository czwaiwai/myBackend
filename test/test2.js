/**
 * Created by Administrator on 2018/3/21 0021.
 */
var mongoose = require ('mongoose')
var config = require('../config')
mongoose.connect(config.db, {}, function(err){
	if (err) {

	}
	console.log('链接成功')
})
var Schema = mongoose.Schema
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
PageSchema.pre('save', function (next) {
	this.update_at =  new Date()
	next()
})
var Page = mongoose.model('Page', PageSchema)
var page = new Page({
	title:'哈哈哈',
	path: 'about',
	content: 'dfjlsdjfklsddsfklsdflsd sdfjsdklfsd'
})
page.save(function(err, page){
	if(err) {
		console.log(err)
	}
	console.log('插入成功', page)
})