<%		/*********************************************************************************
		 *								Header a.k.a Hero
		 */

		out.println('\t\t<section class="hero ' + [
					'title-' + folderTitlePosition,
					(heroFullWidth? 'full' : 'page') + '-width',
					(heroType === 'flatColor')? 'flat' : 'bg-image',
					heroPattern? 'pattern' : '',
					moveSearchToHero? 'has-search' : ''
				].filter(Boolean).join(' ') + '">');
				
			out.println('\t\t\t<div class="cont">');
			
				/*
				 *	Page title
				 */
				
				out.println('\t\t\t\t<header>');
				
					out.print('\t\t\t\t\t<div class="title">');
					
						// Up link
						if (level > 0) {
							
							out.print('<a class="back-btn button icon-one-level-up" href="../' + indexName + '" ');
							
							// Breadcrumb path as tooltip?
							if (showBreadcrumbPath === 'none') {
								out.print('data-tooltip title="' + getText('upOneLevel') + '"');
							} else if (showBreadcrumbPath === 'tooltip' && typeof breadcrumbPath !== UNDEF) {
								out.print('data-tooltip="#breadcrumb"');
							}
							
							out.println('></a>');
							
						} else if (homepageAddress) {
							
							out.println('<a class="back-btn button icon-one-level-up" href="' + homepageAddress + '" target="_parent" data-tooltip title="' + (homepageLinkText || '') + '">' +	'</a>');
						}	
					
						out.print('\t\t\t\t\t\t<div class="head">');
						
							// Folder title + description + breadcrumb
							out.println('\t\t\t\t\t\t' + folderCaption);
							
							// Search
							if (_useSearch && moveSearchToHero) {
								out.println('\t\t\t\t\t<form class="search">' +
									'<div class="search-input"><input type="text" placeholder="' + getText('searchBoxTip') + '" aria-label="' + getText('search') + '"></div>' +
									'<a class="search-btn button icon-search" data-tooltip title="' + getText('search') + '"></a>' +
									'</form>');
							}

							// Breadcrumb path
							if (showBreadcrumbPath !== 'none' && typeof breadcrumbPath !== UNDEF) {
								out.println('\t\t\t\t\t\t\t<div id="breadcrumb" class="breadcrumb' + ((showBreadcrumbPath === 'tooltip')? ' hidden' : '') + '">' + breadcrumbPath + '</div>');
							}
								
						out.print('\t\t\t\t\t\t</div>');

					out.println('\t\t\t\t\t</div>');
					
				out.println('\t\t\t\t</header>');
				
				/*
				 *	Controls
				 */
				 
				out.println('\t\t\t\t<aside class="controls">');
				
					// Buttons
					out.println('\t\t\t\t\t<div class="buttons">' +
							(header? ('<a class="button icon-info" data-modal-open="album-info" data-tooltip title="' + getText('aboutThisAlbum') + '"></a>') : '') +
							(_anyShares? ('<a class="button icon-connect" data-modal-open="social-share" data-tooltip title="' + getText('shareAlbum') + '"></a>') : '') +
							((pageType === 'index' && zipFile)? ('<a href="' + zipFile + '" class="button icon-download" data-tooltip title="' + getText('downloadImages') + '" download></a>') : '') +
							(showHelp? ('<a class="button icon-help" data-modal-open="help" data-tooltip title="' + getText('help') + '"></a>') : '') +
						'</div>');
			
					// Start slideshow button
					if (pageType !== 'page' && showStartSlideshow) {
						out.println('\t\t\t\t\t<div class="start-show' + (lightboxableCount? '' : ' hidden') + '"><span class="text">' + getText('startSlideshow') + '</span><span class="button icon-play"></span></div>');
					}
		
				out.println('\t\t\t\t</aside>');
				
			out.println('\t\t\t</div>');		// cont
			
		out.println('\t\t</section>');			// Hero
%>