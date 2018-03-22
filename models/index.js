var mongoose = require('mongoose')
var config = require('../config')
mongoose.connect(config.db, {}, function(err){
  if (err) {
    return console.error(err)
  }
  console.log('链接成功')
})
require('./users')
require('./page')
exports.Page = mongoose.model('Page')
exports.User = mongoose.model('User')