/**
 * Created by Administrator on 2018/4/26 0026.
 */
// 文本消息
exports.txtMsg = function (toUser, formUser, content) {
	let tpl = `<xml>
<ToUserName><![CDATA[${toUser}]]></ToUserName>
<FromUserName><![CDATA[${fromUser}]]></FromUserName>
<CreateTime>${new Data.getTime()}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${content}]]></Content>
</xml>`
	return tpl
}
// exports.txtMsg = function(toUser,fromUser,content){
// 	var xmlContent =  "<xml><ToUserName><![CDATA["+ toUser +"]]></ToUserName>";
// 	xmlContent += "<FromUserName><![CDATA["+ fromUser +"]]></FromUserName>";
// 	xmlContent += "<CreateTime>"+ new Date().getTime() +"</CreateTime>";
// 	xmlContent += "<MsgType><![CDATA[text]]></MsgType>";
// 	xmlContent += "<Content><![CDATA["+ content +"]]></Content></xml>";
// 	return xmlContent;
// }
//  图片消息
exports.imgMsg = function (toUser, fromUser, MediaId) {
	let tpl = `<xml>
<ToUserName><![CDATA[${toUser}]]></ToUserName>
<FromUserName><![CDATA[${fromUser}]]></FromUserName>
<CreateTime>${new Date().getTime()}</CreateTime>
<MsgType><![CDATA[image]]></MsgType>
<Image><MediaId><![CDATA[${MediaId}]]></MediaId></Image>
</xml>`
}
//  图文消息
exports.graphicMsg = function(toUser,fromUser,contentArr){
	var xmlContent =  "<xml><ToUserName><![CDATA["+ toUser +"]]></ToUserName>";
	xmlContent += "<FromUserName><![CDATA["+ fromUser +"]]></FromUserName>";
	xmlContent += "<CreateTime>"+ new Date().getTime() +"</CreateTime>";
	xmlContent += "<MsgType><![CDATA[news]]></MsgType>";
	xmlContent += "<ArticleCount>"+contentArr.length+"</ArticleCount>";
	xmlContent += "<Articles>";
	contentArr.map(function(item,index){
		xmlContent+="<item>";
		xmlContent+="<Title><![CDATA["+ item.Title +"]]></Title>";
		xmlContent+="<Description><![CDATA["+ item.Description +"]]></Description>";
		xmlContent+="<PicUrl><![CDATA["+ item.PicUrl +"]]></PicUrl>";
		xmlContent+="<Url><![CDATA["+ item.Url +"]]></Url>";
		xmlContent+="</item>";
	});
	xmlContent += "</Articles></xml>";
	return xmlContent;
}
