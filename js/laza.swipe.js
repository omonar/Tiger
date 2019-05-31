/*	
 *	swipe() :: Swipe action using CSS transforms with jQuery position fallback
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).swipe( options );
 */
 
 ;(function($, $window, $document, undefined) {
	'use strict';
	
	$.fn.swipe = function(options) {
		
		options = $.extend({
				onSwipedLeft:	false,		// Swiped left event
				onSwipedRight:	false,		// Swiped right event
				onSmallSwipe:	false,		// Small swipe (< treshold px)
				onClick:		false,		// Clicked
				onFinished:		false,		// Swiped out - can remove
				treshold:		20,			// Small swipe treshold
				swipeoutSpeed:	300,		// Swipe out speed in ms
				overTreshold:	0.25		// Oversized pictures must moved beyond (this * screen width) to trigger swipe 
			}, options);
		
		// Getting coordinates of a touch or mouse event
		var	getDim = function(el) {
					return [ el.outerWidth(), el.outerHeight() ];
				},
				
			getDistance = function(diff) {
					return $.isArray(diff)?
						Math.sqrt(Math.pow(diff[0], 2) + Math.pow(diff[1], 2))
						:
						Math.abs(diff);
				},
				
			getXY = function(e) {
					if (e.touches && e.touches.length === 1) {
						return [ 
							Math.round(e.touches[0].pageX),
							Math.round(e.touches[0].pageY)
						];
					} else if (e.clientX !== null) {
						return [
							Math.round(e.pageX),
							Math.round(e.pageY)
						];
					}
					return null;
				},
			
			getX = function(e) {
					if (e.touches && e.touches.length === 1) {
						return Math.round(e.touches[0].pageX);
					} else if (e.pageX !== null) {
						return Math.round(e.pageX);
					}
					return null;
				};
				
		return this.each(function() {
				
			var self = $(this),							// target element
				clip = self.parent(),					// clipping window
				ns = self.data('lsw_ns') ||				// namespace 
					('lsw_' + Math.floor(Math.random() * 10000)),
				selfDim,								// item dimensions
				clipDim,								// clip dimensions
				rto,									// window resize update timeout
				startTime,								// start time
				startPos,								// start position
				diff,									// move difference
				pos,									// current position
				constrainX = true,						// only horizontal move
				timer = null,
				media = self.hasClass('audio') || self.hasClass('video'), 
				
				// Starting swipe
				swipeStart = function(e) {
						//log(e.type);
						
						if (self.data('scrolling')) {
							return false;
						}
						
						//log('Touch start, fingers: ' + (e.originalEvent.touches? e.originalEvent.touches.length : 0));
						if (e.originalEvent.touches && e.originalEvent.touches.length > 1 ||
							e.type === 'mousedown' && e.which !== 1) {
							// multi finger touch or right click
							return true;
						}
						
						if (media) {
							var t = e.target.nodeName.toLowerCase(); 
							if (t === 'audio' || 
								(t === 'video' && 
									e.target.controls && 
									e.offsetY > ($(e.target).height() - 60))) {
								// media control click (bottom 60px : safety zone)
								return true;
							}
						}	
						
						if (e.type !== 'touchstart') {
							// Allowing long tap
							e.preventDefault();
						}
						
						self.stop(true, false);
						self.data('scrolling', false);
						self.data('swipeEnded', false);
						self.data('taplength', 0);
						startTime = new Date().getTime();
						
						clipDim = clipDim || getDim(clip);
						selfDim = selfDim || getDim(self);
						
						constrainX = clipDim[1] >= selfDim[1];
						
						if (constrainX) {
							startPos = getX(e.originalEvent);
							diff = 0;
							pos = self.translateX();
						} else {
							startPos = getXY(e.originalEvent);
							diff = [0, 0];
							pos = self.translate();
						}
						
						if (e.type === 'mousedown') {
							$document.on('mousemove.' + ns, swipeMove);
							self.on('mouseup.' + ns + ' mouseout.' + ns, swipeEnd);
						}
						
						return e.type === 'touchstart';
					},
				
				// Moving in progress
				swipeMove = function(e) {
						//log(e.type);
						
						if (e.originalEvent.touches && e.originalEvent.touches.length > 1) {
							// multi finger touch
							return true;
						}
						
						e.preventDefault();
						
						if (constrainX) {
							diff = getX(e.originalEvent) - startPos;
							self.translateX(pos + diff);
						} else {
							diff = getXY(e.originalEvent);
							diff[0] -= startPos[0];
							diff[1] -= startPos[1];
							self.translate([pos[0] + diff[0], pos[1] + diff[1]]);
						}
						
						return false;
					},
				
				// Cancel swipe (e.g. moved out of the screen)
				swipeCancel = function(e) {
						//log(e.type);
						$document.off('mousemove.' + ns);
						
						setTimeout(function() { 
								self.data('scrolling', false);
							}, 20);
						
						self.translate([0, 0], 100);
						return false;
					},
				
				// Stopped moving
				swipeEnd = function(e) {
						//log(e.type);
						if (self.data('swipeEnded')) {
							// Multiple trigger for ending swipe
							return true;
						}
						
						e.preventDefault();
						self.data('swipeEnded', true);
						
						var dt = new Date().getTime() - startTime,
							speed = 1 + options.swipeoutSpeed / dt,
							
							handleFinished = function() {
									if (typeof options.onFinished === 'function') {
										options.onFinished.call(self[0], e);
									}
								},
							
							handleClick = function() {
									if (diff) {
										if (typeof options.onSmallSwipe === 'function') {
											options.onSmallSwipe.call(self[0], e);
										}
									}
									
									if (typeof options.onClick === 'function') {
										options.onClick.call(self[0], e);
									}
								},
							
							handleSwipe = function(right) {
									if (right) {
										if (typeof options.onSwipedRight === 'function') {
											options.onSwipedRight.call(self[0], e);
										}
									} else {
										if (typeof options.onSwipedLeft === 'function') {
											options.onSwipedLeft.call(self[0], e);
										}
									}
								};
						
						
						if (e.type === 'mouseup' || e.type === 'mouseout') {
							$document.off('mousemove.' + ns);
							self.off('mouseup.' + ns + ' mouseout.' + ns);
						} else if (e.type === 'pointerup') {
							self.off('pointermove.' + ns + ' pointerup.' + ns);
						}
						
						self.data('taplength', dt);
						
						if (constrainX) {
							
							if (Math.abs(diff) > options.treshold) {
								var targetPos = pos + diff * speed;
								
								if ((clipDim[0] >= selfDim[0]) ||
										(diff > 0) &&
										((targetPos - selfDim[0] / 2) > clipDim[0] * (options.overTreshold - 0.5)) ||
										((targetPos + selfDim[0] / 2) < clipDim[0] * (0.5 - options.overTreshold))
									) {
									
									// Swipe action
									self.data('scrolling', false);
									self.translateXAndFade(targetPos, 0, options.swipeoutSpeed);
									timer = setTimeout(handleFinished, options.swipeoutSpeed + 20);
									handleSwipe(diff > 0);
									
								} else {
									// Panoramic :: Hasn't reached the edge yet
									self.translateX(targetPos, options.swipeoutSpeed);
								}
								
							} else {
								// Small swipe == click
								if (diff) {
									self.translateX(0, 100);
								}
								
								handleClick();
							}
							
						} else {
							
							if (getDistance(diff) > options.treshold) {
								var top = parseInt(self.css('top')),
									targetPos = [
											pos[0] + diff[0] * speed,
											((diff[1] > 0)? 
												Math.min(-top, pos[1] + diff[1] * speed)
												:
												Math.max(-top + clipDim[1] - selfDim[1], pos[1] + diff[1] * speed))
										];
									
									
								if ((diff[0] > 0) &&
										((targetPos[0] - selfDim[0] / 2) > clipDim[0] * (options.overTreshold - 0.5)) ||
										((targetPos[0] + selfDim[0] / 2) < clipDim[0] * (0.5 - options.overTreshold))
									) { 
										
									// Swipe action
									self.data('scrolling', false);
									self.translateAndFade(targetPos, 0, options.swipeoutSpeed);
									timer = setTimeout(handleFinished, options.swipeoutSpeed + 20);
									handleSwipe(diff[0] >= 0);
									
								} else {
									// Hasn't reached the edge yet
									self.translate(targetPos, options.swipeoutSpeed);
								}
								
							} else {
								// Small swipe == click
								if (diff[0] || diff[1]) {
									self.translate([0, 0], 100);
								}
								
								handleClick();
							}
							
						}
						
						return false;
					},
				
				noAction = function(e) {
						e.preventDefault();
						return false;
					},
								
				// Tearing off the swipe handler
				removeSwipe = function() {
						setTimeout(function() { 
							self.data('scrolling', false);
						}, 20);
						self.removeAttr('draggable');
						self.add($document).off('.' + ns);
					};
				
				
			// clean up events that may hang around (in theory this should never happen)
			self.add($document).off('.' + ns);
			
			// Storing namespace
			self.data('lsw_ns', ns);
			
			// Need to be updated about the window size
			$window.on('resize.' + ns, function() {
					clearTimeout(rto);
					rto = setTimeout(function() {
						clipDim = getDim(clip);		
					}, 50);
				});
			
			self.attr('draggable', 'false')
				.on(TOUCH.START + '.' + ns + ' dragstart.' + ns + ' mousedown.' + ns, swipeStart)
				//.on(TOUCH.CANCEL + '.' + ns + ' dragcancel.' + ns + ' mouseout.' + ns, swipeCancel)
				.on(TOUCH.MOVE + '.' + ns + ' drag.' + ns, swipeMove)
				.on(TOUCH.END + '.' + ns, swipeEnd)
				// External remove request
				.on('removeSwipe.' + ns, removeSwipe)
				.on('selectstart.' + ns, noAction);
				
			//self.logEvents();
	
		});
	};
			
})(jQuery, jQuery(window), jQuery(document));
