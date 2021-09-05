;
/* 
 *	The Album model
 * 
 *	(c) Laszlo Molnar, 2015, 2017, 2020
 *	Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 
 *	<http://creativecommons.org/licenses/by-nc-sa/3.0/>
 *
 *	requires: jQuery, laza.util
 */

 
/*
 * 	Constants
 */
 
const J = {
		// jAlbum variables
		ALBUM:					'album',				// jAlbum's album data 
		FOLDERS: 				'folders',				// Folders array
		NAME: 					'name',					// FileName of the item
		PATH: 					'path',					// Path to file
		THUMB: 					'thumb',				// Thumbnail properties object
		IMAGE: 					'image',				// Image properties object
		WIDTH: 					'width',				// Width
		HEIGHT: 				'height',				// Height
		RENDITIONS:				'renditions',			// Variant renditions
		ORIGINAL: 				'original',				// Original object
		OBJECTS: 				'objects',				// Objects array (not folders)
		FILEDATE: 				'fileDate',				// File modified date
		COMMENT: 				'comment',				// Comment
		TITLE: 					'title',				// Title
		COUNTERS: 				'counters',				// Counters object
		DEEPCOUNTERS: 			'deepCounters',			// Deepcounters object
		FILESIZE: 				'fileSize',				// File size (int)
		CATEGORY: 				'category',				// Category
		KEYWORDS: 				'keywords',				// Keywords
		RATING:					'rating',				// Rating
		CAMERA: 				'camera',				// Camera data object
		VIDEO: 					'video',				// Video data object
		DURATION:				'duration',				// Video duration
		FPS:					'fps',					// Video frame per sec.
		HIDDEN:					'hidden',				// Hidden
		// extra vars
		LEVEL: 					'level',				// Folder depth level
		PATHREF: 				'pathRef',				// Path from root
		PARENTREF: 				'parentRef',			// Path to parent from root
		RELPATH: 				'relPath',				// Relative path from currentFolder to this folder 
		FOLDERCAPTION:			'folderCaption',		// Folder caption derived from template
		IMAGECAPTION: 			'imageCaption',			// Image caption derived from template
		THUMBCAPTION: 			'thumbCaption',			// Thumbnail caption derived from template
		PHOTODATA: 				'photodata',			// Formatted photo data
		LOCATION: 				'location',				// GPS location
		REGIONS:				'regions',				// Regions (face tags)
		SHOP:					'shop',					// Global or individual shop options
		EXTERNAL:				'external',				// External (link or content)
		PROJECTIONTYPE:			'projectionType',		// 3D image projection type (equirectangular)
		ORIGINALFILE:			'originalFile',			// Path to the original file in case of GIF's
		DATES:					'dates',				// Dates object
		ADDED:					'added',				// Added date
		TAKENDATE:				'takenDate',			// Date taken
		MODIFIEDDATE:			'modifiedDate',			// Date modified
		DATERANGE:				'dateRange',			// Date range (folders)
		MOSTPHOTOS: 			'mostphotos',			// Mostphotos ID
		FOTOMOTOCOLLECTION:		'fotomotoCollection',	// Fotomoto collection type
		SOUNDCLIP:				'soundClip',			// Attached soundclip (mp3)
		PANORAMA:				'panorama',				// To be treated as panorama?
		FILTERS:				'filters',				// Filters array (global or folders)
		SORT:					'sort',					// Sort array (global or folders)
		VISITORRATING:			'visitorRating',		// Ratings from jAlbum
		OBJ: 					'obj',					// Store item as data attr of an element: el.data(J.OBJ)  
		LOADCOUNTER:			'loadcounter',			// Load counter array by category
		TOTAL:					'total',				// Total items loaded
		FOLDERINDEX:			'folderindex',			// Numbering folders: 0 ... N
		SIZE:					'size',					// External content embed size 
		CONT:					'cont'					// External content
	},
	
	JCAMERAFIELDS = [
		'aperture',
		'exposureTime',
		'originalDate',
		'cameraModel',
		'location',
		'focusDistance',
		'focalLength35mm',
		'cameraMake',
		'resolution',
		'isoEquivalent',
		'flash',
		'focalLength'
	];

/*
 *	Album object :: use 
 *		myAlbum = new Album({settings});
 *		or
 *		myAlbum = new Album();
 *		myAlbum.init({settings});
 */

