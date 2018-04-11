/**
 * Created by waiwai on 17-7-12.
 **/
_.templateSettings = {
	evaluate    : /<@([\s\S]+?)@>/g,
	interpolate : /<@=([\s\S]+?)@>/g,
	escape      : /<@-([\s\S]+?)@>/g
};
jQuery(function(){

    function guidGenerator() {
        var S4 = function() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    }

    $.extend({
        guidGenerator:guidGenerator,
    });
	  BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_PRIMARY] = '提示';
    BootstrapDialog.DEFAULT_TEXTS['OK'] = '确定'
    BootstrapDialog.DEFAULT_TEXTS['CANCEL'] = '取消'
	  // BootstrapDialog.DEFAULT_TEXTS['CONFIRM'] = '提示'
    $.extend({
        confirmSubmit:function(message,callback,options){
            var option=options || {};
            BootstrapDialog.show({
                title: option.title || "提示",
                message: message,
                buttons: [{
                        label: '取消',
                        action: function(dialog) {
                            dialog.close();
                        }
                    },
                    {
                    label: '确定',
                    cssClass:"btn-primary",
                    action: function(dialog) {
                        var $button = this;
                        $button.spin();
                        $button.disable();
                        callback(function(){
                            dialog.close();
                        },dialog,$button);
                    }
                }]
            });
        },
				Toast:function(msg,type){
					bootoast({
						message: msg,
						type:type || 'success',
						timeout:2,
						position:'top-center',
					});
				},
				formatFloat:  function(f, digit) {
					var m = Math.pow(10, digit || 2);
					return parseInt(f * m, 10) / m;
				}
    })



    // $.guidGenerator=guidGenerator;
    // console.log($.guidGenerator(),"-----");
	
	var $cartBadge = $('#cartBadge')
	if($cartBadge && $cartBadge[0]) {
		$cartBadge.bind('change.cartBadge',function(e, num){
			console.log(e,num)
			var $this = $(this)
			if(num > 0){
				$this.show()
				$this.text(num)
			} else {
				$this.hide()
			}
		})
	}
	$.validator.setDefaults({
		errorLabelContainer:'.form-error',
		onkeyup: false,
		rules:{},
		messages:{},
		highlight: function ( element, errorClass, validClass ) {
			$( element ).closest('.form-group').addClass( "has-error" ).removeClass( "has-success" );
		},
		unhighlight: function (element, errorClass, validClass) {
			$( element ).closest('.form-group').addClass( "has-success" ).removeClass( "has-error" );
		},
		showErrors:function(errorMap, errorList){
			this.defaultShowErrors();
			if($('#back-error')[0]){
				$('#back-error').hide();
			}
		}
	});
});

