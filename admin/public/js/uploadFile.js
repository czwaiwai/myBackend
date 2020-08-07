/**
 * Created by waiwai on 17-9-27.
 */
(function($){
	function uploadFile($el,cb){
		var $saveIput=$($el.data("input"));
    var $file= $el.find('input[type=file]');
    var path = '/tool/uploadFile'
    var param = {}
    if($el.data('path')) {
      path = $el.data('path');
    }
    if($el.data('params')) {
      console.log($el.data('params'))
      param = $el.data('params')
    }
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
      for (var key in param) {
        formData.append(key, param[key]);
      }
			for(var i=0;i<el.files.length;i++){
				formData.append("file",el.files[i]);
			}
			$file[0].value="";
			var hideMask = mask()
			$.post({
				url:path,
				data:formData,
				processData:false,
				contentType:false,
				cache:false,
			}).done(function(res){
				hideMask()
				if(res.code === -1) {
					cb && cb ('error', res.message)
				} else {
					$saveIput && $saveIput.val(res.data.file);
					cb && cb('succ',res.data.file);
				}
			})
		});
		$el.on('click',function(){
			$file[0].click();
		})
	}
	function mask () {
		var div = document.createElement('div')
		div.classList.add('mask')
		div.innerHTML = '<div>上传中...</div>'
		document.body.appendChild(div)
		return function () {
			document.body.removeChild(div)
		}
	}
	$.fn.uploadFile=function(options){
		var callback=function(){};
		if(typeof options=="function"){
			callback=options;
		}
		this.each(function(index,context){
			var $this=$(context);
			var cb=function(){
				return callback.apply(context,arguments);
			}
			var instance= $this.data("instance");
			if(instance){
				return instance($this,cb);
			}else{
				$this.data('instance',uploadFile)
				return uploadFile($this,cb);
			}
		})
	}
	$.extend.uploadFile=uploadFile;
})(jQuery)
