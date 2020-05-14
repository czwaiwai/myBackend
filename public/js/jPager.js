/*
 <div class="j_pager" data-param=""  data-len="9" data-page="<%=page %>"  data-ajax="true" data-count="100"></div>
 //需提供基础
 @params 分页总数
 @parmss 当前页
 //初始化组件
 $('.j_pager').pager(function(page){
 console.log(page,"我是回调");

 });
 //修改当前页
 $('.j_pager').pager(1);
 或者
 $('.j_pager').pager("redraw",1);
 */
(function($){

	function pager($el,options){
		this.$el=$el;
		this.options = options
		this.pageCount=parseInt(options.pageCount);
		this.callback=options.callback || function(){};
		this.page=parseInt(options.page);
		this.ajax=options.ajax;
		this.arr=[];
		for(var i=0;i<options.pageLen;i++){
			this.arr.push(i+1);
		}
		// this.draw=draw;
		this.init(options.page);
		return this;
	}
	pager.prototype.init = function (page){
		this.page=page;
		console.log(this.page,"init");
		this.$nav=this.$el.append('<nav><ul class="pagination" ></ul></nav>');
		this.$nav.find('ul').append(this.drawFrag(parseInt(page),this.pageCount));
		if(this.ajax){
			this.binding();
			this.callback(page);
		}
	}
	pager.prototype.binding = function (){
		var that=this;
		this.$el.on('click','li>a',function(e){
			e.preventDefault();
			var tmp= e.target.innerHTML;
			if(!isNaN(tmp)){
				that.draw(parseInt(tmp));
			}
			if(tmp=="上一页"){
				if(that.page==1) return;
				that.draw(that.page-1)
			}
			if(tmp=="下一页"){
				if(that.page==that.pageCount) return;
				that.draw(that.page+1);
			}
		})
	}
	pager.prototype.setCount = function (count, p) {
		var page = p || 1
		this.pageCount =  count || 1
		this.arr=[];
		for(var i=0;i<this.options.pageLen;i++){
			this.arr.push(i+1);
		}
		console.log(this.drawFrag(parseInt(page),this.pageCount))
		this.$nav.find('ul').empty().append(this.drawFrag(parseInt(page),this.pageCount))
		this.draw(page, true)
	},
	pager.prototype.draw = function  (page, noCall){
		this.page=parseInt(page);
		var arr=this.getNum(page);
		this.$el.find('.page_num').removeClass('active').each(function(index,ctx){
			ctx.childNodes[0].innerHTML=arr[index];
			if(page==arr[index]){
				ctx.classList.add('active');
			}
		});
		if (!noCall) {
			this.callback(page);
		}
	}


	pager.prototype.drawFrag = function (page,pageSize){
		var frag= document.createDocumentFragment();
		this.createHead(frag,page);
		this.createBody(frag,page,this.getNum(page));
		this.createTail(frag,page,pageSize);
		return frag;
	}
	pager.prototype.getNum = function (page){
		var liTxt=this.arr;
		var pageSize=this.pageCount;
		if(pageSize<=liTxt.length){
			liTxt.length=pageSize;
			return liTxt;
		}
		var len=liTxt.length;
		var subLen=len-4;
		var leftLen=0;
		if(subLen%2==1){
			leftLen=(subLen-1)/2;
		}else{
			leftLen=subLen/2;
		}
		liTxt[1]=2;
		liTxt[len-1]=pageSize;
		liTxt[len-2]=pageSize-1;
		var min=3;
		var max=pageSize-2;
		var tmpNum=min;
		if(page-(leftLen+1)<min){        //到达最小边界
			tmpNum=min;
			this.showDot(-1,liTxt)
		}else if(page+(leftLen+1)>max){  //到达最大边界
			this.showDot(1,liTxt)
			tmpNum=max-(subLen-1);
		}else{
			this.showDot(0,liTxt)
			tmpNum=page-leftLen;
		}
		for(var i=2;i<len-2;i++){
			liTxt[i]=tmpNum;
			tmpNum++;
		}
		return liTxt;
	}
	pager.prototype.showDot = function (status,liTxt){
		var len=liTxt.length;
		if(status==-1 ){
			liTxt[len-2]="...";
		}
		if(status==1){
			liTxt[1]="...";
		}
		if(status==0){
			liTxt[1]="...";
			liTxt[len-2]="...";
		}
	}
	pager.prototype.createLi = function (txt,pageNum){
		var li=document.createElement('li');
		if(!isNaN(pageNum)){
			li.innerHTML='<a  href="'+this.setParams(pageNum)+'">'+txt+'</a>';
		}else{
			li.innerHTML='<a  href="javascript:void(0);">'+txt+'</a>';
		}
		return li;
	}
	pager.prototype.setParams = function (pageNum){
		var paramStr = this.$el.data('param')
		if (paramStr) {
			if(paramStr.indexOf('page=') > -1) {
				return '?' + paramStr.replace(/page=[^&]/, 'page='+ pageNum)
			} else {
				return "?page="+pageNum + '&' + paramStr
			}
		} else {
			return "?page="+pageNum
		}
	}
	pager.prototype.createBody = function (frag,page,liTxt){
		for(var i=0;i<liTxt.length;i++){
			var li=this.createLi(liTxt[i],liTxt[i]);
			li.classList.add('page_num');

			if(liTxt[i]==page){
				console.log(liTxt[i]);
				console.log(liTxt);
				li.classList.add('active');
			}
			frag.appendChild(li);
		}
	}
	pager.prototype.createHead = function (frag,page){
		var li=this.createLi("上一页");
		li.classList.add("prev");
		if(page>1){
			li.childNodes[0].setAttribute('href',this.setParams(--page));
		}
		console.log(page,1);
		frag.appendChild(li,page);
	}
	pager.prototype.createTail = function (frag,page,pageSize){
		var li=this.createLi("下一页");
		li.classList.add("next");
		if(page<pageSize){
			console.log(page,pageSize);
			li.childNodes[0].setAttribute('href',this.setParams(++page));
		}
		frag.appendChild(li);
	}
	$.fn.pager=function(options,cusPage){
		this.each(function(){
			var $this=$(this);
			var option={};
			var defaultOption={
				page:$this.data("page") || 1,
				pageCount:$this.data("count") || 10,
				pageLen:$this.data('len') || 9,
				ajax:$this.data('ajax') || false
			}
			if(typeof options=="function"){
				defaultOption.callback=options;
			}
			if(typeof options=="object"){
				option= $.extend({},defaultOption,options);
			}else{
				option=defaultOption;
			}
			var instance=$this.data("instance");
			if(!instance) {
				instance = new pager($this,option)
				return $this.data("instance", instance);
			}
			if(typeof options =="number"){
				instance.draw(options);
			}
			if(typeof options =="string" && options=="draw"){
				instance.draw(cusPage);
			}
			if(typeof options === 'string' && options==='setCount') {
				instance.setCount(cusPage.count,cusPage.page)
			}
			if(typeof options === 'object') {
				instance.draw(options.page)
			}
		})
	}
})(jQuery)