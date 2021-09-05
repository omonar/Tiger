/*
 * 	laza.autopano.js - auto panorama viewer
 *	jslint browser: true
 */
 
;(function($, $window, $document, $body) {	
	'use strict';
	// Requires laza.util and laza.transform

	$.fn.autopano = function(settings) {
		
			settings = $.extend({}, $.fn.autopano.defaults, settings);
	
			var self = $(this),							// Element
				cont = self.parent(),					// Container
				exposedStart = false,					// Left end reached
				exposedEnd = false,						// Right end reached
				stopped = false,						// Autopanoremove triggered
				size, 									// Element size
				screenSize,								// Container size
				vertical = false,						// Move axis
				rto,									// Resize timeout
				ns = self.data('lap_ns'),				// Name space
				
				// Initializing
				
				init = function() {
						
						// Updating window size
						
						$window.on('resize.' + ns, function() {
								clearTimeout(rto);
								rto = setTimeout(updateDims, 50);
								return true;
							});
				
						updateDims();
						
						// External events
						
						self.on('autopanoRemove.' + ns, function() {
								stopped = true;
								remove();
								return false;
							})
							.on('autopanoStart', function() {
								stopped = false;
								startAuto();
								return false;
							})
							.on('autopanoStop', function() {
								stopped = true;
								stopAuto();
								return false;
							});
								
						// Auto start
						
						if (settings.autoStart) {
							startAuto();
						}
					},
				
				// Update dimensions
				
				updateDims = function() {
						var tr = self.data('transform'),  
							ew = self.outerWidth(),
							eh = self.outerHeight(),
							cw = cont.outerWidth(),
							ch = cont.outerHeight();
							
						if (ew / cw < eh / ch) {
							// Vertical
							size = eh;
							screenSize = ch;
							
							if (!vertical) {
								vertical = true;
								self.translateX(0);
								if (size > screenSize) {
									startAuto();
								}
							}
							
						} else {
							// Horizontal
							size = ew;
							screenSize = cw;
							
							if (vertical) {
								vertical = false;
								self.translateY(0);
								if (size > screenSize) {
									startAuto();
								}
							}
						}
					},
				
				// Remove autopano
				
				remove = function() {
					
						stopMove();
						
						setTimeout(function() { 
									self.data('scrolling', false);
								}, 20);
						
						self.removeAttr('draggable');
						self.add($document).off('.' + ns);
					},
					
				// Move to left end
				
				moveToStart = function() {
						var dis = (size - screenSize) / 2,
							dur = 1000 * Math.minMax(1.5, Math.abs(dis) / settings.speed, 20);
						
						if (vertical) {
							self.translateY(dis, dur, settings.easing, function() {
									exposedStart = true;
									if (!stopped) {
										if (!exposedEnd || settings.loop) {
											moveToEnd();
										} else {
											stopAuto();
										}
									}
								});
						} else {
							self.translateX(dis, dur, settings.easing, function() {
									exposedStart = true;
									if (!stopped) {
										if (!exposedEnd || settings.loop) {
											moveToEnd();
										} else {
											stopAuto();
										}
									}
								});
						}
					},
				
				// Move to right end
				
				moveToEnd = function() {
						var dis = (size - screenSize) / 2,
							dur = 1000 * Math.minMax(1.5, Math.abs(dis) / settings.speed, 20);
						
						if (vertical) {
							self.translateY(-dis, dur, settings.easing, function() {
									exposedEnd = true;
									if (!stopped) {
										if (!exposedStart || settings.loop) {
											moveToStart();
										} else {
											stopAuto();
										}
									}
								});
						} else {
							self.translateX(-dis, dur, settings.easing, function() {
									exposedEnd = true;
									if (!stopped) {
										if (!exposedStart || settings.loop) {
											moveToStart();
										} else {
											stopAuto();
										}
									}
								});
						}
					},
					
				// Start auto pano
				
				startAuto = function() {
						var c = vertical? self.translateY() : self.translateX();
						
						stopped = false;
						
						if ((-settings.direction || c) > 0) {
							moveToStart();
						} else {
							moveToEnd();
						}
						
						cont.addClass(settings.panoMoveClass);
						cont.data('panomove', true);	
					},
				
				// Stop moving
				
				stopMove = function() {
						var c = vertical? self.translateY() : self.translateX();
						
						stopped = true;
						
						if (c) {
							if (vertical) {
								self.translateY(c);
							} else {
								self.translateX(c);
							}
						}
						
						cont.removeClass(settings.panoMoveClass);
					},
					
				// Pause auto pano
				
				stopAuto = function() {
						
						stopMove();
						
						setTimeout(function() {
								cont.data('panomove', false);
							}, 300);
					};
				
	
			// Initializing
						
			if (ns) {
				$window.add($document).off('.' + ns);
				self.translate([0, 0]);
			}
			
			// Creating new namespace
			
			self.data('lap_ns', ns = 'lap_' + Math.floor(Math.random() * 10000));
			
			// Initializing
			
			init();
			
			// Ready event
			
			if (settings.hasOwnProperty('onReady') && typeof settings.onReady === FUNCTION) {
				settings.onReady(thumb);
			}
			
			return this;
		};
	
	$.fn.autopano.defaults = {
			direction:			-1,									// 1: to right, -1: to left
			speed:				80,									// pixel / s
			easing:				'cubic-bezier(0.2, 0, 0.8, 1)',		// Easing function
			autoStart:			true,								// Auto start
			loop:				true,								// continue after exposed both ends
			panoMoveClass:		'pano-move'							// Class for the container during move
		};
	
})(jQuery, jQuery(window), jQuery(document), jQuery('body'));
