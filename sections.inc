<%--------------------------------

	sections.inc - index page sections 

--------------------------------%><%
	 
	var nub = (captionPlacement === 'tooltip')? '<b class="nub"></b>' : '';
		
	for each (section in sectionsOrder.split('\t')) {
		
		switch (section) {
			
			case 'folders':
				
				var folders = getChildrenOfType(currentFolder, 'folder' + (hideWeblocations? '' : ',webLocation'));
				
				if (folders.length) {
					
					var vars,
						c,
						cp,
						tp,
						icon,
						alt,
						pmax = folderCols * preloadRows;

					out.print('\n\t\t\t\t\t\t<section class="row folder-cont">' +
						'<div class="large-12 columns">' +
						'<div class="thumbnails ' + (hoverEffectFolders? 'hover-scale ' : '') + 'row ' +	 folderGridClass + '">');
						
					for (var i = 0; i < folders.length; i++) {
						
						vars = folders[i].getVars();
						c = (vars.get('thumbCaption') || vars.get('title'));
						cp = getExternalLink(vars) || vars.get('closeupPath');
						tp = vars.get('folderThumbPath');
						cls = (fixedShapeFolderThumbs? '' : ' vertical-middle') + (vars.get('iconPath')? ' icon' : '');
						alt = addAltTags? stripHTML(vars.get('title') + ' ' + shorten(vars.get('comment'), 120, true)).trim() : '';
						
						if (folders[i].getCategory() !== Category.webLocation && showFolderImageCount) {
							c += vars.get('counts');
						}
						
						out.print('\n\t\t\t<div class="column">' +
							'<div class="card ' + ((i < pmax)? 'preload' : 'lazyload') + '">\n' +
							// Caption above
							((folderCaptionPlacement === 'above')? ('<div class="caption">' + c + '</div>') : '') +
							// Thumbnail image
							'<a href="' + cp + '" class="thumb' + cls + '"' +
							((i < pmax)? '' : (' data-thumb="' + tp + '"' + (alt? (' data-alt="' + alt + '"') : ''))) +
							(webLocationOpenNew? ' target="_blank"' : '') + '>' +
							((i < pmax)? ('<img class="show-image" src="' + tp + '"' + (alt? (' alt="' + alt + '"') : '') + '>') : '') +
							'</a>' +
							// Caption other
							((folderCaptionPlacement !== 'above')? ('<div class="caption">' + c + '</div>') : '') +
							// Close card, column 
							'\n\t\t\t</div></div>');
					}
					
					out.println('</div></div></section>');
				}
				
				break;
				
			case 'pages':
				
				if ((level > 0) || !hidePagesIfTopnav) {
					
					var pages = getChildrenOfType(currentFolder, 'webPage');
					
					if (pages.length) {
					
						out.print('\n\t\t\t\t\t\t<section class="row pages-cont">' +
							'<div class="large-12 columns">' +
							'<div class="thumbnails ' + (hoverEffectThumbs? 'hover-scale ' : '') + 'row' + pageGridClass + '">');
						
						var vars,
							c;
	
						for (var i = 0; i < pages.length; i++) {
							vars = pages[i].getVars();
									
							out.print('<div class="column"><div class="card">' +
								'<h4 class="icon-document"> <a href="' + vars.get('closeupPath') + '">' + vars.get('title') + '</a></h4>');
							
							if (showPageExcerpt) {
								c = vars.get('aboutText') || vars.get('comment');
								
								if (c) {
									var idx = s.indexOf('<!--more-->');
									
									if (idx > 0) {
										c = c.substring(0, idx) + ' <a href="' + vars.get('closeupPath') + '" class="readmore">' + getText('ui.readMore') + ' &rarr;</a>';
									} else if (c.length > 640) {
										c = shorten(stripHTML(c));
									}
									if (c) {
										out.print('<div class="caption">' + c + '</div>');
									}
								}
							}
								
							out.print('</div></div>');
						}
						
						out.println('</div></div></section>');
					}
				}
					
				break;
					
			case 'images':
				
				var images = getChildrenOfType(currentFolder, 'image,audio,video,other');
			
				if (images.length) {
					
					var vars,
						alt,
						c,
						cls = 'thumb' + (fixedShapeThumbs? '' : ' vertical-middle');
				
					out.print('\n\t\t\t\t\t\t<section class="row thumb-cont">' +
						'<div class="large-12 columns">' +
						'<div class="thumbnails ' + (hoverEffectThumbs? 'hover-scale ' : '') + 'row ' + thumbGridClass + '">');
					
					for (var i = 0; i < images.length; i++) {
						
						if (i >= thumbCols * preloadRows) {
							break;
						}
						
						vars = images[i].getVars();
						alt = addAltTags? (' alt="' + stripHTML(vars.get('title') + ' ' + vars.get('commentShort')).trim() + '"') : '';
						c = vars.get('thumbCaption');

						out.print('<div class="column"><div class="card preload' +
							(c? ' hascaption' : '') +
							'">' +
							((captionPlacement === 'above' && c)? ('<div class="caption">' + c + '</div>') : '') +
							'<a class="' + cls + '" href="' + vars.get('closeupPath') + '"><img src="' + vars.get('thumbPath') + '"' + alt + '></a>' +
							((captionPlacement !== 'above' && c)? ('<div class="caption">' + c + nub + '</div>') : '') +
							'</div></div>');
					}
					
					out.println('</div></div></section>');
					
				} else {
					
					// Needed for overlays (search, tag search, etc.)
					out.print('\n\t\t\t\t\t\t<section class="row thumb-cont hidden"></section>');
					
				}
				
				break;
				
			case 'map':
			
				if (showMapSection && (typeof locationCount !== 'undefined') && locationCount) {
					out.println('\n\t\t\t\t\t\t<section class="row map-cont cont-box">' +
						'<div class="large-12 columns">' +
						'<div class="map-root" data-map-root></div>' +
						'</div></section>');
				}
				
				break;
				
			case 'shoppingCart':
				
				if (_useShop && shopOptions) {
					out.println('\n\t\t\t\t\t\t<section id="shop" class="row shop-cont cont-box' + ((showShopOnImagePagesOnly && !itemCount)? ' hidden' : '')+ '">' +
						'<div class="large-12 columns"><div class="row">');
					
					if (shopLabel) {
						out.print('<div class="medium-3 columns"><h4 class="icon-shopping-cart"> ' +  shopLabel + '</h4></div>');
					}
					
					out.println('<div class="medium-' + (shopLabel? 9 : 12) + ' columns select-box"><label>' + getText('select') + '</label> ' + 
						'<a class="select-all small secondary disabled button"> ' + getText('all') + 	'</a>' + 
						'<a class="select-none small secondary disabled button"> ' + getText('none') + '</a>' + 
						' <a class="keep-selected icon-filter small success disabled button"> ' + getText('keepOnlySelected') + '</a>' +
						' <a class="add-selected small disabled button icon-include"> ' + getText('addSelected') + '</a></div>');
					
					out.println('<div class="medium-12 columns"><div id="shop-root" class="shop-root" data-shop-root></div></div>');
					
					if (shopInstructionsBox) {
						out.println('<div class="medium-12 columns"><div class="shop-instructions">' + shopInstructionsBox + '</div></div>');
					}
					
					out.println('</div></div></section>');
				}
				
				break;
				
			case 'feedback':
				
				if (_useFeedback) {
					out.println('\n\t\t\t\t\t\t<section id="feedback" class="row feedback-cont cont-box' + ((showFeedbackOnImagePagesOnly && !itemCount)? ' hidden' : '')+ '">' +
						'<div class="large-12 columns"><div class="row">');
					
					if (feedbackLabel) {
						out.print('<div class="medium-3 columns"><h4 class="icon-email"> ' +  feedbackLabel + '</h4></div>');
					}
					
					out.println('<div class="medium-' + (feedbackLabel? 9 : 12) + ' columns select-box"><label>' + getText('select') + '</label> ' + 
						'<a class="select-all small secondary disabled button"> ' + getText('all') + 	'</a>' + 
						'<a class="select-none small secondary disabled button"> ' + getText('none') + '</a>' + 
						' <a class="keep-selected icon-filter small success disabled button"> ' + getText('keepOnlySelected') + '</a>' +
						' <a class="add-selected small disabled button icon-include"> ' + getText('addComment') + '</a></div>');
										
					out.println('<div class="medium-12 columns"><div id="feedback-root" class="feedback-root" data-feedback-root></div></div>');
					
					if (feedbackInstructionsBox) {
						out.println('<div class="medium-12 columns"><div class="feedback-instructions">' + feedbackInstructionsBox + '</div></div>');
					}
					
					out.println('</div></div></section>');
				}
				
				break;
				
			case 'neighboringFolders':
				
				if (linkNeighboringFolders) {
					
					if ((typeof previousFolderPath !== 'undefined') && previousFolderPath || 
						(typeof nextFolderPath !== 'undefined') && nextFolderPath) {
						
						out.print('\n\t\t\t\t\t\t<section class="row prev-next-links">' +
							'<div class="small-6 columns">');
						
						if (previousFolderPath) {
							out.print('<a class="previous-link" href="' + previousFolderPath + '"' +
								(neighboringFolderBgImage? (' style="background-image:url(' + previousFolderThumbPath + ')"') : '') +
								'><span class="caption icon-arrow-left">' + previousFolderTitle + '</span></a>');
						}
	
						out.print('</div><div class="small-6 columns text-right">');
						
						if (nextFolderPath) {
							out.print('<a class="next-link" href="' + nextFolderPath + '"' + 
								(neighboringFolderBgImage? (' style="background-image:url(' + nextFolderThumbPath + ')"') : '') +
								'><span class="caption">' + nextFolderTitle + '</span></a>');
						}
						
						out.println('</div></section>');
					}
				}
				
				break;
				
			case 'tags':
				
				if (tagCloudSource !== 'none') {
					out.print('\n\t\t\t\t\t\t<section id="tag-cloud" class="row cont-box">' +
						'<div class="large-12 columns"><div class="row">');
					var c = 12 - (tagCloudLabel? 2 : 0) - (tagCloudSearch? 3 : 0);
					if (tagCloudLabel) {
						out.print('<div class="medium-2 columns"><h4 class="icon-label"> ' + tagCloudLabel + '</h4></div>');
					}
					
					out.print('<div class="medium-' + c + ' columns"><div class="tag-cloud"></div></div>');
					
					if (tagCloudSearch) {
						out.print('<div class="medium-3 columns">' +
							'<form class="tag-search" data-depth="' + tagCloudSource + '" data-fields="' + tagCloudFields + '">' +
							'<div class="search-input"><input type="text" placeholder="' + getText('searchBoxTip') + '" aria-label="' + getText('search') + '"></div>' +
							'<a class="search-btn icon-search"></a>' +
							'</form></div>');
					}
					out.println('</div></section>');
				}
				
				break;
				
			case 'newImages':
				
				if (searchNewSource !== 'none') {
					out.print('\n\t\t\t\t\t\t<section id="search-new" class="row cont-box">' +
						'<div class="large-12 columns"><div class="row">');
					if (searchNewLabel) {
						out.print('<div class="medium-2 columns"><h4 class="icon-star"> ' + searchNewLabel + '</h4></div>');
					}
					out.print('<div class="medium-' + (searchNewLabel? 10 : 12) + ' columns"><div class="search-new"></div></div>');
					out.println('</div></section>');
				}
					
				break;
				
			case 'comments':
				
				if (_useFacebookCommenting || _useDisqusCommenting) {
					
					out.print('\n\t\t\t\t\t\t<section class="row comments-cont cont-box">' +
						'<div class="large-12 columns">');
					
					if (_useFacebookCommenting) {
						out.println('<div class="fb-comments" id="fb-comments" data-num-posts="' + facebookCommentingPosts + 
							'" data-width="100%" data-colorscheme="' + commentingTheme + '"' + 
							(pageUrl? (' data-href="' + pageUrl + '"') : '') +
							'></div>');
					}
					
					if (_useDisqusCommenting) {
						out.println('<div class="disqus-comments" id="disqus-comments"><div id="disqus_thread"></div></div>');
					}
					
					out.println('</div></section>');
					
				}
				
				break;
				
			case 'customContent':
				
				if (customSectionHook && customSectionHook.trim() && (!level || !customSectionTopLevelOnly)) {
					out.println('\n\t\t\t\t\t\t<section class="row custom-cont cont-box">' +
						'<div class="large-12 columns">' +
						getProcessed(customSectionHook) +
						'</div></section>');
				}
				
				break;

				
		}
	}
%>