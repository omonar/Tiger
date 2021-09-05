/*	
 *	alignTo() :: align a layer to another
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).alignTo(target, options);
 *	options: gap, posX, posY, toX, toY
 */

;(function($, $window) {
	'use strict';
	
	var ALIGN_LEFT = 0,  
		ALIGN_TOP = 0,
		ALIGN_CENTER = 1, 
		ALIGN_MIDDLE = 1,
		ALIGN_RIGHT = 2, 
		ALIGN_BOTTOM = 2,
		halClass = [ 'left', 'center', 'right' ],
		valClass = [ 'top', 'middle', 'bottom' ],
		allClass = 'align-left align-center align-right valign-top valign-middle valign-bottom',
		
		getFixedParent = function(el) {
				
				while (el.length && el[0].nodeName !== 'BODY') {
					if (el.css('position') === 'fixed') {
						return el;
					}
					el = el.parent();
				}
				
				return $();
			};
	
	$.fn.alignTo = function(target, settings) {
		
			settings = $.extend({}, $.fn.alignTo.defaults, settings);
			
			if (typeof target === 'string') {
				target = $(target);
			}
			
			if (!(target instanceof $ && target.length)) {
				return;
			}
				
			var to, 
				tw, 
				th,
				ww = $window.width(),
				wh = $window.height(),
				fixedParent = getFixedParent(target);
				
			if (target[0].nodeName === 'AREA' && target[0].shape.toUpperCase() === 'RECT') {
				to = target.parent().offset();
				var r = target[0].coords.split(',');
				// Area left, top
				to.left += parseInt(r[0],10);
				to.top += parseInt(r[1],10);
				// Area width, height
				tw = parseInt(r[2],10) - parseInt(r[0],10);
				th = parseInt(r[3],10) - parseInt(r[1],10);
			} else {
				// Normal element
				to = target.offset();
				tw = target.outerWidth();
				th = target.outerHeight();
			}
			
			to.left -= $window.scrollLeft();
			to.top -= $window.scrollTop();
						
			return this.each(function() {
					var e = $(this),
						nub = e.find('.' + settings.nubClass),
						nubPos,
						hal = settings.pos[2], 
						val = settings.pos[3];
						
					e.css('maxHeight', 'none');
					
					var	w = e.outerWidth(),
						h = e.outerHeight(),
						rx = Math.round(to.left + settings.pos[2] * tw / 2 + 
							(settings.pos[2] - 1) * settings.gap),
						ry = Math.round(to.top + settings.pos[3] * th / 2 + 
							(settings.pos[3] - 1) * settings.gap),
						l = Math.round(rx - settings.pos[0] * w / 2),
						t = Math.round(ry - settings.pos[1] * h / 2);
					
					if (t < 0 || (t + h) > wh) {
						// Overflow - vertical
						if (settings.pos[2] !== ALIGN_CENTER) {
							// Aligned to sides, just make sure it won't hang above
							t = ((2 * t + h) > wh)? (wh - h) : 0;
						} else if (settings.pos[3] === ALIGN_TOP) {
							if (wh > (to.top * 2 + th)) {
								// More space below :: moving below
								t = to.top + th + settings.gap;
								val = ALIGN_BOTTOM;
							}
						} else if (settings.pos[3] === ALIGN_BOTTOM) { 
							if (wh < (to.top * 2 + th)) {
								// More space above :: move above
								t = Math.max(0, to.top - h - settings.gap);
								val = ALIGN_TOP;
							}
						}
						if (t < 0) {
							t = 0;
						}
					}
								
					if (l < 0 || (l + w) > ww) {
						// Overflow - horizontal
						if (settings.pos[3] !== ALIGN_MIDDLE) {
							// Not aligned to vertical center
							l = ((2 * l + w) > ww)? (ww - w) : 0;
						} else if (settings.pos[2] === ALIGN_LEFT) {
							if (ww > (to.left * 2 + tw)) {
								// More space right :: move right
								l = to.left + tw + settings.gap;
								hal = ALIGN_RIGHT;
							}
						} else if (settings.pos[2] === ALIGN_RIGHT) { 
							if (ww < (to.left * 2 + tw)) {
								// More space left :: move left
								l = Math.max(0, to.left - w - settings.gap);
								hal = ALIGN_LEFT;
							}
						}
						if (l < 0) {
							l = 0;
						}
						if ((l + w) > ww) {
							// Still oversized
							e.css({
								//overflow: 	'auto',
								maxWidth: 	ww - l - (parseInt(e.css('paddingLeft'), 10) + parseInt(e.css('paddingRight'), 10))
							});
						}
					} 
					
					if (settings.fixNub && nub.length) {
						if (val === ALIGN_TOP) {
							// Align nub horizontally
							nub.css({
									left:		to.left - l + tw / 2 - settings.nubSize,
									top:		'auto',
									bottom:		- 2 * settings.nubSize
								});
						} else if (val === ALIGN_BOTTOM) {
							nub.css({
									left:		to.left - l + tw / 2 - settings.nubSize,
									top:		- 2 * settings.nubSize,
									bottom:		'auto'
								});
						} else if (hal === ALIGN_LEFT) {
							// Align nub vertically
							nub.css({
									top:		to.top - t + th / 2 - settings.nubSize,
									left:		'auto',
									right:		- 2 * settings.nubSize
								});
						} else if (hal === ALIGN_RIGHT) {
							nub.css({
									top:		to.top - t + th / 2 - settings.nubSize,
									left:		- 2 * settings.nubSize,
									right:		'auto'
								});
						}
					}
					
					if (fixedParent.length) {
						e.css({
								position: 	'fixed',
								left: 		l, 
								top: 		t 
							});
					} else {
						e.css({
								position: 	'absolute',
								left: 		l + $window.scrollLeft(),
								top: 		t + $window.scrollTop() 
							});
					}
					
					e.removeClass(allClass).addClass('align-' + halClass[hal]).addClass('valign-' + valClass[val]);
					
				});
		};

	$.fn.alignTo.defaults = {
			gap: 			0,
			pos: 			[ ALIGN_CENTER, ALIGN_BOTTOM, ALIGN_CENTER, ALIGN_TOP ],
			fixNub:			true,
			nubClass:		'nub',
			nubSize:		5
		};

})(jQuery, $(window));
