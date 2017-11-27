var express = require('express');
let router = express.Router();
var ccap=require('../utils/verifycode');
var schema=require('async-validator');
var User =require('../models/user');
/* GET home page. */


// router.get(checkLogin);
router.get('/', (req, res)=> {
    //console.log(req.session.user,"这里可以取到session");

    res.render('index',{title:"首页"});
});
router.get('/imgCode',(req,res)=>{
   var arr= ccap.get();
   req.session.imgCode=arr[0];
   console.log(req.session);
   console.log(req.session.imgCode,"-------");
   res.send(arr[1]);
});
router.get('/chat',(req,res)=>{
    console.log(req.path);
    res.render('chat',{title:"聊天室"});
});

router.get('/about',(req,res)=>{
    res.render('about',{title:"关于我们"});
});

router.get('/test',(req,res)=>{
    res.render('test',{title:"测试"});
})
router.get('/test1',(req,res)=>{
    res.render('test1',{title:"测试"});
})
router.get('/login',(req,res)=>{
  res.render('login',{title:"用户登录"});
});
router.post('/login',(req,res)=>{
    req.checkBody('userName',"用户名不能为空").notEmpty()
        .isTooShort(6).withMessage("用户名太短");
    req.checkBody('password',"密码不能为空").notEmpty()
        .isTooShort(6).withMessage("密码太短");
    req.checkBody('verifyCode',"验证码不能为空").notEmpty()
        .isEqual(req.session.imgCode).withMessage("验证码不正确");
    req.asyncValidationErrors().then(function(){
        User.getOne({userName:req.body.userName},function(err,user){
            if(user.pwd!=req.body.password){
                req.flash("error","账户名或密码错误");
                return  res.redirect('/login');
            }
            req.session.user=user;
            return  res.redirect('/');
        });
    },function(errors){
        req.flash("error",errors[0].msg);
        return   res.redirect('/login');
    });
});
router.get('/register',(req,res)=>{

    res.render('register',{title:"用户注册"});
})
router.get('/logout',(req,res)=>{
    req.session.user=null;
    return res.redirect('/');
})
module.exports = router;
