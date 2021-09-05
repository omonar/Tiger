/*
	util.js - utility library
	Author: Laza
*/

// Global variables

	var // Importing Java Classes
		File = Java.type("java.io.File"),
		Files = Java.type("java.nio.file.Files"),
		FileFilters = Java.type("se.datadosen.util.FileFilters"),
		BufferedWriter = Java.type("java.io.BufferedWriter"),
		OutputStreamWriter = Java.type("java.io.OutputStreamWriter"),
		FileOutputStream = Java.type("java.io.FileOutputStream"),
		FileInputStream = Java.type("java.io.FileInputStream"),
		InputStreamReader = Java.type("java.io.InputStreamReader"),
		BufferedReader = Java.type("java.io.BufferedReader"),
		ZipOutputStream = Java.type("java.util.zip.ZipOutputStream"),
		ZipEntry = Java.type("java.util.zip.ZipEntry"),
		Dimension = Java.type("java.awt.Dimension"),
		Dates = Java.type("se.datadosen.util.Dates"),
		DateRange = Java.type("se.datadosen.jalbum.DateRange"),
		JDate = Java.type("java.util.Date"),
		LocalDate = Java.type("java.time.LocalDate"),
		DateFormat = Java.type("java.text.DateFormat"),
		DateFormatSymbols = Java.type("java.text.DateFormatSymbols"),
		StringWriter = Java.type("java.io.StringWriter"),
		// Datadosen
		AlbumImage = Java.type("se.datadosen.jalbum.AlbumImage"),
		Category = Java.type("se.datadosen.jalbum.Category"),
		Config = Java.type("se.datadosen.jalbum.Config"),
		Widgets = Java.type("se.datadosen.jalbum.Widgets"),
		IO = Java.type("se.datadosen.util.IO"),
		LinkFile = Java.type("se.datadosen.io.LinkFile"),
		SkinProperties = Java.type("se.datadosen.jalbum.SkinProperties"),
		AlbumObjectProperties = Java.type("se.datadosen.jalbum.AlbumObjectProperties"),
		JAlbumUtilities = Java.type("se.datadosen.jalbum.JAlbumUtilities"),
		CropFilter = Java.type("CropFilter"),
		Section = Java.type("se.datadosen.tags.Section"),
		XmpManager = Java.type("se.datadosen.jalbum.XmpManager"),
		Scope = Java.type("se.datadosen.util.Scope"),
		JAlbum = Java.type('se.datadosen.jalbum.JAlbum');		
		
		
		// Skin Variables
		skinVars = engine.getSkinVariables(),
		
		// Skin properties
		skinProperties = engine.getSkinProperties(),
		
		// 'undefined'
		UNDEF 		= 'undefined',
		NUMBER 		= 'number',
		STRING 		= 'string',
		FUNCTION 	= 'function',
		
		isEmpty = function(o) {
		
				if (o == null) {
					return true;
				};
				return (Object.getOwnPropertyNames(o)).length === 0;
			},

		ONEDAY_S	= 60 * 60 * 24,
		ONEDAY_MS	= 60 * 60 * 24 * 1000,
		
		// Logging level
		Level = {
				'OFF':		0,
				'SEVERE':	1,
				'WARNING':	2,
				'INFO':		3,
				'CONFIG':	4,
				'FINE':		5,
				'FINER':	6,
				'FINEST':	7,
				'ALL':		8
			},
			
		loggingLevel = (function() {
				var config = Config.getConfig();
				
				if (config) {
					return Level[config.getLoggingLevel()];
				}
				
				return 2;
			} ()),
		
		logger = function(level, log, s) {
				if (level <= loggingLevel) {
					if (s) {
						if (typeof s === 'object' && s.length) {
							log = log.replace(/\{\d\}/g, function(i) {
								return s[parseInt(i.substring(1))];
							});
						} else {
							log = log.replace(/\{0\}/g, s + '');
						}
					}
					
					print(['OFF','SEVERE','WARNING','INFO','CONFIG','FINE','FINER','FINEST','ALL'][level] + ': ' + log);
				}
			},
			
		isWriteXmp = (function() {
				var config = Config.getConfig();
				
				if (config) {
					return config.isWriteXmp();
				}
				
				return false;
			} ()),
			
		exists = function(f) {
				try {
					var p = f.toPath();
					return !Files.notExists(p);
				} catch (e) {
					return f.exists();
				}
			};
	
	// URL encoding is madatory because the JSON database is always URL-encoded
	//engine.urlEncode(true);
	
	// URL encode?
	isUrlEncode = true; 	//engine.isUrlEncode();
	
	// Is fixed shape filter on?
	isFixedShapeThumbs = !!skinVars.get("fixedShapeThumbs");

	// Names
	pageExt = engine.getPageExtension();
	indexPageName = engine.getIndexPageName();
	indexName = indexPageName + pageExt;
	defaultFolderIconName = 'folder' + ((typeof defaultFolderIcon !== UNDEF)? ('-' + defaultFolderIcon) : '') + '.svg';
	
	// Directories
	thumbsDir = engine.getThumbnailDirectory();
	slidesDir = engine.getSlideDirectory();
	folderThumbsDir = thumbsDir + '/' + 'folder';
	downloadDir = 'dl';
	resDir = 'res';
	
	// Default folder image/thumb filename
	folderImageFileName = 'folderimage.jpg';
	folderThumbFileName = 'folderthumb.jpg';
	folderImageSmallFileName = 'folderimg.jpg';
	
	folderImageSize = '1600x1200';
	folderThumbSize = '1024x768';
	folderImageSmallSize = '800x800';
	
	// Date format
	dateFormat = engine.getDateFormat() || (engine.getDateFormatAsObject()).toPattern() || 'dd/MM/yyyy';
	dateOnlyFormat = dateFormat.replace(/,?\s*[Hh]+[:\.]m+([:\.]s+)?\s*[Aa]?[Zz]?,?\s?/, '');
	
	// Image linking model
	linkOriginals = engine.getImageLinking() === 'LinkOriginals';
	copyOriginals = engine.isCopyOriginals();
	hiDPIImages = engine.isHiDPIImages();
	hiDPIThumbs = engine.isHiDPIThumbs();
	makeSlides = engine.isSlides();
	
	// Skin name, version and Url, Style name
	skinVersion = skinProperties.getProperty(SkinProperties.VERSION, "0.0");
	skinName = skinProperties.getProperty(SkinProperties.TITLE, "");
	skinLink = skinProperties.getProperty(SkinProperties.HOME_PAGE, "https://jalbum.net/skins/skin/" + skinName);
	styleName = style.substring(0, style.indexOf("."));
	
	// Unique ID = #### - unique to every album make
	uniqueID = Math.floor(Math.random() * 1000);
	
	// Fotomoto Affiliate ID
	fotomotoAid = '&aid=25b6e51331930731';
	
	// License
	license = licenseManager.getLicenseCode();
	
	// lang = the language used in Jalbum according to ISO 2-letter notation
	lang = (function() {
			var config = Config.getConfig();
			
			if (config) {
				return config.getInterpretedLanguage();
			}
			
			return 'en';
		}());
	
	// locale = the xx_XX version
	locale = (function(lang) {
			var loc = {
				// Afrikaans
				af:	'af_ZA',
				// Arabic
				ar:	'ar_AR',
				// Azerbaijani
				az:	'az_AZ',
				// Belarusian
				be:	'be_BY',
				// Bulgarian
				bg:	'bg_BG',
				// Bengali
				bn:	'bn_IN',
				// Bosnian
				bs:	'bs_BA',
				// Catalan
				ca:	'ca_ES',
				// Czech
				cs:	'cs_CZ',
				// Welsh
				cy:	'cy_GB',
				// Danish
				da:	'da_DK',
				// German
				de:	'de_DE',
				// Greek
				el:	'el_GR',
				// English (US)
				en:	'en_US',
				// Esperanto
				eo:	'eo_EO',
				// Spanish (Spain)
				es:	'es_ES',
				// Estonian
				et:	'et_EE',
				// Basque
				eu:	'eu_ES',
				// Persian
				fa:	'fa_IR',
				// Leet Speak
				fb:	'fb_LT',
				// Finnish
				fi:	'fi_FI',
				// Faroese
				fo:	'fo_FO',
				// French (France)
				fr:	'fr_FR',
				// Frisian
				fy:	'fy_NL',
				// Irish
				ga:	'ga_IE',
				// Galician
				gl:	'gl_ES',
				// Hebrew
				he:	'he_IL',
				// Hindi
				hi:	'hi_IN',
				// Croatian
				hr:	'hr_HR',
				// Hungarian
				hu:	'hu_HU',
				// Armenian
				hy:	'hy_AM',
				// Indonesian
				id:	'id_ID',
				// Icelandic
				is:	'is_IS',
				// Italian
				it:	'it_IT',
				// Japanese
				ja:	'ja_JP',
				// Georgian
				ka:	'ka_GE',
				// Khmer
				km:	'km_KH',
				// Korean
				ko:	'ko_KR',
				// Kurdish
				ku:	'ku_TR',
				// Latin
				la:	'la_VA',
				// Lithuanian
				lt:	'lt_LT',
				// Latvian
				lv:	'lv_LV',
				// Macedonian
				mk:	'mk_MK',
				// Malayalam
				ml:	'ml_IN',
				// Malay
				ms:	'ms_MY',
				// Norwegian (bokmal)
				nb:	'nb_NO',
				// Nepali
				ne:	'ne_NP',
				// Dutch
				nl:	'nl_NL',
				// Norwegian (nynorsk)
				nn:	'nn_NO',
				// Punjabi
				pa:	'pa_IN',
				// Polish
				pl:	'pl_PL',
				// Pashto
				ps:	'ps_AF',
				// Portuguese (Portugal)
				pt:	'pt_PT',
				// Portuguese (Brasilian)
				pt_BR: 'pt_BR',
				// Romanian
				ro:	'ro_RO',
				// Russian
				ru:	'ru_RU',
				// Slovak
				sk:	'sk_SK',
				// Slovenian
				sl:	'sl_SI',
				// Albanian
				sq:	'sq_AL',
				// Serbian
				sr:	'sr_RS',
				// Swedish
				sv:	'sv_SE',
				// Swedish
				se:	'sv_SE',
				// Swahili
				sw:	'sw_KE',
				// Tamil
				ta:	'ta_IN',
				// Telugu
				te:	'te_IN',
				// Thai
				th:	'th_TH',
				// Filipino
				tl:	'tl_PH',
				// Turkish
				tr:	'tr_TR',
				// Ukrainian
				uk:	'uk_UA',
				// Vietnamese
				vi:	'vi_VN',
				// Simplified Chinese (China)
				zh:	'zh_CN'
			};
			
			return loc[lang] || 'en_US';
		}(lang));
	
	//Determinig the first day of week (0 - Sunday, 1 - Monday)
	firstDayOfWeek = (function(locale) {
			return ('en_US,en_CA,en_AU,jp_JP,zh_TW,th_TH,zh_HK,he_IL,ar_EG,en_ZA,en_PH,gn_GN,pt_BR,es_AR,es_BO,es_CO,es_CR,es_DO,es_EC,es_SV,es_GT,es_HN,es_MX,es_NC,es_PA,es_PY,es_PE,es_PR,es_UY,es_VE'.indexOf(locale) >= 0)? 0 : 1;
		}(locale));
	
	// Getting localized Month names 'MMMM'
	monthNames = (function(locale) {
			var d = new JDate(),
				names = [],
				format = 'MMMM';
			
			for (var i = 0; i < 12; i++) {
				d.setMonth(i);
				names.push(Dates.format(d, format));
			}
			
			return names;
		}(locale));
	
	// Getting localized Week day names 'EEE'
	weekdayNames = (function(locale) {
			var d = new JDate(),
				names = [],
				offs,
				format = 'EEE';
			
			d.setDate(15);
			offs = 15 + firstDayOfWeek - d.getDay();
			
			for (var i = 0; i < 7; i++) {
				d.setDate(offs + i);
				names.push(Dates.format(d, format));
			}
			
			return names;
		}(locale));
	
	jsonFields = [ 
			'name', 
			'path', 
			'title', 
			'fileDate', 
			'addedDate',
			'originalDate', 
			'comment', 
			'title', 
			'counters', 
			'fileSize', 
			'category', 
			'keywords', 
			'camera' 
		];
	
	jsonCameraFields = [
			'aperture',
			'exposureTime',
			'originalDate',
			'cameraModel',
			//'location',
			'focusDistance',
			'focalLength35mm',
			'cameraMake',
			'resolution',
			'isoEquivalent',
			'flash',
			'focalLength'
		];

	//collator = getCollator(lang, locale);
	
	// > Min && < Max
	minMax = function(a, b, c) {
			b = (isNaN(b))? parseFloat(b) : b;
			return  (b < a)? a : ((b > c)? c : b); 
		};
		
	/*
	 * Collecting multiple objects into one
	 */
	 
	extend = function() {
			for (var i = 1; i < arguments.length; i++) {
				for (var key in arguments[i]) {
					if (arguments[i].hasOwnProperty(key)) {
						arguments[0][key] = arguments[i][key];
					}
				}
			}
			return arguments[0];
		};
		
	/*
	 * Adding only new elements to an Array
	 */
	 
	addNew = function(a0, a1) {
			
			if (typeof a0 === UNDEF) {
				return [];
			}
			
			if (typeof a1 === UNDEF) {
				return a0;
			}
			
			if (!Array.isArray(a0)) {
				a0 = [ a0 ];
			}
			
			if (!Array.isArray(a1)) {
				a1 = [ a1 ];
			}
			
			for (var i = 0; i < a1.length; i++) {
				if (!a0.includes(a1[i])) {
					a0.push(a1[i]);
				}
			}
			
			return a0;
		};
		
	/*
	 * Removing duplicate elements from string array
	 */
	 
	removeDuplicates = function(a) {
		
			if (!Array.isArray(a) || a.length < 2) {
				return a;
			}
			
			var r = '@@' + a[0];
			
			for (var i = 1; i < a.length; i++) {
				if (r.indexOf('@@' + a[i]) === -1) {
					r += '@@' + a[i];
				}
			}
			
			return r.split('@@');
		};
	
	/*
	 * Capitalizing a string
	 */
	 
	capitalize = function(s) {
			s = s + '';
			return s.charAt(0).toUpperCase() + s.slice(1);
		};
			
	/*
	 *	Encode the same as Java
	 */
	
	var encodeJ = [];
		encodeJ[33] 	= '%21'; 	// !
		encodeJ[35] 	= '%23';	// #
		encodeJ[36] 	= '%24';	// $
		encodeJ[38] 	= '%26';	// &
		encodeJ[39] 	= '%27';	// '
		encodeJ[40] 	= '%28';	// (
		encodeJ[41] 	= '%29';	// )
		encodeJ[43] 	= '%2B';	// +
		encodeJ[44] 	= '%2C';	// ,
		encodeJ[59] 	= '%3B';	// ;
		encodeJ[60] 	= '%3C';	// <
		encodeJ[61] 	= '%3D';	// =
		encodeJ[62] 	= '%3E';	// >
		encodeJ[63] 	= '%3F';	// ?
		encodeJ[64] 	= '%40';	// @
		encodeJ[123] 	= '%7B';	// {
		encodeJ[124]	= '%7C';	// |
		encodeJ[125]	= '%7D';	// }
	
	/*
	 * Encode URL, no matter what isUrlEncode is set
	 */
	 
	encodeAsJava = function(s) {
			var r = '',
				ap = /^(https?:|file:)?\/\//i;
			
			s = ap.test(s)? encodeURI(s) : encodeURIComponent(s).replace(/%2F/g, '/');
			for (i = 0; i < s.length; i++) {
				r += encodeJ[s.charCodeAt(i)] || s.charAt(i);
			}
			
			return r;
		};
		
	/*
	 * Jalbum's URL encoding
	 */
	 
	urlEncode = function(s) {
			return (s === null)? null : (isUrlEncode? encodeAsJava(s) : s);
		};
	
	/*
	 * Encoding string anyway :: even if jAlbum is set to not encode, avoids double encoding
	 */
	 
	urlEncodeFix = function(s) {
			return isUrlEncode? s : encodeAsJava(s);
		};
	
	/*
	 * Decoding an encoded string
	 */
	 
	urlDecode = function(s) {
		
			if (s === null || !isUrlEncode) {
				return s;
			}
			
			try {
				s = decodeURIComponent(s);
			} catch(e) {
				logger(Level.WARNING, 'Unsupported encoding exception "{0}"', s); 
			}
			
			return s;
		};
	
	/*
	 * Jalbum's URL encoding if turned on, escapes quotes if not
	 */
	 
	urlEncodeSafe = function(s) {
			return (s === null)? null : (isUrlEncode? encodeAsJava(s) : s.replace("'", "\'"));
		};
	
	/*
	 * Fixing extension for converted file types
	 */
	 
	fixExtension = function(s) {
			var ext = getExt(s);
			
			if (!ext || ext === 'png' || ext === 'jpg') {
				return s;
			}
			
			if (ext === 'gif') {
				return s.substring(0, s.length - 3) + 'png';
			}
			
			return s.substring(0, s.length - ext.length) + 'jpg';
		};
	
	/*
	 * Fixing converted movie file names
	 */
	 
	getFinalName = function(ao) {
			if (ao.getCategory() === Category.video) {
				return replaceExt(ao.getWebName(), '.mp4');
			}
			return ao.getWebName();
		};
	
	/*
	 *	Getting base path (or Upload path)
	 */
	 
	getBasePath = function() {
			var s = skinVars.get('uploadPath');
			
			if (!s || !s.length) {
				// Ask jAlbum
				var m;
				s = rootFolder.getProperties().get(AlbumObjectProperties.ALBUM_URL, '');
				if (m = s.match(/^(https?:\/\/)(\w+)(\.jalbum\.net\/.+)$/)) {
					m[2] = m[2].toLowerCase();
					s = m.slice(1).join('');
				}
				s = encodeAsJava(s);
			} else if (s.endsWith(indexName)) {
				s = s.substring(0, s.length - indexName.length);
			} else if (s.charAt(s.length - 1) !== '/') {
				 s += '/' + encodeAsJava(rootFolder.getName()) + '/';
			}
			
			return s;
		};
		
	// Base path (= absolutePath if exists or Turtle's uploadPath)
	basePath = getBasePath();
	
	// Protocol
	pageProtocol = basePath.match(/^https:/)? 'https:' : 'http:';
	
	/*
	 * Replacing extension with 'html'
	 */
	 
	replaceExt = function(s, nx) {
			var i = s.lastIndexOf('.');
			
			if (typeof nx === UNDEF) {
				nx = pageExt;
			}
			
			return (i > 0)? (s.substring(0, i) + nx) : (s + nx);
		};

	/*
	 * Getting file extension
	 */
	 
	getExt = function(s) {
			var i = s.lastIndexOf('.');
			
			return (i > 0)? s.substring(i + 1) : '';
		};
		
	/*
	 *	Simplify Url
	 */
	 
	simplifyUrl = function(root, relp) {
			var i;
			while (relp && root && 
					root.startsWith('../') &&
					((i = relp.indexOf('/')) !== -1)) {
				root = root.substring(3);
				relp = relp.substring(i + 1);
			}
			return root + relp;
		};
		
	/*
	 * Get External link (skips spaces)
	 */
	 
	getExternalLink = function(vars) {
			var l = '';
			
			if (vars) {
				l = vars.get('externalContent');
				
				if (l) {
					l = l.trim();
					if (l[0] === '<') {
						l = '';
					}
				} else {
					l = '';
				}
			}
			
			return l;
		};
	 
	/*
	 * Get (relative) link to object
	 */
	 
	getLinkTo = function(ao) {
			var vars = ao.getVars(),
				l = getExternalLink(vars);
				
			if (l) {
				return l;
			}
			
			var cat = ao.getCategory(),
				rp;
			
			if (cat === Category.webLocation) {
				return vars.get('closeupPath');
			} else if (cat === Category.webPage) {
				return getRelativePath(currentFolder, ao).replace(/\.htt\/?$/, pageExt);
			}
			
			return getRelativePath(currentFolder, ao) + (ao.isFolder()? indexName : vars.get('closeupPath'));
			
		};
	 
	/*
	 * Handling the status text in the client
	 */
	 
	var statusStack = new Array();
	
	updateStatus = function(s) {
		
			if (window != null) {
				statusStack.push(window.statusBar.getText());
				window.statusBar.setText(s);
			} else {
				logger(Level.FINER, s);
			}
		};
		
	revertStatus = function() {
		
			if (window != null) {
				if (statusStack.length) {
					window.statusBar.setText('');
				} else {
					window.statusBar.setText(statusStack.pop());
				}
			}
		};
		
	/*
	 * Fixing symbolic paths for custom pages
	 */
	 
	fixCustomPagePath = function(f) {
			
			if (typeof f !== STRING) {
				f = f.getPath();
			}
			
			return f.replace('$SKIN_TEMPLATES_DIR', skinDirectory + File.separator + 'templates');
			
		};
		
	/*
	 * Getting custom page inner content
	 */
	 
	getCustomPageContent = function(ao) {
			var templ,
				vars,
				s;
				
			try {
				
				templ = IO.readTextFile(fixCustomPagePath(ao.getFile()));
				
				if (templ) {
					vars = ao.getVars();
		
					templ = templ.replace(/<ja\:ui>[\s\S]*<\/ja\:ui>/gm, '').replace(/<ja:include page="page-(header|footer)\.inc"\s?\/>/g, '');
					s = engine.processSection(new Section(templ), vars);
					//logger(Level.WARNING, '\n--------------------- {0} (1)\n{1}', [ ao.getName(), s]);
					s = engine.processSection(new Section(s), vars);
					//logger(Level.WARNING, '\n--------------------- {0} (2)\n{1}', [ ao.getName(), s]);
				}
				
				return s;
				
			} catch(e) {
				
				//logger(Level.WARNING, 'Parsing error in file "{0}": {1}', [ao.getName(), e]);
				return null;
			}
		};
	 
	/*
	 * Include file 
	 */
	 
	getInclude = function(fn) {
			var src = new File(skinDirectory, fn),
				sw = new StringWriter(),
				s = '';
			
			if (src && src.exists()) {
				
				try {
					engine.processTemplateFile(src, sw);
					s = sw.toString();
				} catch (e) {
					var templ = IO.readTextFile(src);
					if (templ) {
						try {
							s = engine.processSection(new Section(templ), new Scope());
							logger(Level.FINE, 'getInclude({0}) ->:\n{1}', [ fn, s ]);
						} catch(e) {
							logger(Level.WARNING, 'getInclude({0}) -> Parsing error: {1}', [fn, e]);
							return '';
						}
					}
				}
			} else {
				logger(Level.FINEST, 'Include file does not exist "{0}"', fn);
			}
			
			return s;
		};
		
	/*
	 * Writing out sitemap.xml
	 */
	 
	var sitemapFileName = 'sitemap.xml',
		sitemapFile,
		sitemapStream,
		sitemapWriter;
		
	createSitemap = function() {
		
			try {
				sitemapFile = new File(rootOutputDirectory, sitemapFileName);
				sitemapStream = new FileOutputStream(sitemapFile);
				sitemapWriter = new BufferedWriter(new OutputStreamWriter(sitemapStream, 'UTF8'));
				sitemapWriter.write('<?xml version="1.0" encoding="UTF-8"?>\n');
				sitemapWriter.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n');
			} catch (e) {
				logger(Level.WARNING, 'Error creating "{0}"', sitemapFileName);
				return false;
			}
			
			return true;
		};
		
	removeSitemap = function() {
		
			try {
				sitemapFile = new File(rootOutputDirectory, sitemapFileName);
				if (sitemapFile.exists()) {
					sitemapFile.delete();
					return true;
				}
			} catch (e) {
				logger(Level.WARNING, 'Error removing "{0}" - stream is still open.', sitemapFileName);
				if (sitemapWriter) {
					sitemapWriter.flush();
					sitemapWriter.close();
					try {
						sitemapFile.delete();
						return true;
					} catch (e) {
						logger(Level.WARNING, 'Error removing "{0}" - stream is still open.', sitemapFileName);
					}
				}
			}
			
			return false;
		};
		
	closeSitemap = function() {
		
			if (sitemapWriter) {
				try {
					sitemapWriter.write('</urlset>');
					sitemapWriter.flush();
					sitemapWriter.close();
				} catch(e) {
					logger(Level.WARNING, 'Error closing "{0}"', sitemapFileName);
					return false;
				}
			}
			
			return true;
		};
		
	cleanForXML = function(s) {
			return s.replace(/\/?<[^>]*>/g, ' ')
					.replace(/\r?\n/g, ' ')
					.replace(/&[^(\w+);]/g, '&amp;')
					.replace(/"/g, '&quot;')
					.replace(/'/g, '&apos;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;');
		};
		
	addFolderToSitemap = function(folder) {
		
			if (sitemapWriter) {
				
				try {
					sitemapWriter.write('\t<url>\n' +
						'\t\t<loc>' + basePath + relPath + indexName + '</loc>\n'); 
					
					folder.getChildren().forEach(function(ao) { 
						var cat = ao.getCategory();
						
						if (ao.isIncluded() && cat === Category.image) {
							var vars = ao.getVars(),
								t = vars.get('fileTitle'),
								c = stripHTML(vars.get('comment'))
								p = vars.get('originalPath') || vars.get('imagePath');
								
							sitemapWriter.write('\t\t<image:image>\n');
							sitemapWriter.write('\t\t\t<image:loc>' + basePath + relPath + p + '</image:loc>\n');
							if (t) { 
								sitemapWriter.write('\t\t\t<image:title>' + cleanForXML(t) + '</image:title>\n');
							}
							if (c) {
								sitemapWriter.write('\t\t\t<image:caption>' + cleanForXML(c) + '</image:caption>\n');
							}
							sitemapWriter.write('\t\t</image:image>\n');
						}
					});
					
					sitemapWriter.write('\t\t<lastmod>' + (new Date(folder.getLastModified() + 0)).toISOString() + '</lastmod>\n');
					sitemapWriter.write('\t</url>\n'); 
					
				} catch(e) {
					logger(Level.WARNING, 'Error writing "{0}"', sitemapFileName);
				}
			}
		};
		
	/*
	 * Formatting file size
	 */
	 
	getSizeAsString = function(size) {
			var p;
			
			if (typeof size === UNDEF || size === null) {
				return '';
			}
			
			if (typeof size !== NUMBER) {
				size = Number(size);
			}

			if (size >= 1073741824) { 
				size /= 1073741824.0; 
				p = 'GB'; 
			} else if (size >= 1048576) { 
				size /= 1048576.0; 
				p = 'MB'; 
			} else if (size >= 1024) { 
				size /= 1024.0; 
				p = 'kB'; 
			} else { 
				p = 'B'; 
			}
			
			return size.toFixed(2) + ' ' + p;
		};
		
	/*
	 *  Timespan
	 */
	
	getTimespan = function(days) {
		
			if (!days) {
				return getText('inThePast24Hours');
			}
			
			if (days < 2) {
				return getText('inThePast48Hours');
			}
				
			var s, n;
			
			if (days >= 730) {
				s = getText('inThePastNYears');
				n = Math.round(days / 365);
			} else if (days >= 60) {
				s = getText('inThePastNMonths');
				n = Math.round(days / 30.42);
			} else {
				s = getText('inThePastNDays');
				n = days;
			}
			
			return s.replace('{0}', n);
		},
		
	/*
	 * Lorem ipsum generator for testing
	 */
	 
	lipsumGenerator = function(min, max) {
			var sentences = [
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
						'In eu mi bibendum neque egestas congue quisque egestas diam.',
						'Est sit amet facilisis magna etiam.',
						'Magna fringilla urna porttitor rhoncus dolor purus non enim praesent.',
						'Lorem mollis aliquam ut porttitor leo a diam sollicitudin tempor.',
						'Facilisis gravida neque convallis a cras semper auctor.',
						'Lobortis elementum nibh tellus molestie nunc non.',
						'Non diam phasellus vestibulum lorem.',
						'Egestas diam in arcu cursus euismod.',
						'Arcu odio ut sem nulla pharetra diam sit amet nisl.',
						'Eu augue ut lectus arcu bibendum at varius.',
						'Pellentesque elit eget gravida cum.',
						'Lacus vel facilisis volutpat est.',
						'Sit amet justo donec enim diam vulputate.',
						'Quam nulla porttitor massa id neque aliquam.',
						'Nulla aliquet enim tortor at auctor urna nunc id.',
						'Ipsum faucibus vitae aliquet nec ullamcorper sit amet.',
						'Venenatis urna cursus eget nunc.',
						'Lorem donec massa sapien faucibus et molestie ac feugiat.',
						'Donec massa sapien faucibus et molestie ac feugiat sed.',
						'Nunc scelerisque viverra mauris in aliquam sem fringilla ut.',
						'Nunc mi ipsum faucibus vitae aliquet.',
						'Mollis nunc sed id semper risus in hendrerit gravida rutrum.',
						'Nibh sit amet commodo nulla facilisi nullam vehicula.',
						'Lobortis mattis aliquam faucibus purus in massa tempor nec.',
						'Pharetra massa massa ultricies mi quis hendrerit dolor magna.',
						'Tincidunt dui ut ornare lectus sit amet est.',
						'Vitae sapien pellentesque habitant morbi tristique.',
						'Dictumst quisque sagittis purus sit amet volutpat.',
						'Et odio pellentesque diam volutpat commodo sed egestas egestas fringilla.',
						'Amet aliquam id diam maecenas ultricies mi eget mauris.',
						'Pellentesque dignissim enim sit amet.',
						'Consectetur lorem donec massa sapien faucibus et molestie ac feugiat.',
						'Ullamcorper malesuada proin libero nunc consequat interdum.',
						'Est velit egestas dui id ornare arcu odio ut sem.',
						'Mauris sit amet massa vitae tortor condimentum lacinia quis vel.',
						'Egestas purus viverra accumsan in nisl nisi scelerisque.',
						'Nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque purus.',
						'Tortor vitae purus faucibus ornare suspendisse sed.',
						'Pulvinar elementum integer enim neque volutpat ac tincidunt vitae semper.',
						'Dictum sit amet justo donec.',
						'Eleifend mi in nulla posuere sollicitudin aliquam ultrices sagittis.',
						'Enim diam vulputate ut pharetra.',
						'Augue lacus viverra vitae congue.',
						'Vitae congue eu consequat ac felis donec et.',
						'Nisl suscipit adipiscing bibendum est.',
						'Libero id faucibus nisl tincidunt eget.',
						'Tellus at urna condimentum mattis pellentesque id.',
						'Massa sed elementum tempus egestas sed sed risus pretium quam.',
						'Tristique senectus et netus et.',
						'Orci eu lobortis elementum nibh.',
						'Diam vulputate ut pharetra sit amet aliquam.',
						'Justo donec enim diam vulputate ut pharetra sit amet.',
						'Nulla pharetra diam sit amet nisl suscipit adipiscing bibendum est.',
						'Egestas quis ipsum suspendisse ultrices gravida.',
						'Condimentum lacinia quis vel eros.',
						'Commodo ullamcorper a lacus vestibulum sed arcu non odio euismod.',
						'Egestas erat imperdiet sed euismod nisi porta lorem.',
						'Lobortis elementum nibh tellus molestie nunc non.',
						'Morbi tristique senectus et netus et malesuada fames ac.',
						'Mauris pharetra et ultrices neque ornare aenean euismod elementum nisi.',
						'Auctor elit sed vulputate mi.',
						'Pretium viverra suspendisse potenti nullam ac tortor vitae purus.',
						'Pretium viverra suspendisse potenti nullam ac tortor vitae.',
						'Quis varius quam quisque id.',
						'Amet consectetur adipiscing elit pellentesque.',
						'Lorem ipsum dolor sit amet consectetur adipiscing.',
						'Sit amet dictum sit amet.',
						'Aliquam nulla facilisi cras fermentum odio eu feugiat.'
					],
				min = (typeof min === UNDEF)? 1 : min,
				max = (typeof max === UNDEF)? 3 : max,
				num = min + Math.ceil(max * Math.random()),
				first = Math.ceil(Math.random() * (sentences.length  - num));
				
			return sentences.slice(first, first + num).join(' ');
		};
	
	/*
	 * Returns the font size definition stack in a responsive manner
	 */
	 
	getFontSizes = function(zoom, headlnZoom, breakpoint) {
			var breakpoint = breakpoint || '40em',
				headlnZoom = parseFloat(headlnZoom) || 3.2,
				zoom = zoom || 1,
				z = Math.max(headlnZoom - 1.0, 0.5),
				fs = Math.round(zoom * 16.0);
			
			return 	'body { font-size: ' + fs + 'px; line-height: 1.25; }\n' +
					'h1 { font-size: ' + (z * 0.5 + 1.0).toFixed(2) + 'em; line-height: 1.25; }\n' +
					'h2 { font-size: ' + (z * 0.3125 + 1.0).toFixed(2) + 'em; line-height: 1.1538; }\n' + 
					'h3 { font-size: ' + (z * 0.1875 + 1.0).toFixed(2) + 'em; line-height: 1.1364; }\n' + 
					'h4 { font-size: ' + (z * 0.125 + 1.0).toFixed(2) + 'em; line-height: 1.1111; }\n' + 
			
					'\n@media screen and (min-width: ' + breakpoint + ') {\n' +
					'\tbody { font-size: ' + fs + 'px; line-height: 1.375; }\n' +
					'\th1 { font-size: ' + (z + 1.0).toFixed(2) + 'em; line-height: 1.05; }\n' +
					'\th2 { font-size: ' + (z * 0.625 + 1.0).toFixed(2) + 'em; line-height: 1.25; }\n' +
					'\th3 { font-size: ' + (z * 0.375 + 1.0).toFixed(2) + 'em; line-height: 1.25; }\n' +
					'\th4 { font-size: ' + (z * 0.125 + 1.0).toFixed(2) + 'em; line-height: 1.25; }\n' +
					'}\n' +
			
					'\n@media print {\n' +
					'\tbody { font-size: 12pt; line-height: 1.25em; }\n' +
					'\th1 { font-size: 36pt; line-height: 1.25em; }\n' +
					'\th2 { font-size: 24pt; line-height: 1.25em; }\n' +
					'\th3 { font-size: 18pt; line-height: 1.25em; }\n' +
					'\th4 { font-size: 14pt; line-height: 1.25em; }\n' + 
					'}\n';
		};
	
	/*
	 * Filters camera data junk
	 */
	 
	filterJunk = function(s) {
			s = (s || '').trim();
			if (!s || 
				s === 'x' ||
				s.startsWith('ACD Systems Digital Imaging') ||
				s.startsWith('LEAD Technologies') ||
				s.startsWith('AppleMark') ||
				s.startsWith('Intel(R) JPEG Library') ||
				s.startsWith('Created with The GIMP') ||
				s.startsWith('ASCII') ||
				s.startsWith('OLYMPUS DIGITAL CAMERA') ||
				s.startsWith('SONY DSC') ||
				s.startsWith('File written by Adobe Photoshop') ||
				s === '\x82\x44\x7F\xBF\xC2\xB5\x22\xBB\xB1\xB8\x9A\x3D\xDD\xA3\x43\xBB\xC5\x54\x7F\xBF\xAA\xD2\x93\xBD\x28\xAF\x9A\x3D\xA4\xDC\x93\xBD\x48\x99\x7E\x3F') {
				return '';
			} else if (s.startsWith('Flash did not fire')) {
				return getText('noFlash');
			}
			return s;
		};
	
	/*
	 * Shortens strings and removes HTML tags if necessary
	 */
	 
	shorten = function(s, max, forceStrip) {
			if (!s) {
				return '';
			}
			
			var i,
				max = max || 160;
			
			if (forceStrip) {
				s = stripHTML(s);
			}
			
			if (s.length > max) {
				if (s.indexOf("<") >= 0) {
					s = stripHTML(s);
					if (s.length() <= max) {
						return s;
					}
				}
				
				if ((i = s.lastIndexOf(' ', max)) < (max / 2)) {
					i = max;
				}
				
				return s.substring(0, i) + '&hellip;';
			}
			
			return s;
		};

	/*
	 * Returns lens info
	 */
	 
	getLensInfo = function(s) {
			if (!s) {
				return '';
			}
			
			var getFraction = function(a, b) {
					var	x = parseInt(a),
						y = parseInt(b);
					
					return y? (x / y) : Number.POSITIVE_INFINITY;
				},
				li = s.split('[\s/]');
				f1, f2, a1, a2;
			
			if (li.length > 7) {
				f1 = Math.round(getFraction(li[0], li[1]));
				f2 = Math.round(getFraction(li[2], li[3]));
				a1 = getFraction(li[4], li[5]);
				a2 = getFraction(li[6], li[7]);
				return f1 + '-' + f2 + 'mm f/' + a1.toFixed(1) + ((a2 != a1)? ('-' + a2.toFixed(1)) : ''); 
			}
			
			return s;
		};
		
	/*
	 * Gets Copyright URL
	 */
	 
	getCopyrightURL = function(vars) {
			
			if (!vars) {
				return '';
			}
			
			var url = vars.get('copyrightURL'),
				lbl = vars.get('copyright'),
				m;
			
			if (typeof url === UNDEF) {

				if (m = vars['meta']) {
					url = m['xmp.xmpRights:WebStatement'];
					lbl = m['xmp.dc:rights[1]'] || m['xmp.xmpRights:UsageTerms[1]'];
				} else if (m = vars.get('xmp')) {
					url = m['xmpRights:WebStatement'];
					lbl = m['dc:rights[1]'] || m['xmpRights:UsageTerms[1]'];
				}
			}
			
			return url? ('<a href="' + url + '" target="_blank">' + (lbl || url) + '</a>') : '';
		};
	/*
	 * Gets F Stop
	 */
	 
	getFstop = function(s) {
		
			if (typeof s === NUMBER) {
				s = Math.round(s * 10) / 10 + '';
			}
			
			if (!s) {
				return '';
			} else if (s.startsWith('f/')) {
				s = s.substring(2);
			} else if (s.charAt(0) === 'F') {
				s = s.substring(1);
			}
			
			var i = s.lastIndexOf('.');
			
			if (i > 0 && s.length > i + 2) {
				s = s.substring(0, i + 2);
			}
			
			return '\u0192/' + s;
		};
		
	/*
	 * Gets one metadata
	 */
	 
	getMeta = function(vars, key) {
		
			if (!key || !vars) {
				return '';
			}
			
			var m = vars['meta'],
				s;
			
			if (!m) {
				m = vars.get('xmp');
				if (!m) {
					return '';
				}
				key = key.replace(/^xmp\./, '');
			}
			
			if (key.startsWith('White Balance')) {
				// White balance
				s = m['key'];
				
				if (!s || s === 'Unknown') {
					// Trying the alias
					s = m[(key === 'White Balance')? 'White Balance Mode' : 'White Balance'];
				}
				
				return (!s || s === 'Unknown')? '' : s;
				
			} else if (key === 'F-Number' || key === 'FNumber' ||
				key.toLowerCase().startsWith('aperture')) {
				// F stop
				return getFstop(m[key]);				
				
			} else if (key === 'Xmp.Lens-Information') {
				// Lens info
				return getLensInfo(m[key]);
			} else if (key === 'keywords') {
				if (s = m[key]) {
					return s.split(';').join(', ');
				}
				return '';
			} else if (key.startsWith('xmp.dc:') || key.startsWith('dc:')) {
				// Arrays
				for (var i = 1, a = [], v; i < 100; i++) {
					v = m[key + '[' + i + ']'];
					if (typeof v === UNDEF) {
						break;
					}
					a.push(v);
				}
				return a.join(', ');
			}
			
			// Generic case
			if (s = m[key] || 
				(s = m['Xmp.' + key]) ||
				(s = m['Iptc.' + key]) ||
				(s = m['Windows XP ' + key])) {
				return filterJunk(s);
			}
			
			return '';
		};
	
	/*
	 * Returns dimension from String
	 */
	 
	getDim = function(s) {
			
			if (s) {
				var xy = s.split(/[xX]/),
					x,
					y; 
				
				if (xy.length >= 2) {
					x = parseInt(xy[0]);
					y = parseInt(xy[1]);
					if (!isNaN(x) && !isNaN(y)) {
						return new Dimension(x, y);
					}
				}
			}
			
			return null;
		};
		
	/*
	 *	Returns dimensions from HTML tags width="" height="" or width:Npx; height:Npx;
	 */
	 
	getDimFromCode = function(code) {
			var m,
				s = new Array(2);
				
			if (m = code.match(/width="(\d+)"/)) {
				s[0] = m[1];
				if (m = code.match(/height="(\d+)"/)) {
					s[1] = m[1];
					return s;
				}
			} else if (m = code.match(/width:(\d+)px;/)) {
				s[0] = m[1];
				if (m = code.match(/height:(\d+)px;/)) {
					s[1] = m[1];
					return s;
				}
			}
			
			return null;
		};
	
	/*
	 * Clean up string for HTML use
	 */
	 
	cleanup = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			return s.replace(/&/g, '&#38;').replace(/\'/g, '&#39;').replace(/\"/g, '&#34;').replace(/(\\s?\r?\n)+/g, '<br>'); 
		};
		
	/*
	 * Remove HTML tags
	 */
	 
	stripHTML = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			return s.replace(/\/?<[^>]*>/g, ' ').replace(/\r?\n/g, ' ').replace(/\&nbsp;/g, ' ').replace(/\&(m|n)dash;/g, '–').replace(/\&hellip;/g, '...').replace(/\&amp;/g, '&').replace(/\&copy;/g, '\xA9').replace(/\s+/g, ' ').trim();
		};
	
	/*
	 * Remove only empty HTML tags
	 */
	 
	stripEmptyHTML = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			
			s = s.trim().replace(/<(?!IMG)(?!img)(?!audio)(?!AUDIO)(?!video)(?!VIDEO)(?!input)(?!INPUT)(?!iframe)(?!IFRAME)(?!br)(?!BR)(?!hr)(?!HR)(?!a\s)(?!A\s)[^\/>][^>]*>\s*<\/[^>]+>/g, '');
			
			return s;
		};
	
	/*
	 * Replace single-, double quotes and line breaks with HTML entities  
	 */
	 
	stripQuot = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			return s.replace(/'/g, '&#39;').replace(/"/g, '&#34;').replace(/\r?\n/g, '<br>');
		};
	
	/*
	 * Removing file extension  
	 */
	 
	stripExt = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			return s.replace(/(\.\w+)$/, '');
		};
	
	/*
	 * Escaping single quotes
	 */
	 
	escQuot = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			return s.replace(/'/g, '\\\'').replace(/\r?\n/g, ' ');
		};
		
	/*
	 * Escaping double quotes
	 */
	 
	escDblQuot = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			return s.replace(/"/g, '\\\"').replace(/\r?\n/g, ' ');
		};
		
	/*
	 * Escaping both quotes
	 */
	 
	escQuotes = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			return s.replace(/"/g, '\\\"').replace(/'/g, '\\\'').replace(/\r?\n/g, ' ');
		};
		
	/*
	 * Replace single quotes with HTML entity, line breaks with space
	 */
	 
	stripQuotes = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			return s.replace(/'/g, '&apos;').replace(/\r?\n/g, ' ');
		};
		
	/*
	 * Remove line breaks or replace with delimiter
	 */
	 
	stripCrlf = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			return s.replace(/^(\r?\n)+/g, '').replace(/(\r?\n)+$/g, '').replace(/(\r?\n)+/g, '');
		};
	
	/*
	 * Replace line breaks with HTML tags
	 */
	 
	stripLinebreak = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			return s.replace(/^\n+/g, '').replace(/\n+$/g, '').replaceAll(/\n+/g, '<br>');
		};
	
	/*
	 * Cleaning up jAlbum's paths
	 */
	 
	cleanPath = function(p) {
			if (p === '.') {
				return '';
			}
	
			p = p.replace(/%2F/g, '/');
			
			if (p.endsWith('/')) {
				p = p.substring(0, p.length - 1);
			}
	
			return p;
		};

	/*
	 * Stripping HTML tags and quotes for HTML attributes
	 */
	 
	cleanItem = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			return s.replace(/<[^>]*>/g, ' ').replace(/\r?\n/g, ' ').replace(/'/g, '\\\'').replace(/"/g, '\\\"').trim();
		};
		
	/*
	 * Gets Google font with language subset if available
	 */
	 
	getGoogleFont = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			
			s = s.replace(/\s+/g, '+')
					.replace(' Extra-Light', ':200')
					.replace(' Light', ':300')
					.replace(' Regular', '')
					.replace(' Medium', ':500')
					.replace(' Semi-Bold', ':600')
					.replace(' Bold', ':700')
					.replace(' Extra-Bold', ':800')
					.replace(' Italic', 'i');
					
			if (lang) {
				if ('cs.ee.hr.hu.ro.sh.sk.sl.tr'.indexOf(lang) >= 0)
					return s + '&amp;subset=latin,latin-ext';
				else if ('bg.ru.sr.uk'.indexOf(lang) >= 0)
					return s + '&amp;subset=cyrillic';
				else if (lang === 'el')
					return s + '&amp;subset=greek';
			}
			
			return s;
		};
	
	/*
	 * Grid ladder calculation
	 */
	 
	getGridLadder = function(cols) {
			if (cols < 2) {
				return '';
			}
			
			return 	' small-up-' + Math.max(Math.floor(cols / 2), 1) + 
					' medium-up-' + Math.max(Math.floor(cols * 0.75), 1) + 
					' large-up-' + cols;
		};

	/* 
	 * Get Optimal thumbnail size
	 */
	
	getOptimalThumbSize = function(cols, padding) {
		
			var bp = 1024,
				cc = Math.max(Math.floor(c * .75), 1), 
				w = Math.ceil(((cc === 1)? bp : (bp - (cc - 1) * 2.5) / cc) - p * 2);
				
			return (Math.round(w / 10) * 10) + 'x' + (Math.round(w * 0.075) * 10);
			
		};

	/*
	 * Reading a multi-line TextArea into a js variable as Array
	 */
	 
	toArray = function(s) {
			var sb = new Array(),
				arr = (s || '').split(/\r?\n/);
			
			for (var i = 0; i < arr.length; i++) {
				sb.push('\'' + escQuot(arr[i]) + '\'');
			}
			
			return '[' + sb.join(',') + ']';
		};

	/*
	 * Preformat texts
	 */
	 
	preformatText = function(s) {
			return (s === null || s === '')? '' :
				s.replace(/\*([\w\s]+)\*/g, '<strong>$1</strong>')
				.replace(/\+([\w\s]+)\+/g, '<em>$1</em>')
				.replace(/\_([\w\s]+)\_/g, '<u>$1</u>')
				.replace(/(\n|\r)/g, '<br>')
				.replace(/\!(http\:[\w\./\-]+[png|gif|jpg])\!/g, '<img src=\"$1\">')
				.replace(/\[((?:http|https|ftp){1}\:[\w\./\-]+)\]/g, '<a href=\"$1\">$1</a>')
				.replace(/\[([^\|]+)\|((?:http|https|ftp){1}\:[\w\./\-]+)\]/g, '<a href=\"$2\">$1</a>');
		};
	
	/*
	 * Formats text while tries to preserve HTML tags
	 */
	 
	formatPlainText = function(s) {
			if (!s) { 
				return '';
			}
			
			var sb = '',
				li = 0, 
				i;
				
			while ((i = s.indexOf('<', li)) >= 0) {
				if (i > li) {
					// Between tags
					sb += preformatText(s.substring(li, i));
				}
				
				li = i;
				
				if ((i = s.indexOf('>', li)) >= 0) {
					// HTML tag
					sb += s.substring(li, i);
					li = i;
				} else {
					// Unclosed tag
					break;
				}
			}
			
			if (li < s.length) {
				// remain
				sb += preformatText(s.substring(li));
			}
			
			return sb;
		};
		
	/*
	 * Processing string (replacing variables) 
	 */
	 
	getProcessed = function(s) {
			var res = '';
			
			if (s) {
				try {
					res = engine.processTemplate(s);
				} catch(ex) {
					logger(Level.WARNING, 'Error in: {0}', s);
					return s;
				}
			}
			
			return res;
		};
		
	/*
	 * Wraps a text in a HTML tag (might contain attributes)
	 */
	 
	wrap = function(t, s) {
			if (typeof s !== UNDEF && t) { 
				return '<' + t + '>' + s + '</' + t.split(' ')[0] + '>';
			}
			return '';
		};
	
	/*
	 * Returns a HTML attribute 'a', if value is not null or empty
	 */
	 
	attr = function(a, o) {
			if (typeof o !== UNDEF && a) { 
				return ' ' + a + '="' + o + '"';
			}
			return '';
		};
	
	/*
	 * Returns a HTML attribute 'a', only if 'b' is true
	 */
	 
	attrIf = function(a, b) {
			return b? (' ' + a + '="' + b + '"') : '';
		};
	
	/*
	 * Returns a HTML5 data attribute 'n', if value is not null or empty
	 */
	 
	data = function(n, o) {
			if (n && typeof o !== UNDEF) {
				return attr('data-' + n, '' + o);
			}
			return '';
		};
	
	dataIf = function(n, b) {
			return attrIf('data-' + n, b);
		};
	
	hex2 = function(i) {
			i = Math.round(i);
			return (i < 16)? ('0' + i.toString(16)) : i.toString(16);
		};
		
	/*
	 * Returns CSS color format from #AARRGGBB
	 */
	 
	getCssColor = function(c) {
			if (Array.isArray(c)) {
				return (c[3] === 255)?
					'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'
					:
					'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (c[3] / 255).toFixed(3) + ')';
			}
			
			if (c.length < 8) {
				return c;
			}
			
			if (c.startsWith("#FF") || c.startsWith("#ff")) {
				return "#" + c.substring(3);
			}
			
			if (c.startsWith("#00")) {
				return "transparent";
			}
			
			return 'rgba(' + 
					parseInt(c.substring(3,5), 16) + ',' + 
					parseInt(c.substring(5,7), 16) + ',' + 
					parseInt(c.substring(7,9), 16) + ',' + 
					(parseInt(c.substring(1,3), 16) / 255.0).toFixed(3) + 
				')';
		};
	
	/*
	 * Fixing improper color format
	 */
	 
	fixShortColor = function(c) {
			var i = 0,
				clr = '';
			
			if (c.length <= 3) {
				// #333
				for (; i < c.length; i++) {
					clr += c.charAt(i) + c.charAt(i);
				}
				i *= 2;
			} else {
				for (; i < c.length; i++) {
					clr += c.charAt(i);
				}
			}
			
			for(; i < 6; i++) {
				clr += '0';
			}
			
			return clr;
		};
	
	/*
	 * Returns RGBA color
	 */
	 
	getRgba = function(c) {
			var a = 255,
				clr;
				
			c = c.toUpperCase();
			
			if (c.charAt(0) == '#') {
				c = c.substring(1);
			}
			
			if (c.length > 6) {
				a = parseInt(c.substring(1,3), 16);
				c = c.substring(2);
			} else if (c.length < 6) {
				c = fixShortColor(c);
			}
			
			clr = parseInt(c.substring(0,2), 16) + "," + 
				parseInt(c.substring(2,4), 16) + "," +
				parseInt(c.substring(4,6), 16);
			
			return 'rgba(' + clr + ',' + ((a === 255)? '1' : (a / 255.0).toFixed(3)) + ')';
		};
	
	/*
	 * Returns the flat color combined from two colors
	 */
	 
	getFlatColor = function(bg, fg) {
		
			if (fg === 'transparent') {
				return getCssColor(bg);
			}
			
			var cf = getColorArray(fg),
				a = cf[3];
			
			if (!a) {
				return getCssColor(bg);
			} else if (a === 255) {
				return getCssColor(fg);
			}
			
			// Only if semi-transparent
			var i,
				c,
				cb = getColorArray(bg);
			
			for (i = 0; i < 3; i++) {
				c = Math.round(((cb[i] * (255 - a)) + cf[i] * a) / 255);
				cf[i] = Math.min(c, 255);
			}
			
			return "#" + hex2(cf[0]) + hex2(cf[1]) + hex2(cf[2]);
		};
		
	/*
	 * Returns combined color from two color arrays with trasnparency
	 */
	 
	getMiddleColor = function(c1, c2) {
		
			if (c1 === 'transparent') {
				return getCssColor(c2);
			}
			
			if (c2 === 'transparent') {
				return getCssColor(c1);
			}
			
			c1 = getColorArray(c1);
			c2 = getColorArray(c2);
			
			return getCssColor([ 
					(c1[0] + c2[0]) / 2,
					(c1[1] + c2[1]) / 2,
					(c1[2] + c2[2]) / 2,
					(c1[3] + c2[3]) / 2
				]);
		};
		
		
	/*
	 * Returns combined color from two color arrays
	 */
	 
	getFlatColorArray = function(bg, fg) {
		
			if (typeof bg === STRING) {
				bg = getColorArray(bg);
			}
			
			if (typeof fg === STRING) {
				fg = getColorArray(fg);
			}
			
			var a = fg[3];
			
			if (!a) {
				return bg;
			} else if (a === 255) {
				return fg;
			}
			
			for (var i = 0; i < 3; i++) {
				c = Math.round(((bg[i] * (255 - a)) + fg[i] * a) / 255);
				bg[i] = Math.min(c, 255);
			}
			
			return bg;
			
		};

	/*
	 * Returns CSS color format from #AARRGGBB
	 */
	 
	getLuminosity = function(c) {
		
			if (Array.isArray(c)) {
				// Array
				return	0.0011725490196078 * c[0] + 
						0.0023019607843137 * c[1] +
						0.0004470588235294118 * c[2];
			}
			
			if (c.charAt(0) === '#') {
				// #NNN format
				c = c.substring(1);
			}
			
			if (c.length > 6) {
				// Alpha
				c = c.substring(2);
			}
			
			if (c.length < 6) {
				c = fixShortColor(c);
			}
			
			return 	0.0011725490196078 * parseInt(c.substring(0,2), 16) + 
					0.0023019607843137 * parseInt(c.substring(2,4), 16) + 
					0.0004470588235294118 * parseInt(c.substring(4,6), 16);
		};
	
	/*
	 * Light color? (backgroundColor, color, threshold)
	 */
	 
	isLightColor = function(bc, c, threshold) {
			var threshold = (typeof threshold === UNDEF)? 0.5 : threshold;
			
			if (typeof c === UNDEF) {
				c = bc;
				bc = '';
			} else if (typeof c === NUMBER) { 
				threshold = c;
				c = bc;
				bc = '';
			}
				
			var l = getLuminosity(c);
			
			if (c.length > 7 && bc) {
				// Semi transparent color
				var a = parseInt(c.substring(1,3), 16) / 255.0;
				if (a < 1) {
					l = a * l + (1 - a) * getLuminosity(bc);
				}
			}
			
			return l > threshold;
		};
		
	/*
	 * Lightening
	 */
	 
	lighten = function(c, factor) {
			var factor = (typeof factor === UNDEF)? 0.2 : factor,
				rgb = getColorArray(c),
				isArray = (typeof c !== STRING);
			
			for (var i = 0; i < 3; i++) {
				rgb[i] = Math.min(Math.max(0, Math.round((255 - rgb[i]) * factor)) + rgb[i], 255);
			}
			
			//System.out.println("lighten(" + c + "," + factor + ") => " + rgb.join(","));
			
			return isArray? rgb : toHexColor(rgb);
		};
	
	/*
	 * Darkening
	 */
	 
	darken = function(c, factor) {
			var factor = (typeof factor === UNDEF)? 0.2 : factor,
				rgb = getColorArray(c),
				f = Math.max(1 - factor, 0),
				isArray = (typeof c !== STRING);
			
			for (var i = 0; i < 3; i++) {
				rgb[i] = Math.round(rgb[i] * f);
			}

			//System.out.println("darken(" + c + "," + factor + ") => " + rgb.join(","));
			
			return isArray? rgb : toHexColor(rgb);
		};
	
	/*
	 * Enhancing contrast if necessary
	 */
	 
	enhanceContrast = function(c, bc, factor) {
			var factor = (typeof factor === UNDEF)? 0.3 : factor;
			
			return isLightColor(bc)? darken(c, factor) : lighten(c, factor);
		};

	/*
	 * RGB -> Hex color
	 */
	 
	toHexColor = function(rgb) {
			var s = '#';
			
			for (var i = 0; i < 3; i++) {
				if (i >= rgb.length) {
					s += '00';
				} else {
					s += hex2(rgb[i]);
				}
			}
			
			return s;
		};
		
	/*
	 * RGB -> HSV color
	 */
	 
	rgbToHsv = function(rgb) {
			var v = Math.max(rgb[0], rgb[1], rgb[2]), 
				c = v - Math.min(rgb[0], rgb[1], rgb[2]),
				h = c && ((v === rgb[0])? 
						(rgb[1] - rgb[2]) / c 
						: 
						((v === rgb[1])? 
							(2 + (rgb[2] - rgb[0]) / c) 
							: 
							(4 + (rgb[0] - rgb[1]) / c))
					); 
	
			return 	[
						((h < 0)? (h + 6) : h) / 6, 
						(v && c / v),
						v / 255
					];
		};
		
	/*
	 * HSV -> RGB color
	 */
	 
	hsvToRgb = function(hsv) {
			var r, g, b, i, f, p, q, t;
			
			i = Math.floor(hsv[0] * 6);
			f = hsv[0] * 6 - i;
			p = hsv[2] * (1 - hsv[1]);
			q = hsv[2] * (1 - f * hsv[1]);
			t = hsv[2] * (1 - (1 - f) * hsv[1]);
			
			switch (i % 6) {
				case 0: r = hsv[2], g = t, b = p; break;
				case 1: r = q, g = hsv[2], b = p; break;
				case 2: r = p, g = hsv[2], b = t; break;
				case 3: r = p, g = q, b = hsv[2]; break;
				case 4: r = t, g = p, b = hsv[2]; break;
				case 5: r = hsv[2], g = p, b = q; break;
			}
			
			return 	[
						Math.round(r * 255),
						Math.round(g * 255),
						Math.round(b * 255)
					];
		};
	/*
	 *	Luma = perceived luminosity
	 */
	 
	getLuma = function(rgb) {
		
			return (0.212 * rgb[0] + 0.701 * rgb[1] + 0.087 * rgb[2]) / 255;
		};
		
	/*
	 * Returns legible color on "bc" with optional semi-transparent "fc"
	 * checking if "tc" is enough contrasty or if not
	 * returns a lighter version of tc by factor "f"
	 * getLegibleColor(background1, background2, foreground, factor)
	 * getLegibleColor(background, foreground, factor)
	 * getLegibleColor(background, foreground)
	 */
	 
	getLegibleColor = function() {
			var args = [].slice.call(arguments),
				bc,
				f = 0.6;
				
			// Getting background color: 1 or 2 with transparency
			if (args.length > 3 || (args.length === 3 && typeof args[2] !== NUMBER)) {
				bc = getFlatColorArray(args[0], args[1]);
				args.splice(0, 2);
			} else {
				bc = getColorArray(args[0]);
				args.splice(0, 1);
			}
			
			if (typeof args[0] !== NUMBER) {
				// Has foreground color
				
				var txt = getColorArray(args[0]),
					bgl = getLuma(bc);
				
				if (typeof args[1] === NUMBER) {
					f = args[1];
				}
				
				if (Math.abs(bgl - getLuma(txt)) >= f) {
					// Already contrasty
					return toHexColor(txt);
				}
				
				bc = rgbToHsv(bc);
				txt = rgbToHsv(txt);
				
				if (bgl > 0.55) {
					txt[2] = Math.max(0, bc[2] - f);
					txt[1] *= 1 - Math.abs(bc[2] - 0.5);
				} else {
					txt[2] = Math.min(1, (txt[2] + bc[2]) / 2 + f);
					txt[1] = (1 - bc[2]) * txt[1] / 2;
				}
				
				return toHexColor(hsvToRgb(txt));

			} else {
				
				// No foreground color
				
				if (typeof args[0] === NUMBER) {
					f = args[0];
				}
				
				if (bgl > 0.55) {
					return toHexColor(darken(bc, f));
				} else {
					return toHexColor(lighten(bc, f));
				}
			}
			
		};
			
	/*
	 * Strips alfa (sets fully opaque)
	 */
	 
	stripAlpha = function(c) {
			if (c.charAt(0) === '#') {
				if (c.length > 7) {
					return '#' + c.substring(3);
				}
			} else if (c.startsWith('rgba(')) {
				var rgb = c.substring(5).split(',');
				return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
			}
			
			return c;
		};
		
	/*
	 * Sets opacity
	 */
	 
	setAlpha = function(c, a) {
			if (a > 0.99999) {
				// Opaque, no alpha needed
				return c;
			}
			
			if (c.charAt(0) === '#') {
				var c1 = getColorArray(c);
				return 'rgba(' + c1[0] + ',' + c1[1] + ',' + c1[2] + ',' + a.toFixed(3) + ')';
			} else if (c.startsWith('rgb(')) {
				return c.substring(0, c.indexOf(')')) + ',' + a.toFixed(3) + ')';
			} else if (c.startsWith('rgba(')) {
				var rgb = c.substring(5).split(',');
				return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a.toFixed(3) + ')';
			}
			
			return c;
		};
	
	/*
	 * Returns opacity
	 */
	 
	getAlpha = function(c) {
			if (c.charAt(0) == '#') {
				if (c.length > 8) {
					return parseInt(c.substring(1, 3), 16) / 255.0;
				}
			} else {
				if (c.startsWith('rgba(')) {
					var a = c.substring(4, c.indexOf(')')).split(',');
					if (a.length > 3) {
						return parseFloat(a[3]);
					}
				}
			}
			
			return 1.0;	
		};

	/*
	 * Returns CSS "background-color" from #AARRGGBB
	 */
	 
	getBgColor = function(c) {
			if (c.charAt(0) == '#' && c.length > 8) {
				if (c.startsWith('#FF') || c.startsWith('#ff')) {
					c = '#' + c.substring(3);
				} else if (c.startsWith('#00')) {
					c = 'transparent';
				} else {
					c = 'rgba(' + 
							parseInt(c.substring(3,5), 16) + "," + 
							parseInt(c.substring(5,7), 16) + "," + 
							parseInt(c.substring(7,9), 16) + "," + 
							(parseInt(c.substring(1,3), 16) / 255.0).toFixed(3) + 
						')';
				}
			}
			
			return 'background-color: ' + c + ';';
		};
	
	/*
	 * Returns the color as array { R, G, B, A }
	 */
	 
	getColorArray = function(c) {
			if (Array.isArray(c)) {
				return c;
			}
			var a = 255, 
				r = 0, 
				g = 0, 
				b = 0;
			
			if (c.charAt(0) == '#') {
				c = c.toUpperCase();
				c = c.substring(1);
			
				if (c.length > 6) {
					if (!c.startsWith("FF")) {
						a = parseInt(c.substring(0,2), 16);
					}
					c = c.substring(2);
				}
				
				if (c.length < 6) {
					c = fixShortColor(c);
				}
			
				r = parseInt(c.substring(0,2), 16);
				g = parseInt(c.substring(2,4), 16);
				b = parseInt(c.substring(4,6), 16);
				
			} else if (c.startsWith('rgb')) {
				var rgb = c.substring(c.indexOf('(') + 1, c.indexOf(')')).split(',');
				
				if (rgb.length > 3) {
					a = Math.min(Math.round(parseFloat(rgb[3]) * 255), 255);
				}
				
				r = parseInt(rgb[0], 10);
				g = (rgb.length > 1)? parseInt(rgb[1], 10) : 0;
				b = (rgb.length > 2)? parseInt(rgb[2], 10) : 0;
			}
			
			return [ r, g, b, a ];
		};
	
	/*
	 * Returns a simpe dark/light color that supposed to be visible on background
	 */
	 
	getTextColor = function(bg) {
			return 'color: ' + (isLightColor(bg)? '#222222' : '#dddddd');
		};
	
	/*
	 * Gets texts from the translation files, returning empty string if not exists
	 */
	 
	getText = function(name, fallback) {
			var s;
			try { 
				s = texts.getString(name);
			} catch(e) {
				logger(Level.FINE, 'Translate: Missing translation: "{0}"', name);
				return (typeof fallback === UNDEF)?
					unCamelCase(name.replace(/^ui\./, ''))
					:
					fallback;
			}
			return s;
		};
	
	/*
	 * Gets text with template
	 */
	 
	getTextTemplate = function(name, v) {
			var s = getText(name);
			
			if (Array.isArray(v)) {
				for (var i = 0; i < v.length; i++) {
					s = s.replace(new RegExp('{' + i + '}', 'g'), v[i] + '');
				}
			} else if (typeof v !== UNDEF) {
				 return s.replace('{0}', v + '');
			}
			
			return s;
		},
		
	/*
	 * To Camel Case
	 */
	 
	toCamelCase = function(s) {
			if (!s) {
				return '';
			}
			
			s = s.replace(/\W/g, ' ').split(' ');
			
			for (var i = 0; i < s.length; i++) {
				if (s[i]) {
					if (i) {
						s[i] = s[i][0].toUpperCase() + s[i].substring(1).toLowerCase();
					} else {
						s[i] = s[i].toLowerCase();
					}
				}
			}
			
			return s.join('');
		};
		
	/*
	 * Reverse of CamelCase = Camel case
	 */
	 
	unCamelCase = function(s) {
			if (!s) {
				return '';
			}
			
			s = s.replace(/([A-Z\[])/g, function(a) {
				return ' ' + a.toLowerCase();
			});
			
			if (s.startsWith(' ')) {
				s = s.substring(1);
			}
			
			s = s[0].toUpperCase() + s.substring(1);
		
			return s;
		};
		
	/*
	 * Gets texts from the translation files, returning empty string if not exists
	 */
	 
	getExifLabel = function(name) {
			if (typeof name === UNDEF) {
				return '';
			}
			
			var s, 
				n = name.replace(/^xmp\.photoshop:/i, '').replace(/^xmp\.(dc\:)?/i, '').replace(/Iptc4xmpExt\:/i, '').replace(/^iptc\.(IIM\/)?/i, '').replace(/^Canon makernote\./i, '');
			
			try {
				s = texts.getString(n);
			} catch(e) {
				try {
					s = texts.getString(toCamelCase(n));
				} catch(ex) {
					logger(Level.FINE, 'getExifLabel: No translation for "{0}"', n);
					return capitalize(n);
				}
			}
			
			return s;
		};
		
	/*
	 * Retrieves the translations as a javascript Object from text labels 
	 * usage: <%= getTexts(["atLastPage","startOver","up","backToHome","stop"]) %>
	 * texts.properties: atLastPage=At last page
	 * result: atLastPage:'At last page',startOver:'Start over',up:'Up',stop:'Stop'
	 *
	 * With prefix:
	 * Builds a javascript array from names, prefixed with "prefix"
	 * usage: <%= getTexts(["someText","otherText"], "help") %>
	 * texts.properties: help.someText=Some text
	 * result: someText:'Some text',otherText:'Other text'
	 */
	 
	getTexts = function(keys, prefix) {
			var sb = new Array(),
				s;
				
			if (!keys.length) {
				return '';
			}
			
			for each (key in keys) {
				s = getText(prefix? (prefix + '.' + key) : key);
				if (s) {
					sb.push((prefix? '' : (key.replace('.', '_') + ':')) + '\'' + stripQuotes(s) + '\'');
				}
			}
			
			return sb.join(',');
		};
	
	/*
	 * Concatenates all files (for javascript)
	 */
	 
	mergeJs = function(srcFolderName, srcFiles, dstName, dev, keys) {
			var min = dev? '' : '.min',
				dst = new File(resDirectory, dstName + min + '.js'),
				src, 
				srcFolder,
				stream,
				writer,
				line;
			
			// Opening stream
			try {
				stream = new FileOutputStream(dst);
				writer = new BufferedWriter(new OutputStreamWriter(stream, 'UTF8'));
			} catch(e) {
				logger(Level.WARNING, 'Error creating "{0}"', dst.getName());
				return false;
			}
			
			// Header
			try {
				writer.write('/* ' + dstName + min + '.js - ' + skinName + ' skin scripts */');
				writer.newLine();
				writer.write('var VER=\'' + skinVersion + '\',DEBUG=' + dev + ',LOCALE=\'' + locale.replace('_', '-') + '\';');
				writer.newLine();
			} catch(e) {
				logger(Level.WARNING, 'Error writing header of "{0}"\n\t{1}', [dst.getName(), e]);
			}
		
			// Translations
			if (keys) {
				try {
					writer.write(';Texts = {' + getTexts(keys) + '};');
					writer.newLine();
				} catch(e) {
					logger(Level.WARNING, 'Error writing Texts to "{0}"\n\t{1}', [dst.getName(), e]);
				}
			}
			
			// All javascript libraries
			srcFolder = new File(skinDirectory, srcFolderName);
	
			for each (fn in srcFiles.split(',')) {
			
				try {
					src = new File(srcFolder, fn + min + '.js');
					
					if (!src || !src.exists()) {
						// Trying the other version
						//logger(Level.WARNING, 'Missing Javascript "{0}"', src.getName());
						src = new File(srcFolder, fn + (dev? '.min' : '') + '.js');
					}
					
					if (src && src.exists()) {
						var inp = new BufferedReader(new InputStreamReader(new FileInputStream(src)));
							
						while ((line = inp.readLine()) !== null) {
							writer.write(line);
							writer.newLine();
						}
					} else {
						logger(Level.WARNING, 'Missing Javascript resource "{0}.js"', src.getName());
					}
					
				} catch(e) {
					logger(Level.WARNING, 'Error writing: "{0}"\n\t{1}', [src.getName(), e]);
				}
			}
	 
			// Closing
			try {
				writer.flush();
				writer.close();
			} catch(e) {
				logger(Level.WARNING, 'Error closing "{0}"', dst.getName());
			}
			
			return true;
		};

	/*
	 * Credits HTML formatted
	 */
	 
	getCreditText = function() {
		
			if (typeof creditText !== UNDEF && creditText) {
				// jAlbum's own credit text
				return creditText;
			}
			
			// fall back
			return getText('credit', 'jAlbum web photo albums').replace(/\{0\}/g, getText('photoAlbums')).replace('\{\1}', 'jAlbum');
		};
	 
	getCredits = function() {
			var s = '';
			
			if (!engine.isExcludeBacklinks()) {
				var promo = JAlbum.getGlobal("promotion");
				
				s += (promo !== null && promo)?
						// Promotion
						('<span class="jalbum-promo">' + promo + '</span>')
						:
						// jAlbum backlink
						('<a href="' + generatorUrl + '" class="skin-link" rel="generator"' +
								' data-tooltip title="' + getText('jalbumDescription', 'jAlbum') + ', ' + internalVersion + '">' +
							getCreditText() + '</a>');
						
				// Skin link		
				s += ' &middot; <a href="' + skinLink + '" class="skin-link" rel="generator" data-tooltip title="' + 
							getText('skin') + ': ' + skin + ' ' + styleName + ', ' + skinVersion + '">' +
						skin + '</a>';
			}
			
			return s;
			
		};

	/*
	 * 	Simple encryption
	 */
	
	xEncrypt = function(s) {
			
			var xs = [0x93,0xA3,0x57,0xFE,0x99,0x04,0xC6,0x17],
				sl = s.length + 4,
				cl = (sl * 8 + 4) / 5,
				src = new Array(sl),
				c = '',
				i, 
				j, 
				k, 
				v = 0;
				
			s += ' ';
			
			for (i = 0; i < sl - 4; i++) {
				v += src[i + 4] = s.charCodeAt(i);
			}
			
			src[0] = sl & 0xff;
			src[1] = (sl >> 8) & 0xff;
			src[2] = v & 0xff;
			src[3] = (v >> 8) & 0xff;
			
			for (i = 0; i < sl; i++) {
				src[i] ^= xs[i % 8];
			}
			
			for (i = 0, j = 0; i < cl; i++, j += 5) {
				k = j >> 3;
				v = src[k] << 8;
				if (k < sl - 1) {
					v += src[k + 1];
				}
				v = (v >> (11 - (j % 8))) & 0x1f;
				c += String.fromCharCode(v + ((v > 9)? 0x37 : 0x30));
			}
			
			return c;
		};  

	
	/*
	 * Deep last taken (Exif) date
	 */
	 
	var deepLastTaken = function(folder, fallbackToLastModified) {
			var ao,
				lastTaken = 0,
				cat,
				lt;
	
			for each (ao in folder.getChildren()) {
				
				cat = ao.getCategory();
				
				if (cat && ao.isIncluded()) {
					
					switch (cat) {
						case folder:
							lt = deepLastTaken(ao, fallbackToLastModified);
							break;
						case image:
						case video:
							lt = getEpochDate(ao, fallbackToLastModified);
							break;
						default:
							continue;
					}
					
					if (lt > lastTaken) {
						lastTaken = lt;
					}
				}
			}
			
			return lastTaken;
		};
		
	/*
	 * Returns File Date Taken days for a folder
	 */
	 
	folderDateTakenDays = function(folder, fallbackToLastModified) {
			var lt;
			
			try {
				lt = deepLastTaken(folder, fallbackToLastModified || false);
			} catch(e) {
				logger(Logger.WARNING, 'IO Error: {0}', e);
				return 0;
			}
			
			return (0 + lt) / 86400000;
		};
	
	/*
	 * Getting URL-encoded path from root
	 */
	 	
	getEncodedPathFromRoot = function(ao) {
			return encodeURI(ao.getPathFromRoot());
		};
		
	/*
	 * Getting epoch date 
	 */
	 
	getEpochDate = function(ao, fallbackToLastModified) {
			
			if (ao.isFolder()) {
				return JAlbumUtilities.getDeepCameraDates(ao).last;
			}
			
			var m = null,
				meta = ao.getMetadata();
				
			if (meta) {
				// Reading camera date
				m = meta.getCameraDate();
				if (m && (typeof m !== NUMBER)) {
					m = 0 + m;
				}
			}
			
			if (!m && fallbackToLastModified) {
				// Fall back to last modified date
				m = ao.getLastModified();
				logger(Level.FINER, 'No camera date found for "{0}", using modified date {1}', [ao.getName(), m / 86400000]);
			}
			
			return (m == null)? 0 : m;
		};
	
	/*
	 * Returns File Date Taken days for a single object
	 */
	 
	fileDateTakenDays = function(ao) {
			return getEpochDate(ao, true) / 86400000;
		};

	/* 
	 * Returns a folder's last modified Object's date recursively to all subfolders
	 */
	 
	deepLastModifiedObject = function(folder) {
			var ao,
				lastModified = 0, 
				lm,
				cat;
			
			for each (ao in folder.getChildren()) {
				
				cat = ao.getCategory();
				
				if (ao.isIncluded() && cat !== Category.webPage) {
					
					if (cat === Category.folder) {
						lm = deepLastModifiedObject(ao);
					} else {
						lm = 0 + ao.getLastModified();
					}
					
					if (lm > lastModified) {
						lastModified = lm;
					}
				}
			}
			
			return lastModified;
		};
	
	/* 
	 * Returns a folder's last modified Image's date recursively to all subfolders
	 */
	 
	deepLastModifiedImage = function(folder) {
			var ao,
				lastModified = 0, 
				lm,
				cat;
		
			for each (ao in folder.getChildren()) {
				
				cat = ao.getCategory();
				
				if (ao.isIncluded() && cat !== Category.webPage) {
					
					switch(cat) {
						case folder:
							lm = deepLastModifiedImage(ao);
							break;
						case image:
							lm = 0 + ao.getFile().lastModified();
							break;
						default:
							continue;
					}
					
					if (lm > lastModified) {
						lastModified = lm;
					}
				}
			}
			
			return lastModified;
		};

	/* 
	 * Returns a folder's last modified Image's date
	 */
	
	lastModifiedImage = function(folder) {
			var ao,
				lastModified = 0, 
				lm,
				cat;
		
			for each (ao in folder.getChildren()) {
				
				cat = ao.getCategory();
				
				if (ao.isIncluded() && cat === Category.image) {
					lm = 0 + ao.getFile().lastModified();
				} else {
					continue;
				}
				
				if (lm > lastModified) {
					lastModified = lm;
				}
			}
			
			return lastModified;
		};

	/*
	 * Returns a folder's last modified file date (respecting the date format set by the user)
	 */

	folderModified = function(folder) {
			var lm;
			
			try {
				lm = deepLastModifiedObject(folder);
			} catch(e) {
				logger(Level.FINE, 'Couldn\'t read folder modified date: {0}', folder.getName());
				return 0;
			}
			
			return 0 + lm;
		};

	/*
	 * Returns date with jAlbum's "Custom date format"
	 */
	 
	getFormattedDate = function(ld) {
			if (ld) {
				return Dates.format(new JDate(ld), dateFormat);
			}
			return '';
		};
	
	/*
	 * Returns original time (Exif date) from eposh date
	 */
	 
	getOriginalTime = function(ao) {
			var meta = ao.getMetadata();
			if (meta) {
				return Dates.format(new JDate(meta.getCameraDate()), 'HH:mm');
			}
			return '';
		};
		
	/*
	 * Returns folder modified as String from Edit -> Date
	 */
	 
	folderDateString = function(folder) {
			var vars = folder.getVars().getMap();
			
			return vars.get('fileDate');
		};

	/*
	 * Returns File Modified days for a folder
	 */
	 
	folderModifiedDays = function(folder) {
			return Math.floor(folderModified(folder) / 86400000);
		};

	/*
	 * Returns File Modified days for a single object
	 */
	 
	fileModifiedDays = function(ao) {
			return Math.floor((0 + ao.getLastModified()) / 86400000);
		};
	
	/*
	 * Returns date range
	 */
	 
	getFormattedDateRange = function(fd, ld) {
		
			var format0 = format1 = dateOnlyFormat,
				d0 = new Date(fd),
				d1 = new Date(ld),
				sep = (dateOnlyFormat.indexOf(' ') > 0)? ' &ndash; ' : '&mdash;';
			
			//logger(Level.FINE, 'Date range(' + fd + ', ' + ld + ')'); 
			/*	
			if (fd === 0) {
				// Invalid first date
				if (ld === 0) {
					return '';
				}
				
				return Dates.format(new JDate(ld), format0);
				
			} else if (ld === 0 || fd === ld) {
			*/
			if (fd === ld) {
				// Same last date
				return Dates.format(new JDate(fd), format0);
			}
			
			if (d0.getYear() === d1.getYear()) {
				// Same year
				if (format1.startsWith('y')) {
					// Removing the right side year
					format1 = format1.replace(/y+[\s:\/\.,-]+/, '');
				} else {
					// Removing the left side year
					format0 = format0.replace(/[\s:\/\.,-]+y+/, '');
				}
				
				if (d0.getMonth() === d1.getMonth()) {
					// Same month
					if (d0.getDate() === d1.getDate()) {
						// Same day -> no formatting
						//logger(Level.FINE, '\t=> Same day: ' + Dates.format(new JDate(ld), dateFormat));
						return Dates.format(new JDate(ld), dateOnlyFormat);
					}
					
					if (format1.startsWith('M')) {
						// Removing the right side month
						format1 = format1.replace(/M+[\s:\/\.,-]+/, '');
					} else {
						// Removing the left side month
						format0 = format0.replace(/[\s:\/\.,-]+M+/, '');
					}
					sep = '-';
				}
			}
			
			//logger(Level.FINE, '\t=> ' + Dates.format(new JDate(fd), format0) + sep + Dates.format(new JDate(ld), format1));
			return 	Dates.format(new JDate(fd), format0) + sep + Dates.format(new JDate(ld), format1); 
		};

	/*
	 * Returns camera date range in a folder
	 */
	 
	getCameraDateRange = function(folder) {
			var items = folder.getChildren(),
				ao,
				oldest = Math.infinity,
				newest = 0,
				date;
			
			for (var i = 0; i < items.length; i++) {
				
				ao = items[i];
				
				if (ao.isIncluded() && ao.getCategory() != Category.webPage) {
					date = Math.floor(ao.getMetadata().getCameraDate());
					
					if (date > newest) {
						newest = date;
					}
					if (date < oldest) {
						oldest = date;
					}
				}
			}
			
			if (oldest === Math.infinity && newest === 0) {
				return '';
			} else if (oldest === Math.infinity) {
				return Dates.format(new JDate(newest), dateOnlyFormat);
			} else if (newest === 0 || newest === oldest) {
				return Dates.format(new JDate(oldest), dateOnlyFormat);
			}
			
			return  Dates.format(new JDate(oldest), dateOnlyFormat) + ' — ' + Dates.format(new JDate(newest), dateOnlyFormat);
		};

	/*
	 * Returns last camera date in a folder
	 */
	 
	getLastCameraDate = function(folder) {
			var ao,
				oldest = Math.infinity,
				newest = 0,
				date;
	
			for each (ao in folder.getChildren()) {
				
				if (ao.isIncluded() && ao.getCategory() != Category.webPage) {
					date = Math.floor(ao.getMetadata().getCameraDate());
					
					if (date > newest) {
						newest = date;
					}
				}
			}
			
			if (newest === 0) {
				return '';
			}

			return Dates.format(new JDate(newest), dateOnlyFormat);
		};
	
	/*
	 * Get category counts formatted as <ul><li>1 image</li><li>2 videos</li></ul> or <div><span>1 image</span></div>
	 * only image, audio, video and other
	 */
	 
	getCounts = function(ao, recursive, nodeName, nodeClass) {
			var sb = '',
				count = getCountObj(ao, recursive),
				subNode1,
				subNode2,
				i;
			
			if (typeof recursive === UNDEF) {
				var recursive = false;
			}
			
			if (typeof nodeName === UNDEF) {
				var nodeName = 'ul';
			}
			
			if (typeof nodeClass === UNDEF) {
				var nodeClass = 'counts';
			}
			
			
			if (nodeName === 'ul') {
				subNode1 = '<li>';
				subNode2 = '</li>';
			} else {			
				subNode1 = '<span>';
				subNode2 = '</span>';
			}
			
			if (nodeName) {
				sb = '<' + nodeName + (nodeClass? (' class="' + nodeClass + '"') : '') + '>';
			}
			
			if (count.image) {
				sb += subNode1 + count.image + '&nbsp;' + getText((count.image > 1)? 'images' : 'image') + subNode2;
			}
			if (count.audio) {
				sb += subNode1 + count.audio + '&nbsp;' + getText((count.audio > 1)? 'audios' : 'audio') + subNode2;
			}
			if (count.video) {
				sb += subNode1 + count.video + '&nbsp;' + getText((count.video > 1)? 'videos' : 'video') + subNode2;
			}
			if (count.other) {
				sb += subNode1 + count.other + '&nbsp;' + getText((count.other > 1)? 'others' : 'other') + subNode2;
			}
			
			if (nodeName) {
				sb += '</' + nodeName + '>';
			}
			
			return sb;
		};
	
	/*
	 * Returns the count object
	 */
	 
	getCountObj = function(folder, recursive) {
			var count;
			
			try {
				count = JAlbumUtilities.countCategories(folder, recursive || false);
			} catch(e) {
				logger(Level.WARNING, 'Circular folder reference error: "{0}"', folder.getName());
				return {
						folder:			0,
						webPage:		0,
						webLocation:	0,
						image:			0,
						audio:			0,
						video:			0,
						other:			0
					};
			}
			
			return {
					folder:			count.getCount(Category.folder),
					webPage:		count.getCount(Category.webPage),
					webLocation:	count.getCount(Category.webLocation),
					image:			count.getCount(Category.image),
					audio:			count.getCount(Category.audio),
					video:			count.getCount(Category.video),
					other:			count.getCount(Category.other)
				};
		};
		
	/* 
	 * GetChildren filtered by type
	 */
	 
	getChildrenOfType = function(folder, types, max, skipFolderThumb) {
		
			var max = (typeof max === UNDEF)? Number.MAX_SAFE_INTEGER : max,
				skip = (typeof skipFolderThumb === UNDEF)? null : folder.getRepresentingAlbumObject(),
				r = [],
				lbable = types.indexOf('lightboxable') !== -1,
				cat,
				allow = {
						folder:			types.indexOf('folder') !== -1,
						webPage:		types.indexOf('webPage') !== -1,
						webLocation:	types.indexOf('webLocation') !== -1,
						image:			lbable || types.indexOf('image') !== -1,
						audio:			lbable || types.indexOf('audio') !== -1,
						video:			lbable || types.indexOf('video') !== -1,
						other:			lbable || types.indexOf('other') !== -1
					};
				
			for each (ao in folder.getChildren()) {
				
				cat = ao.getCategory();
				
				if (allow[cat] && 													// allowed?
					ao.isIncluded() &&												// included?
					!(skip && ao.equals(skip)) && 									// not folder thumbnail
					(cat !== Category.folder || !ao.isHidden())) {					// not hidden folder
				
					r.push(ao);
					
					max--;
			
					if (max < 1) {
						break;
					}
			
				}
			}
			
			return r;
		},
		
	/*
	 * Is normal object? (not folder or custom page or weblink)
	 */
	 
	isSimpleObject = function(ao) {
			var cat = ao.getCategory();
			
			return cat === Category.image || cat === Category.audio || cat === Category.video || cat === Category.other;
		};
		
	/*
	 * Tells if page based on a predefined page
	 */
	 
	isPredefinedPage = function(ao) {
			var n = getOriginalPageName(ao);
			
			return n !== null && n.length > 0;
		};
	
	/*
	 * Gets the original page name
	 */
	 
	getOriginalPageName = function(ao, fallback) {
			var n = ao.getVars().get('currentFile'),
				m;
			
			n = (n instanceof LinkFile)? n.getTargetName() : ao.getName();
			
			m = n.match(/^(About|Contact|Contents|Sitemap|Newimages|Calendar|TumblrFeed)[-\d]*\.htt$/);
			
			logger(Level.FINEST, 'getOriginalPageName({0}, {1}) -> "{2}"', [ ao.getName(), fallback? fallback : 'null', (m && m.length > 1)? m[1] : 'null' ]);
			if (!m || m.length < 2) {
				// No match
				return (typeof fallback !== 'undefined')? fallback : '';
			}
			
			return  m[1].toLowerCase();
		};
	
	/*
	 * Fixing degree formatted GPS data
	 */
	 
	formatGps = function(coord) {
			if (!coord) {
				return '';
			}
			
			if (coord.indexOf('\u00b0') > 0) {
				var s = coord.split(/[\u00b0,\'\"]/, 4);
				if (!s || s.length < 1) {
					return '';
				}
				
				var degrees,
					minutes = 0.0,
					seconds = 0.0;
					
				try {
					degrees = parseFloat(s[0]);
					if (s.length > 1)
						minutes = parseFloat(s[1]);
					if (s.length > 2)
						seconds = parseFloat(s[2]);
				} catch(e) {
					logger(Level.FINE, 'Number format error "{0}"', coord);
					return '';
				}
				
				return (degrees + (minutes * 60 + seconds) / 3600).toFixed(5).replace(',', '.');
			}
			
			return coord;
		};

	/*
	 * Retrieves GPS coodinates from gpsLatitude and gpsLongitude jAlbum variables
	 * Exif.GPS values and Turtle's proprietary location (=lat,lon) variable
	 * Preference: location > gpsLatitude > Exif.GPS
	 */
	 
	var validLocation = /[+-]?\d+(\.\d+)?,\s*[+-]?\d+(\.\d+)?/;
	
	getLocation = function(ao) {
			var vars = ao.getVars();
			
			if (!vars) {
				return '';
			}
			
			var	props = ao.getProperties();
			
			if (props && !!props.get('hideLocation')) {
				//logger(Level.FINE, 'Hiding location on "{0}"', ao.getName());
				return '';
			}
			
			var loc = vars.get('gpsLocation');
			
			if (loc) {
				// jAlbum's standard var
				return loc;
			}
			
			loc = vars.get('location');
			
			if (loc && validLocation.test(loc)) {
				if (isWriteXmp) {
					var mgr = ao.getXmpManager();
					// Slide variable :: saving to jAlbum's own format
					if (mgr != null && mgr.getGpsLocation() == null) {
						mgr.setGpsLocation(loc);
						mgr.save();
					}
				}
				return loc;
			}
	
			return '';
		};

	/*
	 * Checks if AlbumObject has GPS data attached to
	 */
	 
	hasLocation = function(ao) {
			var vars = ao.getVars();
			
			if (!vars) {
				return false;
			}
			
			var	props = ao.getProperties();
			
			if (props && !!props.get('hideLocation')) {
				return false;
			}
			
			var loc = vars.get('location');
			
			if (loc && /[+-]?\d+\.?\d*,\s*[+-]?\d+\.?\d*/.test(loc)) {
				return true;
			}
			
			if (vars.get('gpsLocation')) {
				return true;
			}
			
			vars = vars.get('meta');
			
			return vars && vars.get('GPS.GPS Latitude');
		};

	/*
	 * Reading fotodata by matching template
	 */
	 
	getPhotodata = function(ao, template, wrap, showLabel) {
			var wrap = (typeof wrap === UNDEF || !wrap)? '' : wrap,
				template = (typeof template === UNDEF)? 'photographer|artist|Artist|Owner|Copyright|Iptc.By-line|Iptc.Copyright Notice, Xmp.Creator, Xmp.Title, objectName, Xmp.Subject, Xmp.Description, keywords|Iptc.keywords, Xmp.Format, Xmp.Rights, Xmp.Identifier, Xmp.Label, Country/Primary Location, Province/State, City, Sub-location, originalDate|Date/Time Original|Date/Time|CreateDate|ModifyDate, camera|Model, lens|Lens|Xmp.Lens-Information|Canon Makernote.Unknown tag (0x0095), focalLength35mm|focusDistance|Focal Length|Focallength, SubjectDistance, meteringMode|Metering Mode, isoEquivalent|ISO Speed Ratings, exposureTime|Exposure Time|Shutter Speed Value|ShutterSpeedValue, Aperture Value|aperture|F-Number|FNumber|Aperturevalue, Exposure Bias Value, Exposure Program|Exposureprogram|Exposure Mode, Xmp.SceneType, White Balance|WhiteBalance, Xmp.ColorSpace, Xmp.LightSource, flash|Flash, resolution' : template,
				data = new Array(),
				val, 
				lbl,
				o,
				vars = ao.getVars(),
				keys,
				key; 
				
			for each (keys in template.split(/[,;\r\n]+\s*/)) {
				
				for each (key in keys.split(/\|/)) {
					
					// commented out key
					if (!key.length || key.charAt(0) === '#') {
						continue;
					}
					
					if (key === 'aperture') {
						val = getFstop(vars[key]);
					} else if (key === 'rights') {
						val = getCopyrightURL(vars);
					} else if (val = vars[key]) {
						val += ''; // to String
					}
					
					if (val || (val = getMeta(vars, key) + '')) {
						/*
						if (key === 'resolution' && val === ' x ') {
							continue;
						} else if (val.startsWith('Flash did not fire')) {
							val = getText('noFlash', 'No');
						}
						*/
						
						// Show with label
						if (showLabel) {
							// Translate label
							if (key === 'Canon Makernote.Unknown tag (0x0095)') {
								key = 'Lens';
							}
							
							lbl = getExifLabel(key);
							
							data.push('<b>' + (lbl? lbl : key) + '</b> ' + '<i>' + val + '</i>');
							
						} else {
							// Only the value
							data.push(val);
						}
						
						break;
					}
				}
			}
			
			if (data.length) {
				if (wrap) {
					if (wrap.indexOf(' ') > 0) {
						var n = wrap.substring(0, wrap.indexOf(' '));
						return '<' + wrap + '>' + data.join('</' + n + '><' + wrap + '>') + '</' + n + '>';
					}
					return '<' + wrap + '>' + data.join('</' + wrap + '><' + wrap + '>') + '</' + wrap + '>';
				}
				return data.join(' &middot; '); 
			}
			
			return '';
		};
		
	/*
	 * Checking projection type
	 */
	 
	checkProjectionType = function(ao) {
			var m = ao.getVars().get('meta'),
				s;
			
			if (m && (s = m.get('xmp.GPano:ProjectionType'))) {
				return s;
			}
			
			return '';
		};
		
	/*
	 * Checking if there's a soundclip exists and copies if it does
	 */
	 
	checkSoundClip = function(ao) {
			var srcName,
				dstName,
				src = ao.getFile(),
				dst;
			
			if (src && (srcName = src.getPath())) {
				
				srcName = srcName.replace(/\.(\w+)$/, '.mp3');
				
				src = new File(srcName);
				
				if (src && src.exists()) {
					var i = (srcName.lastIndexOf('/') + 1) || (srcName.lastIndexOf('\\') + 1);
					
					dstName = srcName.substring(i);
					dst = new File(outputDirectory, slidesDir);
					
					if (!dst.exists()) {
						dst.mkdirs();
					}
					
					dst = new File(dst, dstName);
					
					try {
						//print('IO.copyFile(' + src + ',' + dst + ')');
						IO.copyFile(src, dst);
						return slidesDir + '/' + encodeURIComponent(dstName);
					} catch(e) {
						logger(Level.WARNING, 'Error copying file: {0}', src.getName());
					}
				}
			}
			
			return '';
		};
		
	/*
	 * Copying an albumObject to the current output folder, returns the filename encoded 
	 */
	 
	copyOriginal = function(ao) {
			var src = ao.getFile(),
				dst = new File(outputDirectory, src.getName());
			
			if (dst.exists()) {
				return encodeURIComponent(src.getName());
			}
			
			if (src && src.exists()) {
				try {
					Files.copy(src.toPath(), dst.toPath());
					//IO.copyFile(src, dst);
					return encodeURIComponent(src.getName());
				} catch(e) {
					logger(Level.WARNING, 'Error copying file: {0}', src.getName());
				}
			}
			
			return '';
		},
		
		
	/*
	 *	Human-readable file size
	 */
			
	formatFileSize = function(s) {
			
			if (s === null) {
				return '';
			}
			
			if (s >= 1073741824) { 
				n = s / 1073741824.0; 
				p = 'GB'; 
			} else if (s >= 1048576) { 
				n = s / 1048576.0; 
				p = 'MB'; 
			} else if (s >= 1024) { 
				n = s / 1024.0; 
				p = 'kB'; 
			} else { 
				n = s; 
				p = 'B'; 
			}
			
			return n.toFixed(2) + ' ' + p;
		};
	 
	/*
	 * Process a template string :: replacing ${variable} keys
	 * Usage: processTemplate(ao, "${fileName} is ${fileSize}");
	 * Returns: "IMG0001.JPG is 3.2MB"
	 */
	 
	processTemplate = function(ao, templ, keepEmptyTags) {
			if (!ao || !templ) {
				return '';
			}
			
			var vars = ao.getVars(),
				sb,
				
				doProcess = function(templ) {
						
						if (templ.indexOf('${fileSize}') >= 0) {
							// Has file size
							templ = templ.replace(/\${fileSize}/g, formatFileSize(vars.get('fileSize') || ''));
						}
						
						if (templ.indexOf('${meta.') >= 0) {
							// Has meta reference
							var	m,
								meta,
								val;
								
							meta = vars.get('meta');
							
							if (meta !== null) {
							
								while (m = templ.match(/\${meta.([^}]+)}/)) {
									val = meta.get(m[1]);
									if (val !== null && m[1].endsWith('Keywords')) {
										val = val.replace(/;/g, ', ');
									}
									//logger(Level.FINER, 'Processing {0}: meta[{1}] = "{2}"', [ao.getName(), m[1], val]);
									templ = templ.replace(new RegExp('\\${meta\\.' + m[1] + '}', 'g'), (val === null)? '' : val);
								}
								
							} else {
								
								templ = templ.replace(/\${meta\..+}/g, '');
							}
						}
						
						try {
							return engine.processSection(new Section(templ), vars);
						} catch(e) {
							logger(Level.WARNING, 'Parsing error in file "{0}": {1}\nTemplate "{2}"', [ao.getName(), e, templ]);
						}
						
						return '';
					};
					
			templ = stripCrlf(templ.trim());
			sb = doProcess(templ);
			//print(sb);
			
			if (sb && sb.indexOf('${') >= 0) {
				// Nested variables
				sb = doProcess(sb);
			}	
			
			return keepEmptyTags? sb : stripEmptyHTML(sb);
		};
		
	/*
	 * Shortcut for processing thumbnail captions
	 */
	 
	getThumbCaption = function(ao) {
			if (typeof thumbCaptionTemplate === UNDEF || !thumbCaptionTemplate) {
				return ao.getVars().get('comment');
			}
			return processTemplate(ao, thumbCaptionTemplate);
		};

	/*
	 * Shortcut for processing image captions
	 */
	 
	getCaption = function(ao) {
			if (typeof imgCaptionTemplate === UNDEF || !imgCaptionTemplate) {
				return ao.getVars().get('comment');
			}
			return processTemplate(ao, imgCaptionTemplate);
		};
	
	/*
	 * Preprocess shop options
	 */
	 
	getShop = function(ao) {
			var so = ao.getVars.get('shopOptions').trim();
			
			if (so && so !== '-') {
				return cleanup(so.replace(/[\r?\n]/g, '::'));
			}
			return '';
		};

	/*
	 * Returns Mostphotos Id
	 */
	 
	getMostphotosId = function(ao) {
			var id = ao.getProperties().get('mostphotosImageId');
			
			return id? (id + '') : '';
		};
	
	/*
	 * Path from root to the current folder or object
	 * Always ends with '/' unless root folder
	 * returns unencoded string
	 */
	 
	getRelPath = function(ao) {
			var p = ao.getPathFromRoot();
			
			if (!ao.isFolder()) {
				return p.replace(/(\.htt)$/, pageExt);
			}
			
			return p? (p + '/') : '';
		};
		
	/*
	 * Path to root from the current folder or object
	 */
	 
	getRootPath = function(ao) {
			var p = '';
			
			if (ao) {
				if (!ao.isFolder()) {
					ao = ao.getParent();
				}
				
				while ((ao = ao.getParent()) !== null) {
					p += '../';
				} 
			}
			
			return p;
		};
	
	/*
	 * 	Relative path between album objects: path/to/folder/ or ../../path/to/folder/
	 *	always ends with '/' unless current folder
	 */
	 
	getRelativePath = function(from, to) {
			
			if (!from || !to || from === to) {
				// Same or unexisting folder
				return '';
			}
			
			if (from === rootFolder) {
				// From album root
				return getRelPath(to);
			}
			
			if (to === rootFolder) {
				// To album root
				return getRootPath(from);
			}
			
			// Generic case
			
			var fp = from.getPathFromRoot().split('/'),
				tp = to.getPathFromRoot().split('/');
			
			while (fp.length && tp.length && fp[0] === tp[0]) {
				fp.shift();
				tp.shift();
			}
			
			return getParentFolderLink(fp.length) + (tp.length? (tp.join('/') + '/') : '');
		};
	
	/*
	 * Path to current folder in absolute form
	 */
	 
	getFolderPath = function(ao) {
			return isUrlEncode? (basePath + encodeAsJava(ao.getPathFromRoot())) : (basePath + ao.getPathFromRoot());
		};
	
	getParentFolderLink = function(depth) {
			return (depth > 0)? '../../../../../../../../../../../../../../../../../../../../'.substring(0, 3 * depth) : '';
		};
		
	/*
	 * Clickable path to the current folder
	 */
	 
	getBreadcrumbPath = function(folder, pathSep) {
		
			if (folder === rootFolder) {
				return '';
			}
			
			var pathSep = (typeof pathSep === UNDEF)? '' : pathSep,
				prefix = '',
				d = 0,
				f = new Array(),
				sb = '';
				
			while (folder = folder.getParent()) {
				f.splice(0, 0, shorten(folder.getTitle() || folder.getName(), 64, true));
				d++;
			}
			
			for (var i = 0; i < d; i++) {
				if (i > 0 && pathSep) {
					sb += pathSep;
				}
				sb += '<a href="' + getParentFolderLink(d - i) + indexName + '" class="' + ((i > 0)? 'icon-arrow-left' : 'icon-home') + '">' + f[i] + '</a>';
			}
			
			return sb;
		};
	
	/*
	 * Returns the thumbnail path from the current folder for any albumObject
	 */
	 
	getThumbPath = function(ao) {
			var cat = ao.getCategory();
				
			if (cat === Category.webPage) {
				// Webpage
				return resPath + '/htt.png';
			}
			
			// Folder or weblocation
			var vars = ao.getVars(),
				tp = vars.get('iconPath');
			
			if (tp) {
				// No thumbnail, only icon
				return (cat === Category.folder)? (resPath + '/' + defaultFolderIconName) : tp;
			} 
			
			tp = vars.get('thumbPath');
			
			if (currentFolder === ao.getParent()) {
				// We're in the current folder
				return tp;
			}
			
			//logger(Level.WARNING, 'getThumbPath("{0}") from "{1}" => "{2}"', [ ao.getPathFromRoot(), currentFolder.getPathFromRoot(), [ getRelativePath(currentFolder, ao.getParent()), tp ].join('/') ]);
			
			return encodeAsJava(getRelativePath(currentFolder, ao.getParent())) + tp;
		};
		
	/*
	 * Returns an array with shuffled numbers of 0 ... max-1
	 */
	 
	getShuffledNumbers = function(range, max) {
		var max,
			a = [], 
			t;
			
			max = (typeof max !== UNDEF)? Math.min(range, max) : range;
			
			for (var i = 0; i < range; i++) {
				a[i] = i;
			}
			
			if (range > 1 && max > 1) {
				
				for (var r, i = range - 1, mx = range - max; i >= mx; i--) {
					r = Math.floor(Math.random() * i);
					t = a[r];
					a[r] = a[i];
					a[i] = t;
				}
			}
			
			return a.slice(-max);
		};
		
	/*
	 * Returns random objects from a folder
	 */
	 
	getRandomChildren = function(folder, max, types, skipFolderThumb, recursive) {
			var max = (typeof max !== UNDEF)? max : 3,
				types = (typeof types !== UNDEF)? types : 'image,video',
				recursive = (typeof recursive !== UNDEF)? recursive : false,
				skipFolderThumb = (typeof skipFolderThumb !== UNDEF)? skipFolderThumb : true,
				imgs,
				rnd,
				r = [],
				rep = folder.getRepresentingAlbumObject();
			
			if (typeof types === 'boolean') {
				
				if (typeof skipFolderThumb !== UNDEF) {
					recursive = skipFolderThumb;
				}
				
				skipFolderThumb = types;
				types = 'image,video';
			}
			
			if (rep !== null) {
				rep = rep.getName();
			} else {
				skipFolderThumb = false;
			}
			
			imgs = getChildrenOfType(folder, types, max, skipFolderThumb);
				
			if (imgs.length < max && recursive) {
				var folders = getChildrenOfType(folder, 'folder');
				
				if (folders.length) {
					for (var i = 0; (i < folders.length) && (imgs.length < max); i++) {
						//logger(Level.WARNING, 'Adding {0}, max {1}', [ folders[i].getName(), max - imgs.length ]);
						imgs = imgs.concat(getRandomChildren(folders[i], max - imgs.length, types, skipFolderThumb));
					}
				}
			}
			
			rnd = getShuffledNumbers(imgs.length, Math.min(max, imgs.length));
			
			for (var i = 0, j = 0, mx = Math.min(rnd.length, max); i < mx; i++, j++) {
				if (typeof imgs[rnd[j]] !== UNDEF) {
					if (j < rnd.length) {
						r.push(imgs[rnd[j]]);
					} else {
						break;
					}
				}
			}
			
			return r;
		};
		
	/*
	 * Root navigation = pages + folders + home link if exists
	 * 		co = currentObject
	 */
	 
	getRootNavigation = function(co, home, sep, includeFolders, includePages, includeWebLocations) {
			var sb = new Array(),
				vars,
				cat,
				t,
				path,
				ask,
				root = getRootPath(co),
				includeFolders = (typeof includeFolders === UNDEF)? true : includeFolders,
				includePages = (typeof includePages === UNDEF)? true : includePages,
				includeWebLocations = (typeof includeWebLocations === UNDEF)? true : includeWebLocations;
	
			for each (ao in rootFolder.getChildren()) {
				if (ao.isIncluded()) {
					cat = ao.getCategory();
					if ((includePages && cat === Category.webPage) || 
						(includeFolders && (cat === Category.folder && !ao.isHidden())) ||
						(includeWebLocations && cat === Category.webLocation)) {
						vars = ao.getVars();
						path = getExternalLink(vars) || (((cat === Category.webLocation)? '' : root) + vars.get('closeupPath'));
						ask = vars.get('askPermission');
						t = shorten(vars.get('title'), 32, true);
						sb.push('<a href="' + path + '"' + 
								((ask !== null)?  (' data-ask-permission="' + ask + '"') : '') + 
								(co.isWithin(ao)? ' class="actual"' : '') + 
							'>' + t + '</a>');
					}
				}
			}
	
			if (sb.length) {
				return ((home && (!root || co.getCategory() === Category.webPage))?
					'<a href="' + root + indexName + '" class="home">' + getText('home') + '</a>'
					:
					'') +
					sb.join(sep || '');
			}
			
			return '';
		};
	
	/*
	 * Get pages from the album root
	 */
	 
	getRootPages = function(co, sep) {
			var sb = new Array(),
				vars,
				cat,
				t,
				path,
				root = getRootPath(co);
	
			for each (ao in rootFolder.getChildren()) {
				if (ao.isIncluded() && ao.getCategory() === Category.webPage) {
					vars = ao.getVars();
					path = getExternalLink(vars) || (root + vars.get('closeupPath'));
					t = shorten(vars.get('title'), 32, true);
					sb.push('<a href="' + path + '"' + 
						(co.isWithin(ao)? ' class="actual"' : '') + '>' + t + '</a>');
				}
			}

			return sb.join(sep || '');
		};
		
	/*
	 * Get multi-level navigation menu conforming to Zurb foundation 6 structure
	 */
	 
	getDropdownMenu = function(folder, current, includeFolders, includePages, includeWebLocations, depth, home) {
			var home = (typeof home === UNDEF)? false : home,
				includeFolders = (typeof includeFolders === UNDEF)? true : includeFolders,
				includePages = (typeof includePages === UNDEF)? true : includePages,
				includeWebLocations = (typeof includeWebLocations === UNDEF)? true : includeWebLocations,
				depth = (typeof depth === UNDEF)? 4 : depth,
				root = getRootPath(current),
				sb,
				
				getSubMenu = function(folder, depth) {
						var	ao,
							relp = getRelPath(folder),
							vars,
							cat,
							t,
							cp,
							ask,
							path,
							subMenu,
							sb = new Array();

						if (folder.isWithin(current)) {
							path = simplifyUrl(root, relp);
						} else {
							path = root + relp;
						}
			
						for each (ao in folder.getChildren()) {
							
							if (ao.isIncluded()) {
								cat = ao.getCategory();
				
								if (includeFolders && cat === Category.folder && !ao.isHidden() ||
									includePages && cat === Category.webPage ||
									includeWebLocations && cat === Category.webLocation) {
									//print(ao.getName());
									vars = ao.getVars();
							
									cp = vars.get('closeupPath');
									
									if (cp && indexName !== cp) {
										
										t = shorten(vars.get('title'), 32, true);
										ask = vars.get('askPermission');
										subMenu = (cat === Category.folder && depth > 0)? getSubMenu(ao, depth - 1) : '';
										cls = [ current.isWithin(ao)? 'actual-branch' : '', 
												(current == ao)? 'actual' : '', 
												subMenu? 'has-submenu' : '' 
											].filter(Boolean).join(' ');
										
										sb.push('<li' + (cls? (' class="' + cls + '"') : '') + '>' +
											'<a href="' + (getExternalLink(vars) || (((cat === Category.webLocation)? '' : encodeURI(path)) + cp)) + '"' +
													((ask !== null)?  (' data-ask-permission="' + ask + '"') : '') + 
													'>' + t + 
												'</a>' + 
												(subMenu? ('<ul class="menu">' + subMenu + '</ul>') : '') +
											'</li>');
									}
								}
							}
						}
			
						return sb.length? sb.join('') : '';
					};
			
			sb = getSubMenu(folder, depth);
			
			if (sb) {
				// Top level
				if (folder == rootFolder) {
					var t = shorten(folder.getTitle() || folder.getName(), 32, true);
					return '<ul class="dropdown menu" data-dropdown-menu>' + 
							(homepageAddress? ('<li><a class="icon-home" href="' + homepageAddress + '" data-tooltip title="' + (homepageLinkText || getText('home')) + '"></a></li>') : '') +
							(home? ('<li><a class="icon-' + (homepageAddress? 'arrow-up':'home') + '" href="' + root + indexName + '" data-tooltip title="' + getText('mainPage') + '"></a></li>') : '') +
							sb +
						'</ul>';
				} 
					
				// Subfolder
				return '<ul class="menu">' + sb + '</ul>';
			}
			
			// Nothing to show
			return '';
		};

	/*
	 * Get multi-level navigation tree
	 */
	 
	getTree = function(folder, includeFolders, includePages, includeWebLocations, depth) {
			var includeFolders = (typeof includeFolders === UNDEF)? true : includeFolders,
				includePages = (typeof includePages === UNDEF)? true : includePages,
				includeWebLocations = (typeof includeWebLocations === UNDEF)? true : includeWebLocations,
				depth = (typeof depth === UNDEF)? 3 : depth,
				root = getRootPath(currentFolder),
				sb,
				
				getSubTree = function(folder, depth) {
						var ao,
							relp = getRelPath(folder),
							vars,
							cat,
							t,
							cp,
							ask,
							path,
							subTree,
							sb = new Array(),
							cls;

						if (folder.isWithin(currentFolder)) {
							path = simplifyUrl(root, relp);
						} else {
							path = root + relp;
						}
						//print(folder.getName() + ': Path=' + path + ' Root=' + root + ' Relp=' + relp);
						for each (ao in folder.getChildren()) {
							
							if (ao.isIncluded()) {
								cat = ao.getCategory();
				
								if (includeFolders && cat === Category.folder && !ao.isHidden() ||
									includePages && cat === Category.webPage ||
									includeWebLocations && cat === Category.webLocation) {
									//print(ao.getName());
									vars = ao.getVars();
									
									cp = vars.get('closeupPath');
									
									if (cp && indexName !== cp) {
										
										t = shorten(vars.get('title'), 32, true);
										ask = vars.get('askPermission');
										subTree = (cat === Category.folder && depth > 0)? getSubTree(ao, depth - 1) : '';
										cls = [ (currentObject == ao)? 'actual' : '', subTree? 'has-submenu' : '' ].filter(Boolean).join(' ');
										
										sb.push('<li' + (cls? (' class="' + cls + '"') : '') + '>' +
											'<a href="' + (getExternalLink(vars) || (((cat === Category.webLocation)? '' : encodeURI(path)) + cp)) + '"' +
												((ask !== null)?  (' data-ask-permission="' + ask + '"') : '') + 
													'>' + t + 
												'</a>' + 
												subTree +
											'</li>');
									}
								}
							}
						}
			
						return sb.length? ('<ul class="menu">' + sb.join('') + '</ul>') : '';
					};

			sb = getSubTree(folder, depth);
			
			if (sb) {
				// Top level
				if (folder == rootFolder) {
					var t = shorten(folder.getTitle() || folder.getName(), 32, true);
					return '<div class="home' + 
						((rootFolder == currentFolder)? ' actual' : '') + '"><a href="' + (root? root : './') + indexName + '">' + t + '</a>' +
						'</div>' + sb;
				} 
					
				// Subfolder
				return sb;
			}
			
			// Nothing to show
			return '';
		};

	/*
	 * Get the whole navigation menu
	 */
	 
	getNavigation = function(folder, co, relPath, depth, home, excludeFolders) {
			var home = (typeof home === UNDEF)? false : home,
				excludeFolders = (typeof excludeFolders === UNDEF)? false : excludeFolders,
				depth = (typeof depth === UNDEF)? 3 : depth,
				relp = (typeof relPath === UNDEF)? '' : (relPath + '/'),
				sb = new Array(),
				vars,
				cat,
				t,
				path,
				ask,
				cp,
				root = getRootPath(co);
	
			if (home) {
				sb.push('<li class="controls home"><a href="' + root + indexName + '" title="' + getText('home') + '">&nbsp;</a></li>');
			}
			
			for each (ao in folder.getChildren()) {
				
				if (ao.isIncluded()) {
					cat = ao.getCategory();
				
					if (cat === Category.webPage || 
						(!excludeFolders && (cat === Category.folder && !ao.isHidden() || cat === Category.webLocation))) {
						
						vars = ao.getVars();
						cp = vars.get('closeupPath');
						path = getExternalLink(vars) || (((cat === Category.webLocation)? '' : (root + relp)) + cp); 
						
						if (path && indexName !== path) {
							
							t = shorten(vars.get('title'), 32, true);
							
							ask = vars.get('askPermission');
							
							if (cat === Category.webPage && t === 'NewPhotos') {
								t = getText('newPhotos');
							}
							
							sb.push('<li' + (co.isWithin(ao)? ' class="actual"' : '') + '>' + 
								'<a href="' + path + '"' +
									((ask !== null)?  (' data-ask-permission="' + ask + '"') : '') + 
									'>' + t + '</a>' +				
									((cat === Category.folder && depth)?
										getNavigation(ao, co, relp + cp.substring(0, cp.length - indexName.length - 1), depth - 1) 
										: 
										''
									) +
								'</li>');
						}
					}
				}
			}
	
			return sb.length? ('<ul>' + sb.join('') + '</ul>') : '';
		};
		
	/*
	 * Has any displayable image? (folders only)
	 */
	 
	hasImage = function(folder) {
			var cnt = JAlbumUtilities.countCategories(folder, false);
			
			return cnt.getCount(Category.image) > 0 || cnt.getCount(Category.video) > 0 || cnt.getCount(Category.other) > 0;
		}
		
	/*
	 * Returns the first folder object in a folder
	 */
	 
	getFirstFolder = function(folder, withImage) {
			var wi = (typeof withImage !== UNDEF)? withImage : false;
		
			if (folder) {
				for (var ch = folder.getChildren(), i = 0; i < ch.length; i++) {
					if (ch[i].isFolder() && ch[i].isIncluded() && !ch[i].isHidden()) {
						if (!wi || hasImage(ch[i])) {
							return ch[i];
						}
					}
				}
			}
			
			return null;
		};
		
	/*
	 * Returns the last folder object in a folder
	 */
	 
	getLastFolder = function(folder, withImage) {
			var wi = (typeof withImage !== UNDEF)? withImage : false;
		
			if (folder) {
				for (var ch = folder.getChildren(), i = ch.length - 1; i >= 0; i--) {
					if (ch[i].isFolder() && ch[i].isIncluded() && !ch[i].isHidden()) {
						if (!wi || hasImage(ch[i])) {
							return ch[i];
						}
					}
				}
			}
			
			return null;
		};
		
	/*
	 * Returns the first folder object N level deep
	 */
	 
	getFirstDeepFolder = function(folder, level, withImage) {
			var wi = (typeof withImage !== UNDEF)? withImage : false;
		
			while (folder && level >= 0) {
				if (folder = getFirstFolder(folder, wi)) {
					return folder;
				}
				level--;
			}
			
			return folder;
		};
		
	/*
	 * Returns the last folder object N level deep
	 */
	 
	getLastDeepFolder = function(folder, level, withImage) {
			var wi = (typeof withImage !== UNDEF)? withImage : false;
		
			while (folder && level >= 0) {
				if (folder = getLastFolder(folder, wi)) {
					return folder;
				}
				level--;
			}
			
			return folder;
		};
		
	/*
	 * Returns the albumObject of the previous folder if exists
	 */
	 
	getPreviousFolder = function(ao, maxLevel, withImage) {
		
			if (!ao) {
				return;
			}
			
			var wi = (typeof withImage !== UNDEF)? withImage : false,
				lvl = (typeof maxLevel !== UNDEF)? maxLevel : 0,
				folder = ao.getParent(),
				children;

			if (folder && (children = folder.getChildren())) {
				// Find folders next to current and their subfolders
				for (var i = children.indexOf(ao) - 1; i >= 0; i--) {
					if (children[i].isFolder() && children[i].isIncluded() && !children[i].isHidden()) {
						if (!wi || hasImage(children[i])) {
							// Has image or no images needed
							return children[i];
						} else if (lvl && (folder = getLastDeepFolder(children[i], lvl - 1, true))) {
							// Go deeper
							return folder;
						}
					}
				}
				
				if (lvl && (folder = getPreviousFolder(folder, lvl - 1, wi))) {
					return folder;
				}
			}
			
			return null;
		};
		
	/*
	 * Returns the albumObject of the next folder if exists
	 */
	
	getNextFolder = function(ao, maxLevel, withImage, loop) {
		
			if (!ao) {
				return null;
			}
			
			var	folder = ao.getParent();
			
			if (!folder) {
				return null;
			}
			
			var wi = (typeof withImage !== UNDEF)? withImage : false,
				lvl = (typeof maxLevel !== UNDEF)? maxLevel : 0,
				loop = (typeof loop !== UNDEF)? loop : false,
				children = folder.getChildren();
			
			if (!children) {
				return level? getNextFolder(folder, lvl - 1, wi, loop) : null;
			}
			
			var ci = children.indexOf(ao);

			// Find folders next to current and their subfolders
			for (var i = ci + 1; i < children.length; i++) {
				if (children[i].isFolder() && children[i].isIncluded() && !children[i].isHidden()) {
					if (!wi || hasImage(children[i])) {
						// Has image or no images needed
						return children[i];
					} else if (lvl && (folder = getFirstDeepFolder(children[i], lvl - 1, wi))) {
						// Go deeper
						return folder;
					}
				}
			}
				
			// Going up one level in none found and jump levels allowed
			if (lvl && (folder = getNextFolder(folder, lvl - 1, wi, loop))) {
				return folder;
			}
			
			// Start from the beginning if looped
			for (var i = 0; i < ci; i++) {
				if (children[i].isFolder() && children[i].isIncluded() && !children[i].isHidden()) {
					if (!wi || hasImage(children[i])) {
						// Has image or no images needed
						return children[i];
					} else if (lvl && (folder = getFirstDeepFolder(children[i], lvl - 1, wi))) {
						// Go deeper
						return folder;
					}
				}
			}
			
			return null;
		};

	/*
	 * Returns the link to the first image in a folder
	 */
	
	getFirstImage = function(folder) {
		
			if (folder) {
				for each (ao in folder.getChildren()) {
					if (!ao.isFolder() && ao.isIncluded() && ao.getCategory() !== Category.webPage) {
							return ao;
					}
				}
			}
			
			return null;
		};
	
	/*
	 * Returns the link to the last image in a folder
	 */
	
	getLastImage = function(folder) {
		
			if (folder) {
				var ao = folder.getChildren();
				
				for (var i = ao.length - 1; i >= 0; i--) {
					if (!ao[i].isFolder() && ao[i].isIncluded()) {
						if (ao[i].getCategory() !== Category.webPage) {
							return ao[i];
						}
					}
				}
			}
			
			return null;
		};

	/*
	 * Getting the sitemap as <ul> list of links and descriptions / page comments
	 */	
	 
	 getSitemap = function(folder, relPath, desc, thumbs) {
			var root,
				sm,
					
				getFolder = function(folder) {
						var	s,
							sm,
							vars,
							cat,
							path,
							link,
							t,
							tp,
							ask,
							sb = new Array();
												
						for each (ao in folder.getChildren()) {
							
							if (ao.isIncluded()) {
								
								cat = ao.getCategory();
				
								if (cat === Category.webPage || (cat === Category.folder && !ao.isHidden()) || cat === Category.webLocation) {
									vars = ao.getVars();
									t = vars.get('label');
											
									if (t !== 'Sitemap') {
										
										ask = vars.get('askPermission');
										link = getLinkTo(ao);
										
										s = '';
										
										// Thumbnail
										if (thumbs) {
											tp = getThumbPath(ao);
											s += '<a href="' + link + '" class="thumb' + 
													(tp.endsWith('.png')? ' icon' : '') +
												'"><img src="' + tp + '" alt="' + t + '"></a>';
										}
										
										// Link on the title
										s += '<div>' +
												'<a href="' + link + '"' +
													((ask !== null)? (' data-ask-permission="' + ask + '"') : '') +
													'>' + shorten(vars.get('title'), 32, true) + 
												'</a>';
										
										// Description
										if (desc) {
											t = (cat !== Category.folder)? vars.get('comment') : ao.getComment(); 
											if (t && (t = shorten(t, 160))) {
												s += '<small>' + t + '</small>';
											}
										}
										
										// Recursive for subfolders
										if ((cat === Category.folder) && (sm = getFolder(ao))) {
											s += '<ul>' + sm + '</ul>';
										}
										
										s += '</div>';
				
										sb.push('<li>' + s + '</li>');
									}
								}
							}
						}
						
						return sb.join('');
					};
				
			if (typeof folder === 'object') {
				var desc = (typeof desc === UNDEF)? true : desc,
					thumbs = (typeof thumbs === UNDEF)? true : thumbs;
				root = getRootPath(currentFolder);
			} else {
				var desc = (typeof folder === UNDEF)? true : folder,
					thumbs = (typeof relPath === UNDEF)? true : relPath;
				folder = rootFolder;
				relPath = '';
				root = '';
			}
			
			sm = getFolder(folder);
			
			return sm.length? ('<ul>' + sm + '</ul>') : '';
		};
		
	
	/*
	 * Getting the sitemap as <ul> list of links and descriptions / page comments
	 */
	 
	getCatalogue = function(folder, relPath, desc, thumbs, pages, weblocs) {
			var folder = folder || rootFolder,
				desc = (typeof desc === UNDEF)? true : desc,
				thumbs = (typeof thumbs === UNDEF)? false : thumbs,
				pages = (typeof pages === UNDEF)? true : pages,
				weblocs = (typeof weblocs === UNDEF)? false : weblocs,
				catalogue = new Array(),
				root = getRootPath(folder),
				sb = '',
			
				addFolder = function(folder, relPath) {
					var	relp = relPath? (relPath + '/') : '',
						vars,
						cat,
						s;
				
						for each (ao in folder.getChildren()) {
							
							cat = ao.getCategory();
							
							if (ao.isIncluded()) {
								
								if ((cat === Category.folder && !ao.isHidden()) ||
									(pages && cat === Category.webPage && ao.getName() !== 'Contents.htt') || 
									(weblocs && cat === Category.webLocation)) {
									
									vars = ao.getVars();
									
									o = {
											link:		getLinkTo(ao),
											title:		shorten(vars.get('title'), 32, true)
										};
										
									if (desc) {
										o.desc = shorten(stripHTML((cat === Category.webPage)? vars.get('comment') : ao.getComment()));
									}
									
									if (thumbs) {
										if ((s = vars.get('iconPath')) !== null) {
											o.icon = true;
											o.thumb = root + ((cat === Category.folder)? ('res/' + defaultFolderIconName) : s);
										} else {
											o.thumb = relp + vars.get('thumbPath');
										}
									}
									
									if ((s = vars.get('askPermission')) !== null) {
										o['ask'] = s || '';
									}
									
									catalogue.push(o);
										
									if (cat === Category.folder) {
										addFolder(ao, relp + ao.getName());
									}
								}
							}
						}
					};

			addFolder(folder, relPath);
	
			if (catalogue) {
				
				catalogue.sort(function(o1, o2) {
					return o1.title.localeCompare(o2.title, locale);
				});
				
				var lch = '!', 
					cch,
					o;
						
				for (var i = 0; i < catalogue.length; i++) {
					
					o = catalogue[i];
					
					cch = o.title.charAt(0).toUpperCase();
					
					if (cch !== lch) {
						if (sb) {
							sb += '</ul></div>';
						}
						sb += '<div class="one-letter"><h2>' + cch + '</h2><ul>';
						lch = cch;
					}
					
					sb += '<li>';
					
					if (o.hasOwnProperty('thumb')) {
						sb += '<a href="' + o.link + '"' + 
								(o.hasOwnProperty('ask')? (' data-ask-permission="' + o.ask + '"') : '') + 
								' class="thumb' + (o.hasOwnProperty('icon')? ' icon' : '') +
							'"><img src="' + o.thumb + '" alt="' + o.title.replace(/"/g, '&#34;') + '"></a>';
					}
					
					sb += '<div><a href="' + o.link + '">' + o.title + '</a>';
					
						if (o.hasOwnProperty('desc') && o.desc) {
							sb += '<small>' + o.desc + '</small>';
						}
					
					sb += '</div></li>';
				}
				
				if (sb) {
					sb += '</ul></div>';
				}
			}
			
			return sb;
		};
		
	/*
	 * Getting the calendar
	 */	
	 
	 getCalendar = function(folder, relPath, subfolders, thumbs, dateSource) {
			var root,
				sm,
				dates = new Array(),
					
				addImage = function(d, ao, path) {
						var d = new JDate(d);
						
						if (typeof d === UNDEF) {
							return;
						}
						
						var	year = d.getYear() + 1900,
							month = d.getMonth() + 1,
							day = d.getDate(),
							ml,
							vars;
							
						ml = LocalDate.of(year, month, day).lengthOfMonth();
						d.setDate(1);
						
						if (!dates[year]) {
							dates[year] = [];
						}
						
						if (!dates[year][month]) {
							dates[year][month] = {
									start:		d.getDay() - firstDayOfWeek,
									days:		new Array(ml),
									count:		new Array(ml)
								};
							
						}
						
						if (!dates[year][month].count[day] || dates[year][month].count[day] < thumbs) {
							vars = ao.getVars();
							
							if (!dates[year][month].days[day]) {
								dates[year][month].days[day] = new Array();
							}
							
							dates[year][month].days[day].push({
									link:		encodeAsJava(path) + indexName + '#img=' + encodeURIComponent(vars.get('fileName')),
									thumb:		encodeAsJava(path) + vars.get('thumbPath'),
									width:		vars.get('thumbWidth') / maxThumbWidth,
									title:		vars.get('title')
								});
							
							//print(year + '-' + month + '-' + day + ': ' + vars.get('fileName'));
						}
							
						dates[year][month].count[day] = (dates[year][month].count[day] || 0) + 1;
					
					},
					
				getFolder = function(folder) {
						var	cat,
							d,
							path = getRelativePath(currentFolder, folder);
												
						for each (ao in folder.getChildren()) {
							
							if (ao.isIncluded()) {
								cat = ao.getCategory();
				
								if (cat === Category.folder) {
									
									if (subfolders && !ao.isHidden()) {
										getFolder(ao);
									}
									
								} else if (cat !== Category.webPage && cat !== Category.webLocation) {
									
									switch (dateSource) {
										
										case 'added':
											d = ao.getWhenAdded();
											break;
											
										case 'dateTaken':
											d = getEpochDate(ao, false);
											break;
											
										case 'fileModified':
											d = ao.getLastModified();
											break;
											
										default:
											d = null;
									}
									
									if (d) {
										addImage(d, ao, path);
									}
								}	
							}
						}
					},
					
					
				writeCalendar = function() {
						var sb = '',
							param = '#date=',
							tw = 120 / Math.min(thumbs, 3);
							
						if (dateSource === 'added') {
							param += 'a';
						} else if (dateSource === 'dateTaken') {
							param += 't';
						} else if (dateSource === 'fileModified') {
							param += 'm';
						}
						
						if (subfolders) {
							param += 's';
						}
						
						for (var year in dates) {
							year = parseInt(year);
							// Iterating through years
							sb += '<div class="year" data-year="' + year + '"><h3>' + year + '</h3><div class="months">';
							
							for (var month in dates[year]) {
								month = parseInt(month);
								// Iterating through months
								sb += 	'<div class="month" data-month="' + month + '"><h5>' + monthNames[month - 1] + '</h5>' +
											'<div class="weekdays"><div>' + weekdayNames.join('</div><div>') + '</div></div>' +
											'<div class="days">';
								
								for (var i = 0; i < dates[year][month].start; i++) {
									// Spacer days before 1st
									sb += '<div class="spacer day"></div>';
								}
								
								for (var day = 1; day <= dates[year][month].days.length; day++) {
									// Iterating through the days
									if (dates[year][month].count[day] && dates[year][month].days[day]) {
										// Found something
										sb += 	'<div class="day" data-day="' + day + '" data-count="' + dates[year][month].count[day] + '">' +
													'<span>' + day + '</span>' +
													'<div class="thumbs">';
													
										// Adding thumbs
										for (var i = 0; i < dates[year][month].days[day].length; i++) {
											sb += 	'<a href="' + dates[year][month].days[day][i].link + '" ' +
														(dates[year][month].days[day][i].thumb.match(/res\/\w+\.png$/)? 'class="icon" ' : '') +
														'style="width:' + Math.round(dates[year][month].days[day][i].width * tw) + '%;">' +
														'<img src="' + dates[year][month].days[day][i].thumb + '">' +
													'</a>';
										}
										
										sb += 	'</div>';
										
										// Adding extra count, linking to search for date
										if (dates[year][month].count[day] > thumbs) {
											sb += 	'<a href="' + indexName + param + Math.floor(new Date(year, month - 1, day + 1) / ONEDAY_MS) + '" ' + 
														'class="more" data-search-by-date="' + year + '-' + month + '-' + day +'">' +
														'+' + (dates[year][month].count[day] - thumbs) + 
													'</a>';
										}
										
										sb += 	'</div>';
										
									} else {
										// Nothing found for this day
										sb += 	'<div class="empty day" data-day="' + day + '" data-count="0"><span>' + day + '</span></div>';
									}
								}
								
								sb += '</div></div>';
							}
							
							sb += '</div></div>';
						}
						
						return sb.length? ('<div class="calendar years col-' + ((thumbs < 3)? 2 : 1) + ' thumbs-' + thumbs + '">' + sb + '</div>') : '';
					};
				
			if (typeof dateSource === UNDEF) {
				var dateSource = 'dateTaken';
			}
			
			if (typeof thumbs === UNDEF) {
				var thumbs = 4;
			}
			
			if (typeof subfolders === UNDEF) {
				var subfolders = true;
			}

			if (typeof relPath === UNDEF) {
				var relPath = '';
			}
			
			getFolder(folder);
			
			if (dates.length) {
				return writeCalendar();
			}
			
			return '';
		};
		
	
	/*
	 * Copy background music :: copies the files into the /res folders of the album
	 */
	 
	copyBackgroundAudio = function(pl) {
			var sb = new Array(),
				src;
				
			if (pl || (pl = skinVars.get('playlist'))) {
				
				for each (f in pl.split('\t')) {
					
					src = new File(f);
					
					if (src.exists() && resDirectory.exists()) {
						try {
							IO.copyFile(src, resDirectory);
							sb.push(encodeURIComponent(src.getName()));
						} catch(e) {
							logger(Level.WARNING, 'Error copying background audio file(s): {0}', src.getName());
						}
					}
				}
			}
			
			return sb.join('::');
		};

	/*
	 * Copying an image to the output's /res folder
	 */

	copyImage = function(name) {
			var src;
			
			if (name) {
				
				src = new File(name);
				
				if (src.exists() && resDirectory.exists()) {
					try {
						IO.copyFile(src, resDirectory);
						return encodeURIComponent(src.getName());
					} catch(e) {
						logger(Level.WARNING, 'Error copying file: {0}', src.getName());
					}
				}
			}
			
			return '';
		};
		
	/*
	 * Copying an image from the skin directory to the output's /res folder
	 */
	 
	copyResource = function(path, srcName, dstName) {
			var src, 
				dst;
				
			if (srcName) {
				
				src = path? new File(skinDirectory, path) : skinDirectory;
				
				if (src.exists()) {
					
					src = new File(src, srcName);
					dst = new File(resDirectory, dstName || srcName);
					
					if (src.exists()) {
						try {
							IO.copyFile(src, dst);
							return encodeURIComponent(dst.getName());
						} catch(e) {
							logger(Level.WARNING, 'Error copying file: {0}', src.getName());
						}
					}
				}
			}
			
			return '';
		};
	
	/*
	 * Copying files to the album
	 */
	 
	copyResources = function(path, dstFolderName) {
			var name,
				src, 
				dstFolder, 
				dst,
				sb = new Array();
			
			if (path) {
				
				dstFolder = new File(rootOutputDirectory, dstFolderName || 'res');
				
				if (!dstFolder.exists()) {
					dstFolder.mkdirs();
				}
				
				for each (p in path) {
					
					if (p) {
						
						src = new File(p);
						name = IO.webSafe(src.getName());
						dst = new File(dstFolder, name);
						
						if (!exists(dst)) {
							if (Files.isReadable(src.toPath())) {
								// Let's copy
								try {
									IO.copyFile(src, dst);
									sb.push(encodeURIComponent(name));
								} catch(e) {
									logger(Level.SEVERE, 'Error copying file: {0}', src.getName());
								}
							} else {
								// Input file not found
								logger(Level.WARNING, 'No such file: {0}', src.getName());
							}
						} else {
							// Already exists
							sb.push(encodeURIComponent(name));
						}
					}
				}
			}
			
			return sb;
		};
		
	/*
	 * Copying a file from the skin directory to the output
	 */
	 
	copySkinFile = function(path, srcName, dst, process) {
			var src;
			
			if (srcName) {
				
				src = path? new File(skinDirectory, path) : skinDirectory;
				
				if (src.exists()) {
					
					src = new File(src, srcName);
					
					if (!src.exists()) {
						logger(Level.FINEST, 'Source file does not exists: {0}', src.toString());
						return '';
					}
					
					if (dst) {
						if (typeof dst === STRING) { 
							dst = new File(rootOutputDirectory, dst)
						}
						if (!dst.exists()) {
							dst.mkdirs();
						}
					} else {
						dst = rootOutputDirectory;
					}
					
					if (dst.exists()) {
						
						dst = new File(dst, srcName);
						
						if (!exists(dst) || (src.lastModified() > dst.lastModified())) {
							try {
								if (process) {
									engine.processTemplateFile(src, dst);
								} else {
									IO.copyFile(src, dst);
								}
							} catch(e) {
								logger(Level.WARNING, 'Error copying file: {0}\n{1}', [ src.getName(), e ]);
								return '';
							}
						}
						
						return IO.relativePath(dst, rootOutputDirectory);
						
					} else {
						logger(Level.WARNING, 'Destination directory does not exists: {0}', dst.toString());
					}
				} else {
					logger(Level.FINEST, 'Source directory does not exists: {0}', src.toString());
				}	
				
			}
			
			return '';
		};
		
	/*
	 * Removing one file from the output directory
	 */
	 
	removeOutputFile = function(path, fn) {
			var f = new File(rootOutputDirectory, path);
			
			if (typeof fn !== UNDEF && f.exists()) {
				f = new File(f, fn);
			}
			
			if (f.exists()) {
				return f.delete();
			}
			
			return false;
		};
		
	/* 
	 * Checking if CSS file exists for custom pages, copies it, returns link tag
	 */
	 
	getCustomPageCSS = function(ao) {
			var cat = ao.getCategory();
			
			if (cat !== Category.webPage) {
				return '';
			}
			
			var link = copySkinFile('templates', replaceExt(ao.getName(), '.css'), resPath, true);
			
			return link? ('<link rel="stylesheet" href="' + link + '">') : '';
		};

	/* 
	 * Checking if JS file exists for custom pages, copies it, returns script tag
	 */
	 
	getCustomPageJS = function(ao, dev) {
			var cat = ao.getCategory();
			
			if (cat !== Category.webPage) {
				return '';
			}
			
			var link = copySkinFile('templates', replaceExt(ao.getName(), dev? '.js' : '.min.js'), resPath);
				
			return link? ('<script src="' + link + '" charset="utf-8"></script>') : '';
		};

	/*
	 * Copying a whole folder
	 */
	 
	copyDirectory = function(src, dst) {

			if (src.exists() && dst.exists()) {
				try {
					IO.copyDirectoryContent(src, dst, true);
					return encodeURIComponent(dst.getName());
				} catch(e) {
					logger(Level.WARNING, 'Error copying directory: {0}', src.toString());
				}
			}
			
			return '';
		};
		
	/*
	 * Get area tags, avoids duplicates
	 */
	 
	var	regionsPicasa = 'mwg-rs:Regions/mwg-rs:RegionList[',
		regionsMS = 'MP:RegionInfo/MPRI:Regions[',
		areaPicasa = ']/mwg-rs:Area/stArea:',
		rectMS = ']/MPReg:Rectangle',
		namePicasa = ']/mwg-rs:Name',
		nameMS = ']/MPReg:PersonDisplayName';
			
	
	getRegions = function(ao, skipEmpty) {
			var vars = ao.getVars(),
				xmp,
				reg = new Array(),
				name,
				
				add = function(name, r) {
						
						if (r.length < 4) {
							return;
						}
						
						// Contrain to 1 x 1
						if (r[0] < 0) {
							r[2] += r[0];
							r[0] = 0;
						}
						if (r[1] < 0) {
							r[3] += r[1];
							r[1] = 0;
						}
						if (r[0] + r[2] > 1) {
							r[2] = 1 - r[0];
						}
						if (r[1] + r[3] > 1) {
							r[3] = 1 - r[1];
						}
						
						// Already exists?
						for (var i = 0; i < reg.length; i++) {
							if (reg[i].name === name &&
								Math.abs(reg[i].x - r[0]) < 0.01 &&
								Math.abs(reg[i].y - r[1]) < 0.01 &&
								Math.abs(reg[i].w - r[2]) < 0.01 &&
								Math.abs(reg[i].h - r[3]) < 0.01) {
								return;
							}
						}
						
						//print(name + ' -> ' + r[0] + '::' +  + r[1] + '::' + r[2] + '::' + r[3]);
						// No such yet
						reg.push({
								name:	name,
								x:		r[0],
								y:		r[1],
								w:		r[2],
								h:		r[3]
							});
					},
				
				convert = function() {
						var sb = new Array();
						
						for (var i = 0; i < reg.length; i++) {
							sb.push([ 
									reg[i].name, 
									(reg[i].x).toFixed(3), 
									(reg[i].y).toFixed(3), 
									(reg[i].w).toFixed(3), 
									(reg[i].h).toFixed(3) 
								].join(';'));
						}
						
						return sb;
					};
			
			if (!vars || !(xmp = vars.get('xmp'))) {
				return null;
			}
			
			// Check for the first area
			if (xmp.containsKey(regionsPicasa + '1' + areaPicasa + 'x')) {
				// Picasa notation
				for (var i = 1, x, y, w, h, p, n; xmp.containsKey(regionsPicasa + i + areaPicasa + 'x'); i++) { 
					p = regionsPicasa + i + areaPicasa;
					if (!isNaN(x = parseFloat(xmp.get(p + 'x'))) &&
						!isNaN(y = parseFloat(xmp.get(p + 'y'))) &&
						!isNaN(w = parseFloat(xmp.get(p + 'w'))) &&
						!isNaN(h = parseFloat(xmp.get(p + 'h')))) {				
					
						n = xmp.get(regionsPicasa + i + namePicasa) || '';
						
						if (n || !skipEmpty) {
							add(n, [ x - w / 2, y - h / 2, w, h ]);
						}
					}
				}
			}
			
			if (xmp.containsKey(regionsMS + '1' + rectMS)) {
				// Microsoft notation
				for (var i = 1, a, n; a = xmp.get(regionsMS + i + rectMS); i++) {
					a = a.replace(/\s/g, '').split(',');
					
					for (var j = 0; j < a.length; j++) {
						a[j] = parseFloat(a[j]);
					}
					
					n = xmp.get(regionsMS + i + nameMS) || '';
					
					if (n || !skipEmpty) {
						add(n, a);
					}
				}
			}
			
			return reg.length? convert() : null;
		};
	
	/*
	 * Extracts the names from a getRegions() output string, avoids duplicates
	 */
	 
	getRegionNames = function(s) {
				
			if (s) {
				var sb = new Array();
				
				for (var a = s.split('::'), i, n; i < a.length; i++) {
					n = a[i].split(';')[0];
					if (sb.indexOf(n) === -1) {
						sb.push(n);
					}
				}
				
				return sb.join(',');
			}
			
			return '';
		};
	
	/*
	 * Returns path to fall back folder thumbnail
	 */
	 
	getFallbackThumb = function(folder) {
			var rep = folder.getRepresentingAlbumObject(true);
			
			if (!rep) {
				return '';
			}
			
			var	cat = rep.getCategory();
			
			if (cat == Category.audio) {
				return resDirectory + '/' + 'audio.poster.jpg';
			} else if (cat == Category.video) {
				return resDirectory + '/' + 'video.poster.jpg';
			}
			
			return IO.relativePath(FileFilters.getIconFor(rep.getFile(), engine), folder);
		};
		
	/*
	 * Reads image dimensions
	 */
	 
	getImageDimensions = function(ai) {
			var im = ai.getImage();
			
			return im? new Dimension(im.getWidth(), im.getHeight()) : null;
		};

	/*
	 * Copy folder image to the output folder cropped to specified size
	 * Save the latest settings in order to avoid generating the scaled image multiple times
	 */

	createFolderImage = function(folder, folderImageDims, folderThumbDims, folderImageSmallDims) {
	
			var	folderImageDims = (typeof folderImageDims !== UNDEF)? folderImageDims : folderImageSize,
				folderThumbDims = (typeof folderThumbDims !== UNDEF)? folderThumbDims : folderThumbSize,
				folderImageSmallDims = (typeof folderImageSmallDims !== UNDEF)? folderImageSmallDims : folderImageSmallSize,
				props = folder.getProperties(),
				rep,
				dim,
				imgDim,
				dst, 
				path,
				src, 
				ai,
				ai1,
				cf,
				s,
				success = true;
				
			rep = props.get('themeImagePath');

			//logger(Level.WARNING, 'Creating folder images for folder "{0}": {3} [{1}] [{2}]', [folder.getName(), folderImageDims, folderThumbDims, rep]);
			
			// Checking if representing image exists
			if (!rep) {
				//logger(Level.WARNING, 'No separate "themeImagePath"! Falling back to folder thumbnail.');
				rep = folder.getRepresentingAlbumObject();
			} else {
				rep = folder.getChild(rep);
			}
			
			if (!rep) {
				
				logger(Level.INFO, 'No representing image in folder "{0}"', folder.getName());
				return false;
				
			} else {
			
				dst = new File(outputDirectory, folderImageFileName);
				dst1 = new File(outputDirectory, folderImageSmallFileName);
				path = rep.getPathFromRoot();
			
				// Folder Image
				if (!exists(dst) || !exists(dst1) || rep.getLastModified() > dst.lastModified() ||
					(s = props.get('lastFolderImagePath')) === null || s !== path ||
					(s = props.get('lastFolderImageSize')) === null || s !== folderImageDims) {
					/*
					var reason;
					if (!exists(dst)) reason = 'folder image doesn\'t exist';
					else if (!exists(dst1)) reason = 'small folder image doesn\'t exist';
					else if(rep.getLastModified() > dst.lastModified()) reason = 'changed since ' + new Date(dst.lastModified());
					else if ((s = props.get('lastFolderImagePath')) === null) reason = 'no props.lastFolderImagePath';
					else if (s !== folderImagePath) reason = 'folderImagePath is different: ' + s + '=/=' + folderImagePath;
					else if ((s = props.get('lastFolderImageSize')) === null) reason = 'no props.lastFolderImageSize';
					else if (s !== folderImageDims) reason = 'folderImageSize is different: ' + s + '=/=' + folderImageDims;
					logger(Level.FINER, 'Theme image / thumbnail "{0}" needs refresh, because {1}', [ folder.getName(), reason ]);
					*/
					
					try {
						ai = new AlbumImage(rep);
					} catch (e) {
						try {
							ai = new AlbumImage(getFallbackThumb(folder), engine);
						} catch (e) {
							logger(Level.WARNING, 'No folder image selected and fallback fails too in folder "{0}"', folder.getName());
							success = false;
						}
					}
		
					if (!ai) {
						logger(Level.WARNING, 'Error creating folder image "{0}" in folder "{1}"', [ rep.getName(), folder.getName() ]);
						success = false;
					} else {
						
						// Source image dimensions
						imgDim = getImageDimensions(ai);
						
						// Applying filters
						ai = ai.applyFilters(JAFilter.ALL_PRESCALE_STAGE);
						
						// Small image
						
						dim = getDim(folderImageSmallDims);
						
						if ((dim.width / dim.height) < (imgDim.width / imgDim.height)) {
							// Fit to height
							if (imgDim.height <= dim.height) {
								// Smaller than crop - no need to scale
								dim = new Dimension(Math.round((imgDim.height * dim.width) / dim.height), imgDim.height);
								ai1 = ai;
							} else {
								ai1 = ai.scaleToFit(new Dimension(100000, dim.height));
							}
						} else {
							// Fit to width
							if (imgDim.width <= dim.width) {
								// Smaller than crop
								dim = new Dimension(imgDim.width, Math.round((imgDim.width * dim.height) / dim.width));
								ai1 = ai;
							} else {
								ai1 = ai.scaleToFit(new Dimension(dim.width, 100000));
							}
						}
						
						// Crop
						cf = new CropFilter();
						cf.setBounds(dim);
						ai1 = ai1.applyFilter(cf);
						ai1 = ai1.applyFilters(JAFilter.ALL_POSTSCALE_STAGE);
						
						//Saving folderimg
						try {
							ai1.saveImage(dst1);
							logger(Level.FINEST, 'Saving small folder image "{0}"', dst1.toString());
						} catch (e) {
							logger(Level.WARNING, 'Error saving small folder image "{0}"', dst1.toString());
							success = false;
						}
						
						// Large image
						
						dim = getDim(folderImageDims);
						
						if ((dim.width / dim.height) < (imgDim.width / imgDim.height)) {
							// Fit to height
							if (imgDim.height <= dim.height) {
								// Smaller than crop - no need to scale
								dim = new Dimension(Math.round((imgDim.height * dim.width) / dim.height), imgDim.height);
								logger(Level.WARNING, 'Folder image "{0}" is too short: {1}x{2}px', [ rep.toString(), imgDim.width, imgDim.height ]);
							} else {
								// Large enough
								ai = ai.scaleToFit(new Dimension(100000, dim.height));
							}
						} else {
							// Fit to width
							if (imgDim.width <= dim.width) {
								// Smaller than crop
								dim = new Dimension(imgDim.width, Math.round((imgDim.width * dim.height) / dim.width));
								logger(Level.WARNING, 'Folder image "{0}" is too narrow: {1}x{2}px', [ rep.toString(), imgDim.width, imgDim.height ]);
							} else {
								// Large enough
								ai = ai.scaleToFit(new Dimension(dim.width, 100000));
							}
						}
						
						// Crop
						cf = new CropFilter();
						cf.setBounds(dim);
						//cf.setYWeight(0.382);
						ai = ai.applyFilter(cf);
						//logger(Level.FINEST, 'Cropping folder image "{0}" for {1}x{2}px', [ rep.toString(), imgDim.width, imgDim.height ]);
						ai = ai.applyFilters(JAFilter.ALL_POSTSCALE_STAGE);
						
						//Save
						try {
							ai.saveImage(dst);
							logger(Level.FINEST, 'Saving folder image "{0}"', dst.toString());
						} catch (e) {
							logger(Level.WARNING, 'Error saving folder image "{0}"', dst.toString());
							success = false;
						}
						
						// Saving properties
						props.put('lastFolderImagePath', path);
						props.put('lastFolderImageSize', folderImageDims);
						props.save(true);
					}
					
				} else {
					logger(Level.FINEST, 'Folder image in folder "{0}" already exists and healthy: {1}', [folder.getName(), path]);
					/*
					var reason;
					if (exists(dst)) {
						reason = 'Folder image exist';
						if (rep.getLastModified() <= dst.lastModified()) 
							reason += ', not changed since ' + new Date(dst.lastModified());
						if ((s = props.get('lastFolderImagePath')) !== null) {
							reason += ', has props.lastFolderImagePath';
							if (s === path) 
								reason += '. folderImagePath hasn\'t changed: ' + s;
						}
						if ((s = props.get('lastFolderImageSize')) !== null) {
							reason += ', has no props.lastFolderImageSize';
						} else if (s === folderImageDims) 
							reason += ', folderImageSize is the same: ' + s;
						logger(Level.WARNING, 'Folder image doesn\'t have to be refreshed becasue:\n{0}', reason);
					}
					*/
				}
			}
			
			if (folderThumbDims) {
				
				rep = folder.getRepresentingAlbumObject();
				
				if (rep) {
					
					dst = new File(outputDirectory, folderThumbFileName);
					path = rep.getPathFromRoot();
					
					// Folder Thumbnail
					if (!exists(dst) || rep.getLastModified() > dst.lastModified() ||
						(s = props.get('lastFolderThumbPath')) === null || s !== path ||
						(s = props.get('lastFolderThumbSize')) === null || s !== folderThumbDims) {
		
						dim = getDim(folderThumbDims);
						
						/*
						var reason;
						if (!exists(dst)) reason = 'folder thumb doesn\'t exist';
						else if(rep.getLastModified() > dst.lastModified()) reason = 'changed since ' + new Date(dst.lastModified());
						else if ((s = props.get('lastFolderThumbPath')) === null) reason = 'no props.lastFolderThumbPath';
						else if (s !== lastFolderThumbPath) reason = 'lastFolderThumbPath is different: ' + s + '=/=' + lastFolderThumbPath;
						else if ((s = props.get('lastFolderThumbSize')) === null) reason = 'no props.lastFolderThumbSize';
						else if (s !== folderThumbDims) reason = 'folderThumbSize is different: ' + s + '=/=' + folderThumbDims;
						logger(Level.FINEST, 'Folder thumbnail "{0}" needs refresh, because {1}', [ folder.getName(), reason ]);
						*/
						
						try {
							ai = new AlbumImage(rep);
						} catch (e) {
							try {
								ai = new AlbumImage(getFallbackThumb(folder), engine);
							} catch (e) {
								logger(Level.WARNING, 'No folder thumb selected and fallback fails too in folder "{0}"', folder.getName());
							}
						}
						
						if (!ai) {
							
							logger(Level.WARNING, 'Error creating folder thumbnail "{0}" in folder "{1}"', [ rep.getName(), folder.getName() ]);
							
						} else {
			
							ai = ai.applyFilters(JAFilter.ALL_PRESCALE_STAGE);
							imgDim = getImageDimensions(ai);
							
							// Fit
							if ((dim.width / dim.height) < (imgDim.width / imgDim.height)) {
								ai = ai.scaleToFit(new Dimension(100000, dim.height));
							} else {
								ai = ai.scaleToFit(new Dimension(dim.width, 100000));
							}
							// Crop
							cf = new CropFilter();
							cf.setBounds(dim);
							//cf.setYWeight(0.382);
							ai = ai.applyFilter(cf);
							ai = ai.applyFilters(JAFilter.ALL_POSTSCALE_STAGE);
							//Save
							try {
								ai.saveImage(dst);
								logger(Level.FINEST, 'Saving folder thumbnail "{0}"', dst.toString());
							} catch (e) {
								logger(Level.WARNING, 'Error saving folder thumbnail "{0}"', dst.toString());
							}
							
							// Saving properties
							props.put('lastFolderThumbPath', path);
							props.put('lastFolderThumbSize', folderThumbDims);
							props.save(true);
						}
						
					} else {
						logger(Level.FINEST, 'Folder thumbnail in "{0}" already exists and healthy.', folder.getName());
					}
				}
			}
			
			return success;
		};
		
	/*
	 * Creating folder thumbnails in the "thumbs/folder" folder
	 */
	 
	createFolderThumb = function(ao, size, crop) {
			
			//print('createFolderThumb(' + ao + ',' + size + ',' + crop + ')');
			
			var	cat = ao.getCategory(),
				rep = (cat === Category.folder)? ao.getRepresentingAlbumObject(true) : ao,
				dim = getDim(size),
				imgDim,
				dstDir = new File(outputDirectory, thumbsDir + '/' + 'folder'),
				dstName,
				dst,
				props,
				ai,
				s;
	
			if (!dim || !dim.width || !dim.height) {
				dim = new Dimension(400, 400);
			}
			
			// No representing image? 
			if (!rep) {
				return getFallbackThumb(ao);
				logger(Level.FINEST, 'No folder thumbnail for "{0}".', ao.getName());
			}
				
			// Creating dedicated folder if not exists
			dstDir.mkdirs();
			
			// New file
			if (cat === Category.folder) {
				dstName = fixExtension(getRelativePath(ao.getParent(), rep).replace(/\//g, '_'));
			} else {
				dstName = fixExtension(rep.getName());
			}
			dst = new File(dstDir, dstName);
			props = ao.getProperties();
			
			if (!exists(dst) || rep.getLastModified() > dst.lastModified() ||
				(s = props.get('lastFolderThumbName')) === null || s !== dstName ||
				(s = props.get('lastFolderThumbDims')) === null || s !== size ||
				(s = props.get('lastFolderThumbCrop')) === null || s !== crop) {
			
				try {
					ai = new AlbumImage(rep);
				} catch (e) {
					logger(Level.WARNING, 'Error creating AlbumImage: {0}', rep.getName());
					return getFallbackThumb(ao);						
				}
				
				imgDim = getImageDimensions(ai);
				// Folder Thumbnail
				ai = ai.applyFilters(JAFilter.ALL_PRESCALE_STAGE);
				
				if (crop) {
					var cf = new CropFilter();
					
					if (imgDim.width < dim.width || imgDim.height < dim.height) {
						// Source is smaller than target dims
						if ((dim.width / dim.height) < (imgDim.width / imgDim.height)) {
							// Fit for height
							dim = new Dimension(Math.floor(imgDim.height * dim.width / dim.height), imgDim.height);
						} else {
							// Fit for width
							dim = new Dimension(imgDim.width, Math.ceil(imgDim.width * dim.height / dim.width));
						}
						//print(dim);
					} else {
						if ((dim.width / dim.height) < (imgDim.width / imgDim.height)) {
							ai = ai.scaleToFit(new Dimension(100000, dim.height));
						} else {
							ai = ai.scaleToFit(new Dimension(dim.width, 100000));
						}
					}
					
					cf.setBounds(dim);
					cf.setYWeight(0.382);
					ai = ai.applyFilter(cf);
					
				} else {
					ai = ai.scaleToFit(dim);
				}
				
				ai = ai.applyFilters(JAFilter.ALL_POSTSCALE_STAGE);
				
				try {
					ai.saveImage(dst);
					logger(Level.FINEST, 'Saving folder thumbnail: {0}', dst.getName());
				} catch (e) {
					logger(Level.WARNING, 'Error saving folder thumbnail: {0}', dst.getName());
					try {
						var ft = getFallbackThumb(ao);
						ai = new AlbumImage(ft, engine);
						return ft;
					} catch (e) {
						logger(Level.WARNING, 'No folder thumb selected and fallback fails too in folder "{0}"', ao.getName());
						return '';
					}
				}
	
				props.put('lastFolderThumbName', dstName);
				props.put('lastFolderThumbDims', size);
				props.put('lastFolderThumbCrop', crop);
				props.save(true);
				
			} else {
				logger(Level.FINEST, 'Folder thumbnail "{0}" already exists and healthy.', ao.getName());
			}
			
			return thumbsDir + '/folder/' + urlEncode(dstName);
		};
		
	/*
	 * getFittedDimensions(boudaries, albumobject);
	 */
		
	getFittedDimensions = function(bnd, dim) {
			var b = (typeof bnd === STRING)? bnd.split('x') : bnd,
				r = Math.min(b[0] / dim[0], b[1] / dim[1]);
			
			return (r < 1)? [ dim[0] * r, dim[1] * r ] : [ dim[0], dim[1] ];
		};
		
	/*
	 * createMoreSizes(folder, sizes);
	 */
		
	createExtraFolders = function(folder, sizes) {
			var outDir = new File(rootOutputDirectory, folder.getPathFromRoot()),
				folders = new Array();
				
			if (outDir.exists()) {
				for (var d in sizes) {
					folders.push(new File(outDir, downloadDir + '/' + sizes[d].width + 'x' + sizes[d].height));
				}
			}
			
			return folders;
		};
	
	createExtraSizes = function(folder, sizes, recursive) {
			// Recursive for subfolders
			var folders,
				sd,
				files,
				
				getSizes = function(sizes) {
						var	a = sizes.split(/[,;]\s*/),
							s,
							ss = [];
							
						for (var i in a) {
							s = getDim(a[i]);
							if (s && s.width && s.height) {
								ss.push(s);
							}
						}
						
						return ss;
					};
			
			updateStatus('Creating extra downscaled images in folder: ' + folder);
			
			if (typeof sizes === STRING) {
				sizes = getSizes(sizes);
			}
			
			folders = createExtraFolders(folder, sizes);
			if (!folders || !folders.length) {
				return;
			}
			
			sd = new File(rootOutputDirectory, folder.getPathFromRoot() + '/' + slidesDir);
			files = new Array(sizes.length);
			 
			for each (ao in folder.getChildren()) {
				
				if (ao.isIncluded()) {
					
					var cat = ao.getCategory(),
						ai,
						ai0;
					
					if (cat === Category.folder && !ao.isHidden()) {
						
						createExtraSizes(ao, sizes, recursive);
						
					} else if (cat === Category.image) {
						
						var fn = ao.getWebName();
						
						if (/\.(jpg|jpeg|png|tif|tiff)$/.test(fn.toLowerCase())) {
							
							var dirty = JAlbumUtilities.isDirty(new File(sd, fn), ao),
								anyMissing = false;
							
							for (var i = 0; i < sizes.length; i++) {
								files[i] = new File(folders[i], fn);
								
								if (files[i].exists() && !dirty) {
									files[i] = null;
								} else {
									anyMissing = true;
								}
							}
	
							if (anyMissing) {
	
								try {
									ai0 = new AlbumImage(ao);
								} catch (ex) {
									logger(Level.WARNING, 'Couldn\'t create album image: {0}', ao.getName());
									continue;
								}
								
								ai0 = ai0.applyFilters(JAFilter.ALL_PRESCALE_STAGE);
	
								for (var i = 0; i < sizes.length; i++) {
									if (files[i]) {
										ai = ai0.scaleToFit(sizes[i]);
										ai = ai.applyFilters(JAFilter.ALL_POSTSCALE_STAGE);
										ai = ai.applyFilters(JAFilter.CLOSEUPS_POSTSCALE_STAGE);
										
										try {
											folders[i].mkdirs();
											ai.saveImage(files[i]);
										} catch (e) {
											logger(Level.WARNING, 'Couldn\'t save scaled image: {0}', files[i]);
										}
									}
								}
							}
						}
					}
				}
			}
			
			revertStatus();
		};

