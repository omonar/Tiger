<%--------------------------------

		sections.inc - index page sections 

--------------------------------%><%
	
	var	getFolderThumb = function(ao) {
				var vars = ao.getVars(),
					s;

				// Iconpath => SVG, folder thumb path
				if (s = vars.get('iconPath')) {
					s = s.replace('folder.png', 'folder.svg');
					return s.replace(/^\.\.\//, '');
				} else {
					return createFolderThumb(ao, folderThumbSize, true);
				}
			},
			
		getNewImagesContent = function(ao) {
				var vars = ao.getVars(),
					t = vars.get('fileTitle'),
					d;
				
				d = {
						fn:				'collectByDate',
						start:			today - (vars.get('newImagesDays') || 30),
						depth:			vars.get('newImagesDepth') || 'tree',
						sortBy:			vars.get('newImagesSort') || 'date',
						reference:		vars.get('newImagesSource') || 'dateTaken',
						reverse:		vars.get('newImagesReverse') || false,
						linkMore:		vars.get('closeupPath')
					};
				
				return (t? ('<h3>' + t + '</h3>') : '') + 
					'<div class="new-images single-row" data-jalbum-query=\'' + JSON.stringify(d) + '\'></div>';
			},
			
		getPageIcon = function(hook) {
				switch(hook) {
					case 'contents-page':
					case 'sitemap-page':
						return 'site';
					case 'contact-page':
						return 'email';
					case 'about-page':
						return 'user';
					case 'newimages-page':
						return 'new';
					case 'calendar-page':
						return 'calendar';
					default:
						return 'text-document';
				}
			},
			
		getPageThumbnail = function(ao) {
				var vars = ao.getVars(),
					s
					c;
					
				s = '<h3><a class="icon-' + getPageIcon(vars.get('pageHook')) + '" href="' + vars.get('closeupPath') + '"> ' + vars.get('title') + '</a></h3>';
				
				if (showPages === 'excerpt') {
					c = vars.get('aboutText') || vars.get('comment');
					
					if (c) {
						s += '<div class="caption">' + shorten(c.split('<!--more-->')[0]) + '</div>';
					}
				}
				
				return '<div class="card">' + s + '</div>';
			};
			
	for each (section in sectionsOrder.split('\t')) {
		
		switch (section) {
			
			case 'folders':
				
				var folders = getChildrenOfType(currentFolder, 'folder' + (hideWeblocations? '' : ',webLocation'));
				
				if (folders.length) {
					
					var vars,
						c,
						cp,
						ip,
						tp,
						ftw = folderThumbDims.split('x')[0],
						fth = folderThumbDims.split('x')[1],
						icon,
						alt,
						ask,
						cat;

					// Creating folders section
					out.println('\t\t\t\t<section class="folders hide-on-overlay">');
						out.println('\t\t\t\t\t<div class="' +
								[	'cont',
									'caption-' + folderCaptionPlacement, 
									'thumbs-' + (fixedShapeFolderThumbs? 'fill':'fit'),
									hoverEffectFolders? 'hover-zoom' : ''
								].filter(Boolean).join(' ') +
							'">');
					
					for (var i = 0; i < folders.length; i++) {
						
						vars = folders[i].getVars();
						c = vars.get('thumbCaption');
						cp = getExternalLink(vars) || vars.get('closeupPath');
						ip = vars.get('iconPath');
						tp = ip? (resPath + '/' + defaultFolderIconName) : vars.get('folderThumbPath');
						alt = addAltTags? (stripQuot(stripHTML(vars.get('title') + ' ' + shorten(vars.get('comment'), 120, true))).trim()) : '';
						ask = vars.get('askPermission');
						wl = folders[i].getCategory() === Category.webLocation;
						if (!fixedShapeFolderThumbs) {
							// Variable folder thumb dimensions
							ftw = vars.get('folderThumbWidth');
							fth = vars.get('folderThumbHeight');
						}
						
						if (showFolderImageCount && !wl) {
							c += vars.get('counts');
						}
						
						// Card
						out.print('\t\t\t\t\t\t<div class="card folder ' + ((i < preloadThumbs)? 'preload' : 'lazyload') + '">');
							// Thumbnail image
							out.print('<a href="' + cp + '" class="thumb' + (ip? ' icon' : '') + '"' + 
										(ask? (' data-ask-permission=\'' + ask.replace(/'/g, '&apos;') + '\'') : '') + 			//'
										// Open in new tab?
										((wl && webLocationOpenNew)? ' target="_blank"' : '') + 
										// Passing along thumbPath and alt for lazy loaded folders
										((i >= preloadThumbs)? 
											(' data-src="' + tp + '"' + (alt? (' data-alt="' + alt + '"') : '') + 
												' data-width="' + ftw + '" data-height="' + fth + '">'
											)
											:
											('><img src="' + tp + '"' + (alt? (' alt="' + alt + '"') : '') + 
												' width="' + ftw + '" height="' + fth + '">'
											)
										) +
								'</a>');
							
							// Mosaic
							if (typeof folderThumbLayout !== UNDEF && folderThumbLayout === 'mosaic') {
								var imgs = getRandomChildren(folders[i], 3, 'image,video,folder,webLocation', true),
									tp,
									cat;
								
								if (imgs.length) {
									
									out.print('<div class="mosaic">');
									
									for (var j = 0, l = imgs.length; j < l; j++) {
										cat = imgs[j].getCategory();
										
										if (cat === Category.folder && imgs[i].getVars().get('iconPath')) {
											// No folder thumbnail
											tp = resPath + '/' + defaultFolderIconName;
											icon = 'icon ';
										} else {
											tp = encodeURIComponent(folders[i].getWebName()) + '/' + imgs[j].getVars().get('thumbPath');
											icon = '';
										}
										
										out.print('<a href="' + ((cat === Category.folder || j === l - 1)? cp : (cp + '#img=' + imgs[j].getWebName())) + '"' + 
												ask + ' class="' + icon + 
												((i > preloadThumbs)? 'lazyload" data-thumb="' : 'preload"><img src="') + tp + '">' + 
												((j === l - 1)? '<span>+</span>' : '') + 
											'</a>');
										
									}
									
									out.print('</div>');
								}
							}
							
							// Caption
							if (c) {
								out.print('<div class="caption">' + c + '</div>');
							}
							
						out.println('</div>');
					}
					
					out.println('\t\t\t\t\t</div>\n\t\t\t\t</section>');
				}
				
				break;
				
			case 'pages':
				
				if (showPages !== 'none') {
					var pages = getChildrenOfType(currentFolder, 'webPage'),
						s;
					
					if (pages.length) {
						// Creating pages section
						out.println('\t\t\t\t<section class="pages hide-on-overlay">\n\t\t\t\t\t<div class="cont pages-cont">');
						
						if (showPages === 'embed' || showPages === 'embedCustom') {
							
							if (showPages === 'embedCustom') {
								s = '';
								
								for (var i = 0; i < pages.length; i++) {
									if (isPredefinedPage(pages[i])) {
										s += getPageThumbnail(pages[i]);
									}
								}
								
								if (s) {
									out.println(s);
								}
							}
							
							for (var i = 0, ao, nm; i < pages.length; i++) {
								
								ao = pages[i];
								nm = getOriginalPageName(ao, 'user');
								
								if (showPages === 'embed' || nm === 'user') {
									s = (nm === 'newimages')? 
										getNewImagesContent(ao)
										:
										getCustomPageContent(ao);
									
									if (s) {
										out.println('\t\t\t\t\t\t\t<div class="custom ' + nm + '-page' + (useBoxForPages? ' boxed' : '') + '">');
										out.println('\t\t\t\t\t\t\t\t<div class="page-wrap">\n' + s + '\n\t\t\t\t\t\t\t\t</div>');
										out.println('\t\t\t\t\t\t\t</div>');
									}
								}
							}
							
						} else {
							s = '';
							
							for (var i = 0; i < pages.length; i++) {
								out.println('\t\t\t\t\t\t' + getPageThumbnail(pages[i]));
							}
						}
						
						out.println('\t\t\t\t\t</div>\n\t\t\t\t</section>');
					}
					
				}
				
				break;
					
			case 'images':
				
				var images = getChildrenOfType(currentFolder, 'image,audio,video,other'),
					horizontal = thumbLayout === 'horizontal';
					
				if (images.length) {
					
					var vars,
						cat,
						alt,
						c,
						tw,
						th,
						ar,
						ip,
						tp,
						icon;
				
					// Creating thumbnails section
					out.println('\t\t\t\t<section class="thumbnails hide-on-overlay">');
						out.println('\t\t\t\t\t<div class="' +
								[	'cont',
									'base',
									thumbLayout, 
									'caption-' + captionPlacement,
									hoverEffectThumbs? 'hover-zoom' : '',
									(captionPlacement !== 'below' && captionShowOnHover)? ' caption-on-hover' : ''
								].filter(Boolean).join(' ') +
							'">')
					
					// Iterate through normal thumbnails (images)
					for (var i = 0; i < images.length; i++) {
						
						if (i >= preloadThumbs) {
							break;
						}
						
						vars = images[i].getVars();
						cat = images[i].category;
						c = vars.get('thumbCaption');
						tw = vars.get('thumbWidth');
						th = vars.get('thumbHeight');
						ar = tw / th;
						tp = vars.get('thumbPath');
						icon = vars.get('iconPath');
						
						switch (cat) {
							case 'image':
								ip = vars.get('imagePath');
								break;
							case 'video':
								ip = vars.get('videoPath');
								break;
							default:
								ip = vars.get('originalPath') || vars.get('imagePath');
						}

						out.println('\t\t\t\t\t\t<div class="' + 
									[
										'card',
										'preload',
										cat,
										c? 'hascaption' : '',
										((tw < maxThumbWidth && th < maxThumbHeight)? 'tiny' : ''),
										icon? 'icon' : '',
										(ar >= 1.25)? 'landscape' : ((ar <= 0.8)? 'portrait' : 'square')
									].filter(Boolean).join(' ') +
								'"' +
									(horizontal? (' style="flex-basis:' + Math.round(vars.get('thumbWidth') * 0.9) + 'px;"') : '') +
								'>' +
								'<a class="thumb' + 
									(icon? ' iconthumb' : '') +
									(((tw < maxThumbWidth) && (th < maxThumbHeight))? ' tiny' : '') +
									'" href="' + ip  + '">' +
									'<img src="' + tp + '"' +
										(!icon? (' width="' + tw + '" height="' + th + '"') : '') +
										(addAltTags? (' alt="' + stripQuot(stripHTML(vars.get('title') + ' ' + vars.get('commentShort'))).trim() + '"') : '') + 
									'>' +
								'</a>' +
								(c? ('<div class="caption">' + c + '</div>') : '') +
							'</div>');
					}
					
					out.println('\t\t\t\t\t</div>\n\t\t\t\t</section>');
					
				}
				
				break;
				
			case 'map':
			
				if (showMapSection && googleApiKey && (typeof locationCount !== UNDEF) && locationCount) {
					out.println('\t\t\t\t\t<section class="map hide-on-overlay">');
						out.println('\t\t\t\t\t<div class="cont box">' +
								'<div class="map-root" data-map-root></div>' +
							'</div>');
						out.println('\t\t\t\t\t</div>');
					out.println('\t\t\t\t\t</section>');
				}
				
				break;
				
			case 'filtering':
				
				if ((typeof lightboxableCount !== UNDEF) && lightboxableCount > 1 && (_useFilters || _useSort)) {
					
					out.print('\t\t\t\t<section class="filter-cont" id="filters"' + 
								(filteringBoxSticky? ' data-sticky' : '') +
							'><div class="cont box small-column">');
					
					if (_useFilters && filterLabel || _useSort && sortLabel) {
						var l = '';
						
						if (_useFilters && filterLabel) {
							l = filterLabel;
						}
						
						if (_useSort && sortLabel) {
							l += (l.length? ' / ' : '') + sortLabel;
						}
						
						out.println('\t\t\t\t\t<h4 class="icon-' + (_useFilters? 'filter' : 'ordering') + '"> ' +  l + '</h4>');
					}
					
					if (_useFilters) {
						out.println('\t\t\t\t\t<form class="filter"></form>');
					}
						
					if (_useSort) {
						out.println('\t\t\t\t\t<form class="sort"></form>');
					}
					
					out.println('\t\t\t\t</div></section>');
				}
				
				break;
				
			case 'shoppingCart':
				
				if (_useShop && shopOptions) {
					
					out.println('\t\t\t\t<section id="shop" class="shop-cont' + 
							((showShopOnImagePagesOnly && !shopCount)? ' hidden' : '') + '"' +
							(shopBoxSticky? ' data-sticky' : '') +
						'><div class="cont box">');
					
					if (shopLabel) {
						out.println('\t\t\t\t\t<h4 class="icon-shopping-cart"> ' +  shopLabel + '</h4>');
					}
					
					out.println('\t\t\t\t\t<div class="select-box">' +
							'<label>' + getText('select') + '</label> ' +
							'<div class="buttons">' + 
								'<a class="select-all small button">' + getText('all') + 	'</a>' + 
								'<a class="select-none small button">' + getText('none') + '</a>' + 
								'<a class="keep-selected icon-filter small button"> ' + getText('keepOnlySelected') + '</a>' +
							'</div></div>');
					
					out.println('\t\t\t\t\t<div id="shop-root" class="shop-root" data-shop-root></div>');
					
					if (shopInstructionsBox) {
						out.println('\t\t\t\t\t<div class="shop-instructions">' + shopInstructionsBox + '</div>');
					}
					
					out.println('\t\t\t\t</div></section>');
				}
				
				break;
				
			case 'feedback':
				
				if (_useFeedback) {
					
					out.println('\t\t\t\t<section id="feedback" class="feedback-cont' + 
							((showFeedbackOnImagePagesOnly && !lightboxableCount)? ' hidden' : '') + '"' +
							(feedbackBoxSticky? ' data-sticky' : '') +
						'><div class="cont box">');
					
					if (feedbackLabel) {
						out.println('\t\t\t\t\t<h4 class="icon-email-send"> ' +  feedbackLabel + '</h4>');
					}
					
					out.println('\t\t\t\t\t<div class="select-box">' +
							'<label>' + getText('select') + '</label>' +
							'<div class="buttons">' + 
								'<a class="select-all small button">' + getText('all') + 	'</a>' + 
								'<a class="select-none small button">' + getText('none') + '</a>' + 
								'<a class="keep-selected icon-filter small button"> ' + getText('keepOnlySelected') + '</a>' +
							'</div></div>');
										
					out.println('\t\t\t\t\t<div id="feedback-root" class="feedback-root" data-feedback-root></div>');
					
					if (feedbackInstructionsBox) {
						out.println('\t\t\t\t\t<div class="feedback-instructions">' + feedbackInstructionsBox + '</div>');
					}
					
					out.println('\t\t\t\t</div></section>');
				}
				
				break;
				
			case 'neighboringFolders':
				
				if (level && linkNeighboringFolders) {

					if ((typeof previousFolderPath !== UNDEF) && previousFolderPath || 
						(typeof nextFolderPath !== UNDEF) && nextFolderPath) {
						
						out.print('\t\t\t\t<section class="prev-next-links hide-on-overlay"><div class="cont">');

						if (previousFolderPath) {
							out.print('<div class="previous-link ' +
										((neighboringFolderBgImage && previousFolderThumbPath)? 'has-bg' : 'no-bg') +
									'">' + 
									'<a rel="prev" href="' + previousFolderPath + indexName + '"' +
										((neighboringFolderBgImage && previousFolderThumbPath)? (' style="background-image:url(' + previousFolderThumbPath + ')"') : ' class="button"') +
										((typeof previousFolderAsk !== UNDEF)? (' data-ask-permission="' + previousFolderAsk + '"') : '') +
									'>' +
										'<span class="caption"><span class="icon-caret-left"></span> ' + previousFolderTitle + '</span>' +
									'</a>' +
								'</div>');
						}

						if (nextFolderPath) {
							out.print('<div class="next-link ' +
										((neighboringFolderBgImage && nextFolderThumbPath)? 'has-bg' : 'no-bg') +
									'">' + 
									'<a rel="next" href="' + nextFolderPath + indexName + '"' +
										((neighboringFolderBgImage && nextFolderThumbPath)? (' style="background-image:url(' + nextFolderThumbPath + ')"') : ' class="button"') +
										((typeof nextFolderAsk !== UNDEF)? (' data-ask-permission="' + nextFolderAsk + '"') : '') +
									'>' +
										'<span class="caption">' + nextFolderTitle + ' <span class="icon-caret-right"></span></span>' +
									'</a>' +
								'</div>');
						}

						out.println('</div></section>');
					}
				}
				
				break;
				
			case 'tags':
				
				if (tagCloudSource !== 'none') {
					
					out.println('\t\t\t\t<section id="tag-cloud" class="hide-on-overlay"><div class="cont box small-column">' +
							(tagCloudLabel? ('<h4 class="icon-tag"> ' + tagCloudLabel + '</h4>') : '') +
							'<div class="tag-cloud-cont"></div>' +
						'</div></section>');
				}
				
				break;
				
			case 'newImages':
				
				if (searchNewSource !== 'none') {
					
					out.println('\t\t\t\t<section id="search-new" class="cont-box hide-on-overlay"><div class="cont box small-column">' +
							(searchNewLabel? ('<h4 class="icon-new"> ' + searchNewLabel + '</h4>') : '') +
							'<div class="search-new"></div>' +
						'</div></section>');
				}
					
				break;
				
			case 'comments':

				if (_useFacebookCommenting || _useDisqusCommenting) {

					out.println('\t\t\t\t<section class="commenting hide-on-overlay"><div class="cont box small-column">' +
							(_useFacebookCommenting? ('<div class="fb-comments cont" id="fb-comments" data-num-posts="' + facebookCommentingPosts + '" data-width="100%" data-colorscheme="' + commentingTheme + '"' + (pageUrl? ' (data-href="' + pageUrl + '")' : '') + '></div>') : '') +
							(_useDisqusCommenting? '<div class="disqus-comments cont" id="disqus-comments"><div id="disqus_thread"></div></div>' : '') +
						'</div></section>');
				}

				break;

			case 'customContent':

				if (customSectionHook && (!level || !customSectionTopLevelOnly)) {
					out.println('\t\t\t\t<section class="custom-content hide-on-overlay">' + 
							'<div class="cont box">' +
								getProcessed(customSectionHook) + 
							'</div>' +
						'</section>');
				}

				break;
				
		}
	}

%>