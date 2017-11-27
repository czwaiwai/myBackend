/**
 * Created by waiwai on 17-8-3.
 */


module.exports={
    customValidators: {
        isEqual:function(value,code){
            console.log(value,code,"比较值是否相同")
            return value===code;
        },
        isTooShort:function(value,num){
            return  value.length>=num;
        },
        isArray: function(value) {
            return Array.isArray(value);
        },
        gte: function(param, num) {
            return param >= num;
        }
    }
}