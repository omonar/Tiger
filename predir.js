/* 
 *	predir.js - index page preprocessing
 */

	processFolder(currentFolder);

	if (typeof writeSitemapXml !== 'undefined' && writeSitemapXml) {
		addFolderToSitemap(currentFolder);
	}
