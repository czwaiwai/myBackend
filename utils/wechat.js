/**
 * Created by Administrator on 2018/4/25 0025.
 */
const crypto = require('crypto');
const request = require('request')
const fs = require('fs')
const qs = require('qs')
const path = require('path')
const util = require('util')
const xml2js = require('xml2js')
let {txtMsg, imgMsg, graphicMsg} = require('./wxMsgTpl') //回复的消息模板
// var config = require('../wx.json')
var accessToken = {
	accessToken: "",
	expiresTime: 0,
}
var apiTicket = {
	ticket: '',
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
function genTimeStamp() {
	return parseInt(new Date().getTime() / 1000) + '';
}
function genNonceStr() {
	return Math.random().toString(36).substr(2, 15);
}
function genSignature (jsapi_ticket,noncestr,timestamp,url) {
	let tmp = [jsapi_ticket,noncestr,timestamp,url].sort().join('&')
	return crypto.createHash("sha1").update(tmp).digest("hex");
}
var instance = null
Wechat.getInstance = function () {
	if(!instance) {
		let config = require('../wx.json')
		console.log(config, '我开始实例化了，我只会出现一次')
		instance = new Wechat(config)
	}
	return instance
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
	console.log(req.body, '----------------------------------------------')
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
	console.log(req.body, '----------------------------------------------')
	let data = req.body.xml
	let formUser = data.tousername // 开发者微信号
	let toUser = data.fromusername  // 用户的openId
	if(data.msgtype === 'event') {
		switch(data.event){
			case 'subscribe':res.send(txtMsg(toUser,formUser,'欢迎您订阅了白云山生态农场，本农场所有农副产品都自产自销，不参任何添加剂和防腐剂，大山深处的产品值得您信赖！'));break;
			default :res.send('success')
		}
	} else {
		next()
	}
}

// 获取accessToken
Wechat.prototype.getAccessToken = function () {
	return new Promise((resolve,reject) => {
		 let currentTime = new Date().getTime()
		 let url = util.format(this.config.apiURL.accessTokenApi,
			 this.config.appDomain,
			 this.config.appID,
			 this.config.appScrect
		 )
		let accessToken = {}
		fs.readFile(path.resolve(__dirname,'../runTime/accessToken.json'), 'utf-8', (err, data) => {
			if (err) {
				accessToken = { accessToken: '' , expiresTime: 0}
			}
			try {
				accessToken = JSON.parse(data)
			} catch (err) {
				accessToken = { accessToken: '' , expiresTime: 0}
			} finally {
				if (accessToken.accessToken === "" || accessToken.expiresTime < currentTime) {
					request.get(url, (err, response, body) => {
						if (err) {
							return reject(err)
						}
						if (typeof body && typeof body === 'string') {
							let data = JSON.parse(body)
							accessToken.accessToken = data.access_token
							accessToken.expiresTime = new Date().getTime() + (parseInt(data.expires_in) - 200) * 10
							fs.writeFileSync(path.resolve(__dirname,'../runtime/accessToken.json'), JSON.stringify(accessToken), 'utf-8')
							resolve(accessToken.accessToken)
						} else {
							return reject(new Error('body为空'))
						}
					})
				} else {
					resolve(accessToken.accessToken)
				}
			}
		})
	})
}
// 获取jsapi_ticket
Wechat.prototype.getJsApiTicket = function (accessToken) {
	return  new Promise((resolve,reject) => {
		let currentTime = new Date().getTime()
		let url =`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`

		let apiTicket = {}
		fs.readFile(path.resolve(__dirname,'../runTime/apiTicket.json'), 'utf-8', (err, data) => {
			if (err) {
				apiTicket = { accessToken: '' , expiresTime: 0}
			}
			try {
				apiTicket = JSON.parse(data)
			} catch (err) {
				apiTicket = { accessToken: '' , expiresTime: 0}
			} finally {
				request.get(url, (err, response, body) => {
					if (err) {
						return reject(err)
					}
					if (apiTicket.ticket === "" || apiTicket.expiresTime < currentTime) {
						request.get(url, (err, response, body) => {
							if (err) {
								return reject(err)
							}
							if (typeof body && typeof body === 'string') {
								let data = JSON.parse(body)
								apiTicket.ticket = data.ticket
								apiTicket.expiresTime = new Date().getTime() + (parseInt(data.expires_in) - 200) * 10
								fs.writeFileSync(path.resolve(__dirname,'../runtime/apiTicket.json'), JSON.stringify(apiTicket), 'utf-8')
								resolve(apiTicket.ticket)
							} else {
								return reject(new Error('body为空'))
							}
						})
					} else {
						resolve(apiTicket.ticket)
					}
					// {
					// 	"errcode":0,
					// 	"errmsg":"ok",
					// 	"ticket":"bxLdikRXVbTPdHSM05e5u5sUoXNKd8-41ZO3MhKoyN5OfkWITDGgnr2fwJ0m9E8NYzWKVZvdVtaUgWvsdshFKA",
					// 	"expires_in":7200
					// }
				})
			}
		})
	})
}
// 微信签名jsApiTicket
Wechat.prototype.getSignTicket = function (ticket,url) {
		let noncestr = genNonceStr()
		let timestamp = genTimeStamp()
		let signature = genSignature(`jsapi_ticket=${ticket}`,`noncestr=${noncestr}`,`timestamp=${timestamp}`,`url=${url}`)
		return {
			appid: this.config.appID,
			noncestr: noncestr,
			timestamp: timestamp,
			signature: signature,
		}
}

// 静默授权
Wechat.prototype.authLogin  = function () {
	let appid = this.config.appID;
	let reirect_uri = encodeURIComponent('http://www.bssfood.com/auth')
	let scope = 'snsapi_base';
	let state = 'bssfood';
	let reqUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${reirect_uri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`
	return new Promise((resolve,reject) => {
		request.get(reqUrl,(err,response,body) => {
			if(err) {
				return reject(err)
			}
			console.log(body, 'authLogin')
			// return resolve(body)
			try {
				let json = JSON.parse(body)
				if(!json.errcode) {
					resolve(json)
				} else {
					reject(json)
				}
			} catch (e) {
				return reject(e)
			}
		})
	})
}
// 用户微信登录code换取openId
Wechat.prototype.getCodeToken = function (code) {
	//
	// let reqUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token?';
	// let params = {
	// 	appid: this.config.appID,
	// 	secret: this.config.appScrect,
	// 	code: code,
	// 	grant_type: 'authorization_code'
	// }
	let reqUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.config.appID}&secret=${this.config.appScrect}&code=${code}&grant_type=authorization_code`
	return new Promise((resolve, reject) => {
		request.get(reqUrl,(err,response,body) => {
			if(err) {
				return reject(err)
			}
			console.log(body, 'authorization_code')
			// { "access_token":"ACCESS_TOKEN",
			// 	"expires_in":7200,
			// 	"refresh_token":"REFRESH_TOKEN",
			// 	"openid":"OPENID",
			// 	"scope":"SCOPE" }
			// {"errcode":40029,"errmsg":"invalid code"}
			try {
				let json = JSON.parse(body)
				if(!json.errcode) {
					resolve(json)
				} else {
					reject(json)
				}
			} catch (e) {
				return reject(e)
			}
		})
	})
}
Wechat.prototype.getUserInfo = function (accToken, openId) {
	let reqUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${accToken}&openid=${openId}&lang=zh_CN`
	return new Promise((resolve,reject) => {
		request.get(reqUrl, (err, response, body) => {
			if(err) {
				return  reject(err)
			}
			try {
				let json = JSON.parse(body)
				if(!json.errcode) {
					resolve(json)
				} else {
					reject(json)
				}
			} catch (e) {
				return reject(e)
			}
			// return resolve(body)
		})
	})
}
Wechat.prototype.reflashToken = function () {
	let reqUrl = 'https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=APPID&grant_type=refresh_token&refresh_token=REFRESH_TOKEN'
	// { "access_token":"ACCESS_TOKEN",
	// 	"expires_in":7200,
	// 	"refresh_token":"REFRESH_TOKEN",
	// 	"openid":"OPENID",
	// 	"scope":"SCOPE" }
}