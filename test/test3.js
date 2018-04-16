/**
 * Created by Administrator on 2018/4/16 0016.
 */
var models = require('../models/')
var Cart = models.Cart
var User = models.User

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

User.findById('5ab4618fb5ecf926b4b18827',(err, user) => {
	if(err) console.log(err)
	user.set({cart:[]})
	user.save(function(err,user) {
		console.log(err)
		console.log(user)
	})
})