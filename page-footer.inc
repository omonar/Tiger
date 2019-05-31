<%--------------------------------
			Page footer 
--------------------------------%>
					</article>
				</div>
			</div>
		</div>
		
		<%-- Footer --%>
		<div class="page-bottom">
			<div class="row footer">
				<div class="<%= 'large-' + (12 - (_useFacebookBox? 4 : 0)) + ' medium-6' %> columns">
					<footer class="${pageType}">
						<div class="folder-info">
						<ja:if test="${pageType}" value="index">
							<ja:if exists="bottomNavigation"><div class="bottom-navigation"><div>${bottomNavigation}</div></div></ja:if>
							<ja:if test="${level}" value="0"><ja:if exists="albumInfo">${albumInfo}</ja:if></ja:if>
							<ja:else><ja:if exists="folderInfo">${folderInfo}</ja:if></ja:else>
						</ja:if>
						<ja:else><ja:if test="${pageType}" value="page">
							<ja:if test="${_useBottomNavigation}"><div class="bottom-navigation"><div><%= currentFolder.getVars().get('bottomNavigation'); %></div></div></ja:if>
						</ja:if></ja:else>
							<ja:if exists="credits"><span class="credits">${credits}</span></ja:if>
						</div>
						<ja:if test=<%= footer && !(level && footerTopLevelOnly) %>><%= getProcessed(footer) %></ja:if>
						<ja:include page="footer.inc" />
					</footer>
				</div>
				<ja:if test="${_useFacebookBox}">
				<div class="large-4 columns social-box" id="facebook-box">
					<div class="fb-page" data-href="https://www.facebook.com/${facebookPageId}" data-colorscheme="${footerBoxTheme}" data-small-header="true" data-width="${footerBoxWidth}" data-hide-cover="<%= !facebookHeader %>" data-show-facepile="${facebookFaces}" data-show-posts="false"><div class="fb-xfbml-parse-ignore"><blockquote cite="https://www.facebook.com/${facebookPageId}"><a href="https://www.facebook.com/${facebookPageId}">${facebookPageId}</a></blockquote></div></div>
				</div>
				</ja:if>
			</div>
		</div>
		
		<%-- Popups --%>
		
		<%-- Share window --%>
		<ja:if test="${_anyShares}">
		<div class="modal hidden" id="social-share" role="dialog" data-modal>
			<div class="window has-header">
				<header>${text.shareAlbum}</header>
				<a class="btn close" data-close aria-label="${text.closeWindow}" data-tooltip title="${text.closeWindow}"></a>
				<div class="content row share-card">
					<div class="preview clearfix">
						<div class="thumb">
							<img src="${folderThumbFileName}" alt="${title}">
						</div>
						<div class="caption">
							<h3>${title}</h3>
							<ja:if exists="pageDescription"><p>${pageDescription}</p></ja:if>
						</div>
					</div>
					<div class="social-links text-center"></div>
				</div>
			</div>
		</div>
		</ja:if>
		
		<%-- Album info --%>
		<ja:if exists="header">
		<div class="modal hidden" id="album-info" role="dialog" data-modal>
			<div class="window has-header">
				<header>${albumTitle}</header>
				<a class="btn close" data-close aria-label="${text.closeWindow}" data-tooltip title="${text.closeWindow}"></a>
				<div class="content"><%= getProcessed(header) %></div>
			</div>
		</div>
		</ja:if>
			
		<%-- Help --%>
		<ja:if test="${showHelp}">
		<div class="modal hidden" id="help" role="dialog" data-modal>
			<div class="window large has-header">
				<header>${text.help}</header>
				<a class="btn close" data-close aria-label="${text.closeWindow}" data-tooltip title="${text.closeWindow}"></a>
				<div class="content row">
					<div class="large-6 columns"><p><img src="${resPath}/help-index.svg" alt="${text.help}"></p></div>
					<div class="large-6 columns">
						<ol><li>${text.help.topNavigation}</li><li>${text.help.search}</li><li>${text.help.backgroundAudio}</li><li>${text.help.upOneLevel}</li><li>${text.help.authorInfo}</li><li>${text.help.shareAndLike}</li><li>${text.help.downloadZip}</li><li>${text.help.startSlideshow}</li></ol>
					</div>
				</div>
				<hr>
				<div class="content row">
					<div class="large-6 columns"><p><img src="${resPath}/help-lightbox.svg" alt="${text.help}"></p></div>
					<div class="large-6 columns">
						<ol><li>${text.help.previousPicture}</li><li>${text.help.backToIndex}</li><li>${text.help.toggleFit}</li><li>${text.help.toggleInfo}</li><li>${text.help.toggleThumbnails}</li><li>${text.help.toggleAutoPlay}</li><li>${text.help.nextPicture}</li><li>${text.help.meta}</li><li>${text.help.map}</li><li>${text.help.faces}</li><li>${text.help.downloadImage}</li><li>${text.help.shop}</li><li>${text.help.share}</li></ol>
					</div>
				</div>
			</div>
		</div>
		</ja:if>
		
		<%-- Modernizr for modern browsers --%>
		<script src="${resPath}/modernizr.js"></script>
		
		<%-- jQuery library --%>
		<ja:if test="${avoidCDNs}">
		<script src="${resPath}/jquery.min.js"></script>
		</ja:if><ja:else>
		<%-- Google CDN first, then local --%>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery${min}.js"></script>
		<script>window.jQuery || document.write('<script src="${resPath}/jquery.min.js"><\/script>');</script>
		</ja:else>
		
		<ja:if test="${_anyVr}">
		<script src="${resPath}/photosphere/three.min.js"></script>
		<script src="${resPath}/photosphere/photo-sphere-viewer.min.js" async defer></script>
		</ja:if>
		
		<ja:if test="${_useFotomoto}">
		<script src="https://widget.fotomoto.com/stores/script/${fotomotoID}.js?api=true${fotomotoAid}" async defer></script>
		</ja:if>
		
		<%-- The concatenated JS file --%>
		<script src="${resPath}/all${min}.js?v=${skinVersion}"></script>
		<script>
			_jaWidgetBarColor = '${widgetBarColor}';
			<%-- Page initialization scripts --%>
			$(document).ready(function(){			
					<ja:include page="index-scripts.inc" />
				});
			<%-- Javascript hook --%>
			<ja:if exists="jsHook"><%= engine.processTemplate(jsHook) %></ja:if>
		</script>
		<%= getCustomPageJS(currentObject, typeof debugMode !== UNDEF && !!debugMode); %>
		
		<%-- Widget inclusion relocated --%>
		<ja:widget pageType="index" />
		
		<%-- Facebook root --%>
		<ja:if test=<%= _useFacebook || _useFacebookBox %>>
		<div id="fb-root"></div>
		</ja:if>
		
		<%-- User defined footer code --%>
		<ja:if exists="bodyHook">
		<ja:if test="${bodyFitWidth}">
		<div class="row below-body">
			<div class="columns">
				<%= getProcessed(bodyHook) %>
			</div>
		</div>
		</ja:if>
		<ja:else>
		<%= getProcessed(bodyHook) %>
		</ja:else>
		</ja:if>
		
	</body>
</html>
