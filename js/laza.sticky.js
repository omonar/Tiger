;(function($, $window) {
	'use strict';
				
	/* 
		sticky.js - renders 'sticky' class to off-screen layers
	*/

	$.fn.sticky = function(options) {
		
			options = $.extend({
							stickyClass:		'sticky',					// Sticky class
							firstClass:			'st-first',					// First element class
							topClass:			'st-top',					// Top class
							bottomClass:		'st-bottom',				// Bottom class
							placeholderClass:	'st-placeholder',			// Placeholder class
							watch:				'.thumbnails'				// Only if this section is on screen
						}, options);
			
			var ns = 'lst_' + Math.floor(Math.random() * 10000),
				st = new Array(),
				last = -999,
				
				// Getting panel's top/bottom position
				
				getPos = function(pos) {
						var h = 0,
							el = $('.' + options.stickyClass + '.' + pos);
						
						el.each(function() {
								h += $(this).outerHeight();
							});
						
						return h;
					},
				
				// Make panel static
				
				makeStatic = function(i) {
						var el = $('[data-sticky-rel=' + st[i].id + ']'),
							p = $('#' + st[i].id);
							
						if (el.length && el.hasClass(options.stickyClass)) {
							// Hiding placeholder
							p.height(0);
							// On screen
							el.removeClass(options.stickyClass + ' ' + options.topClass + ' ' + options.bottomClass);
						}
					},
					
				// Make all panels static
				
				makeAllStatic = function() {
					
						for (var i = 0; i < st.length; i++) {
							makeStatic(i);
						}
					},
					
				// Checking all elements
				
				checkPos = function() {
						var wt = $window.scrollTop(),
							wh = $window.outerHeight(),
							watch = $(options.watch + ':visible'),
							wpt;
						
						if (Math.abs(wt - last) <= 2) {
							// Already checked
							return;
						}
						
						if (!watch.length || (wpt = watch.position().top) > wt + wh - 100 || (wpt + watch.outerHeight(true) <= wt + 100)) {
							// No watch element on screen
							makeAllStatic();
							
						} else {
							// Watch element is on screen
							for (var i = 0, el, p, pt, ph; i < st.length; i++) { 
								el = $('[data-sticky-rel=' + st[i].id + ']');
								p = $('#' + st[i].id);
								
								if (el.length && p.length) {
									// Panel's top position
									pt = p.position().top;
								
									if ((pt + st[i].height - st[i].marginBottom) > (wt + wh) || (pt + st[i].marginBottom) < wt) {
										// Place as sticky
										if (!el.hasClass(options.stickyClass)) {
											// Make placeholder same height
											p.height(st[i].height);
											el.addClass(options.stickyClass);
											
											if ((pt + st[i].marginBottom) < wt) {
												// Above
												if (pt = getPos(options.topClass)) {
													// Offsetting already existing stickies
													el.removeClass(options.firstClass).css('top', pt);
												} else {
													el.addClass(options.firstClass);
												}
												
												el.addClass(options.topClass).removeClass(options.bottomClass);
												
											} else {
												// Below
												if (pt = getPos(options.bottomClass)) {
													el.removeClass(options.firstClass).css('bottom', pt);
												} else {
													el.addClass(options.firstClass);
												}
												
												el.addClass(options.bottomClass).removeClass(options.topClass);
											}
										}
										
									} else {
										// Place as static
										makeStatic(i);
									}
								}
							}
						}
						
						return true;
					};
					
			// Preprocessing elements
			this.each(function(i) {
					var el = $(this),
						cont = el.children().first(),
						id = ns + '_' + i;
					
					el.before($('<div>', {
							id:				id,
							'class': 		options.placeholderClass
						}));
					
					el.attr('data-sticky-rel', id);
					
					st[i] = {
							id:				id,
							height:			el.outerHeight(true),
							marginTop:		(parseInt(cont.css('margin-top')) || 0) + (parseInt(el.css('padding-top')) || 0),
							marginBottom:	(parseInt(cont.css('margin-bottom')) || 0) + (parseInt(el.css('padding-top')) || 0)
						}
				});
			
			$(this).on('stickyRefresh', function() {
					last = -999;
					checkPos();
				});
			
			// Scroll event listener
			$window.on('scroll.' + ns + ' resize.' + ns, checkPos);
			
			// Initial check
			checkPos();
			
			return this;
		};
	
}(jQuery, jQuery(window)));