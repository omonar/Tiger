;(function($, $window, $html, $body) {
	'use strict';
				
	/* 
		scrollTopBtn.js - add a "scroll to top" button
	*/

	$.fn.scrollToTopBtn = function() {
		
			var a = $('<a>', {
							'class': 	'scrollup button icon-arrow-up',
							'role':		'button'
						}).appendTo($(this).eq(0));
				
			$window.on('scroll', function() { 
					a.toggleClass('show', $window.scrollTop() > 16)
					return true;
				});
			
			a.on('click', function() {
					if ($(this).hasClass('show')) {
						var target = $html.scrollTop()? $html : $body;
						
						target.animate({ 
								scrollTop: 	0 
							}, 500);
						
						return false;
					}
				});
			
			return this;
		};
	
}(jQuery, jQuery(window), jQuery('html'), jQuery('body')));