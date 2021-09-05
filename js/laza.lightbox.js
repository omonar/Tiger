/*
 * 	lightbox.js - lightbox for Tiger skin
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
				oldMain = $(),
				image = $(),
				media = $(),
				caption = $(),
				oldCaption = $(),
				controls = $(),
				soundClip = $(),
				el,
				isImage = true,
				isVideo = false,
				isAudio = false,
				isOther = false,
				isExternal = false,
				isVr = false,
				isPdf = false,
				isPanorama = false,
				dontRemove = false,
				slideshow = null,
				fitTimeout = null,
				controlsTimeout = null,
				resizeTimeout = null,
				autoPanoTimeout = null,
				
				listening = false,
				
				fitImages = settings.fitImages,
				zoomLevel,
				
				curr = -1,
				loadCounter = 0,
				loadTimer,
				connectionSpeed = 0,
				direction = 0,
				imgPadding,
				lbPadding = settings['fitPadding'], 
				
				// Elements
				lightbox,
				lb_overlay,
				lb_activity,
				
				// Thumbstrip
				lb_thumbstrip,
				lb_thumb_cont,
				lb_thumbs,
				
				// Controls
				lb_btn_left,
				lb_up,
				lb_zoom,
				lb_zoomin,
				lb_zoomout,
				lb_fullscr,
				lb_exitfullscr,
				lb_showthumbs,
				lb_hidethumbs,
				lb_showcaption,
				lb_hidecaption,
				lb_play,
				lb_pause,
				lb_btn_right,
				lb_zoom_slider,
				
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
							
				getThumbsHeight = function() {
					
						if (settings.thumbsVisible && thumbs.length > 1
							&& lb_thumb_cont && lb_thumb_cont.length) {
							return lb_thumb_cont.outerHeight();
						}
						
						return 0;
					},
				
				getInfoHeight = function() {
					
						if (lightbox.hasClass(settings.captionVisibleClass)
							&& caption && caption.length) {
							return caption.outerHeight();
						}
						
						return 0;
					},
				
				getPanelsHeight = function() {
						
						return getThumbsHeight() + getInfoHeight();
					},
	
				// Sets zoom (0 .. 100), where 100 means 1:1 size
				
				setZoom = function(zoom) {
						//console.log('Set zoom:' + zoom);
						zoomLevel = zoom;
						fitImage(true);
					},
					
				increaseZoom = function() {
						var v = getZoomSlider();
						
						if (v < 100) {
							v = Math.min(100, v + 20);
						}
						
						setZoomSlider(v);
						setZoom(v);
					},
						
				decreaseZoom = function() {
						var v = getZoomSlider();
						
						if (v > 0) {
							v = Math.max(0, v - 20);
						}
						
						setZoomSlider(v);
						setZoom(v);
					},
					
				getZoomSlider = function() {
						return parseInt(lb_zoom_slider.val());
					},
						
				setZoomSlider = function(zoom) {
						lb_zoom_slider.val(zoom);
					},
					
				setZoomBtn = function(canZoomIn, canZoomOut) {
					
						if (settings.zoomSlider) {
							if (canZoomIn || canZoomOut) {
								lightbox.addClass('show-zoom-level');
								if (zoomLevel === 0) {
									lb_zoom.removeClass('icon-zoom-out icon-zoom-level').addClass('icon-zoom-in');
								} else if (zoomLevel === 100) {
									lb_zoom.removeClass('icon-zoom-in icon-zoom-level').addClass('icon-zoom-out');
								} else {
									lb_zoom.removeClass('icon-zoom-in icon-zoom-out').addClass('icon-zoom-level');
								}
							} else {
								lightbox.removeClass('show-zoom-level');
							}
						} else {
							lightbox.toggleClass('show-zoom-out', canZoomOut);
							// Zoom out takes precedence if both possible
							lightbox.toggleClass('show-zoom-in', canZoomIn && !canZoomOut);
						}
						
					},
					
				// Reacalculating image position and size upon window resize
				
				fitImage = function(animate, doneFn) {
					
						if (!main || !main.length) {
							return;
						}
						
						var o = thumbs.eq(curr).data(J.OBJ),
							lbDims = [ lightbox.width(), lightbox.height() ],
							imgDims = album.getDimensions(o),
							maxDims = album.getMaxDimensions(o),
							thumbsHeight,
							infoHeight,
							
							fitPano = function(dims) {
									return Math.max(
											(lbDims[0] - 2 * lbPadding - 2 * imgPadding) / dims[0],
											(lbDims[1] - Math.max((thumbsHeight + infoHeight), 2 * lbPadding) - 2 * imgPadding) / dims[1]
										);
								},
								
							fitToLightbox = function(dims) {
									return Math.min(	
											(lbDims[0] - 2 * lbPadding - 2 * imgPadding) / dims[0], 
											(lbDims[1] - Math.max((thumbsHeight + infoHeight), 2 * lbPadding) - 2 * imgPadding) / dims[1]
										);
								};
							
						// Picture padding: border
						if (typeof imgPadding === UNDEF) {
							imgPadding = parseInt(main.css('paddingTop'));
						}
											
						// Lightbox padding
						if (typeof lbPadding === UNDEF) {
							if (settings.hasOwnProperty('fitRatio')) {
								// Image margin defined by "fitRatio" - Photoblogger
								lbPadding = Math.round((1 - settings.fitRatio) * Math.min(lbDims[0], lbDims[1]) / 2);
							} else {
								lbPadding = 0;
							}
						}
						
						thumbsHeight = getThumbsHeight() + lbPadding;
						infoHeight = getInfoHeight() + lbPadding;
						
						// Set zoom level if undef
						if (typeof zoomLevel === UNDEF || zoomLevel === null) {
							zoomLevel = (fitImages? 0 : 100);
							if (settings.useZoom && settings.zoomSlider) {
								setZoomSlider(zoomLevel);
							}
						}
						
						if (isVr || isPdf || isExternal || isAudio && image.hasClass('default')) {
							// Non-zoomable types
							var lbp = lbPadding;
							
							if (lbDims[0] > 640 && lbDims[1] > 640 && lbPadding < 60) {
								lbp = 60;
							}
									
							if (isVr || isPdf) {
								// Full screen content
								main.css({
										transition:	'none',
										left: 		lbp,
										top: 		lbp + thumbsHeight,
										width: 		lbDims[0] - 2 * lbp,
										height: 	lbDims[1] - lbp - ((thumbsHeight + infoHeight) || lbp)
									})
									.show();
									
							} else if (isExternal) {
								// External content
								imgDims[0] = Math.min(imgDims[0], lbDims[0] - 2 * lbp);
								imgDims[1] = Math.min(imgDims[1], lbDims[1] - (thumbsHeight + infoHeight));
								
								main.css({
										transition:	'none',
										left: 			Math.round((lbDims[0] - imgDims[0]) / 2),
										top: 			Math.round(thumbsHeight + (lbDims[1] - (thumbsHeight + infoHeight) - imgDims[1]) / 2),
										width: 			Math.round(imgDims[0]),
										height: 		Math.round(imgDims[1])
									})
									.show();
									
							} else {
								// Content size, but max fit lightbox
								var ratio 		= Math.min(
														(lbDims[0] - 2 * lbp - 2 * imgPadding) / imgDims[0], 
														(lbDims[1] - lbp - Math.max((thumbsHeight + infoHeight), lbp) - 2 * imgPadding) / imgDims[1]
													);
								
								if (isAudio) {
									ratio = Math.min(1, ratio);
								}
								
								var	targetDims 	= [ imgDims[0] * ratio + 2 * imgPadding, imgDims[1] * ratio + 2 * imgPadding ];
									
								main.css({
										transition:		'none',
										left: 			Math.round((lbDims[0] - targetDims[0]) / 2),
										top: 			Math.round(thumbsHeight + (lbDims[1] - (thumbsHeight + infoHeight) - targetDims[1]) / 2),
										width: 			Math.round(targetDims[0]),
										height: 		Math.round(targetDims[1])
									})
									.show();
								
							}
								
							if (settings.useZoom) {
								setZoomBtn(false, false);
							}
							
						} else {
							// Zoomable types
							
							var minRatio,
								maxRatio,
								targetRatio,
								targetDims,
								translate = [ 0, 0 ],
								isPano;
								
							// Minimal size	
							minRatio = Math.min(1, fitToLightbox(imgDims));
							
							// Maximum size
							if (isVideo || isAudio) {
								// Audio or Video: Constrain to lightbox
								maxRatio =	Math.min(settings.maxZoom, fitToLightbox(imgDims));
							} else if (maxDims) {
								// Has larger variants
								maxRatio = Math.max(settings.maxZoom, 
											Math.min(maxDims[0] / imgDims[0], maxDims[1] / imgDims[1]));
							} else {
								// Normal image
								maxRatio = Math.min(settings.maxZoom, fitToLightbox(imgDims));
							}
							
							if (minRatio > maxRatio) {
								// Swap if reversed
								var r = minRatio;
								minRatio = maxRatio;
								maxRatio = r;
							}
							
							// Target size (fit image taken into account)
							if (settings.useZoom && settings.zoomSlider) {
								// Determining initial size for zoom slider
								if (main.data('inited')) {
									// Already painted
									targetRatio = minRatio + zoomLevel * (maxRatio - minRatio) / 100;
								} else {
									// First paint
									if (isPanorama) {
										// Panorama: fit to height
										targetRatio = Math.min(settings.maxZoom, fitPano(imgDims));
									} else if (settings.fitImages) {
										// Fit to screen
										targetRatio = Math.min(settings.maxZoom, fitToLightbox(imgDims));
									} else {
										// Show in 1:1 size
										targetRatio = 1;
									}
									
									zoomLevel = 100 * Math.minMax(0, (targetRatio - minRatio) / (maxRatio - minRatio), 1);
									setZoomSlider(zoomLevel);
									main.data('inited', true);
								}
							} else {
								// Fit toggle
								if (isPanorama) {
									targetRatio = Math.min(settings.maxZoom, fitImages? fitPano(imgDims) : fitToLightbox(imgDims));
								} else {
									targetRatio = fitImages? Math.min(settings.maxZoom, fitToLightbox(imgDims)) : 1;
								}
							}
							
							// Target dimensions
							targetDims = [ imgDims[0] * targetRatio, imgDims[1] * targetRatio ];
							
							// Checking panorama
							isPano = isPanorama &&																	// Set by user 
									(targetDims[0] > lbDims[0] || targetDims[1] > lbDims[1]) ||						// hangs over the edges
									settings.autoPano &&															// ... or auto pano
									(imgDims[0] / imgDims[1] > 2 || imgDims[0] / imgDims[1] < .5625) &&				// ignoring those that doesn't qualify as panorama
									(
										targetDims[0] / lbDims[0] >= settings.panoramaAutoDetect || 				// hangs over the edges at least 1.5 times the width or height
										targetDims[1] / lbDims[1] >= settings.panoramaAutoDetect
									);
							
							// Checking if high res image needed
							if (	isImage && 																		// It's an image
									((maxDims[0] > imgDims[0]) || (maxDims[1] > imgDims[1])) && 					// Has higher resolution version
									((targetDims[0] > imgDims[0]) || (targetDims[1] > imgDims[1])) && 				// The target size is larger than the base size
									(!main.data('lastDims') || main.data('lastDims')[0] < targetDims[0])			// The higher resolution version hasn't yet been loaded
								) {
								// Exact size
								//targetDims = [ maxDims[0], maxDims[1] ];
								main.children('img').eq(0).attr('src', album.getOptimalImagePath(o, targetDims, true));
								main.data('lastDims', targetDims);
							}
								
							// Adding padding (border)
							targetDims = [  targetDims[0] + 2 * imgPadding, targetDims[1] + 2 * imgPadding ];
							
							if (animate) {
								// Delaying doneFn
								if (typeof doneFn === FUNCTION) {
									main.on('transitionEnd', function() {
											doneFn.call(null);
										});
								}
								
								// Fixing off-center: larger than screen
								if (!settings.zoomSlider || zoomLevel > 0) {
									var tr, 
										d;
									
									tr = main.translate();
								
									if (tr[0] || tr[1]) {
										
										if (targetDims[0] > lbDims[0]) {
											translate[0] = tr[0] * targetDims[0] / main.width();
											d = translate[0] + (lbDims[0] - targetDims[0]) / 2;
											
											if (d > lbDims[0] * .25) {
												// far right
												translate[0] =  targetDims[0] / 2 - lbDims[0] / 4;
											} else if (d + targetDims[0] < lbDims[0] * .75) {
												// far left
												translate[0] = lbDims[0] / 4 + targetDims[0] * 1.5;
											}
											
											translate[0] = Math.round(translate[0]);
										}
										
										if (targetDims[1] > lbDims[1]) {
											translate[1] = tr[1] * targetDims[1] / main.height();
											d = translate[1] + (lbDims[1] - targetDims[1]) / 2;
											
											if (d > lbDims[1] * .25) {
												// far right
												translate[1] =  targetDims[1] / 2 - lbDims[1] / 4;
											} else if (d + targetDims[1] < lbDims[1] * .75) {
												// far left
												translate[1] = lbDims[1] / 4 + targetDims[1] * 1.5;
											}
											
											translate[1] = Math.round(translate[1]);
										}
									}
								}
							}
							
							// Auto panorama attach or detach
							if (isImage) {
								if (isPano) {
									// Panorama 
									autoPanoTimeout = setTimeout(function() {
											main.autopano({ 
													direction: 	direction 
												});
										}, 550);
									// Delay by transTime = 500ms, necessary to allow time to finish zoom, otherwise pano calculates with wrong dimensions 
								} else {
									// Not panorama
									clearTimeout(autoPanoTimeout);
									autoPanoTimeout = null;
									main.trigger('autopanoRemove');
									
								}
							}
							
							// Apply transforms
							main.css({
									transition:		animate? 
														('transform ' + settings.transitionProps + ', left ' + settings.transitionProps + ', top ' + settings.transitionProps + ', width ' + settings.transitionProps + ', height ' + settings.transitionProps) 
														: 
														'none',
									transform:		'translate(' + translate[0] + 'px,' + translate[1] + 'px)',		
									left: 			Math.round((lbDims[0] - targetDims[0]) / 2),
									top: 			Math.round(thumbsHeight + (lbDims[1] - (thumbsHeight + infoHeight) - targetDims[1]) / 2),
									width: 			Math.round(targetDims[0]),
									height: 		Math.round(targetDims[1])
								}).show();
							
							// Set zoom button
							if (settings.useZoom) {
								setZoomBtn(targetRatio < maxRatio, targetRatio > minRatio);
							}
						}
						
						if (!animate && typeof doneFn === FUNCTION) {
							doneFn.call(null);
						}
						
					},
												
				// Reading image type
				
				getImageType = function(item) {
						
						isVideo = isAudio = isOther = isImage = isVr = isPdf = false;
						
						isExternal = item.hasOwnProperty(J.EXTERNAL);
						
						isVr = !isExternal && settings.use360Player && item.hasOwnProperty(J.PROJECTIONTYPE) && item[J.PROJECTIONTYPE] === 'equirectangular';
						
						isPanorama = item.hasOwnProperty(J.PANORAMA) && item[J.PANORAMA] || 
							(	settings.autoPano 
								&& 
								(	item[J.IMAGE][J.WIDTH] > lightbox.width()
									||
									item[J.IMAGE][J.HEIGHT] > lightbox.height()
								)
								&&
								(	(item[J.IMAGE][J.WIDTH] / item[J.IMAGE][J.HEIGHT] > 2.4) 
									|| 
									(item[J.IMAGE][J.HEIGHT] / item[J.IMAGE][J.WIDTH] > 2)
								)
							);
						
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
									isPdf = album.getExtension(item).toLowerCase() === 'pdf';
									break;
								
								default:
									isImage = true;
							}
						}
					},
				
				// Updates rating (if changed externally)
					
				updateRating = function(r) {
						
						if (curr >= 0) {
							if (typeof r === UNDEF) {
								r = thumbs.eq(curr).data(J.OBJ)[J.VISITORRATING] || 0;
							}
						
							lightbox.find('.' + settings.lightboxCaptionClass + ' .ratingbox span')
								.removeClass('r0 r1 r2 r3 r4 r5')
								.addClass('r' + r);
						}
					},
											
				// Creating caption and buttons
				
				prepareCaption = function(item) {
						
						caption = $('<div>', {
										'class': 	settings.lightboxCaptionClass + ' scrollable' + (slideshow? ' slideshow' : '')
									});
						
						var txt = $('<div>', {
										'class': 	'caption'
									}),
							buttons = $('<div>', {
										'class': 	'buttons'
									}),
							useLabels = settings.buttonLabels;
								
						if (item[J.IMAGECAPTION]) {
							txt.append(item[J.IMAGECAPTION]);
						}
						
						if (!isExternal && item[J.PHOTODATA] && !settings.metaAsPopup) {
							txt.append($('<div>', {
										'class':	'photodata',
										html:		item[J.PHOTODATA]
									}));
						}
						
						if (!txt.is(':empty')) {
							txt.find('[data-tooltip]').addTooltip();
							caption.append(txt);
						}
						
						if (settings.useRating) {
							
							var r = item[J.RATING] || 0;
							
							if (settings.visitorRating || r) {
								var s;
							
								el = $('<div>', {
										'class':	'ratingbox'
									}).appendTo(buttons);
									
								el.append($('<label>', {
										html:		text.rating
									}));
									
								s = $('<span>', {
										'class':	'rating',
										html:		STARS
									})
									.appendTo(el);
									
								if (settings.visitorRating) {
									
									if (item.hasOwnProperty(J.VISITORRATING)) {
										// Already exists
										r = item[J.VISITORRATING];
									} else {
										if (!settings.useJalbumRating) {
											// Ignore jAlbum rating
											r = 0;
										}
										// Save the default
										item[J.VISITORRATING] = r;
									}
											
									s.addClass('r' + r + (settings.useJalbumRating? '' : ' icon-close'))
										.on('click.' + ns, function(e) {
												var el = $(this),
													r = Math.minMax(0, Math.floor((getCoords(e).x - el.offset().left - parseFloat(el.css('paddingLeft'))) / 16), 5); 
													//Math.minMax(0, Math.floor((getCoords(e).x - el.offset().left + 4) / el.width()) * 5, 5);
													
												el.removeClass('r0 r1 r2 r3 r4 r5').addClass('r' + r);
												item[J.VISITORRATING] = r;
												
												// Propagate to thumbnails
												self.trigger('refreshRating', thumbs[curr]);
													
												return false;
											});
								} else {
									// Unalterable rating from jAlbum
									s.addClass('r' + r);
								}
							}
						}
						
						// Extra sizes
						
						if (!isExternal && extraSizes && item[J.CATEGORY] === 'image') {
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
						
						if (settings.printImage && item[J.CATEGORY] === 'image' && !settings.rightClickProtect) {
							el = $('<a>', {
										'class': 	settings.buttonClass + ' icon-printer'
									}).appendTo(buttons);
							
							if (useLabels) {
								el.html('<span>' + text.print + '</span>')
									.data('tooltip', text.printLabel);
							} else {
								el.data('tooltip', text.print);
							}
							
							el.on('click', function(e) {
									printImage((item[J.ORIGINAL] && settings.showDownload)? album.getOriginalPath(item) : album.getImagePath(item),
										item[J.TITLE] || '',
										item[J.THUMBCAPTION] || ''
									);
								});
						}
						
						// Download button
						
						if (!isExternal && settings.showDownload) {
							var link;
							
							if (album.getOriginalPath(item) && (isImage || isPdf || settings.allowDownloadOthers)) {
								// Original of images and PDF's are allowed to download, others with extra permission
								link = 	album.getOriginalPath(item);
							} else if (isImage && settings.allowDownloadScaled) { 
								link = album.getImagePath(item);
							}
								
							if (link) {
								
								el = $('<a>', {
										'class': 		settings.buttonClass + ' icon-download',
										href: 			link,
										html:			useLabels? ('<span>' + text.download + '</span>') : '',
										download: 		''
									}).appendTo(buttons);
									
								// Adding size as tooltip
								getFileSize(link, function(size, el) { 
										if (size && el) {
											el.addTooltip(useLabels? niceByte(size) : (text.download + ' [' + niceByte(size) + ']'));
										}
									}, el);
							}
						}
						
						// PayPal button
						
						if (settings.hasOwnProperty('shop') && album.hasShop(item) && settings.showShop) {
							var txt = album.getPriceRange(item);
							
							txt = text.addCart + (txt? (' <b>' + txt + '</b>') : '');
	
							el = $('<a>', {
									'class': 		settings.buttonClass + ' icon-shopping-cart-add'
								}).on('click', function(e) {
									settings.shop.root.trigger('addItems', item);
								}).appendTo(buttons);
							
							if (useLabels) {
								el.html('<span>' + txt + '</span>')
									.data('tooltip', text.shopLabel);
							} else {
								el.data('tooltip', txt);
							}
							
							el = $('<a>', {
									'class': 		settings.buttonClass + ' secondary icon-shopping-cart'
								}).on('click', function(e) {
									settings.shop.root.trigger('showCart');
								}).appendTo(buttons);
						
							if (useLabels) {
								el.html('<span>' + text.viewCart + '</span>')
									.data('tooltip', text.viewCartLabel);
							} else {
								el.data('tooltip', text.viewCart);
							}
							
						}
						
						// Feedback button
						
						if (settings.hasOwnProperty('feedback') && settings.showFeedback) {
							el = $('<a>', {
									'class': 	settings.buttonClass + ' icon-email-send'
								}).on('click', function(e) {
									settings.feedback.root.trigger('addItems', item);
								}).appendTo(buttons);
						
							if (useLabels) {
								el.html('<span>' + text.addComment + '</span>')
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
								el.html('<span>' + text.fotomotoBtn + '</span>')
									.data('tooltip', text.fotomotoTooltip);
							} else {
								el.data('tooltip', text.fotomotoBtn);
							}
						}
						
						// Photo data
						
						if (!isExternal && item[J.PHOTODATA] && settings.metaAsPopup) {
							el = $('<a>', {
									'class': 	settings.buttonClass + ' icon-camera'
								}).appendTo(buttons);
						
							if (useLabels) {
								el.html('<span>' + text.metaBtn + '</span>')
									.data('tooltip', text.metaLabel);
							} else {
								el.data('tooltip', text.metaBtn);
							}
							
							el.on('click', function() {
									lightbox.modal($('<div>', {
											'class':	'photodata no-padding',
											html: 		item[J.PHOTODATA]
										}), {
											title: 		text.metaBtn
										});
									
									return false;
								});
						}
						
						// Regions
						
						if (!isExternal && settings.showRegions && item[J.REGIONS]) {
							el = $('<a>', {
									'class': 	settings.buttonClass + ' icon-facetag'
								}).appendTo(buttons);
						
							if (useLabels) {
								el.html('<span>' + (settings.regionsBtn || text.regionsBtn) + '</span>')
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
									}
													
									return false;
								});
						}
						
						// Map
						
						if (settings.showMap && item[J.LOCATION]) {
							el = $('<a>', {
									'class': 	settings.buttonClass + ' icon-location'
								}).appendTo(buttons);
						
							if (useLabels) {
								el.html('<span>' + text.mapBtn + '</span>')
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
										'class': 	'no-padding large'
									});
								
								setTimeout(function() {
										target.addMap({
												apiKey:				settings['mapApiKey'],
												type:				settings['mapType'] || 'hybrid',
												zoom:				settings['mapZoom'] || 16,
												location: 			item[J.LOCATION],
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
						
						if (!isExternal &&  item[J.MOSTPHOTOS]) {
							el = $('<a>', {
									'class': 	settings.buttonClass + ' icon-shopping-cart',
									target: 	'_blank',
									href: 		'https://mostphotos.com/' + item[J.MOSTPHOTOS]
								}).appendTo(buttons);
							
							if (useLabels) {
								el.html('<span>' + text.mostphotosBtn + '</span>')
									.data('tooltip', text.mostphotosLabel);
							} else {
								el.data('tooltip', text.mostphotosBtn);
							}
						}
						
						// Share buttons
						
						if ((DEBUG || !LOCAL) && settings.share && settings.showShare) {
							
							el = $('<a>', {
									'class':	settings.buttonClass + ' icon-connect',
								}).appendTo(buttons);
							
							if (useLabels) {
								el.html('<span>' + text.share + '</span>')
									.data('tooltip', text.shareLabel);
							} else {
								el.data('tooltip', text.share);
							}
							
							el.on('click', function() {
								var target = $('<div>', {
											'class': 	'social'
										});
								
								lightbox.modal(target, {
										title: 		text.shareOn
									});
								
								setTimeout(function() {
									target.renderShares({
											sites: 			settings.share,
											title: 			item[J.TITLE] || item[J.NAME].stripExt().replace(/[-_]/g, ' ').capitalize(),
											description: 	item[J.COMMENT],
											image: 			album.getOptimalThumbPath(item, [ 640, 480 ]),
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
						
						// Sound clip
						
						if (!isAudio && item[J.SOUNDCLIP]) {
							soundClip = $('<audio>', {
										'class':		'soundclip',
										src:			item[J.SOUNDCLIP],
										controlsList:	'nofullscreen nodownload noremote'
									});
							var	btn = $('<a>', {
										'class':		'button play-pause icon-play'
									});
							
							// Setting half loudness
							soundClip[0]['volume'] = 0.5;
							
							btn.on('click', function() {
									if (btn.hasClass('icon-pause')) {
										pauseSoundClip();
									} else {
										startSoundClip()
									}
								});
							
							buttons.append(btn).append(soundClip);
							
							// Trying to autoplay
							startSoundClip();
							
						} else {
							soundClip = $();
						}
						
						if (!buttons.is(':empty')) {
							caption.addClass(settings.hasbuttonsClass);
							caption.append(buttons);
							buttons.children('a').not('[download]').addTooltip();
						}
						
						if (caption.is(':empty')) {
							lightbox.removeClass(settings.captionVisibleClass);
							lightbox.addClass('no-caption');
						} else {
							lightbox.toggleClass(settings.captionVisibleClass, settings.captionVisible);
							lightbox.removeClass('no-caption');	
							lightbox.append(caption);
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
								next.src = album.getOptimalImagePath(nextItem);
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
							return false;
							
						} else if (isImage) {
							
							if (touched) {
								toggleControls();
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
				
				// Presetting the transitions
				
				presetTransitions = function() {
					
						main.css({
								transition:		'none',
								opacity: 		0
							});

						// Moving 100px away from center to prepare for moving back
						switch (settings.transitionType) {
							
							case 'crossFadeAndSlide':
								
								main.css({
										transform:	'translateX(' + 100 * direction + ')'
									});
								//main.translateXAndFade(100 * direction, 0);
								break;
								
							case 'crossFadeAndZoom':
								
								main.css({
										transform:	'scale(' + 1 - direction / 40 + ')'
									});
								/*
								main.transform({
										scale:		1 - direction / 40,
										opacity:	0
									});
								*/
								break;
						}
						
						window.requestAnimationFrame(doTransitions);
					},
					
				// Doing all the animations in one timeframe
				
				doTransitions = function() {
						
						switch (settings.transitionType) {
							
							case 'crossFadeAndSlide':
								
								main.css({
										transition:		'none',
										opacity: 		0,
										transform:		'translateX(' + (100 * direction) + 'px)'
									});
								
								window.requestAnimationFrame(function() {
										
										if (!oldMain.data('swiped')) {
											oldMain.one('transitionend', function() {
													oldMain.remove();
													oldMain = $();
												}).css({
													transition:		'transform ' + (settings.speed / 2) + 'ms ease-out, opacity ' + (settings.speed / 2) + 'ms ease-out',
													transform:		'translateX(' + (-200 * direction) + 'px)',
													opacity:		0
												});
											/*
											oldMain.translateXAndFade(-100 * direction, 0, settings.speed, function() {
												oldMain.remove();	
											});
											*/
										}
										
										main.one('transitionend', function() {
												window.requestAnimationFrame(afterTransition);
											}).css({
												transition:		'transform ' + settings.speed + 'ms ease-out, opacity ' + settings.speed + 'ms ease-out',
												transform:		'translateX(0)',
												opacity:		1
											});
										//main.translateXAndFade(0, 1, settings.speed);
										
									});
									
								break;
								
							case 'crossFadeAndZoom':
								
								main.css({
										transition:		'none',
										opacity: 		0,
										transform:		'scale(' + (1 - direction / 40) + ')'
									});
								
								window.requestAnimationFrame(function() {
										
										if (!oldMain.data('swiped')) {
											oldMain.one('transitionend', function() {
													oldMain.remove();
													oldMain = $();
												}).css({
													transition:		'transform ' + (settings.speed / 2) + 'ms ease-out, opacity ' + (settings.speed / 2) + 'ms ease-out',
													transform:		'scale(' + (1 + direction / 20) + ')',
													opacity:		0
												});
											/*
											oldMain.transform({
													scale:		1 + direction / 40,
													opacity:	0
												}, settings.speed, function() {
													oldMain.remove();	
												});
											*/
										}
										
										main.one('transitionend', function() {
												window.requestAnimationFrame(afterTransition);
											}).css({
												transition:		'transform ' + settings.speed + 'ms ease-out, opacity ' + settings.speed + 'ms ease-out',
												transform:		'translateX(0) scale(1)',
												opacity:		1
											});
										
										/*
										main.transform({
												scale:		[ 1, 1 ],
												opacity:	1
											}, settings.speed);
										*/
										
									});
								
								break;
								
							default:
								
								main.css({
										transition:		'none',
										opacity: 		0
									});
								
								window.requestAnimationFrame(function() {
										
										if (!oldMain.data('swiped')) {
											oldMain.on('transitionEnd', function() {
													oldMain.remove();
												}).css({
													transition:		'opacity ' + (settings.speed / 2) + 'ms ease-out', 
													opacity: 		0
												});
										}
										
										main.one('transitionend', function() {
												window.requestAnimationFrame(afterTransition);
											}).css({
												transition: 	'opacity ' + settings.speed + 'ms ease-out',
												opacity:		1
											});
										
									});
						}
						
						//setTimeout(attachEventHandlers, settings.speed / 2);
						
					},
					
				// Transition has completed
					
				afterTransition = function() {
						
						if (settings.onLoadEnd !== false) {
							settings.onLoadEnd(thumb);
						}
						
						if (settings.preloadNext) {
							preloadNext();
						}
					},
				
				// The image is loaded
				
				imageReady = function() {
					
						loadCounter--;
						
						if (loadCounter > 0) {
							// Still has to load another image: (poster image) 
							return;
						}
						
						lb_activity.hide();
						
						/*			
						if (typeof performance !== UNDEF) {
							
							console.log('performance exists');
									
							var pl = performance.getEntriesByType("resource");
							
							if (pl && Array.isArray(pl)) {
								var p = pl[pl.length - 1];
								
								console.log('performance last entry: ' + p);
								
								if (typeof image[0] !== UNDEF && p.name === image[0].src) {
									connectionSpeed = connectionSpeed? ((connectionSpeed + p.decodedBodySize / p.duration) / 2) : (p.decodedBodySize / p.duration);
								}
								
								if (DEBUG) {
									console.log(p.initiatorType + ':' + p.name.substring(p.name.lastIndexOf('/') + 1) + ' [' + Math.round(p.decodedBodySize / 1000) + 'kB] loaded in ' + Math.round(p.duration) + 'ms => ' + (p.decodedBodySize / p.duration / 1000).toFixed(2) + 'MB/s' + ' (avg:' + (connectionSpeed / 1000).toFixed(2) + 'MB/s)');
								}
							}
							
						}
						*/
						
						// Reporting image load in Debug mode
						if (DEBUG) {
							var d = new Date();
							if (isExternal || isVr) {
								console.log((isExternal? 'External content' : '360 player') + ' loaded: ' + (d - loadTimer) + 'ms');
							} else if (image.length) {
								console.log(((isVideo || isAudio)? 'Media' : 'Image') + ' [' + curr + '] loaded: ' + (d - loadTimer) + 'ms src="' + image[0].src + '"' + (connectionSpeed? (' avg. speed: ' + (connectionSpeed / 1000).toFixed(2) + 'MB/s') : ''));
								if (typeof image[0] === UNDEF || typeof media[0] === UNDEF) {
									console.log('Premature ' + (typeof image[0] === UNDEF)? ('loadImage.done(' + image[0].src + ')') : ('loadMedia.done('+ media[0].src + ')'));
								}
							}
						}
											
						// Right click protect
						if ((isImage || isVideo || isAudio) && settings.rightClickProtect) {
							media.on('contextmenu', function(e) {
									e.preventDefault()
									return false;
								});
						}
						
						// Audio / video initilazion
						if (isVideo || isAudio) {
							media.attr({
									autoplay: 	settings.videoAuto,
									loop:		settings.videoLoop
								});
							media[0].volume = settings.volume;
							
							media.on('volumechange.' + ns, function() {
									settings.volume = this.volume;
								});
						}
						
						if (oldCaption.length) {
							
							// Removing the old caption
							oldCaption.find('.buttons a').trigger('removeTooltip');
							
							if (oldCaption.length > 1) {
								oldCaption.eq(-1).prevAll('.' + settings.lightboxCaptionClass).remove();
								oldCaption = lightbox.find('.' + settings.lightboxCaptionClass);
							}
							
							oldCaption.one('transitionend', function() {
									oldCaption.remove();
									oldCaption = $();
								}).css({
									transition:		'opacity ' + (settings.speed / 2 ) + 'ms ease-out',
									opacity:		0
								});
							/*
							oldCaption.opacity(0, settings.speed, function() {
								oldCaption.remove();	
							});
							*/
						}
						
						if (!isVr && !isPdf && (!isExternal || !main.children('iframe').length)) {
							// Swipe handler
							main.swipe({
								onSwipeStart:	function() {
														$(this).trigger('autopanoStop');
													},
								
								onSwipedLeft: 	function() {
														main.data('swiped', true);
														nextImage();
													},
												
								onSwipedRight: function() {
														main.data('swiped', true);
														previousImage();
													},
												
								onFinished: 	function() {
														if (!dontRemove) {
															$(this).trigger('removeSwipe');
															$(this).remove();
														}
													},
												
								onClick:		function(e) {
														if (lightbox.data('panomove')) {
															$(this).trigger('autopanoStop');
														} else {
															imageClicked(e);
														}
													}
							});
						}
						
						// Placing and centering the new image
						fitImage(false);
						
						// Running transitions
						window.requestAnimationFrame(doTransitions);
						
						// Continuing slideshow
						if (slideshow) {
							if ((isAudio || isVideo) && settings.videoAuto) {
								suspendAuto();
								media[0].onended = function() {
									resumeAuto();
								};
							} else {
								clearTimeout(slideshow);
								slideshow = setTimeout(nextImage, settings.slideshowDelay);
								if (lb_pause) {
									lb_pause.find('.progress').show();
								}
							}
						} else {
							//stopAuto(true);
							if (settings.autohideControls) {
								hideControlsLater();
							}
						}
						
					},
				
				// Recentering after swipe for example
				
				recenter = function(el) {
						var el = el || main;
						el.one('transitionend', function() {
								el.data('swiped', false);
							}).css({
								transition:		'opacity ' + (settings.speed * 2) + 'ms ease-out, transform ' + (settings.speed * 2) + 'ms ease-out',
								opacity: 		1,
								transform: 		'translateX(0)'
							});
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
										
									case 'nextindex':
										if (settings.baseSet && settings.previousFolderPath) {
											window.location.href = settings.previousFolderPath;
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
										stopAuto();
										break;
										
									case 'startover':
										n = 0;
										break;
										
									case 'onelevelup': 
										if (settings.level) {
											window.location.href = '../' + settings.indexName;
										}
										n = thumbs.length - 1;
										stopAuto();
										break;
										
									case 'nextfolder':
										if (settings.baseSet && settings.nextFoldersFirst) {
											window.location.href = settings.nextFoldersFirst + (slideshow? '&slideshow' : '');
										}
										n = thumbs.length - 1;
										break;
										
									case 'nextindex':
										if (settings.baseSet && settings.nextFolderPath) {
											window.location.href = settings.nextFolderPath;
										}
										n = thumbs.length - 1;
										break;
										
									case 'ask':
										
										var buttons = new Array();
										
										if (main.data('swiped')) {
											recenter();
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
													c:	'icon-one-level-up',	
													h: 	function() { 
															window.location.href = '../' + settings.indexName;
														}
												});
										}
										
										// Back to thumbnails
										buttons.push({
												t: 	text.backToIndex,
												c:	'icon-arrow-up',
												h: 	function() { 
														quitLightbox();
													}
											});
										
										if (settings.baseSet) {
											
											if (settings.nextFoldersFirst) {
												// Go to next folder
												buttons.push({
														t: 	text.nextFolder,
														c:	'icon-arrow-right',
														h: 	function() {
																window.location.href = settings.nextFoldersFirst;
															}
													});
											}
								
											if (settings.nextFolderPath) {
												// Go to next index
												buttons.push({
														t: 	text.nextIndex,
														c:	'icon-thumbnails',
														h: 	function() {
																window.location.href = settings.nextFolderPath;
															}
													});
											}
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
										// Back to index
										n = slideshow? 0 : (thumbs.length - 1);
										stopAuto();
										quitLightbox();
								}
							}
							
							if (main.data('swiped')) {
								recenter();
							}
							
						} else {
							dontRemove = false;
						}
						
						// Direction is calculated if the current thumb exists
						if (lightbox.is(':visible')) {
							// Lightbox is on
							if ((Math.abs(n - curr) >= thumbs.length - 1) && settings.afterLast === 'startover') {
								// Flip over
								direction = 1;
							} else {
								direction = (curr > n)? -1 : ((curr < n)? 1 : 0);
							}
							
							if (curr === n) {
								// the requested image is already on screen :: nothing to do
								return;
							}
							
							controls.hideAllTooltips();
							
							if (settings.autoHideControls) {
								hideControlsLater();
							}
							
						} else {
							// We're on the index page :: show lightbox
							listening = true;
							$body.add($('html')).css('overflow', 'hidden');
							$body.addClass(settings.lightboxOnClass);
							direction = 0;
							
							if (settings.lightboxFullscreen) {
								requestFullscreen(function() {
										lightbox.addClass('fullscreen');
									});
							}
							
							if (settings.useRating) {
								updateRating();
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
							
							oldMain = lightbox.find('.' + settings.lightboxMainClass);
							oldCaption = lightbox.find('.' + settings.lightboxCaptionClass);
								
							if (oldMain.length) {
								
								oldMain.trigger('autopanoRemove').off('.' + ns);
								
								if (settings.muteBackgroundAudio && backgroundAudioOn) {
									if (isAudio || isVideo) {
										backgroundAudioRoot.trigger('fadeOutPlayer');
									} else {
										backgroundAudioRoot.trigger('fadeInPlayer');
									}
								}
							}
							
							// Delayed image loading
												
							loadCounter = 1;
							loadTimer = new Date();
							
							main = $('<div>', {
									'class': 	'lightbox-main ' + (isExternal? 'external' : (isVr? 'vr' : (isPdf? 'pdf' : item[J.CATEGORY])))
								})
								.hide()
								.appendTo(lightbox);
								
							if (isImage) {
								
								// Image
								// Creating
								media = image = $('<img>').appendTo(main);
								
								if (DEBUG) {
									console.log('Loading image [' + curr + '] src="' + album.getOptimalImagePath(item) + '"');
								}
								
								if (image[0].complete && image[0].naturalWidth > 0) {
									// From cache
									imageReady();
									
								} else {
									// Loading
									image.one('load.' + ns, function(e) {
											// Triggered on load event
											imageReady();
										});
								}
								
								// Applying the source
								image[0].src = album.getOptimalImagePath(item);
								
							} else if (isAudio || isVideo) {
								
								if (isVideo) {
									
									var	dur = album.getVideoDuration(item);
									
									// Video
									media = image = $('<video>', {
												preload: 		'auto',
												controlsList:	'nodownload',
												poster: 		album.getPosterPath(item)
											});
									
									if (dur >= 2000) {
										// Normal video
										media[0]['controls'] = 'true';
									} else {
										// Short video < 2s
										//media[0].controls = false;
										media[0]['loop'] = 'true';
									}
									
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
								
								media.on('playing', mediaPlaying)
									.on('paused', mediaPaused)
									.on('ended', mediaEnded);
										
								if (settings.muteBackgroundAudio && backgroundAudioRoot.length) {
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
								if (typeof PhotoSphereViewer !== UNDEF) {
									setTimeout(function() {
											var psv = new PhotoSphereViewer({
													panorama: 			album.getAbsoluteImagePath(item),
													container: 			main[0],
													usexmpdata:			false,
													zoom_level:			30,
													loading_html:		'<div class="lightbox-loading"><div></div></div>',
													navbar: 			true,
													navbar_style: 		{	
																			autorotateThickness:	2,
																			zoomRangeThickness: 	2,
																			zoomRangeDisk:			12,
																			fullscreenThickness: 	2,
																			backgroundColor: 		'rgba(17, 17, 17, 0.35)'
																		},
												});
										}, settings.speed);
								} else {
									console.log('Fatal Error: Missing "photo-sphere-viewer.min.js"!');
								}
								
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
						
						self.destroyAllTooltips();
						
						listening = false;
						$body.add($('html')).css('overflow', '');
						$body.removeClass(settings.lightboxOnClass);
						
						if (settings.muteBackgroundAudio && backgroundAudioOn) {
							backgroundAudioRoot.trigger('fadeInPlayer');
						}
						
						if (!main.length) {
							
							if(!SMALLSCREEN) {
								exitFullscreen(function() {
										lightbox.removeClass('fullscreen');
									});
							}
							
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
									
									if(!SMALLSCREEN) {
										exitFullscreen(function() {
												lightbox.removeClass('fullscreen');
											});
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
						listening = false;
						// removing event handlers
						thumbs.off('.' + ns);
						$document.add($window).add(lightbox).off('.' + ns);
						$body.add($('html')).css('overflow', '');
						$body.removeClass(settings.lightboxOnClass);
						
						if (!main.length) {
							// No image
							if (settings.lightboxFullscreen) {
								exitFullscreen();
							}
							lightbox.remove();
						} else {
							// Fade out
							main.animate({ 
									'opacity': 	0 
								}, settings.speed, function() {
									lightbox.remove();
									if (settings.lightboxFullscreen) {
										exitFullscreen();
									}
								});
						}
					},
				
				// Starting auto slideshow
				
				startAuto = function(keepMusic) {
						
						clearTimeout(slideshow);
						slideshow = setTimeout(nextImage, settings.slideshowDelay / 4);
						
						if (lb_play) {
							lb_play.hide();
							lb_pause.show();
						}
						$body.add(lightbox).addClass(settings.immerseClass);
						
						if (settings.autohideControls) {
							hideControlsLater();
						}
						
						caption.addClass('slideshow');
						
						if (!(keepMusic === true) && settings.backgroundAudioSlideshowControl) {
							backgroundAudioRoot.trigger('fadeInPlayer');
						}
						
						if (settings.slideshowFullscreen) {
							requestFullscreen(function() {
									lightbox.addClass('fullscreen');
								});
						}
						
						if (settings.onSlideshowStart !== false) {
							settings.onSlideshowStart(thumb);
						}
					},
				
				resumeAuto = function() {
						
						if (lb_play) {
							lb_play.hide();
							lb_pause.show();
						}
						
						if (settings.autohideControls) {
							hideControlsLater();
						}
						
						$body.add(lightbox).addClass(settings.immerseClass);
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
						
						clearTimeout(slideshow);
						slideshow = null;
						caption.show().removeClass('slideshow');
						$body.add(lightbox).removeClass(settings.immerseClass);
						
						showControls();
						
						if (settings.slideshowFullscreen && !settings.lightboxFullscreen) {
							exitFullscreen(function() {
									lightbox.removeClass('fullscreen');
								});
						}
						
						if (settings.onSlideshowPause !== false) {
							settings.onSlideshowPause(thumb);
						}
					},
				
				suspendAuto = function() {
						if (settings.backgroundAudioSlideshowControl) {
							backgroundAudioRoot.trigger('fadeOutPlayer');
						}
						clearTimeout(slideshow);
						slideshow = null;
						showControls();
					},
					
				startSoundClip = function() {
					
						if (soundClip.length) {
							var p,
								btn = soundClip.siblings('.play-pause');
							
							if (p = soundClip[0].play()) {
								p.then(function() {
										btn.removeClass('icon-play').addClass('icon-pause');
									}, function(err) {
										btn.removeClass('icon-pause').addClass('icon-play');
										console.log(err);
									});
							}
						}
					},
					
				pauseSoundClip = function() {
							
						if (soundClip.length) {
							var btn = soundClip.siblings('.play-pause');
							
							soundClip[0].pause();
							btn.removeClass('icon-pause').addClass('icon-play');
						}
					},	
					
				mediaPlaying = function() {
					
						if (settings.muteBackgroundAudio) {
							if (backgroundAudioOn = !backgroundAudioRoot.data('paused')) {
								backgroundAudioRoot.trigger('fadeOutPlayer');
							}
						}
						startSoundClip();
					},
					
				mediaPaused = function() {
						if (settings.muteBackgroundAudio && backgroundAudioOn) {
							backgroundAudioRoot.trigger('fadeInPlayer');
						}
						pauseSoundClip();
					},
					
				mediaEnded = function() {
						if (settings.muteBackgroundAudio) {
							backgroundAudioOn = false;
						}
						pauseSoundClip();
					},
				
				toggleZoom = function() {
						if (settings.useZoom && settings.zoomSlider) {
							fitImages = true;
							zoomLevel = (zoomLevel > 50)? 0 : 100;
							setZoomSlider(zoomLevel);
						} else {
							fitImages = !fitImages;
						}
						//savePrefs();
						fitImage(true);
					},
					
				showControls = function() {
						clearTimeout(controlsTimeout);
						lightbox.removeClass(settings.controlsHideClass);
					},
				
				hideControls = function() {
						clearTimeout(controlsTimeout);
						controls.hideAllTooltips();
						lightbox.addClass(settings.controlsHideClass);
					},
					
				hideControlsLater = function() {
						clearTimeout(controlsTimeout);
						controlsTimeout = setTimeout(function() {
								//hideArrows();
								hideControls();
							}, slideshow? Math.min(settings.slideshowDelay / 2, settings.hideControlsDelay) : settings.hideControlsDelay);
					},
	
				toggleControls = function() {
						lightbox.toggleClass(settings.controlsHideClass, !controlsHidden());
					},
				
				controlsHidden = function() {
						return lightbox.hasClass(settings.controlsHideClass);
					},
				
				toggleFullscreen = function() {
						if (isFullscreen()) {
							exitFullscreen(function() {
									lightbox.removeClass('fullscreen');
								});
						} else {
							requestFullscreen(function() {
									lightbox.addClass('fullscreen');
								});
						}
					},
					
				showThumbs = function() {
						controls.hideAllTooltips();
						lightbox.addClass(settings.thumbsVisibleClass);
						settings.thumbsVisible = true;
						savePrefs();
						fitImage(true);
					},
				
				hideThumbs = function() {
						controls.hideAllTooltips();
						lightbox.removeClass(settings.thumbsVisibleClass);
						settings.thumbsVisible = false;
						savePrefs();
						fitImage(true);
					},
				
				showCaption = function() {
						lightbox.addClass(settings.captionVisibleClass);
						settings.captionVisible = true;
						savePrefs();
						fitImage(true);
					},
					
				togglePanels = function() {
						controls.hideAllTooltips();
						if (!settings.captionVisible && !settings.thumbsVisible) {
							lightbox.addClass(settings.thumbsVisibleClass).addClass(settings.captionVisibleClass);
							settings.thumbsVisible = settings.captionVisible = true;
						} else {
							settings.thumbsVisible = settings.captionVisible = false;
						}
						savePrefs();
						fitImage(true);
					},
					
				hideCaption = function() {
						controls.hideAllTooltips();
						lightbox.removeClass(settings.captionVisibleClass);
						settings.captionVisible = false;
						savePrefs();
						fitImage(true);
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
						
						if (typeof callback === FUNCTION) {
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
								'class':	'left icon-caret-left'
							}).on('click.' + ns, function(e) {
								scrollThumbs(-1);
								return false;
							}));
							
						lb_thumbstrip.append($('<button>', {
								'class':	'right icon-caret-right'
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
							
							w = Math.min(item[J.THUMB][J.WIDTH], (h - 4) * item[J.THUMB][J.WIDTH] / item[J.THUMB][J.HEIGHT]);
							
							a.width(w);
							
							tw += w;
						});
					},
					
				// Setting up the controls
				
				initControls = function() {
						// Control strip
						controls = $('<div>', {
									'class':	settings.controlsClass + (settings.controlsUseText? ' use-text' : '')
								}).appendTo(lightbox);
						
						// Left button
						if (thumbs.length > 1) { 
							lb_btn_left = $('<button>', {
									type: 		'button',
									'class': 	'lightbox-btn previous icon-caret-left',
									title:		text.previousPicture,
									text:		settings.controlsUseText? text.previousPictureShort : ''
								})
								.on('click.' + ns, previousImage)
								.appendTo(controls);
						}
							
						// Up button
						lb_up = $('<button>', {
								type: 		'button',
								'class': 	'lightbox-btn up icon-arrow-up',
								title:		text.upOneLevel,
								text:		settings.controlsUseText? text.upOneLevelShort : ''
							})
							.on('click.' + ns, quitLightbox)
							.appendTo(controls);
						
						// Zoom button
						if (settings.useZoom) {
							
							if (settings.zoomSlider) {
								// Slider
								var zoom_panel= $('<div>', {
											'class':	'zoom-control'
										}),
									zoom_out_btn = $('<a>', {
											'class':	'zoom-out button'
										}).appendTo(zoom_panel);
										
								lb_zoom_slider = $('<input>', {
											name:		'zoom-level',
											type:		'range'
										})
										.appendTo(zoom_panel);
										
								var zoom_in_btn = $('<a>', {
											'class':	'zoom-in button'
										}).appendTo(zoom_panel);
									
								// Zoom toggle button
								lb_zoom = $('<button>', {
											type: 		'button',
											'class': 	'lightbox-btn zoom-level icon-zoom-level',
											text:		settings.controlsUseText? text.zoom : ''
										})
									.on('click.' + ns, function(){
											if (listening) {
												if ($('html').data('whatinput') !== 'touch' || lb_zoom_slider.is(':visible')) {
													// Toggle zoom only if zoom slider is visible, otherwise show
													toggleZoom();
												}
											}
											return false; 
										})
									.addTooltip($('<div>', {
											'class':	'zoom-panel'
										}).append(zoom_panel), {
											delay:		200,
											pos:		[1,0,1,2]
										})
									.appendTo(controls);
									
								lb_zoom_slider.on('change', function() {
										setZoom(parseInt(lb_zoom_slider.val()));
										return true;
									});
								
								zoom_in_btn.on('click', increaseZoom);
								
								zoom_out_btn.on('click', decreaseZoom);
								
							} else {
								
								// Zoom toggle button
								lb_zoomin = $('<button>', {
										type: 		'button',
										'class': 	'lightbox-icon zoom-in icon-expand',
										title: 		text.oneToOneSize,
										text:		settings.controlsUseText? text.oneToOneSizeShort : ''
									})
									.on('click.' + ns, toggleZoom)
									.appendTo(controls);
								
								lb_zoomout = $('<button>', {
										type: 		'button',
										'class': 	'lightbox-icon zoom-out icon-contract',
										title: 		text.fitToScreen,
										text:		settings.controlsUseText? text.fitToScreenShort : ''
									})
									.on('click.' + ns, toggleZoom)
									.appendTo(controls);
							}
						}
						
						// Hide/show top thumbs
						if (settings.useThumbstrip && thumbs.length > 1) {
							lb_showthumbs = $('<button>', {
									type: 		'button',
									'class': 	'lightbox-icon show-thumbs icon-show-top-panel',
									title: 		text.showThumbs,
									text:		settings.controlsUseText? text.showThumbsShort : ''
								})
								.on('click.' + ns, showThumbs)
								.appendTo(controls);
						
							lb_hidethumbs = $('<button>', {
									type: 		'button',
									'class': 	'lightbox-icon hide-thumbs icon-hide-top-panel',
									title: 		text.hideThumbs,
									text:		settings.controlsUseText? text.hideThumbsShort : ''
								})
								.on('click.' + ns, hideThumbs)
								.appendTo(controls);
						}
							
						// Hide/show captions
						lb_showcaption = $('<button>', {
								type: 		'button',
								'class': 	'lightbox-icon show-caption icon-show-bottom-panel',
								title: 		text.showInfo,
								text:		settings.controlsUseText? text.showInfoShort : ''
							})
							.on('click.' + ns, showCaption)
							.appendTo(controls);
						
						lb_hidecaption = $('<button>', {
								type: 		'button',
								'class': 	'lightbox-icon hide-caption icon-hide-bottom-panel',
								title: 		text.hideInfo,
								text:		settings.controlsUseText? text.hideInfoShort : ''
							})
							.on('click.' + ns, hideCaption)
							.appendTo(controls);
							
						if (settings.useSlideshow && thumbs.length > 1) {
							// Play/Pause button
							lb_play = $('<button>', {
									type: 		'button',
									'class': 	'lightbox-icon play icon-play',
									title: 		text.startSlideshow,
									text:		settings.controlsUseText? text.startSlideshowShort : ''
								})
								.on('click.' + ns, startAuto)
								.appendTo(controls);
					
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
								.appendTo(controls);
						}
								
						// Full screen toggle button
						if (settings.showFullscreen && hasFullscreen()) {
							lb_fullscr = $('<button>', {
									type: 		'button',
									'class': 	'lightbox-icon fullscreen icon-fullscreen',
									title: 		text.fullscreen,
									text:		settings.controlsUseText? text.fullscreenShort : ''
								})
								.on('click.' + ns, toggleFullscreen)
								.appendTo(controls);
							
							lb_exitfullscr = $('<button>', {
									type: 		'button',
									'class': 	'lightbox-icon exitfullscreen icon-fullscreen-off',
									title: 		text.exitFullscreen,
									text:		settings.controlsUseText? text.exitFullscreenShort : ''
								})
								.on('click.' + ns, toggleFullscreen)
								.appendTo(controls);
								
							if (isFullscreen()) {
								lightbox.addClass('fullscreen');
							}
						}
							
						// Right button
						if (thumbs.length > 1) { 
							lb_btn_right = $('<button>', {
									type: 		'button',
									'class': 	'lightbox-btn next icon-caret-right',
									title:		text.nextPicture,
									text:		settings.controlsUseText? text.nextPictureShort : ''
								})
								.on('click.' + ns, nextImage)
								.appendTo(controls);
						}
						
						// Adding tooltips
						controls.children('button').not('.zoom-level').addTooltip({
								delay:		1000,
								pos:		[1,0,1,2]
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
							}).hide().appendTo(self);
					
						// Darken background
						lb_overlay = $('<div>', {
								'class': 	'lightbox-overlay'
							}).appendTo(lightbox);
					
						// Activity indicator
						lb_activity = $('<div>', {
								'class': 	'lightbox-loading'
							}).append('<div>').appendTo(lightbox);
						
						// Apply visibility classes
						lightbox.toggleClass(settings.thumbsVisibleClass, settings.thumbsVisible && thumbs.length > 1);
						lightbox.toggleClass(settings.captionVisibleClass, settings.captionVisible);
						//lightbox.toggleClass('zoomed', fitImages);
						
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
				
				lb_overlay.on('click.' + ns, function(e) {
						
						if (settings.autohideControls && controlsHidden()) {
							// Toggle controls back
							showControls();
							return false;
						}
						
						if (main.length && !$(e.target).is(main)) {
							// Quit
							quitLightbox();
						}
					});
			}
			
			// On mouse-driven devices
			
			if (settings.autohideControls) {
				
				// Auto hide controls
				$document.on('mousemove.' + ns, function() {
						showControls();
						hideControlsLater();
					});
			}
							
			// Keyboard
			if (settings.enableKeyboard) {
				
				$document.on('keyup.' + ns, function(e) {
					if (!listening || !main.length || lightbox.children('.modal:visible').length || document.activeElement && (document.activeElement.nodeName === 'INPUT' || document.activeElement.nodeName === 'TEXTAREA')) {
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
							if (settings.useZoom && settings.zoomSlider) {
								increaseZoom();
							} else {
								toggleZoom();
							}
							break;
							
						case 109:
							if (settings.useZoom && settings.zoomSlider) {
								decreaseZoom();
							}
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
						if (listening) {
							clearTimeout(wheelTimeout);
							
							if (	!main.length || 
									$(e.target).closest('.' + settings.lightboxCaptionClass).length ||
									main.hasClass('pdf') || 
									main.hasClass('external') ||
									lightbox.children('.modal:visible').length
								) {
								return true;
							}
							
							if (settings.useZoom && settings.zoomSlider && e.ctrlKey == true) {
								wheelTimeout = setTimeout((e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0)? increaseZoom : decreaseZoom, 100);
							} else {
								wheelTimeout = setTimeout((e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0)? previousImage : nextImage, 100); 
							}
						}
						return false;
					});
			}
			
			// Events that can be triggered from outside
		
			// External trigger to switch image
			self.on('lightboxLoad.' + ns, function(e, n, auto) {

					if (typeof n === NUMBER) {
						n = Math.minMax(0, n, thumbs.length);
					} else if (typeof n === UNDEF) {
						n = 0;
					} else {
						n = thumbs.index(n);
					}
					
					if (settings.onStart !== false) {
						settings.onStart((typeof n === NUMBER)? thumbs.eq(n) : th);
					}
					
					loadImage(n);
					
					if (slideshow) {
						stopAuto(true);
					}
					
					if (auto) {
						if (typeof auto === NUMBER) {
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
				// Stopping auto hide controls
				.on('stopAutoHide.' + ns, function() {
						clearTimeout(controlsTimeout);
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
			
			// Ready event
			
			if (settings.hasOwnProperty('onReady') && typeof settings.onReady === FUNCTION) {
				settings.onReady(thumb);
			}
			
			// Auto start
			
			if (settings.autoStart && settings.baseSet) {
				startAuto();
			}
	
			return this;
		};
	
	$.fn.lightbox.defaults = {
			delegate:						'.card.lbable',
			lightboxMainClass:				'lightbox-main',
			lightboxCaptionClass:			'lightbox-caption',
			lightboxOnClass:				'lightbox-on',
			controlsClass:					'controls',
			buttonClass:					'secondary button small',
			buttonClass:					'button',
			lazyloadClass:					'lazyload',
			activeClass:					'active',
			scrollClass:					'scroll',
			regionsClass:					'regions',
			captionVisibleClass:			'caption-visible',
			thumbsVisibleClass:				'thumbs-visible',
			hasbuttonsClass:				'hasbuttons',
			immerseClass:					'immerse',
			controlsVisibleClass:			'controls-visible',
			controlsHideClass:				'controls-hide',
			//playingClass:					'playing',
			transitionProps:				'300ms ease-out',
			slideshowDelay:					4000,
			hideControlsDelay:				2500,
			prefsKept: 						[ 
												'thumbsVisible',
												'captionVisible'
											],
			controlsUseText:				false,
			thumbsVisible:					true,
			useThumbstrip:					true,
			captionVisible:					true,
			fitImages:						true,
			fitBoth:						true,
			fitBetween:						true,
			fitRatio:						0.94,
			maxZoom:						1.4,
			//scaleUp:						false,
			useZoom:						true,
			zoomSlider:						false,
			linkOriginals:					false,
			hiDpi:							false,
			showFullscreen:					false,
			indexName:						'index.html',
			baseSet:						true,
			autohideControls:				true,
			autoStart:						false,
			clickForNext:					true,
			useSlideshow:					true,
			backgroundAudioSlideshowControl:false,
			muteBackgroundAudio:			true,
			use360Player:					true,
			lightboxFullscreen:				false,
			slideshowFullscreen:			false,
			afterLast:						'donothing',
			mapHeight:						0.8,
			mapApiKey:						'',
			mapType:						'hybrid',
			mapZoom:						15,
			showShopBtn:					false,
			showFeedback:					false,
			showLowestPrice:				false,
			videoAuto:						false,
			videoLoop:						false,
			autoPano:						false,
			volume:							0.5,
			rightClickProtect: 				false,
			useRating:						false,
			jalbumRating:					false,
			visitorRating:					false,
			buttonLabels:					true,
			showNumbers:					false,
			showShare:						false,
			showDownload:					false,
			allowDownloadScaled:			false,
			allowDownloadOthers:			false,
			showMap:						false,
			showRegions:					true,
			printImage:						false,
			metaAsPopup:					true,
			transitionType:					'crossFadeAndSlide',
			speed: 							400,
			panoramaAutoDetect:				1.5,
			panoramaTreshold:				[ 2.5, 2.5 ],
			defaultPosterSize:				[ 628, 360 ],
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
			nextIndex:						'Next index page',
			atLastPageQuestion:				'Where to go next?',
			atLastPage:						'At last page',
			atFirstPage:					'At first page',
			previousPicture:				'Previous image',
			previousPictureShort:			'Prev',
			nextPicture:					'Next image',
			nextPictureShort:				'Next',
			zoom:							'Zoom',
			oneToOneSize:					'1:1 size',
			oneToOneSizeShort:				'1:1',
			fitToScreen:					'Fit to screen',
			fitToScreenShort:				'Fit',
			fullscreen:						'Full screen',
			exitFullscreen:					'Exit full screen',
			fullscreenShort:				'Fullscr',
			exitFullscreenShort:			'Normal',
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
			rating:							'Rating',
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
