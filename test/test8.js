var moment = require('moment')
console.log(moment().startOf('day').fromNow());        // 1 天前
console.log(moment().endOf('day').fromNow());          // 28 分钟内
moment().startOf('hour').fromNow();       // 32 分钟前


console.log(moment().format('YYYY-MM-DD 00:00:00'))

console.log(moment().add(1, 'days').format('YYYY-MM-DD 00:00:00')); // 5
let {emailCode,md5, validEmailCode, loginValid, submitGoodsValid} = require('../utils/helper')
console.log(emailCode('278178596@qq.com'))
console.log(md5('28327,1528600839721,278178596@qq.com'))