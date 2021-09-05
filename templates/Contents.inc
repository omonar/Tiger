<%	// Contents.inc

	if (fileTitle) {
		out.println('\t\t\t\t\t\t<h2>' + fileTitle + '</h2>');
	}
	if (comment) {
		out.println('\t\t\t\t\t\t<div class="caption">' + comment + '</div>');
	}
	
	out.println('\t\t\t\t\t\t<div class="content' + (showContentsThumbs? ' showthumbs' : '') + '">');
		out.println(getCatalogue(rootFolder, relPath, showContentsDescriptions, showContentsThumbs, (typeof showContentsPages === 'undefined')? false : showContentsPages));					
	out.println('\t\t\t\t\t\t</div>');
	
%>