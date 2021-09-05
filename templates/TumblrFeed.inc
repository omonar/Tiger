<%	// TumblrFeed.inc
	
	if (fileTitle) {
		out.println('\t\t\t\t\t\t<h2>' + fileTitle + '</h2>');
	}
	
	if (comment) {
		out.println('\t\t\t\t\t\t<div class="caption">' + comment + '</div>');
	}
	
	if (tumblrId) {
		out.println('\t\t\t\t\t\t<div class="tumblr-page">' +
				'<script type="text/javascript" src="//' + tumblrId + '.tumblr.com/js' +
					(tumblrPostCnt? ('?num=' + tumblrPostCnt) : '') + 
				'"></script>' +
			'</div>');
	}
%>