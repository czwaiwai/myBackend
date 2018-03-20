var mongoose = reuqire('mongoose')
var config = require('../config')
var mongoose.connect(config.db)

require('./users')
require('./page')
export.Page = mongoose.model('Page')
export.User = mongoose.model('User')