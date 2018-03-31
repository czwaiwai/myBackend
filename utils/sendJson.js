/**
 * Created by waiwai on 17-7-18.
 */

function succJson(obj,msg){
    return  {
      code:0,
	    message:msg || "操作成功",
      data:obj
    }
}
function errJson(obj,msg){
    return  {
      code:-1,
	    message:msg || "操作错误",
      data:obj
    }
}
module.exports={
    succJson,
    errJson,
}