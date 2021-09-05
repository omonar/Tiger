/*	
 *	addTooltip() :: little Popup displaying 'title' text, or passed text (can be HTML)
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).addTooltip( [txt,] options );
 *	options:
		id: 	'tooltip',
		stay: 	3000,
		posX: 	ALIGN_CENTER,
		posY: 	ALIGN_BOTTOM,
		toX: 	ALIGN_CENTER,
		toY: 	ALIGN_TOP
 */

;(function($, $body) {
	'use strict';
			
	$.fn.hideAllTooltips = function(except) {
		
			return this.each(function() {
					
					//log('Hiding all tooltips');
					$(this).data('suppressTooltips', true).find('[data-tooltip-id]').each(function() {
							if (!$(this).data('tooltip-keep')) { 
								var id = $(this).attr('data-tooltip-id');
								
								if (id && id.length && id !== except) {
									$('#' + id).hide();
								}
							}
						});
				});
		};
	
	$.fn.destroyAllTooltips = function(except) {
		
			return this.each(function() {
					
					//log('Removing ' + $(this).find('[data-tooltip-id]').length + ' tooltip(s).');
					$(this).data('suppressTooltips', true).find('[data-tooltip-id]').each(function() {
							var id = $(this).attr('data-tooltip-id');
							//log(id);
							if (id && id.length && id !== except) {
								$('#' + id).remove();
							}
						});
				});
		};
	
	// Hiding all tooltips on mouse leaving the document
	$(document).on('mouseleave._ltt_', function() {
			$body.hideAllTooltips();
		});
	
	$.fn.addTooltip = function(content, settings) {
		
			if (typeof content !== UNDEF && typeof content !== 'string' && !content.jquery) {
				settings = content;
				content = null;
			}
			
			settings = $.extend({}, $.fn.addTooltip.defaults, settings);
			
			//console.log(content || $(this).data('tooltip') || $(this).attr('title'));
			
			var isVisible = function(el) {
						
						if (typeof el === UNDEF || !el || !el.length) {
							return true;
						} else if (el.is(':hidden') || el.css('opacity') < .25) {
							//console.log(el[0].id + ' is hidden or transparent!');
							return false;
						} else {
							var visible = true;
							el.parents().each(function() {
									if ($(this).is(':hidden') || $(this).css('opacity') < 0.25) {
										visible = false;
										return false;
									}
								});
							
							return visible;
						}
					},
					
				createNew = function(el, cont) {
						var c;
										
						if (!cont) {
							
							if (cont = el.data('tooltip')) {
								if (cont.jquery) {
									// jQuery element
									cont.removeClass('hidden');
								} else if (cont.charAt(0) === '.') {
									// read from related layer
									cont = el.find(cont).eq(0);
								} else if (cont.charAt(0) === '#') {
									cont = $(cont);
								}
							} else {
								// read from data or title attr
								cont = el.attr('title');
								el.removeAttr('title');
							}
							
							if (!cont || !cont.length) {
								return null;
							}
							
							c = $('<div>', {
									html: 	cont
								}).appendTo('body');
							
						} else if (typeof cont === 'string') {
							
							// passed directly :: html structure as string
							c = $('<div>', {
									html: 	cont
								}).appendTo('body');
							
						} else if (cont.jquery) {
							
							// jQuery element
							if (!$.contains(document.body, cont[0])) {
								c = cont.appendTo('body');
							} else {
								c = cont;
							}
							
						} else {
							return null;
						}
						
						if (c.is(':empty')) {
							return null;
						}
						
						c	.attr('id', el.attr('data-tooltip-id'))
							.addClass(settings.className)
							.attr('role', 'tooltip')
							.attr('aria-hidden', true)
							.hide()
							.append($('<span>', {
								'class': 	settings.nub
							}));
						
						return c;
						
					};
			
			return this.each(function() {
				
					if (this['data-tooltip-id']) {
						// already exists
						return true;
					}
					
					var self = $(this), 	// trigger element
						tt,					// tooltip layer
						to, 				// show timeout
						hto,				// hide timeout
						over = false,		// over the tooltip 
						focus = false,		// tooltip input got focus
						offs,				// last offset to detect if moving
						start,				// event start
						//events = '',		// cumulating events
						wasOn = false,		// was on at the beginning of the event?
						ns = '_ltt_' + Math.floor(Math.random()*10000),
						//isFireFox = /(Firefox\/\d+)/.test(navigator.userAgent),
							
						// Create
						create = function() {
							
								if (self.data('suppressTooltips') || !(tt = createNew(self, content))) {
									return false;
								}
								
								// Keep the popup live while the mouse is over
								tt	.on('mouseover.' + ns, getFocus)
									.on('mouseout.' + ns, lostFocus);
										
								// ... or an input box has focus
								tt	.find('input, textarea')
									.on('focus.' + ns, function() {
											focus = true;
											getFocus(this);
										})
									.on('blur.' + ns, function() {
											focus = false;
										});
								
								return true;
							},
						
						// getFocus
						getFocus =  function(e) {
								
								if (isVisible($(this))) {
								
									// log(e.type + ' :: Getting focus');
									clearTimeout(hto);
									hto = null;
									over = true;
									//tt.finish().show();
								}
							},
						
						// lostFocus
						lostFocus = function(e) {
		
								//if (isVisible($(e.target))) {
									// log(e.type + ' :: Losing focus');
									if (focus) {
										return;
									}
									
									over = false;
									clearTimeout(hto);
									hto = setTimeout(hide, Math.min(settings.stay || 100));
								//}
							},
							
						// Hiding the popup
						hide = function() {
								if (!over) {
									wasOn = false; 
									clearTimeout(to);
									clearTimeout(hto);
									to = hto = null; 
									//over = false;
									//events = '';
									// log('Hiding tooltip');
									if (tt) {
										tt	.css({
													opacity:	0
												})
											.one('transitionend', function() {
													$(this).css({
															display:	'none'
														});
												});
									}
								}
							},
						
						// Hide later :: automatically on touch devices
						hideLater = function() {
								clearTimeout(hto);
								hto = setTimeout(hide, settings.stay);
							},
						
						
						// Showing, aligning and fading in
						show = function() {
								var o = self.offset();
								
								if (self.data('suppressTooltips')) {
									return;
								}
								
								hto = clearTimeout(hto);
								//log('pos: ' + o.left.toFixed(3) + ',' + o.top.toFixed(3));
								
								if (!offs || (Math.abs(o.top - offs.top) < 1 && Math.abs(o.left - offs.left) < 1)) {
									// only if target layer not in move
									if (settings.exclusive) {
										self.data('tooltip-keep', true);
										$body.hideAllTooltips(self.data('tooltip-id'));
										self.data('tooltip-keep', null);
									}
									
									tt	.css({
												opacity: 	0,
												display:	'block'
											})
										.alignTo(self, {
												gap: 		settings.gap,
												pos: 		settings.pos
											})
										.css({
												opacity: 	1
											})
										.one('transitionend', function() {
												$(this).css({
														display:	'block'
													});
												hideLater();
											});
										
									wasOn = true;
										
								}
								
								offs = o;
							},
						
						// Leaving the trigger element
						leave = function(e) {
								if (isVisible($(e.target).closest('[data-tooltip-id]'))) {
									clearTimeout(hto);
									hto = null;
									// log(e.type + ' :: Leaving spot');
									if (whatInput.ask('intent') === 'mouse') {
										hto = setTimeout(hide, 100);
									} else {
										hto = setTimeout(hide, 3000);
									}
								}
							},
						
						// Avoid Click
						avoidClick = function(e) {
								e.preventDefault();
								clearTimeout(to);
								clearTimeout(hto);
								to = hto = null;
							},
						
						ttVisible = function() {
								return !!tt && tt.is(':visible') && (tt.css('opacity') > 0.99);
							},
						
						// Test for link
						hasLink = function(el) {
								var	a = el.closest('a');
								return a.length && a.attr('href') && !a.attr('href').startsWith('javascript');
							},
						
						// The hotspot clicked
						clicked = function(e) {
								//log(e.type + ' :: Clicked spot');
								//log(whatInput.ask());
								//log(events);
								
								if (isVisible($(e.target).closest('[data-tooltip-id]'))) {
									clearTimeout(to);
									to = null;
									
									if (settings.touchToggle || whatInput.ask('intent') !== 'mouse') {
									//if (events.indexOf(TOUCH.START) !== -1 || isFireFox) {
										// touched
										// Firefox by default emulates touch events with mouse events, 
										// no way you can tell the difference, so it's safer to treat like touch
										
										var now = new Date();
										
										if (settings.touchToggle || (now - start) > 1000) {
											// touch toggle or long touch
											//log('Touched for ' + (now-start) + 'ms');
											//log('wasOn='+wasOn+' hasLink()='+hasLink($(e.target))+' visible='+ttVisible());
											if (hasLink($(e.target)) && ttVisible()) {
												// Link and tt is visible :: let click it
												return true;
											} else {
												// No link or need to toggle on first
												avoidClick(e);
												
												if (wasOn) {
													hide();
												} else {
													show();
												}
												
												return false;
											}
										}		
									}
									
									if (wasOn) {
										clearTimeout(hto);
										hto = null;
										hide();
									}
									
									//events = '';
									over = false;
								}
								
								return true;
							},
						
						// Entering the hotspot :: hover or focus
						enter = function(e) {
								// log(e.type + ' :: Entering spot');
		
								if (!self.data('suppressTooltips') && isVisible($(e.target).closest('[data-tooltip-id]'))) {
									wasOn = ttVisible();
									start = new Date();
									offs = self.offset();
									tt = $('#' + self.data('tooltip-id'));
									//log('pos: ' + offs.left.toFixed(3) + ',' + offs.top.toFixed(3));
									
									if (!tt.length) {
										if (!create()) {
											destroy();
											return true;
										}
									} else {
										clearTimeout(hto);
										hto = null;
									}
									
									clearTimeout(to);
									to = null;
									
									if (whatInput.ask('intent') === 'mouse') {
										to = setTimeout(show, settings.delay);
									}
								}
								
								return true;
							},
						
						// Force removing the tooltip
						destroy = function(e) {
								self.off('.' + ns);
								to = clearTimeout(to);
								hto = clearTimeout(hto);
								self.data('suppressTooltips', true);
								$('#' + self.attr('data-tooltip-id')).remove();
								self.attr('data-tooltip-id', null);
							};
							
					
					self.attr('data-tooltip-id', ns)
						.data('suppressTooltips', false)
						.on('destroyTooltip', destroy)
						.on('removeTooltip', hide)
						.on('focus.' + ns + ' mouseenter.' + ns /*+ ' ' + TOUCH.START + '.' + ns*/, enter)
						.on('blur.' + ns + ' mouseleave.' + ns, leave)
						.on('click.' + ns, clicked);
					
				});
		};
	
	/*	pos:
		ALIGN_LEFT = ALIGN_TOP = 0
		ALIGN_CENTER = ALIGN_MIDDLE = 1
		ALIGN_RIGHT = ALIGN_BOTTOM = 2
	*/
	$.fn.addTooltip.defaults = {
			delay: 				50,
			className: 			'tooltip',
			nub: 				'nub',
			stay: 				2000,
			exclusive:			true,
			touchToggle:		false,
			pos: 				[1,2,1,0],
			gap:				6
		};
	
})(jQuery, $('body'));
