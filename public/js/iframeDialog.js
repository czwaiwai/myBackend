/**
 * Created by waiwai on 17-10-20.
 */
(function($,golob){
	var isIE=(function() { //ie?
      if (!!window.ActiveXObject || "ActiveXObject" in window){
    	 return true;
      }else{
    	 return false; 
      }
	})();
	var isTransEnd=(function transitionEnd() {/*过度结束事件是有兼容性的，所以专门创建一个方法，来获取每个浏览器兼容的TransitionEnd（用的应当是状态模式）*/
		    var el = document.createElement('bootstrap'); // 创建一个元素用于测试
		    var transEndEventNames = {//按照当前的主流浏览器趋势总共需要判断四种不同前缀的属性名称：
		      WebkitTransition : 'webkitTransitionEnd',//低版本的 Chrome 和 Safari 
		      MozTransition    : 'transitionend',//
		      OTransition      : 'oTransitionEnd otransitionend',
		      transition       : 'transitionend'
		    }
		    for (var name in transEndEventNames) {
		      if (el.style[name] !== undefined) {
		        return { end: transEndEventNames[name] }
		      }
		    }
		    return false
		  })();
    $.extend({
        iframeDialog:(function(){
            var iframe=document.createElement('iframe');
            var el;
            iframe.setAttribute("scrolling","no");
            iframe.setAttribute("border",'none');
            iframe.setAttribute("frameborder","0");
            var dialog = new BootstrapDialog({
                onshow: function(dialogRef){
                    var $body= dialogRef.getModalBody();
                    $body.append(iframe);
                },
                closable: true
            });
            var tmp;
            var isLoad=false;
            return {
                hide:function(params){
                   tmp=params;
                   if(!tmp){
                	   dialog.options.onhide=function(){}  
                   }
                   dialog.close();
                },
                show:function(url,callback,title){
                	dialog.options.onshown=function(dialogRef){
                		var $body= dialogRef.getModalBody();
                		var $div=$('<div class="iframeMask">正在加载,请耐心等待...</div>');   
                		if(isTransEnd){
                			$div.on('transitionend',function(){
	                   			 $div.off('transitionend');
	                   			 $div.hide();
	                   		});
                		}else{
                			setTimeout(function(){
                				 $div.hide();
                			},1000);
                		}
                		$body.append($div);                		
            			iframe.src=url;
            			$(iframe).on('load',function(){
            				   isLoad=true;
                     		   $div.css({opacity:0});      		 
                     		   iframe.height=iframe.contentDocument.body.clientHeight;
                       		   var el= iframe.contentDocument.getElementById('iframeContent');
                       		   $(el).css({'width':$body.width()+"px" });
                               iframe.width=$body.width();
                               $(iframe).off('load');
            			});
                	}
                    dialog.options.title=title || "信息";
                    dialog.options.onhide=function(dialogRef){
                    	if(isLoad ){
                    		callback && callback(tmp || {},dialogRef);
                    	}
                    	isLoad=false;
                        tmp=null;
                    };
                    dialog.open();
                }
            }
        })()
    })
    window.dialogClose=function(params){
        $.iframeDialog.hide(params);
    };
})(jQuery,window)
//使用  $.iframeDialog.show(url,callback,title);
//iframe中调用 window.parent.dialogClose("abc");
/*
	iframe页面要加入ID iframeContent
需要引入的样式
 .iframeMask{
	 position: absolute;
	 top: 0px;
	 left: 0px;
	 right: 0px;
	 bottom: 0px;
	 background: #f7f7f7;
	 opacity: 1;
	 transition: opacity 0.3s linear;
	 text-align: center;
	 padding: 30px;
	 font-size: 16px;
 }
 */