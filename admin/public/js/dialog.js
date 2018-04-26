/**
 * Created by waiwai on 17-7-26.
 */
jQuery(function(){

    function alert(msg,title,options){
        var options =options || {};
        return new Promise(function(resolve,reject){
            BootstrapDialog.alert({
                title:title || '提示',
                message: msg,
                type: BootstrapDialog.TYPE_PRIMARY, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
                closable: options.closable || true, // <-- Default value is false
                draggable: options.draggable || true, // <-- Default value is false
                buttonLabel: options.btnOKLabel || '确定', // <-- Default value is 'OK',
                callback: function(result){
                    resolve(result);
                }
            });
        })
    }
    function confirm(msg,title,options){
        var options =options || {};
        return new Promise(function(resolve,reject) {
            BootstrapDialog.confirm({
                title: title || '提示',
                message: msg,
                type: BootstrapDialog.TYPE_PRIMARY, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
                closable:options.closable || true, // <-- Default value is false
                draggable:options.draggable || true, // <-- Default value is false
                btnCancelLabel:options.btnCancelLabel || '取消', // <-- Default value is 'Cancel',
                btnOKLabel:options.btnOKLabel || '确定', // <-- Default value is 'OK',
                btnOKClass:options.btnOKClass || 'btn-primary', // <-- If you didn't specify it, dialog type will be used,
                callback: function (result) {
                    // result will be true if button was click, while it will be false if users close the dialog directly.
                    if (result) {
                        resolve(result)
                    } else {
                        reject(result);
                    }
                }
            });
        })
    }
    function prompt(msg,title,options) {
    	return new Promise(function(resolve,reject) {
				BootstrapDialog.show({
					title: title || '提示',
					message: msg +
					'<input type="text" class="form-control"><p class="text-danger"></p>',
					buttons: [{
						label: '取消',
						cssClass: 'btn btn-default',
						action: function(dialogRef) {
							dialogRef.close();
						}
					},{
						label: '确定',
						cssClass: 'btn btn-primary',
						action: function(dialogRef) {
							var $input = dialogRef.getModalBody().find('input')
							var val = $input.val();
							if(options && options.regx) {
								if (options.regx.test(val)){
									$input.off()
									console.log(val)
									resolve(val)
									return dialogRef.close();
								} else {
									dialogRef.getModalBody().find('.text-danger').text(options.errorMsg)
									reject(false)
								}
							}else {
								$input.off()
								resolve(val)
								return dialogRef.close();
							}
						}
					}]
				});
			})
		}
    $.extend({
        alert:alert,
        confirm:confirm,
				prompt:prompt
    });

})