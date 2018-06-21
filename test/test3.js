/**
 * Created by Administrator on 2018/4/16 0016.
 */
var models = require('../models/')
var {Dict,Cart, Goods} = require('../viewModels')
var _ = require('lodash');
// var Cart = models.Cart
var User = models.User
// var Goods = models.Goods
var Counters = models.Counters

var arr =	[{
		"_id" : "5af85f08f3a7624940293892",
		"goodsId" : "5ac05a372128d528094e603b",
		"name" : "稻花香糙米5kg",
		"subName" : "五常稻花香糙米富含丰富的维他命、矿物质与膳食纤维，降三高，属功能性的绿色健康食品。",
		"imgTmb" : "/upload/20180402/t13lYTRRp8VQ7PfUblamkRjy_$date20180402_$900x600_$sma_330x220.jpeg",
		"sellPrice" : "440.7",
		"num" : 1
	},{
	"_id" : "5af85f08f3a7624940293892",
	"goodsId" : "5ac5c9b6c27ad91675e81f7e",
	"name" : "稻花香糙米5kg",
	"subName" : "五常稻花香糙米富含丰富的维他命、矿物质与膳食纤维，降三高，属功能性的绿色健康食品。",
	"imgTmb" : "/upload/20180402/t13lYTRRp8VQ7PfUblamkRjy_$date20180402_$900x600_$sma_330x220.jpeg",
	"sellPrice" : "440.7",
	"num" : 3
},{
	"_id" : "5af85f08f3a7624940293892",
	"goodsId" : "5ac5cccbc27ad91675e81f81",
	"name" : "稻花香糙米5kg",
	"subName" : "五常稻花香糙米富含丰富的维他命、矿物质与膳食纤维，降三高，属功能性的绿色健康食品。",
	"imgTmb" : "/upload/20180402/t13lYTRRp8VQ7PfUblamkRjy_$date20180402_$900x600_$sma_330x220.jpeg",
	"sellPrice" : "440.7",
	"num" : 2
}]
Goods.updateMoreByArr(arr, function (err, goods) {
	console.log(err, goods, '-----err-----goods---------------')
})
// Cart.clearByGoodsId('5ab4618fb5ecf926b4b18827',['5ae413f120e3aa3e40a7e6eb'], function(err, user) {
// 	console.log(err)
// 	console.log(user)
// })

// User.update({_id:'5ab4618fb5ecf926b4b18827', 'cart.isCheck': false}, {
// 	$set:{'cart.$[].isCheck': false}
// },
// 	{
// 		multi:true
// 	},function(err, user){
// 	console.log(err)
// 	console.log(user)
// 	})

// User.findById('5ab4618fb5ecf926b4b18827', (err,user) => {
// 	user.cart.forEach(item => item.isCheck = false)
// 	user.save((err,user) => {
// 		console.log(err)
// 		console.log(user)
// 	})
// })
//
// User.findById('5ab4618fb5ecf926b4b18827',(err, user) => {
// 	if(err) console.log(err)
// 	user.set({cart:[]})
// 	user.save(function(err,user) {
// 		console.log(err)
// 		console.log(user)
// 	})
// })
//
// Goods.find({_id:{$in:['5ac05a372128d528094e603b']}},function(err,res){
// 	console.log(err)
// 	console.log(res)
// })

// User.findOneAndUpdate({_id: userId, 'cart._id': cartObj.id},
// 	{$set:{"cart.$.goodsNum":cartObj.num}},
// 	{new:true},
// 	callback
// )

// Dict.findByGroup('front', function(err, res){
// console.log(_.keyBy(res,'name'))
// })
// Counters.findOneAndUpdate({name:'order'},{$inc: {index:1}},{new: true, upsert: true}, (err, counter) => {
// 	if (err) {
// 		console.log(err)
// 	}
// 	console.log(counter, '--------------')
// })
