/**
 * Created by waiwai on 17-8-3.
 */
const rules = {
	mobileTel: /^1\d{10}$/,
	nickName: /^[\w\u4e00-\u9fa5\uf900-\ufa2d()（）-]*$/,
	amount: /^(0|[1-9]\d{0,11})(\.\d{0,2})?$/
}

module.exports={
	customValidators: {
	  isMobile: function (value) {
	    return rules.mobileTel.test(value)
	  },
		isSame: function (value, other) {
	    return value === other
		},
	  isEqual:function(value,code){
      console.log(value,code, value === code,"比较值是否相同")
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