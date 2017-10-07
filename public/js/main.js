/**
 * Created by waiwai on 17-7-12.
 **/
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



    // $.guidGenerator=guidGenerator;
    // console.log($.guidGenerator(),"-----");

});

