//jQuery validate methods
(function ($) {

  var regexp = {
    formatDate: /-*/ig,
    pwd: /^[\da-zA-Z]{6,20}$/,
    amount: /^(0|[1-9]\d{0,11})(\.\d{0,2})?$/,
    amountInt:/^(0|[1-9]\d{0,11})$/,
    bankno: /^\d{13,32}$/,
    name: /^[a-zA-Z\u4e00-\u9fa5]+$/,
    mobileTel: /^((\+86)|(86))?1\d{10}$/,
    verifyCode: /^\d{4}$/,
    postcode: /^\d{6}$/,
    rand: /^\d{4}$/,
    referenceCode: /^[\da-zA-Z]{2,10}$/,
    presetInfo: /[\|&;\$%@'\\<>\(\)\+,=]/,
    nickName: /^[\w\u4e00-\u9fa5\uf900-\ufa2d()（）-]*$/,
    address: /[^\x00-\xff]/ig
  };

  function err(methodName, msg) {
    $.validator.messages[methodName] = msg;
  };

  $.formatMoney = function (s, type) {
    if (/[^0-9\.]/.test(s))
      return "0";
    if (s == null || s == "")
      return "0";
    s = s.toString().replace(/^(\d*)$/, "$1.");
    s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
    s = s.replace(".", ",");
    var re = /(\d)(\d{3},)/;
    while (re.test(s))
      s = s.replace(re, "$1,$2");
    s = s.replace(/,(\d\d)$/, ".$1");
    if (type == 0) {// 不带小数位(默认是有小数位)
      var a = s.split(".");
      if (a[1] == "00") {
        s = a[0];
      }
    }
    return s;
  }

  $.formatMoneyWan = function (s) {
    var temp = "";
    //   var s=parseInt(val.replace(/\D/g,''));
    if (s < 10000) {
      temp = $.formatMoney(s, 0)
    } else {
      if (s % 10000 == 0) {
        temp = s / 10000 + "万";
      } else {
        if (s % 100 == 0) {
          temp = parseFloat(s / 10000).toFixed(2) + "万";
        } else {
          temp = $.formatMoney(s, 0);
        }
      }
    }
    return temp;
  }

  $.ValidateFloat = function (e, pnumber) {

    if (!/^\d+[.]?[1-9]{2}$/.test(pnumber)) {
      e.value = e.value.replace(/\d+[.]?[1-9]{2}/, '');
    }
    return false;

  }
  $.validator.addMethod('rateLv', function (value, element) {
    var val = value.replace(/[^(\d|\.)]/g, '');
    var _msg = "";
    if (val == "" || val == 0) {
      err('rateLv', "请输入1%-2.5%之间的数值");
      return false;
    }
    if (!/^\d+([.]?[1-9]{1,2})?$/.test(val)) {
      err('rateLv', "请输入1%-2.5%之间的数值,保留两位小数");
      return false;
    }
    if (!(val * 100 >= 100 && val * 100 <= 250)) {
      err('rateLv', "请输入1%-2.5%之间的数值,保留两位小数1");
      return false;
    }
    element.value = val;
    return true;
  });

  //小数位数
  $.validator.addMethod('smallNumber', function (value, element) {
    var intVal = parseInt(value);
    if ($.isNumeric(value) && intVal != value) {
      var pointer = (value + '').split('.');
      if (pointer[1] && pointer[1].length > 2) {
        return false;
      }
    }
    return true;
  }, "只允许两位小数");

  //远程验证
  $.validator.addMethod('remoteValidate', function (value, element, param) {
    var $el = $(element);
    var url = $el.data('remoteurl');
    if (!url) {
      return true;
    }
    var name = $el.prop("name");
    var dataObj = {};
    if ($.isArray(param)) {
      var $mobile = $(param[0]);
      var sign = param[1];
      dataObj["mobile"] = $mobile.data('mobile') || $mobile.val();
      dataObj["apkind"] = sign;
    }
    dataObj[name] = value;
    var valid = false;
    var _msg = '';
    $.ajax({
      url: url,
      type: "post",
      cache: false,
      dataType: 'json',
      async: false,
      data: dataObj,
      success: function (data) {
        if (!data.retCode) {
          _msg = "数据格式错误";
          err('remoteValidate', _msg);
          valid = false;
        }
        var result = data.data;
        if (data.retCode + '' == '0') {
          valid = true;
        } else {
          _msg = data.retMsg;
          err('remoteValidate', _msg);
          valid = false;
        }
      }
    });
    return valid;
  });

  $.validator.addMethod('invest', function (value, element) {
    var val = value;
    var $el = $(element);
    var maxAmount = parseInt($el.data('maxamount'));
    var account = $el.data('account');
    var interestRate = $el.data('interestRate');//
    var isday = $el.data('isday');//是否是日 
    var rateRe = 0;
    if (isday) {
      var day = $el.data('day');
      rateRe = val * parseInt(day) * parseFloat(interestRate).toFixed(4);
    } else {
      rateRe = val * parseFloat(interestRate).toFixed(2);
    }
    var $elRate = $('#rateAmount');
    var _msg = "";
    $elRate.show().find('em').text(parseFloat(rateRe).toFixed(2));
    if (val == '' || val == 0) {
      _msg = "请输入投资金额"
      err('invest', _msg);
      $el.val('');
      return false;
    }
    if (val > maxAmount) {
      _msg = "投资金额不能大于可投金额"
      err('invest', _msg);
     // $el.val($.formatMoney(val, 0));
      return false;
    }

   // $el.val($.formatMoney(val, 0));
    return true;

  });

  $.validator.addMethod('cashIn', function (value, element) {
    var val = value;
    var $el = $(element);
    var $otherEL = $("#" + $el.data("formatshow"));
    var $real = $('input[name="' + $el.data("real") + '"]');
    var _msg = "";

    if (val == '' || val == 0) {
      _msg = "请输入投资金额";
      $el.val('');
      err('cashIn', _msg);
      return false;
    }
    if (val > 99000000) {
      _msg = "金额过大";
      err('cashIn', _msg);
      val = 99000000;
   //   $el.val($.formatMoney(val, 0));
      $real.val(val);
      $otherEL.text($.formatMoney(val, 0));
      return false;
    }
   // $el.val($.formatMoney(val, 0));
    $real.val(val);
    $otherEL.text($.formatMoney(val, 0));
    return true;

  });

  $.validator.addMethod('money', function (value, element) {
    var val = value.replace(/\D/g, '').replace(/^[0*]/, '');

    var $el = $(element);
    var maxVal=parseInt($el.data("limitTarget"))/2;    
    var _msg = "";

    if (val == '' || val == 0) {
      _msg = "请输入本金";
      val = 0;
      $el.val('');
      err('money', _msg);
      $el.trigger('update', [parseInt(val),false]);
      return false;
    }
    if (val < 2000) {
      _msg = "本金最小为2千元";
      $el.val($.formatMoney(val, 0));
      err('money', _msg);
      $el.trigger('update', [parseInt(val),false]);
      return false;
    }
    if (val >maxVal) {
	    _msg = "若配资金额大于"+$.formatMoneyWan(maxVal)+"元，请联系客服4008-333-235";
	    val = maxVal;
	    $el.val($.formatMoney(val, 0));
	    err('money', _msg);
	    $(element).trigger('update', [parseInt(val),true]);
	    return false;
    } 
    if (val % 1000 != 0) {
      _msg = "本金必须是1000的整数倍";
      $el.val($.formatMoney(val, 0));
      err('money', _msg);
      $(element).trigger('update', [parseInt(val),false]);
      return false;
    }
    $el.val($.formatMoney(val, 0));
    $(element).trigger('update', [parseInt(val),true]);
    return true;

  });

  $.validator.addMethod('address', function (value, element) {
    var _b = true;
    var _msg = null;
    var _label = $(element).data('label') || '';

    if ($.trim(value) == '') {
      _msg = _label + '不能为空';
    }
    ;

    var cn_str = $.trim(value).match(/[^\x00-\xff]/ig);
    var len_in_bytes = value.length + (cn_str == null ? 0 : cn_str.length);

    if (len_in_bytes > 120) {
      _msg = _label + '长度超过范围';
    }
    ;

    if (_msg) {
      err('address', _msg);
      _b = false;
    }
    ;

    return _b;
  });

  $.validator.addMethod('presetInfo', function (value, element) {
    var _b = true;
    var _msg = null;
    if ($.trim(value) == '') {
      _msg = '预留信息不能为空';
    } else if (regexp.presetInfo.test(value)) {
      _msg = '预留信息不能包含特殊字符';
    } else if (value.length > 20) {
      _msg = '预留信息不能大于20个字符';
    }
    ;
    if (_msg) {
      err('presetInfo', _msg);
      _b = false;
    }
    ;
    return _b;
  });

  $.validator.addMethod('nickName', function (value, element) {
    var _b = true;
    var _msg = null;
    var user= $(element).data('label') || "用户名";
    if (value == '') {
      _msg = user+'不能为空';
    } else if (!regexp.nickName.test(value)) {
      _msg = user+'不能包含全角字符及标点符号';
    } else if (value.length > 30 || value.length < 2) {
      _msg = user+'长度应为2~30位';
    }
    ;
    if (_msg) {
      err('nickName', _msg);
      _b = false;
    }
    ;
    return _b;
  });
  $.validator.addMethod('integer', function (value, element) {
	  var _b = true;
	  var _msg = "请输入整数";
	  if($.isNumeric(value) && (value+"").indexOf(".")<0){
		 _b=true;
	  }else{
		 err('nickName', _msg);
		 _b=false;
	  }
	  return _b;
  });
  //推荐人代码校验
  $.validator.addMethod('referenceCode', function (value, element) {
    if (value == '') {
      return true;
    }
    ;
    return regexp.referenceCode.test(value);
  }, '请输入2-10位字母、数字或二者组合');

  $.validator.addMethod('select', function (value, element) {
    if (!value || value == 'N') {
      return false;
    }
    ;
    return true;
  }, '请选择');
  //开始小于结束日期
  $.validator.addMethod('endThanStartDate', function (value, element) {
    var sd = $(element).data('sd') || 'input[name="startDate"]';
    var _sVal = String($(sd).val()).replace(regexp.formatDate, '');
    var _eVal = value.replace(regexp.formatDate, '');
    //如果有任一为空，则返回true
    if (_sVal == '' || _eVal == '') return true;
    return _sVal <= _eVal;
  }, '开始日期不能大于结束日期');

  //身份证号
  $.validator.addMethod('IDNO', function (value, element) {
    var $el = $(element);

    var _maskedNo = $el.data('masked');
    //检查是否有加密账号显示设置，如果值与加密账号相等，则校验通过
    if (_maskedNo && String(_maskedNo) == value) {
      return true;
    };

    var validYear = $el.data('validyear');
    var _msg = idno(value, validYear);
    var _b = false;
    if (_msg == 'Y') _b = true;
    else err('IDNO', _msg);
    return _b;
  });

  //身份证转换校验
  $.validator.addMethod('IDConvert', function (value, element) {
    if (value.length == '15') {
      err('IDConvert', '您开通银行卡使用的是15位身份证，请进行 <a class="J_IDConvert cblue" data-value="' + value + '" href="javascript:void(0)">15/18位转换</a>');
      return false;
    }
    ;
    return true;
  });

  //银行卡号
  $.validator.addMethod('bankAccount', function (value, element) {
    return regexp.bankno.test(value);
  }, '请输入正确的银行卡号');

  //账户名称
  $.validator.addMethod('bankAccountName', function (value, element) {
    var _b = true;
    var _msg = null;
    if (value == '') {
      _msg = '账户名称不能为空';
    } else if (value.length > 4 || !regexp.name.test(value)) {
      _msg = '请输入正确的账户名称';
    }
    if (_msg) {
      err('bankAccountName', _msg);
      _b = false;
    }
    return _b;
  });
  //账户名称
  $.validator.addMethod('bankName', function (value, element) {
    var _b = true;
    var _msg = null;
    if (value == '') {
      _msg = '开户行不能为空';
    } else if (!regexp.name.test(value)) {
      _msg = '请输入正确的名称';
    }
    if (_msg) {
      err('bankName', _msg);
      _b = false;
    }
    return _b;
  });


  //手机号
  $.validator.addMethod('mobileTel', function (value, element) {
    var _b = true;
    var _msg = null;
    if (value == '') {
      _msg = '手机号码不能为空';
    } else if (!regexp.mobileTel.test(value)) {
      _msg = '请输入正确的手机号码';
    }
    if (_msg) {
      err('mobileTel', _msg);
      _b = false;
    }
    return _b;
  });

  //密码
  $.validator.addMethod('password', function (value, element) {
    var labelName = $(element).data('label') || '密码';
    var _b = true;
    var _msg = null;
    var $el = $(element);

    //查找安全控件 
    var $safeObj = $el.data('safeid') ? $('#' + $el.data('safeid')) : null;
    //若安全控件存在
    if ($safeObj && $safeObj[0]) {
      var $safeWrap = $safeObj.closest('.J_safeObjWrap');
      //安全控件容器可见，且安全控件可用
      if ($safeWrap.is(':visible') && $safeWrap.data('status') == 'Y') {
        var safeObj = $safeObj[0];
        value = safeObj.GetPassword();
        $el.val(value);
      }
      ;
    }
    ;
    if ($.trim(value) == '') {
      _msg = '不能为空';
    } else if (!regexp.pwd.test(value)) {
      _msg = '请输入6-20位字母、数字或二者组合';
    }
    ;
    if (_msg) {
      err('password', labelName + _msg);
      _b = false;
    }
    ;
    return _b;
  });

  //邮政编码
  $.validator.addMethod('postcode', function (value, element) {
    var _b = true;
    var _msg = null;
    if (value == '') {
      _msg = null;
    } else if (!regexp.postcode.test(value)) {
      _msg = '请输入6位数字邮政编码';
    }
    ;
    if (_msg) {
      err('postcode', _msg);
      _b = false;
    }
    return _b;
  });

  //图形验证码
  $.validator.addMethod('rand', function (value, element) {
    var _b = true;
    var _msg = null;
    if ($.trim(value) == '') {
      _msg = '验证码不能为空';
    } else if (!regexp.rand.test(value)) {
      _msg = '请输入4位数字验证码';
    }
    ;
    if (_msg) {
      err('rand', _msg);
      _b = false;
    }
    ;
    // if(!_b) $(element).trigger('click');
    //特殊处理，需要在此处调用randCode不合法的函数
    if (!_b) $(element).randCode('fail');
    return _b;
  });

  //动态验证码
  $.validator.addMethod('verifyCode', function (value, element) {
    var _b = true;
    var _msg = null;
    if ($.trim(value) == '') {
      _msg = '短信验证码不能为空';
    } else if (!regexp.verifyCode.test(value)) {
      _msg = '请输入4位数字短信验证码';
    }
    if (_msg) {
      err('verifyCode', _msg);
      _b = false;
    }
    return _b;
  });

  //金额
  $.validator.addMethod('amount', function (value, element) {
    var labelName = $(element).data('label') || '金额';
    var unit = $(element).data('unit') || '元';

    var _msg = checkAmount(value, element, labelName, unit);
    var _b = false;
    if (_msg == 'Y') _b = true;
    else err('amount', _msg);
    return _b;
  });


  //高档金（份）额
  $.validator.addMethod('highAmount', function (value, element) {
    var labelName = $(element).data('label') || '高档份额';
    var unit = $(element).data('unit') || '元';
    var _msg = checkAmount(value, element, labelName, unit);
    var _b = false;
    if (_msg == 'Y') {
      var $midAmt = $('input[name="middleAmount"]');
      if (value <= Number($midAmt.val())) {
        err('highAmount', labelName + '应大于' + $midAmt.data('label') || '中档份额');
      } else {
        _b = true;
      }
    } else {
      err('highAmount', _msg);
    }
    return _b;
  });

  //中档金（份）额
  $.validator.addMethod('middleAmount', function (value, element) {
    var labelName = $(element).data('label') || '中档份额';
    var unit = $(element).data('unit') || '元';
    var _msg = checkAmount(value, element, labelName, unit);
    var _b = false;
    if (_msg == 'Y') {
      var $highAmt = $('input[name="highAmount"]');
      var $lowAmt = $('input[name="lowAmount"]');
      if (value >= Number($highAmt.val())) {
        err('middleAmount', labelName + '应小于' + $highAmt.data('label') || '高档份额');
      } else if (value <= Number($lowAmt.val())) {
        err('middleAmount', labelName + '应大于' + $lowAmt.data('label') || '低档份额');
      } else {
        _b = true;
      }
    } else {
      err('middleAmount', _msg);
    }
    return _b;
  });

  //低档金（份）额
  $.validator.addMethod('lowAmount', function (value, element) {
    var labelName = $(element).data('label') || '低档份额';
    var unit = $(element).data('unit') || '元';
    var _msg = checkAmount(value, element, labelName, unit);
    var _b = false;
    if (_msg == 'Y') {
      var $middleAmt = $('input[name="middleAmount"]');
      if (value >= Number($middleAmt.val())) {
        err('lowAmount', labelName + '应小于' + $middleAmt.data('label') || '中档份额');
      } else {
        _b = true;
      }
    } else {
      err('lowAmount', _msg);
    }
    ;
    return _b;
  });

  //添利宝发起赎回余额
  $.validator.addMethod('tlRedeemBalance', function (value, element) {
    var labelName = $(element).data('label') || '金额';
    var bVal = Number($('input[name="bidBalance"]').val());
    if (bVal && value > bVal) {
      err('tlRedeemBalance', labelName + '不能高于发起申购余额');
      return false;
    }
    return true;
  });


  //金额份额校验函数
  function checkAmount(val, el, name, unit) {
    var $el = $(el);

    if ($.trim(val) == '') {
      return  name + '不能为空';
    }
    ;

    if (Number(val) == 0) {
      return  name + '不能为零';
    }
    ;

    if (!regexp.amount.test(val)) {
      return '请输入有效的' + name;
    }
    ;

    var _step = $el.data('step');
    if (_isNumber(_step) && _step + '' != '0' && val % Number(_step) != 0) {
      return name + '应为' + _step + '的倍数';
    }
    ;

    var _fp = $el.data('fp');
    if (_isNumber(_fp) && val > Number(_fp)) {
      return '申请超出快捷支付' + $.util.formatNumber(_fp) + '元的限额，请到我的银行卡中提升额度！';
    }
    ;

    //每日最大限额
    var _daymax = $el.data('daymax');
    if (_isNumber(_daymax) && val > Number(_daymax)) {
      var _dayMaxAlert = $el.data('daymaxalert');
      if (_dayMaxAlert) return _dayMaxAlert;

      _daymax = $.util.formatNumber(_daymax) + unit;

      return name + '不能大于' + _daymax;
    }
    ;

    //基金最小限额
    var _fundmin = $el.data('fundmin');
    if (_isNumber(_fundmin) && val < Number(_fundmin)) {
      var _fundMinAlert = $el.data('fundminalert');
      if (_fundMinAlert) return _fundMinAlert;

      _fundmin = $.util.formatNumber(_fundmin) + unit;

      return name + '不能大于' + _fundmin;
    }
    ;

    //基金最大限额
    var _fundmax = $el.data('fundmax');
    if (_isNumber(_fundmax) && val > Number(_fundmax)) {
      var _fundMaxAlert = $el.data('fundmaxalert');
      if (_fundMaxAlert) return _fundMaxAlert;

      _fundmax = $.util.formatNumber(_fundmax) + unit;

      return name + '不能大于' + _fundmax;
    }
    ;


    var _min = $el.data('min');
    if (_isNumber(_min) && val < Number(_min)) {

      var _minAlert = $el.data('minalert');
      if (_minAlert) return _minAlert;

      var _minLabel = $el.data('minlabel');
      if (_minLabel) {
        _min = _minLabel;
      } else {
        _min = $.util.formatNumber(_min) + unit;
      }
      ;

      return name + '不能小于' + _min;
    }
    ;


    var _max = $el.data('max');
    if (_isNumber(_max) && val > Number(_max)) {
      var _maxAlert = $el.data('maxalert');
      if (_maxAlert) return _maxAlert;

      var _maxLabel = $el.data('maxlabel');
      if (_maxLabel) {
        _max = _maxLabel;
      } else {
        _max = $.util.formatNumber(_max, ",##0") + unit;
      }
      ;
      return name + '不能大于' + _max;
    }
    ;


    //高端理财输入金额不能大于预约金额
    var _reserve = $el.data('reserve');
    if (_isNumber(_reserve) && val > Number(_reserve)) {
      return name + '不能大于预约金额' + $.util.formatNumber(_reserve) + unit;
    }
    ;

    var _int = val.indexOf('.') > -1 ? val.split('.')[0] : val;
    if (_int.length > 12) {
      return name + '数值过大';
    }
    ;

    return 'Y';
  };

  function _isNumber(n) {
    if (typeof n == 'undefined' || $.trim(n) == '' || isNaN(n)) {
      return false;
    }
    ;
    return true;
  };

  //身份证校验函数
  function idno(val, validYear) {
    var city = {11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江 ", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北 ", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏 ", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外 "};

    if (!val || !/(^\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/i.test(val)) {
      return '身份证号格式错误';
    }
    if (validYear && !isAdult(val, validYear)) {
      return '暂不支持未满18周岁投资人开设基金账户';
    }
    if (!city[val.substr(0, 2)]) {
      return '身份证号地址编码错误';
    }
    //18位身份证需要验证最后一位校验位
    if (val.length == 18) {
      val = val.split('');
      //∑(ai×Wi)(mod 11)
      //加权因子
      var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
      //校验位
      var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
      var sum = 0;
      var ai = 0;
      var wi = 0;
      for (var i = 0; i < 17; i++) {
        ai = val[i];
        wi = factor[i];
        sum += ai * wi;
      }
      if (parity[sum % 11] != val[17]) {
        return '身份证号校验位错误';
      }
    }
    return 'Y';
  };//idno end

  function isAdult(val, validYear) {
    var strYear, strMonth, strDay;
    if (val.length == 15) {
      strYear = "19" + val.substring(6, 8);
      strMonth = val.substring(8, 10);
      strDay = val.substring(10, 12);
    } else {
      strYear = val.substring(6, 10);
      strMonth = val.substring(10, 12);
      strDay = val.substring(12, 14);
    }
    ;
    try {
      var strdt1 = strYear + "/" + strMonth + "/" + strDay;
      var dt1 = new Date(Date.parse(strdt1));//身份证日期
      var dt2 = new Date(Date.parse(validYear));//合法日期
      return dt1 < dt2;
    } catch (e) {
      return true;
    }
  };//isAdult end

  function checkPWD(val, el, labelName) {
    if ($.trim(val) == '') {
      errMsg(labelName + '不能为空');
      return false;
    }
    if (!regexp.pwd.test(val)) {
      errMsg(labelName + '请输入6-20位字母、数字或二者组合');
      return false;
    }
    //校验是否简单密码，并且有证件号码在当前页面
    var $idno = $('input[name="idno"]');
    if ($(el).data('simplecheck') && $idno[0]) {
      if (this.isSimplePwd($idno.val(), val)) {
        errMsg(labelName + '过于简单，或者和证件号码中的连续字符串相同，请重新设定');
        return false;
      }
    }
    return true;
  };//check PWD

  function isSimplePWD(idno, pass) {
    //判断是否简单密码
    var isSimple = true;
    var step = pass.charCodeAt(1) - pass.charCodeAt(0);

    for (var i = 2, l = pass.length; i < l; i++) {
      if (pass.charCodeAt(i) - pass.charCodeAt(i - 1) != step) {
        isSimple = false;
      }
    }
    //如果是等差密码，直接判定是简单密码了
    if (isSimple) return true;

    //判断是否和证件号码中的几位相等，如果等于证件号码中的几位，那么认为是简单密码
    var flag = false;

    if (idno.indexOf(pass) > -1) flag = true;

    if (flag) return flag;

    //对于身份证外的其他证件号码，考虑去除字母之后不足六位的情况，注意默认密码是证件号码的后六位数字
    idno = idno.replace(/\D*/g, "");

    //对于证件号码不足六位的，如果密码和证件号码前面补零之后相同，认为是简单密码
    if (idno.length < 6) {

      var prefix_0_idno = "000000" + idno;

      prefix_0_idno = prefix_0_idno.substring(prefix_0_idno.length - 6);

      if (prefix_0_idno.equals(pass)) flag = true;

    }
    return flag;
  };//check simple PWD

})(jQuery);