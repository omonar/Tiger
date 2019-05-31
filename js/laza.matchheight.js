/*	
 *	matchHeight() :: maintains same height of elements in a row
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).matchHeight(options);
 *	options:
 		delegate		// the watched element for the row collection - default: 'card'
 		selector		// the items to match height - default: none = match cards 
 		lazyloadClass	// the container of images (<a>) to be loaded later
 */

;(function($, $window, $document, $body) {
	'use strict';
			
	$.fn.matchHeight = function(settings) {
		
		settings = $.extend({}, $.fn.matchHeight.defaults, settings);
		
		return $(this).each(function() {
		
			var self 		= 	$(this),									// root element
				all 		= 	self.find('.' + settings.delegate),			// elements to watch in a row
				ns 			= 	self.data('lmh_ns'),						// event namespace
				imgCnt,
				colCnt,
				cWidth,
				refreshTimeout,
				wheight,
				wwrange,
				
				getRange = function() {
						return Math.getRange(Math.round($window.width() / 16), settings.breakpoints);					
					},
					
				getColCnt = function() {
						return Math.ceil((all.closest('.row').width() + 1) / all.eq(0).outerWidth());
					},
					
				getImgCnt = function() {
						return all.find('img').length;
					},
					
				getCardWidth = function() {
						return all.eq(0).outerWidth();
					},
					
				thumbReady = function(t) {
						
						var i = t.hasClass(settings.thumbClass)? t : t.find('.' + settings.thumbClass);
						
						if (!i.length) {
							//console.log('thumbReady: no image');
							return true;
						}
						
						i = i.find('img').eq(0);
						//console.log('thumbReady: ' + i.attr('src') + ': ' + i[0].naturalWidth + 'x' + i[0].naturalHeight);
						return i.length && i.is(':visible') && (i[0].naturalHeight > 0 || i.eq(0).height() > 0);
					},
					
				// Getting one row of cards
				// 	<div class="column">
				//		<div class="card preload|lazyload" style="height:NNpx">
				//			<a class="thumb"><img></a>
									
				matchRow = function(cards) {
					
						if (!cards) {
							return;
						}
						
						if (settings.match) {
							
							// Multiple elements to match
							
							var el;
							
							// Resetting
							for (var i = 0; i < settings.match.length; i++) {
								el = (settings.match[i] === settings.delegate)? cards : cards.find('.' + settings.match[i]);
								if (el.hasClass(settings.verticalMiddleClass)) {
									if (settings.usePadding) {
										el.css({
											height: 		'auto',
											paddingTop:		0
										});
									} else {
										el.css({
											height: 		'auto',
											marginTop:		0,
											marginBottom:	0
										});
									}
								} else {
									el.height('auto');
								}
							}
							
							if (cards.length > 1) {
								
								// Multi column
								
								var	h,
									mh;
									
								for (var i = 0; i < settings.match.length; i++) {
									el = (settings.match[i] === settings.delegate)? cards : cards.find('.' + settings.match[i]);
									mh = 0;
									
									if (el.length > 1) {
										//console.log('Matching: ' + settings.match[i]);
										
										el.each(function(i) {
											//console.log($(this).find('img').eq(0).attr('src') + ' [' + i + ']. height: ' + $(this).height()); 
											if ((h = $(this).outerHeight()) > mh) {
												mh = h;
											}
										});
										
										//console.log('Max height: ' + mh);
										
										if (mh > 24) {
											// Precaution to avoid too small thumbs
											el.each(function() {
												var t = $(this);
												
												//console.log(t[0].nodeName + ' ' + t[0].className + ' ' + ((t[0].nodeName === 'IMG')? t.attr('src'):'') + ': ' + t.height());
												
												if (thumbReady(t)) {
													
													//console.log(t.find('h3,h4,h5,h6').text() + ' -> ' + t.outerHeight() + ' : ' + t.height());
													if (t.hasClass(settings.verticalMiddleClass)) {
														if ((h = t.outerHeight()) < mh) { // && h > 14 ???
															//console.log('Align middle: ' + mh);
															if (settings.usePadding) {
																t.css({
																	height: 		mh,
																	paddingTop:		Math.floor((mh - h) / 2)
																});
															} else {
																t.css({
																	height: 		'auto',
																	marginTop:		Math.floor((mh - h) / 2),
																	marginBottom:	Math.ceil((mh - h) / 2)
																});
															}
														} else {
															if (settings.usePadding) {
																t.css({
																	height: 		'auto',
																	paddingTop:		0
																});
															} else {
																t.css({
																	height: 		'auto',
																	marginTop:		0,
																	marginBottom:	0
																});
															}
														}
													} else {
														//console.log('Uniform height: ' + mh);
														t.css({
															height: 	mh
														});
													}
												
													t.data('fixed', true);
												}
											});
										}
									}
								}
							}
							
						} else {
							
							// Single element to match
							
							cards.height('auto');
								
							if (cards.length > 1) {
								var h,
									mh;
									
								cards.each(function() {
									if ((h = $(this).height()) > mh) {
										mh = h;
									}
								});
								
								if (mh >= 60) {
									cards.each(function() {
										var t = $(this);
										if (thumbReady(t)) {
											t.height(mh);
											t.data('fixed', true);
										}
									});
								}
							}
						}
					},
				
				// Get visible cards (per rows)
				
				getVisible = function() {
						var cards = [],
							row = $(),
							scrollTop = $window.scrollTop(),
							lto = -999,
							to,
							th,
							
							addRow = function(row) {
									var cnt = 0;
									row.each(function() {
											if ($(this).data('fixed')) {
												cnt++;
											}
										});
									
									if (cnt !== row.length) {
										// There's at least one unfixed element
										cards.push(row);
									}
								};
						
						if (self.is(':visible')) {
							all.each(function() {
									var t = $(this);
									
									if (t.hasClass(settings.lazyloadClass)) {
										// Not yet loaded
										return true;
									}
									
									to = t.offset().top;
									th = t.height();
									
									if ((to + th) >= (scrollTop - wheight)) {
										if (to < (scrollTop + wheight * 2)) {
											if (Math.abs(to - lto) < 2) {
												// same row
												row = row.add(t);
											} else {
												if (row.length) {
													// add previous row
													addRow(row);
												}
												// next row
												lto = to;
												row = t;
											}
										} else {
											// below fold
											return false;
										}
									}
								});
							
							if (row.length) {
								// add remaining cards
								addRow(row);
							}
						}
						
						return cards;
					},
					
				// Main refresh routine
				
				refresh = function() {
						
						clearTimeout(refreshTimeout);
						
						var wwr = getRange(),
							ccnt = getColCnt(),
							cw = getCardWidth();
							
						if (wwr !== wwrange || ccnt !== colCnt || cw !== cWidth) {
							// Different column count :: reset all fixed
							wwrange = wwr;
							colCnt = ccnt;
							cWidth = cw;
							all.data('fixed', null);
						}
					
						var cards = getVisible();
								
						if (cards.length) {
							
							for (var i = 0; i < cards.length; i++) {
								if (cards[i].length < 2) {
									// 1 per row
									cards[i].height('auto');
								} else {
									// Matching multiple elements
									matchRow(cards[i]);
								}
							}
						}
					},
					
				// Checks if more lazyload images has been loaded
				
				checkImageChanges = function() {
						var ic = getImgCnt();
							
						if (ic !== imgCnt) {
							clearTimeout(refreshTimeout);
							refreshTimeout = setTimeout(refresh, settings.refreshFrequency);
							imgCnt = ic;
						}
							
						if (all.filter('.' + settings.lazyloadClass).length) {
							// Until all loaded
							setTimeout(checkImageChanges, settings.refreshFrequency);
						}
					};
			
			// Cleaning up old handlers
			
			if (ns) {
				$document.add($window).off('.' + ns);
			}
			
			self.data('lmh_ns', ns = 'lmh_' + Math.floor(Math.random() * 10000));
			
			// Initializing
			all 		= 	self.find('.' + settings.delegate);
			imgCnt		= 	getImgCnt();
			colCnt		=	getColCnt();
			cWidth		=	getCardWidth();
			wheight		= 	$window.height();
			wwrange		=	getRange();
			
			// Refresh on window size change (provided we've jumped breakpoint)
			
			$window.on('resize.' + ns + ' orientationchange.' + ns, function() {
					clearTimeout(refreshTimeout);
					
					wheight = $window.height();
					
					refreshTimeout = setTimeout(refresh, settings.refreshFrequency);
					return true;
				});
			
			// Refresh on scroll
			
			$window.on('scroll.' + ns, function() {
					clearTimeout(refreshTimeout);
					refreshTimeout = setTimeout(refresh, settings.refreshFrequency);
					return true;
				});
			
			// External refresh trigger
			
			self.on('matchheight', refresh);
			
			// Checking image changes
			
			setTimeout(checkImageChanges, settings.refreshFrequency);
						
			// Initial refreshing
			
			refreshTimeout = setTimeout(refresh, settings.refreshFrequency / 2);
					
		});
	};
	
	$.fn.matchHeight.defaults = {
		delegate:				'card',
		lazyloadClass:			'lazyload',
		thumbClass:				'thumb',
		verticalMiddleClass:	'vertical-middle',
		usePadding:				true,					// Using padding or margin for aligning vertically middle
		breakpoints:			[ 30, 40, 64 ],
		refreshFrequency:		500
	};
	
})(jQuery, jQuery(window), jQuery(document), jQuery('body'));
