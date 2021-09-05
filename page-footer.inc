<%
		/********************************
		 *			Page footer
		 */
		 
			out.println('\t\t\t</article>');
		out.println('\t\t</section>');
		
		/* Footer */
		if (typeof bottomNavigation !== UNDEF && bottomNavigation ||
			folderInfo ||
			(typeof credits !== UNDEF && credits) ||
			footer) {
		
			out.println('\t\t<section class="footer ' + ((topmenuAlpha < 0.05)? 'transparent' : 'opaque') +'">');
				out.println('\t\t\t<div class="cont">');
					out.println('\t\t\t\t<footer>');
					
						if (typeof bottomNavigation !== UNDEF && bottomNavigation) {
							out.println('\t\t\t\t\t<div class="bottom-navigation"><div>' + ((pageType === 'index')? bottomNavigation : currentFolder.getVars().get('bottomNavigation')) + '</div></div>');
						}
						
						if (pageType === 'index') {
							out.println('\t\t\t\t\t<div class="folder-info">' + folderInfo + '</div>');
						}
						
						if (typeof credits !== UNDEF && credits) {
							out.println('\t\t\t\t\t<div class="credits">' + credits + '</div>');
						}
						
						if (_useFacebookBox) {
							out.println('\t\t\t\t\t<div class="social-box" id="facebook-box">' +
								'<div class="fb-page" data-href="https://www.facebook.com/' + facebookPageId + 
									'" data-colorscheme="' + footerBoxTheme + 
									'" data-small-header="true" data-width="' + footerBoxWidth + 
									'" data-hide-cover="' + !facebookHeader + 
									'" data-show-facepile="' + facebookFaces + 
									'" data-show-posts="false">' + 
									'<div class="fb-xfbml-parse-ignore">' +
										'<blockquote cite="https://www.facebook.com/' + facebookPageId + '">' +
											'<a href="https://www.facebook.com/' + facebookPageId + '">' + facebookPageId + '</a>' +
										'</blockquote>' +
									'</div>' +
								'</div>' +
							'</div>');
						}
						
					out.println('\t\t\t\t</footer>');
				
				if (footer && !(level && footerTopLevelOnly)) {
					out.println('\t\t\t\t<div class="custom">' + getProcessed(footer) + '</div>');
				}
				
				var f = getInclude('footer.inc');
				
				if (f && !(level && footerTopLevelOnly)) {
					out.println('\t\t\t\t' + getInclude('footer.inc'));
				}
				
				out.println('\t\t\t</div>');
			out.println('\t\t</section>');
		}
		
		/********************************
		 *			Popups 
		 */
		
		/* Share window */
		if (_anyShares) {
			out.println('\t\t<div class="modal hidden" id="social-share" role="dialog" data-modal>');
				out.println('\t\t\t<div class="window has-header">');
					out.println('\t\t\t\t<header>' + getText('shareAlbum') + '</header>');
					out.println('\t\t\t\t<a class="btn close" data-close aria-label="' + getText('closeWindow') + '" data-tooltip title="' + getText('closeWindow') + '"></a>');
					out.println('\t\t\t\t<div class="content">' +
						'<div class="social">' +
							'<div class="preview"><img src="' + folderThumbFileName + '">' +
								'<div class="caption">' +
									'<h3 class="title">' + title + '</h3>' +
									(description? ('<div class="description">' + description + '</div>') : '') +
								'</div>' +
							'</div>' +
						'</div>' +
					'</div>');
				out.println('\t\t\t</div>');
			out.println('\t\t</div>');
		}
		
		/* Album info */
		if (header) {
			out.println('\t\t<div class="modal hidden" id="album-info" role="dialog" data-modal>');
				out.println('\t\t\t<div class="window has-header">');
					out.println('\t\t\t\t<header>' + albumTitle + '</header>');
					out.println('\t\t\t\t<a class="btn close" data-close aria-label="' + getText('closeWindow') + '" data-tooltip title="' + getText('closeWindow') + '"></a>');
					out.println('\t\t\t\t<div class="content">' + getProcessed(header) + '</div>');
				out.println('\t\t\t</div>');
			out.println('\t\t</div>');
		}
			
		/* Help */
		if (showHelp) {
			out.println('\t\t<div class="modal hidden no-padding" id="help" role="dialog" data-modal>');
				out.println('\t\t\t<div class="window large has-header">');
					out.println('\t\t\t\t<a class="btn close" data-close aria-label="' + getText('closeWindow') + '" data-tooltip title="' + getText('closeWindow') + '"></a>');
					out.println('\t\t\t\t<div class="content scrollable">');
						out.println('\t\t\t\t\t<div class="help-card medium-column">');
							out.println('\t\t\t\t\t\t<div class="fig"><img src="' + resPath + '/help-index.svg" alt="' + getText('help') + '"></div>');
							out.println('\t\t\t\t\t\t<div class="caption"><ol>' + 
									'<li>' + getText('help.topNavigation') + '</li>' + 
									'<li>' + getText('help.search') + '</li>' +
									'<li>' + getText('help.backgroundAudio') + '</li>' +
									'<li>' + getText('help.upOneLevel') + '</li>' +
									'<li>' + getText('help.authorInfo') + '</li>' +
									'<li>' + getText('help.shareAndLike') + '</li>' + 
									'<li>' + getText('help.downloadZip') + '</li>' +
									'<li>' + getText('help.startSlideshow') + '</li>' +
								'</ol></div>');
						out.println('\t\t\t\t\t</div>');
						out.println('\t\t\t\t\t<div class="help-card medium-column">');
							out.println('\t\t\t\t\t\t<div class="fig"><img src="' + resPath + '/help-lightbox.svg" alt="' + getText('help') + '"></div>');
							out.println('\t\t\t\t\t\t<div class="caption"><ol>' +
									'<li>' + getText('help.previousPicture') + '</li>' +
									'<li>' + getText('help.backToIndex') + '</li>' +
									'<li>' + getText('help.toggleFit') + '</li>' +
									'<li>' + getText('help.toggleInfo') + '</li>' +
									'<li>' + getText('help.toggleThumbnails') + '</li>' +
									'<li>' + getText('help.toggleAutoPlay') + '</li>' +
									'<li>' + getText('help.nextPicture') + '</li>' +
									'<li>' + getText('help.meta') + '</li>' +
									'<li>' + getText('help.map') + '</li>' +
									'<li>' + getText('help.faces') + '</li>' +
									'<li>' + getText('help.downloadImage') + '</li>' +
									'<li>' + getText('help.shop') + '</li>' +
									'<li>' + getText('help.share') + '</li>' +
								'</ol></div>');
						out.println('\t\t\t\t\t</div>');
					out.println('\t\t\t\t</div>');
				out.println('\t\t\t</div>');
			out.println('\t\t</div>');
		}
		
		// jQuery library
		if (avoidCDNs) {
			out.println('\t\t<script src="' + resPath + '/jquery.min.js"></script>');
		} else {
			// Google CDN first, then local
			out.println('\t\t<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery' + min + '.js"></script>');
			out.println('\t\t<script>window.jQuery || document.write(\'<script src="' + resPath + '/jquery.min.js"><\\/script>\');</script>');
			// jQuery Migrate check: <script src="https://code.jquery.com/jquery-migrate-git.js"></script>
		}

		if (_anyVr) {
			out.println('\t\t<script src="' + resPath + '/photosphere/three.min.js"></script>');
			out.println('\t\t<script src="' + resPath + '/photosphere/photo-sphere-viewer.min.js" async defer></script>');
		}

		if (_useFotomoto) {
			out.println('\t\t<script src="https://widget.fotomoto.com/stores/script/' + fotomotoID + '.js?api=true' + fotomotoAid + '" async defer></script>');
		}

		// The concatenated JS file
		out.println('\t\t<script src="' + resPath + '/all' + min + '.js?v=' + skinVersion + '"></script>');
		out.println('\t\t<script>');
			out.println('\t\t\t_jaWidgetBarColor = \'' + widgetBarColor + '\';');
			out.println(getInclude('index-scripts.inc'));
			// Javascript hook
			if (jsHook) {
				out.println(getProcessed(jsHook));
			}
		out.println('\t\t</script>');
		
		// Custom page related JS
		out.println(getCustomPageJS(currentObject, typeof debugMode !== UNDEF && !!debugMode));

		// Facebook root
		if (_useFacebook) {
			out.println('\t\t<div id="fb-root"></div>');
		}

		// Widgets
		if (engine.isWidgetInjection()) {
			out.println('\t\t' + engine.getWidgetInjectionCode(pageType, rootPath).replace('javascript";\nscript.src', 'javascript";\nscript.async = true;\nscript.src').replace(/\n$/, '').replace(/\n/g, '\n\t\t'));
		}

		// User defined BODY code
		if (bodyHook) {
			out.println(getProcessed(bodyHook));
		}

	out.println('\t</body>');
out.println('</html>');
%>