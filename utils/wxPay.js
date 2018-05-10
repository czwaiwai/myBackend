var config = require('../config'); //配置文件 appid 等信息
var wxConfig = require('../wx.json')
// var Q = require("q");
var request = require("request");
var crypto = require('crypto');
var xml2js = require('xml2js')
// var ejs = require('ejs');
// var fs = require('fs');
var key = config.wxPayKey;
// var messageTpl = fs.readFileSync(__dirname + '/message.ejs', 'utf-8');

var WxPay = {
	getXMLNodeValue: function(node_name, xml) {
		var tmp = xml.split("<" + node_name + ">");
		var _tmp = tmp[1].split("</" + node_name + ">");
		return _tmp[0];
	},
	
	raw: function(args) {
		var keys = Object.keys(args);
		keys = keys.sort()
		var newArgs = {};
		keys.forEach(function(key) {
			newArgs[key] = args[key];
		});
		var string = '';
		for (var k in newArgs) {
			string += '&' + k + '=' + newArgs[k];
		}
		string = string.substr(1);
		return string;
	},
	
	paysignjs: function(appid, nonceStr, wxPackage, signType, timeStamp) {
		var ret = {
			appId: appid,
			nonceStr: nonceStr,
			package: wxPackage,
			signType: signType,
			timeStamp: timeStamp
		};
		var string = this.raw(ret);
		string = string + '&key=' + key;
		var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
		return sign.toUpperCase();
	},
	md5:function(string){
		return crypto.createHash('md5').update(string, 'utf8').digest('hex')
	},
	paysignjsapi: function(appid, attach, body, mch_id, nonce_str, notify_url, openid, out_trade_no, total_fee, trade_type, key) {
		var ret = {
			appid: appid,
			attach: attach,
			body: body,
			mch_id: mch_id,
			nonce_str: nonce_str,
			notify_url: notify_url,
			openid: openid,
			out_trade_no: out_trade_no,
			// spbill_create_ip: spbill_create_ip,
			total_fee: total_fee,
			trade_type: trade_type
		};
		var string = this.raw(ret);
		string = string + '&key=' + key; //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
		var crypto = require('crypto');
		var sign = crypto.createHash('md5').update(string, 'utf8').digest('hex');
		return sign.toUpperCase();
	},
	
	// 随机字符串产生函数
	createNonceStr: function() {
		return Math.random().toString(36).substr(2, 15);
	},
	
	// 时间戳产生函数
	createTimeStamp: function() {
		return parseInt(new Date().getTime() / 1000) + '';
	},
	// https://api.mch.weixin.qq.com/pay/orderquery
	queryOrder: function (id) {
		return new Promise((resolve, reject) => {
			let url = 'https://api.mch.weixin.qq.com/pay/orderquery'
			let appid = wxConfig.appID;
			let key = wxConfig.key;
			let	mch_id = wxConfig.mchID;
			let nonce_str = this.createNonceStr()
			let stringA = `appid=${appid}&mch_id=${mch_id}&nonce_str=${nonce_str}&out_trade_no=${id}`;
			let	stringSignTemp = stringA + "&key="+key; //注：key为商户平台设置的密钥key
			let	sign = this.md5(stringSignTemp).toUpperCase();  //注：MD5签名方式
			let formData = `<xml>
<appid>${appid}</appid>
<mch_id>${mch_id}</mch_id>
<nonce_str>${nonce_str}</nonce_str>
<out_trade_no>${id}</out_trade_no>
<sign>${sign}</sign>
</xml>`
			request({
				url: url,
				method: "POST",
				body: formData
			}, function(error, response, body) {
				if (error) {
					console.log(error, 'error')
					return reject(error)
				}
				console.log(body, '---------原始data---------------')
				if (!error && response.statusCode == 200) {
					xml2js.parseString(body,{
						normalize: true,     // Trim whitespace inside text nodes
						normalizeTags: true, // Transform tags to lowercase
						explicitArray: false // Only put nodes in array if >1
					}, (err, xml) => {
						if(err) {
							reject(err)
						}
						let data = xml.xml
						console.log(data, '------covert - data------')
						resolve(data)
					})
				} else {
					console.log(body, '----------------')
				}
			})
		})
	},
	/*
	* params goodsRemark //商品详情
	* params tradeNO  // OrderId
	* params productId  _id
	* totalFee totalFee 单位为分
	 */
	sacnOrder: function (attachTxt, goodsRemark, tradeNo, productId, totalFee) {
		return new Promise((resolve,reject) => {
			let url = "https://api.mch.weixin.qq.com/pay/unifiedorder",// 下单请求地址
				appid = wxConfig.appID,
				mch_id = wxConfig.mchID,
				key = wxConfig.key,
				notify_url = wxConfig.notifyUrl,
				out_trade_no = tradeNo,// 微信会有自己订单号、我们自己的系统需要设置自己的订单号
				product_id = productId,
				total_fee = (totalFee * 100),// 注意，单位为分
				attach = attachTxt,
				body = goodsRemark,
				trade_type = 'NATIVE',// 交易类型，JSAPI--公众号支付、NATIVE--原生扫码支付、APP--app支付
				nonce_str = this.createNonceStr(),// 随机字符串32位以下
				stringA = `appid=${appid}&attach=${attach}&body=${body}&mch_id=${mch_id}&nonce_str=${nonce_str}&notify_url=${notify_url}&out_trade_no=${out_trade_no}&product_id=${product_id}&total_fee=${total_fee}&trade_type=${trade_type}`,
				stringSignTemp = stringA + "&key="+key, //注：key为商户平台设置的密钥key
				sign = this.md5(stringSignTemp).toUpperCase();  //注：MD5签名方式
			
			let formData = "<xml>";
			formData += "<appid>" + appid + "</appid>"; //appid
			formData += "<attach>" + attach + "</attach>"; //附加数据
			formData += "<body>" + body + "</body>"; //商品或支付单简要描述
			formData += "<mch_id>" + mch_id + "</mch_id>"; //商户号
			formData += "<nonce_str>" + nonce_str + "</nonce_str>"; //随机字符串，不长于32位
			formData += "<notify_url>" + notify_url + "</notify_url>"; //支付成功后微信服务器通过POST请求通知这个地址
			formData += "<out_trade_no>" + out_trade_no + "</out_trade_no>"; //订单号
			formData += "<product_id>" + product_id +"</product_id>";// 商品id
			// formData += "<spbill_create_ip></spbill_create_ip>"; //ip
			formData += "<total_fee>" + total_fee + "</total_fee>"; //金额
			formData += "<trade_type>" + trade_type + "</trade_type>"; //NATIVE会返回code_url ，JSAPI不会返回
			formData += "<sign>" + sign + "</sign>";
			formData += "</xml>";
			console.log(formData, 'formData------------')
			// return resolve(formData)
			request({
				url: url,
				method: "POST",
				body: formData
			}, function(error, response, body) {
				if (error) {
					console.log(error, 'error')
					return reject(error)
				}
				console.log(body, '---------原始data---------------')
				if (!error && response.statusCode == 200) {
					xml2js.parseString(body,{
						normalize: true,     // Trim whitespace inside text nodes
						normalizeTags: true, // Transform tags to lowercase
						explicitArray: false // Only put nodes in array if >1
					}, (err, xml) => {
						if(err) {
							reject(err)
						}
						let data = xml.xml
						console.log(data, '------covert - data------')
						resolve(data)
					})
				} else {
					console.log(body, '----------------')
				}
			});
		})
	},
	// apiOrder: function (attachTxt, goodsRemark, tradeNo, productId, totalFee) {
	// 	let mch_id = wxConfig.mchID
	// 	let notify_url = wxConfig.notifyUrl
	// 	this.order(attachTxt, goodsRemark, mch_id, openid, tradeNo, totalFee, notify_url)
	// },
	// 此处的attach不能为空值 否则微信提示签名错误
	order: function(attach, body, bookingNo, total_fee, openid) {
		return new Promise((resolve,reject) => {
			var appid = wxConfig.appID;
			var key = wxConfig.key;
			var mch_id = wxConfig.mchID
			var notify_url = wxConfig.notifyUrl
			var nonce_str = this.createNonceStr();
			var timeStamp = this.createTimeStamp();
			var url = "https://api.mch.weixin.qq.com/pay/unifiedorder";
			var totalFee = parseInt(total__fee*100)
			var formData = "<xml>";
			formData += "<appid>" + appid + "</appid>"; //appid
			formData += "<attach>" + attach + "</attach>"; //附加数据
			formData += "<body>" + body + "</body>"; //商品或支付单简要描述
			formData += "<mch_id>" + mch_id + "</mch_id>"; //商户号
			formData += "<nonce_str>" + nonce_str + "</nonce_str>"; // 随机字符串，不长于32位
			formData += "<notify_url>" + notify_url + "</notify_url>"; // 支付成功后微信服务器通过POST请求通知这个地址
			formData += "<openid>" + openid + "</openid>"; // 扫码支付这个参数不是必须的
			formData += "<out_trade_no>" + bookingNo + "</out_trade_no>"; //订单号
			// formData += "<spbill_create_ip></spbill_create_ip>"; //不是必须的
			formData += "<total_fee>" + totalFee + "</total_fee>"; //金额
			formData += "<trade_type>JSAPI</trade_type>"; //NATIVE会返回code_url ，JSAPI不会返回
			formData += "<sign>" + this.paysignjsapi(appid, attach, body, mch_id, nonce_str, notify_url, openid, bookingNo, totalFee, 'JSAPI', key) + "</sign>";
			formData += "</xml>";
			var self = this;
			request({
				url: url,
				method: 'POST',
				body: formData
			}, function(err, response, body) {
				console.log(body, '---------原始data---------------')
				if (!error && response.statusCode == 200) {
					xml2js.parseString(body,{
						normalize: true,     // Trim whitespace inside text nodes
						normalizeTags: true, // Transform tags to lowercase
						explicitArray: false // Only put nodes in array if >1
					}, (err, xml) => {
						if(err) {
							reject(err)
						}
						let data = xml.xml
						// var _paySignjs = self.paysignjs(appid, nonce_str, 'prepay_id=' + tmp1[0], 'MD5', timeStamp);
						console.log(data, '------covert - data------')
						resolve(data)
					})
				} else {
					return reject(error)
					console.log(body, '----------------')
				}
				// if (!err && response.statusCode == 200) {
				// 	console.log(body, '---------------------' );
				// 	var prepay_id = self.getXMLNodeValue('prepay_id', body.toString("utf-8"));
				// 	var tmp = prepay_id.split('[');
				// 	var tmp1 = tmp[2].split(']');
				// 	//签名
				// 	var _paySignjs = self.paysignjs(appid, nonce_str, 'prepay_id=' + tmp1[0], 'MD5', timeStamp);
				// 	var args = {
				// 		appId: appid,
				// 		timeStamp: timeStamp,
				// 		nonceStr: nonce_str,
				// 		signType: "MD5",
				// 		package: tmp1[0],
				// 		paySign: _paySignjs
				// 	};
				// 	resolve(args);
				// } else {
				// 	console.log(body);
				// }
			});
		})
	},
	
	//支付回调通知
	notify: function(obj) {
		var output = "";
		if (obj.return_code == "SUCCESS") {
			var reply = {
				return_code: "SUCCESS",
				return_msg: "OK"
			};
			
		} else {
			var reply = {
				return_code: "FAIL",
				return_msg: "FAIL"
			};
		}
		// output = ejs.render(messageTpl, reply);
		return `<xml>
<return_code><![CDATA[${reply.return_code}]]></return_code>
<return_msg><![CDATA[${reply.return_msg}]]></return_msg>
</xml>`;
	},
};
module.exports = WxPay;
