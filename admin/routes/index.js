var express = require('express');
let router = express.Router();
// let Image =require('../../models/image');
let fs=require('fs');
let EventProxy = require('eventproxy')
let {succJson,errJson} =require('../../utils/sendJson');
// let User =require('../../models/user');
// let Pages =require('../../models/pages');
let {User, Page, Catalog, Article, Goods, Image} = require('../../viewModels/')

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
	User.findAllByPage(req.query.page,10,(err, obj) => {
		if (err) return next(err)
		return res.render('users/index', Object.assign({title:'用户管理'},obj))
	})
})
router.get('/users/add', (req, res, next) => {
	let curr = {isNew:true}
	if (req.query.update) {
		User.findById(req.query.update, (err, user) => {
			if (err) return  next(err)
			curr = user
			return res.render('users/add', {title: '更新用户', curr})
		})
	} else {
		return res.render('users/add', {title: '添加用户', curr})
	}
})
router.post('/users/add', (req, res, next) => {
	if (req.body._id) {
		User.findAndUpdate(req.body._id, req.body, (err, user) => {
			if(err) return next(err)
			if (user) {
				req.flash('success', '更新用户成功')
			} else {
				req.flash('error', '更新用户失败')
			}
			return res.redirect('/admin/users/add?update='+req.body._id)
		})
	} else {
		next(new Error('后台无法新建用户'))
	}
})
// 商品管理
router.get('/goods/index', (req, res, next) => {
	Goods.findAllByPage({},req.query.page,10, (err, obj) => {
		if (err) return next(err)
		res.render('goods/index', Object.assign({title: '产品管理'}, obj))
	})
})
router.get('/goods/add', (req, res, next) => {
	let curr  = {isNew: true}
	if (req.query.update) {
		let ep = EventProxy.create('goodTypes', 'goods', (goodTypes, goods) => {
			curr = goods
			res.render('goods/add', {title: '添加商品', goodTypes, curr})
		})
		ep.fail(next)
		Goods.findById(req.query.update, ep.done('goods'))
		Catalog.getChildrenByNameAll('goods', ep.done('goodTypes'))
	} else {
		Catalog.getChildrenByNameAll('goods', (err, goodTypes) => {
			if(err) return next(err)
			res.render('goods/add', {title: '添加商品', goodTypes, curr})
		})
	}
})
router.post('/goods/add', (req, res, next) => {
	let params = req.body
	console.log(params)
	let tmpArr = req.body.catalogStr.split('|')
	params.catalogId = tmpArr[0]
	params.catalogName = tmpArr[1]
	params.catalogPath = tmpArr[2]
	if(req.body.imgs) {
		params.imgs = req.body.imgs.split(',')
		params.imgTmb = params.imgs[0]
	} else {
		params.imgs = []
		params.imgTmb = ''
	}
	if(req.body._id) {
		Goods.findAndUpdate(params._id, params, (err, goods) => {
			if (err) return  next(err)
			req.flash('success', '更新成功')
			res.redirect('/admin/goods/add?update=' + params._id)
		})
	} else {
		Goods.create(params, (err, goods) => {
			if (err) return next(err)
			req.flash('success', '创建成功')
			res.redirect('/admin/goods/add')
		})
	}
})



// 订单管理
router.get('/orders/index', (req, res, next) => {
	res.render('orders/index', {title: '订单管理' , page:1, count:10})
})

// 单页管理
router.get('/pages/index', (req, res, next) => {
	console.log('req.query.page',req.query.page)
	Page.findAllByPage(req.query.page,10,(err, obj) => {
		if (err) return next(err)
		console.log(obj,'page---------------------inde')
		return res.render('pages/index', Object.assign({title:'单页管理'},obj))
	})
})
router.get('/pages/add', (req, res, next) => {
	var curr = {isNew:true}
	if (req.query.update) {
		Page.findById(req.query.update, (err, page) => {
			if (err) return next(err)
			curr = page
			return res.render('pages/add', {title: '添加单页', curr})
		})
	} else {
		return res.render('pages/add', {title: '添加单页', curr})
	}
})
router.post('/pages/add', (req, res, next) => {
	if(req.body._id) { //更新
		Page.findAndUpdate(req.body._id, req.body, (err,page) => {
			if (err) return  next(err)
			req.flash("success", '更新成功!')
			return res.redirect('/admin/pages/add?update='+req.body._id)
		})
	} else {
		Page.newPage(req.body, function (err) {
			if (err) {
				req.flash("error",err.message);
				console.error(err)
				return res.redirect('/admin/pages/add')
			}
			req.flash("success", '操作成功')
			return res.redirect('/admin/pages/add')
		})
	}
})
router.post('/pages/delete',(req, res, next) => {
	let removeId = req.body.id
	Page.removeById(removeId, function(err,page) {
		if(err) {
			console.log(err)
			return res.sendStatus(403)
		}
		if (page) {
			return res.json({
				code:0,
				message:'操作成功'
			})
		} else {
			return res.sendStatus(403)
		}
	})
})

