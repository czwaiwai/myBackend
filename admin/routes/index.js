var express = require('express');
let router = express.Router();
let Image =require('../../models/image');
let fs=require('fs');
let {succJson,errJson} =require('../../utils/sendJson');
// let User =require('../../models/user');
// let Pages =require('../../models/pages');
let {User, Page, Catalog, Article} = require('../../viewModels/')

let imgCode="";
function getPageNum(count,pageSize){
    if(count%pageSize==0){//转换成页数
        return  parseInt(count/pageSize);
    }
    return parseInt(count/pageSize)+1;
}

router.get('/', (req, res)=> {
    res.render('index',{title:"首页"});
});
router.get('/login',(req,res)=>{
    // req.flash('success',"靠靠靠");
    console.log(req.session.imgCode,"imgCode");
    req.session.abc=1;
    res.render('login',{title:"用户登录"});
})
router.get('/welcome',(req, res) => {
    res.render('welcome', {title: "首页"})
})
router.post('/login',(req,res)=>{
    console.log(req.session,req.session.imgCode,req.body.verifyCode,"imgCode");
    let imgCode=req.session.imgCode;
    req.checkBody('userName',"用户名不能为空").notEmpty()
      .isTooShort(6).withMessage("用户名太短");
    req.checkBody('password',"密码不能为空").notEmpty()
      .isTooShort(6).withMessage("密码太短");
    req.checkBody('verifyCode',"验证码不能为空").notEmpty()
      .isEqual(imgCode).withMessage("验证码不正确");
    req.getValidationResult().then(function(valid){
      if(valid.isEmpty()){
        User.findByUserName(req.body.userName, (err, user) => {
          if (!user || user.pwd !== req.body.password) {
            req.flash('error', '账户名或密码错误')
            return res.redirect('/admin/login')
          }
          req.session.user = user
          return res.redirect('/admin/')
        })
      }else{
          req.flash("error",valid.array()[0].msg);
          return   res.redirect('./login');
      }
    },function(errors){
        console.log(errors)
    })
});
router.get('/logout',(req,res)=>{
    req.session.user=null;
    return res.redirect('./');
})

// 用户管理
router.get('/users/index', (req, res, next) => {
	User.findAllByRegister((err, users) => {
		if (err) return next(err)
		return res.render('users/index', {title: '用户管理', users, page: 1, count: 10})
	})
})

// 单页管理
router.get('/pages/index', (req, res, next) => {
	Page.findAll((err, pages) => {
		if (err) return next(err)
		return res.render('pages/index', {title: '单页管理', pages, page: 1, count: 10})
	})
})
router.get('/pages/add', (req, res) => {
    return res.render('pages/add', {title: '添加单页'})
})
router.post('/pages/add', (req, res, next) => {
  Page.newPage(req.body, function (err) {
    if (err) {
      req.flash("error",err.message);
      console.error(err)
      return res.redirect('/admin/pages/add')
    }
    req.flash("success", '操作成功')
    return res.redirect('/admin/pages/add')
  })
})

// 文章管理
router.get('/article/index', (req, res) => {
	let name = req.query.catalogName
	if (!name) {
		return res.sendStatus(404)
	}
	Article.getListByCatalogPath(name, (err, articles) => {
		if(err) return next(err)
		return res.render('article/index', {title: '文章管理',articles, page: 1, count: 10})
	})
})
router.get('/article/add', (req, res, next) => {
	Catalog.findByTpl('article', (err, catalogs) => {
		if (err) return next(err)
		return res.render('article/add', {title: '添加文章', catalogs})
	})
})
router.post('/article/add', (req, res, next) => {
	let params = req.body
	let tmpArr = req.body.catalogStr.split('|')
	params.catalog = tmpArr[0]
	params.catalogName = tmpArr[1]
	params.catalogPath = tmpArr[2]
	Article.create(params, (err, article) => {
		if(err) return next(err)
		console.log('article', article)
		req.flash('success', '创建成功')
		return res.redirect('/admin/article/add')
	})
})

