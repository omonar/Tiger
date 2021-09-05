<%	// Sitemap.htt

	if (fileTitle) {
		out.println('\t\t\t\t\t\t<h2>' + fileTitle + '</h2>');
	}
	
	if (comment) {
		out.println('\t\t\t\t\t\t<div class="caption">' + comment + '</div>');
	}
	
	out.println('\t\t\t\t<div class="sitemap' + (showSitemapThumbs? ' showthumbs' : '') + '">');
		out.println('\t\t\t\t\t<div class="title">' +
				'<a href="' + rootPath + '/' + indexName + '" class="icon-home">' + albumTitle + '</a>' +
				(showSitemapDescriptions? ('<small>' + albumDescription + '</small>') : '') +
			'</div>');
		out.println('\t\t\t\t\t' + getSitemap(rootFolder, '', showSitemapDescriptions, showSitemapThumbs));
	out.println('\t\t\t\t</div>');
	
%>