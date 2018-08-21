define(['jquery','underscore', 'layer', 'dialog'], function ($,_, layer, BootstrapDialog) {
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
			// @params  success | warning
			var icon = 1
			if (type === 'warning') {
				icon = 0
			}
			layer.msg( msg, {
				icon: icon,
				time: 2000
			})
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
	return BootstrapDialog
})