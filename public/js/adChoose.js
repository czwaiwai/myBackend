(function($){
	var province
	function AdChoose ($el, options) {
		var self = this
		this.$arr = $el.find('select')
		this.options = options
		if(!province) {
			this.getData(options.provinceUrl,'', function(str, list) {
				var province = str
				$(self.$arr[0]).empty().append(str)
				self.setDefaultVal()
			})
		} else {
			$(self.$arr[0]).empty().append(province)
		}
		this.bind()
	}
	AdChoose.prototype.setDefaultVal = function (opt) {
		var $one = $(this.$arr[0])
		var $two = $(this.$arr[1])
		var $three = $(this.$arr[2])
		var that = this
		var value = {
			province: '',
			city: '',
			area: ''
		}
		var options = $.extend(this.options, opt)
		if (options.provinceId) {
			$('option[value^="'+ options.provinceId+'"]',$one).attr('selected',true)
			value.province = $one.val()
			that.getData(that.options.cityUrl, options.provinceId, function(str) {
				$two.empty().append(str)
				$('option[value^="'+ options.cityId+'"]',$two).attr('selected',true)
				value.city = $two.val()
				that.getData(that.options.areaUrl, options.cityId, function(str) {
					$three.empty().append(str)
					$('option[value^="'+options.areaId+'"]',$three).attr('selected',true)
					value.area = $three.val()
					that.options.callback && that.options.callback(value)
				})
			})
		}
	}
	AdChoose.prototype.bind = function () {
		var $one = $(this.$arr[0])
		var $two = $(this.$arr[1])
		var $three = $(this.$arr[2])
		var that = this
		var value = {
			province: '',
			city: '',
			area: ''
		}
		$one.on('change',function () {
			var $this = $(this)
			value.province = $this.val()
			var tmpArr = $this.val().split(',')
			that.getData(that.options.cityUrl, tmpArr[0], function(str) {
				$two.empty().append(str)
				$three.empty().append('<option value="">请选择</option>')
			})
		})
		$two.on('change', function () {
			var $this = $(this)
			value.city = $this.val()
			var tmpArr =$this.val().split(',')
			that.getData(that.options.areaUrl, tmpArr[0], function(str) {
				$three.empty().append(str)
			})
		})
		$three.on('change',function() {
			var $this = $(this)
			value.area = $this.val()
			if ($this.val()) {
				that.options.callback && that.options.callback(value)
			}
		})
	}
	AdChoose.prototype.unbind = function () {
		var $one = $(this.$arr[0])
		var $two = $(this.$arr[1])
		var $three = $(this.$arr[2])
		$one.off('change')
		$two.off('change')
		$three.off('change')
	}
	AdChoose.prototype.getData= function (url,id,cb) {
		var newUrl = url
		if(id) {
			newUrl = url + '&addrId=' + id
		}
		return $.get(newUrl).done(function(res){
			if (res.code === 0) {
				var optionStr = '<option value="">请选择</option>'
				res.data.list.forEach(function(item){
					optionStr += '<option value="'+item.id+','+item.name+'" >'+item.name+'</option>'
				})
				cb(optionStr,res.data.list)
			}
		})
	}
	$.fn.adChoose =function (options, obj) {
		var defaults = {
			provinceId: '',
			cityId: '',
			areaId: '',
			provinceUrl:'province.json',
			cityUrl: 'city.json',
			areaUrl: 'area.json'
		}
		return this.each(function(){
			var $this = $(this)
			var instance = $this.data('instance')
			if(!instance) {
				instance = new AdChoose($this, $.extend(defaults,options))
				$this.data('instance', instance)
			}
			if(typeof options === 'string'){
				instance[options](obj)
			}
		})
	}
})(jQuery)
// $('#addressChoose').adChoose({
// 	provinceId: '110000',
// 	cityId: '140100',
// 	areaId: '140201',
// 	callback: function(data) {
// 		console.log(data)
// 	}
// })
// setTimeout(function(){
// 	$('#addressChoose').adChoose('unbind')
// 	console.log('unbind')
// },8000)