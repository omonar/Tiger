/*
 * 	Slider component
 *	jslint browser: true
 */
 
;(function($, $window, $document, undefined) {
	'use strict';
	// Requires laza.util and laza.transform

	$.fn.slider = function(options) {
		
			options = $.extend({
					delegate:			'ul li',
					fill:				'img.fill',
					auto:				true,
					speed: 				600,
					delay:				4000,
					preloadNext:		true
				}, options);
	
			var self = 					$(this),						// target
				ns = 					self.data('lsl_ns') ||			// namespace 
											('lsl_' + Math.floor(Math.random() * 10000)),
				slides = 				$([]),
				slide = 				$(),
				direction = 			1,
				slideWidth = 			self.width(),
				slideHeight = 			self.height(),
				sl_pause = 				$(),
				sl_progress = 			$(),
				swipeStarted,
				swipeStartPos = 		0,
				swipeEndPos = 			0,
				swipeDiff = 			0,
				timer = 				null,
				paused = 				false,
				
				getX = function(e) {
						if (e.touches && e.touches.length === 1) {
							return Math.round(e.touches[0].pageX);
						} else if (e.pageX !== null) {
							return Math.round(e.pageX);
						}
						return null;
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
				
				gotoSlide = function(num) {
		
						var n = num,
							curr = 0;
						
						if (n < 0) {
							n += slides.length;
						} else if (n >= slides.length) {
							n = n % slides.length;
						}
							
						timer = clearTimeout(timer);
						paused = false;
						sl_pause.hide();
							
						var el = slides.filter(':visible');
						
						// Hiding excess slides
						if (el.length > 1) {
							el.not(slide).hide();
						}
						
						// Animating the actual slide away
						if (slide.length) {
							
							curr = slides.index(slide);
							
							if (n === curr) {
								return true;
							}
							
							direction = (num > curr)? 1 : -1;
							
							slideRemove();
						}
							
						swipeDiff = 0;
						setProgress(n);
						slide = slides.eq(n);
		
						setTimeout(function() {
														
							if (options.fill) {
								setImage(function() {
									slideReady();
								});
							} else {
								slideReady();
							}
							
						}, 10);
						
					},
				
				setImage = function(callback) {
						var toFill = slide.find(options.fill);
						$('<img>').one('load', function(e) {
							var i = e.target;
							if (i) {
								fillImage(toFill, i.width, i.height);
							}
							if (typeof callback === FUNCTION) {
								callback.call(this);
							}
						}).attr('src', toFill.attr('src'));
					},
				
				// Fit image
				fillImage = function(img, width, height) {
						var ratio = Math.max(slideWidth / width, slideHeight / height ),
							size = [ 	Math.ceil(width * ratio), 
										Math.ceil(height * ratio) 
									];
							
						img.transform({
							origo: 		[	Math.round((slideWidth - width) / 2), 
											Math.round((slideHeight - height) / 2)
										],
							baseScale: 	ratio,
							baseSize: 	[	width, 
											height
										]
						}).data('fillSize', size);
					},
				
				// Removing - animating out - the old slide
				slideRemove = function() {
						
						var el = slide;
						
						el.css({
							'z-index': 0
						});
						
						switch (options.transition) {
							
							case 'slideOver':
								
								//console.log('opacity='+el.css('opacity')+' display='+el.css('display'));
								// Animating opacity
								setTimeout(function() {
									el.stop(true, false).show();
									el.opacity(0.4, options.speed, function(){ 
										el.hide();
									});
								}, 50);
		
								break;
								
							case 'slide':
								
								// Moving to the window edge
								setTimeout(function() {
									el.transform({
										position: 	[	-slideWidth * direction, 
														undefined
													]
									}, options.speed, function() {
										$(this).hide();
									});
								}, 60);
								break;
								
							case 'kenburns':
							default:
								
								// Animating opacity only
								if (!el.data('swiped')) {
									el.opacity(0, options.speed, function(){ 
										el.hide();
									});
								}
								
						}					
					},
				
				// Slide ready
				slideReady = function() {
						
						var el = slide;
						
						el.css({
							'z-index': 1
						});
							
						switch (options.transition) {
							
							case 'slideOver':
								
								// Animating position and opacity
								el.show().transform({
									position: 	[	100 * direction, 
													0
												],
									opacity: 	0
								}, function() {
									$(this).transform({
										position: 	[	0, 
														0
													],
										opacity: 	1
									}, options.speed, startSlide);
								});
								break;
								
							case 'slide':
								
								// Animating position
								el.show().transform({
									position: 	[	slideWidth * direction, 
													undefined
												]
								}, function() {
									$(this).transform({
										position: 	[	0, 
														undefined
													]
									}, options.speed, startSlide);
								});
								break;
								
							case 'kenburns':
								
								// Animating size + position + opacity
								
								var img = el.find(options.fill),
									size = img.data('fillSize');
								
								setTimeout(function() {
										
									el.show().transform({
										position: 	[0, 0],
										opacity: 	0
									}, function() {
			
										var z = Math.random();
										
										if (z > 0.5) {
											// Zoom out
											z = 1.05 + (z - 0.5) * 0.4;
											
											img.transform({
												position: 	[
																Math.random() * z * (slideWidth - size[0]) / 2, 
																Math.random() * z * (slideHeight - size[1]) / 2
															],
												scale: 		z
											}, function() {
												$(this).transform({
													position: 	[ 0, 0 ],
													scale: 		1,
												}, options.speed, startSlide );
											});
										} else {
											// Zoom in
											z = 1.05 + z * 0.4;
											
											img.transform({
												position: 	[
																Math.random() * z * (slideWidth - size[0]) / 2, 
																Math.random() * z * (slideHeight - size[1]) / 2
															],
												scale: 		z
											}, options.speed, startSlide );
										}
										
										el.opacity(1, options.speed, function() {});
										
									});
											
								}, options.speed / 8);
													
								break;
								
							default:
								
								el.transform({
									position: 	[0, 0],
									opacity: 	0
								}, function() {
									$(this).show().opacity(1, options.speed, startSlide);
								});
						}
						
					},
				
				// Auto starting next
				startSlide = function() {
						clearTimeout(timer);
						if (!paused) { 
							timer = setTimeout((direction < 0)? previousSlide : nextSlide, Math.max(options.delay, options.speed)); 
						}
					},
				
				// pausing slide show
				pauseSlide = function() {
						if (timer) {
							timer = clearTimeout(timer);
						}
						
						if (paused) {
							nextSlide();
							paused = false;
						} else {
							sl_pause.fadeIn(100, function() {
								setTimeout(function() {
									sl_pause.fadeOut(1000, function() {
										$(this).hide();
									});
								}, 1000);
							});
							paused = true;
						}
					},
							
				// image navigation
				imageNavigate = function(coords) {
						if (!coords) {
							return;
						}
						
						var x = coords[0] - self.offset().left,
							y = coords[1] - self.offset().top;				
							
						if (y > slideHeight * 0.9) {
							gotoSlide(Math.floor(x * slides.length / slideWidth));
						} else if (x > slideWidth * 0.9) {
							nextSlide();
						} else if (x < slideWidth * 0.1) {
							previousSlide();
						} else {
							pauseSlide();
						}
					},
				
				// previuos slide
				previousSlide = function() {
						gotoSlide((slide.length? slides.index(slide) : 0) - 1);
					},
				
				// next slide
				nextSlide = function() {
						gotoSlide((slide.length? slides.index(slide) : 0) + 1);
					},
					
				// removing slider
				removeSlider = function() {
						if (timer) {
							timer = clearTimeout(timer);
						}
						// removing event handlers
						slides.off('.' + ns);
						$window.off('.' + ns);
						sl_pause.add(sl_progress).remove();
					},
				
				// setting the progress
				setProgress = function(n) {
						sl_progress.children('span').css({
							left: (sl_progress.width() * n / slides.length)
						});
						return true;
					};
				
			// clean up events that may hang around (in theory this should never happen)
			self.add($window).off('.' + ns);
			
			// Storing namespace
			self.data('lsl_ns', ns);
				
			// Finding slides
			self.find(options.delegate).each(function(i) {
				var t = $(this),
					
					// Start moving
					swipeStart = function(e) {
							
							t.stop(true, false);
							swipeStarted = new Date().getTime();
							swipeStartPos = getX(e.originalEvent);
							
							if (e.type === 'mousedown') {
								$document.on('mousemove.' + ns, swipeMove);
								self.on('mouseup.' + ns + ' mouseout.' + ns, swipeEnd);
							}
							
							return e.type === 'touchstart';
						},
					
					// Moving in progress
					swipeMove = function(e) {
							if (!swipeStarted) {
								return true;
							}
							
							swipeEndPos = getX(e.originalEvent);
							swipeDiff = swipeEndPos - swipeStartPos;
							
							slide.transform({
								position: 	[	swipeDiff, 
												undefined
											]
							});
							
							return false;
						},
						
					// Stopped moving
					swipeEnd = function(e) {
							var dt = new Date().getTime() - swipeStarted;
							
							swipeStarted = 0;
							$document.off('mousemove.' + ns);
							self.off('mouseup.' + ns + ' mouseout.' + ns);
							
							if (Math.abs(swipeDiff) > 50) {
								// Swipe
								slide.data('swiped', true);
								slide.transform({
									position: 	[	swipeDiff * (1 + 1000 / dt), 
													undefined
												]
								}, 1000, function() {
									slide.data('swiped', false);
								});
								
								
								
								// Swiped to prev/next
								if (swipeDiff > 0) {
									previousSlide();
								} else {
									nextSlide();
								}
							} else {
								// Small swipe == click
								slide.transform({
									position: 	[	0, 
													undefined
												]
								}, 300);
								
								imageNavigate(getXY(e.originalEvent));
							}
							
							return false;
						},
					
						noAction = function(e) {
							e.preventDefault();
							return false;
						};
						
				slides = slides.add(t);
				
				t.add(t.find(options.fill)).css({
						position: 	'absolute'
					});
				
				// Swipe support
				t.attr('draggable', 'true')
					.on(TOUCH.START + '.' + ns + ' mousedown.' + ns, swipeStart)
					.on(TOUCH.MOVE + '.' + ns, swipeMove)
					.on(TOUCH.END + '.' + ns + ' ' + TOUCH.CANCEL + '.' + ns, swipeEnd)
					.on('selectstart.' + ns, noAction);
			});
							
			if (!slides.filter(':visible').length) {
				slide = slides.eq(0);
				slide.show();			
			} else {
				slide = slides.filter(':visible').eq(0);
				slides.not(slide).hide();
			}
			
			setImage();
			
			if (slides.length > 1) {
	
				// External trigger to switch image
				self.on('goto.' + ns, function(index) {
						gotoImage(index);
						return false;
					})
					// Removing slider
					.on('quit.' + ns, function() {
						quitSlider();
						return false;
					})
					// External trigger to go to the previous image
					.on('next.' + ns, function() {
						nextImage();
						return false;
					})
					// External trigger to go to next image
					.on('previous.' + ns, function() {
						previousImage();
						return false;
					});
				
				// Pause overlay
				sl_pause = $('<div>', {
						'class': 	'slider-pause'
					}).hide().on('click.' + ns, function(e) {
						e.preventDefault();
						nextSlide();
						return false;
					}).appendTo(self);
		
				// Progress bar
				sl_progress = ($('<div>', {
						'class': 	'slider-progress'
					}).on('click.' + ns, function( e ) {
						e.preventDefault();
						var x = getX(e.originalEvent);
						if (x !== null) {
							gotoSlide(Math.floor((x - sl_progress.offset().left) * slides.length / sl_progress.width()));
						}
						return false;
					})).append($('<span>').css({
						left:	'0',
						width:	100 / slides.length + '%'
					})).appendTo(self);
	
				timer = setTimeout(nextSlide, options.delay + 1000);
				
			}
	
			$window.on('resize.' + ns, function() {
					
					slideWidth = self.width();
					slideHeight = self.height();
					
					slides.each(function() {
						$(this).css({
							width:	'100%',
							height:	'100%'
						});
					});
					
					setProgress();
					
					if (options.fill) {
						setImage();
					}
				});
	
			return this;
		};
	
})(jQuery, jQuery(window), jQuery(document));