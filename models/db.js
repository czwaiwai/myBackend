/**
 * Created by waiwai on 17-7-11.
 */
let config={
    db:"waiShop",
    host:'localhost',
    port:'27017',
}
let  {Db,Server}=require('mongodb');
let server=new Server(config.host,config.port,{auto_reconnect:true});

function open(name,cb){
    let _this=this;
    _this.open((err,db) => {
        if (err) {
            return  cb(err);
        }
        db.collection(name,(err,collection)=>{
            if(err){
                _this.close();
                return  cb(err);
            }
            cb.call(_this,err,collection);
        })
    })
}
const db= new Db(config.db,server,{safe:true})
let openDB=open.bind(db);
export {openDB,db}
