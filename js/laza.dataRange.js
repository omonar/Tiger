/*	
 *	laza.dateRange() :: replacing single-value dateRange with range
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).dateRange( options );
 */
 
;(function($, $window, $body, $document) {
	'use strict';
		
	$.fn.dateRange = function(settings) {
		
		settings = $.extend({}, $.fn.dateRange.defaults, settings);
		
		return this.each(function() {
			
			if (this['data-dateRange-id']) {
				return true;
			}
				
			var self 		= $(this),
				ns 			= 'ldr_' + Math.floor(Math.random() * 10000),
				
				first		= settings['first'] || this.first || 0,
				last		= settings['last'] || this.last || 100,
				start		= settings['start'] || first,
				end			= settings['end'] || last,
				
				updateStartDate = function(val) {
						if (typeof val !== UNDEF) {
							start = val;
						}
						var l = valToPercent(start);
						startBtn.style['left'] = l + '%';
						rangeBar.style['left'] = l + '%';
						startTT.text(niceFloat(start));
						self.data('start', start).attr('data-start', start);
					},
					
				updateEndDate = function(val) {
						if (typeof val !== UNDEF) {
							end = val;
						}
						var h = valToPercent(end);
						endBtn.style['left'] = h + '%';
						rangeBar.style['right'] = (100 - h) + '%';
						endTT.text(niceFloat(end));
						self.data('end', end).attr('data-end', end);
					},
					
				init = function() {
						
						slider = $('<div>', {
								'class':		settings.className
							}).insertAfter(self);
							
						self.hide().attr({
								'data-start': 	settings['start'] || start,
								'data-end':	settings['end'] || last,
								first:			start,
								last:			last
							});
							
						slider
							.append($('<span>', {
								'class':		'first-val',
								text:			niceFloat(start)
							}))
							.append($('<span>', {
								'class':		'last-val',
								text:			niceFloat(last)
							}));
						
						rail = $('<div>', {
								'class':		settings.railClass
							}).appendTo(slider);
						
						rangeBar = $('<div>', {
								'class':		settings.rangebarClass
							}).appendTo(rail)[0];
						
						startBtn = $('<button>', {
								'class':		'start'
							}).appendTo(rail)[0];
							
						startTT = $('<span>', {
								'class':		settings.tooltipClass
							}).appendTo(startBtn);
						
						updateStartDate();
							
						endBtn = $('<button>', {
								'class':		'end'
							}).appendTo(rail)[0];
							
						endTT = $('<span>', {
								'class':		settings.tooltipClass
							}).appendTo(endBtn);
							
						updateEndDate();
						
						$(startBtn).add($(endBtn)).attr('draggable', 'false')
							.on('click.' + ns, noAction)
							.on(TOUCH.START + '.' + ns + ' dragstart.' + ns + ' mousedown.' + ns, dragStart)
							//.on(TOUCH.CANCEL + '.' + ns + ' dragcancel.' + ns + ' mouseout.' + ns, swipeCancel)
							.on(TOUCH.MOVE + '.' + ns + ' drag.' + ns, dragMove)
							.on(TOUCH.END + '.' + ns, dragStop);
							
					},
														
				noAction = function(e) {
						e.preventDefault();
						return false;
					},
					
				// External reset range request
				resetRange = function(e) {
						
						updateStartDate(start);
						updateEndDate (last);
						
						return false;
					},
				
				// Tearing off the swipe handler
				removeDateRange = function() {
						self.add($document).off('.' + ns);
					};
				
			// clean up events that may hang around (in theory this should never happen)
			self.add($document).off('.' + ns);
			
			// Storing namespace
			self.data('ldr_ns', ns);
			
			init();
			
			// External events
			self.on('removeDateRange.' + ns, removedateRange)
				.on('resetRange.' + ns, resetRange)
				.on('selectstart.' + ns, noAction);
		});
	};
	
	$.fn.dateRange.defaults = {
			className: 			'dateRange'
		};
	
})(jQuery, jQuery(window), jQuery('body'), jQuery(document));				
				