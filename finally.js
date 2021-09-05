/* 
 *	Finally.js - closing album creation
 */

	if (_useExtraSizes) {
		createExtraSizes(rootFolder, extraSizes, true);
	}
	
	if (_useZip && zipImages !== 'none') {
		zip.createZip(zipImages);
	}
	
	if (typeof writeSitemapXml !== 'undefined' && writeSitemapXml) {
		closeSitemap();
	}  else {
		removeSitemap();
	}