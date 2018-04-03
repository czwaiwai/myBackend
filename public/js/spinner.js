/**
 * Created by Administrator on 2018/4/3 0003.
 */
(function($){
	function spinner ($el, options) {
		this.options = options
		this.$el = $el
		$el.addClass('spinner')
		this.$input = $el.find('input')
		options.default && this.$input.val(options.default)
		this.$prev = $('<a class="prev" href="javascript:void(0)" >-</a>')
		this.$next = $('<a class="next" href="javascript:void(0)" >+</a>')
		$el.prepend(this.$prev)
		$el.append(this.$next)
		this.beforeVal = this.options.default || 1
		this.render(options.default)
		$el.on('change keyup', 'input', function(){
			var $this = $(this)
			self.render($this.val())
		})
		var self = this
		$el.on('click', '.prev', function() {
			var $this = $(this)
			var val = parseInt(self.$input.val())
			val--
			self.render(val)
		})
		$el.on('click', '.next', function() {
			var val = parseInt(self.$input.val())
			val++
			self.render(val)
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
			max:99,
			default:1,
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