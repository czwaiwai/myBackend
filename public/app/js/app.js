/**
 * Created by Administrator on 2018/5/3 0003.
 */

(function($) {
	_.templateSettings = {
		evaluate    : /<@([\s\S]+?)@>/g,
		interpolate : /<@=([\s\S]+?)@>/g,
		escape      : /<@-([\s\S]+?)@>/g
	}
	$.extend({
		formatFloat:  function(f, digit) {
			var m = Math.pow(10, digit || 2);
			return parseInt(f * m, 10) / m;
		}
	})
})(jQuery)
