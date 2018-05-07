var moment = require('moment');

moment.locale('zh-cn'); // 使用中文

// 格式化时间
exports.formatDate = function (date, friendly) {
	date = moment(date);

	if (friendly) {
		return date.fromNow();
	} else {
		return date.format('YYYY-MM-DD HH:mm');
	}

};
exports.getPageNum = function (count,pageSize){
	if (count%pageSize==0) { //转换成页数
		return  parseInt(count / pageSize)
	}
	return parseInt(count / pageSize) + 1
}

exports.formatFloat = function(f, digit = 2) {
	return Math.round(f*100)/100
	// var m = Math.pow(10, digit);
	// return parseInt(f * m, 10) / m;
}