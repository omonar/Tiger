;(function($) {
	'use strict';
				
	/* 
		scrollTopBtn.js - add a "scroll to top" button
	*/

	$.fn.scrollToTopBtn = function() {
		
		var tt = getTranslations({
					scrollTopTooltip:		'Top'
				}),
			
			scrollTimeout,
			
			ns = 'lst_' + Math.floor(Math.random() * 10000),
			
			a = $('<a>', {
					'class': 		'large button icon-arrow-up',
					'id':			'scrollup',
					'role':			'button'
				}).appendTo($(this).eq(0)),
			
			toggleBtn = function(e) {
					
					scrollTimeout = null;
					
					if ($(window).scrollTop() > 0) {
						if (a.is(':hidden')) {
							a.fadeIn(500);
						}
					} else {
						a.fadeOut(500);
					}
					
					return true;
				};
			
		if (tt.scrollTopTooltip) {
			a.addTooltip(tt.scrollTopTooltip, {
					touchToggle:	false,
					pos:			[ 2, 1, 0, 1 ]
				});
		}
		
		$(window).on('scroll.' + ns, function() {
				
				clearTimeout(scrollTimeout);
				
				scrollTimeout = setTimeout(toggleBtn, 100);
			});
		
		a.on('click.' + ns, function() {
				$('body, html').animate({ 
					scrollTop: 		0 
				}, 500);
				
				a.trigger('removeTooltip');
				
				return false;
			});
		
		return this;
	};
	
}(jQuery));