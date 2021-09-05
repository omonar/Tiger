/* 
 *	main.js - the skin's javascript functions
 */
	
;(function($, $window, $document, $body, undefined) {
	'use strict';
				
	/********************************************************
	 *
	 *		Implementing select functions on images
	 *
	 ********************************************************/
	
	$.fn.selectable = function(options) {
		
			options = $.extend({
							cardClass:				'card',
							thumbClass:				'thumb',
							checkboxClass: 			'checkbox',
							selectedClass:			'checked',
							checkmarkClass:			'icon-checkmark',
							hasSelectedClass:		'has-selected',
							allSelectedClass:		'all-selected',
							selectionChange:		null
						}, options);
			
			var overlay = $(this).eq(0),
				cards,
				
				update = function(n) {
					
						if (typeof options.selectionChange === FUNCTION) {
							options.selectionChange.call(n);
						}
						
						$body
							.toggleClass(options.hasSelectedClass, n > 0)
							.toggleClass(options.allSelectedClass, n === cards.length);
					},
					
				selectedCnt = function() {
						return cards.filter('.' + options.selectedClass).length;
					},
			
				getCards = function() {
						return options.selector? overlay.find(options.selector) : overlay.find('.' + options.cardClass);
					},
			
				selectCard = function(card) {
						card.addClass(options.selectedClass)
							.find('.' + options.checkboxClass)
							.addClass(options.checkmarkClass);
					},
					
				unselectCard = function(card) {
						card.removeClass(options.selectedClass)
							.find('.' + options.checkboxClass)
							.removeClass(options.checkmarkClass);
					},
					
				toggleCard = function(card) {
						if (card.hasClass(options.selectedClass)) {
							unselectCard(card);
						} else {
							selectCard(card);
						}
					},
			
				clicked = function(e) {
						var card = $(e.target).closest('.' + options.cardClass),
							n = selectedCnt();
						
						if (card.hasClass(options.selectedClass)) {
							unselectCard(card);
							n -= 1;
							
							if (typeof options.selectionChange === FUNCTION) {
								options.selectionChange.call(n);
							}
							
						} else {
							
							selectCard(card);
							n += 1;
							
							if (typeof options.selectionChange === FUNCTION) {
								options.selectionChange.call(n);
							}
						}	
							
						update(n);
						
						return false;
					},
			
				selectAll = function() {
					
						if (overlay.is(':visible')) {
							var n = selectedCnt();
							
							if (n < cards.length) {
								n = cards.length;
								cards.not('.' + options.selectedClass).each(function() {
										selectCard($(this));
									});
										
								if (typeof options.selectionChange === FUNCTION) {
									options.selectionChange.call(n);
								}
							}
							
							update(n);
						}
					},
			
				selectNone = function() {
					
						if (overlay.is(':visible')) {
							var n = selectedCnt();
							
							if (n > 0) {
								n = 0;
								cards.filter('.' + options.selectedClass).each(function() {
										unselectCard($(this));
									});
										
								if (typeof options.selectionChange === FUNCTION) {
									options.selectionChange.call(n);
								}
							}
							
							update(n);
						}
					},
					
				selectInverse = function() {
					
						if (overlay.is(':visible')) {
							var n = cards.length - selectedCnt();
							
							if (n === 0) {
								// All selected
								cards.each(function() {
										unselectCard($(this));
									});
								
								if (typeof options.selectionChange === FUNCTION) {
									options.selectionChange.call(0);
								}
								
							} else {
								// Some selected
								cards.each(function() {
										toggleCard($(this));
									});
								
								if (typeof options.selectionChange === FUNCTION) {
									options.selectionChange.call(n);
								}
							} 
							
							update(n);
						}
					},
				
				selectRefresh = function() {
						var th, 
							cb;
							
						cards = getCards();
						
						cards.each(function() {
								
							if (!($(this).find('span.' + options.checkboxClass).length)) {
								
								th = $(this).children('.' + options.thumbClass).eq(0);
								
								if (th.length) {
									cb = $('<span>', {
											'class': 	options.checkboxClass
										}).appendTo(th);
								} else {
									cb = $('<span>', {
											'class': 	options.checkboxClass
										}).prependTo($(this));
								}
								
								cb.on({
										click: 		clicked
									});
							}
							
						});
						
						if (typeof options.selectionChange === FUNCTION) {
							options.selectionChange.call(selectedCnt());
						}
						
					};
			
			selectRefresh();
			
			overlay.on({
					selectAll: 			selectAll,
					selectNone: 		selectNone,
					selectInverse: 		selectInverse,
					selectRefresh: 		selectRefresh
				});
					
			return this;
		};
			
		
	/********************************************************
	 *
	 *					The main skin code
	 *
	 ********************************************************/
	
	$.fn.skin = function(settings) {
		
			settings = $.extend({}, $.fn.skin.defaults, settings);
			
			var main					= 	$(this),								// Main SECTION
				content					=	main.find('#main-cont'),				// Main container
				text 					= 	getTranslations({						// Translated texts
													foundNTimes:				'found {0} time(s)',
													notFound: 					'not found',
													search: 					'Search',
													searchBoxTip:				'Search...',
													newImages:					'New images',
													results:					'Results',
													reset:						'Reset',
													label: 						'Label',
													selectedItems:				'Selection',
													addCart:					'Add to cart',
													'return': 					'return',
													select:						'Select',
													sortBy:						'Sort by',
													sortedBy:					'Sorted by',
													ascending:					'ascending',
													descending:					'descending',
													multipleSelectHint:			'Use SHIFT to select range, CTRL for multiple entries',
													noRating:					'No rating',
													inTheLastDay:				'in the last day',
													inThePastNDays:				'in the past {0} days',
													sinceMyLastVisit:			'since my last visit',
													betweenDays:				'between {0} and {1}',
													onDay:						'on {0}',
													beforeDay:					'before {0}',
													afterDay:					'after {0}',
													imagesAdded:				'Images added',
													imagesModified:				'Images modified',
													imagesTaken:				'Images taken',
													'new':						'New',
													more:						'more',
													less:						'less'
												}),
			
				shopRoot 				=	$(),									// Root element for cart
				shopBox 				= 	$(),									// Whole Shopping section
				feedbackRoot 			=	$(),									// Root element for the feedback tool
				feedbackBox 			=	$(),									// Whole Feedback section
				mapRoot,															// Root element for map
				album,																// The database
				lightbox,															// Lightbox element
				ns 						= 	'tiger_skin',							// Namespace
				lastHash 				= 	'',										// Storing last state
				pageExt					= 	settings.indexName.split('.')[1] || 'html',	// Index page extension
				initByHash 				= 	window.location.hash !== "",			// Initial URL contains hash
				nows 					=	new Date() / 1000,						// Now in seconds
				currency 				=	'EUR',
				scrollTop 				= 	$window.scrollTop(),					// initial scroll top
				lazyloadFoldersTimeout 	= 	null,									// Lazyload tracking
				lazyloadFoldersInProgress 	= 	false,									// lock to avoid multiple calls
				
				// Determine card type
				
				cardType = function(card) {
						var s = card.closest('section');
						if (!s.length) {
							return 'image';
						} else if (s.hasClass(settings.folderClass)) {
							return 'folder';
						} else if (s.hasClass(settings.thumbsClass)) {
							return 'thumb';
						}
						
						return '';
					},
												
				/********************************************************
				 *
				 *					Managing overlays
				 *				e.g. after search or filter
				 *
				 ********************************************************/
				/*
				
					<section id="main" class="content"> => main
						
						// Base
						<article id="main-cont"> => content
							<section class="thumbnails">
								<div class="cont horizontal caption-over hover-zoom caption-on-hover">
								</div>
							</section>
							<section id="tag-cloud" class="row cont-box"><div class="cont box"><h4 class="icon-label"> Labels</h4><div class="tag-cloud"></div><form class="tag-search" data-depth="tree" data-fields="creator,keywords,folder:title,folder:name,webLocation:title,webPage:title" wtx-context="94581790-1AAD-4D31-91BA-67ADA9D1EC6F"><div class="search-input"><input type="text" placeholder="Search..." aria-label="Search" wtx-context="46A4B41B-684F-4DFB-8E45-6D8FAC4C5691"></div><a class="search-btn icon-search"></a></form></div></section>
							<section class="prev-next-links"><div class="cont"><div class="next-link has-bg" style="background-image:url(../People/thumbs/Newborn.jpg)"><a rel="next" href="../People/index.html"><span class="caption">People <span class="icon-caret-right"></span></span></a></div></div></section>
						</article>
						
						// Base + overlay
						<article id="main-cont" class="has-overlay"> => content
							<section class="thumbnails base">
								<div class="cont horizontal caption-over hover-zoom caption-on-hover">
								</div>
							</section>
							<section class="thumbnails overlay" data-overlay="oly_NNNN">
								<header class="cont overlay-title icon-filter">
									<h4>Title</h4>
									<a class="close">Return</a>
								</header>
								<div class="cont horizontal caption-over hover-zoom caption-on-hover">
								</div>
							</section>
							<section id="tag-cloud" class="row cont-box"><div class="cont box"><h4 class="icon-label"> Labels</h4><div class="tag-cloud"></div><form class="tag-search" data-depth="tree" data-fields="creator,keywords,folder:title,folder:name,webLocation:title,webPage:title" wtx-context="94581790-1AAD-4D31-91BA-67ADA9D1EC6F"><div class="search-input"><input type="text" placeholder="Search..." aria-label="Search" wtx-context="46A4B41B-684F-4DFB-8E45-6D8FAC4C5691"></div><a class="search-btn icon-search"></a></form></div></section>
							<section class="prev-next-links"><div class="cont"><div class="next-link has-bg" style="background-image:url(../People/thumbs/Newborn.jpg)"><a rel="next" href="../People/index.html"><span class="caption">People <span class="icon-caret-right"></span></span></a></div></div></section>
						</article>
						
					</section>
				*/
				
				OLYTAG = 'section',
				
				// Only one overlay is allowed!!!
				
				setOverlayNS = function(ns) { 
						
						if (typeof ns === UNDEF) {
							ns = getOverlay().attr('data-overlay', 'oly_' + Math.floor(Math.random() * 10000));
						} else if (ns === null) {
							getOverlay().removeAttr('data-overlay');
						} else {
							getOverlay().attr('data-overlay', ns);
						}
						
						return ns;
					},
					
				// Getting NameSpace
				
				getOverlayNS = function() {
					
						return getOverlay().data('overlay');
					},
					
				// Returns the active overlay
				
				getOverlay = function(create) {
						var oly = content.find('.' + settings.thumbnailsClass).last();
						
						if (!oly.length && create) {
							createrOverlay();
						}
						
						return oly;
					},
					
				// Getting base overlay
				
				getBaseOverlay = function() {
				
						return content.find('.' + settings.thumbnailsClass).eq(0);
					},
					
				// Scroll to overlay
					
				focusOverlay = function() {
						var oly = getOverlay();
						
						if (oly.length && oly.offset().top < $window.scrollTop() || oly.offset().top > ($window.scrollTop() + $window.height() - 100)) {
							$window.scrollTop(oly.offset().top);
						}
					},
					
				// Creating a new overlay
				
				createOverlay = function() {
						var oly = $('<' + OLYTAG + '>', {
										'class':		settings.thumbnailsClass + ' ' + settings.overlayClass
									}),
							boly = getBaseOverlay();									// Base overlay
							
						if (boly.length) {
							// Has base: create after it
							boly.after(oly);
						} else {
							// No base: create at first position
							content.prepend(oly);
						}
						
						oly.attr('data-overlay', 'oly_' + Math.floor(Math.random() * 10000));
						
						content.addClass(settings.hasOverlayClass);
						
						return oly;
					},
					
				// Content has overlay?
				
				hasOverlay = function() {
					
						return content.find('.' + settings.overlayClass).length > 0;
					},
					
				// Associate elements with the current overlay
				
				attachToOverlay = function(el) {
					
						if (el.length) {
							var ns = getOverlayNS();
							el.each(function() {
									$(this).attr('data-rel', ns);
								});
						}
					},
					
				// Remove overlay-attached elements	
					
				removeAttachedElementsFromOverlay = function(ns) {
						var ns = ns || getOverlayNS();
						
						if (ns) {
							content.find('[data-rel=' + ns + ']').remove();
						}
					},
				
				// Creating header
				
				createOverlayHeader = function(options, target) {
						var h = $('<header>', {
									 'class':	[	settings.contClass,
									 	 			settings.overlayTitleClass,
									 	 			(options && options.hasOwnProperty('icon'))? options.icon : ''
									 	 		].filter(Boolean).join(' ')
								}).prependTo(target || getOverlay());
						
						if (options && options.hasOwnProperty('title')) {
							h.append($('<h' + settings.overlayHeadLevel + '>', {
									html: 	options.title
								}));
						}			
								
						h.append($('<a>', {
									'class': 	'close',
									href: 		'',
									text: 		text.return
								})
							.on('click', function() {
									removeOverlay();
									return false;
								}));
						
						return h;
					},
					
				// Getting overlay header
				
				getOverlayHeader = function() {
						var oly = getOverlay();
						
						return oly.length? oly.children('header').eq(0) : $();
					},
					
				// Getting overlay header
				
				getOverlayTitle = function() {
						var oly = getOverlay();
						
						return oly.length? oly.find('header > h' + settings.overlayHeadLevel).eq(0) : $();
					},
					
				// Append text to overlay title
				
				appendToOverlayTitle = function(cont) {
						var t = getOverlayTitle();
						
						return t.length? cont.appendTo(t) : $();
					},
					
				// Adding progressbar
				
				appendProgressbar = function() {
					
						return $('<div>', {
									'class': 	settings.progressbarClass
								}).insertAfter(getOverlayHeader());
					},
					
				// Remove progressbar
				
				removeProgressbar = function(target) {
					
						getOverlay().find('.' + settings.progressbarClass).remove();
					},

				// Getting base thumbnail container 
				
				getBaseImageContainer = function() {
				
						return content.find('.' + settings.thumbnailsClass + ':not(.' + settings.overlayClass + ')').first().children('div.' + settings.contClass);
					},
					
				// Returns the current thumbnail container if exists
				
				getImageContainer = function(create) {
						var ic = content.find('.' + settings.thumbnailsClass).last().children('div.' + settings.contClass);
						
						if (!ic.length && create) {
							ic = createImageContainer(getOverlay(true));
						}
						
						return ic; 
					},
					
				// Creating image container within target overlay
				
				createImageContainer = function(target) {
						var oly = target || getOverlay();
						
						return $('<div>', {
									'class': 	[
													settings.contClass,
													settings.thumbLayout, 
													'caption-' + settings.captionPlacement, 
													settings.hoverEffectThumbs? 'hover-zoom' : '', 
													(settings.captionPlacement !== 'below' && settings.captionShowOnHover)? 'caption-on-hover' : ''
												].filter(Boolean).join(' ')
								}).appendTo(oly);
					},
					
				// Getting all base cards
				
				getBaseCards = function(selector) {
						var ic = getBaseImageContainer();
						
						return ic.length? ic.find('.' + settings.cardClass + (selector || '')) : $();
					},
					
				// Returns the current thumbnails (base or overlay)
				
				getBaseThumbs = function(selector) {
						var ic = getBaseImageContainer();
					
						return ic.length? ic.children('.' + settings.cardClass + ' .' + settings.thumbClass + (selector || '')) : $();
					},
					
				// Returns the current cards (base or overlay)
				
				getCards = function(selector) {
						var ic = getImageContainer();
					
						return ic.length? ic.children('.' + settings.cardClass + (selector || '')) : $();
					},
					
				// Returns the current cards (base or overlay)
				
				getSelectedCards = function() {
						var ic = getImageContainer();
					
						return ic.length? ic.children('.' + settings.cardClass + '.' + settings.selectedClass) : $();
					},
					
				// Returns the current cards (base or overlay)
				
				getSelectableCards = function() {
						var ic = getImageContainer();
					
						return ic.length? ic.children('.' + settings.cardClass + '.' + settings.selectableClass) : $();
					},
					
				// Returns the current thumbnails (base or overlay)
				
				getThumbs = function(selector) {
						var ic = getImageContainer();
					
						return ic.length? ic.children('.' + settings.cardClass + ' .' + settings.thumbClass + (selector || '')) : $();
					},
					
				// Removing overlay
				
				removeOverlay = function() {
						var oly = getOverlay();
						
						if (oly.length && oly.hasClass(settings.overlayClass)) {
							var ns = oly.data('oly-ns');
							
							oly.trigger('removeLightbox');
							
							removeAttachedElementsFromOverlay(ns);
							
							oly.trigger('overlayRemoved');
							
							oly.remove();
							
							$window.off('.' + ns);
							
							content.removeClass(settings.hasOverlayClass);
							
							removeParam(settings.indexName);
							
							updateShares();
								
							if (getSelectableCards().length) {
								shopBox.add(feedbackBox).show();
							} else {
								shopBox.add(feedbackBox).hide();
							}
							
							content.hideAllTooltips();
							content.find('[data-sticky-rel]').trigger('stickyRefresh');
						}
					},
					
				// Adding new overlay
			
				addOverlay = function(options) {
						
						// Removing existing overlay first
						removeOverlay();
						content.hideAllTooltips();
						
						// Creating overlay (section.thumbnails)
						var oly = createOverlay();
						
						// Creating header
						createOverlayHeader(options, oly);
						/*
						// Creating thumb container
						var ic = createImageContainer(oly);
						*/
							
						// Triggering ready event
						content.trigger('overlayReady', oly);
						
						content.find('[data-sticky-rel]').trigger('stickyRefresh');
						
						return oly;
					},
				
				// Getting file name from thumbnail
				
				getImageFileName = function(t) {
						var l = t.data('href') || t.attr('href');
								
						return l? l.substring(l.lastIndexOf('/') + 1).replace('#img=', '') : '';
					},
				
				// Checking if file is a custom page and matches base name: "name"
				
				checkPageName = function(fn, name) {
						
						if (fn.slice(-pageExt.length) === pageExt) {
							return fn.substring(0, fn.lastIndexOf('.')) === name.substring(0, name.lastIndexOf('.'));
						}
						
						return false;
					},
					
				// Getting thumbnail by file name
				
				getCardByName = function(name, base) {
						var cards,
							t = $();
						
						cards = (typeof base === UNDEF || !base)?
							getCards()
							:
							getBaseCards();
						
						name = decodeURIComponent(name);
						
						cards.find('.' + settings.thumbClass).each(function() {
								var  fn = $(this).data('name') || getImageFileName($(this));
								
								if (fn === name || checkPageName(fn, name)) {
									t = $(this).parent();
									return false;
								}
							});
						
						return t;
					},
				
				// Getting folders container
				
				getFolderContainer = function() {
					
						return content.find('.' + settings.foldersClass + ' .' + settings.contClass);
					},
										
				// Getting all folder cards
				
				getFolders = function() {
						var fc = getFolderContainer();
						
						return fc.length? fc.find('.' + settings.cardClass) : $();
					},
					
				// Getting map
				
				getMapRoot = function(create) {
						var mapbox = content.find(settings.mapBoxHook).last();
							
						if (mapbox.length && mapbox.is(':visible')) {
							
							return mapbox.find('.' + settings.mapRootClass);
							
						} else if (create) {
							
							var newMap = $('<section class="map show-on-overlay">' +
												'<div class="cont box">' +
													'<div class="' + settings.mapRootClass + '" data-map-root></div>' +
												'</div>' +
											'</section>');
						
							if (mapbox.length) {
								mapbox.after(newMap);
							} else {
								getOverlay().before(newMap);
							}
							
							attachToOverlay(newMap);
							
							return newMap.find('.' + settings.mapRootClass);
						}
						
						return $();
					},
													
				// Getting attached lightbox
				
				getLightbox = function() {
					
						return getImageContainer().find('.' + settings.lightboxClass);
					},
					
				// Loading an image in lightbox
				
				lightboxLoad = function(card, auto) {
					
						getImageContainer().trigger('lightboxLoad', (typeof auto === UNDEF)? card : [ card, auto ]);
					},
					
				// Leaving lightbox
				
				lightboxQuit = function() {
					
						getImageContainer().trigger('lightboxQuit');
					},
					
				// Getting selected items from current overlay
				
				getSelectedItems = function() {
						var r = [];
								
						getSelectedCards().each(function() {
								r.push($(this).data(J.OBJ));
							});
						
						return r;
					},
				
				// Getting all items from current overlay
				
				getAllItems = function() {
						var r = [];
								
						getCards().each(function() {
								r.push($(this).data(J.OBJ));
							});
						
						return r;
					},
								
				// Getting all items from base overlay
				
				getBaseItems = function() {
						var r = [];
						
						getBaseCards().each(function() {
								r.push($(this).data(J.OBJ));
							});
						
						return r;
					},
					
				// Adding one folder's thumb
				
				loadFolderThumb = function(card) {
						
						card.find('[data-src]').each(function() {
								var t = $(this),
									img = card.find('img');
							
								if (!img.length) {
									img = $('<img>', {
											'class': 	settings.hideImageClass,
											alt: 		t.data('alt') || ''
										}).appendTo(t);
										
									img[0].width = t.data('width');
									img[0].height = t.data('height');
								}
								
								img.one('load', function() {
										card.removeClass(settings.lazyloadClass);
										$(this).addClass(settings.showImageClass).removeClass(settings.hideImageClass);
									})
									.attr('src', t.data('src'));
							});
					},
						
				// Loading visible folder thumbs
				
				lazyloadFolders = function(doneFn) {
					
						if (lazyloadFoldersInProgress || getLightbox().is(':visible') || hasOverlay()) {
							clearTimeout(lazyloadFoldersTimeout);
							return;
						}
						
						if (lazyloadFoldersTimeout) {
							clearTimeout(lazyloadFoldersTimeout);
							lazyloadFoldersTimeout = null;
						}
						
						var st = $window.scrollTop();
						
						if (Math.abs(st - scrollTop) > 20) {
							// Scrolling in progress: wait until finishes
							scrollTop = st;
							lazyloadFoldersTimeout = setTimeout(lazyloadFolders, settings.scrollCheckInterval);
							return;
						}
						
						// Getting folders to load
						var folders = getFolders('.' + settings.lazyloadClass);
						
						if (folders.length) {
							var wh = $window.height();
						
							lazyloadFoldersInProgress = true;
							
							folders.each(function() {
									var card = $(this),
										tt = card.offset().top,
										th = card.height();
										
									if ((tt + th) > (scrollTop - wh)) {
										// Below 1 screens above scroll pos
										if (tt < (scrollTop + wh)) {
											loadFolderThumb(card);
										} else {
											// Far below: stop loading more
											return false;
										}
									}
								});
							
							// perpetrating lazyload
							clearTimeout(lazyloadFoldersTimeout);
							lazyloadFoldersTimeout = setTimeout(lazyloadFolders, settings.scrollCheckInterval);
							
						} else {
							
							$window.off('.lazy');
						}
						
						lazyloadFoldersInProgress = false;
						scrollTop = st;
						
						if (typeof doneFn === FUNCTION) {
							doneFn.call(this);
						}
					},
					
				/********************************************************
				 *
				 *						Folder tree
				 *
				 ********************************************************/
				
				getFolderTree = function() {
					
						var getFolderObjects = function(folder) {
								if (folder.hasOwnProperty(J.FOLDERS) && folder[J.FOLDERS].length) {
									var ul, li, i, p, f = folder[J.FOLDERS];
									ul = $('<ul>');
									for (i = 0; i < f.length; i++) {
										p = album.getPath(f[i]);
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
					};
			
				/********************************************************
				 *
				 *					Image overlay rendering 
				 *			or initializing images in the base overlay
				 *
				 ********************************************************/
				/*
					<article class="overlay">
						<section class="thumbnails">
							<div class="cont horizontal caption-over hover-zoom caption-on-hover">
								<div class="card preload hascaption">
									<a class="thumb" href="slides/Dusk.jpg">
										<img src="thumbs/Dusk.jpg" width="244" height="170">
									</a>
									<div class="caption">
										<h6>Title</h6>
										<div class="comment">Comment</div>
									</div>
								</div>
							</div>
						</section>
					</article>
				*/

				$.fn.renderImages = function(items, complete, baseSet) {
					
						if (typeof items === UNDEF || !items.length) {
							return this;
						}
					
						if (!Array.isArray(items)) {
							items = [ items ];
						}
						
						var	overlay				= $(this),												// Overlay
							ns 					= getOverlayNS(),										// Namespace
							imageContainer		= getImageContainer(true),								// image container (for overlays)
							cols 				= 0,													// Columns
							scrollTop 			= $window.scrollTop(),									// Scroll timeout
							lazyloadTimeout 	= null,													// Lazy load timeout
							
							// Rendering images
									
							initImages = function() {
									var cards = getCards(), 
										card,
										ar,
										image,
										img,
										isFolder,
										isLbable,
										isMedia,
										isIcon,
										caption,
										s,
										d,
										cd = settings.hasOwnProperty('markNew')? (nows - settings.markNew.days * ONEDAY_S) : null,
										item;
									
									// Initializing images
									for (var i = 0; i < items.length; i++) {
										
										item = items[i];
										isFolder = item[J.CATEGORY] === 'folder';
										isLbable = !isFolder && album.isLightboxable(item);
										isMedia = item[J.CATEGORY] === 'video' || item[J.CATEGORY] === 'audio';
										isIcon = item.hasOwnProperty(J.THUMB)? /res\/\w+\.png$/.test(item[J.THUMB][J.PATH]) : false;
										ar = item[J.THUMB][J.WIDTH] / item[J.THUMB][J.HEIGHT];
										s = item[J.THUMBCAPTION];
										
										if (i < cards.length) {
											// Already exists in the HTML source
											card = cards.eq(i);
										} else {
											// Not yet exists in the HTML source: happens only on overlays
											card = $('<div>', {
														'class': 	[ 
																	settings.cardClass, 
																	settings.lazyloadClass, 
																	item[J.CATEGORY],
																	s? 'hascaption' : '',
																	(item[J.THUMB][J.WIDTH] < settings.maxThumbWidth && item[J.THUMB][J.HEIGHT] < settings.maxThumbHeight)? 'tiny' : '',
																	isIcon? 'icon' : '',
																	(ar >= 1.25)? 'landscape' : ((ar <= 0.8)? 'portrait' : 'square')
																].filter(Boolean).join(' ')
													}).appendTo(imageContainer);
										}
										
										// Finding/creating image's <a> wrap
										image = card.children('.' + settings.thumbClass);
										if (!image.length) {
											image = $('<a>', {
													'class':	settings.thumbClass
												})
												.appendTo(card);
										}
										
										// Data pointer
										card.data(J.OBJ, item);
										
										if (isLbable) {
											card.addClass(settings.lbableClass);
										}
										
										// Creating structure
										
										// Finding/creating image
										img = image.find('img').eq(0);
										if (!img.length) {
											img = $('<img>', {
													alt:		album.getAlt(item)
												}).appendTo(image);
										}
										
										if (item[J.THUMB].hasOwnProperty(J.RENDITIONS)) {
											// Has renditions, wait if larger image is needed
											img.data('hasrenditions', true);
										} else {
											// Removing preload class upon img is loaded
											img.on('load.' + ns, function() {
													$(this).parents('.' + settings.cardClass).removeClass(settings.preloadClass);
												});
										}
										
										// Onload event
										img.addClass(settings.hideImageClass)
											.on('load.' + ns, function() {
													$(this).addClass(settings.showImageClass)
														.removeClass(settings.hideImageClass);
												});
											
										// Cached image?
										if (img[0].complete) {
											img.trigger('load');
										}
										
										// Adding width, height
										if (isIcon) {
											image.addClass('iconthumb');
										} else {
											img.attr({
													width:		item[J.THUMB][J.WIDTH],
													height:		item[J.THUMB][J.HEIGHT]
												});
											
											// Adding pano class
											if ((item[J.THUMB][J.HEIGHT] / item[J.THUMB][J.WIDTH]) < 0.5) {
												card.addClass(settings.panoClass);
											}
											
										}
										
										// Masonry: adding width
										if (settings.thumbLayout === 'horizontal') {
											card.css({
													flexBasis:		Math.round(item[J.THUMB][J.WIDTH] * 0.9)
												});
										}
										
										// Icon thuumbnail?
										if (isIcon) {
											image.addClass('iconthumb');
										}
										
										// Save image name: for later
										if (!image.data('name')) {
											image.attr('data-name', album.getItemName(item));
										}
									
										// Click event
										if (!isFolder) {
											image.on('click.' + ns, imageClicked);
										}
										
										// Caption
										if (s) {
			
											caption = card.children('.' + settings.captionClass);
											
											if (!caption.length) {
												// No caption yet
												caption = $('<div>', {
														'class': 	settings.captionClass,
														html: 		s
													}).appendTo(card);
											}
											
											card.addClass(settings.hascaptionClass);
										}
												
										// Preparing for Lightbox
										if (isLbable) {
												
											// Set href
											if (!image.data('href')) {
												image.attr('data-href', img.attr('src') || album.getOptimalImagePath(item, [ img.outerWidth(), img.outerHeight() ]));
											}
											
											// Removing link (to avoid unwanted navigation)
											// Links are included to help robots finding the slide images
											if (image[0].hasAttribute('href')) {
												image.attr('href', '');
											}
											
											if (shopRoot.length && album.hasShop(item) || feedbackRoot.length && settings.feedback) {
												// Select box
												card.addClass(settings.selectableClass);
												
												if (shopRoot.length) {
													d = $('<a>', {
																'class': 	'icon-shopping-cart add-cart',
																text: 		' ' + text.addCart
															})
														.on('click.' + ns, function(e) {
																var card = $(e.target).closest('.' + settings.cardClass);
																if (card.length) {
																	shopRoot.trigger('addItems', card.data(J.OBJ));
																}
																return false;
															})
														.appendTo(image);
														
													d.addTooltip(album.getPriceRange(item));
												}
											}
											
											if (!baseSet && settings.linkToFolder) {
												// Folder link
												var p = album.getPath(item);
												
												if (p) {
													image.append($('<a>', {
															'class': 	'icon-folder folder-link',
															href:		 p + settings.indexName
														}));
												}
											}
											/*
											if (baseSet) {
												image.attr('href', '#img=' + item[J.PATH]);
											}
											*/
										} else {
											// Not lightboxable, e.g. webLocation or folder: using the link
											card.addClass(item[J.CATEGORY]);
											image.attr('href', album.getItemPath(item));
										}
										
										// Mark new images
										if (cd != null) {
											
											d = item[J.DATES];
											
											if (d && (d = d[settings.markNew.reference]) && d >= cd) {
												s = settings.markNew.text?
													$('<span>', {
															'class':	'new-image',
															text:		settings.markNew.text
														})
													:
													$('<span>', {
														'class':	'icon-new-fill new-image'
														});
												
												image.append(s);
													
												if (!TOUCHENABLED) {
													s.data('tooltip', (new Date(d * 1000)).toLocaleDateString(LOCALE)).addTooltip();
												}
											}
										}
										
										// Rating
										if (settings.useRating && isLbable) {
											
											var r = item[J.RATING] || 0;
											
											if (settings.visitorRating || r) {
												
												s = $('<span>', {
														'class':	'rating',
														html:		STARS
													})
													.appendTo(image);
													
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
																	r = Math.minMax(0, Math.floor((getCoords(e).x - el.offset().left - parseFloat(el.css('paddingLeft'))) / 16), 5),
																	item = el.closest('.' + settings.cardClass).data(J.OBJ); 
																	//Math.minMax(0, Math.floor((getCoords(e).x - el.offset().left + 4) / el.width()) * 5, 5);
																	
																el.removeClass('r0 r1 r2 r3 r4 r5').addClass('r' + r);
																item[J.VISITORRATING] = r;
																
																if (!baseSet) {
																	// Propagate to base overlay
																	el = getCardByName(item[J.NAME], true);
																	el.find('.rating')
																		.removeClass('r0 r1 r2 r3 r4 r5')
																		.addClass('r' + r);
																}
																
																return false;
															});
												} else {
													// Unalterable rating from jAlbum
													s.addClass('r' + r);
												}
											}
										}
										
										// Prevent copy
										if (settings.rightClickProtect) {
											image.on('contextmenu', function(e) {
													e.preventDefault()
													return false;
												});
										}
									}
									
									lazyloadTimeout = setTimeout(function() {
											
											lazyloadThumbs();
											
										}, settings.scrollCheckInterval / 2);
	
								},
											
							// Loading visible thumbs
							
							lazyloadThumbs = function() {
								
									if (getLightbox().is(':visible')) {
										return;
									}
									
									clearTimeout(lazyloadTimeout);
									lazyloadTimeout = null;
										
									var st = $window.scrollTop(),
										wh = $window.height();
									
									if (Math.abs(st - scrollTop) > 20) {
										// Scrolling in progress
										scrollTop = st;
										lazyloadTimeout = setTimeout(lazyloadThumbs, settings.scrollCheckInterval);
										return;
									}
									
									// Lazyload images
									var cards = getCards('.' + settings.lazyloadClass).not(':empty');
									
									// Adding preloaded images with too small thumbs and having renditions
									cards = cards.add(getCards('.' + settings.preloadClass).not(':empty').not('.icon').filter(function() {
											var thumb = $(this).find('.' + settings.thumbClass), 
												img = thumb.find('img').eq(0);
												
											if (img.data('hasrenditions') && (img[0].width * 1.05 < thumb.width() || img[0].height * 1.05 < thumb.height())) {
												return true;
											}
											
											$(this).removeClass(settings.preloadClass);
											return false;
										}));
									
									if (cards.length) {
									
										cards.each(function() {
												var card = $(this),
													ct = card.offset().top,
													ch = card.height();
													
												if ((ct + ch) > (scrollTop - wh)) {
													
													if (ct < (scrollTop + 2 * wh)) {
														// 2 screens ahead
														loadThumb(card);
													} else {
														return false;
													}
												}
											});
									
										// perpetrating lazyload
										scrollTop = st;
										lazyloadTimeout = setTimeout(lazyloadThumbs, settings.scrollCheckInterval);
										
									} else {
										// No more left
										$window.off('scroll.' + ns);
									}
								},
						
							// Clicked image
							
							imageClicked = function(e) {
									if (e.target.nodeName === 'A' && ($(e.target).closest('.' + settings.commentClass).length || $(e.target).hasClass('folder-link'))) {
										// Link in comment or link to folder
										return true;
									}
									
									lightboxLoad($(e.target).closest('.' + settings.cardClass));
									
									return false;
								},
							
							// Adding one thumb
							
							loadThumb = function(card) {
									
									if (card.length) {
										var thumb = card.children('.' + settings.thumbClass).eq(0),
											img = thumb.children('img');
											
										if (!img.length) {
											// Create IMG element is missing
											thumb.append($('<img>', {
													'class': 	settings.hideImageClass
												}));
										}
										
										if (card.hasClass(settings.lazyloadClass) && typeof img.attr('src') !== UNDEF && img.attr('src') !== false) {
											// IMG already has source and lazyloaded
											thumb.addClass(settings.showImageClass).removeClass(settings.hideImageClass);
										} else {
											// Need to load because either missing or low res.
											if (card.hasClass(settings.lazyloadClass)) {
												// Show animation only for lazyloaded images
												img.one('load', function() {
														// Showing image on load
														$(this).addClass(settings.showImageClass).removeClass(settings.hideImageClass);
													});
											}
											// Set source
											img.attr('src', album.getOptimalThumbPath(card.data(J.OBJ), [ thumb.outerWidth(), thumb.outerHeight() ]));
										}
										
										// Remove classes
										card.removeClass(settings.lazyloadClass + ' ' + settings.preloadClass);
									}
								},
						
							// Marking active card (el is DOM element)
						
							setActiveCard = function(el) {
								
									if (el) {
										var card		= $(el),
											item 		= card.data(J.OBJ),
											wh 			= $window.height(),
											scrollTop 	= $window.scrollTop(),
											ct 			= card.offset().top,
											ch 			= card.outerHeight();
										
										getCards('.' + settings.activeClass).removeClass(settings.activeClass);
										card.addClass(settings.activeClass);
										
										// Triggering active placemark
										if (settings.hasOwnProperty('map')) {
											if (album.hasLocation(item)) {
												getMapRoot().trigger('setActive', item[J.NAME]);
											} else {
												getMapRoot().trigger('resetMarkers');
											}
										}
										
										// Moving into view
										if (ct + ch > scrollTop + wh) {
											$('html, body').stop(true, false).animate({
													scrollTop: 		Math.round(ct - wh + ch + 30) + 'px'
												});
										} else if (ct < scrollTop) {
											$('html, body').stop(true, false).animate({
													scrollTop: 		Math.round(Math.max(ct - 30, 0)) + 'px'
												});
										}
									}
								},
								
							// Refreshing the rating
							
							refreshRating = function(e, el, rating) {
								
									if (el) {
										var card	= $(el),
											o 		= card.data(J.OBJ),
											r 		= ((typeof rating !== UNDEF)? 
															rating 
															: 
															(settings.visitorRating? o[J.VISITORRATING] : o[J.RATING])
														) || 0;
											
										card.find('.rating')
											.removeClass('r0 r1 r2 r3 r4 r5')
											.addClass('r' + r);
											
										if (!baseSet) {
											getCardByName(o[J.NAME], true).find('.rating')
												.removeClass('r0 r1 r2 r3 r4 r5')
												.addClass('r' + r);
										}
									}
									
								};
						
						// Creating new Unique ID if not yet exists
						if (!ns) {
							ns = 'base';
						}
							
						initImages();
								
						// Moving the active element into view
						overlay.on({
								setactivecard:		function(e, card) {
															setActiveCard(card);
														},
						
								refreshRating:		refreshRating,
								
								lazyload:			lazyloadThumbs
							});
						
						// Done function
						if (typeof complete === FUNCTION) {
							if (typeof baseSet !== UNDEF) {
								complete.call(undefined, overlay, baseSet);
							} else {
								complete.call(undefined, overlay);
							}
						}
						
						return this;
					};
		
		
			var	
				/********************************************************
				 *
				 *					Preparing images
				 *
				 ********************************************************/
					
				prepareImages = function(overlay, baseSet) {
					
						if (!album) {
							return;
						}
						
						var cards = getCards();
							
						if (cards.length > 1) {
							
							// Filtering and sort only if there are at least 2 items
							
							if ($('.filter-cont').length) {
								// Initializing Filters / Sort
								prepareFilterBox(baseSet);
							}
							
						}
						
						if (!cards.filter('.' + settings.lbableClass).length) {
							
							$('.' + settings.startshowClass).fadeOut();
							
						} else {
							
							if (album.hasShop() || settings.feedback) {
								
								var ci = cards.filter('.' + settings.selectableClass);
								
								//toggleSelectButtons(0, ci.length);
								
								if (ci.length) {
									// Make items selectable
									overlay.selectable({
											cardClass:			settings.selectableClass,
											selectedClass:		settings.selectedClass,
											selectionChange:	function() {
																		//toggleSelectButtons(this, ci.length); 
																		shopRoot.add(feedbackRoot).trigger('itemsSelected', this);
																	}
										});
									
									
									shopBox.add(feedbackBox)
										.find('.' + settings.keepSelectedClass).on('click.' + ns, function() {
											keepSelectedItems(text.selectedItems, function() {
													removeParam();
													updateShares();
												});
											
											return false;
										});
										
									// Initialized
									content.find('[data-sticky-rel]').trigger('stickyRefresh');
									// Uninited
									content.find('[data-sticky]').not('[data-sticky-rel]').sticky();
									
								}
							}
						
							// Initializing map
							
							if (settings.hasOwnProperty('map')) {
								
								// Pass defaults to lightbox
								if (settings.map.hasOwnProperty('apiKey')) {
									$.fn.lightbox.defaults.mapApiKey = settings.map.apiKey;
								}
							
								if (settings.map.hasOwnProperty('type')) {
									$.fn.lightbox.defaults.mapType = settings.map.type;
								}
							
								if (settings.map.hasOwnProperty('zoom')) {
									$.fn.lightbox.defaults.mapZoom = settings.map.zoom;
								}

								if (settings.map['index']) {
									prepareMap(getAllItems(), settings.map);
								}
							}
							
							/* Waiting for Derek's answer
							if (!LOCAL && typeof FOTOMOTO !== UNDEF && settings.fotomoto) {
								FOTOMOTO.API.checkinImages(getFotomotoImages(cards), function(images) {
										
									});
							}
							*/
							
							overlay.trigger('lightboxRemove');
							
							overlay.lightbox(album, {
									
									baseSet:		(typeof baseSet === UNDEF)? false : baseSet,
									
									onLoadStart:	function(card) {
															var item = card.data(J.OBJ);
															if (item) {
																addParam(settings.pageName || settings.indexName, {
																		img: 		album.getItemName(item)
																	}, item[J.TITLE]);
															}						
														},
														
									onLoadEnd: 		function(card) {
															overlay.trigger('setactivecard', card);
															setTimeout(updateShares, 100);
														},
													
									onClose:		function() {
															removeParam(settings.pageName || settings.indexName, 'img');
															//updateShares();
															overlay.trigger('lazyload');
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
																				newimages:		null,
																				date:			null
																			}, text.label + ': ' + param.label);
																	});
																} else if (param.hasOwnProperty('search')) {
																	// Search
																	getItemsBySearch(param.search, function() {
																		addParam(settings.indexName, {
																				search:			param.search,
																				label:			null,
																				newimages: 		null,
																				date:			null
																			}, text.search + ': ' + param.search);
																	});
																} else if (param.hasOwnProperty('newimages')) {
																	// Search new images
																	getItemsByDate(getSearchNewOptions(param.newimages), function() {
																		addParam(settings.indexName, {
																				newimages:		param.newimages,
																				search:			null,
																				label:			null,
																				date:			null
																			}, text.searchNew + ': ' + param.newimages);
																	});
																} else if (param.hasOwnProperty('date')) {
																	var options = getDateRangeOptions(param.date);
																	// Search images in date range
																	getItemsByDate(options, function() {
																		addParam(settings.indexName, {
																				date:			param.date,
																				newimages:		null,
																				search:			null,
																				label:			null
																			}, getDateReference(options.reference) + ': ' + param.date);
																	});
																} else if (param.hasOwnProperty('img')) {
																	var card = getCardByName(param.img);
																	if (card.length) {
																		if (param.hasOwnProperty('slideshow')) {
																			lightboxLoad(card, 2000);
																		} else {
																			lightboxLoad(card);
																		}
																	} else {
																		removeParam(settings.pageName || settings.indexName, 'img');
																	}
																} else if (param.hasOwnProperty('slideshow')) {
																	lightboxLoad(0, 2000);
																}
															}
															
															$('.' + settings.startshowClass).fadeIn().on('click', function() {
																	$(this).trigger('removeTooltip');
																	startSlideshow();
																	return false;
																});
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
											label:			param.label
										}, text.label + ': ' + param.label);
									updateShares();
								});
						} else if (param.hasOwnProperty('search')) {
							// Search
							getItemsBySearch(param.search, function() {
									setParam(settings.indexName, {
											search:			param.search
										}, text.search + ': ' + param.search);
									updateShares();
								});
						} else if (param.hasOwnProperty('newimages')) {
							// New images
							getItemsByDate(getSearchNewOptions(param.newimages), function() {
									setParam(settings.indexName, {
											newimages: 	param.newimages
										}, text.newImages + ': ' + param.newimages);
									updateShares();	
								});
						} else if (param.hasOwnProperty('date')) {
							// Date range
							var options = getDateRangeOptions(param.date);
							getItemsByDate(options, function() {
									setParam(settings.indexName, {
											date: 		param.date
										}, getDateReference(options.reference) + ': ' + param.date);
									updateShares();	
								});
						} else if (param.hasOwnProperty('img')) {
							// Image (no search or label)
							var card = getCardByName(param.img);
							if (card.length) {
								if (param.hasOwnProperty('slideshow')) {
									lightboxLoad(card, 2000);
								} else {
									lightboxLoad(card);
								}
							} else {
								removeParam(settings.indexName, 'img');
							}
						} else if (param.hasOwnProperty('slideshow')) {
							lightboxLoad(0, 2000);
						} else {
							// Plain index page
							lightboxQuit()
							removeOverlay();
						}
						
					},
				
				// Starts slideshow
				
				startSlideshow = function(e) {
						var card = $();
						
						if (!settings.restartSlideshow) {
							card = getCards('.' + settings.activeClass);
						}
						
						if (!card.length) {
							// Fall back to first
							card = getCards().eq(0);
						}
					
						if (settings.slideshowFullscreen) {
							requestFullscreen(function() {
									getLightbox().addClass('fullscreen');
								});
						}
						
						lightboxLoad(card, 2000);
						
						return false;
					},
					
				/********************************************************
				 *
				 *		Functionalities that results in new overlay
				 *
				 ********************************************************/
				
				/********************************************************
				 *
				 *				Keeping only selected items
				 *
				 ********************************************************/
				
				keepSelectedItems = function(tx, ready) {
						var items = getSelectedItems();
						
						if (!items.length || items.length === getCards('.' + settings.lbableClass).length) {
							return;
						}
						
						var oly = addOverlay({
									className:	'selected-items',
									icon:		'icon-checkbox-checked',
									title:		'&ldquo;' + tx + '&rdquo;'
								});
							
						appendToOverlayTitle($('<small>', {
								text: 		text.foundNTimes.replace('{0}', items.length)
							}));
						
						focusOverlay();
						
						setTimeout(function() {
							
								oly.renderImages(items, prepareImages);
								
								if (typeof ready === FUNCTION) {
									ready.call();
								}
								
							}, 50);
					},
				
				/********************************************************
				 *
				 *					Search and tag search
				 *
				 ********************************************************/
				 
				// Executing Search
				
				getItemsBySearch = function(tx, ready) {
						var oly = addOverlay({
									className:	'search-results',
									icon:		'icon-search',
									title:		'&ldquo;' + tx + '&rdquo;'
								});
							
						appendProgressbar();
						
						focusOverlay();
						
						album.collectItems($.extend(settings.search, {
								exact:		false,
								terms:		tx,
								types:		'-folder',
								ready:		function() {
													
													appendToOverlayTitle($('<small>', {
															text: 	this.length? text.foundNTimes.replace('{0}', this.length) : text.notFound
														}));
													
													oly.renderImages(this, prepareImages);
													
													removeProgressbar();
													
													if (typeof ready === FUNCTION) {
														ready.call();
													}
												}
							}));
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
							
						f.find('.search-btn').on('click', function() {
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
						
						f.find('input').on('focus',	function() { 
								f.addClass(settings.activeClass); 
							});
					},
				
				/********************************************************
				 *
				 *						Tag cloud
				 *
				 ********************************************************/
				
				// Preparing Tag Search functionality
				
				prepareTagSearch = function(target) {
						var f = target.find('.' + settings.tagSearchClass),
							// Start tag search		
							startSearch = function(f) {
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
						
						if (!f.length) {
							f = $('<form>', {
									'class': 		settings.tagSearchClass
								}).appendTo(target);
							
							f.append($('<div>', {
									'class':		'search-input'
								})
								.append($('<input>', {
									'type':			'text',
									placeholder:	text.searchBoxTip,
									ariaLabel:		text.search
								})));
								
							f.append($('<a>', {
									'class':		'search-btn icon-search'
								}));
						}
						
						f.find('.search-btn').on('click', function() {
								var f = $(this).closest('form');
								f.find('input').eq(0).focus();
								startSearch(f);
								return false;
							});
						
						f.on('submit', function(e) {
								e.preventDefault();
								startSearch($(this));
								return false;
							});
						
					},
				
				// Search labels
			
				getItemsByLabel = function(tx, caseSensitive, ready) {
						var oly = addOverlay({
									className:		'tags-found',
									icon:			'icon-tag',
									title:			'&ldquo;' + tx + '&rdquo;'
								});
							
						appendProgressbar();
						
						focusOverlay();
						
						if (typeof caseSensitive === UNDEF) {
							caseSensitive = false;
						} else if (typeof caseSensitive === FUNCTION) {
							ready = caseSensitive;
							caseSensitive = false;
						}
						
						album.collectItems($.extend(settings.tagCloud, {
								exact:			settings.exactFields,
								caseSensitive:	caseSensitive,
								terms:			tx,
								ready: 			function() {
									
														appendToOverlayTitle($('<small>', {
																text: 	this.length? text.foundNTimes.replace('{0}', this.length) : text.notFound
															}));
														
														oly.renderImages(this, prepareImages);
														
														removeProgressbar();
														
														if (typeof ready === FUNCTION) {
															ready.call();
														}
													}
							}));
					},
					
				// Collect items from a path array
				
				getItemsByPaths = function(tx, paths, ready) {
						var oly = addOverlay({
									className:	'tags-found',
									icon:		'icon-tag',
									title:		'&ldquo;' + tx + '&rdquo;'
								});
							
						appendProgressbar();
						
						focusOverlay();
						
						album.collectByPath({
								paths:		paths,
								ready:		function() {
									
														appendToOverlayTitle($('<small>', {
																text: 		this.length? text.foundNTimes.replace('{0}', this.length) : text.notFound
															}));
														
														oly.renderImages(this, prepareImages);
														
														removeProgressbar();
														
														if (typeof ready === FUNCTION) {
															ready.call();
														}
													}
							});
					},
					
				// Add toggle button
				
				addToggleButton = function(t) {
						var	btn;

						t.css({
								maxHeight: 	150,
								overflow: 	'hidden'
							});
						
						btn = $('<div>', {
								'class': 	'toggle-height'
							}).insertAfter(t);
						
						btn.append($('<a>', {
								'class': 	'icon-caret-down',
								text: 		text.more
							})
							.on('click', function() {
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
												btn.addClass(settings.activeClass);
											};
									
									b.css({
											height: 	b.height(),
											overflow: 	'hidden'
										});
									
									t.css({
											maxHeight: 	'none'
										});
									
									setTimeout(toggleHeight, 50);
								
								}
						))
						.append($('<a>', {
								'class': 	'icon-caret-up',
								text: 		text.less
							}).on('click', function() {
								t.css({
										maxHeight: 	150
									});
								btn.removeClass(settings.activeClass);
							}));
					
					},
				
				// Collecting and displaying tags
			
				prepareTagCloud = function(tags) {
					
						var tc = $(settings.tagCloud['hook'] || '.tag-cloud-cont');
						
						if (!tc.length) {
							return;
						}
						
						if (!tags.length) {
							// Nothing found
							tc.remove();
							return;
						}
						
						var t = tc.children('.' + settings.tagCloudClass),
							// Click function
							tagClicked = function() {
									var tx = $(this).children('span').eq(0).text();
									
									if (tx && tx.length > 1) {
										getItemsByPaths(tx, $(this).data('paths'), function() {
												setParam(settings.indexName, {
														label: 		tx
													}, text.label + ': ' + tx);
												updateShares();
											});
									}
									
									return false;
								};
						
						// Creating wrap el if not exists
						if (!t.length) {
							t = $('<div>', {
									'class':		settings.tagCloudClass
								}).appendTo(tc);
						}
							
						// Adding tags
						for (var a, r, cnt, i = 0, l = tags.length; i < l; i++) {
							
							// Creating link element
							a = $('<a>', {
										'class': 	'tag'
									})
								.on('click', tagClicked)
								.data('paths', tags[i][1])
								.append($('<span>', {
										html: 		tags[i][0]
									}));
							
							// Adding count
							if (tags[i][1].length > 1) {
								
								if (settings.tagCloud.fontVaries) {
									r = 0;
									cnt = Math.min(64, tags[i][1].length);
									// calculate weight
									while (cnt > 1) {
										r++;
										cnt = cnt >> 1;
									}
									a.addClass('size-' + r);
								}
								
								a.append('&nbsp;').append($('<sup>', {
									text: 		tags[i][1].length
								}));
							}
							
							t.append(a);
						}
						
						// Adding toggle button if list is too high
						if (t.outerHeight() > 175) {
							addToggleButton(t);
						}
						
						// Adding search box
						if (settings.tagCloud['useSearch']) {
							prepareTagSearch(tc.parent());
						}
						
					},
				
				/********************************************************
				 *
				 *						Search new images
				 *
				 ********************************************************/
				
				getSearchNewOptions = function(days) {
					
						return settings.hasOwnProperty('searchNew')?
							{
								reference:		settings.searchNew['reference'] || 'dateTaken',
								depth:			settings.searchNew['depth'] || 'subfolders',
								start:			nows / ONEDAY_S - days
							}
							:
							{
								reference:		'dateTaken',
								depth:			'subfolders',
								start:			nows / ONEDAY_S - days
							};
						
					},
				
				// Search for new images
				
				getDateRangeOptions = function(range) {
						var m = range.match(/^([amt])?([cts])?\:?(\d+)\-?(\d+)?/i),
							o = {
									range:		0,
									reference:	'dateTaken',
									depth:		'current'
								};
								
						if (m) {
							if (m[1]) {
								// Reference
								if (m[1] === 'a') {
									o.added = 'added';
								} else if (m[1] === 'm') {
									o.added = 'fileModified';
								} else if (m[1] === 't') {
									o.added = 'dateTaken';
								}
							}
							
							if (m[2]) {
								// Depth
								if (m[2] === 'c') {
									o.depth = 'current';
								} else if (m[2] === 't') {
									o.depth = 'tree';
								} else if (m[2] === 's') {
									o.depth = 'subfolders';
								}
							}
							
							if (m[4]) {
								// Range
								o.start = parseInt(m[3]) || 0;
								o.end = parseInt(m[4]);
							} else if (m[3]) {
								// Single day
								o.start = parseInt(m[3]);
								o.range = 1;
							}
						}
						
						return o;
					},
				
				getDateReference = function(r) {
					
						if (r === 'dateTaken') { 
							return text.imagesTaken;
						} else if (r === 'fileModified') {
							return text.imagesModified;
						}
						
						return text.imagesAdded;
					},
					
				getDateRangeTitle = function(o) {
						var t1 = getDateReference(o['reference']),
							t2,
							start,
							end,  
							today = Math.floor(new Date() / ONEDAY_MS),
							date = function(d) {
									return new Date(d * ONEDAY_MS).toLocaleDateString(LOCALE);
								};
						
						if (!o.hasOwnProperty('end') && !o.hasOwnProperty('start')) {
							t2 = getTimespan(o.range);
						} else if (!o.hasOwnProperty('end')) {
							if (o.hasOwnProperty('start')) {
								if (o.hasOwnProperty('range')) {
									if (o['range'] > 1) {
										t2 = text.betweenDays.template(date(o.start), date(o.start + o.range));
									} else {
										t2 = text.onDay.template(date(o.start));
									}
								} else {
									t2 = getTimespan(nows / ONEDAY_S - o.start);
									//t2 = text.afterDay.template(date(o.start));
								}
							}
						} else {
							t2 = text.beforeDay.template(date(o.end));
						}	
						
						return t1 + ' ' + t2;
					},
				
				getItemsByDate = function(options, ready) {
						var oly = addOverlay({
									className:		'search-results',
									icon:			'icon-calendar',
									title:			getDateRangeTitle(options)
								});
						
						appendProgressbar();
						
						focusOverlay();

						album.collectByDate($.extend(options, {
									ready:		function() {
													
														appendToOverlayTitle($('<small>', {
																text: 	this.length? text.foundNTimes.replace('{0}', this.length) : text.notFound
															}));
														
														oly.renderImages(this, prepareImages);
														
														removeProgressbar();
														
														if (typeof ready === FUNCTION) {
															ready.call();
														}
													}
							}));
					},
				
				// Search date range
				
				searchDateRange = function(range) {
					
						if (range) {
							var options = getDateRangeOptions(range);
							
							getItemsByDate(options, function() {
									setParam(settings.indexName, {
											date:		range
										}, getDateRangeTitle(options));
									updateShares();
								});
						}
						
						return false;
					},
				
				// Search new images
				
				searchNew = function(days) {
						
						if (days) {
							
							getItemsByDate($.extend(settings.searchNew, { 
									start: 		nows / ONEDAY_S - days 
								}), function() {
									setParam(settings.indexName, {
											newimages:		days
										}, getDateReference(settings.searchNew['reference']));
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
								text: 	getDateReference(settings.searchNew.reference)
							}));
								
						f = $('<div>', {
								'class':	'buttons'
							}).appendTo(f);
						
						for (var i = 0; i < days.length; i++) {
							f.append($('<a>', {
									'class': 	'small button',
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
										'class': 	'small button',
										text: 		text.sinceMyLastVisit
									})
									.on('click', function() {
											searchNew((now - start) / ONEDAY_S);
										}));
							}
							
							// Storing last visit date for 10 years
							$.cookie('lastVisit', now, 315360000);
						}
						
					},
								
				/********************************************************
				 *
				 *					Filtering & Sort
				 *
				 ********************************************************/
				
				// Dates are objects
				
				getDate = function(item, name) {
						if (item.hasOwnProperty(J.DATES)) {
							if (name === 'addedDate') {
								return item[J.DATES]['added'];
							} else if (name === 'originalDate') {
								return item[J.DATES]['dateTaken'];
							} else {
								return item[J.DATES]['fileModified'];
							}
						}
						
						return null;
					},
					
				// Some variables get remapped by the skin
				
				getMappedVal = function(item, name) {
					
						if (item.hasOwnProperty(name)) {
							// Generic case
							return item[name];
						}
						
						return null;
					},
					
				// Do filtering on current folder
				
				doFilter = function(e, ready) {
						var form = $(e.target).closest('form'),
							items = getAllItems(),
							cnt = items.length,
							tx = [];
						
						form.find('select:visible,input[type=range],input[type=date]').each(function() {
								var name = this.name,
									label = form.find('label[for=' + name + ']').text(),
									type = $(this).data('type'),
									value = $(this).val(),
									display = function(val) {
											if (name ===  'rating') {
												return Math.round(val);
											} else if (name === 'fileSize') {
												return niceByte(val);
											} else if (type === 'date') {
												return (new Date(val * 1000)).toLocaleDateString(LOCALE);
											} else if (type === 'numeric') {
												if ($(this).data('unit') === 'seconds') {
													return niceTime(val);
												} else if ($(this).data('unit') === 'byte') {
													return niceByte(val);
												} else if (val >= 10) {
													return Math.round(val);
												} else if (val >= 1) {
													return val.toFixed(1);
												} else if (val >= 0.1) {
													return val.toFixed(2);
												}
												return val;
											}
											return toCurrency(val, currency);
										};
									
								if (type === 'numeric' || type === 'date' || type === 'financial') {
										
									var low = $(this).data('low'),
										high = $(this).data('high');
										
									if (low > this.min || high < this.max) {
										// Only if the range is narrower than the whole range
										
										if (name.endsWith('Date')) {
											// Date
											for (var i = items.length - 1, val; i >= 0; i--) {
												if ((val = getDate(items[i], name)) !== null && 
													(val >= low && val <= high)) {
													continue;
												}
												items.splice(i, 1);
											}
										} else if (JCAMERAFIELDS.indexOf(name) !== -1) {
											// Camera data fields
											if (name === 'exposureTime') {
												for (var i = items.length - 1, val; i >= 0; i--) {
													if (items[i].hasOwnProperty(J.CAMERA) &&
														items[i][J.CAMERA].hasOwnProperty(name) &&
														(val = getExposure(items[i][J.CAMERA][name])) &&
														(val >= low && val <= high)) {
														continue;
													}
													items.splice(i, 1);
												}
											} else if (name.startsWith('focalLength')) {
												for (var i = items.length - 1, val; i >= 0; i--) {
													if (items[i].hasOwnProperty(J.CAMERA) &&
														items[i][J.CAMERA].hasOwnProperty(name) &&
														!isNaN(val = parseInt(items[i][J.CAMERA][name])) && 
														(val >= low && val <= high)) {
														continue;
													}
													items.splice(i, 1);
												}
											} else {
												for (var i = items.length - 1, val; i >= 0; i--) {
													if (items[i].hasOwnProperty(J.CAMERA) &&
														items[i][J.CAMERA].hasOwnProperty(name) &&
														(val = items[i][J.CAMERA][name]) !== null &&
														(val >= low && val <= high)) {
														continue;
													}
													items.splice(i, 1);
												}
											}
										} else if (name === 'rating') {
											// Rating
											for (var i = items.length - 1, val, r = settings.visitorRating? J.VISITORRATING : J.RATING; i >= 0; i--) {
												val = items[i][r] || 0;
												if (val >= low && val <= high) {
													continue;
												}
												items.splice(i, 1);
											}
										} else {
											// Generic
											for (var i = items.length - 1, val; i >= 0; i--) {
												if ((val = items[i][name]) !== null && 
													(val >= low && val <= high)) {
													continue;
												}
												items.splice(i, 1);
											}
										}
									
										tx.push(label + '=' + display(low) + '&ndash;' + display(high));
									}
									
								} else if (this.nodeName === 'SELECT' && value !== null && value.length) {
									
									// Only if at least one option is selected
																		
									if (!Array.isArray(value)) {
										value = [ value ];
									}
									
									if (JCAMERAFIELDS.indexOf(name) !== -1) {
										// Camera data :: no arrays expected
										for (var i = items.length - 1, val; i >= 0; i--) {
											if (items[i].hasOwnProperty(J.CAMERA) &&
												items[i][J.CAMERA].hasOwnProperty(name) &&
												(val = items[i][J.CAMERA][name]) !== null &&
												value.includes(val)) {
												continue;
											}
											items.splice(i, 1);
										}
										
									} else {
										// Generic case
										for (var i = items.length - 1, found, val; i >= 0; i--) {
											if (items[i].hasOwnProperty(name)) {
												val = items[i][name];
												if (Array.isArray(val)) {
													// Array e.g. keywords
													found = false;
													for (var j = 0; j < value.length; j++) {
														if (val.includes(value[j])) {
															//console.log(items[i]['name'] + ': ' + val);  
															found = true;
															break;
														}
													}
													if (found) {
														continue;
													}
												} else if (value.includes(val)) {
													continue;
												}
											}
											items.splice(i, 1);
										}
									}
									
									// Header text addition
									if (this['multiple']) {
										tx.push(name + '=[' + value.join(',') + ']');  
									} else {
										tx.push(label + '=' + value);  
									}
								}
							});
						
						if (items.length < cnt) {
							
							// Only show overlay if at least one thumb was filtered out
							
							var oly = addOverlay({
										className:	'filtered-items',
										icon:		'icon-filter',
										title:		text.results
									});
								
							appendProgressbar();
							
							focusOverlay();
							
							setTimeout(function() {
									
									appendToOverlayTitle($('<small>', {
											html: 		tx.join(', ') + ': ' + text.foundNTimes.replace('{0}', items.length)
										}));
									
									oly.on('overlayRemoved', resetBaseFilters);
									
									oly.renderImages(items, prepareImages);
									
									removeProgressbar();
									
									if (typeof ready === FUNCTION) {
										ready.call();
									}
									
								}, 50);
						}
						
						return false;
					},
				
				// Do sorting on current set of thumbs
				
				doSort = function(e, ready) {
						var el = this.selectedOptions[0],
							name = this.value;
						
						if (!el || !name) {
							return true;
						}
						
						var items = getAllItems(),
							cnt = items.length,
							data = $(el).data('sort'),
							type = data['type'],
							asc = data['ascending'],
							tx = [],
							v1,
							v2;
							
						if (type === 'numeric' || type === 'financial' || type === 'date') {
							// Number
							
							if (name.endsWith('Date')) {
								// Date
								items = items.sort(function(i1, i2) {
										v1 = getDate(i1, name);
										v2 = getDate(i2, name);
										return asc? (v1 || 0) - (v2 || 0)
													:
													(v2 || 0) - (v1 || 0);
									});
								
							} else if (JCAMERAFIELDS.indexOf(name) !== -1) {
								// Camera data
								if (name === 'exposureTime') {
									items = items.sort(function(i1, i2) {
											v1 = (i1.hasOwnProperty(J.CAMERA) && i1[J.CAMERA].hasOwnProperty(name))? 
													i1[J.CAMERA][name] : 0;
											v2 = (i2.hasOwnProperty(J.CAMERA) && i2[J.CAMERA].hasOwnProperty(name))? 
													i2[J.CAMERA][name] : 0;
											return asc? (getExposure(v1 || 0) - getExposure(v2 || 0)) 
														: 
														(getExposure(v2 || 0) - getExposure(v1 || 0));
										});
								} else {
									items = items.sort(function(i1, i2) {
											v1 = (i1.hasOwnProperty(J.CAMERA) && i1[J.CAMERA].hasOwnProperty(name))? 
													parseFloat(i1[J.CAMERA][name]) : 0;
											v2 = (i2.hasOwnProperty(J.CAMERA) && i2[J.CAMERA].hasOwnProperty(name))? 
													parseFloat(i2[J.CAMERA][name]) : 0;
											return asc? ((v1 || 0) - (v2 || 0)) 
														: 
														((v2 || 0) - (v1 || 0));
										});
								}
								
							} else if (name === 'rating') {
								// Rating
								var r = settings.visitorRating? J.VISITORRATING : J.RATING;
								items = items.sort(function(i1, i2) {
										return asc? (i1[r] || 0) - (i2[r] || 0)
													:
													(i2[r] || 0) - (i1[r] || 0);
									});
								
							} else {
								// Every other numeric
								items = items.sort(function(i1, i2) {
										if (i1.hasOwnProperty(name) && i2.hasOwnProperty(name)) {
											return asc?	parseFloat(i1[name]) - parseFloat(i2[name])
														:
														parseFloat(i2[name]) - parseFloat(i1[name]);
										}
										return asc? (i1.hasOwnProperty(name)? 1 : 0)
													:
													(i2.hasOwnProperty(name)? -1 : 0);
									});
							}
							
						} else {
							// String
							
							items = items.sort(function(i1, i2) {
								if (i1.hasOwnProperty(name) && i2.hasOwnProperty(name)) {
									return asc?	(i1[name] + '').localeCompare(i2[name] + '')
												:
												(i2[name] + '').localeCompare(i1[name] + '');
								}
								return asc? (i1.hasOwnProperty(name)? 1 : 0)
											:
											(i2.hasOwnProperty(name)? -1 : 0);
							});
							
						}
						
						var oly = addOverlay({
									className:	'sorted-items',
									icon:		'icon-ordering',
									title:		text.sortedBy + '<small>' + data.label + ' (' + text[data.ascending? 'ascending' : 'descending'] + ')</small>' 
								});
							
						appendProgressbar();
						
						setTimeout(function() {
								
								oly.renderImages(items, prepareImages);
								
								oly.on('overlayRemoved', resetBaseSort);
								
								removeProgressbar();
								
								if (typeof ready === FUNCTION) {
									ready.call();
								}
							
							}, 50);
						
						return false;
					},
					
				// Read filter ranges from current overlay
				
				getFilterRanges = function(items, filter) {
						
						if (!filter || !items.length) {
							return;
						}
						
						var setMinMax = function(f, val) {
									if (f.hasOwnProperty('min') && f.hasOwnProperty('min')) {
										if (f.min > val) {
											f.min = val;
										} else if (f.max < val) {
											f.max = val;
										}
									} else {
										f.min = f.max = val;
									}
								};
								
						for (var name in filter) {
							
							var f = filter[name], 
								type = f['type'];
							
							if (type === 'numeric' || type === 'date' || type === 'financial') {
								
								if (name.endsWith('Date')) {
									// Date
									for (var i = items.length - 1, val; i >= 0; i--) {
										if ((val = getDate(items[i], name)) !== null) {
											setMinMax(f, val);
										}
									}
								} else if (JCAMERAFIELDS.indexOf(name) !== -1) {
									// Camera data fields
									if (name === 'exposureTime') {
										for (var i = items.length - 1, val; i >= 0; i--) {
											if (items[i].hasOwnProperty(J.CAMERA) &&
												items[i][J.CAMERA].hasOwnProperty(name) &&
												(val = getExposure(items[i][J.CAMERA][name]))) {
												setMinMax(f, val);
											}
										}
									} else if (name.startsWith('focalLength')) {
										for (var i = items.length - 1, val; i >= 0; i--) {
											if (items[i].hasOwnProperty(J.CAMERA) &&
												items[i][J.CAMERA].hasOwnProperty(name) &&
												!isNaN(val = parseInt(items[i][J.CAMERA][name]))) {
												setMinMax(f, val);
											}
										}
									} else {
										for (var i = items.length - 1, val; i >= 0; i--) {
											if (items[i].hasOwnProperty(J.CAMERA) &&
												items[i][J.CAMERA].hasOwnProperty(name) &&
												(val = items[i][J.CAMERA][name]) !== null) {
												setMinMax(f, val);
											}
										}
									}
								} else if (name === 'rating') {
									// Rating
									for (var i = items.length - 1, val, r = settings.visitorRating? J.VISITORRATING : J.RATING; i >= 0; i--) {
										val = items[i][r] || 0;
										setMinMax(f, val);
									}
								} else {
									// Generic
									for (var i = items.length - 1, val; i >= 0; i--) {
										if ((val = items[i][name]) !== null) {
											setMinMax(f, val);
										}
									}
								}
								
							} else {
								// String
								if (!f.hasOwnProperty('values')) {
									f.values = [];
								}
								
								if (JCAMERAFIELDS.indexOf(name) !== -1) {
									// Camera data :: no arrays expected
									for (var i = 0, val; i < items.length; i++) {
										if (items[i].hasOwnProperty(J.CAMERA) &&
											items[i][J.CAMERA].hasOwnProperty(name)) {
											pushNew(f.values, (items[i][J.CAMERA][name] + '').trim());
										}
									}
								} else {
									for (var i = 0, val; i < items.length; i++) {
										if (items[i].hasOwnProperty(name)) {
											pushNew(f.values, items[i][name]);
										}
									}
								}
							}
						}
						
						return filter;
					},
					
				// Enabling / disabling the reset button
				
				enableResetBtn = function(e) {
						var form = (typeof e === UNDEF || e.hasOwnProperty('target'))? $(this).closest('form') : e;
						form.find('button[type=reset]').removeClass('disabled');
					},
					
				disableResetBtn = function(e) {
						var form = (typeof e === UNDEF || e.hasOwnProperty('target'))? $(this).closest('form') : e;
						form.find('button[type=reset]').addClass('disabled');
					},
					
				// Reseting filters to defaults
				
				_resetFilters = function(form) {
					
						form.find('select').each(function() {
								$(this).prop('selectedIndex', this['multiple']? -1 : 0);
							});
						
						form.find('input[type=range]').each(function() {
								$(this).trigger('resetRange');
							});
						
						disableResetBtn(form);
						
					},
					
				// Reset filters after a form elemnt changed
				
				resetFilters = function(e) {
						_resetFilters($(e.target).closest('form'));
						return false;
					},
					
				// Reseting base filters to defaults
				
				resetBaseFilters = function() {
						resetBaseSort();
						_resetFilters($('#filters form.filter'));
					},
					
				// Reseting base filters to defaults
				
				resetBaseSort = function() {
						$('#filters form.sort select').prop('selectedIndex', 0);
					},
					
				// Preparing filters / sort
				
				prepareFilterBox = function(baseSet) {
					
						var items = getAllItems(),
							filters = album.getPropertyObject(album.getCurrentFolder(), J.FILTERS, true),
							sort = album.getPropertyObject(album.getCurrentFolder(), J.SORT, true),
							filterSection = $('#filters');
							
						if ((!filters && !sort) || !items.length) {
							if (baseSet) {
								filterSection.hide();
							}
							
							return;
						}
						
						var	box = filterSection.find('.' + settings.boxClass),
							filterForm = box.find('form.filter'),
							sortForm = box.find('form.sort'),
							group,
							inp,
							lbl,
							type,
							buttons,
							btn;
							
						if (!baseSet) {
							// Preparing filtering on overlay
							
							box = $('<div>', {
									'class':		settings.contClass + ' ' + settings.boxClass + ' small-column',
									id:				'filters_' + getOverlayNS()
								}).appendTo(filterSection);
								
							box.append($('<h4>', {
									'class':		'icon-' + (filters? 'filter' : 'ordering'),
									text:			filterSection.find('h4').text()
								}));	
							
							if (filters) {
								
								filterForm = $('<form>', {
										'class':		'filter'
									}).appendTo(box);
							}
							
							if (sort) {
								sortForm = $('<form>', {
										'class':		'sort'
									}).appendTo(box);
							}
							
							// Attaching box to current overlay
							attachToOverlay(box);
							
						} else {
							
							box.addClass(settings.hideOnOverlayClass);
						}	
						
						buttons = $('<div>', {
								'class':	'buttons'
							}).appendTo(filterForm);
						
						if (filters) {
							
							// Getting filter range
							filters = getFilterRanges(items, filters);
							
							var m;
							
							for (var f in filters) {
								
								type = filters[f]['type'];
								
								group = $('<div>', {
										'class':		'group ' + ((type === 'multiple_string' || type === 'single_string')? 'select' : 'range') 
									}).insertBefore(buttons);
								
								if (filters[f]['label']) {
									lbl = $('<label>', {
											'for':			f,
											text:			filters[f]['label']
										}).appendTo(group);
								}
									
								if (type === 'multiple_string' || type === 'single_string') {
									
									if (f === 'rating') {
										filters[f].values = [ text.noRating, 1, 2, 3, 4, 5 ];
									}
									
									inp = $('<select>', {
											name:			f
										}).appendTo(group);
									
									if (type === 'multiple_string') {
										inp.attr('multiple', true);
										inp.addTooltip(text.multipleSelectHint);
									}
									
									if (!filters[f].hasOwnProperty('values') || !filters[f].values.length) { // || filters[f].values.length < 2) {
										
										group.remove();
										
									} else {
									
										if (type === 'single_string') {
											inp.prepend($('<option>', {
													text:			text.select,		// + ' ' + filters[f]['label'],
													disabled:		'',
													selected:		''
												}));
										}
										
										if (filters[f].values) {
											for (var i = 0; i < filters[f].values.length; i++) {
												inp.append($('<option>', {
														text:			filters[f].values[i]
													}));
											}
										}
										
										inp.on('change', enableResetBtn);
									}
									
								} else {
									
									inp = $('<input>', {
											name:		f,
											type:		'range'
										})
										.data('type', type)
										.prependTo(group);
									
									if (f === 'rating') {
										filters[f]['step'] = 1;
										filters[f]['min'] = 0;
										filters[f]['max'] = 5;
									}
									
									if (!filters[f].hasOwnProperty('min') || !filters[f].hasOwnProperty('max') || filters[f]['min'] === filters[f]['max']) {
										
										group.remove();
										
									} else {
										
										if (type === 'financial' && (m = filters[f]['label'].match(/\S+\s+[\(\[](\S+)[\)\]]/))) {
										
											filters[f]['currency'] = m[1];
										
										} else if (type === 'numeric') {
											
											if ('exposureTime.shutterSpeed'.indexOf(f) >= 0) {
												filters[f]['unit'] = 'seconds';
											} else if (f === 'fileSize') {
												filters[f]['unit'] = 'byte';
												filters[f]['step'] = 1;
											}
										}
										filters[f].onChanged = enableResetBtn;
										filters[f].onReseted = disableResetBtn;
										
										inp.rangeSlider(filters[f]);
									}
								}
									
								inp.attr('data-type', type || 'single_string');
							}
							
							// Adding buttons
							
							if ((inp = filterForm.find('input,select')).length) {
								
								filterForm.data('single', inp.length === 1 && inp[0].nodeName === 'SELECT' && !inp.attr('multiple'));
								
								if (!(baseSet && filterForm.data('single'))) {
									// Reset button
									btn = $('<button>', {
											type:			'reset',
											'class':		(baseSet? 'disabled secondary' : 'alert') + ' button',
											text:			' ' + text.reset
										}).appendTo(buttons);
									
										if (baseSet) {
											btn.on('click.' + ns, resetFilters);
										} else {
											btn.on('click.' + ns, function() {
													resetBaseFilters();
													removeOverlay();
												});
										}
								}
									
								if (filterForm.data('single')) {
									// Single combo box -> Update instantly on change
									
									inp.on('change.' + ns, doFilter);
									
								} else {
									// Multiple inputs or not single combo box -> Use 'Search' button
									btn = filterForm.find('button[type=submit]');
									
									if (!btn.length) {
										btn = $('<button>', {
												type:			'submit',
												'class':		'button',
												text:			' ' + text.search
											}).appendTo(buttons);
									}
									
									btn.on('click.' + ns, doFilter);
								}
								
								filterForm.on('submit.' + ns, doFilter);
							}
						}
						
						if (buttons.is(':empty')) {
							buttons.remove();
						}
						
						if (sort) {
														
							lbl = $('<label>', {
									'class':		'icon-ordering',
									'for':			'sortby',
									text:			' '
								}).appendTo(sortForm);
								
							inp = $('<select>', {
									'class':		'small',
									name:			'sortby'
								}).appendTo(sortForm);
							
							inp.prepend($('<option>', {
									text:			text.sortBy,
									disabled:		'',
									selected:		''
								}));
							
							for (var s in sort) {
								
								inp.append($('<option>', {
										html:			'&#8613; ' + sort[s].label,
										value:			s
									}).data('sort', {
										type:			sort[s].type,
										label:			sort[s].label,
										ascending:		true
									}));
								
								inp.append($('<option>', {
										html:			'&#8615; ' + sort[s].label,
										value:			s
									}).data('sort', {
										type:			sort[s].type,
										label:			sort[s].label,
										asc:			false
									}));
							}
						
							inp.on('change.' + ns, doSort);
						}
						
						if ((!sortForm.length || sortForm.is(':empty')) && (!filterForm.length || filterForm.is(':empty'))) {
							filterSection.hide();
						}
					},
				
				/********************************************************
				 *
				 *						Controls
				 *
				 ********************************************************/
				
				// Initializing ZIP download button
				
				initZip = function() {
				
						panels.find('.zip-cont a.button').each(function() {
								var btn = $(this);
								
								getFileSize(btn.attr('href'), function(size) {
										if (size) {
											btn.append('<span class="badge">' + niceByte(size) + '</span>');
										}
									});
							});
					},

				/********************************************************
				 *
				 *			Initialization of misc functions
				 *
				 ********************************************************/
										
				// Right click blocking
				
				avoidRightClick = function() {
						getThumbs().add(getFolders()).on('contextmenu', 'img', function(e) {
								e.preventDefault()
								return false;
							});
					},
					
				// Initializing background music
				
				prepareBackgroundMusic = function(player) {
					
						if (player.length) {
							player.audioPlayer({
									rootPath: 	settings.rootPath
								});
						}
					},
					
				// Updating the share buttons after a state change
				
				updateShares = function() {
					
						if (settings.hasOwnProperty('share') && !getLightbox().is(':visible')) {
							$(settings.share.hook).trigger('updateLinks');
						}	
					},
				
				// Initializing Social sharing
				
				prepareShares = function(opt) {
						
						$.fn.renderShares.defaults.buttonTheme = opt['buttonTheme'] || 'dark';
						$.fn.renderShares.defaults.indexName = settings.indexName;
						$.fn.renderShares.defaults.facebookAppId = opt['facebookAppId'] || '';
						
						if (opt.hasOwnProperty('callAction')) {
							$.fn.renderShares.defaults.callAction = opt.callAction;
						}
						
						$(opt['hook']).renderShares(opt);
						$.fn.lightbox.defaults.share = opt.sites;
						
						if (opt.hasOwnProperty('sites')) {
							$.fn.lightbox.defaults.shareHook = opt['hook'];
						}
					},
				
				// Preparing map
				
				prepareMap = function(images, settings) {
					
							var	markers,
								getMarkers = function(images) {
										// Reading out map locations
										var markers = [];
										
										for (var i = 0, l; i < images.length; i++) {
											l = album.getLocation(images[i]);
											if (l) {
												markers.push({
													title:		[((i + 1) + '.'), images[i]['title'], images[i]['comment']].filter(Boolean).join(' '),
													pos: 		l,
													link:		images[i].path
												});
											}
										}
										
										return markers;
									};
							
							markers = getMarkers(images);
							
							if (markers.length) {
								getMapRoot(true).addMap({
										apiKey:				settings['apiKey'],
										type:				settings['type'] || 'hybrid',
										zoom:				settings['zoom'] || 15,
										markers: 			markers,
										autoLoad:			true,
										fullscreenControl:	true,
										onMarkerClick:		function() {
																	if (this.hasOwnProperty('link')) {
																		var el = getCardByName(this.link);
																		if (el.length) {
																			if (isFullscreen()) {
																				exitFullscreen();
																			}
																			if (!getLightbox().is(':visible')) {
																				getOverlay().trigger('setactivecard', el);
																			}
																			lightboxLoad(el);
																		}
																	}
																}
									});
							}
					
					},
				
				// Preparing shopping cart
				
				prepareShoppingCart = function() {
					
						// assigning paypal.js defaults 
						$.fn.paypal.defaults.relPath = settings.relPath;
						$.fn.paypal.defaults.rootPath = settings.rootPath;
						
						// Initializing the cart
						currency = album.getCurrency();
						
						// Set rangeslider's default currency
						if ($.fn.hasOwnProperty('rangeSlider')) {
							$.fn.rangeSlider.defaults.currency = currency;
						}
						
						if (shopRoot.length) {
							// Calling Paypal module
							shopRoot.paypal(album, { 
									
									getSelected: 	function() {
															return getSelectedItems();
														},
														
									selectNone:		function() {
															getImageContainer().trigger('selectNone');
														},
														
									getCurrent:		function() {
															return getCurrentItem();
														}
									
								});
							
							// "Add selected" button
							shopRoot.find('.' + settings.addSelectedClass).on('click', function() {
									shopRoot.trigger('addItems', getSelectedItems());
									getImageContainer().trigger('selectNone');
									return false;
								});
							
							// Ensuring lightbox has 'shop' property
							if (!$.fn.lightbox.defaults.hasOwnProperty('shop')) {
								$.fn.lightbox.defaults.shop = {};
							}
							
							// Setting lightbox's shop root variable
							$.fn.lightbox.defaults.shop.root = shopRoot;
						}
					
					},
					
				// Preparing feedback
				
				prepareFeedback = function() {
					
						// assigning feedback.js defaults 
						$.fn.feedback.defaults.relPath = settings.relPath;
						$.fn.feedback.defaults.rootPath = settings.rootPath;
						
						// Initializing the feedback cart
						if (feedbackRoot.length) {
							
							// Get selected items
							settings.feedback['getSelected'] = function() {
									return getSelectedItems();
								};
								
							settings.feedback['selectNone'] = function() {
									getImageContainer().trigger('selectNone');
								};
								
							settings.feedback['getCurrent'] = function() {
									return getCurrentItem();
								};
								
							// Calling Feedback module
							feedbackRoot.feedback(album, settings.feedback);
							
							// "Add selected" button
							feedbackRoot.find('.' + settings.addSelectedClass).on('click', function() {
									feedbackRoot.trigger('addItems', getSelectedItems());
									getImageContainer().trigger('selectNone');
									return false;
								});
							
							// Ensuring lightbox has 'feedback' property
							if (!$.fn.lightbox.defaults.hasOwnProperty('feedback')) {
								$.fn.lightbox.defaults.feedback = {};
							}
							// Setting lightbox's feedback root variable
							$.fn.lightbox.defaults.feedback.root = feedbackRoot;
						}
					},
					
				/********************************************************
				 *
				 *					Index page initialization
				 *
				 ********************************************************/
				
				prepareIndex = function() {
					
						if (!album) {
							return;
						}
						
						var images = album.getImages();
						
						// Removing thumbnail links right away
						getThumbs().each(function() {
								var a = $(this).find('a');
								a.data('href', a.attr('href'));
								a.attr('href', '');
							});
			
						// Preapring folders
						prepareFolders();
			
						// Shopping cart
						if ($.fn.hasOwnProperty('paypal') && album.hasShop()) {
							shopRoot = $('#shop-root');
							shopBox = $('#shop .box');
							prepareShoppingCart();
						}
						
						// Feedback tool
						if (settings.hasOwnProperty('feedback')) {
							feedbackRoot = $('#feedback-root');
							feedbackBox = $('#feedback .box');
							prepareFeedback();
						}
						
						// "Select all" button
						shopBox.add(feedbackBox).find('.' + settings.selectAllClass).on('click', function() {
								getImageContainer().trigger('selectAll');
								return false;
							});
						
						// "Select none" button
						shopBox.add(feedbackBox).find('.' + settings.selectNoneClass).on('click', function() {
								getImageContainer().trigger('selectNone');
								return false;
							});
								
						// Rendering thumbnails
						if (images.length) {
							
							// Preparing images on the base overlay
							getImageContainer().renderImages(images, prepareImages, true);
							
							// Start slideshow
							$(settings.startSlideshowHook).on('click', startSlideshow);
							                                           
						} else {
							// no thumbnails, only folders
							if (window.location.hash) {
								// we should check the search / tags / newimages filter
								stateChange();
							}
							
							$(settings.startSlideshowHook).hide();
						}
												
						// Collecting tags if gathered only from this folder
						if (settings.hasOwnProperty('tagCloud') && settings.tagCloud['depth'] === 'current') {
							album.collectTags($.extend(settings.tagCloud, {
									exact:		settings.exactFields,
									ready:		function() {
														prepareTagCloud(this);
													}
								}));
						}
						
						// Custom query (eg. new images sample box)
						var queryTarget = $('[data-jalbum-query]');
						
						if (queryTarget.length) {
							// Reding settings from data attribute
							var qsettings = queryTarget.data('jalbum-query');
							
							if (qsettings.hasOwnProperty('fn')) {
								// Calling the jalbum.album function
								album[qsettings.fn]($.extend(qsettings, {
											ready:		function(opt) {
												
																for (var i = 0, a, item, mx = Math.min(this.length, 10); i < mx; i++) {
																	
																	item = this[i];
																	
																	a = $('<a>', {
																			href:	album.getLink(item)
																		}).appendTo(queryTarget);
																	
																	a.append($('<img>', {
																			src:		album.getThumbPath(item),
																			width:		item[J.THUMB][J.WIDTH],
																			height:		item[J.THUMB][J.HEIGHT],
																			alt:		item[J.TITLE] || item[J.NAME]
																		}));
																}
																
																if (this.length > 10) {
																	queryTarget.append($('<a>', {
																			'class':	'more',
																			href:		qsettings.linkMore,
																			text:		'+' + (this.length - 10)
																		}));
																}
																
																if (settings.rightClickProtect) {
																	queryTarget.on('contextmenu', 'img', function(e) {
																			e.preventDefault()
																			return false;
																		});
																}
															}
								
									}));
							}
						}
					},
				
				/********************************************************
				 *
				 *					Custom page initialization
				 *
				 ********************************************************/
				
				preparePage = function() {
						// Page :: initializing functions
						// Search 
						if (settings.hasOwnProperty('search')) {
							prepareSearch($(settings.search.hook));
						}
						
						settings.pageName = window.location.pathname.getFile();
						
						var paths = [];
						
						getCards().each(function() {
								var a = $(this).find('.' + settings.thumbClass);
								a.data('href', a.attr('href'));
								a.attr('href', '');
								// Collecting paths from thumbnails
								paths.push($(this).data(J.PATH));
							});
						
						if (paths.length) {
						
							album.collectByPath({
									paths:		paths,
									ready:		function() {
														// Rendering thumbnails
														if (this.length) {
															
															// Preparing images on the base overlay
															getBaseOverlay().renderImages(this, prepareImages, true);
															
															// Collecting markers and initializing map
															if (settings.hasOwnProperty('map')) {
																prepareMap(this, settings.map);
															}
														}
													}
								});
						}
					},
				
				/********************************************************
				 *
				 *	 Preparing functions that need the full album tree
				 *
				 ********************************************************/
				
				prepareDeepFunctions = function() {
					
						// Collecting tags if gathered from deep tree
						if (settings.hasOwnProperty('tagCloud') && settings.tagCloud['depth'] !== 'current') {
							album.collectTags($.extend(settings.tagCloud, {
									exact:		settings.exactFields,
									ready:		function() {
														prepareTagCloud(this);
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
					
				/********************************************************
				 *
				 *					Preparing folders
				 *
				 ********************************************************/
				
				// Marking new folders
				
				markFoldersNew = function() {
						
						if (!album) {
							return;
						}
						
						var folders = album.getFolders(),
							secs 	= settings.markNew['days'] * ONEDAY_S,
							s,
							d;
						
						getFolders().each(function(i) {
								
								if (i < folders.length) {
									d = folders[i][J.DATES];
									
									if (d) {
										d = d[settings.markNew['reference']] || d[J.DATERANGE][1] || d[J.DATERANGE][0];
										
										if (d && (nows - d) < secs) {
											s = settings.markNew.text?
												$('<span>', {
														'class':	'new-image',
														text:		settings.markNew.text
													})
												:
												$('<span>', {
														'class':	'icon-new-fill new-image'
													});
											
											if (!TOUCHENABLED) {
												s.data('tooltip', (new Date(d * 1000)).toLocaleDateString(LOCALE)).addTooltip();
											}
											
											$(this).find('.' + settings.thumbClass).eq(0).append(s);
										}
									}
								}
							});
					},
												
				// Preparing folders
			
				prepareFolders = function() { 
					
						var folders = getFolders();
						
						if (!folders.length) {
							return;
						}
						
						if (settings.hasOwnProperty('markNew')) {
							// Marking new folders
							setTimeout(markFoldersNew, 300);
						}
						
						setTimeout(function() {
								
								// Start lazy load 
								lazyloadFolders();
								
								// Removing prelaod class on folders already loaded
								folders.filter('.' + settings.preloadClass + ':first-child img')
									.on('load', function() {
											$(this).parents('.' + settings.preloadClass).removeClass(settings.preloadClass);
										});
							}, 500);
					},
				
				/********************************************************
				 *
				 *					Initializing album
				 *
				 ********************************************************/
				
				initAlbum = function(readyFn) {
					
						if (typeof Album === UNDEF) {
							console.log('Critical Error: Missing jalbum.album.js library!');
						}
						
						var params = {
								makeDate:		settings['makeDate'],
								rootPath:		settings['rootPath'],
								relPath:		settings['relPath'],
								ready: 			(settings.pageType === 'index')? prepareIndex : preparePage,
								loadDeep:		settings.hasOwnProperty('tagCloud') && settings.tagCloud['depth'] !== 'current',
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
					},
					
				// Main initializing function
				
				init = function() {
						
						// Removing search string, e.g. FB data
						if (window.location.search) {
							removeSearch();
						}
						
						// Restoring scroll position, saving on unload
						restoreScrollPosition();
						$(window).on('beforeunload.' + ns, saveScrollPosition);
						
						// Passing along lightbox defaults
						passDefaults(settings, $.fn.lightbox.defaults, 'indexName,level,previousFoldersLast,previousFolderPath,nextFoldersFirst,nextFolderPath,extraSizes,lightboxFullscreen,slideshowFullscreen,rightClickProtect,enableKeyboard,enableMouseWheel,useRating,visitorRating,lbableClass');
						passDefaults(settings.lightbox, $.fn.lightbox.defaults);
						
						// Creating new Album instance
						initAlbum();
			
						// Right click protection on folders, slider
						if (settings.rightClickProtect) {
							avoidRightClick();
						}
						
						// Preparing share buttons
						if (settings.hasOwnProperty('share')) {
							prepareShares(settings.share);
						}
						
						// Background music
						prepareBackgroundMusic($('[data-audioPlayer]'));
						
						// Hash change listener
						$window.on('hashchange.' + ns, stateChange);
						
						// Focusing overlay
						main.on('overlayReady.' + ns, function(e, o) {
								moveInView(o);
							});
						
						// Menu button wiring (small screens)
						$('[data-topnav-toggle]').on({
								'click': 		function() {
														$body.toggleClass('menu-on');
														return false;
													},
								'selectstart':	function(e) {
														e.preventDefault();
														return false;
													}
							});
						
						// Scroll to top btn
						if (settings.scrollToTopButton) {
							$body.scrollToTopBtn();
						}
														
					};
					
						
			/********************************************************
			 *
			 *					Execution starts here
			 *
			 ********************************************************/
				
			init();
			
			// Utility function for debugging
			this.getAlbum = function() {
					return album;
				};
			
			return this;
		};
	
	/********************************************************
	 *
	 *						Defaults
	 *
	 ********************************************************/
				
	$.fn.skin.defaults = {
			contentClass: 					'content',
			contClass:						'cont',
			startSlideshowHook:				'.hero .start-show',
			hasOverlayClass:				'has-overlay',
			baseClass:						'base-overlay',
			hideOnOverlayClass:				'hide-on-overlay',
			overlayClass:					'overlay',
			overlayTitleClass:				'title',
			overlayHeadLevel:				3,
			progressbarClass:				'progressbar',
			lightboxClass:					'lightbox',
			sliderClass:					'slider',
			belowfoldClass:					'below-fold',
			foldersClass:					'folders',
			folderClass:					'folder',
			thumbnailsClass:				'thumbnails',
			thumbClass:						'thumb',
			boxClass:						'box',
			mapBoxHook:						'section.map',
			mapRootClass:					'map-root',
			tagCloudClass:					'tag-cloud',
			tagSearchClass:					'tag-search',
			thumbLayout:					'fixgrid',
			hoverEffectThumbs:				true,
			columns:						5,
			maxThumbWidth:					212,
			maxThumbHeight:					170,
			imageClass:						'image',
			captionClasses:					'over bottom hover',
			cardClass:						'card',
			folderCardClass:				'foldercard',
			mosaicClass:					'mosaic',
			captionPlacement:				'below',
			lbableClass:					'lbable',
			captionClass:					'caption',
			commentClass:					'comment',
			hascaptionClass:				'hascaption',
			selectableClass:				'selectable',
			selectedClass:					'checked',
			activeClass:					'active',
			preloadClass:					'preload',
			lazyloadClass:					'lazyload',
			hideImageClass:					'hide-image',
			showImageClass:					'show-image',
			startshowClass:					'start-btn',
			fullscreenClass:				'fullscreen',
			panoClass:						'pano',
			selectBoxClass:					'select-box',
			selectAllClass:					'select-all',
			selectNoneClass:				'select-none',
			keepSelectedClass:				'keep-selected',
			addSelectedClass:				'add-selected',
			indexName:						'index.html',
			audioPoster:					'audio.poster.png',
			videoPoster:					'video.poster.png',
			exactFields:					'creator,keywords',
			dateFormat:						'M/d/yyyy',
			lightboxFullscreen:				false,
			slideshowFullscreen:			false,
			rightClickProtect: 				false,
			useRating:						false,
			jalbumRating:					false,
			visitorRating:					false,
			enableKeyboard:					true,
			videoAuto:						true,
			linkToFolder:					true,
			scrollToTopButton:				true
		};
		
})(jQuery, jQuery(window), jQuery(document), jQuery('body'));
