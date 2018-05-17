/**
 * Created by Administrator on 2018/5/17 0017.
 */
function str2asc(strstr){
	return ("0"+strstr.charCodeAt(0).toString(16)).slice(-2);
}
function asc2str(ascasc){
	return String.fromCharCode(ascasc);
}

module.exports.UrlEncode = function (str){
	var ret="";
	var strSpecial="!\"#$%&'()*+,/:;<=>?[]^`{|}~%";
	var tt= "";
	
	for(var i=0;i<str.length;i++){
		var chr = str.charAt(i);
		var c=str2asc(chr);
		tt += chr+":"+c+"n";
		if(parseInt("0x"+c) > 0x7f){
			ret+="%"+c.slice(0,2)+"%"+c.slice(-2);
		}else{
			if(chr==" ")
				ret+="+";
			else if(strSpecial.indexOf(chr)!=-1)
				ret+="%"+c.toString(16);
			else
				ret+=chr;
		}
	}
	return ret;
}
module.exports.UrlDecode = function (str){
	var ret="";
	for(var i=0;i<str.length;i++){
		var chr = str.charAt(i);
		if(chr == "+"){
			ret+=" ";
		}else if(chr=="%"){
			var asc = str.substring(i+1,i+3);
			if(parseInt("0x"+asc)>0x7f){
				ret+=asc2str(parseInt("0x"+asc+str.substring(i+4,i+6)));
				i+=5;
			}else{
				ret+=asc2str(parseInt("0x"+asc));
				i+=2;
			}
		}else{
			ret+= chr;
		}
	}
	return ret;
}