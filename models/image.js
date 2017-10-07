/**
 * Created by waiwai on 17-7-21.
 */
import {db as myDB} from './db'

import timeFormat from '../utils/time'
function Image(image){
    this.name=image.name;
    this.url=image.url;
    this.width=image.width;
    this.height=image.height;
    this.buildTime=timeFormat(Date.now());
    this.type=image.type;
}

module.exports=Image
Image.getAll=function(cb){
    myDB.open((err,db)=>{
        if(err) return cb(err);
        db.collection('images',(err,collection)=>{
            if(err){
                myDB.close();
                return cb(err);
            }
            collection.find({}).toArray((err,images)=>{
                myDB.close();
                if(err) return cb(err);
                cb(null,images);
            });
        })
    })
}
Image.getByPage=function(page,pageSize,cb){
    myDB.open((err,db)=>{
        if(err) return cb(err);
        db.collection('images',(err,collection)=>{
            if(err){
                myDB.close();
                return cb(err);
            }
            collection.count({},(err,count)=>{
                collection.find({})
                    .sort({buildTime:-1})
                    .skip(pageSize*(page-1))
                    .limit(pageSize)
                    .toArray(function(err,images){
                        myDB.close();
                        if(err) return cb(err);
                        cb(null,{images,count});
                });
            });
        })
    })
}
Image.removeOne=function(name,cb){
    myDB.open((err,db)=>{
        if(err) return cb(err);
        db.collection('images',(err,collection)=>{
            if(err){
                myDB.close();
                return cb(err);
            }
            if(!name) return cb(new Error("name 没有参数"));
            collection.deleteOne({name:name},(err)=>{
                myDB.close();
                if(err) return cb(err);
                cb(null);
            });
        });
    })
}
Image.prototype.save=function(cb){
    let image={
        name:this.name,
        url:this.url,
        width:this.width,
        height:this.height,
        buildTime: this.buildTime,
        type:this.type
    }
    cb = cb || function(){};
    myDB.open((err,db) => {
        if (err) {
            return  cb(err);
        }
        db.collection('images',(err,collection)=>{
            if(err){
                myDB.close();
                return  cb(err);
            }
            collection.insert(image,{safe:true},(err,images)=>{
                myDB.close();
                if(err) return  cb(err);
                cb && cb(null,images[0]);
            })

        })
    })
}
