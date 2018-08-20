define(['jquery', 'bootstrap-dialog'], function ($, BootstrapDialog) {
	// 初始化配置
	BootstrapDialog.DEFAULT_TEXTS[BootstrapDialog.TYPE_PRIMARY] = '提示';
	BootstrapDialog.DEFAULT_TEXTS['OK'] = '确定'
	BootstrapDialog.DEFAULT_TEXTS['CANCEL'] = '取消'
	BootstrapDialog.defaultOptions = {
		type: BootstrapDialog.TYPE_PRIMARY,
		size: BootstrapDialog.SIZE_NORMAL,
		cssClass: '',
		title: "提示",
		message: null,
		nl2br: true,
		closable: true,
		closeByBackdrop: true,
		closeByKeyboard: true,
		spinicon: BootstrapDialog.ICON_SPINNER,
		autodestroy: true,
		draggable: false,
		animate: false,
		description: '',
		tabindex: -1
	};
	// 定义常用方法
	$.extend({
		bootDialog: BootstrapDialog,
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
		alert:function(msg,title,callback) {
			var cb = callback
			if(typeof title === 'function') {
				cb = title
				title = '提示'
			}
			BootstrapDialog.alert({
				title: title,
				message: msg,
				closable: true, // <-- Default value is false
				draggable: false, // <-- Default value is false
				callback: cb
			}).setSize(BootstrapDialog.SIZE_SMALL)
		},
		confirm:function(msg,title,callback) {
			var cb = callback
			if(typeof title === 'function') {
				cb = title
				title = '提示'
			}
			BootstrapDialog.confirm({
				title: title,
				message: msg,
				closable: true, // <-- Default value is false
				draggable: false, // <-- Default value is false
				callback:cb
			}).setSize(BootstrapDialog.SIZE_SMALL)
		}
	})
	return BootstrapDialog
})