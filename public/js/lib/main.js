define(['jquery','underscore','bootoast', 'layer'], function ($,_,bootoast, layer) {
	console.log(layer)


	_.templateSettings = {
		evaluate    : /<@([\s\S]+?)@>/g,
		interpolate : /<@=([\s\S]+?)@>/g,
		escape      : /<@-([\s\S]+?)@>/g
	};
	function guidGenerator() {
		var S4 = function() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		};
		return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
	}
	$.extend({
		guidGenerator:guidGenerator,
		Toast:function(msg,type){
			layer.msg( msg, {
				time: 2000 //2秒关闭（如果不配置，默认是3秒）
			});
			// bootoast({
			// 	message: msg,
			// 	type:type || 'success',
			// 	timeout:2,
			// 	position:'top-center',
			// });
		},
		formatFloat:  function(f, digit) {
			return Math.round(f*100)/100
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
	var $flashAlert = $('#flashAlert')
	if($flashAlert && $flashAlert[0]) {
		setTimeout(function(){
			$flashAlert.remove();
		},2500)
	}
	$.ajaxSetup({
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		},
		error: function (res, body, err) {
			if(res.responseJSON) {
				console.log(res.responseJSON.message)
				$.Toast(res.responseJSON.message, 'warning')
			}
		}
	})
})