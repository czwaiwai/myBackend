var models = require('../models/')
var Page = models.Page

exports.getPageByPathName = function (pathname, callback) {
  Page.findOne({path: pathname},callback)
}
exports.findAll = function (callback) {
  Page.find({}, callback)
}
exports.newPage = function (page, callback) {
  console.log(page)
  var newPage = new Page(page)
  console.log(newPage)
  newPage.save(callback)
}