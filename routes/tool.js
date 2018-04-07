
let express = require('express');
let router = express.Router();
let qs=require('qs');
let {succJson,errJson} =require('../utils/sendJson');
let imgProcess =require('../utils/imgProcess');
// let Image=require('../models/image');
let User=require('../models/user');
let {Image} = require('../models')
router.get('/createUser',(req,res)=>{
    console.log(req.body);


    res.render('tool/createUser',{title:"添加用户"});
})

router.post('/createUser',(req,res)=>{
    let userObj=qs.parse(req.body);
    let user=new User(userObj.user);
    user.save((err,userData)=>{
        req.flash("success").toString()
        console.log(userData);
        res.redirect('/tool/createUser');
    });
    // let user=new User();

})
router.get('/upload',(req,res)=>{
    res.render('tool/uploadTest',{imgUrl:req.query.imgUrl});

});
router.get('/test', (req, res, next) => {
    res.render('tool/test',{title:'测试'})
})
router.post('/upload',(req,res)=>{
    imgProcess(req,function(err,fields,files){
        if(err){
            if(fields && fields.callType=="json"){
                res.json(errJson({},req.flash("error").toString())) ;
            }else{
                return res.redirect('/tool/upload');
            }
        }
        req.flash('success',"上传成功");
        //保存在mongodb中便于后台管理
        files.forEach(ctx=>{
	        Image.create(ctx)
            // new Image(Object(ctx,{url:ctx.path})).save();
        });
        if(fields && fields.callType=="json"){
            res.json(succJson({imgs:files},req.flash("success").toString()));
        }else{
            res.redirect('/tool/upload?imgUrl='+files[0].path);
        }
    })
})
module.exports=router