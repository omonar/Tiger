/*	
 *	CSS3 2D transform functions with jQuery fallback
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 */
 
;(function($, $document) {
	'use strict';
	
	var UNDEF 		= 'undefined',
		BOOLEAN 	= 'boolean',
		FUNCTION 	= 'function',
		OBJECT 		= 'object',
		NUMBER 		= 'number',
		STRING 		= 'string',
		
		LEFT_POS	= 'leftPos',
		TOP_POS		= 'topPos',
	
		cssPrefix,
		jsTransitionEnd,
		
		defaultEase = 'ease-out',
		
		hasCssTransition = (function() {
			
				var s = (document.body || document.documentElement).style;
				
				if (s.webkitTransition !== undefined) {
					cssPrefix = '-webkit-';
					jsTransitionEnd = 'webkitTransitionEnd';
				} else if (s.MozTransition !== undefined) {
					cssPrefix = '-moz-';
					jsTransitionEnd = 'transitionend';
				} else if (s.OTransition !== undefined) {
					cssPrefix = '-o-';
					jsTransitionEnd = 'oTransitionEnd';
				} else if (s.transition !== undefined) {
					cssPrefix = '';
					jsTransitionEnd = 'transitionend';
				} else {
					return false;
				}
				
				return true;
				
			})(),
		
		//hasCssTransition = false,
		originTranslate = {
				'left': 	0,
				'top': 		0,
				'center': 	0.5,
				'middle': 	0.5,
				'right': 	1,
				'bottom': 	1
			};
		
	// Lightweight translateX with jQuery fallback
	
	$.fn.translateX = function(x, speed, easing, callback) {
			var options = {};
			
			if (typeof x === UNDEF) {
				var self = $(this).eq(0);
				// Query
				return hasCssTransition? 
					(self.position().left - parseFloat(self.css('left')))
					:
					(self.position().left - self.data(LEFT_POS) || 0);
			}
			
			if (typeof easing === UNDEF) {
				easing = defaultEase;
			} else if (typeof easing === FUNCTION) {
				callback = easing;
				easing = defaultEase;
			}
				
			if (hasCssTransition) {
				options[cssPrefix + 'transform'] = 'translateX(' + x + 'px)';
				options[cssPrefix + 'transition'] = cssPrefix + 'transform' + (speed? (' ' + speed + 'ms ' + easing) : '');
			}
			
			return this.each(function() {
				var self = $(this);
				
				if (!hasCssTransition) {
					
					var left = self.data(LEFT_POS);
					
					if (left === undefined) {
						self.data(LEFT_POS, left = self.position().left);
					}
					
					options.left = left + x;
					
					if (speed) {
						
						self.animate(options, {
								duration:		speed, 
								easing:			easing, 
								complete:		callback
							});
					
					} else {
						
						if (typeof callback === FUNCTION) {
							setTimeout(function() {
									callback.call(self[0]);
								}, 50);
						}
						
						self.css(options);
					}
				} else {
					
					if (typeof callback === FUNCTION) {
						self.one(jsTransitionEnd, callback);
					}
					
					self.css(options);
				}
			});
		};
	
	// Lightweight translateY with jQuery fallback
	
	$.fn.translateY = function(y, speed, easing, callback) {
			var options = {};
			
			if (typeof y === UNDEF) {
				var self = $(this).eq(0);
				// Query
				return hasCssTransition? 
					(self.position().top - parseFloat(self.css('top')))
					:
					(self.position().top - self.data(TOP_POS) || 0);
			}
			
			if (typeof easing === UNDEF) {
				easing = defaultEase;
			} else if (typeof easing === FUNCTION) {
				callback = easing;
				easing = defaultEase;
			}
				
			if (hasCssTransition) {
				options[cssPrefix + 'transform'] = 'translateY(' + y + 'px)';
				options[cssPrefix + 'transition'] = cssPrefix + 'transform' + (speed? (' ' + speed + 'ms ' + easing) : '');
			}
			
			return this.each(function() {
				var self = $(this);
				
				if (!hasCssTransition) {
					
					var top = self.data(TOP_POS);
					
					if (left === undefined) {
						self.data(TOP_POS, top = self.position().top);
					}
					
					options.top = top + y;
					
					if (speed) {
						
						self.animate(options, {
								duration:		speed, 
								easing:			easing, 
								complete:		callback
							});
					
					} else {
						
						if (typeof callback === FUNCTION) {
							setTimeout(function() {
									callback.call(self[0]);
								}, 50);
						}
						
						self.css(options);
					}
				} else {
					
					if (typeof callback === FUNCTION) {
						self.one(jsTransitionEnd, callback);
					}
					
					self.css(options);
				}
			});
		};
		
	// Lightweight translate with jQuery fallback
	
	$.fn.translate = function(pos, speed, easing, callback) {
			var options = {};
			
			if (typeof pos === UNDEF) {
				var self = $(this).eq(0);
				// Query
				return hasCssTransition? 
					[ 	
						(self.position().left - parseFloat(self.css('left'))),
						(self.position().top - parseFloat(self.css('top')))
					]
					:
					[
						(self.position().left - self.data(LEFT_POS) || 0),
						(self.position().top - self.data(TOP_POS) || 0)
					];
			}
			
			if (typeof easing === UNDEF) {
				
				easing = defaultEase;
				
			} else if (typeof easing === FUNCTION) {
				
				callback = easing;
				easing = defaultEase;
				
			}
				
			if (hasCssTransition) {
				
				options[cssPrefix + 'transform'] = 'translate(' + pos[0] + 'px,' + pos[1] + 'px)';
				options[cssPrefix + 'transition'] = cssPrefix + 'transform' + (speed? (' ' + speed + 'ms ' + easing) : '');
			
			}
			
			return this.each(function() {
				var self = $(this);
				
				if (!hasCssTransition) {
					var left = self.data(LEFT_POS)
						top = self.data(TOP_POS);
						
					if (left === undefined) {
						self.data(LEFT_POS, left = self.position().left);
					}
					
					if (top === undefined) {
						self.data(TOP_POS, top = self.position().top);
					}
					
					options.left = left + pos[0];
					options.top = top + pos[1];
					
					if (speed) {
						
						self.animate(options, {
								duration:		speed, 
								easing:			easing, 
								complete:		callback
							});
						
					} else {
						
						if (typeof callback === FUNCTION) {
							
							setTimeout(function() {
									callback.call(self[0]);
								}, 50);
						}
						
						self.css(options);
					}
				} else {
					
					if (typeof callback === FUNCTION) {
						self.one(jsTransitionEnd, callback);
					}
					
					self.css(options);
				}
			});
		};
	
	// Lightweight translateX with fade In/Out
	
	$.fn.translateXAndFade = function(x, opacity, speed, easing, callback) {
			var options = { 
						'opacity': 	opacity 
					};
			
			if (typeof easing === UNDEF) {
				easing = defaultEase;
			} else if (typeof easing === FUNCTION) {
				callback = easing;
				easing = defaultEase;
			}
				
			if (hasCssTransition) {
				options[cssPrefix + 'transform'] = 'translateX(' + x + 'px)';
				options[cssPrefix + 'transition-property'] = cssPrefix + 'transform, opacity';
				options[cssPrefix + 'transition-duration'] = speed + 'ms';
				options[cssPrefix + 'transition-timing-function'] = easing + ', linear';
			}
				
			return this.each(function() {
				var self = $(this);
				
				if (!hasCssTransition) {
					var left = self.data(LEFT_POS);
					
					if (left === undefined) {
						self.data(LEFT_POS, left = self.position().left);
					}
					
					options.left = left + x;
					
					if (speed) {
						
						self.animate(options, {
								duration:		speed, 
								specialEasing:	[ easing, 'linear' ],
								complete:		 callback
							});
						
					} else {
						
						self.css(options);
						
						if (typeof callback === FUNCTION) {
							setTimeout(function() {
									callback.call(self[0]);
								}, 50);
						}
					}
				} else {
					
					if (typeof callback === FUNCTION) {
						self.one(jsTransitionEnd, callback);
					}
					
					self.css(options);
				}
			});
		};
		
	// Lightweight translate with fade In/Out
	
	$.fn.translateAndFade = function(pos, opacity, speed, easing, callback) {
			var options = { 
						'opacity': 	opacity 
					};
			
			if (typeof easing === UNDEF) {
				easing = defaultEase;
			} else if (typeof easing === FUNCTION) {
				callback = easing;
				easing = defaultEase;
			}
				
			if (hasCssTransition) {
				options[cssPrefix + 'transform'] = 'translate(' + pos[0] + 'px,' + pos[1] + 'px)';
				options[cssPrefix + 'transition-property'] = cssPrefix + 'transform, opacity';
				options[cssPrefix + 'transition-duration'] = speed + 'ms';
				options[cssPrefix + 'transition-timing-function'] = easing, ', linear';
			}
				
			return this.each(function() {
				var self = $(this);
				
				if (hasCssTransition) {
					
					if (typeof callback === FUNCTION) {
						self.one(jsTransitionEnd, callback);
					}
					
					self.css(options);
					
				} else {
					var left = self.data(LEFT_POS),
						top = self.data(TOP_POS);
						
					if (typeof left === UNDEF) {
						self.data(LEFT_POS, left = self.position().left);
					}
					
					if (typeof top === UNDEF) {
						self.data(TOP_POS, top = self.position().top);
					}
					
					options.left = left + pos[0];
					options.top = top + pos[1];
					
					if (speed) {
						
						self.animate(options, {
								duration:		speed,
								specialEasing:	[ easing, 'linear' ], 
								complete:		callback
							});
					
					} else {
						
						self.css(options);
						
						if (typeof callback === FUNCTION) {
							setTimeout(function() {
									callback.call(self[0]);
								}, 50);
						}
					}
				}
			});
		};
	
	// Opacity transition / animation as fallback
	
	$.fn.opacity = function(opacity, speed, easing, callback) {
		
			var self = $(this);
			
			if (typeof opacity === UNDEF || typeof opacity === BOOLEAN) {
				// Query for the stored last transform
				return self.css('opacity');
			}
			
			var called = false,
				options = {},
				
				transitionEnd = function() {
						if (!called) {
							called = true;
							if (typeof callback === FUNCTION) {
									callback.call(self[0]);
								}
						}
					};
			
			if (typeof speed === FUNCTION) {
				// 2 arguments: props, callback
				callback = speed;
				easing = defaultEase;
				speed = 0;
				
			} else if (typeof easing === FUNCTION) {
				// 3 arguments: props, speed, callback
				callback = easing;
				easing = defaultEase;
				
			}
			
			if (self.css('opacity') === opacity) {
				// Do nothing
				if (typeof callback === FUNCTION) {
					setTimeout(function() {
							callback.call(self[0]);
						}, 50);
				}
				
				return this;
			}
			
			options['opacity'] = opacity;
			
			if (hasCssTransition /*&& !forcejQuery*/) {
				// CSS3 transtion supported
				
				if (speed) {
					
					options[cssPrefix + 'transition'] = 'opacity ' + speed + 'ms ' + easing;
						
					//log(self.css('opacity') + ' &rarr; ' + opacity);
					// tapping into the transitionEnd event
					self.one(jsTransitionEnd, transitionEnd);
					
					// fallback if transitionEnd hasn't been triggered for some reason
					setTimeout(transitionEnd, speed + 50);
					
					self.css(options);
					
				} else {
					
					options[cssPrefix + 'transition'] = 'none';
					
					//log(self.css('opacity') + ' &rarr; ' + opacity);
					self.css(options);
					
					// Ensuring the CSS command has finsihed before the next starts
					// otherwise the engine might skip the previous
					if (typeof callback === FUNCTION) {
						setTimeout(function() {
								callback.call(self[0]);
							}, 50);
					}
				}
			} else {
				// animating CSS props with jQuery
						
				if (speed) {
					
					self.animate(options, {
							duration:		speed,
							easing:			easing, 
							complete:		callback
						});
					
				} else {
					
					self.css(options);
					
					if (typeof callback === FUNCTION) {
						setTimeout(function() {
								callback.call(self[0]);
							}, 50);
					}
				}
			}
			
			return this;
		};
			

	/* Transform 
	 * 	$(el).transform({					// defaults:
	 			origin: [x, y],				// 0, 0
				position: [x, y],			// 0, 0
				scale: [scaleX, scaleY], 	// 1.0
				size: [width, height],		// -
				rotate: rotate				// 0
				opacity: opacity			// 1
			}, 
			speed,							// 0 :: immediate 
			easing, 						// 'ease-out'
			forcejQuery, 					// false
			callback						// no callback
	 	)
	 */
	 
	$.fn.transform = function(props, speed, easing, forcejQuery, callback) {
			var self = $(this).eq(0),
				last = self.data('transform') || {
						origo: 			[ 0, 0 ],
						position: 		[ 0, 0 ],
						origin: 		[ 0.5, 0.5 ],
						baseSize: 		[ self.width(), self.height() ],
						baseScale: 		[ 1, 1 ],
						scale: 			[ 1, 1 ],
						rotate: 		0
					};
			
			if (typeof props !== OBJECT) {
				// Query for the stored last transform
				return last;
			}			
			
			if (arguments.length > 1) {
				
				if (typeof speed === FUNCTION) {
					// 2 arguments: props, callback
					callback = speed;
					easing = defaultEase;
					speed = undefined;
				} else if (typeof easing === FUNCTION) {
					// 3 arguments: props, speed, callback
					callback = easing;
					easing = defaultEase;
				} else if (typeof forcejQuery === FUNCTION) {
					// 4 arguments: props, speed, easing, callback
					callback = forcejQuery;
					forcejQuery = false;
				}
				
				if (typeof easing === BOOLEAN) {
					forcejQuery = easing;
					easing = defaultEase;
				}
				
				if (typeof speed === BOOLEAN) {
					forcejQuery = speed;
					speed = undefined;
				}
				
			} else {
				
				easing = defaultEase;
				
			}
			
			var called = false,
				options = {},
				scale,
				
				transitionEnd = function() {
						//self.removeClass('animated');
						setTimeout(function() {
								
								if (!called) {
									called = true;
									
									if (typeof callback === FUNCTION) {
										callback.call(self[0]);
									}
								}
								
							}, 20);
					};
				
			if (props.hasOwnProperty('opacity')) {
				options['opacity'] = props.opacity;
			}
			
			if (!props.hasOwnProperty('origo')) {
				// no origo is defined :: using the saved
				props.origo = last.origo;
				
			} else if (!hasCssTransition || forcejQuery) {
				// jQuery animation :: using original position
				var i = self.data('originalPosition');
				
				if (typeof i === UNDEF) {
					// saving if not exists
					i = [ self.position().left, self.position().top ];
					self.data('originalPosition', i);
				}
				
				props.origo[0] += i[0];
				props.origo[1] += i[1];
			}
			
			if (!props.hasOwnProperty('baseScale')) {
				
				props.baseScale = last.baseScale;
				
			} else {
				
				if (typeof props.baseScale === NUMBER) {
					props.baseScale = [ props.baseScale, props.baseScale ];
				}
			}
			
			if (!props.hasOwnProperty('baseSize')) {
				
				props.baseSize = last.baseSize;
				
			} else if (!props.scale && !props.size) {
				//props.scale = [ props.baseSize[0] / last.baseSize[0], props.baseSize[1] / last.baseSize[1] ];
				props.scale = [ 1, 1 ];
				
			}
			
			if (!props.hasOwnProperty('position')) {
				
				props.position = last.position;
				
			} else {
				
				if (typeof props.position[0] === UNDEF) {
					props.position[0] = last.position[0];
				}
				
				if (typeof props.position[1] === UNDEF) {
					props.position[1] = last.position[1];
				}
			}
			
			if (!props.hasOwnProperty('origin')) {
				
				props.origin = last.origin;
				
			} else {
				
				if (typeof props.origin[0] === STRING) {
					props.origin[0] = originTranslate[props.origin[0]];
				}
				
				if (typeof props.origin[1] === STRING) {
					props.origin[1] = originTranslate[props.origin[1]];
				}	
			}
			
			if (!props.hasOwnProperty('scale')) {
				
				if (props.hasOwnProperty('size')) {
					props.scale = [ props.size[0] / props.baseSize[0], props.size[1] / props.baseSize[1] ];
				} else {
					props.scale = last.scale;
				}
				
			} else {
				
				if (typeof props.scale === NUMBER) {
					props.scale = [ props.scale, props.scale ];
				}
				
			}
			
			scale = [ props.scale[0] * props.baseScale[0], props.scale[1] * props.baseScale[1] ];
			
			//log(props.position);
			//log(scale);
			
			self.data('transform', props);
	
			if (hasCssTransition && !forcejQuery) {
				// CSS3 transtion supported
				//log(scale);
				if (props.origin[0] !== last.origin[0] || props.origin[1] !== last.origin[1]) {
					options[cssPrefix + 'transform-origin'] = props.origin[0] * 100 + '% ' + props.origin[1] * 100 + '%';
				}
				
				options[cssPrefix + 'transform'] = 
					'translate(' + (props.origo[0] + props.position[0]) + 'px,' + (props.origo[1] + props.position[1]) + 'px)' +
					((scale[0] === 1 && scale[1] === 1)? '' : (' scale(' + scale[0] + ',' + scale[1] + ')')) + 
					((props.rotate)? (' rotate(' + props.rotate + 'deg)') : '');
					
				if (speed) {
					
					options[cssPrefix + 'transition-property'] = cssPrefix + 'transform' + ((props.opacity !== undefined)? (', ' + 'opacity') : '');
					options[cssPrefix + 'transition-duration'] = speed + 'ms';
					
					if (easing) {
						options[cssPrefix + 'transition-timing-function'] = easing;
					}
					
					if (typeof callback === FUNCTION) {
						// tapping into the transitionEnd event
						self.one(jsTransitionEnd, transitionEnd);
						// fallback if transitionEnd hasn't been triggered for some reason
						setTimeout(transitionEnd, speed + 50);
						//log(options[cssPrefix + 'transform']);
					}
					//log(options);
					self.css(options);
					
				} else {
					
					options[cssPrefix + 'transition'] = 'none';
					//log(options[cssPrefix + 'transform']);
					self.css(options);
					// Ensuring the CSS command has finsihed before the next starts
					// otherwise the engine might skip the previous
					if (typeof callback === FUNCTION) {
						setTimeout(function() {
								callback.call(self[0]);
							}, 50);
					}
				}
				
			} else {
				// animating CSS props with jQuery
						
				options.left = props.origo[0] + props.position[0];
				options.top = props.origo[1] + props.position[1];
							
				if (props.hasOwnProperty('size')) {
					
					options.width = props.size[0];
					options.height = props.size[1];
					
				} else {
					
					options.width = props.baseSize[0] * scale[0];
					options.height = props.baseSize[1] * scale[1];
					options.left -= (options.width - props.baseSize[0]) * props.origin[0];
					options.top -= (options.height - props.baseSize[1]) * props.origin[1];
					
				}
				
				if (speed) {
					//self.addClass('animated');
					self.animate(options, {
							duration:		speed,
							easing:			easing,
							complete:		callback
						});
					
				} else {
					
					self.css(options);
					
					if (typeof callback === FUNCTION) {
						setTimeout(function() {
								callback.call(self[0]);
							}, 50);
					}
				}
			}
			
			// Saving the current transform properties to be able to continue where it was left off  
			return this;
		};
	
})(jQuery, document);