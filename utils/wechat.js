/**
 * Created by Administrator on 2018/4/25 0025.
 */
const crypto = require('crypto');
const request = require('request')
const util = require('util')
const xml2js = require('xml2js')
let {txtMsg, imgMsg, graphicMsg} = require('./wxMsgTpl') //回复的消息模板
// var config = require('../wx.json')
var accessToken = {
	accessToken: "",
	expiresTime: 0,
}
var Wechat = function (config) {
	this.config = config
	this.token = config
}
function check(timestamp,nonce,signature,token){
	var currSign,tmp;
	tmp = [token,timestamp,nonce].sort().join("");
	currSign = crypto.createHash("sha1").update(tmp).digest("hex");
	return (currSign === signature);
}
module.exports = Wechat
Wechat.prototype.auth = function (req, res) {
	// var query = url.parse(req.url,true).query;
	var query = req.query
	var signature = query.signature;
	var timestamp = query.timestamp;
	var nonce = query.nonce;
	var echostr = query.echostr;
	if(check(timestamp,nonce,signature, this.config.token)){
		res.end(echostr);
	}else{
		res.end("It is not from weixin");
	}
}
Wechat.prototype.setMenu = function (json) {
	return new Promise((resolve,reject) => {
		this.getAccessToken().then((res) => {
			var url = util.format(this.config.apiURL.createMenu, this.config.appDomain, res)
			request.post(url,json, (err, response, body) => {
				if (err) {
					return reject(err)
				}
				resolve(body)
			})
		}).catch(err => {
			reject(err)
		})
	})
}
Wechat.prototype.handleMsg = function (req, res, next) {
	// var msgXml = req.body
	// let xmlData = xml2js.parseString(msgXml)
	// let data = xmlData.xml
	// switch(data.MsgType) {
	// 	case 'text':       // 文本消息
	// 	case 'voice':     // 语音消息
	// 	case 'video':     // 视频消息
	// 	case 'shortvideo': // 小视屏消息
	// 	case 'location': // 地理位置消息
	// 	case 'link':  // 链接消息
	// 	case 'image': this.textHandle(data, req, res);break;
	// 	case 'event': this.eventHandle(data, req, res);break;
	// 	default: res.send('success')
	// }
	// this.textHandle(req, res, next)
	res.send('success')
}
Wechat.prototype.textHandle = function (req, res, next) {
	let data = req.body.xml
	console.log(data,'------------------------')
	let formUser = data.tousername // 开发者微信号
	let toUser = data.fromusername  // 用户的openId
	if(data.msgtype === 'text') {
		res.send(txtMsg(toUser, formUser, '收到'))
	} else {
		next()
	}
}
Wechat.prototype.eventHandle = function (req, res, next) {
	let data = req.body.xml
	let formUser = data.tousername // 开发者微信号
	let toUser = data.fromusername  // 用户的openId
	if(data.msgtype === 'event') {
		switch(data.event){
			case 'subscribe':res.send(txtMsg(toUser,formUser,'用户订阅了白云山生态农场'));break;
			default :res.send('success')
		}
	} else {
		next()
	}
}
Wechat.prototype.getAccessToken = function () {
	return new Promise((resolve,reject) => {
		 let currentTime = new Date().getTime()
		 let url = util.format(this.config.apiURL.accessTokenApi,
			 this.config.appDomain,
			 this.config.appID,
			 this.config.appScrect
		 )
		if (accessToken.accessToken === "" || accessToken.expiresTime < currentTime) {
		 	request.get(url, (err, response, body) => {
		 		if (err) {
		 			return reject(err)
				}
				if (typeof body && typeof body === 'string') {
		 			let data = JSON.parse(body)
					accessToken.accessToken = data.access_token
					accessToken.expiresTime = new Date().getTime() + (parseInt(data.expires_in) - 200) * 10
					resolve(accessToken.accessToken)
				} else {
		 			return reject(new Error('body为空'))
				}
		 	})
		} else {
		 	resolve(accessToken.accessToken)
		}
	})
}