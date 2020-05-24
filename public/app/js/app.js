/**
 * Created by Administrator on 2018/5/3 0003.
 */

(function($) {
	FastClick.attach(document.body);
	// _.templateSettings = {
	// 	evaluate    : /<@([\s\S]+?)@>/g,
	// 	interpolate : /<@=([\s\S]+?)@>/g,
	// 	escape      : /<@-([\s\S]+?)@>/g
	// }
	$.extend({
		formatFloat:  function(f, digit) {
			return Math.round(f*100)/100
			// var m = Math.pow(10, digit || 2);
			// return parseInt(f * m, 10) / m;
		}
	})
	$.ajaxSetup({
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		},
		error: function(err) {
			if(err.responseJSON) {
				$.toast(err.responseJSON.message,'cancel')
			}
		}
	})
	var $cartBadge = $('#cartBadge')
	if($cartBadge && $cartBadge[0]) {
		$cartBadge.bind('change.cartBadge',function(e, num){
			console.log(e,num)
			var $this = $(this)
			if(num > 0){
				$this.removeClass('hide').show()
				$this.text(num)
			} else {
				$this.hide()
			}
		})
	}
	var $backBtn = $('.back_btn')
	if ($backBtn && $backBtn[0]) {
		$backBtn.on('click', function () {
			setTimeout(function () {
				location.href = '/app/index'
			}, 250)
		})
	}
})(jQuery)
