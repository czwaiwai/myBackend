/**
 * Created by Administrator on 2018/4/25 0025.
 */
const crypto = require('crypto');
const request = require('request')
const util = require('util')
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
				if (body.indexOf('errcode') < 0) {
					accessToken.accessToken = body.accessToken
					accessToken.expiresTime = new Date().getTime() + (parseInt(body.expires_in) - 200) * 10
					resolve(accessToken.accessToken)
				} else {
		 			resolve(body)
				}
		 	})
		} else {
		 	resolve(accessToken.accessToken)
		}
	})
}