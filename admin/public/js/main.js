/**
 * Created by waiwai on 17-7-12.
 **/

(function($){

    function guidGenerator() {
        var S4 = function() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    }
		function delBtn(el,msg) {
			$(el).on('click','.btn-delete',function () {
				var $this = $(this)
				$.confirm(msg || '你确定要删除这个栏目么?').then(function (action) {
					if(action) {
						$.post($this.data('url'),{id:$this.data('id')}).done(function(res){
							$this.closest('tr').remove()
							$.alert(res.message)
						}).fail(function(err) {
							alert('删除失败')
						})
					}
				})
			})
		}

    $.extend({
        guidGenerator:guidGenerator,
	      delBtn:delBtn

    });

  if($('#content')[0] && $('#editor')[0]) {
	  var E = window.wangEditor
	  var $content= $('#content')
	  var editor = new E('#editor')
	  editor.customConfig.zIndex = 10
	  editor.customConfig.uploadImgServer = '/upload'
	  editor.customConfig.onchange = function (html) {
		  // 监控变化，同步更新到 textarea
		  $content.val(html)
	  }
	  editor.create()
  }
})(jQuery)