var Album = function($, options) {
	
	let instance = null,
	
		settings = {
				// Name of the tree file
				treeFile: 				'tree.json',
				// Name of the folder data
				dataFile: 				'data1.json',
				// Name of the master file
				deepDataFile:			'deep-data.json',
				// index file name
				indexName: 				'index.html',
				//Folder image file name
				folderImageFile:		'folderimage.jpg',
				// Folder image dimensions
				folderImageDims:		[ 1200, 800 ],
				// Folder thumbnail file name 
				folderThumbFile:		'folderthumb.jpg',
				// Folder thumbnail dimanesions
				folderThumbDims:		[ 1024, 768 ],
				// Thumbnail dimensions
				thumbDims:				[ 240, 180 ],
				// Name of the thumbs folder
				thumbsDir: 				'thumbs',
				// Name of the slides folder
				slidesDir: 				'slides',
				// Name of the hires folder
				hiresDir:				'hi-res',
				// Default poster images
				audioPoster:			'audio.poster.png',
				defaultAudioPosterSize:	[ 628, 360 ],
				videoPoster:			'video.poster.png',
				defaultVideoPosterSize:	[ 628, 360 ],
				// Path to root from current folder (eg. "../../")
				rootPath: 				'',
				// Relative path to the current folder (eg. "folder/subfolder") 
				relPath: 				'',
				// Loading the whole data tree
				loadDeep:				false,
				// Lazy load :: loads folder data only when requested or at the time of initialization
				lazy: 					true,
				// Possible object types
				possibleTypes:			[ 'folder', 'webPage', 'webLocation', 'image', 'video', 'audio', 'other' ]					
			},
			
		// Texts translated
		text = getTranslations({
				and:						'and',
				from:						'From {0}'
			}),
		
		// Global variables
		// URL of to top level album page (null => we're in the album's subfolder, using the relative "rootPath") 
		albumPath = null,
		// Absolute URL of the top level page
		absolutePath,
		// Cache buster
		cacheBuster = '',
		// The container for the entire tree
		tree = {},
		// Collection of album paths from root in order to store only the references
		paths = [],
		// Collection of relative paths in order to store only the references
		relPaths = [],
		// Path to current folder
		currentFolder,
		// Collection the JSON promises
		defer = [],
		// Album ready state: tree.json and data1.json is loaded
		ready = false,
		// Deep ready: all the data structure is ready
		deepReady = false,
		// Is ready?
		isReady = () => (ready),
		// Is ddep ready?
		isDeepReady = () => (deepReady),
		
		/***********************************************
		 *					Debug
		 */
		 
		// Logging
		
		// Logging
		scriptName = 'jalbum-album.js',
	
		log = function(txt) {
			
				if (console && txt) {
					
					if (txt.match(/^Error\:/i)) {
						console.error(scriptName + ' ' + txt);
					}
					
					if (DEBUG) {
						if (txt.match(/^Warning\:/i)) {
							console.warn(scriptName + ' ' + txt);
						} else if (txt.match(/^Info\:/i)) {
							console.info(scriptName + ' ' + txt);
						} else {
							console.log(scriptName + ' ' + txt);
						}
					}
				}
			},
					
		// Returns the whole internal tree object
		getTree = () => (tree),
			
		// Returns paths array :: debug 
		//getPaths = () => (paths),
		
		// Utility functions
		getFilenameFromURL = (n) => ( decodeURIComponent(n.slice(n.lastIndexOf('/') + 1)) ),
		
		// File name without extension
		getBasename = (o) => { 
				var m = getItemName(o).match(/^(.+)\./); 
				return m? m[1] : '';
			},
				
		// File extension
		getExtension = (o) => { 
				var m = getItemName(o).match(/\.(\w+)$/); 
				return m? m[1] : '';
			},
				
			
		/***********************************************
		 *					Type check
		 */
		 
		// Image?
		isImage = (o) => (o.hasOwnProperty(J.CATEGORY) && o[J.CATEGORY] === 'image'),
			
		// Audio?
		isAudio = (o) => (o.hasOwnProperty(J.CATEGORY) && o[J.CATEGORY] === 'audio'),
			
		// Video?
		isVideo = (o) => (o.hasOwnProperty(J.CATEGORY) && o[J.CATEGORY] === 'video'),
			
		// Folder?
		isFolder = (o) => (o.hasOwnProperty(J.LEVEL)),
			
		// Ordinary object?
		isLightboxable = (o) => (!o.hasOwnProperty(J.FOLDERINDEX) && 
				o.hasOwnProperty(J.CATEGORY) && 
				'image.video.audio.other'.indexOf(o[J.CATEGORY]) !== -1),
	
		// Is this the current folder?
		isCurrentFolder = (o) => (o === currentFolder),
			
		/***********************************************
		 *					Access
		 */
		 
		// Returns path separated with separator 
		/*	'': 			current, 
			'/': 			album root, 
			'folderName': 	subfolder,
			'name1/name2':	deep folder
		*/
		
		makePath = function() {
			
				if (arguments.length) {
					let p = [];
					
					for (let i = 0, a; i < arguments.length; i++) {
						a = arguments[i];
						
						if (!a.length) {
							// Can be empty
							continue;
						}
						
						if (a === '/') {
							// Return to root
							p = [];
						} else {
							// Removing trailing slashes if any
							if (a[0] === '/') {
								a = a.slice(1);
							}
							if (a.slice(-1) === '/') {
								a = a.slice(0, -1);
							}
							
							if (a.length) {
								// Adding segment
								p.push(a);
							}
						}
					}
						
					return p.join('/');
				}
				
				return '';
			},
			
		// Get absolute path to folder from relative folder path
		
		getAbsoluteFolderPath = (path) => {
			
				if (typeof path === UNDEF) {
					return window.location.href.substring(0, window.location.href.lastIndexOf('/'));
				} else if (path.match(/^https?\:\/\//i)) {
					// Absolute
					return path;
				} else if (path[0] === '/') {
					// Site root relative
					return window.location.origin + path;
				} else {
					let url = window.location.href;
					// Find last '/'
					url = url.substring(0, url.lastIndexOf('/'));
					// Go back until ../
					if (path.endsWith('..')) {
						// Ensure to avoid ".." ending
						path += '/';
					}
					while (path.startsWith('../')) {
						url = url.substring(0, url.lastIndexOf('/', url.length - 2));
						path = path.slice(3);
					}
					return url + path;
				}
			},
			
		// Getting path reference either by searching or adding as new
		// 0 => top level folder
		
		getPathRef = (p) => {
			
				if (typeof p === UNDEF || !p) {
					// Top level folder
					return 0;
				}
			
				if (p.slice(-1) !== '/') {
					// Sanitizing paths: adding extra slash at the end 
					p += '/';
				}
				
				let idx = paths.indexOf(p);
				
				if (idx >= 0) {
					// Found => return
					return idx + 1;
				}
				
				// Add new
				return paths.push(p);
			},
			
		// Reverse function
		
		toPath = (o) => ((o.hasOwnProperty(J.PATHREF) && o[J.PATHREF])? paths[o[J.PATHREF] - 1] : '');
			
		
		// Getting path reference either by searching or adding as new
		// 0 => current folder
		
		getRelPathRef = (p) => {
			
				if (typeof p === UNDEF || !p) {
					// Current folder
					return 0;
				}
			
				if (p.slice(-1) !== '/') {
					// Sanitizing paths: adding extra slash at the end 
					p += '/';
				}
				
				let idx = relPaths.indexOf(p);
				
				if (idx >= 0) {
					// Found => return
					return idx + 1;
				}
				
				// Add new
				return relPaths.push(p);
			},
		
		// Reverse function
		
		toRelPath = (o) => ((o.hasOwnProperty(J.RELPATH) && o[J.RELPATH])? relPaths[o[J.RELPATH] - 1] : '');	
		
		// Fixing path containing ../ part(s)
		
		fixUrl = (p) => {
				let i, 
					j, 
					t = this + '';
					
				while ((i = t.indexOf('../')) > 0) {
					if (i === 1 || (j = t.lastIndexOf('/', i - 2)) === -1) {
						return t.substring(i + 3);
					}
					t = t.substring(0, j) + t.substring(i + 2);
				}
				
				return t;
			},
			
		// Get absolute URL to album's root folder
		
		getAlbumPath = () => {
			
				if (albumPath !== null) {
					return albumPath;
				}
				
				let p = window.location.pathname,
					l = currentFolder[J.LEVEL];
				
				do {
					p = p.substring(0, p.lastIndexOf('/'));
					l = l - 1;
				} while (l >= 0);
				
				return p;
			},
			
		// Get album root folder
		
		getAlbumRootPath = () => absolutePath,
			
		// Getting folder path for an object (absolute or relative)
		
		getPath = (o) => {
				if (typeof o !== UNDEF) {
					if (albumPath !== null) {
						// External reference
						return makePath(albumPath, toPath(o));
					} else {
						// Within album, has relative path
						return toRelPath(o);
					}
				}
				// Top level or external reference to top level
				return albumPath || '';
			},
			
		// Getting path from album root to the item's folder
		
		getFolderPath = (o) => (
				(typeof o !== UNDEF)? toPath(o) : ''
			),
			
		// Getting absolute path for an object
		
		getAbsolutePath = (o) => (
				o.hasOwnProperty(J.LEVEL)?
						// Folder
					makePath(albumPath || absolutePath, getFolderPath(o))
						:
						// Object
					makePath(albumPath || absolutePath, getFolderPath(o), settings.indexName + '#img=' + o[J.PATH])
			),
			
		// Gets the path to item: absolute or relative
		
		getItemPath = (o) => {
				let p = getPath(o),
					c = o[J.CATEGORY] || 'folder';
				
				if (c === 'folder') {
					return p;
				} else if (c === 'video') {
					return makePath(p, o[J.VIDEO][J.PATH]);
				} else if (c === 'audio' || c === 'other' || o.hasOwnProperty(J.ORIGINAL)) {
					return makePath(p, o[J.ORIGINAL][J.PATH]);
				} else if (c === 'image') {
					return makePath(p, o[J.IMAGE][J.PATH]);
				} else if (c === 'webPage') {
					return makePath(p, o[J.PATH]);
				} else {
					// webLocation: absolute
					return o[J.PATH];
				}
			},
			
		// Getting path to object from album root
		
		getObjectPath = (o) => (
				(typeof o !== UNDEF)? (toPath(o) + ((o[J.CATEGORY] !== 'folder')? o[J.PATH] : '')) : null
			),
			
		// Tries to figure out the items dimensions
		
		getDimensions = function(o) {
				
				if (o.hasOwnProperty(J.EXTERNAL)) {
					// External content
					let s = o[J.EXTERNAL][J.SIZE];
					
					if (s) {
						// Has manually specified size
						s = s.split('x');
						return [ s[0], s[1] || Math.round(s[0] *.75)];
						
					} else {
						s = guessDimensions(o[J.EXTERNAL][J.CONT]);
						if (s) {
							// Has explicitly given size in the HTML code
							return s;
						} else {
							// No info
							if (o[J.EXTERNAL][J.CONT].includes('vimeo.com') ||
								o[J.EXTERNAL][J.CONT].includes('youtube.com')) {
								// In case of YouTube or Vimeo with 720p as default
								w = 1280;
								if ((s = o[J.EXTERNAL][J.CONT].match(/.*style="padding(-bottom)?:\s?([\d\.]+)%/)) && s && (s.length > 1)) {
									// Responsive embedding
									return [ 1280, Math.round((w * parseFloat(s[2])) / 100) ];
								} else {
									return [ 1280, 720 ];
								}
							} else {
								return [ o[J.IMAGE][J.WIDTH], o[J.IMAGE][J.HEIGHT] ];
							}
						}
					}
				} else if (o[J.CATEGORY] === 'audio' && o[J.IMAGE][J.PATH].endsWith('res/audio.png')) {
					// Audio with poster image
					return [ settings.defaultAudioPosterSize[0], settings.defaultAudioPosterSize[1] ];
					
				} else if (o[J.CATEGORY] === 'video') {
					// Video
					return [ o[J.VIDEO][J.WIDTH], o[J.VIDEO][J.HEIGHT] ];
					
				} else if (o[J.CATEGORY] === 'other' && getExtension(o).toLowerCase() === 'pdf') {
					// PDF
					return null;
				/*
				} else if (o.hasOwnProperty(J.PROJECTIONTYPE) && o[J.PROJECTIONTYPE] === 'equirectangular') {
					// VR image
					return null;
				*/
				}
				
				if (settings.linkOriginals && settings.hiDpi) {
					return [ o[J.IMAGE][J.WIDTH] / 2, o[J.IMAGE][J.HEIGHT] / 2 ];
				}
				
				return [ o[J.IMAGE][J.WIDTH], o[J.IMAGE][J.HEIGHT] ];
			},
			
		// Tries to figure out the original image dimensions
		
		getOriginalDimensions = function(o) {
			
				if (o[J.CATEGORY] === 'video') {
					// Video
					return [ o[J.VIDEO][J.WIDTH], o[J.VIDEO][J.HEIGHT] ];
				}
				
				if (o.hasOwnProperty(J.ORIGINAL)) {
					return [ o[J.ORIGINAL][J.WIDTH], o[J.ORIGINAL][J.HEIGHT] ];
				}
				
				return null;
			},
			
		// Tries to figure out the original image dimensions
		
		getMaxDimensions = function(o) {
				let dim = getOriginalDimensions(o);
				
				if (dim) {
					// Has original
					return dim;
				} else if (o.hasOwnProperty(J.IMAGE)) {
					// Has image
					let img = o[J.IMAGE];
					
					if (img.hasOwnProperty(J.RENDITIONS)) {
						// Has renditions (variants)
						dim = [ img[J.RENDITIONS][0][J.WIDTH], img[J.RENDITIONS][0][J.HEIGHT] ];
					
						for (let i = 1; i < img[J.RENDITIONS].length; i++) {
							if (img[J.RENDITIONS][i][J.WIDTH] > dim[0]) {
								dim = 	[ img[J.RENDITIONS][i][J.WIDTH], img[J.RENDITIONS][i][J.HEIGHT] ];
							}
						}
						
						return dim;
						
					}
						
					return [ img[J.WIDTH], img[J.HEIGHT] ];
				}
				
				return null;
			},
			
		// Returns absolute or relative link to object in the real album
		
		getLink = function(o) {
			
				if (typeof o !== UNDEF) {
					
					switch (o[J.CATEGORY]) {
						
						case 'folder':
							
							return getPath(o);
							
						case 'webLocation':
							
							return o[J.PATH];
							
						case 'webPage':
							
							return makePath(getPath(o), o[J.PATH]);
							
						default:
							
							// Image or other lightboxable item
							return makePath(getPath(o), '#img=' + o[J.PATH]);
					}
				}
				
				return '';
			},
							
		// Get path to item from root
		
		getRootPath = (o) => makePath(getPath(o), o[J.PATH]),
			
		// Get the pointer to a folder in a tree from path reference number
		
		getPointer = function(n) {
			
				if (typeof n !== 'number' || n <= 0) {
					// root
					return tree;
				}
				
				n--;
				
				if (n > paths.length) {
					log('Error: out of bounds path reference (' + n + ')!');
					return null;
				}
				
				return getFolder(paths[n]);
			},
				
		// Gets relative folder path from the current folder (unnecessary)
		
		getRelativeFolderPath = (o) => ((settings.rootPath + toPath(o)).fixUrl()),
			
		// Returns folder object in a folder by name
		/*
		getFolderObject = function(folder, name) {
				if (folder.hasOwnProperty(J.FOLDERS)) {
					return folder[J.FOLDERS].find(function(f) { return f[J.PATH] === name; }); 
				}
				return null;
			},
		*/
		// Returns folder object by full path
		
		getFolder = function(path) {
				
				if (typeof path === UNDEF) {
					return null;
				} else if (!path.length) {
					return tree;
				}
				
				if (path.endsWith('/')) {
					path = path.slice(0, -1);
				}
				
				let folder = tree,
					p = path.split('/'),
					level;
					
				for (level = 0; level < p.length; level++) {
					if (folder.hasOwnProperty(J.FOLDERS) &&
						(folder = folder[J.FOLDERS].find(function(f) { 
								return f[J.PATH] === p[level]; 
							}))) {
						// Found, carry on
						continue;
					}
					return null;
				}
				
				return (level === p.length)? folder : null;
			},
		
		// Getting the parent
		
		getParent = function(o) {
			
				if (typeof o === UNDEF) {
					o = currentFolder;
				}
				
				if (o === tree) {
					// At top level
					return null;
				}
				
				// Getting current folder or the parent in case of a folder
				let p = o.hasOwnProperty(J.PARENTREF)? getPointer(o[J.PARENTREF]) : getPointer(o[J.PATHREF]);
				
				// Avoid endless loops
				return (p === o)? null : p;
			},
			
		// Getting an item from full path, waits for folder to load if not present
		// Optionally passing an extra parameter
		
		getItem = function(path, doneFn, p) {
				
				if (typeof doneFn !== FUNCTION) {
					return;
				}
				
				let _getItem = function(folder, name, doneFn) {
							if (folder.hasOwnProperty(J.OBJECTS)) {
								let o = folder[J.OBJECTS].find(function(o) { 
										return o[J.PATH] === name;
									});
								
								if (typeof o === UNDEF) {
									o = null;
								}
								
								if (typeof p !== UNDEF) {
									doneFn.call(o, p);
								} else {
									doneFn.call(o);
								}
							}
						};
						
				if (!path) {
					// Tree
					if (typeof p !== UNDEF) {
						doneFn.call(tree, p);
					} else {
						doneFn.call(tree);
					}
				} else if (path.endsWith('/')) {
					// Folder
					if (typeof p !== UNDEF) {
						doneFn.call(getFolder(path), p);
					} else {
						doneFn.call(getFolder(path));
					}
				} else {
					// An object
					let i = path.lastIndexOf('/'),
						folder = (i === -1)? tree : getFolder(path.substring(0, i)),
						name = path.substring(i + 1);
					
					if (folder) {
						// Exists
						if (folder.hasOwnProperty(J.OBJECTS)) {
							// Objects already loaded
							_getItem(folder, name, doneFn);
							
						} else {
							// Have to wait until objects get loaded
							loadData(folder, function(folder) {
									_getItem(folder, name, doneFn);
								});
						}
					}
				}
				
				return null;
			},
		
		// Current folder object
		
		getCurrentFolder = () => (currentFolder),
			
		// Returns all objects in a folder
		
		getObjects = () => (currentFolder.hasOwnProperty(J.OBJECTS)? currentFolder[J.OBJECTS] : []),
			
		// Returns only the lightboxable items
		
		getImages = function() {
				let items = [];
			
				if (currentFolder && currentFolder.hasOwnProperty(J.OBJECTS)) {
					
					currentFolder[J.OBJECTS].forEach(o => {
							if (isLightboxable(o)) {
								items.push(o);
							}
						});
				}
							
				return items;
			},
		
		// Returns only the folders
		
		getFolders = function() {
				let folders = [];
				
				if (currentFolder) {
					if (currentFolder.hasOwnProperty(J.FOLDERINDEX)) {
						// Using deep-data: every folder is in OBJECTS, FOLDERINDEX has indexes to OBJECTS
						currentFolder[J.FOLDERINDEX].forEach(i => {
								folders.push(currentFolder[J.OBJECTS][i]);
							});
						return f;
					} else if (currentFolder.hasOwnProperty(J.FOLDERS)) {
						folders = currentFolder[J.FOLDERS];
					} 
				}
							
				return folders.filter(f => !f.hasOwnProperty(J.HIDDEN) || !f.hidden);
			},
			
		/***********************************************
		 *				Properties
		 */
		 
		// Album make date/time in UTC
		
		getMakeDate = () => (new Date(tree[J.FILEDATE])),
			
		// Album title
		
		getAlbumTitle = () => (tree[J.TITLE] || tree[J.NAME]),
			
		// Filename for images, originalname for other
		
		getItemName = (o) => (
				(o[J.CATEGORY] === 'video')?
					getFilenameFromURL(o[J.VIDEO][J.PATH])
					:
					(o.hasOwnProperty(J.ORIGINAL)? 
						getFilenameFromURL(o[J.ORIGINAL][J.PATH])
						:
						o[J.NAME]
					)
			),
		
		// Level?
		
		getLevel = (o) => {
				o = o || currentFolder;
				return o.hasOwnProperty(J.LEVEL)? o[J.LEVEL] : getLevel(getParent(o));
			},
			
		// Title
		
		getTitle = (o) => ((o || currentFolder)[J.TITLE] || ''),
			
		// Name
		
		getName = (o) => ((o || currentFolder)[J.NAME] || ''),
			
		// Name
		
		getLabel = (o) => (((o || currentFolder)[J.NAME] || '').replace(/\.\w+$/, '').replace(/_/g, ' ')),
			
		// Title or name for ALT tags
		
		getAlt = (o) => (getTitle(o) || getName(o)),
		
		// Comment
		
		getComment = (o) => ((o || currentFolder)[J.COMMENT] || ''),
			
		// Thumbnail path (folder thumbs are moved up one level!)
		
		getThumbPath = (o) => (makePath(getPath(o), 
				o.hasOwnProperty(J.LEVEL)?
					// Folder
					o[J.THUMB][J.PATH].replace(o[J.PATH] + '/', '')
					:
					o[J.THUMB][J.PATH]
				)
			),
			
		// Image path (falls back to thumb path, e.g. PDF files)
		
		getImagePath = (o) => (makePath(getPath(o), 
				o.hasOwnProperty(J.LEVEL)?
					// Folder: grab the same image as thumb from slides
					o[J.THUMB][J.PATH].replace(settings.thumbsDir + '/', settings.slidesDir + '/') 
					:
					// Image or other
					(o.hasOwnProperty(J.ORIGINALFILE)?
						o[J.ORIGINALFILE]
						:
						(o.hasOwnProperty(J.IMAGE)? 
							o[J.IMAGE][J.PATH] 
							: 
							o[J.THUMB][J.PATH]
						)
					)
				)
			),
		
		// Absolute image path
		
		getAbsoluteImagePath = (o) => (makePath(absolutePath, toPath(o), getImagePath(o))),
			
		// Theme image path
		
		getThemeImagePath = (o) => (makePath(getPath(o), settings.folderImageFile)),
			
		// Original path
		
		getOriginalPath = (o) => 
				(o.hasOwnProperty(J.ORIGINALFILE)?
					makePath(getPath(o), o[J.ORIGINALFILE]) 
					:
					(o.hasOwnProperty(J.ORIGINAL)? 
						makePath(getPath(o), o[J.ORIGINAL][J.PATH]) 
						: 
						((o.hasOwnProperty(J.CATEGORY) && o[J.CATEGORY] === 'image')? 
							'/s3/photos/' + getFolderPath(o) + getName(o).replace('.webp','.jpg') 
							: 
							null 
						) 
					)
				),
			
		// Poster path for audio and video files
		
		getPosterPath = (o) => {
				let c = o[J.CATEGORY],
					ip = o[J.IMAGE][J.PATH];
					
				if ((c === 'audio' || c === 'video') && 
					!ip.startsWith(settings.slidesDir + '/')) {
					/* custom icon for audio or video */
					return makePath(settings.rootPath, 'res', settings[c + 'Poster']);
				}
				
				return makePath(getPath(o), o[J.IMAGE][J.PATH]);
			},
			
		// Get optimum sized representing image
		
		getOptimalImage = (o, dim) => makePath(getPath(o), 
				o.hasOwnProperty(J.LEVEL)?
				(
					// Folder
					(dim[0] > settings.folderThumbDims[0] || 
					 dim[1] > settings.folderThumbDims[1])? 
						settings.folderImageFile 
						: 
						settings.folderThumbFile
				)
				:
				(
					// Not folder
					(o.hasOwnProperty(J.ORIGINALFILE)?
						o[J.ORIGINALFILE]
						:
						(
							(o.hasOwnProperty(J.IMAGE) && 
								(dim[0] > settings.thumbDims[0] || 
								dim[1] > settings.thumbDims[1])
							)? 
								o[J.IMAGE][J.PATH] 
								: 
								o[J.THUMB][J.PATH]
						)
					)
				)
			),
			
		// Finding closest rendition
		
		getClosestRendition = function(r, dim) {
				
				if (!WEBP_LOSSY) {
					// No webp support: filtering out
					r = r.filter(o => !o.name.endsWith('.webp'));
				}
				
				if (r.length > 1) {
					let w = dim[0] * PIXELRATIO,
						h = dim[1] * PIXELRATIO;
						
					// Variants: calculate scale ratio
					r.forEach(o => {
							let s = Math.min(w / o.width, h / o.height);
							o.match = (s > 1)? 
									// Upscaling penalized by factor 3: 1x -> 120% == 2x -> 50%
									(3 * (1 - 1 / s))
									:
									// Downscaling
									(1 - s)
						});
						
					// Sort by scale
					r.sort((o1, o2) => ( o1.match - o2.match ));
				}
				
				return r[0];
			},
			
		// Get path to optimum image. If no dim specified the image is optimized for the screen size.
		
		getOptimalImagePath = function(o, dim, useOriginal) {
				
				if (o.hasOwnProperty(J.LEVEL)) {
					// A folder
					return settings.folderImageFile;
				}
			
				if (o.hasOwnProperty(J.ORIGINALFILE)) {
					return makePath(getPath(o), o[J.ORIGINALFILE]);
				}
				
				let r = o[J.IMAGE].hasOwnProperty(J.RENDITIONS)?
							getClosestRendition(o[J.IMAGE][J.RENDITIONS], dim || [ window.outerWidth, window.outerHeight ])
							:
							{
								width:		o[J.IMAGE][J.WIDTH],
								height:		o[J.IMAGE][J.HEIGHT]
							};
							
				if (typeof useOriginal !== UNDEF &&
					useOriginal &&
					o.hasOwnProperty(J.ORIGINAL) &&
					dim[0] > r[J.WIDTH]) {
					// Using the original
					return makePath(getPath(o), o[J.ORIGINAL][J.PATH]);
				}
				
				// No original: Using the closest rendition
				return makePath(getPath(o), r.hasOwnProperty(J.NAME)? (settings.slidesDir + '/' + r[J.NAME]) : o[J.IMAGE][J.PATH]);
			},
		
		// Get path to optimum thumb
		
		getOptimalThumbPath = function(o, dim) {
			
				if (o[J.THUMB].hasOwnProperty(J.RENDITIONS)) {
					// Has renditions
					let r = getClosestRendition(o[J.THUMB][J.RENDITIONS], dim),
						dir = settings.thumbsDir;
					
					if (dim[0] > r[J.WIDTH] * 1.15 || dim[1] > r[J.HEIGHT] * 1.15) {
						// Too large: find in the image renditions
						r = getClosestRendition(o[J.IMAGE][J.RENDITIONS], dim);
						dir = settings.slidesDir;
					}
					
					return makePath(getPath(o),  dir + '/' + r[J.NAME]);
				}
				
				// No renditions
				if (dim[0] > o[J.THUMB][J.WIDTH] * 1.15 || dim[1] > o[J.THUMB][J.HEIGHT] * 1.15) {
					// Too large for a thumb, use image
					return makePath(getPath(o), o[J.IMAGE][J.PATH]);
				}
				
				// Returning the thumb
				return makePath(getPath(o), o[J.THUMB][J.PATH]);
			},
		
		// Original or source path
		
		getSourcePath = (o) => makePath(getPath(o), 
				(o.hasOwnProperty(J.ORIGINAL)? 
					o[J.ORIGINAL][J.PATH] 
					: 
					(o.hasOwnProperty(J.IMAGE)? 
						o[J.IMAGE][J.PATH]
						:
						o[J.THUMB][J.PATH]
					)
				)
			),
			
		// Absolute path to an object as HTML page
		
		getAbsoluteItemPath = (o) => makePath(absolutePath, getItemPath(o)),
						
		// Get video duration in ms
		
		getVideoDuration = function(o) {
				let v = o[J.VIDEO],
					d,
					m;
				
				if (!v || !v.hasOwnProperty(J.DURATION)) {
					return null;
				}
				
				m = v[J.DURATION].match(/(\d{2})\:(\d{2})\:(\d{2})\.(\d+)/);
				
				return m?
						parseInt(m[4]) + parseInt(m[3]) * 1000 + parseInt(m[2]) * 60000 + parseInt(m[1]) * 3600000
						:
						null;
			},
			
		// Has shop options?
		
		hasShop = (o) => {
				let p = getInheritedPropertyObject(o || tree, J.SHOP);
				
				return p && (p['usePrice'] || p['options'] !== '-');
			},
			
		// Has map location?
		
		hasLocation = (o) => (o.hasOwnProperty(J.LOCATION) ||
				(o.hasOwnProperty(J.CAMERA) && o[J.CAMERA].hasOwnProperty(J.LOCATION))),
			
		// Get location in NN.NNN,NN.NNN format (Lat,long)
		
		getLocation = (o) => (
				o.hasOwnProperty(J.LOCATION)? 
					o[J.LOCATION]
					:
					(
						(o.hasOwnProperty(J.CAMERA) && o[J.CAMERA].hasOwnProperty(J.LOCATION))?
							(o[J.CAMERA][J.LOCATION]['lat'] + ',' + o[J.CAMERA][J.LOCATION]['long']) 
							:
							null
					)
			),
			
		// Get the lowest price of an item
		
		getPriceRange = function(o) {
				let p = getInheritedPropertyObject(o || tree, J.SHOP);
				
				if (p && p['options'] !== '-' && p['showPriceRange']) { 
					let	opt = p.options.split('::'),
						min = Number.MAX_VALUE,
						max = Number.MIN_VALUE;
					
					if (opt.length > 1) {
						for (let i = 0; i < opt.length; i++) {
							min = Math.min(parseFloat(opt[i].split('=')[1].split('+')[0]), min);
						}
						if (p.showPriceRange === 'minmax') {
							for (let i = 0; i < opt.length; i++) {
								max = Math.max(parseFloat(opt[i].split('=')[1].split('+')[0]), max);
							}
							return toCurrency(min, p['currency']) + '&ndash;' + toCurrency(max, p['currency']);
						}
						return text.from.template(toCurrency(min, p['currency']));
					} else {
						return toCurrency(opt[0].split('=')[1].split('+')[0], p['currency']);
					}
				}
				
				return '';
					
			},
			
		getCurrency = () => ( getRootProperty(J.SHOP)['currency'] || 'EUR' ),
			
		// Counting folders recursively (current folder included)
		
		getDeepFolderCount = function(folder) {
				let c = 0,
					f = (typeof folder === UNDEF)? currentFolder : folder;
				
				if (f.hasOwnProperty(J.FOLDERS)) {
					
					if (f.hasOwnProperty(J.DEEPCOUNTERS) && f[J.DEEPCOUNTERS].hasOwnProperty(J.FOLDERS)) {
						
						c = f[J.DEEPCOUNTERS][J.FOLDERS];
						
					} else {
						
						for (let i = 0, l = f[J.FOLDERS].length; i < l; i++) {
							c += getDeepFolderCount(f[J.FOLDERS][i]);
						}
						
						if (!f.hasOwnProperty(J.DEEPCOUNTERS)) {
							f[J.DEEPCOUNTERS] = {};
						}
						
						f[J.DEEPCOUNTERS][J.FOLDERS] = c;
					}
				}
				
				return c + 1;
			},
			
		// Getting folder count with max level
			
		getFolderCount = function(folder, levels) {
				let maxLevel = folder[J.LEVEL] + (levels || 0),
					_getCount = function(f) {
							let c = 0;
							
							if (f.hasOwnProperty(J.FOLDERS) && f[J.LEVEL] <= maxLevel) {
								// Count only within max levels
								for (let i = 0, l = f[J.FOLDERS].length; i < l; i++) {
									c += _getCount(f[J.FOLDERS][i]);
								}
							}
							
							return c + 1;
						};
						
				return _getCount(folder);
			},
			
		/*****************************
		 *		Generic property
		 */
		 
		// Returns a property from the root level
		
		getRootProperty = (a) => (tree.hasOwnProperty(a)? tree[a] : null),

		// Retrieving an Object property of an element with fallback to upper level folders
		
		getInheritedPropertyObject = function(o, a) {
				let p = {};
				
				do {
					if (o.hasOwnProperty(a)) {
						p = $.extend(true, {}, o[a], p);
					}
				} while (o = getParent(o));
				
				return (Object.getOwnPropertyNames(p)).length? p : null;
			},
						
		// Retrieving a single property of an element with fallback to upper level folders
		
		getInheritedProperty = function(o, a) {
				
				if (a.indexOf('.') >= 0) {
					a = a.split('.');
					
					if (a[0] === 'album') {
						return getRootProperty(a[1]);
					}
					
					do {
						if (o.hasOwnProperty(a[0])) {
							return $.extend(true, {}, o[a[0]][a[1]]);
						}
					} while (o = getParent(o));
					
					return null;
				}
					
				do {
					if (o.hasOwnProperty(a)) {
						return $.extend(true, {}, o[a]);
					}
				} while (o = getParent(o));
				
				return null;
			},
			
		// Returns a property (normal or inherited way)
		
		getProperty = function(o, a, inherit) {
				let r;
			
				if (inherit) {
					r = getInheritedProperty(o, a);
				} else if (a.indexOf('.') > 0) {
					a = a.split('.');
					r = (o.hasOwnProperty(a[0]))? o[a[0]][a[1]] : null;
				} else if (o.hasOwnProperty(a)) {
					r = o[a];
				}
				
				return $.extend(true, {}, r);
			},
		
		// Returns an Object property (normal or inherited way)
		
		getPropertyObject = (o, a, inherit) => ( 
				inherit? getInheritedPropertyObject(o, a) : (o.hasOwnProperty(a)? $.etxend(true, {}, o[a]) : null)
			),
					
		// Returns the next folder
		
		_getNextFolder = function(folder) {
				if (typeof folder === UNDEF) {
					let folder = currentFolder;
				}
				
				let parent = getParent(folder);
				
				if (parent) {
					let n;
					if (parent.hasOwnProperty(J.FOLDERINDEX)) {
						n = parent[J.FOLDERINDEX].findIndex(i => parent[J.OBJECTS][i] === folder);
						if (i < parent[J.FOLDERINDEX].length) {
							return parent[J.OBJECTS][parent[J.FOLDERINDEX][n + 1]];
						}
					} else if (parent.hasOwnProperty(J.FOLDERS)) {
						n = parent[J.FOLDERS].findIndex(f => f === folder);
						if (n < parent[J.FOLDERS].length) {
							return parent[J.FOLDERS][n + 1];
						}
					}
				}
				
				return null;
			},
		
		// Returns the previous folder
		
		_getPreviousFolder = function(folder) {
				if (typeof folder === UNDEF) {
					let folder = currentFolder;
				}
				
				let parent = getParent(folder);
				
				if (parent) {
					let n;
					if (parent.hasOwnProperty(J.FOLDERINDEX)) {
						n = parent[J.FOLDERINDEX].findIndex(i => parent[J.OBJECTS][i] === folder);
						if (n > 0) {
							return parent[J.OBJECTS][parent[J.FOLDERINDEX][n + 1]];
						}
					} else if (parent.hasOwnProperty(J.FOLDERS)) {
						n = parent[J.FOLDERS].findIndex(f => f === folder);
						if (n > 0) {
							return parent[J.FOLDERS][n + 1];
						}
					}
				}
				
				return null;
			},
				
		// Get next folder's first image
		
		getNextFoldersFirstImage = function(ready) {
				let img,
					folder = _getNextFolder(),
					
					_getFirstImage = function(folder) {
							if (folder.hasOwnProperty(J.OBJECTS)) {
								for (let o = folder[J.OBJECTS], i = 0, l = o.length; i < l; i++) {
									if (isLightboxable(o[i])) {
										return o[i];
									}
								}
							}
						};
				
				if (folder) {
					
					if (folder.hasOwnProperty(J.OBJECTS)) {
						ready.call(getFirstImage());
					} else {
						loadData(folder, function() {
								ready.call(_getFirstImage());
							});
					}
				}
				
				return null;
			},
		
		// Get previous folder's last image
		
		getPreviousFoldersLastImage = function(ready) {
				let img,
					folder = _getPreviousFolder(),
					
					_getLastImage = function(folder) {
							if (folder.hasOwnProperty(J.OBJECTS)) {
								for (let o = folder[J.OBJECTS], i = o.length - 1; i >= 0; i--) {
									if (isLightboxable(o[i])) {
										return o[i];
									}
								}
							}
						};
			
				
				if (folder) {
					
					if (folder.hasOwnProperty(J.OBJECTS)) {
						ready.call(getFirstImage());
					} else {
						loadData(folder, function() {
								ready.call(_getLastImage());
							});
					}
				}
				
				return null;
			},
			
		// Sort items: images, folders
		
		sortItems = function(images, folders, opt) {
			
				if (!Array.isArray(images)) {
					// Images array is mandatory
					return null;
				}
				
				if (!Array.isArray(folders)) {
					// No folders provided
					opt = folders || {};
					folders = null;
				}
				
				let options = $.extend({
						sortBy:				'original',			// No change
						reference:			J.DATETAKEN,		// Taken date
						reverse:			false,				// Not reversed
						foldersFirst:		true				// Put folders first
					}, opt);
				
				// Ordering items
				switch (options.sortBy) {
					
					case 'random':
						
						// Random
						
						images.sort(() => (0.5 - Math.random()));
						
						if (folders) {
							folders.sort(() => (0.5 - Math.random()));
						}
						
						break;
					
					case 'date': 
						
						// Date
						
						let ref = options['reference'];
						
						if (options.reverse) {
							
							images.sort((a, b) =>
								(( 	a.hasOwnProperty(J.DATES)? a[J.DATES][ref] : a[J.FILEDATE]) - 
									b.hasOwnProperty(J.DATES)? b[J.DATES][ref] : b[J.FILEDATE]));
							
							if (folders) {
								folders.sort((a, b) => (a[J.FILEDATE]) - b[J.FILEDATE]);
							}
							
						} else {
							
							images.sort((a, b) =>
								((	b.hasOwnProperty(J.DATES)? b[J.DATES][ref] : b[J.FILEDATE]) - 
									a.hasOwnProperty(J.DATES)? a[J.DATES][ref] : a[J.FILEDATE]));
							
							if (folders) {
								folders.sort((a, b) => (b[J.FILEDATE]) - a[J.FILEDATE]);
							}
						}
						
						break;
						
					case J.NAME:
						
						// File name
						
						if (options.reverse) {
							
							images.sort((a, b) => ('' + a[J.NAME]).localeCompare('' + b[J.NAME]));
							
							if (folders) {
								folders.sort((a, b) => ('' + a[J.NAME]).localeCompare('' + b[J.NAME])); 
							}
							
						} else {
							
							images.sort((a, b) => ('' + b[J.NAME]).localeCompare('' + a[J.NAME]));
							
							if (folders) {
								folders.sort((a, b) => ('' + b[J.NAME]).localeCompare('' + a[J.NAME]));
							}
							
						}
						
						break;
						
					case J.FILESIZE:
						
						// File size: only images
						
						if (options.reverse) {
							
							images.sort((a, b) => (a[J.FILESIZE] - b[J.FILESIZE]));
							
						} else {
						
							images.sort((a, b) => (b[J.FILESIZE] - a[J.FILESIZE]));
							
						}
						
						break;
						
					default:
						
						// Descending?
						if (options.reverse) {
							
							images.reverse();
							
							if (folders) {
								folders.reverse();
							}
						}
						
						break;
						
				}
				
				// Concatenating folders and images arrays
				
				if (folders) {
					if (options.foldersFirst) {
						return folders.concat(images);
					} else {
						return images.concat(folders);
					}
				}
				
				return images;
			
			},

			
		// Collect items by their paths within the album structure
		// paths = array of root paths
		// sortBy = sort criteria ( dateTaken|fileDate|dateAdded|fileSize|name )
		// sortOrder = 1: ascending 0: descending
		// reference = date reference (
		// ready = the function to call after items ready
		
		collectByPath = function(opt) {
				
				if (typeof opt === UNDEF || !opt.hasOwnProperty('paths') || !Array.isArray(opt.paths) || typeof opt['ready'] !== FUNCTION) {
					return [];
				}
				
				let	items 			= [],
					options 		= $.extend({
												folder:			'',				// Root folder
												levels:			0,				// Current folder only
												sortBy:			'original',		// No sort
												reference:		'dateTaken',	// Reference
												reverse:		false			// Ascending
											}, opt),
					max				= options.paths.length,
					counter			= 0,
					fto,
					folder			= getFolder(options.folder),
					
					_finished = function() {
						
							clearTimeout(fto);
							
							if (counter < max) {
								log('Timout collecting ' + max + ' items. Image set is incomplete!');
							}
							
							items = sortItems(items, {
									sortBy:			options['sortBy'],
									reference:		options['reference'],
									reverse:		options['reverse']
								});
							
							options.ready.call(items, options);
						};
				
				fto = setTimeout(_finished, max * 25);
				
				for (let n = 0; n < max; n++) {
					
					getItem(options.paths[n], function(i) {
							
							if (this && typeof i !== UNDEF) {
								items[i] = this;
								if (++counter === max) {
									clearTimeout(fto);
									_finished();
								}
							}
						}, n);
				}
				
				
			},
			
		// Collect items from folder
		// folder = start folder
		// levels = depth below the start folder
		// max = maximum number
		// sortBy = sort criteria ( dateTaken|fileDate|dateAdded|fileSize|name )
		// sortOrder = 1: ascending 0: descending
		// quick = 	true: stops when enough element has been gathered, 
		//			false: loads all folders before it selects the "max" elements based on sort
		
		collectNItem = function(opt) {
				
				//log('getItems(' + options + ')');
				if (typeof opt === UNDEF || !opt.hasOwnProperty('ready')) {
					return;
				}
				
				let options 		= $.extend({
											folder:			'',				// Root folder
											levels:			0,				// Current folder only
											include:		'images',		// Items to include
											max:			0,				// No limit
											sortBy:			'original',		// No sort			
											sortOrder:		0				// Ascending
										}, opt),
					images 			= [],
					folders			= [],
					folder			= getFolder(options.folder),
					foldersToLoad 	= options.levels? getFolderCount(folder, options.levels) : 1,
					foldersLoaded	= 0,
					needsDeepData	= !folder && options.levels > 1 && tree.hasOwnProperty(J.FOLDERS),
					useImages		= options.include.indexOf('images') !== -1,
					useFolders		= options.include.indexOf('folders') !== -1,
				
					_addItems = function(folder) {
							// Adding images in a folder
							if (!folder || !folder.hasOwnProperty(J.OBJECTS)) {
								return;
							}
							
							folder[J.OBJECTS].forEach(o => {
									if (isLightboxable(o)) {
										images.push(o);
									}
								});
						},
					
					_addFolder = function(folder) {
						
							if (!folder || (folder.hasOwnProperty(J.HIDDEN) && folder.hidden)) {
								return;
							}
							
							if (useFolders) {
								folders.push(folder);
							}
							
							if (useImages) {
								// Adding one folder
								loadData(folder, _addItems);
							}
							
							if (folder[J.LEVEL] <= maxLevel && folder.hasOwnProperty(J.FOLDERS)) {
								// recursive to subfolders
								folder[J.FOLDERS].forEach(f => _addFolder(f));
							}
							
							foldersLoaded++;
						},
						
					_readyDeep = function() {
						
							_addFolder(folder);
							
							setTimeout(_finished, 20);
						},
						
					_loadAll = function() {
						
							// Starting a new promise collect
							defer = [];
							
							// Deep data already loaded or data1.json is enough
							_addFolder(folder);
							
							// Allow some time to add the first defer
							setTimeout(function() {
									if (defer.length) {
										$.when.apply($, defer).done(_finished);
									} else {
										_finished();
									}
								}, 20);						
						},
						
					_finished = function() {
						
							if (options.max && options.quick && (images.length + folders.length) >= options.max ||  
								(foldersLoaded >= foldersToLoad)) { 
							
								images = sortItems(images, folders, {
										sortBy:			(options['sortOrder'] === -1)? 'random' : (options['sortBy'] || 'original'),
										reference:		options['reference'] || J.FILEDATE,
										reverse:		options['sortOrder'] === 0,
										foldersFirst:	options['include'].startsWith('folders')
									});
									
								// Chopping the extra items
								if (options.max && options.max < images.length) {
									images = images.slice(0, options.max);
								}
								
								if (typeof options.ready === FUNCTION) {
									options.ready.call(images, options);
								}
								
							} else {
								setTimeout(_finished, 50);
								return;
							}
						};
						
				
				if (!options.hasOwnProperty('quick')) {
					options.quick = options.max && options.sortBy !== 'original';
				}
				
				maxLevel = folder[J.LEVEL] + options.levels;
				
				random = options.sortOrder === -1;
				if (random) {
					settings.sortBy = 'original';
				}
					
				if (needsDeepData && !deepReady) {
					
					// Loading deep data, falling back to recursive data1.json on error
					loadDeep(_readyDeep, _loadAll);
					
				} else {
					
					_loadAll();
				}
			},
			
		// Collect items by date
		// range = past n days
		//			or start-end
		// range, start = start ... start + range
		// range, end = end - range ... end
		// Where start and end are days since 1900-01-01
		
		collectByDate = function(opt) {
			
				//log('collectByDate(' + options + ')');
				if (typeof opt === UNDEF || !opt.hasOwnProperty('ready')) {
					return;
				}
				
				let options 		= $.extend({
											sort:			true,
											reverse:		false,
											reference:		J.DATETAKEN,
											depth: 			'current' 		// 'tree' | 'current' | 'subfolders'
										}, opt),
					items 			= [],
					start,
					end, 
					foldersToLoad 	= (options.depth === 'current')? 1 : getDeepFolderCount((options.depth === 'tree')? tree : currentFolder),
					foldersLoaded	= 0,
					needsDeepData	= options.depth === 'tree' && tree.hasOwnProperty(J.FOLDERS) ||
									  options.depth === 'subfolders' && currentFolder.hasOwnProperty(J.FOLDERS) && currentFolder[J.LEVEL] < 3,
				
					
					_findByDate = function(folder) {
							
							// Find images that fall into the date range
							
							if (!folder || !folder.hasOwnProperty(J.OBJECTS)) {
								return;
							}
							
							folder[J.OBJECTS].forEach(o => {
									if (isLightboxable(o) &&
										(d = o[J.DATES]) && 
										(d = d[options.reference]) && 
										(d >= start) && (d <= end)) {
										items.push(o);
									}
								});
														
							foldersLoaded++;
						},
					
					_addFolder = function(folder) {
							// Adding one folder
							
							if (!folder || (folder.hasOwnProperty(J.HIDDEN) && folder.hidden)) {
								return;
							}
							
							loadData(folder, _findByDate);
							
							if (options.depth !== 'current' && folder.hasOwnProperty(J.FOLDERS)) {
								// recursive to subfolders
								folder[J.FOLDERS].forEach(f => _addFolder(f));
							}
						},
						
					_readyDeep = function() {
						
							_addFolder((options.depth === 'tree')? tree : currentFolder);
							
							setTimeout(_finished, 20);
						},
						
					_loadAll = function() {
						
							// Starting a new promise collect
							defer = [];
							
							// Deep data already loaded or data1.json is enough
							_addFolder((options.depth === 'tree')? tree : currentFolder);
							
							// Allow some time to add the first defer
							setTimeout(function() {
									if (defer.length) {
										$.when.apply($, defer).done(_finished);
									} else {
										_finished();
									}
								}, 20);						
						},
						
					_finished = function() {
						
							if (foldersToLoad > foldersLoaded) {
								setTimeout(_finished, 20);
								return;
							}
							
							// Ordering items
							
							if (options.sort) {
								items = sortItems(items, {
									sortBy:			options['sortBy'] || 'date',
									reference:		options['reference'] || J.DATETAKEN,
									reverse:		options['reverse'] || false
								});
							}
							
							if (options.max && options.max < items.length) {
								items = items.slice(0, options.max);
							}
							
							if (typeof options.ready === FUNCTION) {
								options.ready.call(items, options);
							}
						};
				
				
				// options.start and options.end are days since 1970-01-01, range is number of days
				if (options.hasOwnProperty('end')) {
					end = options.end * ONEDAY_S;
				}
				
				if (options.hasOwnProperty('start')) {
					start = options.start * ONEDAY_S;
				}
				
				if (options.hasOwnProperty('range')) {
					if (start !== null) {
						end = start + options.range * ONEDAY_S;
					} else if (end !== null) {
						start = end - options.range * ONEDAY_S;
					} else {
						// Up to now
						end = Math.round(new Date() / 1000);
						start = end - options.range * ONEDAY_S;
					}
				}
				
				if (typeof start === UNDEF) {
					start = 0;
				}
				
				if (typeof end === UNDEF) {
					end = Math.round(new Date() / 1000);
				}
								
				if (needsDeepData && !deepReady) {
					
					// Loading deep data, falling back to recursive data1.json on error
					loadDeep(_readyDeep, _loadAll);
					
				} else {
					
					_loadAll();
				}
			},
		
		/*
		 *	Collecting search results
		 *
		 *	fields: 		fields to watch
		 *	types:			all or comma separated list of allowed types ('image|audio|video|...)
		 *	depth:			where to collect ('tree' | 'current' | 'subfolders')
		 *	exact:			exact search (or conjunctive)
		 *  caseSensitive:	case sensitivity: (false by default)
		 *	max:			maximum number of results
		 */
		
		collectItems = function(opt) {
			
				//log('collectItems(' + set + ')');
				if (typeof opt === UNDEF || !opt.hasOwnProperty('terms')) {
					return;
				}
				
				let options 		= $.extend({
												fields: 		'creator,keywords,title,comment,name,regions',
												types:			'all',
												depth: 			'current', 		// 'tree' | 'current' | 'subfolders'
												exact: 			false,
												caseSensitive:	false	
											}, opt),
					items 			= [], 
					fields 			= options.fields.split(/,\s?/), 
					fieldslength 	= fields.length,
					exact			= new Array(fieldslength),
					terms,
					termslength,
					conjunctive 	= false,
					allTypes		= options.types === 'all',
					types 			= {},
					foldersToLoad 	= (options.depth === 'current')? 1 : getDeepFolderCount((options.depth === 'tree')? tree : currentFolder),
					foldersLoaded	= 0,
					needsDeepData	= options.depth === 'tree' && tree.hasOwnProperty(J.FOLDERS) ||
									  options.depth === 'subfolders' && currentFolder.hasOwnProperty(J.FOLDERS) && currentFolder[J.LEVEL] < 3,
										
					_searchItem = function(o, cat) {
						
							let found = 0;
								
							for (let i = 0, f, p; i < fieldslength; i++) {
								
								// Category specific field?
								
								if (fields[i].length > 1) {
									// e.g. "folder:title"
									if (fields[i][0] !== cat) {
										continue;
									}
									f = fields[i][1];
								} else {
									f = fields[i][0];
								}
								
								if (JCAMERAFIELDS.indexOf(f) >= 0 && o.hasOwnProperty(J.CAMERA)) {
									// camera data
									p = o[J.CAMERA][f];
									if (typeof p === UNDEF) {
										// not found: retry on plain attribute
										p = o[f];
									}
									
								} else if (f === J.NAME) {
									// File name
									if (o.hasOwnProperty(J.ORIGINAL)) {
										// Has original: use that's file name
										p = decodeURIComponent(o[J.ORIGINAL][J.PATH].getFile());
									} else {
										// Slide image name
										p = o[J.NAME];
									}
									p = p.replace(/[\.\-_]/g, ' ');
									
								} else if (f === J.REGIONS) {
									// Regions
									p = o.hasOwnProperty(J.REGIONS)? JSON.parse(o[J.REGIONS]) : null;
									
								} else {
									// All others
									p = o[f];
								}
									
								if (typeof p !== UNDEF && p !== null) {
									// Has such property
									
									if (exact[f] && f === J.KEYWORDS) {
										// Keywords, p is Array
										if (options.caseSensitive) {
											if (p.indexOf(terms[0]) !== -1) {
												found++;
											}
										} else {
											for (let j = 0, k = terms[0].toLowerCase(); j < p.length; j++) {
												if (p[j].toLowerCase() === k) {
													found++;
													break;
												}
											}
										}
										
									} else {
										
										if (f === J.COMMENT || f.endsWith('Caption')) {
											// Strip HTML on fields might contain it
											p = p.stripHTML();
											
										} else if (f === J.REGIONS) {
											// Getting region names
											let names = [];
											
											for (let j = 0, n; j < p.length; j++) {
												if (n = p[j].split(';')[0] + '') {
													names.push(n);
												}
											}
											
											p = names.filter(Boolean).join(' ');
											
										} else if (Array.isArray(p)) {
											// Array
											p = p.join(' ');
											
										} else {
											// Ensure it's a string
											p = p + '';
										}
										
										// log('search:' + terms + ' in:' + s + ' exact:' + exact[f] + ' ==> ' + s.searchTerm(terms, exact[f], conjunctive)); 
										if (p.searchTerm(terms, exact[f], conjunctive, options.caseSensitive)) {
											found++;
										}
									}
								}
							}
							
							if ((conjunctive && (found === termslength)) || found) {
								// conjunctive: all terms found | any term found
								items.push(o);
							}
							
						},
						
					_searchFolder = function(folder) {
							/*
							if (DEBUG) {
								log('Searching folder "' + folder[J.NAME] + '" ' + (folder[J.OBJECTS]? folder[J.OBJECTS].length : 0) + ' items');
							}
							*/
							if (!folder) {
								return;
							}
							
							if (folder !== tree && (allTypes || types['folder'])) {
								// Folders but not the top level
								_searchItem(folder, 'folder');
							}
							
							if (folder.hasOwnProperty(J.OBJECTS)) {
								// Objects
								let cat;
								folder[J.OBJECTS].forEach(o => {
										if (!o.hasOwnProperty(J.FOLDERINDEX) &&
											(cat = o[J.CATEGORY]) &&
											(allTypes || types[cat])) {
											_searchItem(o, cat);
										}
									});
							}
							
							foldersLoaded++;
						},
				
					_addFolder = function(folder) {
							// Adding one folder
							
							if (!folder || (folder.hasOwnProperty(J.HIDDEN) && folder.hidden)) {
								return;
							}
							
							loadData(folder, _searchFolder);
							
							if (options.depth !== 'current' && folder.hasOwnProperty(J.FOLDERS)) {
								// recursive to subfolders
								folder[J.FOLDERS].forEach(f => _addFolder(f));
							}
						},
						
					_readyDeep = function() {
						
							_addFolder((options.depth === 'tree')? tree : currentFolder);
							
							setTimeout(_finished, 20);
						},
						
					_loadAll = function() {
						
							// Starting a new promise collect
							defer = [];
							
							// Deep data already loaded or data1.json is enough
							_addFolder((options.depth === 'tree')? tree : currentFolder);
							
							// Allow some time to add the first defer
							setTimeout(function() {
									if (defer.length) {
										$.when.apply($, defer).done(_finished);
									} else {
										_finished();
									}
								}, 20);						
						},
						
					_finished = function() {
						
							if (foldersToLoad > foldersLoaded) {
								setTimeout(_finished, 20);
								return;
							}
							
							if (options.max && options.max < items.length) {
								items = items.slice(0, options.max);
							}
							
							if (typeof options.ready === FUNCTION) {
								options.ready.call(items, options);
							}
						};
				
				if (options.terms[0] === '"' && options.terms[options.terms.length - 1] === '"') {
					// Exact search with quotes: "something exact"
					terms = options.terms.substring(1, options.terms.length - 1);
					if (options.exact === false) {
						// Change only if no excplicit exact spec.  
						options.exact = true;
					}
				} else {
					// No quotes
					if (options.exact === false) {
						// Any word
						terms = options.terms.replace(/\s+/g, ",");
						
						if (~terms.indexOf(',' + text.and + ',')) {
							// Conjunctive search
							terms = terms.replace(new RegExp(',' + text.and + ',', 'gi'), ',');
							conjunctive = true;
						}
					} else {
						// Exact by request
						terms = options.terms.trim();
					}
				}	
				
				terms = options.exact? [ terms ] : removeEmpty(terms.split(/,\s?/));
				termslength = terms.length;
				
				for (let i = 0, f; i < fieldslength; i++) {
					fields[i] = fields[i].split(':');
					f = fields[i][1] || fields[i][0];
					exact[f] = (typeof options.exact === 'string')? (options.exact.indexOf(f) >= 0) : options.exact;
				}
				
				if (!allTypes) {
					
					if (options.types.charAt(0) === '-') {
						// Negative
						settings.possibleTypes.forEach(t => {
								if (options.types.indexOf(t) === -1) {
									types[t] = true;
								}
							});
					} else {
						// Positive
						options.types.split(/,\s?/).forEach(t => { types[t] = true; });
					}
				}
				
				if (needsDeepData && !deepReady) {
					
					// Loading deep data, falling back to recursive data1.json on error
					loadDeep(_readyDeep, _loadAll);
					
				} else {
					
					_loadAll();
				}
									
			},
		
		// Tag cloud
		
		collectTags = function(opt) {
			
				//log('collectTags(' + set + ')');
					
				let options 		= $.extend({
											fields: 	'creator,keywords,folder:title,webLocation:title',
											types:		'all',	
											depth: 		'current', 			// 'tree' | 'current' | 'subfolders'
											exact:		'creator,keywords,name'
										}, opt),
					tags 			= [], 
					fields 			= Array.isArray(options.fields)? options.fields : options.fields.split(/,\s?/), 
					fieldslength 	= fields.length,
					sortByName 		= options.sort === 'name',
					allTypes 		= options.types === 'all',
					types			= {},
					exact			= {},
					
					// Add tags collected from an item
					// tags = [ 'tag', paths[], 'TAG' ]
					
					_addTags = function(o, newTags) {
							let nt = newTags.split('^').filter(t => t.length > 2);
							
							for (let i = 0, idx, tag, p; i < nt.length; i++) {
								
								tag = nt[i].toUpperCase();
								p = getObjectPath(o);
								
								if (p !== null) {
									if (!tags || !tags.length) {
										// Empty
										tags = [[ nt[i], [ p ], tag ]];
									} else { 
										// Does tag exist?
										if ((idx = tags.findIndex(t => t[2] === tag)) >= 0) {
											// Yes: add path
											if (tags[idx][1].indexOf(p) === -1) {
												// This items has been added already?
												tags[idx][1].push(p);
											}
										} else {
											// No: add new
											tags.push([ nt[i], [ p ], tag ]);
										}
									}
								}
							}
						},
					
					// Collects tags from an item
					
					_collectTags = function(o, cat) {
							let ctags = '^',			// Collected tags = 'tag1^tag2^tag3'
								ctagsuc = '^',			// Same in uppercase for comparison
							
								add = function(tag, field) {
										
										if (!tag) {
											return;
										}
										
										let t, 
											ta;
											
										if (exact[field]) {
											ta = [ tag.toString() ];
										} else {
											if (field === 'comment' || field.endsWith('Caption')) {
												tag = tag.stripHTML();
											}
											//ta = tag.split(/\W+/);
											ta = tag.split(/[\s,_\.\?\!\-\(\)\[\]]/);
											ta = removeEmpty(ta);
										}
										
										for (let i = 0, l = ta.length, fnd = false; i < l; i++) {
										
											t = ta[i].trim();
											
											if (t.length <= 2) {
												// Empty or too short
												continue;
											}
											
											if (ctagsuc.indexOf('^' + t.toUpperCase() + '^') === -1) {
												ctags += t + '^';
												ctagsuc += t.toUpperCase() + '^';
											}
										}
									};
							
							for (let i = 0, f, p, keys = ''; i < fieldslength; i++) {
								if (fields[i].length > 1) {
									if (fields[i][0] !== cat) {
										continue;
									}
									f = fields[i][1];
								} else {
									f = fields[i][0];
								}
								
								
								if (JCAMERAFIELDS.indexOf(f) >= 0 && o.hasOwnProperty(J.CAMERA)) {
									// camera data
									p = o[J.CAMERA][f];
									if (typeof p === UNDEF) {
										p = o[f];
									}
								} else if (f === J.REGIONS) {
									// Regions
									p = o.hasOwnProperty(J.REGIONS)? JSON.parse(o[J.REGIONS]) : null;
									
								} else {
									p = o[f];
								}
									
								if (typeof p !== UNDEF && p != null) {
									//log(o['name'] + '[' + f + '] = ' + o[f] + ' (' + (Array.isArray(o[f])? 'array':(typeof o[f])) + ')');
									if (f === J.REGIONS) {
										for (let j = 0; j < p.length; j++) {
											add(p[j].split(';')[0], f);
										}
									} else if (Array.isArray(p)) {
										for (let j = 0; j < p.length; j++) {
											add(p[j], f);
										}
									} else {
										add(p, f);
									}
								}
							}
							
							//log(ctags);
							if (ctags.length > 1) {
								_addTags(o, ctags);
							}
						},
					
					// Collect tags from all objects in a folder
					
					_addItems = function(folder) {
					
							// Adds fields from objects array
							if (!folder) {
								return;
							}
							
							if (folder !== tree && (allTypes || types['folder'])) {
								// Current folder
								_collectTags(folder, 'folder');
							}
							
							if (folder.hasOwnProperty(J.OBJECTS)) {
								// Ordinary objects
								for (let i = 0, o = folder[J.OBJECTS], cat; i < o.length; i++) {
									if (o[i].hasOwnProperty(J.CATEGORY)) {
										cat = o[i][J.CATEGORY];
										if (allTypes || types[cat]) {
											_collectTags(o[i], cat);
										}
									}
								}
							}
						},
				
					// Queues one folder to collect tags  
					
					_addFolder = function(folder) {
							// Adding one folder
							
							if (!folder || (folder.hasOwnProperty(J.HIDDEN) && folder.hidden)) {
								return;
							}
							
							loadData(folder, _addItems);
							
							if (options.depth !== 'current' && folder.hasOwnProperty(J.FOLDERS)) {
								// recursive to subfolders
								for (let i = 0, l = folder[J.FOLDERS].length; i < l; i++) {
									_addFolder(folder[J.FOLDERS][i]);
								}
							}
						},
						
					// Arrange the tags when ready
					
					_arrangeTags = function() {
							if (options.sort) {
								tags.sort(function(a, b) {
									return sortByName? ('' + a[2]).localeCompare('' + b[2]) : (b[1] - a[1]);	
								});
							}
							if (options.max && options.max < tags.length) {
								tags = tags.slice(0, options.max);
							}
						};
				
				// Starting a new promise collect
				
				defer = [];
				
				// Gathering fields to collect from
				
				for (let i = 0, f; i < fieldslength; i++) {
					fields[i] = fields[i].split(':');
					f = fields[i][1] || fields[i][0];
					exact[f] = (typeof options.exact === 'string')? (options.exact.indexOf(f) >= 0) : options.exact;
				}
				
				// Creating object types array too look for
				if (!allTypes) {
					for (let i = 0, t = settings.types.split(/,\s?/); i < t.length; i++) {
						types[t[i]] = true;
					}
				}
				
				// Adding folder(s)
				
				_addFolder((options.depth === 'tree')? tree : currentFolder);
					
				if (typeof options.ready === FUNCTION) {
				
					if (defer.length) {
						$.when.apply($, defer).done(function() {
							_arrangeTags();
							options.ready.call(tags, options);
						});
					} else {
						_arrangeTags();
						options.ready.call(tags, options);
					}
				}
						
			},
		
		// Processing template for an object
		
		processTemplate = function(template, co, removeEmpty) {
			
				let remove = (typeof removeEmpty !== UNDEF)? removeEmpty : false,
					o = co || currentFolder,
					i0,
					i1,
					m,
					v,
					getKey = k => ((k === 'label')? getLabel(o) : stringVal(o[k]));
				
				if (template && template.indexOf('${') > 0) {
				
					while (m = template.match(/\$\{([\w\.|]+)\}/)) {
						if (m[1].indexOf('|') > 0) {
							// ${var1|var2} fallback format
							for (let i = 0, k = m[1].split('|'); i < k.length; i++) {
								if (v = getKey(k[i])) {
									// Found
									break; 
								}
							}
						} else {
							// Single variable
							v = getKey(m[1]);
						}
						
						if (v === null && remove) {
							// Remove empty HTML tags
							i0 = m.index - 1;
							i1 = i0 + m[0].length;
							
							if (i0 > 0 && template[i0] === '>' && i1 < (sb.length - 1) && template[i1] === '<') {
								
								i0 = template.lastIndexOf('<', i0);
								i1 = template.indexOf('>', i1);
								
								if (i0 >= 0 && i1 >= 0) {
									template = template.slice(0, i0) + template.slice(i1);
									continue;
								}
							}
						}
						// Replacing or removing variable
						template = template.slice(0, m.index) + (v || '') + template.slice(m.index + m[0].length);
					}
				}
		
				return template;
			},
									
		
		/*****************************************************************
		 * 				Initial processing of the album
		 */
		
		_up = '../../../../../../../../../../../../../../../../../../../../',
		
		_relativePath = function(from, to) {
				if (typeof from === UNDEF || !from.length || from === '/') {
					// From root
					return to || '';
				} else if (typeof to === UNDEF || !to.length || to === '/') {
					// To root
					return _up.slice(0, from.split('/').length * 3);
				} else if (from === to) {
					// Same
					return '';
				}
				
				from = from.split('/');
				to = to.split('/');
				
				while (from.length && to.length && from[0] === to[0]) {
					from.shift();
					to.shift();
				}
				
				return _up.slice(0, from.length * 3) + to.join('/');
			},
			
		// Adding level, parent pointers and relative paths for easier navigation
		
		_addExtras = function() {
			
				let add = function(o, level, path, parentRef) {
						let fp = level? makePath(path, o[J.PATH]) : '',		// folder path: subfolder/subfolder/
							pr = level? getPathRef(fp) : 0;					// path reference number
						
						// Level
						o[J.LEVEL] = level;
						
						// Category
						if (!o.hasOwnProperty(J.CATEGORY)) {
							o[J.CATEGORY] = 'folder';
						}
						
						if (level) {
							// Parent reference
							o[J.PARENTREF] = parentRef;
						}
						
						// Folder path reference from root
						o[J.PATHREF] = pr;
						
						// Relative path from currentFolder to this folder
						if (albumPath === null) {
							// if we're inside the album (providing simpler paths)
							o[J.RELPATH] = getRelPathRef(_relativePath(settings.relPath, fp));
						}
						
						if (o[J.THUMB][J.PATH].startsWith(o[J.PATH] + '/' + settings.thumbsDir)) {
							// Fixing tree.json anomaly:
							// thumb path is different in deep-data.json and data1.json
							o[J.THUMB][J.PATH] = o[J.THUMB][J.PATH].slice(o[J.PATH].length + 1);
						}
						
						// Recursive to subfolders
						if (o.hasOwnProperty(J.FOLDERS)) {
							for (let i = 0, l = o[J.FOLDERS].length; i < l; i++) {
								add(o[J.FOLDERS][i], level + 1, fp, pr);
							}
						}
					};
				
				add(tree, 0, '', 0);
			},
		
			
		// Loading tree.json from the top level folder
		
		loadTree = function(doneFn) {
			
				//log('loadTree() :: ' + settings.rootPath + settings.treeFile);
				let src = makePath(albumPath || settings.rootPath, settings.treeFile) + cacheBuster;
				
				return $.getJSON(src)
					.done(function(d) {
						// Tree loaded
						
						tree = d;
						// log('... tree loaded'); 
						
						// Initializing the load counters
						tree[J.LOADCOUNTER] = {};
						tree[J.LOADCOUNTER][J.TOTAL] = 0;
						
						settings.possibleTypes.forEach(t => {
								tree[J.LOADCOUNTER][t] = 0;
							});
						/*
						for (let i = 0; i < settings.possibleTypes.length; i++) {
							tree[J.LOADCOUNTER][settings.possibleTypes[i]] = 0;
						}
						*/
						// Getting the pointer to the current folder
						currentFolder = getFolder(settings.relPath);
						
						if (currentFolder === null) {
							if (typeof settings.fatalError === FUNCTION) {
								settings.fatalError.call(this, 'noSuchFolder', settings.relPath);
							}
						}
						
						// Adding extra variables
						_addExtras();
						
						// Calling "done" function
						if (typeof doneFn === FUNCTION) {
							doneFn.call(this);
						}
					})
					.fail(function(jqxhr, status, error) {
							
						if (typeof settings.fatalError === FUNCTION) {
							settings.fatalError.call(this, 'databaseAccessDenied', src);
						}
						
						// Calling "done" function
						if (typeof doneFn === FUNCTION) {
							doneFn.call(this);
						}
					});
			},
			
		// Copying missing folder properties
		
		copyFolderProps = function(d, folder) {
			
				if (!folder) {
					return;
				}
				
				for (let prop in d) {
					// Assigning folder variables 
					if (prop !== J.OBJECTS && prop !== J.ALBUM && !folder.hasOwnProperty(prop)) {
						folder[prop] = d[prop];
					}
				}
			},
			
		// Copying Objects array
		
		copyObjects = function(d, folder, deep) {
			
				// Copy Objects
				if (d.hasOwnProperty(J.OBJECTS)) {
					// Ensure it exists
					folder[J.OBJECTS] = [];
					
					for (let i = 0, o, j = 0, l = d[J.OBJECTS].length; i < l; i++) {
						
						o = d[J.OBJECTS][i];
						tree[J.LOADCOUNTER][o[J.CATEGORY]]++;
						tree[J.LOADCOUNTER][J.TOTAL]++;
						
						if (o[J.CATEGORY] === 'folder') {
							// Folder
							
							if (!folder[J.FOLDERS]) {
								folder[J.FOLDERS] = [];
							}
							
							copyFolderProps(o, folder[J.FOLDERS][j]);
							
							if (deep) {
								copyObjects(o, folder[J.FOLDERS][j], true);
							}
							
							// Storing only the reference index (avoid duplication)
							o = {};
							o[J.FOLDERINDEX] = j;
							j++;
							
						} else {
							// Not folder
							// Adding absolute and relative paths
							o[J.PATHREF] = folder[J.PATHREF];
							o[J.RELPATH] = folder[J.RELPATH];
						}
						
						folder[J.OBJECTS].push(o);
					}
				}
			},
			
		// Loading one folder's detailed data from data1.json
		
		loadData = function(folder, doneFn) {
				
				// Couldn't identify/find a folder
				if (!folder) {
					//log('Error: loadData("null")!');
					return;
				}	
				
				// Loading the folder's objects
				if (folder.hasOwnProperty(J.OBJECTS)) {
					// already loaded
					if (typeof doneFn === FUNCTION) {
						doneFn.call(this, folder);
					}
					return true;
						
				} else {
					// we need to load it
					let src = makePath(getPath(folder), settings.dataFile) + cacheBuster;
					
					// building defer array to be able to check the full load
					if (!defer) {
						defer = [];
					}
					// Cache buster with ?makeDate
					defer.push($.getJSON(src)
							.done(function(d) {
								//log("data loaded for: " + f[J.NAME]);
								
								// Copying the folder's missing properties
								copyFolderProps(d, folder);
								copyObjects(d, folder);
								
								if (typeof doneFn === FUNCTION) {
									doneFn.call(this, folder);
								}
								
							}).fail(function(jqxhr, status, error) {
								log('Error loading folder data for "' + src + '": ' + status + ', ' + error);
								if (typeof doneFn === FUNCTION) {
									doneFn.call(this, folder);
								}
							}));
				}
			},
		
		// Loading data for a single folder
		
		loadFolder = function(folder, deep) {
			
				//log('loadFolder("' + f[J.NAME] + '")');
				loadData(folder);
				
				if (deep && folder.hasOwnProperty(J.FOLDERS)) {
					
					for (let i = 0, l = folder[J.FOLDERS].length; i < l; i++) {
						loadFolder(folder[J.FOLDERS][i]);
					}
				}
			},
			
		// Load deep data structure
		
		loadDeep = function(doneFn, failFn) {
				
				if (deepReady) {
					// Already loaded 
					doneFn.call(tree);
				}
				
				let ins = new Date(),
					src = makePath(albumPath || settings.rootPath, settings.deepDataFile) + cacheBuster;
				
				return $.getJSON(src)
				
					.done(function(d) {
							
							if (DEBUG) {
								log('Deep data loaded: ' + ((new Date()) - ins) + 'ms' + ' total: ' + tree[J.LOADCOUNTER][J.TOTAL] + ' objects');
								ins = new Date();
							}
							
							copyObjects(d, tree, true);
						
							if (DEBUG) {
								log('Deep data objects are ready: ' + ((new Date()) - ins) + 'ms' + ' total: ' + tree[J.LOADCOUNTER][J.TOTAL] + ' objects');
							}
							
							deepReady = true;
							
							if (typeof settings.deepReady === FUNCTION) {
								settings.deepReady.call(this);
								settings.deepReady = null;
							}
							
							if (typeof doneFn === FUNCTION) {
								doneFn.call(this);
							}
							
						}).fail(function() {
							
							deepReady = false;
							
							if (DEBUG) {
								log('Error loading deep data: "' + src + '".');
							}
							
							if (typeof settings.deepReady === FUNCTION) {
								settings.deepReady.call(this);
								settings.deepReady = null;
							}
							
							if (typeof failFn === FUNCTION) {
								failFn.call(this);
							}
							
						});
			},
			
		// Initializing
		
		init = function(opt) {
			
				if (instance) {
					return instance;
				}
				
				instance = new Date();
				
				if (typeof opt !== UNDEF) {
					$.extend(settings, opt);
				}
				
				ready = deepReady = false;
				
				if (settings.hasOwnProperty('albumPath')) {
					
					// Initializing by absolute URL
					albumPath = settings.albumPath;
					
					// Sanitizing URL
					if (albumPath.slice(-1) !== '/') {
						albumPath += '/';
					}
					
				}
				
				absolutePath = getAbsoluteFolderPath(albumPath || settings.rootPath);
				
				if (settings.hasOwnProperty('makeDate')) {
					cacheBuster = '?' + settings.makeDate;
				}
				
				// Loading the folder's Objects: current or all
				
				let treeReady = function() {
					
						defer = [];
						
						// Loading current folder (+ deep folders?)
						loadFolder(settings.lazy? currentFolder : tree, !settings.lazy);
						
						// has subfolders: waiting for AJAX requests to be completed
						$.when.apply($, defer).done(function() {
								let d = new Date();
								
								if (DEBUG) {
									log(defer.length + ' folder(s) loaded: ' + (d - instance) + 'ms');
								}
								
								ready = true;
								defer = null;
								//current = (currentFolder && currentFolder.hasOwnProperty(J.OBJECTS))? 0 : null;
								
								if (typeof settings.ready === FUNCTION) {
									settings.ready.call(this);
									settings.ready = null;
								}
								
								if (settings.loadDeep && tree.hasOwnProperty(J.FOLDERS)) {
									// Loading deep data only in structured albums 
									loadDeep();
								} else {
									// Flat album: calling deep ready immediately
									if (typeof settings.deepReady === FUNCTION) {
										settings.deepReady.call(this);
										settings.deepReady = null;
									}
								}
							});
					};
				
				// Loading tree.json
				
				return loadTree(treeReady);
						
			};
		
	//console.log("Album initialized!");
	
	if (options) {
		
		if (DEBUG) {
			console.log('new Album(' + JSON.stringify(options) + ');');
		}
		
		init(options);
	}
	
	return {
			//init: 							init,
			isReady:						isReady,
			isDeepReady:					isDeepReady,
			
			// Debug
			getTree: 						getTree,
			//getPaths: 						getPaths,
			
			// Type checking
			isImage: 						isImage,
			isAudio: 						isAudio,
			isVideo: 						isVideo,
			isLightboxable: 				isLightboxable,
			isCurrentFolder: 				isCurrentFolder,
			
			// Access
			getAlbumPath:					getAlbumPath,
			getAlbumRootPath:				getAlbumRootPath,
			getPath:						getPath,
			getAbsolutePath:				getAbsolutePath,
			getItemPath:					getItemPath,
			getDimensions:					getDimensions,
			getOriginalDimensions:			getOriginalDimensions,
			getMaxDimensions:				getMaxDimensions,
			getLink:						getLink,
			getRootPath:					getRootPath,
			getFolderPath:					getFolderPath,
			getRelativeFolderPath:			getRelativeFolderPath,
			getFolder: 						getFolder,	
			getParent: 						getParent,
			getItem:						getItem,
			getCurrentFolder: 				getCurrentFolder,
			getObjects: 					getObjects,
			getImages: 						getImages,
			getFolders:						getFolders,
			
			// Properties
			getMakeDate: 					getMakeDate,
			getAlbumTitle: 					getAlbumTitle,
			getItemName:					getItemName,
			getExtension:					getExtension,
			getLevel: 						getLevel,
			getTitle: 						getTitle,
			getName: 						getName,
			getLabel: 						getLabel,
			getAlt:							getAlt,
			getComment: 					getComment,
			getThumbPath: 					getThumbPath,
			getImagePath: 					getImagePath,
			getAbsoluteImagePath:			getAbsoluteImagePath,
			getThemeImagePath:				getThemeImagePath,
			getOriginalPath:				getOriginalPath,
			getPosterPath: 					getPosterPath,
			getOptimalImage:				getOptimalImage,
			getOptimalImagePath:			getOptimalImagePath,
			getOptimalThumbPath:			getOptimalThumbPath,
			getSourcePath: 					getSourcePath,
			getAbsoluteItemPath: 			getAbsoluteItemPath,
			getVideoDuration:				getVideoDuration,
			hasShop: 						hasShop,
			hasLocation: 					hasLocation,
			getLocation: 					getLocation,
			getPriceRange:					getPriceRange,
			getCurrency:					getCurrency,
			getDeepFolderCount:				getDeepFolderCount,
			
			// Generic property
			getRootProperty: 				getRootProperty,
			getInheritedPropertyObject:		getInheritedPropertyObject,
			getInheritedProperty:			getInheritedProperty,
			getProperty: 					getProperty,
			getPropertyObject:				getPropertyObject,
			
			getNextFoldersFirstImage:		getNextFoldersFirstImage,
			getPreviousFoldersLastImage:	getPreviousFoldersLastImage,
			
			sortItems:						sortItems,
			
			// Search
			collectByPath:					collectByPath,
			collectNItem:					collectNItem,
			collectByDate: 					collectByDate,
			collectItems: 					collectItems,
			collectTags: 					collectTags,
			
			processTemplate:				processTemplate
				
		};
		
};