// 文章管理
router.get('/article/index', (req, res, next) => {
	let name = req.query.catalogName
	if (!name) {
		return res.sendStatus(404)
	}
	Article.findAllByPageCatalogs(name, req.query.page, 10, (err, obj) => {
		if (err) return next(err)
		return res.render('article/index', Object.assign({title: '单页管理'}, obj))
	})
})
router.get('/article/add', (req, res, next) => {
	let curr = {isNew: true}
	if(req.query.update) {
		let ep = EventProxy.create('catalogs','article',function(catalogs,article){
			curr = article
			return res.render('article/add',{title: '修改文章', catalogs, curr })
		})
		ep.fail(next)
		Article.findById(req.query.update,ep.done('article'))
		Catalog.findByTpl('article',ep.done('catalogs'))
	} else{
		Catalog.findByTpl('article', (err, catalogs) => {
			if (err) return next(err)
			return  res.render('article/add',{title: '添加文章', catalogs, curr})
		})
	}
})
router.post('/article/add', (req, res, next) => {
	let params = req.body
	let tmpArr = req.body.catalogStr.split('|')
	params.catalog = tmpArr[0]
	params.catalogName = tmpArr[1]
	params.catalogPath = tmpArr[2]
	params.isTop = Boolean(req.body.isTop)?1:0
	params.isHot = Boolean(req.body.isHot)?1:0
	if (req.body._id) { // 修改
		Article.findAndUpdate(params._id, params, (err,article) => {
			if(err) return next(err)
			console.log('article', article)
			req.flash('success', '更新成功')
			return res.redirect('/admin/article/add?update=' + params._id)
		})
	} else {
		Article.create(params, (err, article) => {
			if(err) return next(err)
			console.log('article', article)
			req.flash('success', '创建成功')
			return res.redirect('/admin/article/add')
		})
	}
})
router.post('/article/delete',(req, res, next) => {
	let removeId = req.body.id
	Article.removeById(removeId, function(err,page) {
		if(err) {
			console.log(err)
			return res.sendStatus(403)
		}
		if (page) {
			return res.json({
				code:0,
				message:'操作成功'
			})
		} else {
			return res.sendStatus(403)
		}
	})
})


// 导航管理
router.get('/catalog/index', (req, res) => {
  Catalog.getCatalogMenu((err, catalogs) => {
    if (err) {
      return next(err)
    } else {
	    return res.render('catalog/index', {title: '导航列表',catalogs})
    }
  })
})
router.get('/catalog/add', (req, res ,next) => {
  let curr = {isNew:true}
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
router.get('/image/index', (req, res) => {
	Image.findAllByPage({}, req.query.page, 10, (err, obj)=> {
		if (err) return next(err)
		return res.render('image/index', Object.assign({title:'图片管理'}, obj))
	})
})
router.post('/image/delete', (req, res) => {
	if (req.body.id) {
		Image.removeById(req.body.id, (err, image) => {
			if (err) return next(err)
			if (image) {
				return res.json({
					code:0,
					message:'操作成功'
				})
			}
		})
	} else {
		return res.json({
			code:-1,
			message:'删除失败'
		})
	}
})

// router.get('/images',(req,res)=>{
//     let page = req.query.page || 1;
//     let pageSize=req.query.pageSize || 10;
//
//     Image.getByPage(page,pageSize,(err,images)=>{
//         let {count} =images;
//         if(err){
//             req.flash("error",err.toString());
//            return  res.render('images',{title:"图片管理",images:[]});
//         }
//         images.count=getPageNum(count,pageSize);
//         let renderObj=Object.assign({page,pageSize,title:"图片管理"},images);
//         res.render('images',renderObj);
//     })
// })
// router.post('/images',(req,res)=>{
//     let {type,name,path}=req.body;
//     if(type==="delete"){
//         Image.removeOne(name,(err,images)=>{
//             if(err){
//                 return res.json(errJson({err}));
//             }
//             req.flash("success","删除成功！");
//             res.json(succJson({},"删除成功！"));
//         });
//         fs.unlink("public"+path);
//     }
//     // req.body.name=""
// })
// router.all('*',(req,res)=>{
//     res.redirect
// })
module.exports = router;