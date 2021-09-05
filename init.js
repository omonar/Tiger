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
	Long = Java.type("java.lang.Long"),
	SkinProperties = Java.type("se.datadosen.jalbum.SkinProperties"),
	MyJSONObject = Java.type("se.datadosen.util.MyJSONObject"),
	System = Java.type("java.lang.System"),
	IO = Java.type('se.datadosen.util.IO'),
	LinkFile = Java.type("se.datadosen.io.LinkFile"),
	Zip = Java.type("tiger.Zip"),
	AtomicInteger = Java.type("java.util.concurrent.atomic.AtomicInteger"),
	JSONMaker = Java.type("se.datadosen.jalbum.JSONMaker");

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

	// Undefined
	UNDEF = 'undefined';
	
	time = (new Date()).getTime();					// time
	today = (time / 86400000) | 0;					// today: number of days since 1970-01-01
	
	skinVersion = new SkinProperties(skinDirectory).getProperty(SkinProperties.VERSION);
	
	// Fixing wrong Facebook App ID
	if (facebookAppId.indexOf('E') !== -1) {
		print('Facebook App ID is in wrong format, please check it in the Settings!');
		facebookAppId = facebookAppId.split('E')[0].replace(/\./g, '');
	}
	
	// Page protocol
	pageProtocol = basePath.startsWith('https://')? 'https:' : 'http:';
	
	// Debug mode? Don't use the minified javascript libraries.
	min = (typeof debugMode !== UNDEF && !!debugMode)? '' : '.min';
	
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
			
			if (typeof showImageCount !== UNDEF && showImageCount) {
				s += getCounts(rootFolder, true, 'div', 'counts');
			}
			
			return s;
		}());
	
	albumImageUrl = urlEncodeFix(basePath + folderImageFileName);
	albumThumbUrl = urlEncodeFix(basePath + folderThumbFileName);
		
	credits = getCredits();
	
	// Feature detection
	_useFacebookBox = !!useFacebookBox && !!facebookAppId && !!facebookPageId;
	_useFacebookCommenting = !!facebookCommenting && !!facebookAppId;
	_useFacebook = _useFacebookBox || shareFacebook || _useFacebookCommenting;
	_usePinterest = !!pinItButton;
	_useTopNavigation = topNavigationIncludeFolders || topNavigationIncludePages || topNavigationIncludeWebLocations || homepageAddress;
	_useBottomNavigation = bottomNavigationIncludeFolders || bottomNavigationIncludePages || bottomNavigationIncludeWebLocations;
	_useDisqusCommenting = !!disqusCommenting && !!disqusAppId;
	_useShop = !!showShop && !!shopId;
	_useFeedback = !!showFeedback && !!feedbackEmail && !!feedbackTemplate;
	_useMap = (showMapSection || showMap)  && !!googleApiKey;
	_useTagCloud = tagCloudSource !== 'none' && !!tagCloudFields;
	_useSearchNew = searchNewSource !== 'none';
	_usePhotodata = !!showPhotoData && !!photoDataTemplate;
	_useRegions = !!showRegions;
	_useFotomoto = !!useFotomoto && !!fotomotoID;
	_useMostPhotos = !!useMostphotos;
	_useSearch = !!useSearch && !!searchFields;
	_useFilters = !!useFilters && (typeof filterData !== 'undefined');
	_useSort = !!useSort && (typeof sortData !== 'undefined');
	_useZip = zipImages !== 'none';
	_useExtraSizes = (typeof extraSizes !== 'undefined') && extraSizes;
	_useRating = !!useRating && (visitorRating || useJalbumRating);
	_anyVr = false;
	_storeAddedDate = searchNewReference === 'added' || newDaysRef === 'added';
	_storeTakenDate = searchNewReference === 'dateTaken' || newDaysRef === 'dateTaken';
	_storeModifiedDate = searchNewReference === 'fileModified' || newDaysRef === 'fileModified';
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
			shareReddit ||
			shareTumblr ||
			shareEmail ||
			shareLink;
			
	_titleCaptionTemplate = titleCaptionTemplate;
	_folderCaptionTemplate = folderCaptionTemplate;
	_useOriginalTime = 	thumbCaptionTemplate.indexOf('${originalTime}') >= 0 || 
						imageCaptionTemplate.indexOf('${originalTime}') >= 0;
	
	// Javascript variables compiled upfront
	jsGlobalVars = null;
	jsLightboxVars = null;
	jsMapVars = null;
	jsCookiePolicyVars = null;

	// Background audio array
	backgroundMusicFolder = 'res';
	
	relPath = '';
	relPathEncoded = '';
	
	folderThumbDims = (typeof folderThumbSize !== UNDEF)? folderThumbSize : '1024x768';
	folderImageDims = folderImageSize;
	folderImgDims = '800x' + folderImageSize.split('x')[1];
	
	// Generating slide pages for Facebook shares
	engine.setSlides(_useFacebook);
	
	extraMeta = {};
		
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
					dateRange,
					filters = getTableData(filterData),
					sort = getTableData(sortData),
					storeAdded = _storeAddedDate,
					storeModified = _storeModifiedDate,
					storeTaken = _storeTakenDate;
					
				relPath = getRelPath(folder);
				relPathEncoded = encodeAsJava(relPath);
				
				//logger(Level.FINE, 'Processing folder "{0}"', relPath);
				updateStatus(getTextTemplate("preprocessingFolder", level? relPath : folder.getName()));
				
				if (filters) {
					if (filters.hasOwnProperty('addedDate')) {
						storeAdded = true;
					}
					if (filters.hasOwnProperty('fileDate')) {
						storeModified = true;
					}
					if (filters.hasOwnProperty('originalDate')) {
						storeTaken = true;
					}
				}
				
				if (sort) {
					if (sort.hasOwnProperty('addedDate')) {
						storeAdded = true;
					}
					if (sort.hasOwnProperty('fileDate')) {
						storeModified = true;
					}
					if (sort.hasOwnProperty('originalDate')) {
						storeTaken = true;
					}
				}
					
				// creating extra variables --> data1.json
				folder.getChildren().forEach(function(ao) { 
					// parallelStream() fails !!!
						
					var vars,
						meta,
						cat = ao.getCategory(),
						price,
						v,
						s,
						t,
						dates;
						
					if (ao.isIncluded() && 
						!(cat === Category.folder && ao.isHidden()) && 
						(vars = ao.getVars())) {
						
						// Extra fileLabel variable
						vars.put('fileLabel', vars.get('fileTitle') || vars.get('label').replace(/_/g, ' '));
						
						dates = {};
						
						// Shop
						if (_useShop && cat !== Category.webPage && cat !== Category.webLocation) {
									
							if (cat !== Category.folder) {
								shopCount.getAndIncrement();
							}
							
							price = (usePriceAsSingleOption && vars.containsKey('price'))? vars.get('price') : null;
							
							if (vars.containsKey('shopOptionsLocal') || 
								vars.containsKey('shopDiscountRateLocal') ||
								vars.containsKey('shopQuantityCapLocal') ||
								price
								) {
						
								var shop = new MyJSONObject();
								if (price) {
									shop.put('options', getText('price') + '=' + price);
								} else if (s = vars.get('shopOptionsLocal')) {
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
							
							// Comment short
							vars.put('commentShort', shorten(stripHTML(s)));
							
							// Iconpath => SVG, folder thumb path
							if (s = vars.get('iconPath')) {
								s = s.replace('folder.png', defaultFolderIconName);
								vars.put('iconpath', s);
								vars.put('folderThumbPath', s.replace(/^\.\.\//, ''));
							} else {
								vars.put('folderThumbPath', createFolderThumb(ao, folderThumbDims, fixedShapeFolderThumbs));
								if (!fixedShapeFolderThumbs) {
									var d = getFittedDimensions(folderThumbDims, [ vars.get('originalWidth'), vars.get('originalHeight') ]);
									vars.put('folderThumbWidth', Math.round(d[0]));
									vars.put('folderThumbHeight', Math.round(d[1]));
								}
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
											vars.put('folderModDate', getFormattedDateRange(dateRange.first + 0, dateRange.last + 0));
											break;
										}							
										
									default:
										vars.put('folderModDate', '');
								}
								
								// Added date
								if (storeAdded && (s = JAlbumUtilities.getDeepLastAdded(ao))) {
									dates.added = Long.valueOf(Math.floor(s / 1000));
								}
								
								// Taken date range
								if (storeTaken && dateRange.first && dateRange.last) {
									dates.dateRange = [ Long.valueOf(Math.floor(dateRange.first / 1000)), 
														Long.valueOf(Math.floor(dateRange.last / 1000)) ];
								}
								
								// Modified date
								if (storeModified && (s = JAlbumUtilities.deepLastModified(ao))) {
									dates.fileModified = Long.valueOf(Math.floor(s / 1000));
								}
							}
							
							// Folder caption
							if (_folderCaptionTemplate && (s = processTemplate(ao, _folderCaptionTemplate))) {
								vars.put('thumbCaption', s);
							} else {
								vars.put('thumbCaption', '');
							}

						} else {
							
							// Pages and normal items
							
							// Comment
							s = vars.get('comment');
							
							// Short comment
							vars.put('commentShort', shorten(stripHTML(s)));
														
							if (cat === Category.webPage) {
								
								// Web page
								vars.put('pageTitle', '<h1>' + vars.get('title') + '</h1>');
								
								// Top navigation
								vars.put('topNavigation', _useTopNavigation? getDropdownMenu(rootFolder, ao, topNavigationIncludeFolders, topNavigationIncludePages, topNavigationIncludeWebLocations, topNavigationDepth - 1, !logoName) : '');
								
								// Bottom navigation
								vars.put('bottomNavigation', _useBottomNavigation? getRootNavigation(folder, '', '', bottomNavigationIncludeFolders, bottomNavigationIncludePages, bottomNavigationIncludeWebLocations) : '');
								//print('bottomNavigation = ' + folder.getVars().get('bottomNavigation'));
								
								// Page URL
								if (basePath) {
									vars.put('pageUrl', basePath + relPathEncoded + ao.getWebName());
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
								
								// Page hook for CSS
								vars.put('pageHook', getOriginalPageName(ao, 'user') + '-page');
						
							} else {
								
								// Normal items
								
								// Image number
								vars.put('imageNum', imageNum.getAndIncrement() + 1);
								
								// Formatted file size
								vars.put('fileSizeFormatted', getSizeAsString(vars.get('fileSize')));
								
						
								// Added date
								if (storeAdded && (s = ao.getWhenAdded())) {
									dates.added = Long.valueOf(Math.floor(s / 1000));
								}
								
								// Taken date
								if (storeTaken && (s = getEpochDate(ao, false))) {
									dates.dateTaken = Long.valueOf(Math.floor(s / 1000));
								}
								
								// Modified date
								if (storeModified && (s = ao.getLastModified())) {
									dates.fileModified = Long.valueOf(Math.floor(s / 1000));
								}
								
								// Time of day
								if (_useOriginalTime && (v = getOriginalTime(ao))) {
									vars.put('originalTime', v);
								}
								
								// Thumbnail caption
								if (thumbCaptionTemplate && (s = processTemplate(ao, thumbCaptionTemplate))) {
									vars.put('thumbCaption', s);
								} else {
									vars.put('thumbCaption', '');
								}
								
								// Photo data
								if (_usePhotodata && (s = getPhotodata(ao, photoDataTemplate, 'p', showPhotoDataLabel))) {
									vars.put('photodata', s);
								}
								
								// Image caption
								if (imageCaptionTemplate && (s = processTemplate(ao, imageCaptionTemplate))) {
									vars.put('imageCaption', s);
								} else {
									vars.put('imageCaption', '');
								}
								
								if (cat === Category.image) {
									
									// Regions / faces
									if (_useRegions && (s = getRegions(ao, regionsSkipEmpty)) !== null) {
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
									
									// User designated panorama
									if (typeof panorama !== UNDEF && panorama) {
										vars.put('panorama', true);
									}
									
								}
									
								if (cat !== Category.audio) {
									// Sound clip
									if (useSoundClips && (s = checkSoundClip(ao))) {
										vars.put('soundClip', s);
									}
								}
									
								// Copying GIF / SVG files with whatever settings
								s = getExt(ao.getName()).toLowerCase();
								if ((s === 'gif' || s === 'svg') && 
									!linkOriginals && !ao.isIncludeOriginal() &&
									(s = copyOriginal(ao))) {
									vars.put('originalFile', s);
								}
								
								// Map
								if (_useMap) {
									s = getLocation(ao);
									vars.put('location', s);
									//logger(Level.FINE, 'Location for "{0}": "{1}"', [ ao.getName(), s ]);
									if (s) {
										locationCount.getAndIncrement();
									}
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
								if (_useZip) {
									if (zipImages === 'slides' || zipImages === 'originals') {
										zipCount.getAndIncrement();
									} else if (zipImages === 'included' && vars.get('originalPath')) {
										zipCount.getAndIncrement();
									}
								}
								
								// Extra meta
								if (!isEmpty(extraMeta) && ((meta = vars.get('meta')) != null)) {
									for (v in extraMeta) {
										if ((s = meta.get(extraMeta[v]['meta'])) != null) {
											vars.put(v, s);
										}
									}
								}
							}
						}
						
						if (!isEmpty(dates)) {
							vars.put('dates', dates);
						}
					}
				});
				
				// Current folder variables --> tree.json
				
				/*************************************************
				 *
				 *	Processing the current folder for tree.json
				 *
				 *************************************************/
				
				var	vars = folder.getVars();
				
				if (vars) {
					
					var c = vars.get('description'),
						t = vars.get('title'),
						modDate,
						topNav,
						top = (folder === rootFolder),
						count = getCountObj(folder);
						
					// Counters
					vars.put('shopCount', shopCount.get());
					vars.put('locationCount', locationCount.get());
					vars.put('regionCount', regionCount.get());
					vars.put('vrCount', vrCount.get());
					vars.put('folderCount', count.folder);
					vars.put('pageCount', count.webPage);
					vars.put('webLocationCount', count.webLocation);
					vars.put('imageCount', count.image);
					vars.put('audioCount', count.audio);
					vars.put('videoCount', count.video);
					vars.put('otherCount', count.other);
					vars.put('lightboxableCount', count.image + count.audio + count.video + count.other);
					vars.put('nonLightboxableCount', count.folder + count.webPage + count.webLocation);
					
					_anyVr = vrCount.get() > 0;

					// Processing folder image and thumbnail
					vars.put('hasFolderImage', createFolderImage(folder, folderImageDims, folderThumbDims, folderImgDims));
					
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
						if (storeAdded && (s = JAlbumUtilities.getDeepLastAdded(folder))) {
							dates.added = Long.valueOf(Math.floor(s / 1000));
						}

						// Taken Date
						if (storeTaken && dateRange.first && dateRange.last) {
							dates.dateRange = [ Long.valueOf(Math.floor(dateRange.first / 1000)), 
												Long.valueOf(Math.floor(dateRange.last / 1000)) ];
						}
						
						// Modified date
						if (storeModified && (s = JAlbumUtilities.deepLastModified(folder))) {
							dates.fileModified = Long.valueOf(Math.floor(s / 1000));
						}
						
						// Dates object
						if (!isEmpty(dates)) {
							vars.put('dates', dates);
						}
						
						// Filters
						if (_useFilters && filters) {
							vars.put('filters', filters);
						}
						
						// Sort
						if (_useSort && sort) {
							vars.put('sort', sort);
						}
					}
					
					// Neighboring folders
					if (!top && (linkNeighboringFolders || afterLast === 'ask' || afterLast === 'nextfolder' || afterLast === 'nextindex')) {
						
						var rp;
						
						ao = neighboringFolderSkipLevels? 
								getPreviousFolder(folder, 4, true) 
								: 
								getPreviousFolder(folder, 0, false);
						
						if (ao != null) {
							v = ao.getVars();
							rp = urlEncode(getRelativePath(folder, ao));
							vars.put('previousFolderPath', rp);									//  + v.get('closeupPath')
							vars.put('previousFolderTitle', ao.getTitle() || ao.getName());
							vars.put('previousFolderThumbPath', v.get('iconPath')? '' : getThumbPath(ao));
							s = v.get('askPermission');
							if (s !== null) {
								vars.put('previousFolderAsk', s);
							}
							
							if ((ao = getLastImage(ao)) != null) {
								vars.put('previousFoldersLast', rp + indexName + '#img=' + getFinalName(ao));
							} else {
								vars.put('previousFoldersLast', '');
							}
						} else {
							vars.put('previousFolderPath', '');
							vars.put('previousFolderTitle', '');
							vars.put('previousFolderThumbPath', '');
							vars.put('previousFoldersLast', '');
						}
						
						ao = neighboringFolderSkipLevels? 
								getNextFolder(folder, 4, true, neighboringFolderLoop) 
								: 
								getNextFolder(folder, 0, false, neighboringFolderLoop);
								
						if (ao != null) {
							v = ao.getVars();
							rp = urlEncode(getRelativePath(folder, ao));
							vars.put('nextFolderPath', rp);
							vars.put('nextFolderTitle', ao.getTitle() || ao.getName());
							vars.put('nextFolderThumbPath', v.get('iconPath')? '' : getThumbPath(ao));
							s = v.get('askPermission');
							if (s !== null) {
								vars.put('nextFolderAsk', s);
							}
							
							if ((ao = getFirstImage(ao)) != null) {
								vars.put('nextFoldersFirst', rp + indexName + '#img=' + getFinalName(ao));
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
						vars.put('pageUrl', basePath + relPathEncoded + indexName);
						vars.put('pageThumbPath', basePath + relPathEncoded + folderThumbFileName);
					} else {
						vars.put('pageUrl', '');
						vars.put('pageThumbPath', folderThumbFileName);
					}
					
					// Page title, HTML tags removed
					vars.put('pageTitle', cleanup(stripHTML(t)));
					
					// Top navigation
					vars.put('topNavigation', _useTopNavigation? getDropdownMenu(rootFolder, folder, topNavigationIncludeFolders, topNavigationIncludePages, topNavigationIncludeWebLocations, topNavigationDepth - 1, !top && !logoName) : '');
					
					// Bottom navigation
					vars.put('bottomNavigation', _useBottomNavigation? getRootNavigation(folder, '', '', bottomNavigationIncludeFolders, bottomNavigationIncludePages, bottomNavigationIncludeWebLocations) : '');
						
					// Breadcrumb path
					if (showBreadcrumbPath !== 'none' && level > 1) {
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
						vars.put('folderCaption', s);
					} else {
						vars.put('folderCaption', '');
					}
					
				}
				
				revertStatus();
			},
			
		/*
		 *	Initializing Javascript variables
		 */
		 
		getGlobalVars = function() {
				var o = {
							albumName:		stripQuot(albumTitle),
							makeDate:		Long.valueOf(Math.floor((new Date()).getTime() / 1000)),
							licensee:		license,
							thumbDims:		maxThumbWidth + 'x' + maxThumbHeight
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
				
				if (!scrollToTopButton) {
					o['scrollToTopButton'] = false;
				}
				
				if (_useRating) {
					o['useRating'] = true;
					if (visitorRating) {
						o['visitorRating'] = true;
					}
					if (useJalbumRating) {
						o['jalbumRating'] = true;
					}
				}
				
				if (lightboxFullscreen) {
					o['lightboxFullscreen'] = true;
				}
				
				if (slideshowFullscreen) {
					o['slideshowFullscreen'] = true;
				}
				
				if (alwaysRestartSlideshow) {
					o['restartSlideshow'] = true;
				}
				
				if (_anyShares) {
					
					var s = new Array();
					
					if (shareFacebook) s.push('facebook');
					if (shareTwitter) s.push('twitter');
					if (shareTumblr) s.push('tumblr');
					if (sharePinterest) s.push('pinterest');
					if (shareLinkedin) s.push('linkedin');
					if (shareDigg) s.push('digg');
					if (shareReddit) s.push('reddit');
					if (shareEmail) s.push('email');
					if (shareLink) s.push('link');
					o['share'] = { 
						sites:			s.join(','),
						hook:			'.social'
					}
					if (emailSubject) {
						o['share']['callAction'] = emailSubject;
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
							floatBtnLabel:	feedbackFloatButtonLabel || getText('viewFeedbackCart'),
							copyBtnLabel:	feedbackCopyButtonLabel || getText('copyFeedback'),
							sendBtnLabel:	feedbackSendButtonLabel || getText('sendFeedback'),
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
				
				if (_useExtraSizes) {
					o['extraSizes'] = extraSizes;
				}
				
				if (markFilesNew && newDaysCount) {
					o['markNew'] = {
						days:		newDaysCount,
						reference:	newDaysRef
					}
					
					if (newDaysMark === 'text' && newDaysText) {
						o.markNew['text'] = newDaysText;
					}
				}
				
				if (captionPlacement !== 'below') {
					o['captionPlacement'] = captionPlacement;
				}
				
				if (thumbLayout !== 'fixgrid') {
					o['thumbLayout'] = thumbLayout;
				}
				
				if (maxThumbWidth !== 212) {
					o['maxThumbWidth'] = maxThumbWidth;
				}
				
				if (maxThumbHeight !== 170) {
					o['maxThumbHeight'] = maxThumbHeight;
				}
				
				if (!hoverEffectThumbs) {
					o['hoverEffectThumbs'] = false;
				}
				
				if (folderCaptionPlacement !== 'below') {
					o['folderCaptionPlacement'] = folderCaptionPlacement;
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
				if (showPhotoData) {
					if (showPhotoDataInTheCaption) {
						o['metaAsPopup'] = false;
					}
				}
				if (!showFitToggle) {
					o['useZoom'] = false;
				} else if (zoomSlider) {
					o['zoomSlider'] = true;
				}
				if (!fitImage) {
					o['fitImages'] = false;
				}
				if (maxZoom !== 1.4) {
					o['maxZoom'] = maxZoom;
				}
				if (dontStretchBehind) {
					o['fitBetween'] = true;
				}
				o['fitPadding'] = fitPadding;
				/*
				if (!neverScaleUp) {
					o['scaleUp'] = true;
				}
				*/
				if (!showStartStop) {
					o['useSlideshow'] = false;
				}
				if (linkOriginals) {
					o['linkOriginals'] = true;
				}
				if (hiDPIImages) {
					o['hiDpi'] = true;
				}
				if (videoAutoPlay) {
					o['videoAuto'] = true;
				}
				if (videoLoop) {
					o['videoLoop'] = true;
				}
				if (downloadBtn) {
					o['showDownload'] = true;
					if (downloadNonImages) {
						o['allowDownloadOthers'] = true;
					}
					if (downloadScaled) {
						o['allowDownloadScaled'] = true;
					}
				}
				if (printImageButton) {
					o['printImage'] = true;
				}
				if (_anyShares && showShare) {
					o['showShare'] = true;
				}
				if (showShopBtn) {
					o['showShop'] = true;
				}
				if (showFeedbackBtn) {
					o['showFeedback'] = true;
				}
				if (showMap) {
					o['showMap'] = true;
				}
				if (showRegions) {
					o['showRegions'] = true;
					if (regionsBtnText && regionsBtnText !== getText('regionsBtn')) {
						o['regionsBtn'] = regionsBtnText || getText('faces');
					}
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
				if (autohideControls) {
					o['autohideControls'] = true;
				}
				if (slideshowAuto) {
					o['autoStart'] = true;
				}
				if (useAutoPano) {
					o['autoPano'] = true;
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
				if (!clickBesideForIndex) {
					o['quitOnDocClick'] = false;
				}
				if (!clickForNext) {
					o['clickForNext'] = false;
				}
				if (showFullscreen) {
					o['showFullscreen'] = true;
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
							rootPath:	getParentFolderLink(level),
							resPath:	resPath,
							relPath:	encodeAsJava(relPath.replace(/\/$/, ''))
						};
				
				if (_useTagCloud) {
					o['tagCloud'] = {
							fields:		tagCloudFields.replace(/,\s+/g, ','),
							depth:		tagCloudSource,
							hook:		'.tag-cloud-cont'
						};
						
					if (tagCloudSort !== 'none') {
						o['tagCloud']['sort'] = tagCloudSort;
					}
					
					if (tagCloudFontVaries) {
						o['tagCloud']['fontVaries'] = true;
					}
					
					if (tagCloudSearch) {
						o['tagCloud']['useSearch'] = tagCloudSearch;
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
					
					if (typeof previousFolderPath !== UNDEF) {
						o['previousFolderPath'] = previousFolderPath;
					}
					
					if (typeof previousFoldersLast !== UNDEF) {
						o['previousFoldersLast'] = previousFoldersLast;
					}
					
					if (typeof nextFolderPath !== UNDEF) {
						o['nextFolderPath'] = nextFolderPath;
					}
					
					if (typeof nextFoldersFirst !== UNDEF) {
						o['nextFoldersFirst'] = nextFoldersFirst;
					}
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
				
				return JSON.stringify(a).replace(/\:true/g, ':!0').replace(/\:false/g, ':!1').replace(/^\{\}$/, '');
			},
			
		// Get Cookie Policy variables
			
		getCookiePolicyVars = function() {
			
				var v = {};
				
				v['cookiePolicy'] = showCookiePolicy;
				
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
			
				if (thumbLayout === 'fixgrid') {
					// Fixed shape
					engine.addFilter(new FixedShapeFilter(), JAFilter.THUMBNAILS_PRESCALE_STAGE);
				} else {
					// Arbitrary AR
					engine.addFilter(new ConstrainRatioFilter(minVerticalAR, maxHorizontalAR), JAFilter.THUMBNAILS_PRESCALE_STAGE);
				}
			
				if (folderDateSource === 'none') {
					_folderCaptionTemplate = folderCaptionTemplate.replace(/\s*(<span class="date">)?\$\{folderModDate\}<\/span>/g, '');
					_titleCaptionTemplate = titleCaptionTemplate.replace(/\s*(<span class="date">)?\$\{folderModDate\}<\/span>/g, '');
				}
				
				// Custom link
				if (typeof customLink !== UNDEF && customLink) {
					credits = '<a href="' + customLink + '" target="_blank">' + 
						((customLinkText)? customLinkText : customLink) +
						'</a>' +
						(credits? (' &middot; ' + credits) : '');
				}
				
				if (heroPattern) {
					copyResource('patterns/' + (isLightColor(backgroundColor, heroColor)? 'light' : 'dark'), heroPattern);
				}
				
				// MS server configuration
				if (useMsServer) {
					copySkinFile('includes', 'web.config');
				} else {
					removeOutputFile('web.config');
				}
		
				// Expiry headers
				if (useExpiry) {
					copySkinFile('includes', '.htaccess');
				} else {
					removeOutputFile('.htaccess');
				}
				
				if (useRobotsTxt) {
					copySkinFile('includes', 'robots.txt');
					copySkinFile('includes', 'humans.txt');
				} else {
					removeOutputFile('robots.txt');
					removeOutputFile('humans.txt');
				}
				
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
					// Modernizr
					'modernizr,' +
					// Detects input method
					'what-input,' +
					// Utilities
					'laza.util,' +
					// Album model
					'jalbum.album,' +
					// laza libraries
					'laza.cookie,laza.scrolltop,laza.sticky,laza.transform,laza.swipe,' +
					// Auto pano player
					'laza.autopano,' +
					// Filter-related plugins
					(_useFilters? 'laza.rangeSlider,' : '') +
					// Audio player
					(backgroundMusic? 'laza.audioPlayer,' : '') +
					// Map
					(_useMap? 'laza.addmap,' : '') +
					// and misc utilities
					'laza.alignto,laza.tooltip,laza.modal,laza.sharebuttons,' +
					// Lightbox 
					'laza.lightbox,' +
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
						// jalbum.album
						'and',
						'from',
						'databaseMissingOrBroken',
						'checkProcessSubdirectories',
						'uploadAlbumAgain',
						'localAccessBlocked',
						// modal
						'closeWindow',
						'okButton',
						'warning',
						'error',
						// ask permission
						'restrictedLinkTitle',
						'restrictedLinkQuestion',
						'restrictedLinkYes',
						'restrictedLinkNo',
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
						'view',
						'selectItems',
						'addSelectedItems',
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
						'writeFeedback',
						'addFeedback',
						'addFeedbackCart',
						'view',
						'feedbackOnAlbum',
						'removeAll',
						'removeAllItems',
						'to',
						'subject',
						'warning',
						'copiedToClipboard',
						'errorSending',
						'emailMissing',
						'tooLong',
						'copyInstructions',
						'feedbackButtonExplanation',
						'message',
						// share buttons
						'share',
						'shareOn',
						'checkThisOut',
						'email',
						'copy',
						'copied',
						'slideshow',
						'localWarning',
						// search, filters, sort
						'foundNTimes',
						'notFound',
						'search',
						'searchBoxTip',
						'newImages',
						'results',
						'reset',
						'label',
						'return',
						'select',
						'sortBy',
						'sortedBy',
						'ascending',
						'descending',
						'multipleSelectHint',
						'noRating',
						// search by date
						'newItem',
						'today',
						'inThePast24Hours',
						'inThePast48Hours',
						'inTheLastDay',
						'inThePastNDays',
						'inThePastNMonths',
						'inThePastNYears',
						'sinceMyLastVisit',
						'betweenDays',
						'onDay',
						'beforeDay',
						'afterDay',
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
						'nextIndex',
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
						'zoom',
						'oneToOneSize',
						'oneToOneSizeShort',
						'fullscreen',
						'exitFullscreen',
						'fullscreenShort',
						'exitFullscreenShort',
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
						'rating',
						'metaBtn', 
						'metaLabel',
						'mapBtn',
						'mapLabel',
						'shopBtn',
						'shopLabel',
						'viewCart',
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
						// scroll to top
						'scrollTopTooltip',
						// etc
						'new',
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
					if (shopOptionSelectMethod === 'radio') {
						shop.put('selectMethod', shopOptionSelectMethod);
					}
					if (showPriceRange) {
						shop.put('showPriceRange', showPriceRange);
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
					if (shopSendAlbumName) {
						shop.put('sendAlbumName', shopSendAlbumName);
					}
					if (shopAskPermissionToEmpty) {
						shop.put('shopAskPermissionToEmpty', shopAskPermissionToEmpty);
					}
					if (shopInstructions) {
						shop.put('instructions', shopInstructions);
					}
					if (usePriceAsSingleOption) {
						shop.put('usePrice', true);
					}
						
					vars.put('shop', shop);
				}
							
			},
		
		// Reading table data into Object
		
		getTableData = function(d) {
				if (typeof d === 'undefined') {
					return null;
				}
				
				var data = {};
					
				d = d.split('\n');
				
				for (var i = 0, s; i < d.length; i++) {
					if ((s = d[i]).length) {
						s = s.split('\t');
						if (s.length > 1 && s[1].length) {
							if (s[1].startsWith('meta.')) {
								data['meta_' + toCamelCase(s[1].substring(5))] = {
									label:		s[0],
									type:		(s[2] || 'numeric').toLowerCase(),
									meta:		s[1].substring(5)
								};
							} else {
								data[s[1]] = {
									label:		s[0],
									type:		(s[2] || 'numeric').toLowerCase()
								};
							}
						}
					}
				}
				
				//print(JSON.stringify(data));
				
				return (Object.getOwnPropertyNames(data)).length? data : null;
			},
					
		// Returns variable names read from a Filters or Sort table 
		
		getObjectProperties = function(o) {
				var vars = [];
				
				for (var v in o) {
					vars.push(v);
				}
				
				return vars;
			},
			
		// Returns only meta variables
		
		getExtraMeta = function(o) {
			
				for (var v in o) {
					if (o[v]['meta']) {
						extraMeta[v] = o[v];
					}
				}
				//print('Extra meta: ' + extraMeta.join(','));
			},
			
		// Removing native jAlbum variables
		
		removeJalbumVars = function(a, ext) {
				var remove = jsonFields.concat(jsonCameraFields),
					r = [];
				
				if (typeof ext !== UNDEF) {
					remove = remove.concat(ext);
				}
					
				for (var i = 0; i < a.length; i++) {
					if (remove.indexOf(a[i]) === -1) {
						r.push(a[i]);
					}
				}
				
				return r;
			},
			
		// Adding new variables to JSON processor
		
		initJSON = function() {
			
			// Adding custom variables 
			if (_useFilters || _useSort || _useTagCloud || _useSearch) {
				
				var jm = null,
					v = [],
					d;
				
				try {
					
					jm = engine.getJSONMaker();
					
					if (jm) {
						
						if (_useFilters) {
							d = getTableData(filterData);
							if (d) {
								v = getObjectProperties(d);
								v.push('filters');
								getExtraMeta(d);
							}
						}
						
						if (_useSort) {
							d = getTableData(sortData);
							if (d) {
								v = v.concat(getObjectProperties(d));
								v.push('sort');
								getExtraMeta(d);
							}
						}
						
						if (_useTagCloud) {
							v = v.concat(tagCloudFields.split(/,\s*/));
						}
						
						if (_useSearch) {
							v = v.concat(searchFields.split(/,\s*/));
						}
						
						var inc = jm.getIncludes();
						
						if (inc === null || inc.length === 0) {
							inc =	[
										"imageCaption",
										"thumbCaption",
										"photodata",
										"regions",
										"mostphotos",
										"fotomotoCollection",
										"location",
										"shop",
										"dates",
										"epochDate",
										"epochDateRange",
										"external",
										"projectionType",
										"soundClip",
										"panorama",
										"originalFile"
									];
						} else if (typeof inc === 'object') {
							
							for (var i = 0, tmp = []; i < inc.length; i++) {
								if (jsonCameraFields.indexOf(inc[i]) === -1) {
									tmp.push(inc[i]);
								}
							}
							
							inc = tmp;
						}
						
						v = removeJalbumVars(v, inc);
						//print('Include extra variables: ' + removeDuplicates(inc.concat(v)).join(' | '));
						//print('var inc = jm.getIncludes();\ninc[0] = ' + inc[0] + '\ninc.length = ' + inc.length + /*'\ninc.getClass().toString() = ' + inc.getClass().toString() + */ '\ntypeof inc = "' + (typeof inc) + '"\n(inc == null)? ' + (inc === null) + '\nArray.isArray(inc)? ' + Array.isArray(inc) + '\nJSON.stringify(inc) = ' + JSON.stringify(inc));
						jm.setIncludes(removeDuplicates(inc.concat(v)));
					}
					
				} catch(e) {
					print('engine.getJSONMaker() returned error: ', e);
				}
				
			}
		};
	
	
	initJSON();
	
	initAlbum();
	
	if (typeof writeSitemapXml !== 'undefined' && writeSitemapXml) {
		//System.out.println('writeSitemap = ' + writeSitemapXml);
		createSitemap();
	}