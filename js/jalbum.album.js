/* 
 *	The Album model
 * 
 *	(c) Laszlo Molnar, 2015, 2017
 *	Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 
 *	<http://creativecommons.org/licenses/by-nc-sa/3.0/>
 *
 *	requires: jQuery, laza.util
 */

 
/*
 * 	Constants
 */
 
;
var J = {
		// jAlbum variables
		ALBUM:			'album',
		FOLDERS: 		'folders',
		NAME: 			'name',
		PATH: 			'path',
		THUMB: 			'thumb',
		IMAGE: 			'image',
		WIDTH: 			'width',
		HEIGHT: 		'height',
		ORIGINAL: 		'original',
		FOLDERS: 		'folders',
		OBJECTS: 		'objects',
		FILEDATE: 		'fileDate',
		COMMENT: 		'comment',
		TITLE: 			'title',
		COUNTERS: 		'counters',
		DEEPCOUNTERS: 	'deepCounters',
		FILESIZE: 		'fileSize',
		CATEGORY: 		'category',
		KEYWORDS: 		'keywords',
		CAMERA: 		'camera',
		VIDEO: 			'video',
		// extra vars
		LEVEL: 			'level',
		PATHREF: 		'pathRef',
		PARENTREF: 		'parentRef',
		RELPATH: 		'relPath',
		FOLDERTITLE:	'folderTitle',
		IMAGECAPTION: 	'imageCaption',
		THUMBCAPTION: 	'thumbCaption',
		PHOTODATA: 		'photodata',
		LOCATION: 		'location',
		REGIONS:		'regions',
		SHOP:			'shop',
		EXTERNAL:		'external',
		PROJECTIONTYPE:	'projectionType',
		DATES:			'dates',
		ADDED:			'added',
		TAKENDATE:		'takenDate',
		MODIFIEDDATE:	'modifiedDate',
		DATERANGE:		'dateRange',
		MOSTPHOTOS: 	'mostphotos',
		SOUNDCLIP:		'soundClip',
		FILTERDATA:		'filterData',
		OBJ: 			'obj',
		LOADCOUNTER:	'loadcounter',
		TOTAL:			'total',
		INDEX:			'index'
	};

/*
 *	Album object :: use 
 *		myAlbum = new Album({settings});
 *		or
 *		myAlbum = new Album();
 *		myAlbum.init({settings});
 */

