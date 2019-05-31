/* 
 *	Finally.js - closing album creation
 */

	if (extraSizes) {
		createExtraSizes(rootFolder, extraSizes, true);
	}
	
	if (zipImages !== 'none') {
		zip.createZip(zipImages);
	}