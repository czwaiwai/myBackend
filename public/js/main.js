/**
 * Created by waiwai on 17-7-12.
 **/
jQuery(function(){
    $(document).foundation();
    function guidGenerator() {
        var S4 = function() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    }

    $.extend({
        guidGenerator:guidGenerator,
    });
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
                        });
                    }
                }]
            });
        }
    })



    // $.guidGenerator=guidGenerator;
    // console.log($.guidGenerator(),"-----");

});

