/**
 * Created by Administrator on 2018/4/3 0003.
 */
(function($){
	function spinner ($el, options) {
		this.options = options
		this.$el = $el
		$el.addClass('spinner')
		this.$input = $el.find('input')
		if(!this.$input.val()){
			options.default && this.$input.val(options.default)
		} else {
			this.options.default = this.$input.val()
		}
		this.$prev = $('<a class="prev" href="javascript:void(0)" >-</a>')
		this.$next = $('<a class="next" href="javascript:void(0)" >+</a>')
		$el.prepend(this.$prev)
		$el.append(this.$next)
		this.beforeVal = this.options.default || 1
		this.render(options.default)
		var self = this
		$el.on('change keyup', 'input', (function(that){
			var timer
			return function() {
					clearTimeout(timer)
					var timer = setTimeout(function() {
						that.render(that.$input.val())
						options.callback.call(that.$el,that.$input.val())
					},150)
			}
		})(this))
		$el.on('click', '.prev', function() {
			var $this = $(this)
			if ($this.hasClass('disabled')) return ;
			var val = parseInt(self.$input.val())
			val--
			self.render(val)
			options.callback.call($el,val)
		})
		$el.on('click', '.next', function() {
			var $this = $(this)
			if ($this.hasClass('disabled')) return ;
			var val = parseInt(self.$input.val())
			val++
			self.render(val)
			options.callback.call($el,val)
		})
	}
	spinner.prototype.render = function (num) {
		if(isNaN(num)) {
			num = this.beforeVal
		} else {
			this.beforeVal = num
		}
		this.$input.val(num)
		if(num >= this.options.max) {
			this.$next.addClass('disabled')
			this.$input.val(this.options.max)
		} else {
			this.$next.removeClass('disabled')
		}
		if(num <= this.options.min) {
			this.$input.val(this.options.min)
			this.$prev.addClass('disabled')
		} else{
			this.$prev.removeClass('disabled')
		}
	}
	$.fn.Spinner  = function (options) {
		var defaultOptions = {
			min:1,
			max:999,
			default:1,
			callback:function (num) {}
		}
		return this.each(function (){
			var $this = $(this)
			var instance = $this.data('instance')
			if(!instance) {
				instance= new spinner($this,$.extend(defaultOptions,options))
				$this.data('instance', instance)
			}
		})
	}
})(jQuery)