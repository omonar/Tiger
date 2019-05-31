<%
	var	JDate = Java.type("java.util.Date"),
		Dates = Java.type("se.datadosen.util.Dates"),
		startMo = 'Jan/Feb/Mar/Apr/May/Jun/Jul/Aug/Sep/Oct/Nov/Dec'.indexOf(startMonth) / 4,
		startTime = new JDate(
				startYear - 1900, 
				startMo, 
				startDay
			),
		startDayOfWeek = startTime.getDay(),
		dateFormat = engine.getDateFormat() || 'yyyy MMM dd EE',
		settings = {
				rootPath:	rootPath,
				resPath:	resPath,
				relPath:	relPath.replace(/\/$/, ''),
				start:		new Date(startYear, startMo, startDay),
				duration:	duration || 24,
				lightbox:	getLightboxVars()['lightbox']
			}; 
	
	if (indexName !== 'index.html') {
		settings['indexName'] = indexName;
	}
	
	if (select !== 'latest') {
		settings['select'] = select;
	}
	
	var n = 0;
	
	if (locale && !locale.match(/^(en_US|en_CN|en_AU|en_ZA|af_ZA|hi_IN|ja_JP|he_IL|pt_BR)/)) {
		startDayOfWeek = (startDayOfWeek - 1) % 7;
	}
	
	out.print('\n\t\t\t\t\t\t<section class="row thumb-cont adventcalendar-cont" data-adventcalendar=\'' + JSON.stringify(settings) + '\'>' +
		'<div class="large-12 columns">' +
		'<div class="thumbnails row small-up-2 medium-up-4 large-up-7">');
	
	for (var n = 0; n < startDayOfWeek; n++) {
		out.println('<div class="column empty"><div class="card empty"></div></div>');
	}
	for (var n = 0, d = startTime; n < duration; n++) {
		out.println('<div class="column"><div class="card"><a class="thumb vertical-middle"></a><div class="cover"><p>' + Dates.format(d, 'MMMM') + '</p><h1>' + d.getDate() + '</h1><p>' + Dates.format(d, 'EEEE') + '</p></div></div></div>');
		d.setDate(d.getDate() + 1)
	}
	
	out.println('</div></div></section>');

%>