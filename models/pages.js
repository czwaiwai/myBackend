/**
 * Created by waiwai on 17-8-4.
 */
import {openDB} from './db'
import timeFormat from '../utils/time'
module.exports=Pages;
function Pages(page){
    this.title=page.title;
    this.pageName=page.pageName;
    this.content=page.content;
    this.buildTime=timeFormat(Date.now());
}
Pages.getOne=function(obj,cb){
    openDB("pages",function(err,collection){
        collection.findOne(obj,(err,page)=>{
            this.close();
            if(err) return cb(err);
            cb(null,page);
        })
    })
}
Pages.getByPage=function({pageNo,pageSize},cb){
    openDB("pages",function(err,collection){
        collection.count({},(err,count)=>{
            collection.find({})
                .sort({buildTime:-1})
                .skip(pageSize*(pageNo-1))
                .limit(pageSize)
                .toArray((err,pages)=>{
                    this.close();
                    if(err) return cb(err);
                    cb(null,{pages,count});
                });
        });
    });
}
Pages.prototype.save=function(){
    let page={
        title:this.title,
        content:this.content,
        time:this.time
    }
    openDB("pages",function(err,collection){
        collection.insert(page,{safe:true},(err,page)=>{
            this.close();
            if(err) return cb(err);
            cb(null,page[0]);
        })
    })
}
