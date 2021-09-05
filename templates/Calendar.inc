<%	// Calendar.inc

	if (fileTitle) {
		out.println('\t\t\t\t\t\t<h2>' + fileTitle + '</h2>');
	}
	
	if (comment) {
		out.println('\t\t\t\t\t\t<div class="caption">' + comment + '</div>');
	}
	
	out.println(getCalendar(currentFolder, relPath, calendarSubfolders, calendarThumbs, calendarDateSource));
	
%>