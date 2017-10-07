/**
 * Created by waiwai on 17-8-1.
 */
var ccap=require('ccap')({

    width:100,//set width,default is 256

    height:40,//set height,default is 60

    offset:20,//set text spacing,default is 40

    quality:100,//set pic quality,default is 50

    fontsize:35,//set font size,default is 57

    generate:function(){//Custom the function to generate captcha text
        //generate captcha text here
        var text=parseInt(Math.random()*9000+1000)+"";
        return text;//return the captcha text

    }
});
module.exports=ccap;