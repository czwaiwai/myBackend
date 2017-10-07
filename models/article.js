/**
 * Created by waiwai on 17-8-1.
 */

import myDB from './db'
import timeFormat from '../utils/time'
module.exports=Article;
function Article(article){
    this.title=article.title;
    this.subTitle=article.subTitle;
    this.content=article.content;
    this.author=article.author;
    this.time=timeFormat(Date.now());
}

function openDB(name,cb){
    myDB.open((err,db) => {
        if (err) {
            return  cb(err);
        }
        db.collection(name,(err,collection)=>{
            if(err){
                myDB.close();
                return  cb(err);
            }
            cb(err,collection);
        })
    })
}

Article.prototype.save=function(err,cb){
    let article={
        title:this.title,
        content:this.content,
        subTitle:this.subTitle,
        author:this.author,
        time:this.time
    }
    openDB("article",function(err,collection){
        collection.insert(article,{safe:true},(err,images)=>{
            myDB.close();
            if(err){
                cb(err,images[0]);
            }
        })
    })
}