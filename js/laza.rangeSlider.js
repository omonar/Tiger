/*	
 *	laza.rangeSlider() :: replacing single-value rangeSlider with range
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).rangeSlider( options );
 */
 
;(function($, $window, $body, $document) {
	'use strict';
		
	$.fn.rangeSlider = function(settings) {
		
			settings = $.extend({}, $.fn.rangeSlider.defaults, settings);
			
			var	getX = function(e) {
						if (e.touches && e.touches.length === 1) {
							return Math.round(e.touches[0].pageX);
						} else if (e.pageX !== null) {
							return Math.round(e.pageX);
						}
						return null;
					};
	
	
			return this.each(function() {
				
				if (this['data-rangeslider-id']) {
					return true;
				}
					
				var self 		= $(this),
					slider 		= $(),
					rail		= $(),
					rangeBar,
					ns 			= 'lrs_' + Math.floor(Math.random() * 10000),
					lowBtn,
					highBtn,
					lowTT		= $(),
					highTT		= $(),
					draggedEl,
					
					sw,															// Slider width
					dragX0,														// Start screen position of dragging
					val0,														// Start value
					ratio,														// Screen pixel : slider value
					
					minVal		= settings['min'] || this.min || 0,
					maxVal		= settings['max'] || this.max || 100,
					defStep		= settings['step'] || this.step,
					low			= settings['low'] || minVal,
					high		= settings['high'] || maxVal,
					
					type		= settings['type'] || ((this.type === 'date')? 'date' : 'number'),
					
					to 			= null,
					
					step,
					
					snap = function(val) {
							if (val > (maxVal - step / 2)) {
								// Close to max
								return maxVal;
							}
							
							return minVal + Math.round((val - minVal) / step) * step;
						},
						
					display = function(val) {
							if (type === 'date') {
								return (new Date(val * 1000)).toLocaleDateString();
							} else if (type === 'numeric') {
								if (settings.unit === 'seconds') {
									return niceTime(val);
								} else if (settings.unit === 'byte') {
									return niceByte(val);
								} else if (val >= 10 || val >= defStep) {
									return Math.round(val);
								} else if (val >= 1) {
									return val.toFixed(1);
								} else if (val >= 0.1) {
									return val.toFixed(2);
								}
								return val;
							}
							
							return toCurrency(val, settings.currency);
						},
											
					valToPercent = function(val) {
							return (val - minVal) / (maxVal - minVal) * 100;
						},
						
					percentToVal = function(percent) {
							return percent * (maxVal - minVal) + minVal;
						},
						
					updateLow = function(val) {
							if (typeof val !== UNDEF) {
								low = step? snap(val) : val;
							}
							var l = valToPercent(low);
							lowBtn.style['left'] = l + '%';
							rangeBar.style['left'] = l + '%';
							lowTT.html(display(low));
							self.data('low', low).attr('data-low', low);
						},
						
					updateHigh = function(val) {
							if (typeof val !== UNDEF) {
								high = step? snap(val) : val;
							}
							var h = valToPercent(high);
							highBtn.style['left'] = h + '%';
							rangeBar.style['right'] = (100 - h) + '%';
							highTT.html(display(high));
							self.data('high', high).attr('data-high', high);
						},
						
					init = function() {
							
							slider = $('<div>', {
									'class':		settings.className + ' type-' + type
								}).insertAfter(self);
								
							self.hide().attr({
									'data-low': 	settings['low'] || minVal,
									'data-high':	settings['high'] || maxVal,
									min:			minVal,
									max:			maxVal
								});
							
							if (typeof settings['unit'] !== UNDEF && settings.unit) {
								self.attr('unit', settings.unit);
							}
							
							if (typeof defStep === UNDEF || !defStep) {
								// Auto step
								step = Math.pow(10, Math.floor(Math.log10((maxVal - minVal) / 100)));
								self.attr('step', step);
								defStep = Number.MAX_SAFE_INTEGER;
							} else {
								step = defStep;
							}
								
							slider
								.append($('<span>', {
									'class':		'min-val',
									html:			display(minVal)
								}))
								.append($('<span>', {
									'class':		'max-val',
									html:			display(maxVal)
								}));
							
							rail = $('<div>', {
									'class':		settings.railClass
								}).appendTo(slider);
							
							rangeBar = $('<div>', {
									'class':		settings.rangebarClass
								}).appendTo(rail)[0];
							
							lowBtn = $('<button>', {
									'class':		'low'
								}).appendTo(rail)[0];
								
							lowTT = $('<span>', {
									'class':		settings.tooltipClass
								}).appendTo(lowBtn);
							
							updateLow();
								
							highBtn = $('<button>', {
									'class':		'high'
								}).appendTo(rail)[0];
								
							highTT = $('<span>', {
									'class':		settings.tooltipClass
								}).appendTo(highBtn);
								
							updateHigh();
							
							$(lowBtn).add($(highBtn)).attr('draggable', 'false')
								.on('click.' + ns, noAction)
								.on(TOUCH.START + '.' + ns + ' dragstart.' + ns + ' mousedown.' + ns, dragStart)
								//.on(TOUCH.CANCEL + '.' + ns + ' dragcancel.' + ns + ' mouseout.' + ns, swipeCancel)
								.on(TOUCH.MOVE + '.' + ns + ' drag.' + ns, dragMove)
								.on(TOUCH.END + '.' + ns, dragStop);
								
						},
					
					// Knob move started
					
					dragStart = function(e) {
						
							if (e.originalEvent.touches && e.originalEvent.touches.length > 1 ||
								e.type === 'mousedown' && e.which !== 1) {
								// multi finger touch or right click
								return true;
							}
							
							if (e.type !== 'touchstart') {
								// Allowing long tap
								e.preventDefault();
							}
							
							self.data('dragEnded', false);
							draggedEl = this;
							dragX0 = getX(e.originalEvent);
							val0 = (this === lowBtn)? low : high;
							ratio = slider.width() / (maxVal - minVal); 
							
							if (e.type === 'mousedown') {
								$document
									.on('mousemove.' + ns, dragMove)
									.on('mouseup.' + ns /*+ ' mouseout.' + ns*/, dragStop);
							} else if (e.type === 'pointerdown') {
								$document
									.on('pointermove.' + ns, dragMove)
									.on('pointerup.' + ns, dragStop);
							}
							
							$(lowBtn).add($(highBtn)).removeClass('last-touch');
							$(this).addClass('moving last-touch');
							self.closest('form').find('.rangeslider').removeClass('focus');
							slider.addClass('focus');
							
							return e.type === 'touchstart';
						},
						
					// Moving knob
					
					dragMove = function(e) {
						
							if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
								// multi finger touch
								return true;
							}
							
							e.preventDefault();
							
							var diff = (getX(e.originalEvent) - dragX0) / ratio;
							
							if (draggedEl === lowBtn) {
								updateLow(Math.minMax(minVal, val0 + diff, high));
							} else {
								updateHigh(Math.minMax(low, val0 + diff, maxVal));
							}
							
							return false;
						},
						
					dragCancel = function(e) {
						
							$document.off('mousemove.' + ns);
							return false;
						},
						
					dragStop = function(e) {
						
							if (self.data('dragEnded')) {
								// Multiple trigger for ending swipe
								return true;
							}
							
							e.preventDefault();
							self.data('dragEnded', true);
							$(draggedEl).removeClass('moving');
							
							if (e.type === 'mouseup' || e.type === 'mouseout') {
								$document.off('mousemove.' + ns + ' mouseup.' + ns + ' mouseout.' + ns);
							} else if (e.type === 'pointerup') {
								$document.off('pointermove.' + ns + ' pointerup.' + ns);
							}
							
							if (settings.hasOwnProperty('onChanged') && typeof settings.onChanged === FUNCTION) {
								if (draggedEl === lowBtn && self.data('low') > minVal ||
									self.data('high') < maxVal) {
									settings.onChanged.call(self);
								}
							}
							
							if (settings.hasOwnProperty('onReseted') && typeof settings.onReseted === FUNCTION) {
								if (self.data('low') === minVal && self.data('high') === maxVal) {
									settings.onReseted.call(self);
								}
							}
						},
						
					noAction = function(e) {
							e.preventDefault();
							return false;
						},
						
					// External reset range request
					resetRange = function(e) {
							
							updateLow(minVal);
							updateHigh(maxVal);
							
							return false;
						},
					
					// Tearing off the swipe handler
					removeRangeSlider = function() {
							self.add($document).off('.' + ns);
						};
					
				// Starts here
				
				// clean up events that may hang around (in theory this should never happen)
				self.add($document).off('.' + ns);
				
				// Storing namespace
				self.data('lrs_ns', ns);
				
				init();
				
				// External events
				self.on('removeRangeSlider.' + ns, removeRangeSlider)
					.on('resetRange.' + ns, resetRange)
					.on('selectstart.' + ns, noAction);
			});
		};
	
	$.fn.rangeSlider.defaults = {
			className: 			'rangeslider',
			railClass:			'rail',
			rangebarClass:		'range-bar',
			tooltipClass:		'number',
			currency:			'EUR',
			unit:				'',
			throttle:			1500				
		};
	
})(jQuery, jQuery(window), jQuery('body'), jQuery(document));				
				