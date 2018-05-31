/**
 * Created by Administrator on 2018/4/28 0028.
 */
var crypto = require('crypto');
function md5(string){
	return crypto.createHash('md5').update(string, 'utf8').digest('hex')
}

let url = "https://api.mch.weixin.qq.com/pay/unifiedorder",// 下单请求地址
	appid = '',
	body = '白石山商品购买',
	attach = '',
	mch_id = '',
	key = '',
	notify_url = 'http://www.bssfood.com/order/notify',
	out_trade_no = '5200000010',// 微信会有自己订单号、我们自己的系统需要设置自己的订单号
	product_id = '5ae428c8bd8ba426a4b45d79',
	total_fee = 1420,// 注意，单位为分
	trade_type = 'NATIVE',// 交易类型，JSAPI--公众号支付、NATIVE--原生扫码支付、APP--app支付
	nonce_str = '',// 随机字符串32位以下
	stringA = `appid=${appid}&attach=${attach}&body=${body}&mch_id=${mch_id}&nonce_str=${nonce_str}&notify_url=${notify_url}&out_trade_no=${out_trade_no}&product_id=${product_id}&total_fee=${total_fee}&trade_type=${trade_type}`,
	stringSignTemp = stringA + "&key="+key, //注：key为商户平台设置的密钥key
	sign = md5(stringSignTemp).toUpperCase();  //注：MD5签名方式

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

console.log(formData)