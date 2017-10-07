/**
 * Created by waiwai on 17-7-18.
 */

function succJson(obj,msg){
    return  {
        retCode:0,
        retStatus:msg || "操作成功",
        data:obj
    }
}
function errJson(obj,msg){
    return  {
        retCode:-1,
        retStatus:msg || "操作错误",
        data:obj
    }
}
module.exports={
    succJson,
    errJson,
}