/**
* 给所有的 Model 扩展功能
* http://mongoosejs.com/docs/plugins.html
*/
var tools = require('../utils/tools');

module.exports = function (schema) {
	schema.methods.create_at_ago = function () {
		return tools.formatDate(this.create_at, true);
	};

	schema.methods.update_at_ago = function () {
		return tools.formatDate(this.update_at, true);
	};
	schema.methods.bigImg = function () {
		if (this.imgUrl) {
			return this.imgUrl.replace(/_\$sma_[^.]+/,'')
		}
		return  ''
	}
};
