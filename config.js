const config = {
	name: 'mShop',
	description: '一个基于nodejs express 的小商城',
	author: 'czwaiwai',
	uploadDir: 'public/upload/',
	// mongodb 数据库链接
	db: 'mongodb://localhost/waiShop',
	wxPayKey: '',
	wxAppId: '',
	wxMchId: '',
	wxNotifyUrl: 'http://www.bssfood.com/order/notify'
}
module.exports = config
