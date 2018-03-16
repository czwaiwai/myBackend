var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/test')
var con = mongoose.connection
con.on('err',console.error.bind(console,'链接数据库失败'))
con.once('open',function() {
  console.log('链接成功')
})
