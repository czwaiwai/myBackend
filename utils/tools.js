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