
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
function fileUpload (req, cb) {
    var form=new multiparty.Form({
        encoding:"utf-8",
        uploadDir:uploadPath,
        maxFilesSize:20*1024*1024,//20M
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
        let inputFile = files.file[0]
        let filenamePath = inputFile.path
        let month=moment().format("YYYYMM");
        let day=moment().format("YYYYMMDD");
        let fileType=inputFile.path.match(/\.\w+$/ig)[0];
        let newPath=path.join(uploadPath,month+'/')
        createDir(newPath,function(err){
            if(err) {
                req.flash('error', '目录创建失败')
                return cb && cb(err);
            }
            var ranamePath = newPath+'file_$date_'+ day+'_' + Date.now()+fileType
            fs.rename(filenamePath, ranamePath,function(err) {
                if(err) {
                    req.flash('error',err.message);
                    return cb && cb(err);
                }
                cb && cb(null,obj,ranamePath);
            })
        })
    })
}
module.exports = fileUpload