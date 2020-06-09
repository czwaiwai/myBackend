const config = {
	name: 'mShop',
	description: '一个基于nodejs express 的小商城',
	author: 'czwaiwai',
	uploadDir: 'public/upload/',
	domain: 'http://yg.szyungu.net',
	// mongodb 数据库链接
  db: 'mongodb://localhost/waiShop',
  debug: true,
	wxPayKey: '',
	wxAppId: '',
	wxMchId: '',
	wxNotifyUrl: ''
}
module.exports = config

//app.js
// {
//   "token": "bssfood",
//   "appID": "wxxxxx",
//   "appScrect": "xxxxxxxx",
//   "key": "xxxxxx",
//   "mchID": "150040xxxx",
//   "appDomain": "https://api.weixin.qq.com",
//   "notifyUrl": "http://www.bssfood.com/order/notify",
//   "apiURL": {
//     "accessTokenApi": "%s/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
//     "createMenu": "%s/cgi-bin/menu/create?access_token=%s",
//     "templateSend":"%s/cgi-bin/message/template/send?access_token=%s"
//   }
// }