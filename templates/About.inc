<%	// About.htt skin specific part

	var title = aboutHeader || fileTitle,
		cont = (function() {
					var s = '';
					if (typeof aboutText !== UNDEF && aboutText) {
						s += '<div class="text">' + 
								((aboutText.indexOf('<') >= 0)? getProcessed(aboutText) : formatPlainText(aboutText)) +
							'</div>';
					}
					if (comment) {
						s += '<div class="text">' + 
								((comment.indexOf('<') >= 0)? getProcessed(comment) : formatPlainText(comment)) +
							'</div>';
					}
					return s;
				}());
	
	if (authorImage) {
		out.println('\t\t\t\t\t<div class="author-image"><img src="' + 
			(authorImage.match(/^https?\:\/\//i)? '' : (resPath + '/')) + authorImage + 
			'" alt="' + getText('author') + '"></div>');
	}
	
	if (title || cont) {
		out.println('\t\t\t\t\t<div class="content">' +
				(title? ('\t\t\t\t\t\t<h2>' + title + '</h2>') : '') + cont +
			'\t\t\t\t\t</div>');
	}
%>