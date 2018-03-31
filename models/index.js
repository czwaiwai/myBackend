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
require('./catalog')
require('./articles')
require('./images')
exports.Page = mongoose.model('Page')
exports.User = mongoose.model('User')
exports.Catalog = mongoose.model('Catalog')
exports.Article = mongoose.model('Article')
exports.Image = mongoose.model('Image')