define(['jquery.validate', 'jquery.validate.methods'], function () {
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
})