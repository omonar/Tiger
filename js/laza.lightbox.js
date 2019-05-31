/*
 *	Lightbox
 *	jslint browser: true
 */
 
;(function($, $window, $document, $body, undefined) {	
	'use strict';
	// Requires laza.util, laza.swipe and laza.transform
	
	$.fn.lightbox = function(album, settings) {
		
		if (typeof album === UNDEF) {
			return this;
		}
		
		settings = $.extend({}, $.fn.lightbox.defaults, settings);

		var self = $(this),
			text = getTranslations($.fn.lightbox.text),
			thumbs = $([]),
			thumb = $(),
			main = $(),
			image = $(),
			media = $(),
			caption = $(),
			el,
			isImage = true,
			isVideo = false,
			isAudio = false,
			isOther = false,
			isExternal = false,
			isVr = false,
			isPdf = false,
			swiped = false,
			dontRemove = false,
			slideshow,
			fitTimeout = null,
			controlsTimeout = null,
			resizeTimeout = null,
			
			curr = -1,
			loadCounter = 0,
			loadTimer,
			direction = 0,
			mainPadding,
			fitPadding = settings.hasOwnProperty('fitPadding')? settings.fitPadding : null, 
			
			// Elements
			lightbox,
			lb_overlay,
			lb_activity,
			
			// Thumbstrip
			lb_thumbstrip,
			lb_thumb_cont,
			lb_thumbs,
			
			// Controls
			lb_controls,
			lb_btn_left,
			lb_up,
			lb_zoomin,
			lb_zoomout,
			lb_showthumbs,
			lb_hidethumbs,
			lb_showcaption,
			lb_hidecaption,
			lb_play,
			lb_pause,
			lb_btn_right,
			
			// Caption
			lb_caption,
			
			ns = self.data('llb_ns'),
			extraSizes = settings.hasOwnProperty('extraSizes')? settings.extraSizes.split(/,\s*/) : false,
			
			backgroundAudioRoot = $('[data-audioplayer]'),
			backgroundAudioOn = backgroundAudioRoot.length && !backgroundAudioRoot.data('paused'),

			cleanup = function(ns) {	
					// cleaning up the old event handlers
					$window.add(document).off('.' + ns);
					// Removing the lightbox :: you can only have one lightbox per thumb set
					$('#' + ns).remove();
				},
			
			closeModal = function(id) {
					lightbox.find('.modal').trigger('destroy');
				},
				
			isFullscreen = function() {
					return document.fullscreenElement ||
						document.webkitFullscreenElement ||
						document.mozFullScreenElement ||
						document.msFullscreenElement;
				},
			
			// Reacalculating image position and size upon window resize
			
			fitImage = function(initial) {
				
					var w, 
						h,
						lbw = lightbox.width(),
						lbh = lightbox.height(),
						lbt,
						ratio, 
						img = image[0],
						defaultPoster = image.hasClass('default');
					
					clearTimeout(fitTimeout);
					
					if (!main || !main.length) {
						return;
					}
					
					clearTimeout(resizeTimeout);
					
					if (typeof mainPadding === UNDEF) {
						mainPadding = 2 * parseInt(main.css('paddingTop'));
					}
					
					if (typeof fitPadding === UNDEF) {
						fitPadding = Math.round((1 - settings.fitRatio) * Math.min(lbw, lbh) / 2);
					}
					
					if (!(w = main.data('oWidth')) || !(h = main.data('oHeight'))) {
						if (isImage || isAudio) {
							w = (typeof img.naturalWidth === UNDEF)? (img.width || image.width()) : img.naturalWidth;
							h = (typeof img.naturalHeight === UNDEF)? (img.height || image.height()) : img.naturalHeight;
							/*if (HIDPI) {
								w /= 2;
								h /= 2;
							}*/
						} else if (isVideo) {
							w = img.videoWidth;
							h = img.videoHeight;
						} else if (isExternal || isVr || isPdf) {
							w = lbw - mainPadding;
							h = lbh - mainPadding;
						} else {
							var im = thumbs.eq(curr).data(J.OBJ);
							w = Math.max(240, im[J.IMAGE][J.WIDTH]);
							h = im[J.IMAGE][J.HEIGHT];
						}
					}
					
					if (w && h) {
					
						main.data({
								'oWidth': 	w,
								'oHeight': 	h
							});
						
						lbt = 0;
						
						if (mainPadding) {
							lbw -= mainPadding;
							lbh -= mainPadding;
						}
						
						if (settings.fitImages && settings.fitBetween) {
							
							if (lightbox.hasClass(settings.captionVisibleClass)
								&& caption && caption.length) {
								lbh -= caption.outerHeight();
							}
							
							if (settings.thumbsVisible && thumbs.length > 1
								&& lb_thumb_cont && lb_thumb_cont.length) {
								lbh -= (lbt = lb_thumb_cont.outerHeight());
							}
						}
						
						ratio = (lbh - 2 * fitPadding) / h;
						if (settings.fitBoth || !isImage) {
							ratio = Math.min((lbw - 2 * fitPadding) / w, ratio);
						}
		
						if (!isOther && !isExternal && !isVr && !isPdf && !(isAudio && defaultPoster)) {
							if (settings.fitImages) {
								if (ratio < 1 || settings.scaleUp) {
									w = Math.round(w * ratio);
									h = Math.round(h * ratio);
								}
							} else if (HIDPI && ratio <= 1 && !settings.scaleUp) {
								w = Math.round(w / 2);
								h = Math.round(h / 2);
								ratio *= 2;
							}
						}
						
						if (isExternal || isVr || isPdf) {
							w = Math.min((lbw - 2 * fitPadding), w);
							h = Math.min((lbh - 2 * fitPadding), h);
						}
						
						if (initial === true) {
							main.css({
									left: 		Math.round((lbw - w) / 2),
									top: 		Math.round(lbt + (lbh - h) / 2),
									width: 		w + mainPadding,
									height: 	h + mainPadding,
									opacity: 	0
								}).show();
						} else {
							main.stop(true, false).animate({
									left: 		Math.round((lbw - w) / 2),
									top: 		Math.round(lbt + (lbh - h) / 2),
									width: 		w + mainPadding,
									height: 	h + mainPadding
								}, 500, function() {
									$(this).translateX(0, 500)
								});
						}
						
						/*
						log('fit:'+lightbox.width() + ':' + lightbox.height());
						log('window:'+$window.width() + ':' + $window.height());
						*/
						
						if (isOther || isExternal || isVr || isPdf || (ratio >= 1 && !settings.scaleUp) || defaultPoster) {
							// Disable zoom toggle button
							lightbox.addClass('no-zoom');
						} else {
							// Zoom toggle button is set
							lightbox.removeClass('no-zoom');
							lightbox.toggleClass('zoomed', settings.fitImages? (ratio > 1) : (ratio < 1));
						}
						
					} else if (initial) {
						// Wait for width and height get value
						fitTimeout = setTimeout(fitImage, true, 100);
					}
	
				},
			
			// Removing the old image and caption
			
			removeOldContent = function() {
				
					var oldMain = lightbox.find('.lightbox-main'),
						oldCaption = lightbox.find('.lightbox-caption');
						
					if (oldMain.length) {
						
						oldMain.off('.' + ns);
						
						if (settings.muteBackgroundAudio && backgroundAudioOn) {
							if (isAudio || isVideo) {
								backgroundAudioRoot.trigger('fadeOutPlayer');
							} else {
								backgroundAudioRoot.trigger('fadeInPlayer');
							}
						}
						
						// Removing the old image
						if (!swiped) {
							switch (settings.transitionType) {
								case 'crossFadeAndSlide':
									oldMain.translateXAndFade(-100 * direction, 0, settings.speed, function() {
										oldMain.remove();	
									});
									break;
									
								case 'crossFadeAndZoom':
									oldMain.transform({
											scale:		1 + direction / 40,
											opacity:	0
										}, settings.speed, function() {
											oldMain.remove();	
										});
									break;
									
								default:
									oldMain.opacity(0, settings.speed, function() {
											oldMain.remove();	
										});
							}
						}
					}
					
					if (oldCaption.length) {
						
						// Removing the old caption
						oldCaption.find('.buttons a').trigger('removeTooltip');
						
						if (oldCaption.length > 1) {
							oldCaption.eq(-1).prevAll('.lightbox-caption').remove();
							oldCaption = lightbox.find('.lightbox-caption');
						}
						
						oldCaption.opacity(0, settings.speed, function() {
							oldCaption.remove();	
						});
					}
				},
			
			// Reading image type
			
			getImageType = function(item) {
					isVideo = isAudio = isOther = isImage = isVr = isPdf = false;
					isExternal = item.hasOwnProperty(J.EXTERNAL);
					isVr = !isExternal && settings.use360Player && item.hasOwnProperty(J.PROJECTIONTYPE);
					if (!isExternal && !isVr) {
						switch (item[J.CATEGORY]) {
							case 'video':
								isVideo = true;
								break;
							case 'audio':
								isAudio = true;
								break;
							case 'other':
								isOther = true;
								isPdf = album.getExtension(item) === 'pdf';
								break;
							default:
								isImage = true;
						}
					}
				},
			
			// Creating caption and buttons
			
			prepareCaption = function(item) {
					
					caption = $('<div>', {
							'class': 	'lightbox-caption' + (slideshow? ' slideshow' : '')
						})
						.hide()
						.appendTo(lightbox);
					
					var buttons = $('<div>', {
								'class': 	'buttons'
							}),
						useLabels = settings.buttonLabels && lightbox.width() >= 640;
					
					// Extra sizes
					
					if (extraSizes && item[J.CATEGORY] === 'image') {
						el = ($('<div>', {
								'class': 	'download icon-download'
							})).appendTo(buttons);
						
						var p = album.getImagePath(item);
						
						for (var i = 0; i < extraSizes.length; i++) {
							el.append($('<a>', {
									text: 		extraSizes[i],
									href:  		p.replace('slides/', 'dl/' + extraSizes[i] + '/'),
									download: 	''
								}));
						}
					}
					
					// Print button
					
					if (settings.printImage && item[J.CATEGORY] === 'image') {
						el = $('<a>', {
								'class': 	settings.buttonClass + ' icon-printer'
							}).appendTo(buttons);
						
						if (useLabels) {
							el.text(' ' + text.print)
								.data('tooltip', text.printLabel);
						} else {
							el.data('tooltip', text.print);
						}
						
						el.on('click', function(e) {
								printImage((item[J.ORIGINAL] && !settings.hideDownload)? item[J.ORIGINAL][J.PATH] : item[J.IMAGE][J.PATH],
									item[J.TITLE] || '',
									item[J.THUMBCAPTION] || ''
								);
							});
					}
					
					// Download button
					
					if ((album.getOriginalPath(item) !== null) && !settings.hideDownload && 
						(item[J.CATEGORY] === 'image' || settings.allowDownloadOthers)) {
						el = $('<a>', {
								'class': 	settings.buttonClass + ' icon-download',
								download: 	'',
								href: 		album.getOriginalPath(item)
							}).appendTo(buttons);
							
						if (useLabels) {
							el.text(' ' + text.download);
						} else {
							el.data('tooltip', text.download);
						}
						
					}
					
					// PayPal button
					
					if (settings.hasOwnProperty('shop') && album.hasShop(item)) {
						el = $('<a>', {
								'class': 	settings.buttonClass + ' icon-shopping-cart'
							}).on('click', function(e) {
								settings.shop.root.trigger('addItems', item);
							}).appendTo(buttons);
					
						if (useLabels) {
							el.text(' ' + text.addCart)
								.data('tooltip', text.shopLabel);
						} else {
							el.data('tooltip', text.addCart);
						}
						
						el = $('<a>', {
								'class': 	settings.buttonClass + ' secondary icon-shopping-cart'
							}).on('click', function(e) {
								settings.shop.root.trigger('showCart');
							}).appendTo(buttons);
					
						if (useLabels) {
							el.text(' ' + text.viewCart);
						} else {
							el.data('tooltip', text.viewCart);
						}
						
					}
					
					// Feedback button
					
					if (settings.hasOwnProperty('feedback')) {
						el = $('<a>', {
								'class': 	settings.buttonClass + ' icon-email'
							}).on('click', function(e) {
								settings.feedback.root.trigger('addItems', item);
							}).appendTo(buttons);
					
						if (useLabels) {
							el.text(' ' + text.addComment)
								.data('tooltip', text.feedbackLabel);
						} else {
							el.data('tooltip', text.addComment);
						}
						
					}
					
					// Fotomoto button
					
					if (!LOCAL && typeof FOTOMOTO !== UNDEF && settings.fotomoto) {
						el = $('<a>', {
								'class': 	settings.buttonClass + ' icon-fotomoto'
							}).on('click', function(e) {
								FOTOMOTO.API.showWindow(10, 
									album.getOriginalPath(item) || album.getItemPath(item)
								);
							}).appendTo(buttons);
					
						if (useLabels) {
							el.text(' ' + text.fotomotoBtn)
								.data('tooltip', text.fotomotoTooltip);
						} else {
							el.data('tooltip', text.fotomotoBtn);
						}
					}
					
					// Photo data
					
					if (item[J.PHOTODATA] && settings.metaAsPopup) {
						el = $('<a>', {
								'class': 	settings.buttonClass + ' icon-camera'
							}).appendTo(buttons);
					
						if (useLabels) {
							el.text(' ' + text.metaBtn)
								.data('tooltip', text.metaLabel);
						} else {
							el.data('tooltip', text.metaBtn);
						}
						
						el.on('click', function() {
								lightbox.modal($('<div>', {
										'class':	'photodata',
										html: 		item[J.PHOTODATA]
									}), {
										'class':	'small',
										title: 		text.metaBtn
									});
								
								return false;
							});
					}
					
					// Regions
					
					if (item[J.REGIONS]) {
						el = $('<a>', {
								'class': 	settings.buttonClass + ' icon-user'
							}).appendTo(buttons);
					
						if (useLabels) {
							el.text(' ' + (settings.regionsBtn || text.regionsBtn))
								.data('tooltip', text.regionsLabel);
						} else {
							el.data('tooltip', (settings.regionsBtn || text.regionsBtn));
						}
						
						el.on('click', function() {
								var el = lightbox.find('.' + settings.regionsClass);
								
								if (el.length) {
									el.remove();
								} else {
									var reg = JSON.parse(item[J.REGIONS]);
									
									el = $('<div>', {
										'class':	settings.regionsClass
									}).appendTo(main);
									
									for (var i = 0, r; i < reg.length; i++) {
										r = reg[i].split(';');
										el.append($('<a>').css({
											left:		(100 * parseFloat(r[1])) + '%',
											top:		(100 * parseFloat(r[2])) + '%',
											width:		(100 * parseFloat(r[3])) + '%',
											height:		(100 * parseFloat(r[4])) + '%'
										}).append('<span>' + r[0] + '</span>'));
									}
									/*
									el.find('a').on('click', function() {
											$(this).toggleClass(settings.active);
											return false;
										});
									*/
								}
												
								return false;
							});
					}
					
					// Map
					
					if (item[J.LOCATION]) {
						el = $('<a>', {
							'class': 	settings.buttonClass + ' icon-location'
							}).appendTo(buttons);
					
						if (useLabels) {
							el.text(' ' + text.mapBtn)
								.data('tooltip', text.mapLabel);
						} else {
							el.data('tooltip', text.mapBtn);
						}
						
						el.on('click', function() {
							var target = $('<div>', {
										'class': 	'map-cont'
									});
							
							target.height($window.height() * settings.mapHeight);
							lightbox.modal(target, {
									'class': 	'no-padding'
								});
							
							setTimeout(function() {
								target.addMap({
										location: 			item[J.LOCATION],
										type:				settings.mapType,
										zoom:				settings.mapZoom,
										fitBounds:			false,
										fullscreenControl: 	false,
										onTypeChanged:		function(type) {
																	settings.mapType = type;
																},
										onZoomChanged:		function(zoom) {
																	settings.mapZoom = zoom;
																}
									});
							}, 100);
							
							return false;
						});
					}
					
					// Mostphotos
					
					if (item[J.MOSTPHOTOS]) {
						el = $('<a>', {
								'class': 	settings.buttonClass + ' icon-shopping-cart',
								target: 	'_blank',
								href: 		'https://mostphotos.com/' + item[J.MOSTPHOTOS]
							}).appendTo(buttons);
						
						if (useLabels) {
							el.text(' ' + text.mostphotosBtn)
								.data('tooltip', text.mostphotosLabel);
						} else {
							el.data('tooltip', text.mostphotosBtn);
						}
					}
					
					// Share buttons
					
					if (settings.share && settings.showShare) {
						el = $('<a>', {
								'class':	settings.buttonClass + ' icon-connect',
							}).appendTo(buttons);
						
						if (useLabels) {
							el.text(' ' + text.share)
								.data('tooltip', text.shareLabel);
						} else {
							el.data('tooltip', text.share);
						}
						
						el.on('click', function() {
							var target = $('<div>', {
										'class': 	'share-cont social-links text-center'
									});
							
							lightbox.modal(target, {
									'class':	'small',
									title: 		text.shareOn
								});
							
							setTimeout(function() {
								target.renderShares({
										sites: 			settings.share,
										title: 			item[J.TITLE] || item[J.NAME],
										description: 	item[J.COMMENT],
										image: 			album.getAbsoluteImagePath(item),
										href: 			album.getAbsolutePath(item)
									});
							}, 100);
							
							return false;
						});
					}
					
					if (settings.showNumbers) {
						buttons.prepend($('<h4>', {
								'class':	'numbers',
								'html':		'<span>' + (curr + 1) + '</span> / ' + thumbs.length
							}));
					}
					
					if (item[J.SOUNDCLIP]) {
						buttons.append($('<audio>', {
								'class':	'soundclip',
								src:		item[J.SOUNDCLIP],
								controls:	'controls'
							}));
					}
					
					if (!buttons.is(':empty')) {
						caption.addClass(settings.hasbuttonsClass);
						caption.append(buttons);
						buttons.children('a').addTooltip();
					}
					
					if (item[J.IMAGECAPTION]) {
						caption.append($('<div>', {
								'class': 	'caption',
								html: 		item[J.IMAGECAPTION]
							}));
						caption.find('[data-tooltip]').addTooltip();
					}
					
					if (item[J.PHOTODATA] && !settings.metaAsPopup) {
						caption.append($('<div>', {
								'class':	'photodata',
								html:		item[J.PHOTODATA]
							}));
					}
					
					if (settings.captionVisible && !caption.is(':empty')) {
						lightbox.addClass(settings.captionVisibleClass);
						caption.show();
					} else {
						lightbox.removeClass(settings.captionVisibleClass);
						if (settings.captionVisible) {
							caption.remove();
						} else {
							caption.show();
						}
					}
						
				},	
			
			// Preloading the next image (direction sensitive)
			
			preloadNext = function() {
					var nextItem;
					
					if (direction < 0 && curr > 0) {
						nextItem = thumbs.eq(curr - 1).data(J.OBJ);
					} else if (curr < thumbs.length - 2) {
						nextItem = thumbs.eq(curr + 1).data(J.OBJ);
					}
					
					if (nextItem) {
						if (nextItem[J.CATEGORY] === 'image') {
							var next = new Image();
							next.src = album.getImagePath(nextItem);
						}
					}
				},
			
			// Image clicked :: toggle controls or audio/video controls
			
			imageClicked = function(e) {
					var touched = $('html').data('whatinput') === 'touch' || e.type === 'touchend',
						playBtnClick = function(m) {
								var offs = main.offset();
								return 	Math.abs(m.clientWidth / 2 + offs.left - e.originalEvent.changedTouches[0].clientX) < 40 &&
										Math.abs(m.clientHeight / 2 + offs.top - e.originalEvent.changedTouches[0].clientY) < 40;
							};
					
					//log(e.type);
								
					if (isVideo || isAudio) {
						
						var m = media[0];
							
						if (m.paused) {
							m.play();
							if (VEND !== 'ms') {
								m.controls = false;
							}
							if (touched) {
								toggleControls();
								if (lightbox.hasClass(settings.captionVisibleClass)) {
									hideCaption();
								}
							}
						} else {
							m.pause();
							if (VEND !== 'ms') {
								m.controls = true;
							}
							if (touched) {
								showControls();
								showCaption();
							}
						}
						
					} else if (isImage) {
						
						if (touched) {
							toggleControls();
							if (!lightbox.hasClass(settings.captionVisibleClass)) {
								showCaption();
							}
						} else if (settings.clickForNext) {
							// image navigation
							if (((e.pageX || e.originalEvent.pageX) - main.position().left) > (main.width() / 2)) {
								nextImage();
							} else {
								previousImage();
							}
						}
					}
				},
			
			// The image is loaded
			
			imageReady = function() {
				
					loadCounter--;
					
					if (loadCounter > 0) {
						return;
					}
									
					if (DEBUG) {
						var d = new Date();
						if (isExternal || isVr) {
							console.log((isExternal? 'External content' : '360 player') + ' loaded: ' + (d - loadTimer) + 'ms');
						} else if (image.length) {
							console.log(((isVideo || isAudio)? 'Media' : 'Image') + ' [' + curr + '] loaded: ' + (d - loadTimer) + 'ms src="' + image[0].src + '"');
							if (typeof image[0] === UNDEF || typeof media[0] === UNDEF) {
								console.log('Premature ' + (typeof image[0] === UNDEF)? ('loadImage.done(' + image[0].src + ')') : ('loadMedia.done('+ media[0].src + ')'));
							}
						}
					}
					
					main.hide().css('opacity', 0);
					
					// Moving 100px away from center to prepare for moving back
					switch (settings.transitionType) {
						case 'crossFadeAndSlide':
							main.translateXAndFade(100 * direction, 0);
							break;
							
						case 'crossFadeAndZoom':
							main.transform({
									scale:		1 - direction / 40,
									opacity:	0
								});
							break;
							
						default:
							//main.opacity(0);
					}
					
					if ((isImage || isVideo || isAudio) && settings.rightClickProtect) {
						media.on('contextmenu', function(e) {
								e.preventDefault()
								return false;
							});
					}
												
					if (isVideo || isAudio) {
						media.attr('autoplay', settings.videoAuto);
						//media.attr('controls', 'true');
						media[0].volume = settings.volume;
						media.on('volumechange.' + ns, function() {
								settings.volume = this.volume;
							});
					}
					
					// Leaving time for CSS transform to settle down
					setTimeout(function() {
							
						fitImage(true);
						
						lb_activity.hide();
						
						// Moving back to center
						main.show();
						
						switch (settings.transitionType) {
						
							case 'crossFadeAndSlide':
								main.translateXAndFade(0, 1, settings.speed);
								break;
								
							case 'crossFadeAndZoom':
								main.transform({
										scale:		[ 1, 1 ],
										opacity:	1
									}, settings.speed);
								break;
								
							default:
								main.opacity(1, settings.speed);
								
						}
						
						// Preparing the image after transition
						setTimeout(function() {
								
							if (!isVr && (!isExternal || !main.children('iframe').length)) {
								// Swipe handler
								main.swipe({
									onSwipedLeft: 	function() {
														swiped = true;
														nextImage();
													},
													
									onSwipedRight: function() {
														swiped = true;
														previousImage();
													},
													
									onFinished: 	function() {
														if (!dontRemove) {
															$(this).trigger('removeSwipe');
															$(this).remove();
														}
													},
													
									onClick:		imageClicked
								});
							}
							
							if (settings.onLoadEnd !== false) {
								settings.onLoadEnd(thumb);
							}
							
							if (settings.preloadNext) {
								preloadNext();
							}
							
						}, settings.speed / 2);
						
					}, 50);
					
					// Continuing slideshow
					if (slideshow) {
						if (isAudio || isVideo) {
							suspendAuto();
							media[0].onended = function() {
								resumeAuto();
							};
						} else {
							clearTimeout(slideshow);
							if (lb_pause) {
								lb_pause.find('.progress').show();
							}
							slideshow = setTimeout(nextImage, settings.slideshowDelay);
						}
					} else {
						stopAuto(true);
						
						if (settings.autohideControls) {
							hideControlsLater();
						}
					}
				},
			
			// Main entry point to load a new image
			
			loadImage = function(n) {
				
					if (typeof n !== 'number') {
						n = thumbs.index(n);
					}
					
					if (n < 0 || n >= thumbs.length) {
						// Out of bounds move
						
						dontRemove = true;
						
						if (n < 0) {
							
							switch (settings.afterLast) {
								case 'donothing':
									n = 0;
									break;
									
								case 'startover':
									n = thumbs.length - 1;
									break;
									
								case 'onelevelup': 
									if (settings.level) {
										window.location.href = '../' + settings.indexName;
									}
									n = 0;
									break;
									
								case 'nextfolder':
									if (settings.baseSet && settings.previousFoldersLast) {
										window.location.href = settings.previousFoldersLast;
									}
									n = 0;
									break;
									
								default:
									n = 0;
									quitLightbox();
									
							}
							
						} else {
							
							switch (settings.afterLast) {
								
								case 'donothing':
									n = thumbs.length - 1;
									break;
									
								case 'startover':
									n = 0;
									break;
									
								case 'onelevelup': 
									if (settings.level) {
										window.location.href = '../' + settings.indexName;
									}
									n = thumbs.length - 1;
									break;
									
								case 'nextfolder':
									if (settings.baseSet && settings.nextFoldersFirst) {
										window.location.href = settings.nextFoldersFirst;
									}
									n = thumbs.length - 1;
									break;
									
								case 'ask':
									
									var buttons = new Array();
									
									if (swiped) {
										main.translateXAndFade(0, 1, settings.speed * 2);
										swiped = false;
									}
									
									n = thumbs.length - 1;
						
									if (thumbs.length > 1) {
										// Start over
										buttons.push({
												t: 	text.startOver,
												c:	'icon-loop',
												h: 	function(lb) { 
														loadImage(0);
													}
											});
									}
									
									if (settings.level) {
										// Up one level
										buttons.push({
												t: 	settings.level? text.upOneLevel : (settings.homepageLinkText || text.backToHome), 
												c:	'icon-up-one-level',	
												h: 	function() { 
														window.location.href = '../' + settings.indexName;
													}
											});
									}
									
									// Back to thumbnails
									buttons.push({
											t: 	text.backToIndex,
											c:	'icon-index',
											h: 	function() { 
													quitLightbox();
												}
										});
									
									if (settings.baseSet && settings.nextFoldersFirst) {
										// Go to next folder
										buttons.push({
												t: 	text.nextFolder,
												c:	'icon-arrow-right',
												h: 	function() {
														window.location.href = settings.nextFoldersFirst;
													}
											});
									}
							
									lightbox.modal($('<p>', {
											'class':	'text-center',
											text: 		text.atLastPageQuestion
										}), buttons, {
											onClose:	function() {
															loadImage(thumbs.length - 1);
														},
											'class': 	'secondary',
											title: 		text.atLastPage
										});
									
									return;
										
								default:
									n = thumbs.length - 1;
									quitLightbox();
							}
						}
						
						if (swiped) {
							main.translateXAndFade(0, 1, settings.speed * 2);
							swiped = false;
						}
						
					} else {
						dontRemove = false;
					}
					
					// Direction is calculated if the current thumb exists
					if (lightbox.is(':visible')) {
						// Lightbox is on
						direction = (curr > n)? -1 : ((curr < n)? 1 : 0);
						
						if (curr === n) {
							// the requested image is already on screen :: nothing to do
							return;
						}
						
					} else {
						// We're on the index page :: show lightbox
						$body.css('overflow', 'hidden');
						direction = 0;
						
						if (settings.useFullScreen) {
							$('html').fullScreen(true);
						}
						
						lightbox.show();
						backgroundAudioOn = backgroundAudioRoot.length && !backgroundAudioRoot.data('paused');
						
						if (settings.autoStart) {
							startAuto();
						}
						
						lazyloadThumbs(fitThumbstrip);
					}
					
					closeModal();
					
					var item;
					
					curr = n;
					thumb = thumbs.eq(curr);
					item = thumb.data(J.OBJ);
					
					if (settings.useThumbstrip && thumbs.length > 1) {
						setActiveThumb();
					}
					
					if (!item) {
						console.log('Fatal error: image (' + curr + ') is missing from the database! (Upload data1.json again!)');
						return;
					}
					
					lb_activity.show();
					if (lb_pause) {
						lb_pause.find('.progress').hide();
					}
					
					getImageType(item);
					
					if (settings.onLoadStart !== false) {
						settings.onLoadStart(thumb);
					}
					
					setTimeout(function() {
						
						// Delayed image loading
											
						removeOldContent(direction);
						swiped = false;
	
						loadCounter = 1;
						loadTimer = new Date();
						
							
						main = $('<div>', {
								'class': 	'lightbox-main ' + (isExternal? 'external' : (isVr? 'vr' : (isPdf? 'pdf' : item[J.CATEGORY])))
							})
							.hide()
							.appendTo(lightbox);
							
						if (isImage) {
							
							// Image
							
							media = image = $('<img>')
								.one('load.' + ns, function(e) {
									imageReady();
								})
								.attr('src', album.getImagePath(item))
								.appendTo(main);
							
							if (DEBUG) {
								console.log('Loading image [' + curr + '] src="' + album.getImagePath(item) + '"');
							}
							
							if (image[0].complete && image[0].naturalWidth > 0) {
								// From cache
								image.off('load.' + ns);
								imageReady();
							}
							
						} else if (isAudio || isVideo) {
							
							if (isVideo) {
								
								// Video
								media = image = $('<video>', {
											preload: 		'auto',
											controls: 		'true',
											controlsList:	'nodownload',
											poster: 		album.getPosterPath(item)
										});
								
							} else {
								
								var src = album.getPosterPath(item);
									
								// Audio
								loadCounter = 2;
								
								image = $('<img>', {
										'class': 	'poster' + (src.endsWith('poster.png')? ' default' : '')
									}).one('load', function(e) {
										imageReady();
									})
									.attr('src', src)
									.appendTo(main);
								
								media = $('<audio>', {
										preload: 		'auto',
										controls: 		'true',
										controlsList:	'nofullscreen nodownload'
									});
							}
							
							media.one('loadedmetadata', function(e) {
										imageReady();
									})
								.attr('src', album.getSourcePath(item))
								.appendTo(main);
							
							if (settings.muteBackgroundAudio && backgroundAudioRoot.length) {
								media.on('playing', mediaPlaying)
									.on('paused', mediaPaused)
									.on('ended', mediaEnded);
									
								backgroundAudioOn = !backgroundAudioRoot.data('paused');
							}
							
						} else if (isExternal) {
							
							var cont = item[J.EXTERNAL]['cont'],
								size = item[J.EXTERNAL]['size'];
								
							if (size) {
								size = size.split('x');
								main.data({
									oWidth:		parseInt(size[0]),
									oHeight:	parseInt(size[1])
								})
							}
								
							main.one('DOMReady', function(e) {
									imageReady();
								});
							
							if (cont.match(/^https?\:\/\//i) || cont.match(/\.html?$/i) || cont.match(/^\.\.\//)) {
								main.addClass('iframe')
									.append($('<iframe>', { 
											width: 				'100%',
											height: 			'100%',
											src: 				cont,
											frameborder: 		0,
											allowfullscreen: 	'allowfullscreen'
										}));
							} else {
								if (cont.match(/^<iframe/i)) {
									main.addClass('iframe');
								}
								main.append(cont);
							}
							
							// Considered ready after 200ms or the "ready" event, whatever comes first 
							setTimeout(imageReady, 200);
							
						} else if (isVr) {
							
							var w = Math.round(lightbox.width() * settings.fitRatio),
								h = Math.round(lightbox.height() * settings.fitRatio);
								
							main.css({
										width:		w,
										height:		h
									})
								.attr('id', 'vr' + curr)
								.addClass('vr')
								.show()
								.one('DOMReady', imageReady);
							
							// Photosphere viewer by Jeremy Heleine
							setTimeout(function() {
									var psv = new PhotoSphereViewer({
											panorama: 		album.getAbsoluteImagePath(item),
											container: 		main[0],
											usexmpdata:		false,
											zoom_level:		30,
											loading_html:	'<div class="lightbox-loading"><div></div></div>',
											navbar: 		true,
											navbar_style: 	{	
																autorotateThickness:	2,
																zoomRangeThickness: 	2,
																zoomRangeDisk:			12,
																fullscreenThickness: 	2,
																backgroundColor: 		'rgba(17, 17, 17, 0.35)'
															},
										});
								}, settings.speed);
							/*
							// Google solution 
							var vrView = new VRView.Player('#vr' + curr, {
									image: 		album.getImagePath(item),
									width: 		w,
									height:		h
								});
							*/
							
							// Considered ready after 200ms or the "ready" event, whatever comes first 
							setTimeout(imageReady, 200);
							
						} else {
							
							// Other
							var target = main;
							
							if (isPdf) {
								
								if (!HASPDFVIEWER || ISIOSDEVICE) {
									
									target = $('<iframe>', {
											src:		'https://docs.google.com/viewer?url=' + window.location.href.getDir() + album.getSourcePath(item) + '&embedded=true'		
										})
										.appendTo(main);
										
								} else {							
									target = $('<object>', {
											type:		'application/pdf'
										})
										.attr('data', album.getSourcePath(item))
										.appendTo(main);
								}
							}
							
							$('<a>', {
									href: 		album.getSourcePath(item),
									target: 	'_blank'
								})
								.append($('<img>', {
									'class': 	'other'
								})
								.one('load', function(e) {
									imageReady();
								})
								.attr('src', album.getImagePath(item)))
								.appendTo(target);
							
							$('<p>', {
									'class': 	'click-hint',
									'html': 	text.clickToOpen
								})
								.appendTo(target);
						}	
						
						prepareCaption(item);
																
					}, settings.speed / 4);
				},
			
			// Hiding the lightbox overlay
			
			quitLightbox = function() {
					
					stopAuto(true);
					
					$body.css('overflow', '');
					
					if (settings.muteBackgroundAudio && backgroundAudioOn) {
						backgroundAudioRoot.trigger('fadeInPlayer');
					}
					
					if (!main.length) {
						if (settings.onClose !== false) {
							settings.onClose(thumb);
						}
					} else {
						
						if ((isAudio || isVideo) && media) {
							var sv = media[0].volume,
								tm = settings.speed / (sv * 50),
								fade = function() {
										if (media) {
											var v = Math.max(media[0].volume - 0.02, 0);
											if (v > 0.005) {
												media[0].volume = v;
												setTimeout(fade, tm);
											} else {
												media[0].pause();
											}
										}
									};
							
							media.off('.' + ns);
							fade();
						}
						
						lightbox.fadeOut(settings.speed, function() {
							if (settings.useFullScreen) {
								$('html').fullScreen(false);
							}
							if (main.length) {
								main.remove();
								main = $();
							}
							if (caption.length) {
								caption.remove();
								caption = $();
							}
							//inProgress = false;
							if (settings.onClose !== false) {
								settings.onClose(thumb);
							}
						});
					}
				},
			
			// Removing the lightbox completely
			
			removeLightbox = function() {
					stopAuto(true);
					// removing event handlers
					thumbs.off('.' + ns);
					$document.add($window).add(lightbox).off('.' + ns);
					$body.css('overflow', '');
					
					if (!main.length) {
						// No image
						lightbox.remove();
					} else {
						// Fade out
						main.animate({ 
								'opacity': 	0 
							}, settings.speed, function() {
								lightbox.remove();
							});
					}
				},
			
			// Starting auto slideshow
			
			startAuto = function(keepMusic) {
					
					clearTimeout(slideshow);
					if (lb_play) {
						lb_play.hide();
						lb_pause.show();
					}
					lightbox.addClass(settings.playingClass);
					
					if (settings.autohideControls) {
						hideControlsLater();
					}
					
					caption.addClass('slideshow');
					slideshow = setTimeout(nextImage, settings.slideshowDelay / 4);
					
					if (!(keepMusic === true) && settings.backgroundAudioSlideshowControl) {
						backgroundAudioRoot.trigger('fadeInPlayer');
					}
					
					if (settings.onSlideshowStart !== false) {
						settings.onSlideshowStart(thumb);
					}
				},
			
			resumeAuto = function() {
					
					if (settings.autohideControls) {
						hideControlsLater();
					}
					
					lightbox.addClass(settings.playingClass);
					slideshow = setTimeout(nextImage, settings.slideshowDelay / 4);
					
					if (settings.backgroundAudioSlideshowControl) {
						backgroundAudioRoot.trigger('fadeInPlayer');
					}
				},
	
			stopAuto = function(keepMusic) {
				
					if (settings.onSlideshowPause !== false) {
						settings.onSlideshowPause(thumb);
					}
					
					if (!(keepMusic === true) && settings.backgroundAudioSlideshowControl) {
						backgroundAudioRoot.trigger('fadeOutPlayer');
					}

					if (lb_play) {
						lb_play.show();
						lb_pause.hide();
					}
					slideshow = clearTimeout(slideshow);
					caption.show().removeClass('slideshow');
					lightbox.removeClass(settings.playingClass);
					controlsTimeout = clearTimeout(controlsTimeout);
				},
			
			suspendAuto = function() {
					if (settings.backgroundAudioSlideshowControl) {
						backgroundAudioRoot.trigger('fadeOutPlayer');
					}
					slideshow = clearTimeout(slideshow);
					showControls();
				},
				
			mediaPlaying = function() {
				
					if (settings.muteBackgroundAudio) {
						if (backgroundAudioOn = !backgroundAudioRoot.data('paused')) {
							backgroundAudioRoot.trigger('fadeOutPlayer');
						}
					}
				},
				
			mediaPaused = function() {
					if (settings.muteBackgroundAudio && backgroundAudioOn) {
						backgroundAudioRoot.trigger('fadeInPlayer');
					}
				},
				
			mediaEnded = function() {
					backgroundAudioOn = false;
				},
			
			toggleZoom = function() {
					settings.fitImages = !settings.fitImages;
					savePrefs();
					fitImage();
				},
				
			showThumbs = function() {
					lightbox.addClass(settings.thumbsVisibleClass);
					settings.thumbsVisible = true;
					savePrefs();
					fitImage();
				},
			
			hideThumbs = function() {
					lightbox.removeClass(settings.thumbsVisibleClass);
					settings.thumbsVisible = false;
					savePrefs();
					fitImage();
				},
			
			showCaption = function() {
					lightbox.addClass(settings.captionVisibleClass);
					settings.captionVisible = true;
					savePrefs();
					fitImage();
				},
				
			togglePanels = function() {
					if (!settings.captionVisible && !settings.thumbsVisible) {
						lightbox.addClass(settings.thumbsVisibleClass).addClass(settings.captionVisibleClass);
						settings.thumbsVisible = settings.captionVisible = true;
					} else {
						settings.thumbsVisible = settings.captionVisible = false;
					}
					savePrefs();
					fitImage();
				},
				
			hideCaption = function() {
					lightbox.removeClass(settings.captionVisibleClass);
					settings.captionVisible = false;
					savePrefs();
					fitImage();
				},
			
			showControls = function() {
					controlsTimeout = clearTimeout(controlsTimeout);
					lightbox.removeClass(settings.controlsHideClass);
				},
			
			hideControls = function() {
					controlsTimeout = clearTimeout(controlsTimeout);
					lb_controls.hideAllTooltips();
					lightbox.addClass(settings.controlsHideClass);
				},
				
			toggleControls = function() {
					if (lightbox.hasClass(settings.controlsHideClass)) {
						showControls();
					} else {
						hideControls();
					}
				},
			
			hideControlsLater = function() {
					clearTimeout(controlsTimeout);
					controlsTimeout = setTimeout(hideControls, slideshow? Math.min(settings.slideshowDelay / 2, 1500) : 1500);
				},
				
			previousImage = function() {
					loadImage(curr - 1);
				},
			
			nextImage = function() {
					loadImage(curr + 1);
				},
			
			setActiveThumb = function() {
				
					if (!settings.useThumbstrip || thumbs.length < 2) {
						return;
					}
					
					var cthumb = lb_thumbs.children().eq((curr < 0)? 0 : curr),
						tl = cthumb.position().left,
						tw = cthumb.width(),
						cl = lb_thumbs.translateX(),
						cw = lb_thumb_cont.width(),
						tsw = lb_thumbs.width();
						
					lb_thumbs.children().removeClass(settings.activeClass);
					cthumb.addClass(settings.activeClass);
					
					if (tl < -cl) {
						lb_thumbs.translateX(Math.min(0, settings.thumbOverhead - tl), settings.thumbSpeed, lazyloadThumbs);
					} else  if ((tl + tw) > (cw - cl)) {
						lb_thumbs.translateX(Math.max(cw - tl - tw - settings.thumbOverhead, cw - tsw), settings.thumbSpeed, lazyloadThumbs);
					} else if ((cw - cl) > tsw) {
						lb_thumbs.translateX(cw - tsw, settings.thumbSpeed, lazyloadThumbs);
					}
						
				},
			
			// Adding one thumb
			
			loadThumb = function(thumb) {
					
					if (thumb.length) {
						var i = $('<img>', {
								'class': 	'hide-image'
							})
							// Onload action
							.one('load', function() {
								$(this).removeClass('hide-image').addClass('show-image');
							})
							.attr('src', thumb.attr('href'));
						
						if (settings.rightClickProtect) {
							i.on('contextmenu', function(e) {
									e.preventDefault()
									return false;
								});
						}
						
						thumb.append(i).removeAttr('href');
					}
										
				},
				
			// Loading visible thumbs
			
			lazyloadThumbs = function(callback) {
					if (!lightbox.is(':visible') || !settings.useThumbstrip || thumbs.length < 2) {
						return;
					}
					
					var cw = lb_thumb_cont.width(),
						cl = lb_thumbs.translateX() || 0;
					
					lb_thumbs.children('.' + settings.lazyloadClass).each(function() {
						var t = $(this),
							tl = t.position().left,
							tw = t.width();
							
						if (((tl + cl) < cw) && ((tl + tw + cl) > 0)) {
							// In view
							t.removeClass(settings.lazyloadClass);
							loadThumb(t);
							t.addTooltip({
									delay:	1000
								});
						} else if ((tl + cl) >= cw) {
							// Right to clip window
							return false;
						}
					});
					
					if (typeof callback === 'function') {
						callback.call(this);
					}
				},
				
			// Fit thumbnail strip if shorter than the original space
			
			fitThumbstrip = function() {
					if (!lightbox.is(':visible')) {
						return;
					}
					
					var lt = lb_thumbs.children(':last-child');

					if ((lt.position().left + lt.outerWidth()) > lb_thumb_cont.width()) {
						lb_thumbstrip.addClass(settings.scrollClass);
						setActiveThumb();
					} else {
						lb_thumbstrip.removeClass(settings.scrollClass);
						lb_thumbs.translateX(0, settings.thumbSpeed);
					}
				},
				
			// Scrolling the thumb strip
			
			scrollThumbs = function(direction) {
					var cw = lb_thumb_cont.width(),
						cl = lb_thumbs.translateX() || 0;
				
					if (cw > lb_thumbs.width()) {
						if (cl) {
							lb_thumbs.translateX(0, settings.thumbSpeed, lazyloadThumbs);
						}
					} else {
						cl = (direction < 0)? 
							Math.min(0, cl + cw)
							:
							Math.max(cw - lb_thumbs.width(), cl - cw);
						lb_thumbs.translateX(cl, settings.thumbSpeed, lazyloadThumbs);
					}						
				},
								
			// Settings up the thumb strip
			
			initThumbstrip = function() {
				
					if (settings.thumbsVisible) {
						lightbox.addClass(settings.thumbsVisibleClass);
					}
					
					// Thumbsstrip
					lb_thumbstrip = $('<div>', {
							'class':	'thumb-strip'
						})
						.appendTo(lightbox);
						
					lb_thumbstrip.append($('<button>', {
							'class':	'left icon-drop-left'
						}).on('click.' + ns, function(e) {
							scrollThumbs(-1);
							return false;
						}));
						
					lb_thumbstrip.append($('<button>', {
							'class':	'right icon-drop-right'
						}).on('click.' + ns, function(e) {
							scrollThumbs(1);
							return false;
						}));
						
					lb_thumb_cont = $('<div>', {
							'class':	'thumb-cont'
						}).appendTo(lb_thumbstrip);
						
					lb_thumb_cont.on('selectstart.' + ns, function(e) {
							return false;
						});
						
					lb_thumbs = $('<div>', {
							'class':	'thumbs'
						}).appendTo(lb_thumb_cont);
						
					var item,
						w,
						h = lb_thumbs.height() || 60,
						a,
						tw = 0;
						
					thumbs.each(function(i) {
							
						item = $(this).data(J.OBJ);
						
						a = $('<a>', {
								'class':	settings.lazyloadClass,
								title:		item[J.THUMBCAPTION] || '',
								href:		album.getThumbPath(item)
							}).appendTo(lb_thumbs);
						
						a.on('click', function(e) {
								var a = $(e.target).closest('a');
								
								loadImage(lb_thumbs.children().index(a));
								return false;
							});
						
						w = (h - 4) * item[J.THUMB][J.WIDTH] / item[J.THUMB][J.HEIGHT];
						
						a.width(w);
						
						tw += w;
					});
				},
				
			// Setting up the controls
			
			initControls = function() {
					// Control strip
					lb_controls = $('<div>', {
								'class':	'controls' + (settings.controlsUseText? ' use-text' : '')
							}).appendTo(lightbox);
					
					// Left button
					if (thumbs.length > 1) { 
						lb_btn_left = $('<button>', {
								type: 		'button',
								'class': 	'lightbox-btn previous icon-previous',
								title:		text.previousPicture,
								text:		settings.controlsUseText? text.previousPictureShort : ''
							})
							.on('click.' + ns, previousImage)
							.appendTo(lb_controls);
					}
						
					// Up button
					lb_up = $('<button>', {
							type: 		'button',
							'class': 	'lightbox-btn up icon-up-light',
							title:		text.upOneLevel,
							text:		settings.controlsUseText? text.upOneLevelShort : ''
						})
						.on('click.' + ns, quitLightbox)
						.appendTo(lb_controls);
					
					// Zoom toggle button
					if (settings.useZoom) {
						lb_zoomin = $('<button>', {
								type: 		'button',
								'class': 	'lightbox-icon zoom-in icon-expand',
								title: 		text.oneToOneSize,
								text:		settings.controlsUseText? text.oneToOneSizeShort : ''
							})
							.on('click.' + ns, toggleZoom)
							.appendTo(lb_controls);
						
						lb_zoomout = $('<button>', {
								type: 		'button',
								'class': 	'lightbox-icon zoom-out icon-contract',
								title: 		text.fitToScreen,
								text:		settings.controlsUseText? text.fitToScreenShort : ''
							})
							.on('click.' + ns, toggleZoom)
							.appendTo(lb_controls);
					}
						
					// Hide/show top thumbs
					if (settings.useThumbstrip && thumbs.length > 1) {
						lb_showthumbs = $('<button>', {
								type: 		'button',
								'class': 	'lightbox-icon show-thumbs icon-show-top-thumbs',
								title: 		text.showThumbs,
								text:		settings.controlsUseText? text.showThumbsShort : ''
							})
							.on('click.' + ns, showThumbs)
							.appendTo(lb_controls);
					
						lb_hidethumbs = $('<button>', {
								type: 		'button',
								'class': 	'lightbox-icon hide-thumbs icon-hide-top-thumbs',
								title: 		text.hideThumbs,
								text:		settings.controlsUseText? text.hideThumbsShort : ''
							})
							.on('click.' + ns, hideThumbs)
							.appendTo(lb_controls);
					}
						
					// Hide/show captions
					lb_showcaption = $('<button>', {
							type: 		'button',
							'class': 	'lightbox-icon show-caption icon-show-bottom-panel',
							title: 		text.showInfo,
							text:		settings.controlsUseText? text.showInfoShort : ''
						})
						.on('click.' + ns, showCaption)
						.appendTo(lb_controls);
					
					lb_hidecaption = $('<button>', {
							type: 		'button',
							'class': 	'lightbox-icon hide-caption icon-hide-bottom-panel',
							title: 		text.hideInfo,
							text:		settings.controlsUseText? text.hideInfoShort : ''
						})
						.on('click.' + ns, hideCaption)
						.appendTo(lb_controls);
						
					if (settings.useSlideshow && thumbs.length > 1) {
						// Play/Pause button
						lb_play = $('<button>', {
								type: 		'button',
								'class': 	'lightbox-icon play icon-slideshow',
								title: 		text.startSlideshow,
								text:		settings.controlsUseText? text.startSlideshowShort : ''
							})
							.on('click.' + ns, startAuto)
							.appendTo(lb_controls);
				
						lb_pause = $('<button>', {
								type: 		'button',
								'class': 	'lightbox-icon pause icon-pause',
								title: 		text.pause,
								text:		settings.controlsUseText? text.pauseShort : ''
							})
							.append($('<span>', {
								'class': 	'progress'
							}))
							.on('click.' + ns, stopAuto)
							.appendTo(lb_controls);
					}
							
					// Right button
					if (thumbs.length > 1) { 
						lb_btn_right = $('<button>', {
								type: 		'button',
								'class': 	'lightbox-btn next icon-next',
								title:		text.nextPicture,
								text:		settings.controlsUseText? text.nextPictureShort : ''
							})
							.on('click.' + ns, nextImage)
							.appendTo(lb_controls);
					}
					
					// Adding tooltips
					lb_controls.children('button').addTooltip({
							delay:	1000
						});
		
				},
				
			// Saving preferences
			
			savePrefs = function() {
					var pref = {},
						p,
						n;
						
					for (p in settings.prefsKept) {
						n = settings.prefsKept[p];
						if (settings.hasOwnProperty(n)) {
							pref[n] = settings[n];
						}
					}
					
					if (pref) {
						$.cookie('lb_pref', pref);
					}
				},
				
			// Loading preferences
			
			loadPrefs = function() {
					var pref = $.cookie('lb_pref'),
						p,
						n;
						
					if (pref) {
						for (p in settings.prefsKept) {
							n = settings.prefsKept[p];
							if (pref.hasOwnProperty(n)) {
								settings[n] = (pref[n] === 'true' || pref[n] === 'false')? !!pref[n] : pref[n];
							}
						}
					}
				},
			
			// Setting up the structure
			
			initLightbox = function(ns) {
				
					lightbox = $('<div>', {
							id: 		ns,
							'class': 	'lightbox'
						}).hide().appendTo('body');
				
					// Darken background
					lb_overlay = $('<div>', {
							'class': 	'lightbox-overlay'
						}).appendTo(lightbox);
				
					// Activity indicator
					lb_activity = $('<div>', {
							'class': 	'lightbox-loading'
						}).append('<div>').appendTo(lightbox);
						
					lightbox.toggleClass(settings.thumbsVisibleClass, settings.thumbsVisible && thumbs.length > 1);
					lightbox.toggleClass(settings.captionVisibleClass, settings.captionVisible);
					lightbox.toggleClass('zoomed', settings.fitImages);
					
					// Controls
					initControls();
					
					// Thumb strip
					if (settings.useThumbstrip && thumbs.length > 1) {
						initThumbstrip();
					}
				
				};
				
				
			
		// Initializing Lightbox
					
		if (ns) {
			// should never happen, but still living lightbox attached to thumb elements
			cleanup(ns);
		}
		
		// Creating new namespace
		self.data('llb_ns', ns = 'llb_' + Math.floor(Math.random() * 10000));		

		// Finding thumbs
		thumbs = self.find(settings.delegate);
		
		loadPrefs();
		
		// Initializing controls
		initLightbox();	
		
		// Setting up events
		
		// Mouse move -> show controls
		if ($('html').data('whatinput') !== 'touch') {
			lightbox.on('mousemove.' + ns, function() {
					if (lightbox.hasClass(settings.controlsHideClass)) {
						showControls();
					}
					if (settings.autohideControls) {
						hideControlsLater();
					}
				});
		}
		
		// Resize
		$window.on('resize.' + ns /* + ' orientationchange.' + ns*/, function() {
				clearTimeout(resizeTimeout);
				// Executed only if 50ms has passed since the last resize event
				resizeTimeout = setTimeout(function() { 
					clearTimeout(resizeTimeout);
					if (main && main.length && !(isVr && isFullscreen())) {
						fitImage();
					}
					lazyloadThumbs(fitThumbstrip);
				}, 50);
			});
		
		// Quit on document touch
		if (settings.quitOnDocClick) {
			lb_overlay.on('click.' + ns, function( e ) {
					if (main.length && !$(e.target).is(main)) {
						quitLightbox();
					}
				});
		}
		
		// Keyboard
		if (settings.enableKeyboard) {
			$document.on('keyup.' + ns, function(e) {
				if (!main.length || lightbox.children('.modal:visible').length || document.activeElement && (document.activeElement.nodeName === 'INPUT' || document.activeElement.nodeName === 'TEXTAREA')) {
					return true;
				}
				
				e.preventDefault();
				
				switch (e.keyCode) {
					
					case 27:
						quitLightbox();
						break;
					
					case 33:
					case 37:
						previousImage();
						break;
						
					case 34:
					case 39:
						nextImage();
						break;
						
					case 97:
					case 35:
						loadImage(thumbs.length - 1);
						break;
						
					case 103:
					case 36:
						loadImage(0);
						break;
					
					case 106:
					case 179:
						if (slideshow) {
							stopAuto();
						} else {
							startAuto();
						}
						break;
						
					case 107:
						toggleZoom();
						break;
						
					case 109:
						togglePanels();
						break;
						
					case 32:
						if (isVideo || isAudio) {
							if (media[0].paused) {
								media[0].play();
							} else {
								media[0].pause();
							}
						} else {
							if (slideshow) {
								stopAuto();
							} else {
								startAuto();
							}
						}
						break;
						
					default:
						return true;
										
				}
				
				return false;
			});
		}
		
		// Mouse wheel
		if (settings.enableMouseWheel) {
			var wheelTimeout = null;
			lightbox.on('mousewheel.' + ns + ' DOMMouseScroll.' + ns, function(e) {
					wheelTimeout = clearTimeout(wheelTimeout);
					if (!main.length || main.hasClass('pdf') || lightbox.children('.modal:visible').length) {
						return true;
					}
					wheelTimeout = setTimeout((e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0)? previousImage : nextImage, 100); 
					return false;
				});
		}
		
		// Events that can be triggered from outside
		
		// External trigger to switch image
		self.on('lightboxLoad.' + ns, function(e, n, auto) {
				stopAuto(true);
				
				if (typeof n === 'number') {
					n = Math.minMax(0, n, thumbs.length);
				} else if (typeof n === UNDEF) {
					n = 0;
				} else {
					n = thumbs.index(n);
				}
				
				if (settings.onStart !== false) {
					settings.onStart((typeof n === 'number')? thumbs.eq(n) : th);
				}
				
				loadImage(n);
				
				if (auto) {
					if (typeof auto === 'number') {
						setTimeout(startAuto, auto);
					} else {
						startAuto();
					}
				}
			})
			// External trigger to quit = does not remove, just hides the lightbox
			.on('lightboxQuit.' + ns, function() {
				quitLightbox();
				return false;
			})
			// Removing the lightbox completely
			.on('lightboxRemove.' + ns, function() {
				removeLightbox();
				return false;
			})
			// Returning the current lightbox container
			.on('lightboxContainer.' + ns, function() {
				return lightbox;
			})
			// External trigger to go to the previous image
			.on('lightboxNext.' + ns, function() {
				stopAuto();
				nextImage();
				return false;
			})
			// External trigger to go to next image
			.on('lightboxPrevious.' + ns, function() {
				stopAuto();
				previousImage();
				return false;
			});
		
		// Start
		/*
		if (settings.hasOwnProperty('auto') && $.isNumeric(settings.auto)) {
			if (settings.auto < 0) {
				settings.auto = thumbs.length + settings.auto;
			}
			if (settings.onStart !== false) {
				settings.onStart(thumbs.eq(settings.auto));
			}
			loadImage(settings.auto);
		}
		*/
		
		// Ready event
		
		if (settings.hasOwnProperty('onReady') && $.isFunction(settings.onReady)) {
			settings.onReady(thumb);
		}
		
		if (settings.autoStart && settings.baseSet) {
			startAuto();
		}

		return this;
	};
	
	$.fn.lightbox.defaults = {
			delegate:						'.card.lbable',
			buttonClass:					'button small',
			lazyloadClass:					'lazyload',
			activeClass:					'active',
			scrollClass:					'scroll',
			regionsClass:					'regions',
			captionVisibleClass:			'caption-visible',
			thumbsVisibleClass:				'thumbs-visible',
			hasbuttonsClass:				'hasbuttons',
			controlsVisibleClass:			'controls-visible',
			controlsHideClass:				'controls-hide',
			playingClass:					'playing',
			slideshowDelay:					4000,
			prefsKept: 						[ 
												'thumbsVisible',
												'captionVisible',
												'fitImages'
											],
			controlsUseText:				false,
			thumbsVisible:					true,
			useThumbstrip:					true,
			captionVisible:					true,
			fitImages:						true,
			fitBoth:						true,
			fitBetween:						true,
			fitRatio:						0.94,
			scaleUp:						false,
			useZoom:						true,
			indexName:						'index.html',
			baseSet:						true,
			autohideControls:				true,
			autoStart:						false,
			clickForNext:					true,
			useSlideshow:					true,
			backgroundAudioSlideshowControl:false,
			muteBackgroundAudio:			true,
			use360Player:					true,
			useFullScreen:					false,
			afterLast:						'donothing',
			mapHeight:						0.8,
			videoAuto:						false,
			volume:							0.5,
			rightClickProtect: 				false,
			buttonLabels:					true,
			showNumbers:					false,
			showShare:						false,
			allowDownloadOthers:			false,
			hideDownload:					false,
			printImage:						false,
			metaAsPopup:					true,
			transitionType:					'crossFadeAndSlide',
			speed: 							400,
			thumbSpeed:						400,
			thumbOverhead:					40,
			preloadNext:					true,
			enableKeyboard: 				true,
			enableMouseWheel:				true,
			quitOnEnd:						true,
			quitOnDocClick: 				true,
			onStart:						false,
			onClose:						false,
			onLoadStart:					false,
			onLoadEnd:						false,
			onReady:						false,
			onSlideshowStart:				false,
			onSlideshowPause:				false
		};
	
	$.fn.lightbox.text = {
			startOver:						'Start over',
			upOneLevel:						'Up one level',
			upOneLevelShort:				'Exit',
			backToHome:						'Back to home',
			backToIndex:					'Back to index page',
			nextFolder:						'Next folder',
			atLastPageQuestion:				'Where to go next?',
			atLastPage:						'At last page',
			atFirstPage:					'At first page',
			previousPicture:				'Previous image',
			previousPictureShort:			'Prev',
			nextPicture:					'Next image',
			nextPictureShort:				'Next',
			oneToOneSize:					'1:1 size',
			oneToOneSizeShort:				'1:1',
			fitToScreen:					'Fit to screen',
			fitToScreenShort:				'Fit',
			showThumbs:						'Show thumbnail strip',
			showThumbsShort:				'Thumbnails',
			hideThumbs:						'Hide thumbnail strip',
			hideThumbsShort:				'Hide thumbs',
			showInfo:						'Show caption / info',
			showInfoShort:					'Info',
			hideInfo:						'Hide caption / info',
			hideInfoShort:					'Hide info',
			startSlideshow:					'Start slideshow',
			startSlideshowShort:			'Play',
			pause:							'Pause',
			pauseShort:						'Pause',
			download: 						'Download',
			print:							'Print',
			printLabel:						'Print out this photo on your printer',
			mapBtn: 						'Map',
			mapLabel:						'Show the photo location on map',
			fotomotoBtn:					'Buy / Share',
			fotomotoLabel:					'Buy prints or digital files, share, send free eCards',
			mostphotosBtn:					'Purchase',
			mostphotosLabel:				'Download this image from <b>mostphotos.com</b>!',
			regionsBtn:						'People',
			regionsLabel:					'Show tagged people', 
			share:							'Share',
			shareLabel:						'Share this photo over social sites',
			shareOn:						'Share on',
			shopBtn: 						'Buy',
			shopLabel:						'Add this item to the shopping cart',
			viewCartLabel:					'View shopping cart',
			feedbackLabel:					'View feedback window',
			metaBtn: 						'Photo data',
			metaLabel:						'Display photographic (Exif/Iptc) data',
			viewCart:						'View cart',
			addCart:						'Add to cart',
			addComment:						'Add comment',
			clickToOpen:					'Click to open this document with the associated viewer!'
		};

	
})(jQuery, jQuery(window), jQuery(document), jQuery('body'));
