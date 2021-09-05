<%		
		/******************************************** 
		 *			Custom code above BODY
		 */
		 
		if (bodyTopHook && bodyTopHook.trim().length && !(bodyTopTopLevelOnly && level)) {
			if (bodyTopFitWidth) {
				out.println('\t\t<section class="above-body">');
					out.println('\t\t\t<div class="cont">' + getProcessed(bodyTopHook) + '</div>');
				out.println('\t\t</section>');
			} else {
				out.println(getProcessed(bodyTopHook));
			}
		}
		
		/******************************************** 
		 *					Top bar
		 */
		 
		var hasBreadcrumb = (typeof breadcrumbPath !== UNDEF) && breadcrumbPath,
			hasHomeBtn = logoName || (level > 0 && !topNavigation) || (homepageAddress && !topNavigation),
			hasTopBarRight = (_useSearch && !moveSearchToHero) && pageType !== 'page' || backgroundAudio;
	
		if (hasHomeBtn || topNavigation || hasTopBarRight) {
			out.println('\t\t<section class="top-bar ' + [
					logoName? 'has-logo' : '', 
					topNavigation? 'has-menu' : '', 
					useSearch? 'has-search' : '',
					(topmenuAlpha < 0.05)? 'transparent' : 'opaque'
				].filter(Boolean).join(' ') + '">');
				out.println('\t\t\t<div class="cont">');
			
				/*
				 *	Home button
				 */
				 
				if (hasHomeBtn) {
	
					out.print('\t\t\t\t<div class="home-link">');
	
					if (logoName) {
						if (level > 0 || pageType === 'page') {
							// One level up button: subfolder
							out.print(
								'<a href="' + rootPath + '/' + indexName + '" class="logo" data-tooltip title="' + getText('mainAlbumPage') + '"><img src="' + resPath + '/' + encodeURIComponent(logoName) + '"></a>'
							);
						} else if (homepageAddress) {
							// Logo with Homepage link
							out.print(
								'<a href="' + homepageAddress + '" class="logo" ' + (homepageLinkText? (' title="' + homepageLinkText + '"') : '') + '>' +
									'<img src="' + resPath + '/' + encodeURIComponent(logoName) + '">' +
								'</a>'
							);
						} else {
							// Logo, no link
							out.print('<img src="' + resPath + '/' + encodeURIComponent(logoName) + '">');
						}
					} else {
						// Home link
						if (homepageAddress) {
							// Homepage link as icon
							out.print(
								'<a href="' + homepageAddress + '" ' + (homepageLinkText? (' title="' + homepageLinkText + '"') : '') + ' class="icon-home button" data-tooltip title="' + (homepageLinkText || '') + '"></a>'
							);
						}
						if (pageType === 'page') {
							// Back to index from page
							out.print(
								'<a href="' + rootPath + '/' + indexName + '" class="icon-arrow-up button" data-tooltip title="' + getText('backToIndex') + '"></a>'
							);
						} else if (level > 0) {
							// One level up
							out.print(
								'<a href="' + rootPath + '/" class="icon-' + (homepageAddress? 'arrow-up' : 'home') + ' button" data-tooltip title="' + getText('mainAlbumPage') + '"></a>'
							);
						}
					}
	
					out.println('</div>');
				}
			
				/*
				 *	 Left column
				 */
			
				if (topNavigation) {
	
					out.println('\t\t\t\t<div class="left-column">');
	
						/*
						 *	Top navigation
						 */
						 				
						// Top navigation toggle button (mobile)
						out.println('\t\t\t\t\t<div id="topnav">' +
								'<a class="topnav-toggle icon-menu btn" data-tooltip data-topnav-toggle title="' + getText('navigation') + '"></a>' +
								topNavigation +
							'</div>');
				
					out.println('\t\t\t\t</div>');
				}
				
				/*
				 *	Right column
				 */
				
				if (hasTopBarRight) {
				
					out.println('\t\t\t\t<div class="right-column">');
					
						/*
						 *	Search
						 */
			
						if (_useSearch && !moveSearchToHero && pageType !== 'page') {
							out.println('\t\t\t\t\t<form class="search ' + (searchVisibleByDefault? 'active' : 'closed') +  '">' +
									'<div class="search-input"><input type="text" placeholder="' + getText('searchBoxTip') + '" aria-label="' + getText('search') + '" data-tooltip=\'' + getText('help.search') + '\'></div>' +
									'<a class="search-btn button icon-search" data-tooltip title="' + getText('search') + '"></a>' +
								'</form>');
						}
						
						/*
						 *	Background audio
						 */
						 
						if (backgroundAudio) {
							out.print(
								'<a class="player-btn button" data-rel="playlist" data-audioplayer=\'' + JSON.stringify(jsAudioPlayerVars) + '\'>' +
								// Pause button
								'<svg class="pause-btn" width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
								'<g class="disc" fill="' + topmenuTextColor + '"><path d="M3.812,16.188C2.229,14.603,1.25,12.416,1.25,10s0.979-4.603,2.562-6.188L2.929,2.929C1.12,4.738,0,7.238,0,10s1.12,5.262,2.929,7.071L3.812,16.188z"></path>	<path d="M16.188,3.812C17.771,5.397,18.75,7.584,18.75,10s-0.979,4.603-2.562,6.188l0.883,0.883C18.88,15.262,20,12.762,20,10s-1.12-5.262-2.929-7.071L16.188,3.812z"></path></g>' +
								'<g class="pause-icon" fill="' + topmenuTextColor + '"><rect x="6" y="6" width="3" height="8"></rect><rect x="11" y="6" width="3" height="8"></rect></g>' +
								'</svg>' +
								// Play button
								'<svg class="play-btn" width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
								'<g class="play-icon" fill="' + topmenuTextColor + '"><path d="M10,0C4.477,0,0,4.477,0,10s4.477,10,10,10s10-4.477,10-10S15.523,0,10,0z M7,14.571V5.429L15,10L7,14.571z"></path></g>' +
								'</svg></a>');
						}
				
					out.println('\t\t\t\t</div>');
				}
			
				out.println('\t\t\t</div>');
			out.println('\t\t</section>');		
		}
%>