// 导航管理
router.get('/catalog/index', (req, res) => {
  Catalog.getCatalogMenu((err, catalogs) => {
    if (err) {
      return next(err)
    } else {
	    return res.render('catalog/index', {title: '导航列表',catalogs, page: 1, count: 10})
    }
  })
})
router.get('/catalog/add', (req, res ,next) => {
  let curr = {}
  Catalog.getCatalogMenu((err, catalogs) => {
    if (err) {
      return next(err)
    }
    if (req.query.update) {
      curr = catalogs.find(item => item.id === req.query.update)
    }
	  return res.render('catalog/add', {title: '添加导航', catalogs, curr} )
  })

})
router.post('/catalog/add', (req, res, next) => {
  console.log(req.body)
  let param = req.body
	param.shopName = 'mShop'
	param.calPath = param.parent
  param.deep = param.parent.split(',').length -1
  if (req.body._id) { //更新
    Catalog.findAndUpdate(req.body._id, req.body, (err, catalog) => {
      if (err) {
        req.flash('error', err.message)
        return res.redirect('/admin/catalog/add?update='+req.body._id)
      }
      console.log('update', catalog)
      req.flash('success', '更新目录成功')
      res.redirect('/admin/catalog/add?update='+catalog._id)
    })
  } else { //创建
	  Catalog.create(req.body, (err, catalog) => {
		  console.log(catalog, 'catalog')
		  if (err) {
			  req.flash('error', err.message)
			  return res.redirect('/admin/catalog/add')
		  }
		  console.log(catalog)
		  req.flash('success', '目录创建成功')
		  res.redirect('/admin/catalog/add')
	  })
  }
})
router.post('/catalog/remove',(req, res, next) => {
  let removeId = req.body.id
	Catalog.removeById(removeId, function(err,catalog) {
	  if(err) {
	    console.log(err)
	    return res.sendStatus(403)
    }
    if (catalog) {
	    return res.json({
		    code:0,
		    message:'操作成功'
	    })
    } else {
	    return res.sendStatus(403)
    }
  })
})


router.get('/chat',(req,res) => {
    console.log(req.path);
    res.render('chat',{title:"聊天室"});
})

router.get('/info',(req,res)=>{
   res.render('info',{title:"个人信息"});
});

// router.get('/pages',(req,res)=>{
//     let page=req.query.page || 1;
//     let pageSize=req.query.pageSize || 10;
//     Pages.getByPage({page,pageSize},(err,{count,pages})=>{
//         if(err){
//             req.flash("error",err.toString());
//             return  res.render('images',{title:"单页管理",pages:[]});
//         }
//         res.render('pages',{
//             title:"单页管理",
//             count:getPageNum(count,pageSize),
//             page,
//             list:pages,
//         });
//     })
// });
// 上传图片管理
router.get('/images',(req,res)=>{
    let page = req.query.page || 1;
    let pageSize=req.query.pageSize || 10;

    Image.getByPage(page,pageSize,(err,images)=>{
        let {count} =images;
        if(err){
            req.flash("error",err.toString());
           return  res.render('images',{title:"图片管理",images:[]});
        }
        images.count=getPageNum(count,pageSize);
        let renderObj=Object.assign({page,pageSize,title:"图片管理"},images);
        res.render('images',renderObj);
    })
})
router.post('/images',(req,res)=>{
    let {type,name,path}=req.body;
    if(type==="delete"){
        Image.removeOne(name,(err,images)=>{
            if(err){
                return res.json(errJson({err}));
            }
            req.flash("success","删除成功！");
            res.json(succJson({},"删除成功！"));
        });
        fs.unlink("public"+path);
    }
    // req.body.name=""
})
// router.all('*',(req,res)=>{
//     res.redirect
// })
module.exports = router;