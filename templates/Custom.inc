<%	// Custom.htt skin specific part
	
	// Adding Title and Comment
	if (fileTitle || comment) {
		
		if (fileTitle) {
			out.println('\t\t\t\t\t\t<h2>' + fileTitle + '</h2>');
		}
		
		if (comment) {
			if (comment.indexOf('<') >= 0) {
				// Contains HTML code probably
				out.println('\t\t\t\t\t\t' + getProcessed(comment));
			} else {
				// Preformatted text
				out.println('\t\t\t\t\t\t<div class="content">' + formatPlainText(comment) + '</div>');
			}
		}
	}
%>