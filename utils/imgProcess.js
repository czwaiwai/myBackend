/**
 * Created by waiwai on 17-7-19.
 */

var multiparty= require('multiparty');
var fs=require("fs");
var moment=require("moment");
var images=require('images');
let qs=require('qs');
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
        maxFilesSize:2*1024*1024,//2M
    });
    form.parse(req,function(err,fields,files){
        if(err){
            req.flash('error',"文件不符合要求");
            return cb && cb(err);
        }
        var obj ={};
        Object.keys(fields).forEach(function(name) {  //文本
            console.log('name:' + name+";filed:"+fields[name]);
            obj[name] = fields[name];
        });
        var file=[]
        Object.keys(files).forEach(function(name) {  //文件
            console.log('name:' + name+";file:"+files[name]);
            file = files[name];
        });
        console.log(file);
        // return cb && cb("error");
        // let file=files.file;
        let now=moment().format("YYYYMMDD");
        let newPath=uploadPath+now+"/";
        createDir(newPath,function(){
            let imgfiles=[];
            file.forEach(ctx=>{
                let img= images(ctx.path);
                let imgType=ctx.path.match(/\.\w+$/ig)[0];
                let imgName=ctx.path.replace(uploadPath,"").replace(imgType,"");
                let fullName=imgName+"_$date"+now+"_$"+img.width()+"x"+img.height()+imgType;
                let small=true;
                if(small){
                  let smallImg= images(img).resize(120);
                  let smallName=fullName.replace(imgType,"")+"_$sma_"+smallImg.width()+"x"+smallImg.height()+imgType;
                    smallImg.save(newPath+smallName);
                }
                img.save(newPath+fullName);
                imgfiles.push({
                    name:fullName,
                    width:img.width(),
                    height:img.height(),
                    type:ctx.headers['content-type'],
                    path:(newPath+fullName).replace("public","")
                });
                fs.unlink(ctx.path);
            });
            cb && cb(null,obj,imgfiles);
        });
    })
}
module.exports=imgProcess;