var Album = function($, options) {
	
	var instance,
	
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
				folderThumbDims:		[ 600, 420 ],
				// Thumbnail dimensions
				thumbDims:				[ 240, 180 ],
				// Name of the slides folder
				slidesDir: 				'slides',
				// Name of the hires folder
				hiresDir:				'hi-res',
				// Path to root (eg. "../../")
				rootPath: 				'',
				// Default poster images
				audioPoster:			'audio.png',
				videoPoster:			'video.png',
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
				and:			'and'
			}),
		
		// Global variables
		// The container for the entire tree
		tree = {},
		// Collection of all album paths in order to be able to store only the references
		paths = [],
		// Path to current folder
		currentFolder,
		// Currently selected item
		current,
		// Collection the JSON promises
		defer = [],
		// Album ready state: tree.json and data1.json is loaded
		ready,
		// Deep ready: all the data structure is ready
		deepReady,
		
		isReady = function() {
				return ready;
			},
			
		isDeepReady = function() {
				return deepReady;
			},
		
		// Returns the whole internal tree object
		
		getTree = function() { 
				return tree; 
			},
			
		// Returns paths array :: debug 
		
		getPaths = function() {
				return paths;
			},
			
		// Filename for images, originalname for other
		
		getItemName = function(o) {
				if (o[J.CATEGORY] === 'video') {
					var p = o[J.VIDEO][J.PATH];
					return decodeURIComponent(p.substring(p.lastIndexOf('/') + 1));
				} else if (o.hasOwnProperty(J.ORIGINAL)) {
					return decodeURIComponent(o[J.ORIGINAL][J.PATH].replace(settings.hiresDir + '/', ''));
				}
				return o[J.NAME];
			},
		
		// File extension
		
		getExtension = function(o) {
				return getItemName(o).getExt();
			},
			
		// Image?
		
		isImage = function(o) {
				return o.hasOwnProperty(J.CATEGORY) && o[J.CATEGORY] === 'image';
			},
			
		// Audio?
		
		isAudio = function(o) {
				return o.hasOwnProperty(J.CATEGORY) && o[J.CATEGORY] === 'audio';
			},
			
		// Video?
		
		isVideo = function(o) {
				return o.hasOwnProperty(J.CATEGORY) && o[J.CATEGORY] === 'video';
			},
			
		// Folder?
		
		isFolder = function(o) {
				return o.hasOwnProperty(J.LEVEL);
			},
			
		// Ordinary object?
		
		isLightboxable = function(o) {
				return o.hasOwnProperty(J.CATEGORY) && 'image.video.audio.other'.indexOf(o[J.CATEGORY]) !== -1;
			},
	
		// Getting path reference either by searching or adding as new
		
		getPathRef = function(p) {
			
				if (!p) {
					return 0;
				}
			
				if (p.slice(-1) === '/' && p.slice(-3) !== '../') {
					p = p.substring(0, p.length - 1);
				}
				
				var idx = $.inArray(p, paths);
				
				if (idx >= 0) {
					return idx + 1;
				}
				
				return paths.push(p);
			},
		
		// Getting a path by reference index
		
		getPath = function(idx) {
				return idx? paths[idx - 1] : '';
			},
			
		// Gets the path to item - Relative path
		
		getItemPath = function(o) {
				var p = getPath(o[J.RELPATH]),
					c = o[J.CATEGORY] || 'folder';
				
				p = (p.length && p.slice(-1) !== '/')? (p + '/') : p;	
				
				if (c === 'folder') {
					return p;
				} else if (c === 'video') {
					return p + o[J.VIDEO][J.PATH];
				} else if (c === 'audio' || c === 'other' || o.hasOwnProperty(J.ORIGINAL)) {
					return p + o[J.ORIGINAL][J.PATH];
				} else if (c === 'image') {
					return p + o[J.IMAGE][J.PATH];
				} else if (c === 'webPage') {
					return p + o[J.NAME];
				} else {
					// webLocation
					return o[J.PATH];
				}
			},
			
		// Get path to item from tree root
		
		getRootPath = function(o) {
				return getPath(o[J.PATHREF]) + '/' + o[J.NAME];
			},
			
		// Get optimum sized representing image
		
		getOptimalImage = function(o, dim) {
				var p = getPath(o[J.RELPATH]),
					c = o[J.CATEGORY] || 'folder';
				
				p = (p.length && p.slice(-1) !== '/')? (p + '/') : p;	
				
				if (c === 'folder') {
					return p + (dim[0] > settings.folderThumbDims[0] || dim[1] > settings.folderThumbDims[1])? settings.folderImageFile : settings.folderThumbFile;
				} else {
					return p + (dim[0] > settings.thumbDims[0] || dim[1] > settings.thumbDims[1])? o[J.IMAGE][J.PATH] : o[J.THUMB][J.PATH];
				}
			},
			
		// Get the pointer to a folder in a tree from path reference number
		
		getPointer = function(n) {
			
				if (!n) {
					// root
					return tree;
				}
				
				n--;
				
				if (!$.isNumeric(n) || n < 0 || n > paths.length) {
					console.log('Error: out of bounds path reference (' + n + ')!');
					return null;
				}
				
				return getFolder(paths[n]);
			},
				
		// Get the pointer to a folder in a tree from a path
		
		getPointerByName = function(path) {
				
				if (!path) {
					// root
					return tree;
				}
				
				// Removing the closing slash
				if (path.slice(-1) === '/') {
					path = path.slice(0, -1);
				}
				
				return getFolder(path);
			},
			
		// Returns folder object in a folder by name
		
		getFolderObject = function(folder, name) {
				if (folder.hasOwnProperty(J.FOLDERS)) {
					for (var i = 0, l = folder[J.FOLDERS].length; i < l; i++) {
						if (folder[J.FOLDERS][i][J.PATH] === name) {
							return folder[J.FOLDERS][i];
						}
					}
				}
				return null;
			},
		
		// Returns folder object by full path
		
		getFolder = function(path) {
				
				var t = tree,
					p = path.split('/'),
					i, 
					f, 
					l;
					
				for (var i = 0, l = p.length, f; i < l; i++) {
					if (f = getFolderObject(t, p[i])) {
						// Found, go one level deeper 
						t = f;
					} else {
						// not found
						return null;
					}
				}
				
				return (i === l)? t : null;
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
				
				var p;
				
				if (o.hasOwnProperty(J.PARENTREF)) {
					// folder
					p = getPointer(o[J.PARENTREF]);
				} else {
					// image
					p = getPointer(o[J.PATHREF]);
				}
				
				// Avoid endless loops
				return (p === o)? null : p;
			},
			
		// Getting an item from full path
		
		getItem = function(path, doneFn) {
				
				var item,
				
					getItem = function(folder, name) {
							if (folder.hasOwnProperty(J.OBJECTS)) {
								for (var o = folder[J.OBJECTS], i = 0, l = o.length; i < l; i++) {
									if (o[i][J.NAME] === name) {
										item = o[i];
										return;
									}
								}
							}
						};
						
				if (!path) {
					return tree;
				}
				
				if (path.endsWith('/')) {
					return getFolder(path);
				}
				
				var i = path.lastIndexOf('/'),
					folder = getFolder(path.substring(0, i)),
					name = path.substring(i + 1);
				
				if (folder) {
					
					if (folder.hasOwnProperty(J.OBJECTS)) {
						getItem(folder, name);
						doneFn.call(item);
					} else {
						defer = [];
						loadData(folder, getItem);
						
						if ($.isFunction(doneFn)) {
							if (defer.length) {
								$.when.apply($, defer).done(function() {
									doneFn.call(item);
								});
							} else {
								doneFn.call(item);
							}
						}
					}
				}
				
				return null;
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
							return o[a[0]][a[1]];
						}
					} while (o = getParent(o));
					
					return null;
				}
					
				do {
					if (o.hasOwnProperty(a)) {
						return o[a];
					}
				} while (o = getParent(o));
				
				return null;
			},
			
		// Retrieving an Object property of an element with fallback to upper level folders
		
		getInheritedPropertyObject = function(o, a) {
				var p = {};
				do {
					if (o.hasOwnProperty(a)) {
						p = $.extend({}, o[a], p);
					}
				} while (o = getParent(o));
				
				return p;
			},
			
		// Adding level, parent pointers and relative paths for easier navigation
		
		addExtras = function() {
			
				var add = function(o, level, path) {
						// Level
						o[J.LEVEL] = level;
						
						// Missing category?
						if (!o.hasOwnProperty(J.CATEGORY)) {
							o[J.CATEGORY] = 'folder';
						}
						
						path = (path.length && path.slice(-1) !== '/')? (path + '/') : path;
						
						var op = level? o[J.PATH] : '';
						
						// path reference
						o[J.PATHREF] = getPathRef(path + op);
						
						// parent ref
						o[J.PARENTREF] = level? getPathRef(path) : null;
						
						// relative path
						var p;
						if (!settings.relPath.length) {
							// root
							p = path + op;
						} else if (o === currentFolder) {
							// current folder
							p = '';
						} else if (path.indexOf(op + '/') === 0) {
							// subfolder
							p = op.substring(settings.relPath.length);
						} else {
							// other branch
							p = settings.rootPath + '/' + (path + op);
						}
						o[J.RELPATH] = getPathRef(p);
						
						// Recursive to subfolders
						if (o.hasOwnProperty(J.FOLDERS)) {
							pr = getPathRef(path);
							for (var i = 0, l = o[J.FOLDERS].length; i < l; i++) {
								add(o[J.FOLDERS][i], level + 1, path + op);
							}
						}
					};
				
				add(tree, 0, '');
			},
		
		// Loading tree.json from the top level folder
		
		loadTree = function(doneFn) {
			
				//console.log('loadTree() :: ' + settings.rootPath + settings.treeFile);
						
				return $.getJSON((settings.rootPath? (settings.rootPath + '/') : '') + settings.treeFile + (settings['makeDate']? ('?' + settings.makeDate) : ''))
					.done(function(d) {
						// Tree loaded
						
						tree = d;
						// console.log('... tree loaded'); 
						
						// Initializing the load counters
						tree[J.LOADCOUNTER] = {};
						tree[J.LOADCOUNTER][J.TOTAL] = 0;
						
						for (var i = 0; i < settings.possibleTypes.length; i++) {
							tree[J.LOADCOUNTER][settings.possibleTypes[i]] = 0;
						}
				
						// Getting the pointer to the current folder
						currentFolder = getPointerByName(settings.relPath);
						
						if (currentFolder === null) {
							
							console.log('Error: can\'t find folder "' + settings.relPath + '" in the database!');
							
							showError('The current folder\'s database file is missing or broken! ' + 
								(location.protocol === 'file:')?
									'Check if you\'ve allowed jAlbum to process the subdirectories and "Make album" again!'
									:
									'If you\'re the owner try to "Upload" the album again!');
							//currentFolder = '';
						}
						
						// Adding extra variables
						addExtras();
						
						// Calling "done" function
						if ($.isFunction(doneFn)) {
							doneFn.call(this);
						}
					})
					.fail(function() {
							
						console.log('Fatal error! Missing or access denied to "' + settings.treeFile + '".');
						
						if (location.protocol === 'file:') {
							showError('Local access to the album\'s database file is blocked by your browser. This will not affect the uploaded album! Use jAlbum\'s built-in browser or FireFox for testing, or <a href="https://jalbum.net/forum/ann.jspa?annID=172" target="_blank">read here</a> how to test albums in other browsers!');
						} else {
							showError('The album\'s main database file is missing or broken! If you\'re the owner <a href="https://jalbum.net/forum/ann.jspa?annID=177">read how you can fix this</a>.');
						}
						
						// Calling "done" function
						if ($.isFunction(doneFn)) {
							doneFn.call(this);
						}
					});
			},
			
		// Copying missing folder properties
		
		copyFolderProps = function(d, folder) {
				if (!folder) {
					return;
				}
				for (var prop in d) {
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
					
					for (var i = 0, o, j = 0, l = d[J.OBJECTS].length; i < l; i++) {
						
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
							
							// Storing only the reference index
							o = {};
							o[J.INDEX] = j;
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
			
				//console.log('loadData("' + f[J.NAME] + '") + ready:' + f[J.READY]);
				// Couldn't identify/find a folder
				if (!folder) {
					//console.log('Error: loadData("null")!');
					return;
				}	
				
				// Loading the folder's objects
				if (folder.hasOwnProperty(J.OBJECTS)) {
					// already loaded
					if ($.isFunction(doneFn)) {
						doneFn.call(this, folder);
					}
					return true;
						
				} else {
					// we need to load it
					var p = getPath(folder[J.RELPATH]);
					
					// building defer array to be able to check the full load
					if (!defer) {
						defer = [];
					}
					
					//console.log('Loading "'+ p + '/' + settings.dataFile + '"');
					// Cache buster with ?makeDate
					defer.push($.getJSON((p? (p + '/') : '') + settings.dataFile + (settings['makeDate']? ('?' + settings.makeDate) : '')).done(function(d) {
						//console.log("data loaded for: " + f[J.NAME]);
						
						// Copying the folder's missing properties
						copyFolderProps(d, folder);
						copyObjects(d, folder);
						
						if ($.isFunction(doneFn)) {
							doneFn.call(this, folder);
						}
						
					}).fail(function() {
						console.log('Error loading folder data: "' + (p? (p + '/') : '') + settings.dataFile + '".');
						if ($.isFunction(doneFn)) {
							doneFn.call(this, folder);
						}
					}));
				}
			},
		
		// Loading data for a single folder
		
		loadFolder = function(folder, deep) {
			
				//console.log('loadFolder("' + f[J.NAME] + '")');
				loadData(folder);
				
				if (deep && folder.hasOwnProperty(J.FOLDERS)) {
					
					for (var i = 0, l = folder[J.FOLDERS].length; i < l; i++) {
						loadFolder(folder[J.FOLDERS][i]);
					}
				}
			},
			
		// Load deep data structure
		
		loadDeep = function() {
				var ins = new Date(),
					src = (settings.rootPath? (settings.rootPath + '/') : '') + settings.deepDataFile + (settings['makeDate']? ('?' + settings.makeDate) : '');
				
				return $.getJSON(src)
					.done(function(d) {
							
							copyObjects(d, tree, true);
						
							deepReady = true;
							
							if (DEBUG) {
								console.log('Deep data loaded: ' + ((new Date()) - ins) + 'ms' + ' total: ' + tree[J.LOADCOUNTER][J.TOTAL] + ' objects');
							}
							
							if ($.isFunction(settings.deepReady)) {
								settings.deepReady.call(this);
							}
							
						}).fail(function() {
							
							deepReady = false;
							
							if (DEBUG) {
								console.log('Error loading deep data: "' + src + '".');
							}
							
							if ($.isFunction(settings.deepReady)) {
								settings.deepReady.call(this);
							}
					});
			},
			
		// Initializing
		
		init = function(set) {
			
				if (instance) {
					return instance;
				}
				
				instance = new Date();
				
				if (typeof set !== UNDEF) {
					$.extend(settings, set);
				}
				
				ready = deepReady = false;
				
				if (settings.rootPath === '.') {
					settings.rootPath = '';
				}
				
				// Loading the folder's Objects: current or all
				
				var treeReady = function() {
					
						defer = [];
						
						// Loading current folder (+ deep folders?)
						loadFolder(settings.lazy? currentFolder : tree, !settings.lazy);
						
						// has subfolders: waiting for AJAX requests to be completed
						$.when.apply($, defer).done(function() {
							
							var d = new Date();
							if (DEBUG) {
								console.log(defer.length + ' folder(s) loaded: ' + (d - instance) + 'ms');
							}
							ready = true;
							defer = null;
							current = (currentFolder && currentFolder.hasOwnProperty(J.OBJECTS))? 0 : null;
							
							if ($.isFunction(settings.ready)) {
								settings.ready.call(this);
							}
							
							if (settings.loadDeep && tree.hasOwnProperty(J.FOLDERS)) {
								// Loading deep data only in structured albums 
								loadDeep();
							} else {
								// Flat album: calling deep ready immediately
								if ($.isFunction(settings.deepReady)) {
									settings.deepReady.call(this);
								}
							}

							
						});
					};
				
				// Loading tree.json
				
				return loadTree(treeReady);
						
			},
		
		// Album make date/time in UTC
		
		getMakeDate = function() {
				return new Date(tree[J.FILEDATE]);
			},
			
		// Album title
		
		getAlbumTitle = function() {
				return tree[J.TITLE] || tree[J.NAME];
			},
			
		// Current folder object
		
		getCurrentFolder = function() { 
				return currentFolder; 
			},
			
		// Returns all objects in a folder
		
		getObjects = function() {
				return currentFolder.hasOwnProperty(J.OBJECTS)? currentFolder[J.OBJECTS] : []; 
			},
			
		// Returns only the images
		
		getImages = function() {
			
				var items = [];
			
				if (currentFolder && currentFolder.hasOwnProperty(J.OBJECTS)) {
					
					var o = currentFolder[J.OBJECTS];
					
					if (o) {
						for (var i = 0, l = o.length; i < l; i++) {	
							if (!o[i].hasOwnProperty(J.INDEX) && isLightboxable(o[i])) {
								items.push(o[i]);
							}
						}
					}
				}
							
				return items;
			},
		
		// Returns only the folders
		
		getFolders = function() {
				var f = [];
				
				if (currentFolder) {
					if (currentFolder.hasOwnProperty(J.FOLDERIDX)) {
						for (var i = 0, l = currentFolder[J.FOLDERIDX].length; i < l; i++) {
							f.push(currentFolder[J.OBJECTS][currentFolder[J.FOLDERIDX][i]]);
						}
					} else if (currentFolder.hasOwnProperty(J.FOLDERS)) {
						f = currentFolder[J.FOLDERS];
					} 
				}
							
				return f;
			},
			
		// Returns the next folder
		
		getNextFolder = function(folder) {
				if (typeof folder === UNDEF) {
					folder = currentFolder;
				}
				
				var parent = getParent(folder);
				
				if (parent) {
					var i;
					if (parent.hasOwnProperty(J.FOLDERIDX)) {
						i = parent[J.FOLDERIDX].findIndex(function(i) { return parent[J.OBJECTS][i] === folder; });
						if (i < parent[J.FOLDERIDX].length) {
							return parent[J.OBJECTS][parent[J.FOLDERIDX][i + 1]];
						}
					} else if (parent.hasOwnProperty(J.FOLDERS)) {
						i = parent[J.FOLDERS].findIndex(function(f) { return f === folder; });
						if (i < parent[J.FOLDERS].length) {
							return parent[J.FOLDERS][i + 1];
						}
					}
				}
				
				return null;
			},
		
		// Returns the previous folder
		
		getPreviousFolder = function(folder) {
				if (typeof folder === UNDEF) {
					folder = currentFolder;
				}
				
				var parent = getParent(folder);
				
				if (parent) {
					var i;
					if (parent.hasOwnProperty(J.FOLDERIDX)) {
						i = parent[J.FOLDERIDX].findIndex(function(i) { return parent[J.OBJECTS][i] === folder; });
						if (i > 0) {
							return parent[J.OBJECTS][parent[J.FOLDERIDX][i + 1]];
						}
					} else if (parent.hasOwnProperty(J.FOLDERS)) {
						i = parent[J.FOLDERS].findIndex(function(f) { return f === folder; });
						if (i > 0) {
							return parent[J.FOLDERS][i + 1];
						}
					}
				}
				
				return null;
			},
				
		// Get next folder's first image
		
		getNextFoldersFirstImage = function(ready) {
				var img,
					folder = getNextFolder(),
					
					getFirstImage = function(folder) {
							if (folder.hasOwnProperty(J.OBJECTS)) {
								for (var o = folder[J.OBJECTS], i = 0, l = o.length; i < l; i++) {
									if (isLightboxable(o[i])) {
										img = o[i];
										return;
									}
								}
							}
						};
				
				if (folder) {
					
					if (folder.hasOwnProperty(J.OBJECTS)) {
						getFirstImage();
						ready.call(img);
					} else {
						defer = [];
						loadData(folder, getFirstImage);
						
						if ($.isFunction(ready)) {
							if (defer.length) {
								$.when.apply($, defer).done(function() {
									ready.call(img);
								});
							} else {
								ready.call(img);
							}
						}
					}
				}
				
				return null;
			},
		
		// Get previous folder's last image
		
		getPreviousFoldersLastImage = function(ready) {
				var img,
					folder = getPreviousFolder(),
					
					getLastImage = function(folder) {
							if (folder.hasOwnProperty(J.OBJECTS)) {
								for (var o = folder[J.OBJECTS], i = o.length - 1; i >= 0; i--) {
									if (isLightboxable(o[i])) {
										img = o[i];
										return;
									}
								}
							}
						};
			
				
				if (folder) {
					
					if (folder.hasOwnProperty(J.OBJECTS)) {
						getFirstImage();
						ready.call(img);
					} else {
						defer = [];
						loadData(folder, getLastImage);
						
						if ($.isFunction(ready)) {
							if (defer.length) {
								$.when.apply($, defer).done(function() {
									ready.call(img);
								});
							} else {
								ready.call(img);
							}
						}
					}
				}
				
				return null;
			},

		// Gets folder path to an object
		
		getFolderPath = function(o) {
				return getPath(o[J.PATHREF] || 0);
			},
		
		// Gets relative folder path from the current folder
		
		getRelativeFolderPath = function(o) {
				return getPath(o[J.RELPATH] || 0);
			},
			
		// Path to an object as HTML page with hash
		
		getUrl = function(o) {
				o = o || currentFolder;
				var p = getPath(o[J.RELPATH]);
				
				p = (p.length? (p + '/') : '') + settings.indexName;
				
				if (isLightboxable(o[i])) {
					p += '#img=' + encodeAsJave(o[J.NAME]);
				}
				
				return p;
			},
		
		// Thumbnail path
		
		getThumbPath = function(o) {
				var p = getPath(o[J.RELPATH]),
					t = o[J.THUMB][J.PATH];
				
				if (isFolder(o)) {
					t = t.replace(o[J.PATH] + '/', '');
				}
				
				return (p.length? (p + '/') : '') + t;
			},
			
		// Image path
		
		getImagePath = function(o) {
				var p = getPath(o[J.RELPATH]);
				
				p = p.length? (p + '/') : '';
				
				return p + o[J.IMAGE][J.PATH];
			},
			
		// Theme image path
		
		getThemeImagePath = function(o) {
				var p = getPath(o[J.RELPATH]);
				
				p = p.length? (p + '/') : '';

				return p + settings.folderImageFile;
			},
			
		// Original path
		
		getOriginalPath = function(o) {
				if (o.hasOwnProperty(J.ORIGINAL)) {
					var p = getPath(o[J.RELPATH]);
					
					p = p.length? (p + '/') : '';
					
					return p + o[J.ORIGINAL][J.PATH];
				}
				
				if (o.hasOwnProperty(J.CATEGORY) && o[J.CATEGORY] === 'image')
					return '/s3/photos/' + getFolderPath(o) + '/' + getName(o);
				
				return null;
			},
			
		// Poster path for audio and video files
		
		getPosterPath = function(o) {
				var p = getPath(o[J.RELPATH]),
					c = o[J.CATEGORY] || 'folder';
				p = p.length? (p + '/') : '';
				
				if ((c === 'audio' || c === 'video') && 
					!o[J.IMAGE][J.PATH].startsWith(settings.slidesDir + '/')) {
					/* custom icon for audio or video */
					return (settings.rootPath.length? (settings.rootPath + '/') : '') + 'res/' + settings[c + 'Poster'];
				}
				return p + o[J.IMAGE][J.PATH];
			},
			
		// Original or source path
		
		getSourcePath = function(o) {
				var p = getPath(o[J.RELPATH]);
				return (p.length? (p + '/') : '') + (o.hasOwnProperty(J.ORIGINAL)? o[J.ORIGINAL][J.PATH] : o[J.IMAGE][J.PATH]);
			},
			
		// Absolute path to an object as HTML page
		
		getAbsolutePath = function(o) {
				var p = getPath(o[J.RELPATH]);
				return (p.length? p.fullUrl() : window.location.href.getDir()) + (window.location.href.getFile() || settings.indexName)  + ((!o.hasOwnProperty(J.LEVEL))? '#img=' + encodeURIComponent(getItemName(o)) : '');
			},
			
		// Absolute image path
		
		getAbsoluteImagePath = function(o) {
				var p = getPath(o[J.RELPATH]);
				return (p.length? p.fullUrl() : window.location.href.getDir()) + o[J.IMAGE][J.PATH];
			},
			
		// Is this the current folder?
		
		isCurrentFolder = function(o) {
				return o[J.RELPATH] === 0;
			},
			
		// Level?
		
		getLevel = function(o) {
				if (typeof o === UNDEF) {
					o = currentFolder;
				}
				return (o === tree)? 0 : o.hasOwnProperty(J.LEVEL)? o[J.LEVEL] : getLevel(getParent(o));
			},
			
		// Title
		
		getTitle = function(o) {	
				if (typeof o === UNDEF) {
					o = currentFolder;
				}
				return o[J.TITLE] || '';
			},
			
		// Name
		
		getName = function(o) {
				if (typeof o === UNDEF) {
					o = currentFolder;
				}
				return o[J.NAME] || '';
			},
		
		// Comment
		
		getComment = function(o) {
				if (typeof o === UNDEF) {
					o = currentFolder;
				}
				return o[J.COMMENT] || '';
			},
			
		
		// Returns a property (normal or inherited way)
		
		getProperty = function(o, a, inherit) {
				if (inherit) {
					return getInheritedProperty(o, a);
				}
				
				if (a.indexOf('.') > 0) {
					a = a.split('.');
					return (o.hasOwnProperty(a[0]))? o[a[0]][a[1]] : null;
				}
				
				return o[a];
			},
		
		// Returns an Object property (normal or inherited way)
		
		getPropertyObject = function(o, a, inherit) {
				return inherit? getInheritedPropertyObject(o, a) : (o.hasOwnProperty(a)? o[a] : null);
			},
		
		// Has shop options?
		
		hasShop = function(o) {
				var p = getInheritedPropertyObject(o || tree, J.SHOP);
				
				return p && p['options'] !== '-';
			},
			
		// Returns a property from the root level
		
		getRootProperty = function(a) {
				return tree.hasOwnProperty(a)? tree[a] : null;
			},

		// Collect items by date
		
		collectByDate = function(options) {
			
				//console.log('collectByDate(' + options + ')');
				if (typeof options === UNDEF || !options.hasOwnProperty('range') || !options.hasOwnProperty('ready')) {
					return;
				}
				
				var options 	= $.extend({
										sort:			true,
										reverse:		false,
										reference:		'dateTaken',
										depth: 			'current' 	// 'tree' | 'current' | 'subfolders'
									}, options),
					items 		= [],
					start,
					end, 
				
					
					_findByDate = function(folder) {
							
							// Find images that fall into the date range
							
							if (!folder || !folder.hasOwnProperty(J.OBJECTS)) {
								return;
							}
							
							var obj = folder[J.OBJECTS];
							
							for (var i = 0, o, d; i < obj.length; i++) {
								
								o = obj[i];
								
								if (!o.hasOwnProperty(J.INDEX) && isLightboxable(o)) {
									
									if ((d = o[J.DATES]) && 
										(d = d[options.reference]) && 
										(d >= start) && (d <= end)) {
										items.push(o);
									}
								}
							}
						},
					
					_addFolder = function(folder) {
						
							// Adds one folder
							
							loadData(folder, _findByDate);
							
							if (options.depth !== 'current' && folder.hasOwnProperty(J.FOLDERS)) {
								// recursive to subfolders
								for (var i = 0, l = folder[J.FOLDERS].length; i < l; i++) {
									_addFolder(folder[J.FOLDERS][i]);
								}
							}
						},
						
					_arrangeItems = function() {
							
							// Ordering items
							
							if (options.sort) {
								var d1, d2;
								
								items.sort(function(a, b) {
										d1 = a[J.DATES][options.reference];
										d2 = b[J.DATES][options.reference];
										return (options.reverse? (d2 - d1) : (d1 - d2)); 
									});
							}
							
							if (options.max && options.max < items.length) {
								items = items.slice(0, options.max);
							}
						};
				
				// start, range and end are days
				if (options.end) {
					// Absolute
					end = options.end * ONEDAY_S;
					start = (options.end - options.range) * ONEDAY_S;
				} else {
					// Relative
					start = end = Math.round(new Date() / 1000);
					if (options.hasOwnProperty('start')) {
						start -= options.start * ONEDAY_S;
						end = start + options.range * ONEDAY_S;
					} else {
						start -= options.range * ONEDAY_S;
					}
				}
				
				// Adding folder(s)
				defer = [];
				_addFolder((options.depth === 'tree')? tree : currentFolder);
				
				if ($.isFunction(options.ready)) {
					if (defer.length) {
						$.when.apply($, defer).done(function() {
							_arrangeItems();
							options.ready.call(items, options);
						});
					} else {
						_arrangeItems();
						options.ready.call(items, options);
					}
				}
			},
		
		/*
		 *	Collecting search results
		 *
		 *	fields: 	fields to watch
		 *	types:		all or comma separated list of allowed types ('image|audio|video|...)
		 *	depth:		where to collect ('tree' | 'current' | 'subfolders')
		 *	exact:		exact search (or conjunctive)
		 *	max:		maximum number of results
		 */
		
		collectItems = function(options) {
			
				//console.log('collectItems(' + set + ')');
				if (typeof options === UNDEF || !options.hasOwnProperty('terms')) {
					return;
				}
				
				var options 		= $.extend({
											fields: 		'creator,keywords,title,comment,name',
											types:			'all',
											depth: 			'current', 		// 'tree' | 'current' | 'subfolders'
											exact: 			false
										}, options),
					items 			= [], 
					fields 			= options.fields.split(/,\s?/), 
					fieldslength 	= fields.length,
					exact			= new Array(fieldslength),
					terms,
					termslength,
					conjunctive 	= false,
					allTypes		= options.types === 'all',
					types 			= {},
										
					
					_searchItem = function(o, cat) {
						
							var found = 0;
								
							for (var i = 0, f, s; i < fieldslength; i++) {
								
								if (fields[i].length > 1) {
									// e.g. "folder:title"
									if (fields[i][0] !== cat) {
										continue;
									}
									f = fields[i][1];
								} else {
									f = fields[i][0];
								}
								
								if (o.hasOwnProperty(f)) {
									if ($.isArray(o[f])) {
										// e.g. keywords[]
										s = o[f].join(' ');
									} else {
										s = o[f] + '';
									}
									
									if (s.searchTerm(terms, exact[f], conjunctive)) {
										found++;
									}
								}
							}
							
							
							if ((conjunctive && (found === termslength)) || found) {
								// all terms found
								items.push(o);
							}
						},
						
					_searchFolder = function(folder) {
						
							if (!folder) {
								return;
							}
							
							if (folder !== tree && (allTypes || types['folder'])) {
								// Folders but not the top level
								_searchItem(folder, 'folder');
							}
							
							if (folder.hasOwnProperty(J.OBJECTS)) {
								// Objects
								for (var i = 0, o = folder[J.OBJECTS]; i < o.length; i++) {
									if (o[i].hasOwnProperty(J.CATEGORY)) {
										cat = o[i][J.CATEGORY];
										if (allTypes || types[cat]) {
											_searchItem(o[i], cat);
										}
									}
								}
							}
						},
				
					_addFolder = function(f) {
						
							// Adds one folder
							
							loadData(f, _searchFolder);
							
							if (options.depth !== 'current' && f.hasOwnProperty(J.FOLDERS)) {
								// recursive to subfolders
								for (var i = 0, l = f[J.FOLDERS].length; i < l; i++) {
									_addFolder(f[J.FOLDERS][i]);
								}
							}
						},
						
					_arrangeItems = function() {
							if (options.max && options.max < items.length) {
								items = items.slice(0, options.max);
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
				
				for (var i = 0, f; i < fieldslength; i++) {
					fields[i] = fields[i].split(':');
					f = fields[i][1] || fields[i][0];
					exact[f] = (typeof options.exact === 'string')? (options.exact.indexOf(f) >= 0) : options.exact;
				}
				
				if (!allTypes) {
					
					if (settings.types.charAt(0) === '-') {
						// Negative
						for (var i = 0; i < settings.possibleTypes.length; i++) {
							if (settings.types.indexOf(settings.possibleTypes[i]) === -1) {
								types[settings.possibleTypes[i]] = true;
							}
						}
					} else {
						// Positive
						for (var i = 0, t = settings.types.split(/,\s?/); i < t.length; i++) {
							types[t[i]] = true;
						}
					}
				}
				
				// Starting a new promise collect
				
				defer = [];
				
				// Adding folder(s)
				
				_addFolder((options.depth === 'tree')? tree : currentFolder);
				
				if ($.isFunction(options.ready)) {
					if (defer.length) {
						$.when.apply($, defer).done(function() {
							_arrangeItems();
							options.ready.call(items, options);
						});
					} else {
						_arrangeItems();
						options.ready.call(items, options);
					}
				}
			},
		
		// Tag cloud
		
		collectTags = function(options) {
			
				//console.log('collectTags(' + set + ')');
					
				var options 		= $.extend({
											fields: 	'creator,keywords,folder:title,webLocation:title',
											types:		'all',	
											depth: 		'current', 			// 'tree' | 'current' | 'subfolders'
											exact:		'creator,keywords,name'
										}, options),
					tags 			= [], 
					fields 			= $.isArray(options.fields)? options.fields : options.fields.split(/,\s?/), 
					fieldslength 	= fields.length,
					sortByName 		= options.sort === 'name',
					allTypes 		= options.types === 'all',
					types			= {},
					exact			= {},
					
					// Add tags collected from an item
					// tags = [ 'tag', cnt, 'TAG' ]
					
					_addTags = function(newTags) {
							var newTags = newTags.split('^');
							
							for (var i = 0, found = false, l = newTags.length; i < l; i++) {
								
								if (newTags[i].length < 3) {
									continue;
								}
								
								tag = newTags[i].toUpperCase();
								found = false;
								
								for (var j = 0, tl = tags.length; j < tl; j++) {
									if (tag === tags[j][2]) {
										tags[j][1]++;
										found = true;
										break;
									}
								}
								
								if (!found) {
									tags.push([ newTags[i], 1, tag ]);
								}
							}
						},
					
					// Collects tags from an item
					
					_collectTags = function(o, cat) {
							var ctags = '^',
								ctagsuc = '^',			// Uppercase for comparison
							
								add = function(tag, field) {
										
										if (!tag) {
											return;
										}
										
										var t, 
											ta;
											
										if (exact[field]) {
											ta = [ tag.toString() ];
										} else {
											if (field === 'comment') {
												tag = tag.stripHTML();
											}
											ta = tag.split(/\W+/);
											ta = removeEmpty(ta);
										}
										
										for (var i = 0, l = ta.length, fnd = false; i < l; i++) {
										
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
							
							for (var i = 0, f, keys = ''; i < fieldslength; i++) {
								if (fields[i].length > 1) {
									if (fields[i][0] !== cat) {
										continue;
									}
									f = fields[i][1];
								} else {
									f = fields[i][0];
								}
								
								if (o.hasOwnProperty(f) && o[f]) {
									//console.log(o['name'] + '[' + f + '] = ' + o[f] + ' (' + ($.isArray(o[f])? 'array':(typeof o[f])) + ')');
									if ($.isArray(o[f])) {
										for (var j = 0; j < o[f].length; j++) {
											add(o[f][j], f);
										}
									} else {
										add(o[f], f);
									}
								}
							}
							
							//console.log(ctags);
							if (ctags.length > 1) {
								_addTags(ctags);
							}
						},
					
					// Collect tags from all objects in a folder
					
					_addItems = function(folder) {
					
							// Adds fields from objects array
							if (!folder) {
								return;
							}
							
							if (allTypes || types['folder']) {
								// Current folder
								_collectTags(folder, 'folder');
							}
							
							if (folder.hasOwnProperty(J.OBJECTS)) {
								// Ordinary objects
								for (var i = 0, o = folder[J.OBJECTS], cat; i < o.length; i++) {
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
							
							// Adds one folder
							
							loadData(folder, _addItems);
							
							if (options.depth !== 'current' && folder.hasOwnProperty(J.FOLDERS)) {
								// recursive to subfolders
								for (var i = 0, l = folder[J.FOLDERS].length; i < l; i++) {
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
				
				for (var i = 0, f; i < fieldslength; i++) {
					fields[i] = fields[i].split(':');
					f = fields[i][1] || fields[i][0];
					exact[f] = (typeof options.exact === 'string')? (options.exact.indexOf(f) >= 0) : options.exact;
				}
				
				// Creating object types array too look for
				if (!allTypes) {
					for (var i = 0, t = settings.types.split(/,\s?/); i < t.length; i++) {
						types[t[i]] = true;
					}
				}
				
				// Adding folder(s)
				
				_addFolder((options.depth === 'tree')? tree : currentFolder);
					
				if ($.isFunction(options.ready)) {
				
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
		
		processTemplate = function(template, item) {
			
				var item = item || currentFolder,
					m,
					v;
				
				if (template && template.indexOf('${') > 0) {
				
					while (m = template.match(/\$\{([\w\.]+)\}/)) {
						if (m[1]) {
							v = getProperty(item, m[1], true) || '';
						}
						template = template.substring(0, m.index) + v + template.substring(m.index + m[0].length);
					}
				}
		
				return template;
			},
			
		showError = function(err) {
			
				var el = ($('<div>')
							.css({
								position:			'fixed',
								width:				'80%',
								maxWidth:			'600px',
								top:				'50%',
								left:				'50%',
								transform:			'translate(-50%, -50%)',
								textAlign:			'center',
								padding:			'1em',
								backgroundColor:	'#a00',
								color:				'#e8e8e8'
							})
							.append($('<h5>', {
									text:			'Error'
								}).css({
									color:			'#f63'
								}))
							.append($('<p>', {
									html:			err
								}).css({
									marginBottom:	0
								}))
						).appendTo($('body'));
						
				el.find('a').css({
						color: 				'#fff',
						textDecoration:		'underline'
					});
				
				setTimeout(function() {
						el.fadeOut(function() {
								el.remove();
							});
					}, 6000);
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
			// Search
			collectTags: 					collectTags,
			collectItems: 					collectItems,
			collectByDate: 					collectByDate,
			// Debug
			getTree: 						getTree,
			getPaths: 						getPaths,
			// Type checking
			isImage: 						isImage,
			isAudio: 						isAudio,
			isVideo: 						isVideo,
			isLightboxable: 				isLightboxable,
			isCurrentFolder: 				isCurrentFolder,
			// Acceess
			getLevel: 						getLevel,
			getTitle: 						getTitle,
			getName: 						getName,
			getExtension:					getExtension,
			getComment: 					getComment,
			getMakeDate: 					getMakeDate,
			getAlbumTitle: 					getAlbumTitle,
			getCurrentFolder: 				getCurrentFolder,
			getObjects: 					getObjects,
			getImages: 						getImages,	
			getFolders: 					getFolders,	
			getFolderPath: 					getFolderPath,
			getRelativeFolderPath: 			getRelativeFolderPath,
			getParent: 						getParent,
			getItem:						getItem,
			getRootPath:					getRootPath,
			getItemName:					getItemName,
			getItemPath: 					getItemPath,
			getOptimalImage:				getOptimalImage,
			getOriginalPath:				getOriginalPath,
			getUrl: 						getUrl,
			getThumbPath: 					getThumbPath,
			getImagePath: 					getImagePath,
			getThemeImagePath:				getThemeImagePath,
			getPosterPath: 					getPosterPath,
			getSourcePath: 					getSourcePath,
			getAbsolutePath: 				getAbsolutePath,
			getAbsoluteImagePath: 			getAbsoluteImagePath,
			getPreviousFoldersLastImage: 	getPreviousFoldersLastImage,
			getNextFoldersFirstImage: 		getNextFoldersFirstImage,
			getProperty: 					getProperty,
			getPropertyObject: 				getPropertyObject,
			hasShop: 						hasShop,
			getRootProperty: 				getRootProperty,
			processTemplate:				processTemplate
				
		};
		
};