var config = require('../config'); //配置文件 appid 等信息
// var Q = require("q");
var request = require("request");
var crypto = require('crypto');
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
	
	paysignjsapi: function(appid, attach, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type) {
		var ret = {
			appid: appid,
			attach: attach,
			body: body,
			mch_id: mch_id,
			nonce_str: nonce_str,
			notify_url: notify_url,
			openid: openid,
			out_trade_no: out_trade_no,
			spbill_create_ip: spbill_create_ip,
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
	sacnOrder: function (attach, body, bookingNo, total_fee) {
		var mch_id = config.wxMchId
		var openid = ''
		var notify_url = config.wxNotifyUrl
		return this.order(attach, body, mch_id, openid, bookingNo, total_fee, notify_url)
	},
	// 此处的attach不能为空值 否则微信提示签名错误
	order: function(attach, body, mch_id, openid, bookingNo, total_fee, notify_url) {
		return new Promise((resolve,reject) => {
			var appid = config.wxAppId;
			var nonce_str = this.createNonceStr();
			var timeStamp = this.createTimeStamp();
			var url = "https://api.mch.weixin.qq.com/pay/unifiedorder";
			var formData = "<xml>";
			formData += "<appid>" + appid + "</appid>"; //appid
			formData += "<attach>" + attach + "</attach>"; //附加数据
			formData += "<body>" + body + "</body>"; //商品或支付单简要描述
			formData += "<mch_id>" + mch_id + "</mch_id>"; //商户号
			formData += "<nonce_str>" + nonce_str + "</nonce_str>"; // 随机字符串，不长于32位
			formData += "<notify_url>" + notify_url + "</notify_url>"; // 支付成功后微信服务器通过POST请求通知这个地址
			formData += "<openid>" + openid + "</openid>"; // 扫码支付这个参数不是必须的
			formData += "<out_trade_no>" + bookingNo + "</out_trade_no>"; //订单号
			formData += "<spbill_create_ip></spbill_create_ip>"; //不是必须的
			formData += "<total_fee>" + total_fee + "</total_fee>"; //金额
			formData += "<trade_type>NATIVE</trade_type>"; //NATIVE会返回code_url ，JSAPI不会返回
			formData += "<sign>" + this.paysignjsapi(appid, attach, body, mch_id, nonce_str, notify_url, openid, bookingNo, '', total_fee, 'NATIVE') + "</sign>";
			formData += "</xml>";
			var self = this;
			request({
				url: url,
				method: 'POST',
				body: formData
			}, function(err, response, body) {
				if (!err && response.statusCode == 200) {
					console.log(body, '---------------------' );
					var prepay_id = self.getXMLNodeValue('prepay_id', body.toString("utf-8"));
					var tmp = prepay_id.split('[');
					var tmp1 = tmp[2].split(']');
					//签名
					var _paySignjs = self.paysignjs(appid, nonce_str, 'prepay_id=' + tmp1[0], 'MD5', timeStamp);
					var args = {
						appId: appid,
						timeStamp: timeStamp,
						nonceStr: nonce_str,
						signType: "MD5",
						package: tmp1[0],
						paySign: _paySignjs
					};
					resolve(args);
				} else {
					console.log(body);
				}
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
	// <xml>
	// 	<return_code><![CDATA[<%-return_code%>]]></return_code>
	// 	<return_msg><![CDATA[<%=return_msg%>]]></return_msg>
	// 	</xml>
		// output = ejs.render(messageTpl, reply);
		return output;
	},
};
module.exports = WxPay;
