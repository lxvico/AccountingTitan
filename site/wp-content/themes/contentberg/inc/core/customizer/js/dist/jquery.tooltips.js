/**
 * Bunyad tooltips. Based on tiptop.
 */
(function($) {

	const pluginName = 'bunyadToolTip';
	const defaults = {
		offsetVertical: 10, // Vertical offset
		offsetHorizontal: 10  // Horizontal offset
	};

	function BunyadToolTip(element, options) {
		this.el      = element;
		this.$el     = $(this.el);
		this.options = $.extend({}, defaults, options);
		$this        = this;

		const init = () => {

			this.$el
				.mouseenter(setup)
				.mouseleave(function() {
					$('.bunyad-tooltip').remove();
					$(this).attr('title', $(this).data('title'));
				})
				.mousemove(setPosition);
		};

		/**
		 * Setup a tooltip.
		 */
		const setup = function() {
			var title = $(this).attr('title'),
				tooltip;
				
			var text = title;
			if ($this.options.content) {
				var text = $this.options.content.call(this);
			}

			if (!text) {
				return;
			}

			tooltip = $('<div class="bunyad-tooltip"></div>').html(text);
			if ($this.options.class) {
				tooltip.addClass($this.options.class);
			}

			tooltip.appendTo('body');

			$(this).data('title', title).removeAttr('title');
		};

		/**
		 * Set position for the tooltip.
		 */
		const setPosition = function(e) {
			var tooltip = $('.bunyad-tooltip'),
				top = e.pageY + $this.options.offsetVertical,
				bottom = 'auto',
				left = e.pageX + $this.options.offsetHorizontal,
				right = 'auto';

			if (top + tooltip.outerHeight() >= $(window).scrollTop() + $(window).height()){
				bottom = $(window).height() - top + ($this.options.offsetVertical * 2);
				top = 'auto';
			}

			if (left + tooltip.outerWidth() >= $(window).width()){
				right = $(window).width() - left + ($this.options.offsetHorizontal * 2);
				left = 'auto';
			}

			$('.bunyad-tooltip').css({
				'top': top, 
				'bottom': bottom, 
				'left': left, 
				'right': right
			});
		};

		init();
	}

	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if (!$.data(this, pluginName)) {
				$.data(this, pluginName, new BunyadToolTip(this, options));
			}
		});
	};

})(jQuery);