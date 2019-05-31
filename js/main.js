/* 
 *	main.js - the skin's javascript functions
 */
	
;(function($, $window, $document, $body, undefined) {
	'use strict';
				
	// Implementing select functions on thumbnails
	
	$.fn.selectable = function(options) {
		
			options = $.extend({
							cardClass:			'card',
							checkboxClass: 		'checkbox',
							checkedClass:		'checked',
							noneSelected:		null,
							anySelected:		null
						}, options);
			
			var self = $(this).eq(0),
				cards,
				
				selectedCnt = function() {
						return cards.filter('.' + options.checkedClass).length;
					},
			
				getThumbs = function() {
						return options.selector? self.find(options.selector) : self.find('.' + options.cardClass);
					},
			
				clicked = function(e) {
						var card = $(e.target).closest('.' + options.cardClass);
						
						var n = selectedCnt();
						if (card.hasClass(options.checkedClass)) {
							card.removeClass(options.checkedClass);
							if (n === 1) {
								if ($.isFunction(options.noneSelected)) {
									options.noneSelected.call();
								}
							} else {
								if ($.isFunction(options.anySelected)) {
									options.anySelected.call(n - 1);
								}
							}
						} else {
							card.addClass(options.checkedClass);
							if ($.isFunction(options.anySelected)) {
								options.anySelected.call(n + 1);
							}
						}	
							
						return false;
					},
			
				selectAll = function() {
					
						if (self.is(':visible')) {
							var n = selectedCnt();
							if (n < cards.length) {
								cards.not('.' + options.checkedClass).addClass(options.checkedClass);
								if ($.isFunction(options.anySelected)) {
									options.anySelected.call(cards.length);
								}
							}
						}
					},
			
				selectNone = function() {
					
						if (self.is(':visible')) {
							var n = selectedCnt();
							if (n > 0) {
								cards.filter('.' + options.checkedClass).removeClass(options.checkedClass);
								if ($.isFunction(options.noneSelected)) {
									options.noneSelected.call();
								}
							}
						}
					},
					
				selectInverse = function() {
					
						if (self.is(':visible')) {
							var n = selectedCnt();
							if (n === cards.length) {
								cards.removeClass(options.checkedClass);
								if ($.isFunction(options.noneSelected)) {
									options.noneSelected.call();
								}
							} else {
								cards.toggleClass(options.checkedClass);
								if ($.isFunction(options.anySelected)) {
									options.anySelected.call(cards.length - n);
								}
							} 
						}
					},
				
				selectRefresh = function() {
						cards = getThumbs();
						
						cards.each(function() {
							if (!($(this).children('span.' + options.checkboxClass).length)) {
								$(this).append($('<span>', {
										'class': 	options.checkboxClass
									}).on({
										click: 		clicked
									}));
							}
							
						});
						
					};
			
			selectRefresh();
			
			self.on({
					selectAll: 			selectAll,
					selectNone: 		selectNone,
					selectInverse: 		selectInverse,
					selectRefresh: 		selectRefresh
				});
					
			return this;
		};
			
	// The main skin code
	
	$.fn.skin = function(settings) {
		
		settings = $.extend({}, $.fn.skin.defaults, settings);
		
		var content = 			$(settings.contentHook),				// Main content
			text = 				getTranslations({						// Translated texts
										foundNTimes:			'found {0} time(s)',
										notFound: 				'not found',
										search: 				'Search',
										newImages:				'New images',
										label: 					'Label',
										selectedItems:			'Selection',
										addCart:				'Add to cart',
										'return': 				'return',
										inTheLastDay:			'in the last day',
										inThePastNDays:			'in the past {0} days',
										sinceMyLastVisit:		'since my last visit',
										imagesAdded:			'Images added',
										imagesModified:			'Images modified',
										imagesTaken:			'Images taken',
										newItem:				'NEW',
										more:					'more',
										less:					'less'
									}),
			
			shopSection = 		$(),									// Whole Shopping section
			shopRoot =			$(),									// Root element for cart
			feedbackSection =	$(),									// Whole Feedback section
			feedbackRoot =		$(),									// Root element for the feedback tool
			album,														// The database
			lightbox,													// Lightbox element
			ns = 				'tiger_skin',							// Namespace
			lastHash = 			'',										// Storing last state
			initByHash = 		window.location.hash !== "",			// Initial URL contains hash
			cacheBuster,												// Refresh thumbnails?
			nows =				new Date() / 1000,						// Now in seconds
			//today = 			new Date() / 86400000,					// Today (day count since 1970)
			lazyloadFoldersTimeout = null,								// Lazyload folders tarcking
			lazyloadFoldersInProgress = false,
			
			// Managing overlays
			
			// Creating header
			
			createOverlayHeader = function(t, options) {
					var h = $('<div>', {
							'class': 	'large-12 columns cont-box'
						}).prependTo(t);
					
					h = $('<header>', {
							 'class':	((options && options.hasOwnProperty('icon'))? options.icon : '')
						}).appendTo(h);
					
					if (options && options.hasOwnProperty('title')) {
						h.append($('<h4>', {
								html: 	options.title
							}));
					}			
							
					h.append($('<a>', {
							'class': 	'close',
							href: 		'',
							text: 		text.return
						}).on('click', function() {
							removeOverlay();
							return false;
						}));
					
					return h;
				},
				
			// Creating thumbnail grid parent
			
			createOverlayGrid = function(t) {
					
					t = $('<div>', {
							'class':	'large-12 columns'
						}).appendTo(t);
						
					t = $('<div>', {
							'class':	[ settings.thumbsClass, settings.thumbHoverClass, 'row', settings.thumbGridClass ].join(' ')
						}).appendTo(t);
						
					return t;
				},
				
			// Adding new overlay
		
			addOverlay = function(options) {
					
					// Removing previous overlay 
					var	ths;
					
					content
						.addClass('has-overlay')
						.children('section.' + settings.thumbContClass)
						.each(function() {				
								if (this.hasOwnProperty('overlay')) {
									removeOly($(this));
								} else {
									ths = $(this).hide();
								}
							});
					
					var ns = 'ths_' + Math.floor(Math.random() * 10000),	// Namespace
						t = ($('<section>', {
								'class': 	'row overlay ' + settings.thumbContClass + ' ' + options['className'],
								id: 		ns
							}).data('oly_ns', ns));
						
					if (ths) {
						t = t.insertAfter(ths);
					} else {
						t = t.prependTo(content);
					}
					
					t[0]['overlay'] = ns;
					
					createOverlayHeader(t, options);
					createOverlayGrid(t);
					
					content.trigger('overlayAdded', t);
					
					return t;
				},
		
			// Removing overlay
			
			removeOly = function(t) {
					var ns = t.data('oly_ns');
					
					if (ns) {
						$window.off('.' + ns);
					}
					
					t.closest('.' + settings.thumbsClass).trigger('lightboxRemove');
					t.remove();
				},
				
			// Removing overlay
			
			removeOverlay = function() {
				
					content.removeClass('has-overlay').children('section.' + settings.thumbContClass).each(function() {
						if (this.hasOwnProperty('overlay')) {
							// Thumbnails with lightbox attached
							removeOly($(this));
						} else {
							// Showing hidden overlay(s)
							$(this).show();
							$(this).find('.' + settings.thumbsClass).trigger('lazyloadThumbs');
						}
					});
					
					removeParam(settings.indexName);
					
					content.trigger('overlayRemoved', content.children('section.' + settings.thumbContClass + ':visible').eq(0));
					updateShares();
					
					//$('#selectnone, #add-selected').addClass('disabled');
					if (currentThumbs('.selectable').length) {
						if ($('.' + settings.checkedClass).length) {
							$('.' + settings.selectNoneClass + ',.' + settings.addSelectedClass + ',.' + settings.keepSelectedClass).removeClass('disabled');
						} else {
							$('.' + settings.selectNoneClass + ',.' + settings.addSelectedClass + ',.' + settings.keepSelectedClass).addClass('disabled');
						}
						//$('#selectall').removeClass('disabled');
						shopSection.add(feedbackSection).show();
					} else {
						//$('#selectall').addClass('disabled');
						shopSection.add(feedbackSection).hide();
					}
					
					return null;
				},
			
			// Getting active overlay
			
			getOverlay = function() {
				
					var o = content.children('section.' + settings.thumbContClass + ':visible').eq(0);
						
					if (!o.length) {
						o = $('<section>', {
								'class': 	'row ' + settings.thumbContClass
							}).appendTo(content);
							
						createOverlayGrid(o);
					}
					
					if (!o.data('oly_ns')) {
						var ns = 'oly_' +  + Math.floor(Math.random() * 10000);
						o.data('oly_ns', ns).attr('id', ns);
					}
					
					return o;
				},
		
			// Getting folders
			
			getFolders = function(selector) {
					return content.find('section.' + settings.folderContClass + 
							(selector? (' ' + selector) : ''));
				},
												
			// Getting current thumbs array :: optionally selected subelements
			
			currentThumbs = function(selector) {
					return content.find('section.' + settings.thumbContClass + ':visible .' + settings.thumbsClass + 
							(selector? (' ' + selector) : ''));
				},
			
			// Getting thumbnail by file name
			
			getThumbByName = function(name) {
					var t = $();
					
					currentThumbs('.' + settings.thumbClass).each(function() {
						var l = $(this).attr('href') || $(this).data('href'); 
						if (l && (l === name || l.endsWith('/' + name))) {
							t = $(this).parent();
							return false;
						}
					});
					
					return t;
				},
				
			// Getting selected thumbs as items
			
			getSelectedItems = function() {
				
					var r = [];
							
					currentThumbs('.' + settings.thumbClass + '.' + settings.checkedClass).each(function() {
							r.push($(this).closest('.' + settings.cardClass).data(J.OBJ));
						});
					
					return r;
				},
			
			// Getting all items
			
			getAllItems = function() {
				
					var r = [];
							
					currentThumbs('.' + settings.thumbClass).each(function() {
							r.push($(this).closest('.' + settings.cardClass).data(J.OBJ));
						});
					
					return r;
				},
			
			// Adding one folder's thumb
			
			loadFolderThumb = function(thumb) {
					var t = thumb.children('a[data-thumb]').eq(0);
					
					if (!t.children('img').length) {
						t.append($('<img>', {
								alt: 		t.data('alt'),
								'class': 	'hide-image'
							})
							// Onload action
							.one('load', function() {
								thumb.removeClass(settings.lazyloadClass);
								$(this).addClass('show-image').removeClass('hide-image');
								//getFolders().trigger('refresh');
							})
							.attr('src', t.data('thumb') + (cacheBuster || '')));
					}
				},
			
			// Loading visible folder thumbs
			
			lazyloadFolders = function(doneFn) {
					
					if (lazyloadFoldersInProgress) {
						clearTimeout(lazyloadFoldersTimeout);
						return;
					}
					
					var folders = getFolders();
					
					if (!folders.is(':visible')) {
						return;
					}
					
					lazyloadFoldersInProgress = true;
					
					folders = folders.find('.' + settings.lazyloadClass);
					
					if (folders.length) {
						var wh = $window.height(),
							scrollTop = $window.scrollTop();
					
						folders.each(function() {
							var t = $(this),
								tt = t.offset().top,
								th = t.height();
								
							if ((tt < scrollTop + 2 * wh) && (tt + th) > (scrollTop - wh)) {
								loadFolderThumb(t);
							}
							
							if (tt >= scrollTop + 2 * wh) {
								// Below fold
								return false;
							}
						});
						
						clearTimeout(lazyloadFoldersTimeout);
						lazyloadFoldersTimeout = setTimeout(lazyloadFolders, settings.scrollCheckInterval);
					
					} else {
						$window.off('.lazy');
					}
					
					lazyloadFoldersInProgress = false;
					
					if ($.isFunction(doneFn)) {
						doneFn.call(this);
					}
					
				};

		
		// Rendering thumbnails in a progressive fashion
		// this = '<section>' thumb-cont
		
		$.fn.renderThumbs = function(items, complete, baseSet) {
			
			if (typeof items === UNDEF || !items.length || !$.isArray(items)) {
				return this;
			}
			
			var self = $(this).eq(0),
				// Namespace
				ns = self.closest('section').data('oly_ns'),
				
				// Columns
				cols = 0,
				
				// Scroll timeout
				scrollTop = $window.scrollTop(),
				
				// Lazy load timeout
				lazyloadTimeout = null,
				
				cleanup = function(ns) {	
						// cleaning up the old event handlers
						$window.off('.' + ns);
					},
				
				// Finding or creating the element to hold the thumbs
				
				target = (function() {
						var t = self.find('.' + settings.thumbsClass);
						
						if (!t.length) {
							t = $('<section>', {
									'class': 	'row ' + settings.thumbContClass
								}).appendTo(self);
							t = createOverlayGrid(t);
						}
						
						return t;
					}()),
				
				// Rendering thumbs
				
				initThumbs = function() {
						var cards = currentThumbs('.' + settings.cardClass), 
							card,
							thumb,
							img,
							//src,
							caption,
							s,
							d,
							cd = settings.hasOwnProperty('markNew')? (nows - settings.markNew.days * ONEDAY_S) : null,
							tw,
							item;
						
						// Creating new elements for the items with no thumbs
						for (var i = 0; i < items.length; i++) {
							
							item = items[i];
							
							if (i < cards.length) {
								// Already exists in the HTML source
								card = cards.eq(i);
								thumb = card.children('.' + settings.thumbClass);
								caption = card.find('.' + settings.captionClass);
								img = thumb.find('img').eq(0);
								img.addClass('hide-image')
									.on('load.' + ns, function() {
											$(this).addClass('show-image')
												.removeClass('hide-image')
												.parents('.' + settings.cardClass).removeClass(settings.preloadClass);
										});
								if (img[0].complete) {
									// Cached images
									img.trigger('load');
								}
							} else {
								// Not yet exists
								card = $('<div>', {
										'class': 	settings.cardClass + ' ' + settings.lazyloadClass
									}).append(thumb = $('<a>', {
										'class':	settings.thumbClass + ' ' + settings.verticalMiddleClass
									}).data('href', album.getItemPath(item))
									).appendTo($('<div>', {
										'class':	'column'
									}).appendTo(target));
								
								if (s = item[J.THUMBCAPTION]) {
									card.addClass(settings.hascaptionClass);
									caption = $('<div>', {
											'class': 	settings.captionClass,
											html: 		s
										});
									
									if (settings.captionTooltip) {
										caption.append('<b class="nub"></b>');
									}
									
									if (settings.captionAbove) {
										card.prepend(caption);
									} else {
										card.append(caption);
									}
								}
							}
							
							card.data(J.OBJ, item);

							if (album.isLightboxable(item)) {
								
								card.addClass(settings.lbableClass);
								
								thumb.on('click.' + ns, thumbClicked);
									
								if (shopRoot.length && album.hasShop(item) || feedbackRoot.length && settings.feedback) {
									thumb.addClass('selectable');
									if (shopRoot.length) {
										thumb.append($('<a>', {
												'class': 	'icon-shopping-cart add-cart',
												text: 		' ' + text.addCart
											}).on('click.' + ns, function(e) {
													var card = $(e.target).closest('.' + settings.cardClass);
													if (card.length) {
														shopRoot.trigger('addItems', card.data(J.OBJ));
													}
													return false;
												})
											);
									}
								}
								
								if (!baseSet && settings.linkToFolder) {
									var p = album.getRelativeFolderPath(item);
									
									if (p) {
										thumb.append($('<a>', {
												'class': 	'icon-folder folder-link',
												href:		 p + '/' + settings.indexName
											}));
									}
								}
								
							} else {
								
								card.addClass(item[J.CATEGORY]);
								thumb.attr('href', album.getItemPath(item));
							}
							
							if (cd != null) {
								
								d = item[J.DATES];
								
								if (d && (d = d[settings.markNew.reference]) && d >= cd) {
									s = $('<span>', {
											'class':	'icon-star new-image'
										}).appendTo(thumb);
										
									if (!TOUCHENABLED) {
										s.data('tooltip', (new Date(d * 1000)).toLocaleDateString()).addTooltip();
									}
								}
							}
								
							if (settings.rightClickProtect) {
								thumb.on('contextmenu', function(e) {
										e.preventDefault()
										return false;
									});
							}
						}
						
					},
					
				// Get thumbnail columns
				
				getCols = function() {
						var el = $('<div>', {
									'class':		'columns',
									visibility: 	'hidden',
									height: 		0
								}).appendTo(target),
							cols = Math.floor(0.05 + target.width() / el.outerWidth(true)); 
							
						el.remove();
						return cols;
					},

				// Loading visible thumbs
				
				lazyloadThumbs = function() {
					
						if (!target.is(':visible')) {
							return;
						}
						
						lazyloadTimeout = clearTimeout(lazyloadTimeout);
							
						var st = $window.scrollTop();
						
						if (Math.abs(st - scrollTop) > 20) {
							// Scrolling in progress
							scrollTop = st;
							lazyloadTimeout = setTimeout(lazyloadThumbs, settings.scrollCheckInterval);
							return;
						}
						
						// Lazyload images
						var thumbs = currentThumbs('.' + settings.lazyloadClass),
							wh = $window.height();
						
						thumbs.not(':empty').each(function() {
							var t = $(this),
								tt = t.offset().top,
								th = t.height();
								
							if ((tt + th) > (scrollTop - wh)) {
								
								if (tt < (scrollTop + 2 * wh)) {
									// 2 screens ahead
									loadThumb(t);
								} else {
									return false;
								}
							}
						});
						
						if (thumbs.length) {
							// perpetrating lazyload
							scrollTop = st;
							lazyloadTimeout = setTimeout(lazyloadThumbs, settings.scrollCheckInterval);
							
						} else {
							// No more left
							$window.off('scroll.' + ns);
						}
					},
				
				// Clicked thumb
				
				thumbClicked = function(e) {
						if (e.target.nodeName === 'A' && ($(e.target).closest('.' + settings.commentClass).length || $(e.target).hasClass('folder-link'))) {
							// Link in comment or link to folder
							return true;
						}
						target.trigger('lightboxLoad', $(e.target).closest('.' + settings.cardClass));
						return false;
					},
				
				// Adding one thumb
				
				loadThumb = function(card) {
						
						if (card.length) {
							var thumb = card.children('.' + settings.thumbClass).eq(0);
							if (!thumb.children('img').length) {
								thumb.append($('<img>', {
										'class': 	'hide-image'
									})
									// Onload action
									.one('load', function() {
										$(this).addClass('show-image').removeClass('hide-image');
										card.removeClass(settings.lazyloadClass);
										//currentThumbs().trigger('refresh', true);
									})
									.attr('src', album.getThumbPath(card.data(J.OBJ)) + (cacheBuster || '')));
							}	
						}
											
					},
				
				// Marking active thumb
				
				setActiveThumb = function(e, thumb) {
						if (thumb) {
							var t = $(thumb),
								wh = 			$window.height(),
								scrollTop = 	$window.scrollTop(),
								tt = 			t.offset().top,
								th = 			t.outerHeight();
							
							target.find('.' + settings.activeClass).removeClass(settings.activeClass);
							t.addClass(settings.activeClass);
							
							// Moving into view
							if (tt + th > scrollTop + wh) {
								$('html, body').stop(true, false).animate({
										scrollTop: 		Math.round(tt - wh + th + 30) + 'px'
									});
							} else if (tt < scrollTop) {
								$('html, body').stop(true, false).animate({
										scrollTop: 		Math.round(Math.max(tt - 30, 0)) + 'px'
									});
							}
						}
					};
				
			
			// Creating new Unique ID if not yet exists
			if (!ns) {
				$(this).closest('section').data('oly_ns', ns = 'oly_' + Math.floor(Math.random() * 10000));
			}
				
			self.append($('<div>', {
					'class': 	'progressbar'
				}));
				
			initThumbs();

			if (!settings.fixedShapeThumbs || settings.captionPlacement !== 'tooltip') {
				setTimeout(function() {
						var match = [];
						
						if (settings.captionAbove) {
							match.push(settings.captionClass);
						}
						
						if (!settings.fixedShapeThumbs) {
							match.push(settings.thumbClass);
						}
						
						match.push(settings.cardClass);
						
						currentThumbs().matchHeight({
								delegate:	settings.cardClass,
								match:		match
							});
					}, settings.scrollCheckInterval);
			}
			
			lazyloadTimeout = setTimeout(lazyloadThumbs, settings.scrollCheckInterval / 2);
			
			// Moving the active element into view
			self.on('setactivethumb', setActiveThumb);
			
			// Start (restart) loading the thumbs
			self.on('lazyloadThumbs', lazyloadThumbs);
			
			if ($.isFunction(complete)) {
				if (typeof baseSet !== UNDEF) {
					complete.call(undefined, target, baseSet);
				} else {
					complete.call(undefined, target);
				}
			}
			
			self.find('.progressbar').remove();
			
			return this;
		};
		
		
		// Filtering selected items
			
		var	keepSelectedItems = function(tx, ready) {
					var thumbs = getSelectedItems();
					
					if (!thumbs.length || thumbs.length === currentThumbs('.' + settings.lbableClass).length) {
						return;
					}
					
					var t = addOverlay({
								className:	'selected-items',
								icon:		'icon-checkbox-checked',
								title:		'&ldquo;' + tx + '&rdquo;'
							}),
						h = t.find('header h4');
						
					h.append($('<span>', {
							'class': 	'progressbar'
						}));
					
					setTimeout(function() {
						h.find('.progressbar').remove();
						h.append($('<small>', {
								text: 	text.foundNTimes.replace('{0}', thumbs.length)
							}));
						t.renderThumbs(thumbs, prepareThumbs);
						if (ready) {
							ready.call();
						}
						shopSection.add(feedbackSection).show();
					}, 50);
				},
				
				
			// Do a label filtering
		
			getItemsByLabel = function(tx, ready) {
					var t = addOverlay({
								className:	'tags-found',
								icon:		'icon-label',
								title:		'&ldquo;' + tx + '&rdquo;'
							}),
						h = t.find('header h4');
						
					h.append($('<span>', {
						'class': 'progressbar'
					}));
					
					if (t.offset().top < $window.scrollTop() || t.offset().top > ($window.scrollTop() + $window.height() - 100)) {
						$window.scrollTop(t.offset().top);
					}
					
					album.collectItems($.extend(settings.tagCloud, {
						exact:		settings.exactFields,
						terms:		tx,
						ready: 		function() {
											h.find('.progressbar').remove();
											h.append($('<small>', {
												text: 	this.length? text.foundNTimes.replace('{0}', this.length) : text.notFound
											}));
											t.renderThumbs(this, prepareThumbs);
											if (ready) {
												ready.call();
											}
											if (this.length) {
												shopSection.add(feedbackSection).show();
											}
										}
					}));
				},
				

			// Collecting and displaying tags
		
			renderTagCloud = function(tags) {
				
					if (!tags.length) {
						return;
					}
					
					var t = $(settings.tagCloud.hook);
					
					if (!t.length) {
						return;
					}
					
					var tagClicked = function() {
							var tx = $(this).children('span').eq(0).text();
							
							if (tx && tx.length > 1) {
								getItemsByLabel(tx, function() {
									setParam(settings.indexName, {
											label: 		tx
										}, text.label + ': ' + tx);
									updateShares();
								});
							}
							
							return false;
						};
						
					for (var a, r, cnt, i = 0, l = tags.length; i < l; i++) {
						
						// create link element
						a = $('<a>', {
								'class': 	'tag'
							}).append($('<span>', {
								html: 		tags[i][0]
							}));
						a.on('click', tagClicked);
						
						// add count
						if (tags[i][1] > 1) {
							if (settings.tagCloud.fontVaries) {
								r = 0;
								cnt = Math.min(64, tags[i][1]);
								// calculate weight
								while (cnt > 1) {
									r++;
									cnt = cnt >> 1;
								}
								a.addClass('size-' + r);
							}
							a.append('&nbsp;').append($('<sup>', {
								text: 		tags[i][1]
							}));
						}
						
						t.append(a);
					}
					
					if (tags.length) {
						var d;
						
						if (t.outerHeight() > 175) {
							
							t.css({
								maxHeight: 150,
								overflow: 'hidden'
							});
							
							d = $('<div>', {
								'class': 'toggle-height'
							});
							
							d.append($('<a>', {
									'class': 	'icon-drop-down',
									text: 		' ' + text.more
								}).on('click', function() {
									var b = t.parent(),
										toggleHeight = function() {
											var h = t.prop('scrollHeight');
											
											b.css({
													height: 	'auto',
													overflow: 	'visible'
												});
											t.css({
													maxHeight: 	150,
												});
											setTimeout(function() {
													t.css({
															maxHeight: 	h + 20
														});
												}, 25);
											d.addClass(settings.activeClass);
										};
									
									b.css({
											height: 	b.height(),
											overflow: 	'hidden'
										});
									t.css({
											maxHeight: 	'none'
										});
									setTimeout(toggleHeight, 50);
								
							})).append($('<a>', {
									'class': 	'icon-drop-up',
									text: 		' ' + text.less
								}).on('click', function() {
									t.css({
											maxHeight: 	150
										});
									d.removeClass(settings.activeClass);
								}));
							
							t.after(d);
						}
					}
				},
			
			getFolderTree = function() {
					var getFolderObjects = function(folder) {
							if (folder.hasOwnProperty(J.FOLDERS) && folder[J.FOLDERS].length) {
								var ul, li, i, p, f = folder[J.FOLDERS];
								ul = $('<ul>');
								for (i = 0; i < f.length; i++) {
									p = album.getRelativeFolderPath(f[i]);
									li = $('<li>').appendTo(ul);
									li.append($('<a>', {
											href: 	(p? (p + '/') : '') + settings.indexName,
											html: 	f[i][J.TITLE] || f[i][J.NAME] || ''
										})).append(getFolderObjects(f[i]));
									if (!p) {
										li.addClass('actual');
									}
								}
								return ul;
							}
							return $();
						},
						
						getHomeLink = function() {
							var p = settings.rootPath;
							return $('<a>', {
									'class': 	'home-link icon-home',
									href:		(p? (p + '/') : '') + settings.indexName,
									text:		' ' + album.getAlbumTitle()
								});
						};
						
					if (settings.folderTree.type === 'tree') {
						if (settings.level > 0) {
							return getHomeLink().add(getFolderObjects(album.getTree()));
						} else {
							return getFolderObjects(album.getTree());
						}
					} else {
						getFolderObjects(album.getCurrentFolder());
					}
				},
		
			// Executing Search
			
			getItemsBySearch = function(tx, ready) {
					var t = addOverlay({
								className:	'search-results',
								icon:		'icon-search',
								title:		'&ldquo;' + tx + '&rdquo;'
							}),
						h = t.find('header h4');
						
					h.append($('<span>', {
							'class': 	'progressbar'
						}));
					
					setTimeout(function() {
						album.collectItems($.extend(settings.search, {
							exact:		false,
							terms:		tx,
							ready:		function() {
												h.find('.progressbar').remove();
												h.append($('<small>', {
														text: 	this.length? text.foundNTimes.replace('{0}', this.length) : text.notFound
													}));
												t.renderThumbs(this, prepareThumbs);
												if (ready) {
													ready.call();
												}
												if (this.length) {
													shopSection.add(feedbackSection).show();
												}
											}
						}));
					}, 50);
				},
	
		
			// Preparing Search functionality
			
			prepareSearch = function(f) {
				
					if (!f.length || !album) {
						return;
					}
					
					// Adding defaults if missing
					
					settings.search = $.extend({
						depth:		'tree',
						fields:		'creator,keywords,title,comment'
					}, settings.search);
					
					var startSearch = function(f) {
							
							var tx = f.find('input').eq(0).val();
							
							if (tx && tx.length > 1) {
								getItemsBySearch(tx, function() {
									setParam(settings.indexName, {
											search:		tx
										}, text.search + ': ' + tx);
									updateShares();
								});
							}
							return false;
						};
						
					f.find('.search-btn, button').on('click', function() {
						if (f.hasClass(settings.activeClass)) {
							startSearch(f);
							f.removeClass(settings.activeClass);
						} else {
							f.find('input').eq(0).focus();
							f.addClass(settings.activeClass);
						}
						return false;
					});
					
					f.on('submit', function(e) {
						e.preventDefault();
						startSearch(f);
						f.removeClass(settings.activeClass);
						return false;
					});
					
					f.find('input').on({
						'focus': 	function() { 
										f.addClass(settings.activeClass); 
									}
					});
				},
			
			// Preparing Tag Search functionality
			
			prepareTagSearch = function() {
				
					var f = $(settings.tagCloud.searchHook);
					
					if (!f.length || !album) {
						return;
					}
									
					var startSearch = function(f) {
							
							var tx = f.find('input').eq(0).val();
							
							if (tx && tx.length > 1) {
								getItemsByLabel(tx, function() {
									setParam(settings.indexName, {
											label: 	tx
										}, text.label + ': ' + tx);
									updateShares();
								});
							}
							return false;
						};
						
					f.find('.search-btn, button').on('click', function() {
						f.find('input').eq(0).focus();
						startSearch(f);
						return false;
					});
					
					f.on('submit', function(e) {
						e.preventDefault();
						startSearch(f);
						return false;
					});
					
				},
			
			// Search for new images
			
			getSearchNewTitle = function(r) {
			
					if (r === 'dateTaken') 
						return text.imagesTaken;
					else if (r === 'fileModified')
						return text.imagesModified;
					return text.imagesAdded;
				},
			
			getItemsByDate = function(range, ready) {
					var t = addOverlay({
								className:		'search-results',
								icon:			'icon-star',
								title:			getSearchNewTitle(settings.searchNew.reference) + ' ' + getTimespan(range)
							}),
						h = t.find('header h4');
						
					h.append($('<span>', {
							'class': 'progressbar'
						}));
					
					setTimeout(function() {
						album.collectByDate($.extend(settings.searchNew, {
							range:		range,
							ready:		function() {
												h.find('.progressbar').remove();
												h.append($('<small>', {
													text: this.length? text.foundNTimes.replace('{0}', this.length) : text.notFound
												}));
												t.renderThumbs(this, prepareThumbs);
												if (ready) {
													ready.call();
												}
												if (this.length) {
													shopSection.add(feedbackSection).show();
												}
											}
						}));
					}, 50);
				},
	
			// Search new images
			
			searchNew = function(range) {
					
					if (range) {
						getItemsByDate(range, function() {
							setParam(settings.indexName, {
									newimages:		range
								}, getSearchNewTitle(settings.searchNew.reference) + ' ' + getTimespan(range));
							updateShares();
						});
					}
					return false;
				},
			
			// Prepare Search new functionality
			
			prepareSearchNew = function(f) {
				
					if (!f.length || !album) {
						return;
					}
					
					// Setting up defaults if something is missing
					
					settings.searchNew = $.extend({
							days: 				'3,30,90',
							depth: 				'folder',
							reference: 			'dateTaken',
							sinceLastVisit:		true
						}, settings.searchNew);
					
					var	days = settings.searchNew.days.split(',');
					
					f.append($('<label>', {
							text: 	getSearchNewTitle(settings.searchNew.reference)
						}));
							
					for (var i = 0; i < days.length; i++) {
						f.append($('<a>', {
								'class': 	'smallbtn',
								text: 		getTimespan(days[i])
							})
							.data('days', parseInt(days[i], 10))
							.on('click', function() {
								searchNew($(this).data('days'));
							}));
					}
							
					if (settings.searchNew.sinceLastVisit) {
						
						var start = $.cookie('lastVisit'),
							now = Math.round(new Date() / 1000);
						
						if (start && start < (now - ONEDAY_S)) {
							f.append($('<a>', {
									'class': 	'smallbtn',
									text: 		text.sinceMyLastVisit
								})
								.on('click', function() {
									searchNew((now - start) / ODEDAY_S);
								}));
						}
						
						// Storing last visit date for 10 years
						$.cookie('lastVisit', now, 315360000);
					}
					
				},
				
			// Preparing thumbnails
					
			prepareThumbs = function(thumbs, baseSet) {
				
					if (!album) {
						return;
					}
					
					if (album.hasShop() || settings.feedback) {
						
						if (thumbs.find('.selectable').length) {
							thumbs.selectable({
									cardClass:			'selectable',
									checkedClass:		settings.checkedClass,
									anySelected:		function() {
																$('.' + settings.selectNoneClass + ',.' + settings.addSelectedClass + ',.' + settings.keepSelectedClass).removeClass('disabled');
																shopRoot.add(feedbackRoot).trigger('itemsSelected', this);
															},
									noneSelected:		function() {
																$('.' + settings.selectNoneClass + ',.' + settings.addSelectedClass + ',.' + settings.keepSelectedClass).addClass('disabled');
																shopRoot.add(feedbackRoot).trigger('itemsSelected', 0);
															}
								});
							
							$('#shop,#feedback').show();
							
							$('.' + settings.selectAllClass).removeClass('disabled');
							
							$('.' + settings.keepSelectedClass).addClass('disabled').on('click.' + ns, function() {
									keepSelectedItems(text.selectedItems, function() {
											removeParam();
											updateShares();
										});
									
									return false;
								});
							
							
							
						} else {
							
							$('.' + settings.selectAllClass).addClass('disabled');
							$('#shop,#feedback').hide();
						}
						
						$('.' + settings.selectNoneClass + ',.' + settings.addSelectedClass).addClass('disabled');
					}
				
					if (!thumbs.find('.' + settings.lbableClass).length) {
						
						$('.' + settings.startshowClass).fadeOut();
						//$('.' + settings.selectNoneClass + ',.' + settings.addSelectedClass + ',.' + settings.selectAllClass).addClass('disabled');
						
					} else {
						
						thumbs.trigger('lightboxRemove');
						
						thumbs.lightbox(album, {
								
								baseSet:		(typeof baseSet === UNDEF)? false : baseSet,
								
								onLoadStart:	function(el) {
														var item = el.data(J.OBJ);
														if (item) {
															addParam(settings.indexName, {
																	img: 	album.getItemName(item)
																}, item[J.TITLE]);
														}						
													},
													
								onLoadEnd: 		function(el) {
														thumbs.trigger('setactivethumb', el)
													},
												
								onClose:		function() {
														removeParam(settings.indexName, 'img');
													},
												
								onReady:		function() {
														if (initByHash && window.location.hash) {
															initByHash = false;
															var param = readParam();
															
															if (param.hasOwnProperty('label')) {
																// Label filter
																getItemsByLabel(param.label, function() {
																	addParam(settings.indexName, {
																			label:			param.label,
																			search:			null,
																			newimages:		null
																		}, text.label + ': ' + param.label);
																});
															} else if (param.hasOwnProperty('search')) {
																// Search
																getItemsBySearch(param.search, function() {
																	addParam(settings.indexName, {
																			search:			param.search,
																			label:			null,
																			newimages: 		null
																		}, text.search + ': ' + param.search);
																});
															} else if (param.hasOwnProperty('newimages')) {
																// Search
																getItemsByDate(param.newimages, function() {
																	addParam(settings.indexName, {
																			newimages:		param.newimages,
																			search:			null,
																			label:			null
																		}, text.searchNew + ': ' + param.searchNew);
																});
															} else if (param.hasOwnProperty('img')) {
																var el = getThumbByName(encodeURIComponent(param.img));
																if (el.length) {
																	currentThumbs().trigger('lightboxLoad', el);
																} else {
																	removeParam(settings.indexName, 'img');
																}
															}
														}
														
														$('.' + settings.startshowClass).fadeIn().children('.button').on('click', startAuto);
													},
												
								onSlideshowStart:
												function() {
														if (settings.hasOwnProperty('backgroundMusic') && settings.backgroundMusic.slideshowControl) {
															$(settings.backgroundMusic.hook).trigger('startPlayer');
														}
													},
												
								onSlideshowPause:
												function() {
														if (settings.hasOwnProperty('backgroundMusic') && settings.backgroundMusic.slideshowControl) {
															$(settings.backgroundMusic.hook).trigger('pausePlayer');
														}
													}
							});
					}
				},
			
			// Starts slideshow
			
			startAuto = function(e) {
					var ct = currentThumbs('.' + settings.activeClass);
					
					if (!ct.length) {
						ct = currentThumbs('.' + settings.cardClass);
					}
					
					if (ct.length) {
						currentThumbs().trigger('lightboxLoad', [ ct.eq(0), 1500 ]);
					}
					
					return false;
				},
			
			// Reading out map locations
			
			getMarkers = function(images) {
					
					var markers = [];
					
					for (var i = 0; i < images.length; i++) {
						if (images[i].hasOwnProperty('location')) {
							markers.push({
								title:		[(i + '.'), images[i]['title'], images[i]['comment']].join(' '),
								pos: 		images[i].location,
								link:		images[i].path
							});
						}
					}
					
					return markers;
								
				},
			
			// Preparing functions that need the full album tree
			
			prepareDeepFunctions = function() {
				
					// Collecting tags if gathered from deep tree
					if (settings.hasOwnProperty('tagCloud') && settings.tagCloud['depth'] !== 'current') {
						album.collectTags($.extend(settings.tagCloud, {
								exact:		settings.exactFields,
								ready:		function() {
													renderTagCloud(this);
												}
							}));
					}
					
					// Search 
					if (settings.hasOwnProperty('search')) {
						prepareSearch($(settings.search.hook));
					}
					
					// Search new
					if (settings.hasOwnProperty('searchNew')) {
						prepareSearchNew($(settings.searchNew.hook));
					}
				},

			// Preparing the album upon Album object is loaded
			
			prepareAlbum = function() {
				
					if (!album) {
						return;
					}
					
					var images = album.getImages();
					
					// Removing thumbnail links right away
					
					currentThumbs('.' + settings.cardClass + '>a').each(function() {
							$(this).data('href', this.href).attr('href', '');
						});
		
					// Preapring folders
					
					prepareFolders();
		
					// Shopping cart
					
					if ($.fn.hasOwnProperty('paypal')) {
												
						// assigning paypal.js defaults 
						$.fn.paypal.defaults.relPath = settings.relPath;
						$.fn.paypal.defaults.rootPath = settings.rootPath;
						
						// Initializing the cart
						shopSection = $('section#shop');
						shopRoot = $('#shop-root').paypal(album, { 
								'getSelected': 		function() {
														return getSelectedItems(true);
													},
								'selectNone':		function() {
														currentThumbs().trigger('selectNone');
													}
							});
						
						if (shopRoot.length) {
							
							// "Select all" button
							shopSection.find('.' + settings.selectAllClass).on('click', function() {
								currentThumbs().trigger('selectAll');
								return false;
							});
							
							// "Select none" button
							shopSection.find('.' + settings.selectNoneClass).on('click', function() {
								currentThumbs().trigger('selectNone');
								return false;
							});
							
							// "Add selected" button
							shopSection.find('.' + settings.addSelectedClass).on('click', function() {
								shopRoot.trigger('addItems', getSelectedItems());
								currentThumbs().trigger('selectNone');
								return false;
							});
							
							// Ensuring lightbox has 'shop' property
							if (!$.fn.lightbox.defaults.hasOwnProperty('shop')) {
								$.fn.lightbox.defaults.shop = {};
							}
							// Setting lightbox's shop root variable
							$.fn.lightbox.defaults.shop.root = shopRoot;
						}
					}
					
					// Feedback tool
					
					if (settings.hasOwnProperty('feedback')) {
						
						// assigning paypal.js defaults 
						$.fn.feedback.defaults.relPath = settings.relPath;
						$.fn.feedback.defaults.rootPath = settings.rootPath;
						
						// Initializing the cart
						feedbackSection = $('section#feedback');
						
						// Get selected items
						settings.feedback['getSelected'] = function() {
								return getSelectedItems(true);
							}
						settings.feedback['selectNone'] = function() {
								currentThumbs().trigger('selectNone');
							}
							
						feedbackRoot = $('#feedback-root').feedback(album, settings.feedback);
						
						if (feedbackRoot.length) {
							
							// "Select all" button
							feedbackSection.find('.' + settings.selectAllClass).on('click', function() {
								currentThumbs().trigger('selectAll');
								return false;
							});
							
							// "Select none" button
							feedbackSection.find('.' + settings.selectNoneClass).on('click', function() {
								currentThumbs().trigger('selectNone');
								return false;
							});
							
							// "Add selected" button
							feedbackSection.find('.' + settings.addSelectedClass).on('click', function() {
								feedbackRoot.trigger('addItems', getSelectedItems());
								currentThumbs().trigger('selectNone');
								return false;
							});
							
							// Ensuring lightbox has 'feedback' property
							if (!$.fn.lightbox.defaults.hasOwnProperty('feedback')) {
								$.fn.lightbox.defaults.feedback = {};
							}
							// Setting lightbox's feedback root variable
							$.fn.lightbox.defaults.feedback.root = feedbackRoot;
						}
					}
					
					// Rendering thumbnails
					if (images.length) {
						getOverlay().renderThumbs(images, prepareThumbs, true);
						
						// Collecting markers and initializing map
						if (settings.hasOwnProperty('map') && settings.map.index) {
							$('.map-root').addMap({
								markers: 			getMarkers(images),
								type:				settings.map['type'] || 'roadmap',
								zoom:				settings.map['zoom'] || 16,
								fitBounds:			true,
								fullscreenControl:	true,
								click:				function() {
														if (this.link) {
															var el = getThumbByName(this.link);
															if (el.length) {
																removeOverlay();
																currentThumbs().trigger('lightboxLoad', el);
															}
														}
													}
							});
						}
	
					} else if (window.location.hash) {
						// no thumbnails, only folders
						// we should check the search / tags / newimages filter
						stateChange();
					}
					
					// Collecting tags if gathered only from this folder
					if (settings.hasOwnProperty('tagCloud')) {
						
						if (settings.tagCloud['depth'] === 'current') {
							album.collectTags($.extend(settings.tagCloud, {
									exact:		settings.exactFields,
									ready:		function() {
														renderTagCloud(this);
													}
								}));
						}
						
						if (settings.tagCloud.hasOwnProperty('searchHook')) {
							prepareTagSearch();
						}
					}
				},
			
			// Preparing a custom page
			
			preparePage = function() {
					// Page :: initializing functions
					// Search 
					if (settings.hasOwnProperty('search')) {
						prepareSearch($(settings.search.hook));
					}
				},
			
			// Marking new folders
			
			markFoldersNew = function() {
					if (!album) {
						return;
					}
					
					var folders = album.getFolders(),
						secs = settings.markNew['days'] * ONEDAY_S,
						d;
					
					if (folders.length) {
						getFolders('.' + settings.cardClass).each(function(i) {
								if (i < folders.length) {
									d = folders[i][J.DATES];
									if (d) {
										d = d[settings.markNew['reference']] || d[J.DATERANGE][1] || d[J.DATERANGE][0];
										if (d && (nows - d) < secs) {
											$(this).find('.' + settings.thumbClass).append($('<span>', {
													'class':	'icon-star new-image'
												}).data('tooltip', (new Date(d * 1000)).toLocaleDateString()).addTooltip());
										}
									}
								}
							});
					}
				},
				
			// Preparing folders
		
			prepareFolders = function() { 
				
					var scrollTimeout = null,
						folders = getFolders();
					
					if (!folders.children().length) {
						return;
					}
					
					if (settings.hasOwnProperty('markNew')) {
						setTimeout(markFoldersNew, 300);
					}
					
					setTimeout(function() {
							
							// Automatic height matching by row
							if (!settings.fixedShapeFolderThumbs || settings.folderCaptionPlacement !== 'over') {
								folders.matchHeight({
										delegate:		settings.cardClass,
										match:			settings.fixedShapeFolderThumbs?
															[ settings.cardClass ]
															:
															[ settings.thumbClass, settings.cardClass ]
									});
							}
							
							lazyloadFolders();
							
							folders.find('.' + settings.preloadClass + ':first-child img')
								.waitAllImg(function() {
										folders.find('.' + settings.preloadClass).removeClass(settings.preloadClass);
										folders.trigger('refresh');
									});
						}, 500);
				},
			
			// Cookie policy
			
			showCookiePolicy = function() {
			
					if (!$.cookie('cookiePolicy')) {
						var	el = $('<div>', { 
									id: 		'cookiepolicy' 
								}).appendTo($body),
							p = $('<p>', { 
									html: 		text.cookiePolicyText 
								}).appendTo(el);
						
						if (settings.cookiePolicyUrl) {
							p.append($('<a>', { 
									text: 		text.cookiePolicyLearnMore, 
									target: 	'_blank', 
									href: 		settings.cookiePolicyUrl 
								}));
						}
						
						p.append($('<a>', {
								'class': 		'smallbtn',
								text: 			text.cookiePolicyAgree 
							}).on('click', 	function(){ 
								$('#cookiepolicy').fadeOut(500, function() { 
									$(this).remove(); 
								});
								$.cookie('cookiePolicy', true, 36000000); // expires: 10000 days
							}));
						
						el.fadeIn(500);
						setTimeout(function() {
							$('#cookiepolicy').fadeOut(500, function() { 
								$(this).remove(); 
							});
						}, 6000);
					}			
				},
			
			// Hash change listener :: when the browser's back / forward buttons were pressed
			
			stateChange = function() {
					if (window.location.hash === lastHash) {
						return;
					}
					
					lastHash = window.location.hash;
					var param = readParam();
					
					if (param.hasOwnProperty('label')) {
						// Label filter
						getItemsByLabel(param.label, function() {
							setParam(settings.indexName, {
									label:	param.label
								}, text.label + ': ' + param.label);
							updateShares();
						});
					} else if (param.hasOwnProperty('search')) {
						// Search
						getItemsBySearch(param.search, function() {
							setParam(settings.indexName, {
									search:	param.search
								}, text.search + ': ' + param.search);
							updateShares();
						});
					} else if (param.hasOwnProperty('newimages')) {
						// New images
						getItemsByDate(param.newimages, function() {
							setParam(settings.indexName, {
									newimages: param.newimages
								}, text.newImages + ': ' + param.newimages);
							updateShares();	
						});
					} else if (param.hasOwnProperty('img')) {
						// Image (no search or label)
						var el = getThumbByName(param.img);
						if (el.length) {
							currentThumbs().trigger('lightboxLoad', el);
						} else {
							removeParam(settings.indexName, 'img');
						}
					} else {
						// Plain index page
						currentThumbs().trigger('lightboxQuit');
						removeOverlay();
					}
					
				},
			
			// Updating the share buttons after a state change
			
			updateShares = function() {
					if (settings.hasOwnProperty('share') && currentThumbs().trigger('lightboxContainer').is(':visible')) {
						$(settings.share.hook).trigger('updateLinks');
					}	
				};
			
		
		/*
		 *	START of Skin code
		 */
		
		// Removing search string
		
		if (window.location.search) {
			removeSearch();
		}
		
		// Creating new Album
		
		if (settings.pageType === 'index') {
			
			if (typeof Album === UNDEF) {
				console.log('Critical Error: Missing jalbum.album.js library!');
			}
			
			var params = {
					makeDate:		settings['makeDate'],
					rootPath:		settings['rootPath'],
					relPath:		settings['relPath'],
					ready: 			prepareAlbum,
					deepReady:		prepareDeepFunctions
				};
				
			if (settings.indexName !== $.fn.skin.defaults.indexName) {
				params.indexName = settings['indexName'];
			}
			
			if (settings.audioPoster !== $.fn.skin.defaults.audioPoster) {
				params.audioPoster = settings['audioPoster'];
			}
				
			if (settings.videoPoster !== $.fn.skin.defaults.videoPoster) {
				params.videoPoster = settings['videoPoster'];
			}
			
			album = new Album($, params);
		}
		
		// Cache buster if thumbnail dimensions has changed
		
		if ((cacheBuster = $.cookie($('title').text() + '_thumbDims')) && settings.hasOwnProperty('thumbDims') && cacheBuster === settings.thumbDims) {
			cacheBuster = '';
		} else {
			cacheBuster = '?' + (cacheBuster? cacheBuster : settings.thumbDims);
			$.cookie($('title').text() + '_thumbDims', settings['thumbDims']);
		}
		
		// Right click protection on folders, slider
		
		if (settings.rightClickProtect) {
			$('.' + settings.folderContClass + ',.' + settings.sliderClass).on('contextmenu', 'img', function(e) {
					e.preventDefault()
					return false;
				});
		}
		
		// Initializing map
		
		if (settings.hasOwnProperty('map')) {
			if (settings.map.hasOwnProperty('type')) {
				$.fn.lightbox.defaults.mapType = settings.map.type;
				$.fn.addMap.defaults.type = settings.map.type;
			}
			if (settings.map.hasOwnProperty('zoom')) {
				$.fn.lightbox.defaults.mapZoom = settings.map.zoom;
				$.fn.addMap.defaults.zoom = settings.map.zoom;
			}
			if (settings.map.hasOwnProperty('apiKey')) {
				$.fn.addMap.defaults.apiKey = settings.map.apiKey;
			}
		}
					
		// Passing along lightbox defaults
		
		passDefaults(settings, $.fn.lightbox.defaults, 'indexName,level,previousFoldersLast,nextFoldersFirst,rightClickProtect,enableKeyboard,enableMouseWheel,extraSizes,lbableClass');
		passDefaults(settings.lightbox, $.fn.lightbox.defaults);
		
		// Social sharing
		
		if (settings.hasOwnProperty('share')) {
			$.fn.renderShares.defaults.buttonTheme = settings.share['buttonTheme'] || 'dark';
			$.fn.renderShares.defaults.facebookAppId = settings.share['facebookAppId'] || '';
			$(settings.share.hook).renderShares(settings.share);
			if (settings.share.sites !== 'facebook') {
				$.fn.lightbox.defaults.share = settings.share.sites.replace('facebook,', '').replace(',facebook', '');
			}
		}
		
		// Background music
		
		if ($('[data-audioPlayer]').length) {
			$('[data-audioPlayer]').audioPlayer({
					rootPath: 	settings.rootPath
				});
		}
				
		// Hash change listener
		
		$window.on('hashchange.' + ns, stateChange);
		
		// Utility function for debugging
		
		this.getAlbum = function() {
				return album;
			};
		
	};
	
	$.fn.skin.defaults = {
			contentHook:			'article.cont',
			sliderClass:			'slider',
			folderContClass:		'folder-cont',
			fodlersClass:			'folders',
			folderHoverClass:		'hover-scale',
			folderClass:			'folder',
			thumbContClass:			'thumb-cont',
			thumbGridClass:			'caption-below small-up-2 medium-up-3 large-up-4',
			thumbHoverClass:		'hover-scale',
			thumbsClass:			'thumbnails',
			thumbClass:				'thumb',
			verticalMiddleClass:	'vertical-middle',
			cardClass:				'card',
			lbableClass:			'lbable',
			captionClass:			'caption',
			commentClass:			'comment',
			hascaptionClass:		'hascaption',
			checkedClass:			'checked',
			activeClass:			'active',
			preloadClass:			'preload',
			lazyloadClass:			'lazyload',
			startshowClass:			'startshow',
			panoClass:				'pano',
			selectAllClass:			'select-all',
			selectNoneClass:		'select-none',
			keepSelectedClass:		'keep-selected',
			addSelectedClass:		'add-selected',
			fixedShapeThumbs:		true,
			fixedShapeFolderThumbs:	true,
			folderCols:				2,
			scrollCheckInterval:	250,
			indexName:				'index.html',
			audioPoster:			'audio.poster.png',
			videoPoster:			'video.poster.png',
			exactFields:			'creator,keywords',
			fixGrid:				false,
			autoStart:				false,
			scaleUp:				false,
			rightClickProtect: 		false,
			enableKeyboard:			true,
			videoAuto:				true,
			linkToFolder:			true
		};
		
})(jQuery, jQuery(window), jQuery(document), jQuery('body'));
