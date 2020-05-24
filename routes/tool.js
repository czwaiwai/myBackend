
let express = require('express');
let router = express.Router();
let qs=require('qs');
let {succJson,errJson} =require('../utils/sendJson');
let imgProcess =require('../utils/imgProcess');
let fileUpload =require('../utils/fileUpload');
// let Image=require('../models/image');
// let User=require('../models/user');
let {Image} = require('../models')
let {wechat} = require('../utils/wxValid')
var request = require('request')
router.use('/wxVaild',(req,res) => {
    wechat(req,res)
})
router.get('/test', (req, res, next) => {
  return res.status(400).json({
    code: -1,
    message: '测试403返回'
  })
})
// router.get('/createUser',(req,res)=>{
//     console.log(req.body);
//     res.render('tool/createUser',{title:"添加用户"});
// })
//
//
// router.post('/createUser',(req,res)=>{
//     let userObj=qs.parse(req.body);
//     let user=new User(userObj.user);
//     user.save((err,userData)=>{
//         req.flash("success").toString()
//         console.log(userData);
//         res.redirect('/tool/createUser');
//     });
//     // let user=new User();
//
// })
router.get('/upload',(req,res)=>{
    res.render('tool/uploadTest',{imgUrl:req.query.imgUrl});

});
router.get('/test', (req, res, next) => {

    res.render('tool/test',{title:'测试'})
})
router.post('/test',(req,res,next) => {
	console.log(req.body)
  console.log(req.rawBody)
    res.json({
      code:0,
      message:'啊哈哈',
      data:{
          a:req.body,
          b:req.rawBody,
      }
    })
})

router.get('/getPostInfo',(req,res,next) => {
  let EBusinessID = '1342482'
  let AppKey = '88db8d13-9782-4ea3-8aa2-a881b665d8b6'
  let reqUrl = 'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx'
	request.post({
    url: reqUrl,
    form: {
			EBusinessID: '',
			RequestType: '1002',
			RequestData: `"{'OrderCode':'','ShipperCode':'YTO','LogisticCode':'12345678'}"`,
			DataSign: '',
			DataType:2
    }
  }, function (error, response, body) {
    console.log(body)
  })
})
router.post('/uploadFile',(req,res)=>{
  fileUpload(req,function(err, fields, filePath) {
    if(err) {
      if((fields && fields.callType=="json") || req.get('X-Requested-With') === 'XMLHttpRequest'){
          return res.json(errJson({},req.flash("error").toString())) ;
      } else{
          return res.redirect('/tool/uploadFile');
      }
    }
    req.flash('success',"上传成功");
    if(fields && fields.callType=="json" || req.get('X-Requested-With') === 'XMLHttpRequest'){
      res.json(succJson({file:filePath},req.flash("success").toString()));
    } else{
      res.redirect('/tool/uploadFile?imgUrl='+files[0].path);
    }
  })
})
router.post('/upload',(req,res)=>{
    imgProcess(req,function(err,fields,files){
        if(err){
            console.log(req.get('X-Requested-With'),'X-Requested-With')
            if((fields && fields.callType=="json") || req.get('X-Requested-With') === 'XMLHttpRequest'){
                return res.json(errJson({},req.flash("error").toString())) ;
            } else{
                return res.redirect('/tool/upload');
            }
        }
        req.flash('success',"上传成功");
        //保存在mongodb中便于后台管理
        files.forEach(ctx=>{
	        Image.create(ctx)
            // new Image(Object(ctx,{url:ctx.path})).save();
        });
        if(fields && fields.callType=="json" || req.get('X-Requested-With') === 'XMLHttpRequest'){
            res.json(succJson({imgs:files},req.flash("success").toString()));
        }else{
            res.redirect('/tool/upload?imgUrl='+files[0].path);
        }
    })
})
module.exports=router