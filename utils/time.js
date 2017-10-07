/**
 * Created by waiwai on 17-7-24.
 */
function addZero(num){
    return  num<10?'0'+num:num;
}
function timeFormat(mydate){
   let date=new Date(mydate);
   let month=(date.getMonth() + 1)<10?'0'+(date.getMonth() + 1):(date.getMonth() + 1);
   return {
        date:date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + addZero(date.getMonth() + 1),
        day : date.getFullYear() + "-" + addZero(date.getMonth() + 1) + "-" + addZero(date.getDate()),
        minute : date.getFullYear() + "-" + addZero(date.getMonth() + 1) + "-" + addZero(date.getDate()) + " " +
        date.getHours() + ":" + addZero(date.getMinutes())
   };
}
module.exports=timeFormat;