var xml2js = require('xml2js')
var abc =`
<xml>
<ToUserName><![CDATA[toUser]]></ToUserName>
<FromUserName><![CDATA[fromUser]]></FromUserName>
<CreateTime>1348831860</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[this is a test]]></Content>
<MsgId>1234567890123456</MsgId>
</xml>
`
var demo1 =`<xml>
<ToUserName><![CDATA[toUser]]></ToUserName>
<FromUserName><![CDATA[FromUser]]></FromUserName>
<CreateTime>123456789</CreateTime>
<MsgType><![CDATA[event]]></MsgType>
<Event><![CDATA[subscribe]]></Event>
</xml>`
var demo2='<xml>' +
'<ToUserName><![CDATA[toUser]]></ToUserName>' +
'<FromUserName><![CDATA[fromUser]]></FromUserName>' +
'<CreateTime>1348831860</CreateTime>' +
'<MsgType><![CDATA[text]]></MsgType>' +
'<Content><![CDATA[this is a test]]></Content>' +
'<MsgId>1234567890123456</MsgId>'+
'</xml>'
xml2js.parseString(demo2,{explicitArray : false}, function(err, res) {
	console.log(err)
	console.log(res)
})