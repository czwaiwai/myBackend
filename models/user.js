/**
 * Created by waiwai on 17-7-11.
 */
import {openDB,db} from './db'
import timeFormat from '../utils/time'
function User(user){
    this.userName=user.userName;
    this.pwd=user.pwd;
    this.email=user.email;
    this.nickName=user.nickName;
    this.realName=user.realName;
    this.cardID=user.cardID;
    this.mobile=user.mobile;
    this.area=user.area;
    this.remark=user.remark;
    this.headImg=user.headImg;
    this.amount=user.amount;
    this.score=user.score;
    this.address=user.address;
    this.favorite=null;
    this.createTime=timeFormat(Date.now());
    this.updateTime=timeFormat(Date.now());
    this.weixin=user.weixin ;
    this.weibo=user.weibo;
    this.qq=user.qq;
}

User.getOne=function(obj,cb){
    openDB('users',function(err,collection){
        collection.findOne(obj,(err,user)=>{
            this.close();
            if(err) return cb(err);
            cb(null,user);
        })
    })
}
User.prototype.save=function(cb){
    var user={
        userName:this.userName,
        pwd:this.pwd,
        email:this.email,
        nickName:this.nickName,
        realName:this.realName,
        cardID:this.cardID,
        mobile:this.mobile,
        area:this.area,
        remark:this.remark,
        headImg:this.headImg,
        amount:this.amount,
        score:this.score,
        address:this.address,
        favorite:this.favorite,
        createTime:this.createTime,
        updateTime:this.updateTime,
        weixin:this.weixin,
        weibo:this.weibo,
        qq:this.qq,
    }
    openDB("users",function(err,collection){
        collection.insert(user,{safe:true},(err,user)=>{
            this.close();
            if(err) return cb(err);
            cb(null,user[0]);
        })
    });
};
module.exports=User