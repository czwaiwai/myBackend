var mongoose = require('mongoose')
var Schema = mongoose.Schema
var CounterSchema = new Schema({
	name:{type: String }, // 表名
	index: {type: Number, default: 0}, //子增值
})
CounterSchema.index({name:1},{ unique: true})
mongoose.model('Counters', CounterSchema)