/*
 *	init.js - initializing the skin, skin-specific utilities
 *	Author: Laza
 */

	/* 
	 *	Java imports
	 */

var JAFilter = Java.type("se.datadosen.jalbum.JAFilter"),
	Category = Java.type("se.datadosen.jalbum.Category"),
	Widgets = Java.type("se.datadosen.jalbum.Widgets"),
	JAlbumUtilities = Java.type("se.datadosen.jalbum.JAlbumUtilities"),
	DateRange = Java.type("se.datadosen.jalbum.DateRange"),
	FixedShapeFilter = Java.type("FixedShapeFilter"),
	ConstrainRatioFilter = Java.type("tiger.ConstrainRatioFilter"),
	File = Java.type("java.io.File"),
	SkinProperties = Java.type("se.datadosen.jalbum.SkinProperties"),
	MyJSONObject = Java.type("se.datadosen.util.MyJSONObject"),
	System = Java.type("java.lang.System"),
	Zip = Java.type("tiger.Zip"),
	ScriptUtils = Java.type("jdk.nashorn.api.scripting.ScriptUtils"),
	AtomicInteger = Java.type("java.util.concurrent.atomic.AtomicInteger");

	// No multiple index pages :: setting up before loading Util
	engine.setRows(0);
	
	// URL encoding, Write UTF-8 are madatory because the JSON database is always written in this format
	engine.setUrlEncode(true);
	//engine.setWriteUTF8(true);
	
	// Zip library
	var zip = new Zip(engine);
	engine.setUsing(zip);
	
	/* 
	 *	Global variables
	 */

	time = (new Date()).getTime();					// time
	today = (time / 86400000) | 0;					// today: number of days since 1970-01-01

	// Fixing wrong Facebook App ID
	if (facebookAppId.indexOf('E') !== -1) {
		print('Facebook App ID is in wrong format, please check it in the Settings!');
		facebookAppId = facebookAppId.split('E')[0].replace(/\./g, '');
	}
	
	// HTML attribute
	htmlAttr = (shareFacebook? 'prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#" ' : '') + 'lang="' + lang + '"';
	
	// Page protocol
	pageProtocol = basePath.startsWith('https://')? 'https:' : 'http:';
	
	// Debug mode? Don't use the minified javascript libraries.
	min = (typeof debugMode !== UNDEF && !!debugMode)? '' : '.min';
	
	// Undefined
	UNDEF = 'undefined';
	
	// Grid classes
	folderGridClass = 'caption-' + folderCaptionPlacement + getGridLadder(folderCols);
	pageGridClass = getGridLadder(pageCols);
	thumbGridClass = 'caption-' + captionPlacement + getGridLadder(thumbCols);
	
	// Box padding
	boxPad = (function() {
			switch (boxPadding) {
				case 'none': 	return 0;
				case 'small':	return 4;
				case 'medium':	return 8;
				case 'large':	return 12;
				case 'x-large':	return 20;
			}
			return 0;
		}());
	
	// Folder image :: this image is copied to the index file's folder with the given name, cropped to the given size
	// Can be used as splash image for example
	// GUI should contain a JTextField folderImageSize, otherwise uncomment this:
	// folderImageSize = "800x400";
	folderImageFileName = 'folderimage.jpg';
	folderImageDims = (heroFullWidth? 1600 : ((parseFloat(maxPageWidth) || 67.5) * 16)) + 'x' + folderImageHeight;
	
	// Folder thumbnail :: placed along the folder image
	// Can be used for sharing over social sites as page thumbnail
	folderThumbFileName = 'folderthumb.jpg';
	folderThumbDims = (function() {
			var w,
				h,
				mpw = ((parseFloat(maxPageWidth) || 67.5) - 1.875) * 16;
				
			if (folderCols < 2) {
				w = mpw - 2 * boxPad;
			} else {
				var fc2 = Math.max(Math.floor(folderCols * 0.75), 1);
				w = Math.round((mpw - (fc2 - 1) * 4) / fc2) - 2 * boxPad;
			}
			
			if (fixedShapeFolderThumbs) {
				if (folderThumbAspectRatio) {
					var ar = folderThumbAspectRatio.split(':');
					h = Math.round(w * ar[1] / ar[0]);
				} else {
					h = Math.round(w * maxThumbHeight / maxThumbWidth);
				}
			} else {
				h = w;
			}
			
			return w + 'x' + h;
		}());
		
	// album description processed
	albumCaption = getProcessed(albumDescription);		
	
	// html formatted album info block 
	albumInfo = (function() {
			var s = '';
			
			if (typeof writer !== UNDEF) {
				s += '<div class="author"><span>' + getText('author') + '</span> '+ writer + '</div>';
			}
			
			if (typeof copyright !== UNDEF) {
				s += '<div class="copyright"><span>' + getText('copyright') + '</span> ' + copyright + '</div>';
			}
			
			if (typeof currentDate !== UNDEF && showModifiedDate) {
				s += '<div class="modifieddate"><span>' + getText('modified') + '</span> ' + currentDate + '</div>';
			}
			
			if (showImageCount) {
				s += getCounts(rootFolder, true, 'div', 'counts');
			}
			
			return s;
		}());
	
	albumImageUrl = urlEncodeFix(basePath + folderImageFileName);
	albumThumbUrl = urlEncodeFix(basePath + folderThumbFileName);
		
	credits = '';
	
	// Feature detection
	_useFacebookBox = !!useFacebookBox && !!facebookAppId && !!facebookPageId;
	_useFacebookCommenting = !!facebookCommenting && !!facebookAppId;
	_useFacebook = _useFacebookBox || shareFacebook || _useFacebookCommenting;
	_usePinterest = pinItButton;
	_useTopNavigation = topNavigationIncludeFolders || topNavigationIncludePages || topNavigationIncludeWebLocations;
	_useBottomNavigation = bottomNavigationIncludeFolders || bottomNavigationIncludePages || bottomNavigationIncludeWebLocations;
	_useDisqusCommenting = !!disqusCommenting && !!disqusAppId;
	_useShop = !!showShop && !!shopId;
	_useFeedback = !!showFeedback && !!feedbackEmail && !!feedbackTemplate;
	_useMap = (showMapSection || showMap)  && !!googleApiKey;
	_useTagCloud = tagCloudSource !== 'none';
	_useSearchNew = searchNewSource !== 'none';
	_usePhotodata = !!showPhotoData && !!photoDataTemplate;
	_useRegions = !!showRegions;
	_useFotomoto = !!useFotomoto && !!fotomotoID;
	_useMostPhotos = !!useMostphotos;
	_useTagCloudBox = tagCloudSource !== 'none' && !!tagCloudFields;
	_useSearch = !!useSearch && !!searchFields;
	_useZip = zipImages !== 'none';
	_anyVr = false;
	_storeAddedDate = searchNewReference === 'added' || newDaysRef === 'added';
	_storeTakenDate = searchNewReference === 'dateTaken' || newDaysRef === 'dateTaken';
	_storeModifiedDate = searchNewReference === 'fileModified' || newDaysRef === 'fileModified';

	//_anyVr = false;
	_anyShares =
			facebookLike ||
			twitterTweet ||
			tumblrButton ||
			pinItButton ||
			shareFacebook || 
			shareTwitter || 
			sharePinterest ||
			shareLinkedin ||
			shareDigg || 
			shareStumbleupon || 
			shareReddit ||
			shareTumblr ||
			shareEmail;
			
	_titleCaptionTemplate = titleCaptionTemplate;
	_folderCaptionTemplate = folderCaptionTemplate;
	_useOriginalTime = thumbCaptionTemplate.contains('${originalTime}') || imageCaptionTemplate.contains('${originalTime}');
	
	// Javascript variables compiled upfront
	jsGlobalVars = null;
	jsLightboxVars = null;
	jsSliderVars = null;
	jsMapVars = null;
	jsCookiePolicyVars = null;

	// Background audio array
	backgroundMusicFolder = 'res';
	
	relPath = '';
	
	/* 
	 * 	New variables
	 *	All types
	 				fileLabel
	 				commentShort
	 				thumbCaption
	 				shop
	 				
	 *	Folders
	 				folderThumbPath
	 				altText
	 				folderModDate
	 				folderCounts
	 				epochDateRange
	 				
	 *  Displayable objects
	 				imageCaption
	 				mostphotos
	 				epochDate
	 				location
	 				
	 *	Images 
	 				photodata
	 				regions
	 
	 */
			
	var processFolder = function(folder) {
					 
				var	shopCount = new AtomicInteger(0),
					locationCount = new AtomicInteger(0),
					regionCount = new AtomicInteger(0),
					vrCount = new AtomicInteger(0),
					imageNum = new AtomicInteger(0),
					zipCount = new AtomicInteger(0),
					dateRange;
					
				//logger(Level.FINE, 'Processing folder "{0}"', folder);
				
				// creating extra variables --> data1.json
				folder.getChildren().forEach(function(ao) { 
					// parallelStream() fails !!!
						
					var vars,
						cat = ao.getCategory(),
						v,
						s,
						t,
						dates;
						
					if (ao.isIncluded() && 
						!(cat === Category.folder && ao.isHidden()) && 
						(vars = ao.getVars())) {
						
						// Extra fileLabel variable
						s = vars.get('label');
						if (s.startsWith('img') || s.startsWith('vid')) {
							s = s.substring(0,19);
						} 
						vars.put('fileLabel', vars.get('fileTitle') || s.replaceAll('_', ' '));
						
						dates = {};
						
						// Shop
						if (cat !== Category.webPage && cat !== Category.webLocation && _useShop) {
									
							if (cat !== Category.folder) {
								shopCount.getAndIncrement();
							}
							
							if (vars.containsKey('shopOptionsLocal') || 
								vars.containsKey('shopDiscountRateLocal') ||
								vars.containsKey('shopQuantityCapLocal')	) {
						
								var shop = new MyJSONObject();
								if (s = vars.get('shopOptionsLocal')) {
									shop.put('options', s.replace(/\n/g, '::'));
									if (s === '-') {
										shopCount.getAndDecrement();
									}
								}
								if (s = vars.get('shopDiscountRateLocal')) {
									shop.put('discountRate', s);
								}
								if (s = vars.get('shopQuantityCapLocal')) {
									shop.put('quantityCap', s);
								}
								vars.put('shop', shop);
							}
						}
						
						// Folders and WebLocations
						
						if (cat === Category.folder || cat === Category.webLocation) {
							
							// Description
							s = vars.get((cat === Category.folder)? 'description' : 'comment');
							if (preFormat) {
								vars.put('commentShort', shorten(preformatText(s).replace(/(<br>\s?)+$/gi, '')));
							} else {
								vars.put('commentShort', shorten(stripHTML(s)));
							}
							
							// Iconpath => SVG, folder thumb path
							if (s = vars.get('iconPath')) {
								s = s.replace('folder.png', 'folder.svg');
								vars.put('iconpath', s);
								vars.put('folderThumbPath', s.replace(/^\.\.\//, ''));
							} else {
								vars.put('folderThumbPath', createFolderThumb(ao, folderThumbDims, fixedShapeFolderThumbs)); 
							}
							
							// Folders only
							if (cat === Category.folder) {
								
								// Counts
								vars.put('counts', (cat === Category.folder)? getCounts(ao, true, 'p') : '');
							
								dateRange = JAlbumUtilities.getDeepCameraDates(ao);
								
								// $folderModDate is for folder captions
								
								switch (folderDateSource) {
									case 'fileDate':
										vars.put('folderModDate', vars.get('fileDate'));
										break;
										
									case 'folderModDate':
										vars.put('folderModDate', getFormattedDate(deepLastModifiedObject(ao)));
										break;
										
									case 'lastCameraDate':
										if (dateRange.last) {
											vars.put('folderModDate', getFormattedDate(dateRange.last));
											break;
										}
										
									case 'cameraDateRange':
										if (dateRange.first && dateRange.last) {
											vars.put('folderModDate', getFormattedDateRange(dateRange.first, dateRange.last));
											break;
										}							
										
									default:
										vars.put('folderModDate', '');
								}
								
								// Added date
								if (_storeAddedDate && (s = JAlbumUtilities.getDeepLastAdded(folder))) {
									dates.added = ScriptUtils.convert(s / 1000, java.lang.Long.class);
								}
								
								// Taken date range
								if (_storeTakenDate && dateRange.first && dateRange.last) {
									dates.dateRange = [ ScriptUtils.convert(dateRange.first / 1000, java.lang.Long.class), 
														ScriptUtils.convert(dateRange.last / 1000, java.lang.Long.class) ];
								}
								
								// Modified date
								if (_storeModifiedDate && (s = JAlbumUtilities.deepLastModified(folder))) {
									dates.fileModified = ScriptUtils.convert(s / 1000, java.lang.Long.class);
								}
							}
							
							// Folder caption
							if (_folderCaptionTemplate && (s = processTemplate(ao, _folderCaptionTemplate))) {
								s = s.replace(/\$\{resPath\}/g, resPath);
								if (preFormat) {
									s = preformatText(s);
								} else {
									s = s.replaceAll('_', ' ');
								}
								vars.put('thumbCaption', s);
							}

						} else {
							
							// Pages and normal items
							
							// Comment
							s = vars.get('comment');
							if (preFormat) {
								s = preformatText(s);
								vars.put('comment', s);
								vars.put('commentShort', shorten(s));
							} else {
								vars.put('commentShort', shorten(stripHTML(s)));
							}
														
							if (cat === Category.webPage) {
								
								// Web page
								
								t = vars.get('title');
								
								// Page title, HTML tags removed
								vars.put('pageTitle', cleanup(stripHTML(t)));
								
								// Folder title: hero 
								vars.put('folderTitle', '<h1>' + t + '</h1>');
								
								// Top navigation
								vars.put('topNavigation', _useTopNavigation? getDropdownMenu(rootFolder, ao, !logoName, topNavigationIncludeFolders, topNavigationIncludePages, topNavigationIncludeWebLocations, topNavigationDepth - 1) : '');
								
								// Page URL
								if (basePath) {
									vars.put('pageUrl', basePath + relPath + ao.getWebName());
								} else {
									vars.put('pageUrl', '');
								}
								
								// Up link
								vars.put('uplink', './' + indexName);
								vars.put('uplinkText', getText('backToIndex'));
								
								// Description
								vars.put('pageDescription', cleanup(stripHTML(s)));
								
								// Folder info: no made date, no image count
								vars.put('folderInfo', '');
								
								// Caption
								vars.put('thumbCaption', '<h6>' + t + '</h6>' + (s? ('<div class="comment">' + s + '</div>') : ''));
						
							} else {
								
								// Normal items
								
								// Image number
								vars.put('imageNum', imageNum.getAndIncrement() + 1);
								
								// Formatted file size
								vars.put('fileSizeFormatted', getSizeAsString(vars.get('fileSize')));
								
						
								// Added date
								if (_storeAddedDate && (s = ao.getWhenAdded())) {
									dates.added = ScriptUtils.convert(s / 1000, java.lang.Long.class);
								}
								
								// Taken date
								if (_storeTakenDate && (s = getEpochDate(ao, false))) {
									dates.dateTaken = ScriptUtils.convert(s / 1000, java.lang.Long.class);
								}
								
								// Modified date
								if (_storeModifiedDate && (s = ao.getLastModified())) {
									dates.fileModified = ScriptUtils.convert(s / 1000, java.lang.Long.class);
								}
								
								// Time of day
								if (_useOriginalTime && (v = getOriginalTime(ao))) {
									vars.put('originalTime', v);
								}
								
								// Thumbnail caption
								if (thumbCaptionTemplate && (s = processTemplate(ao, thumbCaptionTemplate))) {
									vars.put('thumbCaption', s);
								}
								
								// Photo data
								if (_usePhotodata && (s = getPhotodata(ao, photoDataTemplate, 'p', showPhotoDataLabel))) {
									vars.put('photodata', s);
								}
								
								// Image caption
								if (imageCaptionTemplate && (s = processTemplate(ao, imageCaptionTemplate))) {
									vars.put('imageCaption', s.replaceAll('_', ' '));
								}

								if (cat === Category.image) {
									
									// Regions / faces
									if (_useRegions && (s = getRegions(ao)) !== null) {
										vars.put('regions', JSON.stringify(s));
										regionCount.getAndIncrement();
									}
									
									// 360 panorama
									if (s = checkProjectionType(ao)) {
										vars.put('projectionType', s);
										if (s === 'equirectangular') {
											vrCount.getAndIncrement();
										}
									}
									
									// Sound clip
									if (useSoundClips && (s = checkSoundClip(ao))) {
										vars.put('soundClip', s);
									}
								}
									
								// Map
								if (_useMap && (s = getLocation(ao))) {
									vars.put('location', s);
									locationCount.getAndIncrement();
								}
								
								// Mostphotos
								if (_useMostPhotos && (s = vars.get('buyImageUrl'))) {
									vars.put('mostphotos', s.replace('http\s?://www.mostphotos.com/', ''));
								}
								
								// External content
								if ((v = vars.get('externalContent')) && (v = processTemplate(ao, v, true))) {
									var ext = new MyJSONObject(),
										size = vars.get('externalContentSize');
										
									ext.put('cont', v.trim());
									
									if (!size && (size = getDimFromCode(v.toLowerCase()))) {
										size = size.join('x');
									}
									                              
									if (size) {
										ext.put('size', size);
									}
									
									vars.put('external', ext);
								}
								
								// ZIP: counting only
								if (zipImages === 'slides' || zipImages === 'originals') {
									zipCount.getAndIncrement();
								} else if (zipImages === 'included' && vars.get('originalPath')) {
									zipCount.getAndIncrement();
								}
							}
						}
						
						if (!isEmpty(dates)) {
							vars.put('dates', dates);
						}
					}
				});
				
				// Current folder variables --> tree.json
				
				relPath = getRelPath(folder);
				
				var	vars = folder.getVars();
				
				if (vars) {
					
					var c = vars.get('description'),
						t = vars.get('title'),
						modDate,
						topNav,
						top = (folder === rootFolder),
						counts = JAlbumUtilities.countCategories(currentFolder, false);
						
					// Counters
					vars.put('shopCount', shopCount.get());
					vars.put('locationCount', locationCount.get());
					vars.put('regionCount', regionCount.get());
					vars.put('vrCount', vrCount.get());
					vars.put('folderCount', counts.getCount(Category.folder));
					vars.put('webLocationCount', counts.getCount(Category.webLocation));
					vars.put('pageCount', counts.getCount(Category.webPage));
					vars.put('imageCount', counts.getCount(Category.image));
					vars.put('audioCount', counts.getCount(Category.audio));
					vars.put('videoCount', counts.getCount(Category.video));
					vars.put('otherCount', counts.getCount(Category.other));
					vars.put('itemCount', counts.getCount(Category.image) + counts.getCount(Category.audio) + counts.getCount(Category.video) + counts.getCount(Category.other));
					
					_anyVr = vrCount.get() > 0;

					// Zip file?
					vars.put('zipFile', zipCount.get()? (folder.getWebName() + '.zip') : '');
					
					// Folder modified date for templates
					if (top) {
						
						var dates = {};
						
						// Epoch date range
						dateRange = JAlbumUtilities.getDeepCameraDates(folder);
						
						switch (folderDateSource) {
							case 'fileDate':
								vars.put('folderModDate', modDate = vars.get('fileDate'));
								break;
								
							case 'folderModDate':
								vars.put('folderModDate', modDate = getFormattedDate(deepLastModifiedObject(folder)));
								break;
								
							case 'lastCameraDate':
								vars.put('folderModDate', modDate = getFormattedDate(dateRange.last + 0));
								break;
								
							case 'cameraDateRange':
								if (dateRange.first && dateRange.last) {
									//print(dateRange.first + ' - ' + dateRange.last);
									vars.put('folderModDate', modDate = getFormattedDateRange(dateRange.first + 0, dateRange.last + 0));
									break;
								}							
								
							default:
								vars.put('folderModDate', modDate = '');
						}
						
						// Added date
						if (_storeAddedDate && (s = JAlbumUtilities.getDeepLastAdded(folder))) {
							dates.added = ScriptUtils.convert(s / 1000, java.lang.Long.class);
						}

						// Taken Date
						if (_storeTakenDate && dateRange.first && dateRange.last) {
							dates.dateRange = [ ScriptUtils.convert(dateRange.first / 1000, java.lang.Long.class), 
												ScriptUtils.convert(dateRange.last / 1000, java.lang.Long.class) ];
						}
						
						// Modified date
						if (_storeModifiedDate && (s = JAlbumUtilities.deepLastModified(folder))) {
							dates.fileModified = ScriptUtils.convert(s / 1000, java.lang.Long.class);
						}
						
						if (!isEmpty(dates)) {
							vars.put('dates', dates);
						}
							
					}
					
					// Neighboring folders
					if (!top && (linkNeighboringFolders || afterLast === 'ask' || afterLast === 'nextfolder')) {
						
						if ((ao = getPreviousFolder(folder)) != null) {
							v = ao.getVars();
							vars.put('previousFolderPath', '../' + v.get('closeupPath'));
							vars.put('previousFolderTitle', ao.getTitle() || ao.getName().replaceAll('_', ' '));
							vars.put('previousFolderThumbPath', '../' + v.get('thumbPath'));
							s = encodeAsJava(ao.getWebName());
							
							if ((ao = getLastImage(ao)) != null) {
								vars.put('previousFoldersLast', '../' + s + '/' + indexName + '#img=' + getFinalName(ao));
							} else {
								vars.put('previousFoldersLast', '');
							}
						} else {
							vars.put('previousFolderPath', '');
							vars.put('previousFolderTitle', '');
							vars.put('previousFolderThumbPath', '');
							vars.put('previousFoldersLast', '');
						}
						
						if ((ao = getNextFolder(folder)) != null) {
							v = ao.getVars();
							vars.put('nextFolderPath', '../' + v.get('closeupPath'));
							vars.put('nextFolderTitle', ao.getTitle() || ao.getName().replaceAll('_', ' '));
							vars.put('nextFolderThumbPath', '../' + v.get('thumbPath'));
							s = encodeAsJava(ao.getWebName());
							
							if ((ao = getFirstImage(ao)) != null) {
								vars.put('nextFoldersFirst', '../' + s + '/' + indexName + '#img=' + getFinalName(ao));
							} else {
								vars.put('nextFoldersFirst', '');
							}
						} else {
							vars.put('nextFolderPath', '');
							vars.put('nextFolderTitle', '');
							vars.put('nextFolderThumbPath', '');
							vars.put('nextFoldersLast', '');
						}
					}
							
					// Page URL and thumb path
					if (basePath) {
						vars.put('pageUrl', basePath + relPath + indexName);
						vars.put('pageThumbPath', basePath + relPath + folderThumbFileName);
					} else {
						vars.put('pageUrl', '');
						vars.put('pageThumbPath', folderThumbFileName);
					}
					
					// Page title, HTML tags removed
					vars.put('pageTitle', cleanup(stripHTML(t)));
					
					// Top navigation
					vars.put('topNavigation', _useTopNavigation? getDropdownMenu(rootFolder, folder, !top && !logoName, topNavigationIncludeFolders, topNavigationIncludePages, topNavigationIncludeWebLocations, topNavigationDepth - 1) : '');
					
					// Bottom navigation
					vars.put('bottomNavigation', _useBottomNavigation? getRootNavigation(folder, '', '', bottomNavigationIncludeFolders, bottomNavigationIncludePages, bottomNavigationIncludeWebLocations) : '');
						
					// Breadcrumb path
					if (showBreadcrumbPath !== 'none') {
						vars.put('breadcrumbPath', getBreadcrumbPath(folder));
					}
					
					// Up link
					if (level) {
						vars.put('uplink', '../' + indexName);
						vars.put('uplinkText', getText('upOneLevel'));
					} else {
						vars.put('uplink', homepageAddress || '');
						vars.put('uplinkText', homepageLinkText || getText('home'));
					}
					
					// Description
					vars.put('pageDescription', stripQuot(stripHTML(c)));
					
					vars.put('folderInfo', 
						(
							showModifiedDate? 
								('<div class="modifieddate"><span>' + getText('modified') + '</span> ' + currentDate /*+ vars.get('fileDate')*/ + '</div>') 
								: 
								''
						) + (
							showImageCount? getCounts(folder, true, 'div', 'counts') : '')
						);
					
					// Title as in the Hero
					
					if (_titleCaptionTemplate && (s = processTemplate(folder, _titleCaptionTemplate))) {
						//s = s.replace(/\$\{resPath\}/g, resPath);
						if (preFormat) {
							s = preformatText(s);
						} else {
							s = s.replaceAll('_', ' ');
						}
						vars.put('folderTitle', s);
					} else {
						vars.put('folderTitle', '');
					}
					
					// Processing folder image and thumbnail
					vars.put('hasFolderImage', createFolderImage(folder, folderImageDims));
				}
			};
					
		/*
		 *	Initializing Javascript variables
		 */
		 
		getGlobalVars = function() {
				var o = {
							albumName:		stripQuot(albumTitle),
							makeDate:		ScriptUtils.convert((new Date()).getTime() / 1000, java.lang.Long.class),
							licensee:		license,
							thumbDims:		maxThumbWidth + 'x' + maxThumbHeight + (fixedShapeThumbs? '!' : '')
						};
						
				if (indexName !== 'index.html') {
					o['indexName'] = indexName;
				}
				
				if (homepageAddress) {
					o['uplink'] = escQuot(homepageAddress);
				}
				
				// Controls
				if (!enableKeyboard) {
					o['enableKeyboard'] = false;
				}
				
				if (!enableMouseWheel) {
					o['enableMouseWheel'] = false;
				}
				
				if (rightClickProtect) {
					o['rightClickProtect'] = true;
				}
				
				if (_anyShares) {
					
					var s = new Array();
					
					if (shareFacebook) s.push('facebook');
					if (shareTwitter) s.push('twitter');
					if (shareTumblr) s.push('tumblr');
					if (sharePinterest) s.push('pinterest');
					if (shareLinkedin) s.push('linkedin');
					if (shareDigg) s.push('digg');
					if (shareStumbleupon) s.push('stumbleupon');
					if (shareReddit) s.push('reddit');
					if (shareEmail) s.push('email');
					o['share'] = { 
						sites:			s.join(','),
						hook:			'.social-links'
					}
					
					s = [];
					if (facebookLike) s.push('facebook');
					if (twitterTweet) s.push('twitter');
					if (tumblrButton) s.push('tumblr');
					if (pinItButton) s.push('pinterest');
					if (s.length) {
						o['share']['buttons'] = s.join(',');
					}
				}
				
				if (_useSearch) {
					o['search'] = {
						fields:		searchFields,
						hook:		'.search'
					}
				}
				
				if (_useFeedback) {
					o['feedback'] = {
						to:				xEncrypt(feedbackEmail),
						floatBtnLabel:	feedbackFloatButtonLabel,
						copyBtnLabel:	feedbackCopyButtonLabel,
						sendBtnLabel:	feedbackSendButtonLabel,
						hook:			'#feedback'
					};
					
					if (feedbackFormatting !== 'human') {
						o['feedback']['formatting'] = feedbackFormatting;
					}
					if (feedbackTemplate) {
						o['feedback']['template'] = feedbackTemplate;
					}
					if (feedbackInstructions) {
						o['feedback']['instructions'] = feedbackInstructions;
					}
					if (useFeedbackSendButton === false) {
						o['feedback']['useSendButton'] = useFeedbackSendButton;
					}
				}
				
				if (extraSizes) {
					o['extraSizes'] = extraSizes;
				}
				
				if (markFilesNew && newDaysCount) {
					o['markNew'] = {
						days:		newDaysCount,
						reference:	newDaysRef
					}
				}
				/*if (showFolderImageCount) {
					o['showCounts'] = true;
				}*/
				if (thumbCols !== 4) {
					o['thumbGridClass'] = thumbGridClass;
				}
				if (!hoverEffectThumbs) {
					o['thumbHoverClass'] = '';
				}
				if (!fixedShapeThumbs) {
					o['fixedShapeThumbs'] = false;
				}
				if (!fixedShapeFolderThumbs) {
					o['fixedShapeFolderThumbs'] = false;
				}
				if (!captionPlacement.equals('below')) {
					o['captionPlacement'] = captionPlacement;
				}
				if (!folderCaptionPlacement.equals('below')) {
					o['folderCaptionPlacement'] = folderCaptionPlacement;
				}
				/*
				if (!fixedShapeThumbs || !captionPlacement.equals('tooltip')) {
					o['fixThumbs'] = true;
				}
				if (!fixedShapeThumbs || !folderCaptionPlacement.equals('over')) {
					o['fixFolderThumbs'] = true;
				}
				*/
				if (captionPlacement === 'above') {
					o['captionAbove'] = true;
				} else if (captionPlacement === 'tooltip') {
					o['captionTooltip'] = true;
				}
				
				return o;
			},
			
		// Lightbox variables
		
		getLightboxVars = function() {
				var oo = {
							lightbox:	{}
						},
					o = oo.lightbox;
					
				if (afterLast !== 'donothing') {
					o['afterLast'] = afterLast;
				}
				if (transitionType !== 'crossFadeAndSlide') {
					o['transitionType'] = transitionType;
				}
				if (controlsUseText) {
					o['controlsUseText'] = true;
				}
				if (!useThumbnailStrip) {
					o['useThumbstrip'] = false;
				}
				if (!thumbnailsVisible || !useThumbnailStrip) {
					o['thumbsVisible'] = false;
				}
				if (infoPanelVisible == false) {
					o['captionVisible'] = false;
				}
				if (showPhotoDataInTheCaption) {
					o['metaAsPopup'] = false;
				}
				if (hideFitToggle) {
					o['useZoom'] = false;
				}
				if (hideStartStop) {
					o['useSlideshow'] = false;
				}
				if (fitImages === 'none') {
					o['fitImages'] = false;
				} else if (fitImages === 'vertically') {
					o['fitBoth'] = false;
				}
				if (dontStretchBehind) {
					o['fitBetween'] = true;
				}
				o['fitPadding'] = fitPadding;
				if (!neverScaleUp) {
					o['scaleUp'] = true;
				}
				if (videoAutoPlay) {
					o['videoAuto'] = true;
				}
				if (downloadNonImages) {
					o['allowDownloadOthers'] = true;
				}
				if (hideDownloadButton) {
					o['hideDownload'] = true;	
				}
				if (printImageButton) {
					o['printImage'] = true;
				}
				if (showShare) {
					o['showShare'] = true;
				}
				if (transitionSpeed !== 400) {
					o['speed'] = transitionSpeed;
				}
				if (slideshowDelay != 4) {
					o['slideshowDelay'] = Math.round(slideshowDelay * 1000);
				}
				if (showImageNumbers) {
					o['showNumbers'] = true;
				}
				if (!autohideControls) {
					o['autohideControls'] = false;
				}
				if (slideshowAuto) {
					o['autoStart'] = true;
				}
				if (!use360Player) {
					o['use360Player'] = false;
				}
				if (backgroundAudioSlideshowControl) {
					o['backgroundAudioSlideshowControl'] = true;
				}
				if (!muteBackgroundAudio) {
					o['muteBackgroundAudio'] = false;
				}
				if (!buttonLabelsVisible) {
					o['buttonLabels'] = false;
				}
				if (_useFotomoto) {
					o['fotomoto'] = true;
				}
				if (regionsBtnText && regionsBtnText !== getText('regionsBtn')) {
					o['regionsBtn'] = regionsBtnText;
				}
				if (!clickBesideForIndex) {
					o['quitOnDocClick'] = false;
				}
				if (!clickForNext) {
					o['clickForNext'] = false;
				}
				if (useFullScreen) {
					o['useFullScreen'] = true;
				}
				
				return oo;	
			},
			
		// Audio player vars
		
		getAudioPlayerVars = function() {
				var o = {};
				
				if (backgroundAudio) {
					o['src'] = backgroundMusic;
					
					if (!backgroundAudioAutoPlay) {
						o['autoPlay'] = false;
					}
					if (!backgroundAudioLoop) {
						o['loop'] = false;
					}
					if (backgroundAudioSlideshowControl) {
						o['slideshowControl'] = true;
					}
					if (!backgroundAudioRetainPosition) {
						o['saveStatus'] = false;
					}
					
					o['folder'] = backgroundMusicFolder;
				}
				
				return o;
			},
			
		// Map vars
		
		getMapVars = function() {
				var o = {
						map: {
							type:	mapType,
							zoom:	mapZoom,
							index:	showMapSection
						}
					};
				
				if (googleApiKey && googleApiKey.charAt(0) !== '#') {
					o.map['apiKey'] = googleApiKey.trim();
				}
				
				return 	o;
			},
	
		// Index page variabes
		
		getIndexVars = function() {
				var o = {
							rootPath:	rootPath,
							resPath:	resPath,
							relPath:	relPath.replace(/\/$/, '')
						};
				
				if (_useTagCloud) {
					o['tagCloud'] = {
						fields:		tagCloudFields.replace(/,\s+/g, ','),
						depth:		tagCloudSource,
						hook:		'#tag-cloud .tag-cloud'
					};
					if (tagCloudSort !== 'none') {
						o['tagCloud']['sort'] = tagCloudSort;
					}
					if (tagCloudFontVaries) {
						o['tagCloud']['fontVaries'] = true;
					}
					if (tagCloudSearch) {
						o['tagCloud']['searchHook'] = '#tag-cloud form';
					}
				}
				
				if (_useSearchNew) {
					o['searchNew'] = {
						days:		searchNewDays.replace(/,\s+/g, ','),
						depth:		searchNewSource,
						hook:		'.search-new'
					}
					if (searchNewReference !== 'dateTaken') {
						o['searchNew']['reference'] = searchNewReference;
					}
					if (!searchNewSinceLastVisit) {
						o['searchNew']['sinceLastVisit'] = false;
					}
				}
				
				if (level > 0) {	
					o['level'] = level;
					if (typeof previousFoldersLast !== UNDEF) {
						o['previousFoldersLast'] = previousFoldersLast;
					}
					if (typeof nextFoldersFirst !== UNDEF) {
						o['nextFoldersFirst'] = nextFoldersFirst;
					}
				}
				
				if (folderCols > 2) {
					o['folderCols'] = folderCols;
				}
				
				return o;
			},

		//	Get Javascript variable to pass to the skin
		
		getJsVars = function() {
				var v = extend({}, jsGlobalVars, { 'pageType': pageType }, jsMapVars, getAudioPlayerVars());
				
				if (pageType === 'index') {
					extend(v, getIndexVars(), jsLightboxVars);
				}
					
				return (JSON.stringify(v)).replace(/\:true/g, ':!0').replace(/\:false/g, ':!1');
			},
			
		// Get APIs
		
		getAPIs = function() {
				var a = {};
				
				if (googleSiteID && googleAnalytics !== 'none') {
					a['googleAnalytics'] = [ xEncrypt(googleSiteID), googleAnalytics, supportDoubleclick ];
				}
				if (_useFacebook || _useFacebookBox) {
					a['facebook'] = [ xEncrypt(facebookAppId), locale ];
				}
				if (_useDisqusCommenting) {
					a['disqus'] = [ xEncrypt(disqusAppId) ];
				}
				if (_usePinterest) {
					a['pinterest'] = [];
				}
				
				return JSON.stringify(a).replace(/\:true/g, ':!0').replace(/\:false/g, ':!1');
			},	
			
		getCookiePolicyVars = function() {
			
				var v = {};
				
				v['cookiePolicy']= showCookiePolicy;
				
				if (cookiePolicyStay != 15) {
					v['stay'] = cookiePolicyStay;
				}
			
				if (cookiePolicyUrl) {
					v['cookiePolicyUrl'] = cookiePolicyUrl;
				}
				
				return JSON.stringify(v).replace(/\:true/g, ':!0').replace(/\:false/g, ':!1');
			},
				
	
		/*
		 * Initializing album
		 */
			 
		initAlbum = function() {
			
				// Fixed shape
				if (fixedShapeThumbs) {
					engine.addFilter(new FixedShapeFilter(), JAFilter.THUMBNAILS_PRESCALE_STAGE);
				} else {
					engine.addFilter(new ConstrainRatioFilter(minVerticalAR, maxHorizontalAR), JAFilter.THUMBNAILS_PRESCALE_STAGE);
				}
			
				/*
				// Uplink
				if (homepageAddress) {
					uplink = homepageAddress;
					uplinkText = homepageLinkText;
				}
				*/
				
				if (folderDateSource === 'none') {
					_folderCaptionTemplate = folderCaptionTemplate.replace(/\s*(<span class="date">)?\$\{folderModDate\}<\/span>/g, '');
					_titleCaptionTemplate = titleCaptionTemplate.replace(/\s*(<span class="date">)?\$\{folderModDate\}<\/span>/g, '');
				}
				
				var sb = new Array();
				
				// Custom link
				if (customLink) {
					sb.push('<a href="' + customLink + '" target="_blank">' + 
						((customLinkText)? customLinkText : customLink) +
						'</a>');
				}
				
				// Credits
				if (!engine.isExcludeBacklinks()) {
					// jAlbum credit
					sb.push('<a href="' + generatorUrl + 
						'" rel="generator" data-tooltip title="' + 
						getText('getJalbumNow') + ' (v' + internalVersion + ')">' +
						(creditText? creditText : (getText('credit').replace(/\{0\}/g, getText('photoAlbums')).replace(/\{1\}/g, 'jAlbum'))) +
						'</a>');
					
					// Skin link
					sb.push('<a href="' + skinLink + 
						'" rel="generator" data-tooltip title="' +
						getText('skin') + ': ' + skin + ' ' + styleName + ', ' + 
						skinVersion + '">' + skin + '</a>');
				}
				
				credits = sb.join(' &middot; ');
				
				if (heroPattern) {
					copyResource('patterns/' + (isLightColor(backgroundColor, heroColor)? 'light' : 'dark'), heroPattern);
				}
				
				// MS server configuration
				if (useMsServer) {
					copySkinFile('includes', 'web.config');
				}
		
				// Expiry headers
				if (useExpiry) {
					copySkinFile('includes', '.htaccess');
				}
				
				copySkinFile('includes', 'robots.txt');
				copySkinFile('includes', 'humans.txt');
				
				// Background music
				if (backgroundAudio) {
					backgroundMusic = copyResources(backgroundAudio.split('\t'), backgroundMusicFolder);
					jsAudioPlayerVars = getAudioPlayerVars(); 
				} else {
					backgroundMusic = '';
				}
				
				// JS variables
				jsGlobalVars = getGlobalVars();	
				jsLightboxVars = getLightboxVars();
				jsMapVars = _useMap? getMapVars() : null;
				jsCookiePolicyVars = getCookiePolicyVars();
				
				// Creating all.js
				mergeJs('js',
					// Foundation libraries
					'foundation,' + 'what-input,' +
					// Utilities
					'laza.util,' +
					// Album model
					'jalbum.album,' +
					// laza libraries
					'laza.cookie,laza.scrolltop,laza.sharebuttons,laza.transform,laza.swipe,' +
					// Audio player
					(backgroundMusic? 'laza.audioPlayer,' : '') +
					// Map
					((_useMap !== 'none')? 'laza.addmap,' : '') +
					// Lightbox and misc utilities
					'laza.lightbox,laza.alignto,laza.addtooltip,laza.modal,laza.matchheight,' +
					// Paypal
					(_useShop? 'laza.paypal,' : '') +
					// Feedback
					(_useFeedback? 'laza.feedback,' : '') +
					// main Js
					'main',
					// Output name
					'all',
					debugMode,
					[
						// Texts:start
						// modal
						'closeWindow',
						'okButton',
						'warning',
						'error',
						// relative date
						'today',
						'yesterday',
						'daysAgo',
						'monthsAgo',
						'yearsAgo',
						// paypal
						'addCart',
						'shoppingCart',
						'edit',
						'continueShopping',
						'added',
						'buyNow',
						'processedByPaypal',
						'viewCart',
						'emptyCart',
						'removeAllItems',
						'yes',
						'no',
						'noMoreItems',
						'item',
						'items',
						'success',
						'couponCode',
						'redeem',
						'noSuch',
						'expired',
						'lowerThanCurrent',
						'reclaimed',
						'select',
						'all',
						'none',
						'selectedItems',
						'shoppingcartInfo',
						'subtotal',
						'total',
						'shippingAndHandling',
						'reduction',
						'discount',
						'tax',
						'remove',
						'couponAccepted',
						'couponRemoved',
						'amountLowerThan',
						'addMoreItems',
						'validAbove',
						'higherThanTotal',
						'minAmountWarning',
						'minQuantityWarning',
						'maxNItems',
						// feedback
						'continueBrowsing',
						'feedback',
						'sendFeedback',
						'addComment',
						'viewFeedbackCart',
						'feedbackOnAlbum',
						'dismissFeedback',
						'removeAllItems',
						'to',
						'subject',
						'warning',
						'removeAll',
						'copiedToClipboard',
						'messageSent',
						'errorSending',
						'emailMissing',
						'tooLong',
						'copyInstructions',
						'feedbackButtonExplanation',
						// share buttons
						'share',
						'shareOn',
						'checkThisOut',
						'localWarning',
						// search
						'foundNTimes',
						'notFound',
						'search',
						'newImages',
						'label',
						'return',
						'and',
						// search new
						'newItem',
						'today',
						'inThePast24Hours',
						'inThePast48Hours',
						'inTheLastDay',
						'inThePastNDays',
						'inThePastNMonths',
						'inThePastNYears',
						'sinceMyLastVisit',
						'imagesAdded',
						'imagesModified',
						'imagesTaken',
						// lightbox
						'startSlideshow',
						'startSlideshowShort',
						'atFirstPage',
						'atLastPage',
						'atLastPageQuestion', 
						'startOver', 
						'backToHome',
						'stop',
						'pause',
						'pauseShort',
						'upOneLevel',
						'upOneLevelShort',
						'backToIndex',
						'previousPicture',
						'previousPictureShort',
						'nextPicture',
						'nextPictureShort',
						'previousFolder',
						'nextFolder',
						'oneToOneSize',
						'oneToOneSizeShort',
						'fitToScreen',
						'fitToScreenShort',
						'showInfo',
						'showInfoShort',
						'hideInfo',
						'hideInfoShort',
						'showThumbs',
						'showThumbsShort',
						'hideThumbs',
						'hideThumbsShort',
						'clickToOpen',
						'metaBtn', 
						'metaLabel',
						'mapBtn',
						'mapLabel',
						'shopBtn',
						'shopLabel',
						'viewCartLabel',
						'feedbackLabel',
						'shareBtn',
						'shareLabel',
						'download',
						'print',
						'printLabel',
						'fotomotoBtn',
						'fotomotoLabel',
						'mostphotosBtn',
						'mostphotosLabel',
						'regionsBtn',
						'regionsLabel',
						// feedback
						'sendFeedback',
						'message',
						'subject',
						'comment',
						'yourEmail',
						'send',
						'messageSent',
						'errorSending',
						'tooLong',
						'emailMissing',
						'noItemsSelected',
						'selectItemsHint',
						// scroll to top
						'scrollTopTooltip',
						// etc
						'more',
						'less',
						'locationWarning',
						'cookiePolicyText',
						'cookiePolicyAgree',
						'cookiePolicyLearnMore',
						'gdprComplianceText',
						'allowAll',
						'denyAll',
						'allowSelected'
						// Texts:end
					]
				);
				
				var vars = rootFolder.getVars();
			
				if (_useShop) {
					var shop = new MyJSONObject();
						
					shop.put('id', shopId);
					shop.put('currency', shopCurrency);
					
					if (shopOptions) {
						shop.put('options', shopOptions.replace(/\n/g, '::'));
					}
					if (shopHandling) {
						shop.put('handling', shopHandling);
					}
					if (shopTax) {
						shop.put('tax', shopTax);
					}
					if (shopQuantityCap) {
						shop.put('quantityCap', shopQuantityCap);
					}
					if (shopDiscountRate) {
						shop.put('discount', shopDiscountRate);
					}
					if (shopDiscountMinAmount) {
						shop.put('discountMinAmount', shopDiscountMinAmount);
					}
					if (shopDiscountMinQuantity) {
						shop.put('discountMinQuantity', shopDiscountMinQuantity);
					}
					if (shopCoupons) {
						shop.put('coupons', xEncrypt(shopCoupons.replace(/\n/g, '::')));
					}
					if (shopSuccessUrl) {
						shop.put('successUrl', shopSuccessUrl);
					}
					if (shopInstructions) {
						shop.put('instructions', shopInstructions);
					}
					
					vars.put('shop', shop);
				}
							
			};
		
	initAlbum();
	
