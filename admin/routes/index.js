var express = require('express');
let router = express.Router();
// let Image =require('../../models/image');
let fs=require('fs');
let qs=require('qs');
let EventProxy = require('eventproxy')
let {succJson,errJson} =require('../../utils/sendJson');
let {formatFloat} = require('../../utils/tools')
let dictCache = require('../../utils/dictCache')
let dictCa = dictCache.getInstance()
// let User =require('../../models/user');
// let Pages =require('../../models/pages');
let {User, Page, Catalog, Article, Goods, Image, Order, Postage, Dict} = require('../../viewModels/')
let xss = require('xss')
let xssConfig = require('../../utils/xssConfig')
let WxPay = require('../../utils/wxPay')
let imgCode="";

function getPageNum(count,pageSize) {
	if(count%pageSize==0){//转换成页数
		return  parseInt(count/pageSize);
	}
	return parseInt(count/pageSize)+1;
}

router.use((req, res, next) => {
	if(req.body.content) {
		req.body.content = xss(req.body.content,xssConfig)
	}
	return next()
})
router.get('/', (req, res, next)=> {
	let ep = EventProxy.create('todayOrderCount', 'refundCount', 'userCount', 'todayUserCount', (todayOrderCount, refundCount, userCount, todayUserCount) => {
		res.render('index',{title:"首页", todayOrderCount, refundCount, userCount, todayUserCount});
	})
	ep.fail(next)
	Order.todayNewOrder(ep.done('todayOrderCount')) // 今日新订单
	Order.refundCount(ep.done('refundCount')) // 申请退款订单
	User.userCount(ep.done('userCount')) // 注册用户总数
	User.todayCount(ep.done('todayUserCount')) // 今日新增用户
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
router.post('/clearCache', (req, res) => {
	dictCa.resetAll()
	res.json({
		code: 0,
		message: '成功'
	})
})
router.get('/changePwd', (req, res) => {
	res.render('pwd', {title:'修改密码'})
})
router.post('/changePwd', (req, res, next) => {
	req.checkBody('oldpwd',"原始密码不能为空").notEmpty()
		.isTooShort(6).withMessage("密码错误");
	req.checkBody('pwd',"密码不能为空").notEmpty()
		.isTooShort(6).withMessage("密码太短");
	req.checkBody('pwdRepeat').notEmpty()
		.isSame(req.body.pwd).withMessage('密码不一致')
	req.asyncValidationErrors().then(function(){
		User.findById(req.session.user._id, function(err,user){
			if (err) return next(err)
			if (user.pwd !== req.body.oldpwd) {
				req.flash("error","账户名或密码错误")
				return  res.redirect('/admin/changePwd')
			}
			User.findAndUpdate(user._id, {pwd: req.body.pwd}, (err, newUser) => {
				req.flash('success', '修改成功')
				res.redirect('/admin/changePwd')
			})
		});
	},function(errors){
		req.flash('error', errors[0].msg)
		res.redirect('/admin/changePwd')
	});
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

// 用户管理 -----------------------------------------------------------------
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
// 商品管理 -----------------------------------------------------------------
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
router.post('/goods/delete',(req, res, next) => {
	let removeId = req.body.id
	Goods.removeById(removeId, function(err,page) {
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
// 字典管理
router.get('/dict/index', (req, res, next) => {
	Dict.findAllByPage(req.query.page,10,(err, obj) => {
		if (err) return next(err)
		return res.render('dict/index', Object.assign({title:'字典管理'}, obj))
	})
})
router.get('/dict/field/:name', (req, res, next) => {
	Dict.findByName(req.params.name, (err, dict) => {
		if(err) return next(err)
		console.log(dict, 'dict-----------------------')
		res.render('dict/update', {title:'属性修改', dict})
	})
})
router.post('/dict/saveField', (req, res, next) => {
	console.log(req.body, '/dict/saveField - -- - - - -')
	let valueObj=qs.parse(req.body);
	Dict.update(req.body._id, valueObj, (err, dict) => {
		if (err) return next(err)
		console.log(dict, ' --------')
		console.log(dict.name)
		req.flash('success', '保存成功')
		res.redirect('/admin/dict/field/' + dict.name)
	})
})
router.get('/dict/add', (req, res, next) => {
	let curr = {
		isNew: true
	}
	if (req.query.update) {
		Dict.findById(req.query.update, (err, dict) => {
			if (err) return next(err)
			curr = dict
			res.render('dict/add', {title: '字典数据添加', curr})
		})
	} else {
		res.render('dict/add', {title: '字典数据添加', curr})
	}
})
router.post('/dict/add', (req, res, next) => {
	let param = req.body
	switch(req.body.valueType) {
		case 'string': param.value = req.body.value;break;
		case 'object': param.value = JSON.parse(param.value);break;
		case 'array': param.value = JSON.parse(param.value);break;
		case 'other':
			try {
				param.value = JSON.parse(param.value);break;
			} catch (e) {
				param.value = req.body.value
			}
	}
	param.isValid = Boolean(req.body.isValid)
	if(req.body._id) { //更新
		Dict.update(req.body._id, param, (err, dict) => {
			if (err) return  next(err)
			req.flash('success', '更新成功')
			return res.redirect('/admin/dict/add?update=' + req.body._id)
		})
	} else {
		Dict.create(param, (err, dict) => {
			if (err) return next(err)
			req.flash('success', '创建成功')
			res.redirect('/admin/dict/add')
		})
	}
})
router.post('/dict/delete',(req, res, next) => {
	let removeId = req.body.id
	Dict.remove(removeId, function(err, postage) {
		if(err) {
			console.log(err)
			return res.sendStatus(403)
		}
		if (postage) {
			return res.json({
				code:0,
				message:'操作成功'
			})
		} else {
			return res.sendStatus(403)
		}
	})
})


//邮费管理 -----------------------------------------------------------------
router.get('/postage/index', (req, res, next) => {
	Postage.findAll((err, postages) => {
		if (err) return next(err)
		res.render('postage/index', {title: '邮费管理', postages})
	})
})

router.get('/postage/add', (req, res, next) => {
	let curr = {
		isNew:true
	}
	if(req.query.update) {
		Postage.findById(req.query.update, (err, postage) => {
			if (err) return next(err)
			curr = postage
			res.render('postage/add', {title: '邮费规则添加', curr})
		})
	} else {
		res.render('postage/add', {title: '邮费规则添加', curr})
	}
})

router.post('/postage/add', (req, res, next) => {
	let param = req.body
	if (req.body.province) {
		let proArr = req.body.province.split(',')
		param.provinceId = proArr[0]
		param.province = proArr[1]
	}
	if (req.body.city) {
		let cityArr = req.body.city.split(',')
		param.cityId = cityArr[0]
		param.city = cityArr[1]
	}
	param.isValid = Boolean(req.body.isValid)
	if(req.body._id) { //更新
		Postage.update(req.body._id, param, (err, postage) => {
			if (err) return  next(err)
			req.flash('success', '更新成功')
			return res.redirect('/admin/postage/add?update=' + req.body._id)
		})
	} else {
		Postage.create(param, (err, postage) => {
			if (err) return next(err)
			req.flash('success', '添加成功')
			res.redirect('/admin/postage/add')
		})
	}
})
router.post('/postage/delete',(req, res, next) => {
	let removeId = req.body.id
	Postage.remove(removeId, function(err, postage) {
		if(err) {
			console.log(err)
			return res.sendStatus(403)
		}
		if (postage) {
			return res.json({
				code:0,
				message:'操作成功'
			})
		} else {
			return res.sendStatus(403)
		}
	})
})


// 订单管理 -----------------------------------------------------------------
router.get('/orders/index/:status', (req, res, next) => {
	let queryParam = {}
	switch(req.params.status) {
		case "all": break;
		case "waitPay": queryParam = {orderStatus: 10};break;
		case "pay": queryParam = {orderStatus: 20};break;
		case "ship": queryParam = {orderStatus: 30};break; // 已发货
		case "finish": queryParam = {orderStatus: 40}; break;
		case "refunding": queryParam = {orderStatus: 20,refunding: 2};break;
	}
	Order.findAllByPage(queryParam,req.query.page, 10, (err, obj) => {
		if (err) return next(err)
		res.render('orders/index', Object.assign({title:'订单管理'}, obj))
	})
})
router.get('/orders/detail/:id', (req, res, next) => {
	Order.findById(req.params.id, (err, order) => {
		res.render('orders/detail', {title: '订单详情', order, formatFloat:formatFloat})
	})
})
  // 取消订单
router.post('/order/cancel/:id', (req, res, next) => {
	Order.cancelById(req.params.id, (err, order) => {
		res.json({
			code: 0,
			message: '操作成功'
		})
	})
})
	// 改价
router.post('/order/changeAmt/:id', (req, res, next) => {
	if(parseFloat(req.body.amt)<=0) {
		res.status(403).json({
			code:-1,
			message: '无法修改为小于等于0的值'
		})
	}
	if(req.params.id && req.body.amt) {
		Order.changeAmtById(req.params.id,formatFloat(req.body.amt),(err,order) => {
			if(err) return next(err)
			res.json({
				code:0,
				message: 'success',
				data:{
					order:order
				}
			})
		})
	}
})


 // 退款
router.post('/order/backAmt/:id', (req, res, next) => {
	Order.findById(req.params.id,function (err, order) {
		if(err) return  next(err)
		WxPay.refund(order.orderId,order.realPrice,order.realPrice).then(obj => {
			// 	<xml><return_code><![CDATA[SUCCESS]]></return_code>
			// 	<return_msg><![CDATA[OK]]></return_msg>
			// 	<appid><![CDATA[wx2b6b34e4a0735bc0]]></appid>
			// 	<mch_id><![CDATA[1500403302]]></mch_id>
			// 	<nonce_str><![CDATA[dJFagwhW072NsSPg]]></nonce_str>
			// 	<sign><![CDATA[3D1E7922E65DB24BD57B7662A3001574]]></sign>
			// <result_code><![CDATA[FAIL]]></result_code>
			// <err_code><![CDATA[NOTENOUGH]]></err_code>
			// <err_code_des><![CDATA[基本账户余额不足，请充值后重新发起]]></err_code_des>
			// </xml>
			if(obj.result_code === 'SUCCESS') {
				Order.refunding(req.params.id, req.body.amt, (err,order) => {
					if(err) return next(err)
					res.json({
						code:0,
						message:'success',
						data: {
							order:order
						}
					})
				})
			} else {
				res.status(403).json({
					code:-1,
					message: obj.err_code_des || '退款错误',
					data: {
						order: {},
						backObj: obj
					}
				})
			}
		})
	})


	// Order.findById(req.params.id,(err,order) => {
	// 	if(err) return next(err)
	// 	WxPay.refund(order.orderId,order.realPrice,order.realPrice).then(obj => {
	// 		Order.refunding(req.params.id, obj, (err, order) => {
	// 			if(err) return next(err)
	// 			res.json({
	// 				code:0,
	// 				message:'success',
	// 				data: {
	// 					order:order
	// 				}
	// 			})
	// 		})
	// 	})
	// })
})
// 关联物流单号
router.post('/order/linkTrain/:id', (req, res, next) => {
	Order.realSend (req.params.id,req.body.postId || '', (err, order) => {
		if (err) return next(err)
		return res.json({
			code: 0,
			message: 'success',
			data: {
				order:order
			}
		})
	})
})
// 设置订单已完成
router.post('/order/finish/:id', (req, res, next) => {
	Order.finish (req.params.id, (err, order) => {
		if (err) return next(err)
		return res.json({
			code: 0,
			message: 'success',
			data: {
				order:order
			}
		})
	})
})


// 单页管理 -----------------------------------------------------------------
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

// 文章管理 -----------------------------------------------------------------
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


// 导航管理  -----------------------------------------------------------------
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
	    console.log(curr,'curr_catalog/add')
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
	console.log(req.body.isVaild, 'catalog/add===============================')
	param.isValid = req.body.isValid?1:0
  if (req.body._id) { //更新
    Catalog.findAndUpdate(req.body._id, param, (err, catalog) => {
      if (err) {
        req.flash('error', err.message)
        return res.redirect('/admin/catalog/add?update='+req.body._id)
      }
      console.log('update', catalog)
      req.flash('success', '更新目录成功')
      res.redirect('/admin/catalog/add?update='+catalog._id)
    })
  } else { //创建
	  Catalog.create(param, (err, catalog) => {
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
// catch 404 and forward to error handler
module.exports = router;