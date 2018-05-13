/**
 * Created by waiwai on 17-7-19.
 */

var multiparty= require('multiparty');
var fs=require("fs");
var moment=require("moment");
var images=require('images');
var path = require('path')
let uploadPath ="public/upload/";
function createDir(newPath,cb){
    fs.access(newPath,function(err){
        if(err){//不存在目录
            fs.mkdir(newPath,"0777",function(err){
                cb && cb();
            })
        }else{
           cb && cb()
        }
    });
}
function imgProcess(req,cb){
    var form=new multiparty.Form({
        encoding:"utf-8",
        uploadDir:uploadPath,
        maxFilesSize:5*1024*1024,//5M
    });
    form.parse(req,function(err,fields,files){
        if(err){
            req.flash('error',"文件不符合要求");
            return cb && cb(err);
        }
        var obj ={};
        Object.keys(fields).forEach(function(name) {  //文本
            obj[name] = fields[name];
        });
        var file=[]
        Object.keys(files).forEach(function(name) {  //文件
            file = files[name];
        });
        let now=moment().format("YYYYMMDD");
        // let newPath=uploadPath+now+"/";
        let newPath=path.join(uploadPath,now+'/')
        createDir(newPath,function(){
            let imgfiles=[];
            file.forEach(ctx=>{
                let img= images(ctx.path);
                let imgType=ctx.path.match(/\.\w+$/ig)[0];
                let imgName=ctx.path.replace(path.join(uploadPath),"").replace(imgType,"");
                let fullName=imgName+"_$date"+now+"_$"+img.width()+"x"+img.height()+imgType;
                
                let pushObj={
                    name:fullName,
                    width:img.width(),
                    height:img.height(),
                    type:ctx.headers['content-type'],
                    url:(newPath+fullName).replace("public","").replace(/\\/g,'/')
                }
	              let small=true;
                if(small){
                  let smallImg= images(img).resize(220);
                  let smallName=fullName.replace(imgType,"")+"_$sma_"+smallImg.width()+"x"+smallImg.height()+imgType;
                  smallImg.save(newPath+smallName,{quality:60});
                  pushObj.thumb = {
                    name: smallName,
                    url: (newPath+smallName).replace("public","").replace(/\\/g,'/'),
                    width: smallImg.width(),
                    height:smallImg.height()
                  }
                }
                img.save(newPath+fullName);
                imgfiles.push(pushObj);
                fs.unlink(ctx.path);
            });
            cb && cb(null,obj,imgfiles);
        });
    })
}
module.exports=imgProcess;
