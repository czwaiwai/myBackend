/**
 * Created by Administrator on 2018/5/17 0017.
 */
// 快递鸟物流查询接口对接

var request = require('request')
var crypto = require('crypto')
// var {UrlEncode} = require('./urlEncodeFn')
// var {UrlEncode,UrlDecode} = require('./urlEncodeFn')
let config = {
	id: '1342482',
	AppKey: '88db8d13-9782-4ea3-8aa2-a881b665d8b6',
  url: 'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx'
	// url: 'http://sandboxapi.kdniao.cc:8080/kdniaosandbox/gateway/exterfaceInvoke.json' // 测试
}
function md5 (str) {
	var md5sum = crypto.createHash('md5');
	md5sum.update(str);
	str = md5sum.digest('hex');
	return str
}
var kdn = {
	// 通过订单查询 快递公司
	queryShipper (code) {
		return new Promise ((resolve,reject) => {
			let requestData = `{"LogisticCode":"${code}"}`
			request.post({
				url: config.url,
				form: {
					RequestData: requestData,
					EBusinessID: config.id,
					DataSign: this.sign(requestData),
					RequestType: 2002,
					DataType:2
				}
			}, (error, response, body) => {
				// console.log(response)
				if (error){
				 return resolve('请求无响应')
				}
				let json
				try {
					json = JSON.parse(body)
				} catch (e) {
					json = {}
				}
				if (json.Success) {
					resolve(json.Shippers)
				} else {
					reject(json.Reason || '查询失败')
				}
			})
		})
	},
	sign (RequestData) {
		var str =RequestData+config.AppKey
		var md5Str = md5(str)
		return  (new Buffer(md5Str)).toString('base64')
	},
	// decodeData (str) {
	// 	return UrlEncode(str)
	// },
	queryPostage(shipperCode,code) {
		return new Promise ((resolve,reject) => {
			let requestData = `{"OrderCode":"","ShipperCode":"${shipperCode}","LogisticCode":"${code}"}`
			request.post({
				url: config.url,
				form: {
					EBusinessID: config.id,
					RequestType: 1002,
					RequestData: requestData,
					DataSign: this.sign(requestData),
					DataType: 2
				}
			}, function (error, response, body) {
				console.log(body, '------------------')
				if (error) {
					return resolve('请求无响应')
				}
				let json
				try {
					json = JSON.parse(body)
				} catch (e) {
					json = {}
				}
				if (json.Success) {
					resolve(json)
				} else {
					reject(json.Reason || '查询失败')
				}
			})
		})
	}
}
// ShipperCode 快递公司的编码
// LogisticCode 快递单号
module.exports = function (code) {
	return kdn.queryShipper(code).then((Shippers) =>{
		console.log(Shippers[0].ShipperCode, code, '--------------')
		return  kdn.queryPostage(Shippers[0].ShipperCode, code)
	})
}


