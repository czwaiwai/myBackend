/**
 * Created by waiwai on 17-9-27.
 */
(function($){
    function uploadImg($el,cb,options){
        var $saveIput=$($el.data("input"));
        var $file= $el.find('input[type=file]');
        if(!$file[0]){
            var tmpArr="";
            if($el.data('multiple')){
                tmpArr=" multiple ";
            }
            $file=$('<input name="file"  '+tmpArr+'  style="display:none;" type="file" >');
            $el.append($file);
        }
        $file.on('change',function(e){
            var el=e.target;
            if(!el.files){
                return ;
            }
            var formData= new FormData();
            formData.append("callType","json");
            if(options){
                for(var key in options){
                    formData.append(key,options[key]);
                }
            }
            for(var i=0;i<el.files.length;i++){
                formData.append("file",el.files[i]);
            }
            $file[0].value="";
            $.post({
                url:'/tool/upload',
                data:formData,
                processData:false,
                contentType:false,
                cache:false,
            }).done(function(res){
                $saveIput && $saveIput.val(res.data.imgs[0].path);
                cb && cb(res.data.imgs);
            })
        });
        $el.on('click',function(){
            $file[0].click();
        })
    }
    $.fn.uploadImg=function(options){
        var callback=function(){};
        var params;
        if(typeof options=="function"){
            callback=options;
        }
        if(typeof options=="object"){
            params=options.params;
            callback=options.callback;
        }
        this.each(function(index,context){
            var $this=$(context);
            var cb=function(){
                return callback.apply(context,arguments);
            }
            var instance= $this.data("instance");
            if(instance){
                return instance($this,cb,params);
            }else{
                instance=uploadImg;
                return instance($this,cb,params);
            }
        })
    }
    $.extend.uploadImg=uploadImg;
})(jQuery)
