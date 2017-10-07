/*
 <div class="j_pager"  data-len="9" data-page="<%=page %>"  data-ajax="true" data-count="100"></div>
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
        this.pageCount=parseInt(options.pageCount);
        this.callback=options.callback || function(){};
        this.page=parseInt(options.page);
        this.ajax=options.ajax;
        this.arr=[];
        for(var i=0;i<options.pageLen;i++){
            this.arr.push(i+1);
        }
        this.draw=draw;
        init.call(this,options.page);
        return this;
    }
    function init(page){
        this.page=page;
        console.log(this.page,"init");
        var $nav=this.$el.append('<nav><ul class="pagination" ></ul></nav>');
        $nav.find('ul').append(drawFrag(parseInt(page),this.pageCount));
        if(this.ajax){
            binding.call(this);
            this.callback(page);
        }
    }
    function binding(){
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

    function draw (page){
        this.page=parseInt(page);
        var arr=getNum.call(this,page);
        this.$el.find('.page_num').removeClass('active').each(function(index,ctx){
            ctx.childNodes[0].innerHTML=arr[index];
            if(page==arr[index]){
                ctx.classList.add('active');
            }
        });
        this.callback(page);
    }


    function drawFrag(page,pageSize){
        var frag= document.createDocumentFragment();
        createHead(frag,page);
        createBody(frag,page,getNum.call(this,page));
        createTail(frag,page,pageSize);
        return frag;
    }
    function getNum(page){
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
            showDot(-1,liTxt)
        }else if(page+(leftLen+1)>max){  //到达最大边界
            showDot(1,liTxt)
            tmpNum=max-(subLen-1);
        }else{
            showDot(0,liTxt)
            tmpNum=page-leftLen;
        }
        for(var i=2;i<len-2;i++){
            liTxt[i]=tmpNum;
            tmpNum++;
        }
        return liTxt;
    }
    function showDot(status,liTxt){
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
    function createLi(txt,pageNum){
        var li=document.createElement('li');
        if(!isNaN(pageNum)){
            li.innerHTML='<a  href="?page='+pageNum+'">'+txt+'</a>';
        }else{
            li.innerHTML='<a  href="javascript:void(0);">'+txt+'</a>';
        }
        return li;
    }
    function createBody(frag,page,liTxt){
        for(var i=0;i<liTxt.length;i++){
            var li=createLi(liTxt[i],liTxt[i]);
            li.classList.add('page_num');

            if(liTxt[i]==page){
                console.log(liTxt[i]);
                console.log(liTxt);
                li.classList.add('active');
            }
            frag.appendChild(li);
        }
    }
    function createHead(frag,page){
        var li=createLi("上一页");
        li.classList.add("prev");
        if(page>1){
            li.childNodes[0].setAttribute('href','?page='+(page-1));
        }
        console.log(page,1);
        frag.appendChild(li,page);
    }
    function createTail(frag,page,pageSize){
        var li=createLi("下一页");
        li.classList.add("next");
        if(page<pageSize){
            console.log(page,pageSize);
            li.childNodes[0].setAttribute('href','?page='+(page+1));
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
                $this.data("instance", pager($this,option));
            }
            if(instance && typeof options =="number"){
                instance.draw(options);
            }
            if(instance  && typeof options =="string" && options=="draw"){
                instance.draw(cusPage);
            }
        })
    }
})(jQuery)