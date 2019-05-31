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
		// Datadosen
		//AlbumBean = Java.type("se.datadosen.jalbum.AlbumBean"),
		AlbumImage = Java.type("se.datadosen.jalbum.AlbumImage"),
		Category = Java.type("se.datadosen.jalbum.Category"),
		Config = Java.type("se.datadosen.jalbum.Config"),
		Widgets = Java.type("se.datadosen.jalbum.Widgets"),
		IO = Java.type("se.datadosen.util.IO"),
		SkinProperties = Java.type("se.datadosen.jalbum.SkinProperties"),
		AlbumObjectProperties = Java.type("se.datadosen.jalbum.AlbumObjectProperties"),
		JAlbumUtilities = Java.type("se.datadosen.jalbum.JAlbumUtilities"),
		CropFilter = Java.type("CropFilter"),
		Section = Java.type("se.datadosen.tags.Section"),
		XmpManager = Java.type("se.datadosen.jalbum.XmpManager");
		
		
		// Skin Variables
		skinVars = engine.getSkinVariables(),
		
		// Skin properties
		skinProperties = engine.getSkinProperties(),
		
		// 'undefined'
		UNDEF = 'undefined',
		
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
	
	// Directories
	thumbsDir = engine.getThumbnailDirectory();
	slidesDir = engine.getSlideDirectory();
	folderThumbsDir = thumbsDir + '/' + 'folder';
	downloadDir = 'dl';
	resDir = 'res';
	
	// Default folder image/thumb filename
	folderImageFileName = 'folderimage.jpg';
	folderThumbFileName = 'folderthumb.jpg';
	
	// Date format
	dateFormat = engine.getDateFormat() || 'dd/MM/yy';
	
	// Image linking model
	linkOriginals = engine.getImageLinking() === 'LinkOriginals';
	copyOriginals = engine.isCopyOriginals();
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
	
	//collator = getCollator(lang, locale);
	
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
	
	
	encodeAsJava = function(s) {
			var r = '',
				ap = /^(https?:|file:)?\/\//i;
			
			s = ap.test(s)? encodeURI(s) : encodeURIComponent(s);
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
				s = encodeAsJava(rootFolder.getProperties().get(AlbumObjectProperties.ALBUM_URL, ''));
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
				nx = '.' + pageExt;
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
	 * Formatting file size
	 */
	 
	getSizeAsString = function(size) {
			var p;
			
			if (typeof size === UNDEF || size === null) {
				return '';
			}
			
			if (typeof size !== 'number') {
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
				return texts.getString('noFlash');
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
				if (s.contains("<")) {
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
		
			if (typeof s === 'number') {
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
			return s.replace(/\/?<[^>]*>/g, ' ').replace(/\r?\n/g, ' ').replace(/\&nbsp;/g, ' ').replace(/\&(m|n)dash;/g, '–').replace(/\&hellip;/g, '...').replace(/\&amp;/g, '&').replace(/\&copy;/g, '©').replace(/\s+/g, ' ').trim();
		};
	
	/*
	 * Remove only empty HTML tags
	 */
	 
	stripEmptyHTML = function(s) {
			if (typeof s === UNDEF || s === null || !s.length) {
				return '';
			}
			
			s = s.trim().replace(/<(?!IMG)(?!img)(?!audio)(?!AUDIO)(?!video)(?!VIDEO)(?!iframe)(?!IFRAME)(?!br)(?!BR)(?!hr)(?!HR)[^\/>][^>]*>\s*<\/[^>]+>/g, '');
			
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
				if ('cs.ee.hr.hu.ro.sh.sk.sl.tr'.contains(lang))
					return s + '&amp;subset=latin,latin-ext';
				else if ('bg.ru.sr.uk'.contains(lang))
					return s + '&amp;subset=cyrillic';
				else if (lang.equals('el'))
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
	 * Returns combined color from two color arrays
	 */
	 
	getFlatColorArray = function(bg, fg) {
			if (typeof bg === 'string') {
				bg = getColorArray(bg);
			}
			if (typeof fg === 'string') {
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
	 * Light color? (backgroundColor, color, treshold)
	 */
	 
	isLightColor = function(bc, c, treshold) {
			var treshold = (typeof treshold === UNDEF)? 0.5 : treshold;
			
			if (typeof c === UNDEF) {
				c = bc;
				bc = '#FFFFFF';
			} else if (typeof c === 'number') { 
				treshold = c;
				c = bc;
				bc = '#FFFFFF';
			}
				
			var l = getLuminosity(c);
			
			if (c.length > 7) {
				// Semi transparent color
				var a = parseInt(c.substring(1,3), 16) / 255.0;
				l = a * l + (1 - a) * getLuminosity(bc);
			}
			
			return l > treshold;
		};
		
	/*
	 * Lightening
	 */
	 
	lighten = function(c, factor) {
			var factor = (typeof factor === UNDEF)? 0.2 : factor,
				rgb = getColorArray(c),
				isArray = (typeof c !== 'string');
			
			for (var i = 0; i < 3; i++) {
				rgb[i] += Math.min(Math.max(0, Math.round((255 - rgb[i]) * factor)), 255);
			}
			
			return isArray? rgb : toHexColor(rgb);
		};
	
	/*
	 * Darkening
	 */
	 
	darken = function(c, factor) {
			var factor = (typeof factor === UNDEF)? 0.2 : factor,
				rgb = getColorArray(c),
				f = Math.max(1 - factor, 0),
				isArray = (typeof c !== 'string');
			
			for (var i = 0; i < 3; i++) {
				rgb[i] = Math.round(rgb[i] * f);
			}

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
	 * Returns legible color on "bc" with optional semi-transparent "fc"
	 * checking if "tc" is enough contrasty or if not
	 * returns a lighter version of tc by factor "f"
	 */
	 
	getLegibleColor = function() {
			var args = [].slice.call(arguments),
				bc,
				f = 0.6,
				txt,
				clr = new Array();
				
			if (args.length > 3 || (args.length === 3 && typeof args[2] !== 'number')) {
				bc = getFlatColorArray(args[0], args[1]);
				args.splice(0, 2);
			} else {
				bc = getColorArray(args[0]);
				args.splice(0, 1);
			}
			
			if (args.length) {
				if (typeof args[0] === 'number') {
					txt = lighten(bc, 0.6);
					f = args[0];
				} else {
					txt = getColorArray(args[0]);
					if (args.length > 1 && typeof args[1] === 'number') {
						f = args[1];
					}
				}
			} else {
				txt = lighten(bc, 0.6);
			}
			
			if (Math.abs(getLuminosity(bc) - getLuminosity(txt)) >= f) {
				// Already contrasty
				return toHexColor(txt);
			}
			
			f = Math.round(f * 255);
			
			if (getLuminosity(bc) > 0.5) {
				// Darkening
				for (i = 0; i < 3; i++) {
					clr.push(Math.max(txt[i] - f, 0));
				}
			} else {
				// Lightening
				for (i = 0; i < 3; i++) {
					clr.push(Math.min(txt[i] + f, 255));
				}
			}
			
			return toHexColor(clr);
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
				return fallback || unCamelCase(name.replace(/^ui\./, ''));
			}
			return s;
		};
	
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
				n = name.replace(/^xmp\.(dc\:)?/i, '').replace(/^xmp\.photoshop:/i, '').replace(/Iptc4xmpExt\:/i, '').replace(/^iptc\.(IIM\/)?/i, '').replace(/^Canon makernote\./i, '');
			
			try {
				s = texts.getString(n);
			} catch(e) {
				try {
					s = texts.getString(toCamelCase(n));
				} catch(e) {
					s = unCamelCase(n);
					logger(Level.FINE, 'Translate: Missing translation: {0}={1}', [n, name]);
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
				strm,
				line;
			
			// Opening stream
			try {
				strm = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(dst), 'UTF8'));
			} catch(e) {
				logger(Level.WARNING, 'Error creating "{0}"', dst.getName());
				return false;
			}
			
			// Header
			try {
				strm.write('/* ' + dstName + min + '.js - ' + skinName + ' skin scripts */');
				strm.newLine();
				strm.write('var VER=\'' + skinVersion + '\',DEBUG=' + dev + ';');
				strm.newLine();
			} catch(e) {
				logger(Level.WARNING, 'Error writing header of "{0}"\n\t{1}', [dst.getName(), e]);
			}
		
			// Translations
			if (keys) {
				try {
					strm.write(';Texts = {' + getTexts(keys) + '};');
					strm.newLine();
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
						logger(Level.WARNING, 'Missing Javascript "{0}"', src.getName());
						src = new File(srcFolder, fn + (dev? '.min' : '') + '.js');
					}
					
					if (src && src.exists()) {
						var inp = new BufferedReader(new InputStreamReader(new FileInputStream(src)));
							
						while ((line = inp.readLine()) !== null) {
							strm.write(line);
							strm.newLine();
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
				strm.close();
			} catch(e) {
				logger(Level.WARNING, 'Error closing "{0}"', dst.getName());
			}
			
			return true;
		};

	/*
	 * Credits HTML formatted
	 */
	 
	credits = (function() {
			var s = new Array();
			
			if (!engine.isExcludeBacklinks()) {
				// jAlbum credit
				s.push('<a href="' + generatorUrl + '" rel="generator" data-tooltip title="' + 
					getText('jalbumDescription') + ', ' + internalVersion + '">' +
					(creditText || getText('credit').replace(/\{0\}/g, getText('photoAlbums')).replace('\{\1}', 'jAlbum')) +
					'</a>');
			
				// Skin link
				s.push('<a href="' + skinLink + '" rel="generator" data-tooltip title="' + 
					getText('skin') + ': ' + skin + ' ' + styleName + ', ' + skinVersion + '">' +
					skin + '</a>');
			}
			
			return s.join(' &middot; ');
		}());

	/*
	 * 	Simple encryption
	 */
	
	xEncrypt = function(s) {
		
			if (!typeof this === 'String') {
				return '';
			}
			
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
				if (m && (typeof m !== 'number')) {
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
		
			var format0 = format1 = dateFormat,
				d0 = new Date(fd),
				d1 = new Date(ld);
			
			if (d0.getYear() === d1.getYear()) {
				// Same year
				if (format1.startsWith('yy')) {
					format1 = format1.replace(/yy(yy)?[\s:\/\.-]+/, '');
				} else {
					format0 = format0.replace(/[\s:\/\.-]+yy(yy)?/, '');
				}
				
				if (d0.getMonth() === d1.getMonth()) {
					
					if (d0.getDate() === d1.getDate()) {
						//print('Same day: ' + Dates.format(new JDate(ld), dateFormat));
						return Dates.format(new JDate(ld), dateFormat);
					}
					
					// Same month
					if (format1.startsWith('MM')) {
						format1 = format1.replace(/M+[\s:\/\.-]+/, '');
					} else {
						format0 = format0.replace(/[\s:\/\.-]+M+/, '');
					}
				}
			}
			
			return Dates.format(new JDate(fd), format0) + ((dateFormat.indexOf(' ') > 0)? ' &ndash; ' : '&mdash;') + Dates.format(new JDate(ld), format1); 
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
				return Dates.format(new JDate(newest), dateFormat);
			} else if (newest === 0 || newest === oldest) {
				return Dates.format(new JDate(oldest), dateFormat);
			}
			
			return  Dates.format(new JDate(oldest), dateFormat) + ' — ' + Dates.format(new JDate(newest), dateFormat);
		};

	/*
	 * Returns camera date range in a folder
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

			date = new Date(newest);
			
			return date.toLocaleDateString();
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
				sb += subNode1 + count.image + '&nbsp;' + ((count.image > 1)? getText('images') : getText('image')) + subNode2;
			}
			if (count.audio) {
				sb += subNode1 + count.audio + '&nbsp;' + ((count.audio > 1)? getText( 'audios') : getText('audio')) + subNode2;
			}
			if (count.video) {
				sb += subNode1 + count.video + '&nbsp;' + ((count.video > 1)? getText( 'videos') : getText('video')) + subNode2;
			}
			if (count.other) {
				sb += subNode1 + count.other + '&nbsp;' + ((count.other > 1)? getText( 'others') : getText('other')) + subNode2;
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
	 
	getChildrenOfType = function(folder, types, max) {
		
			var max = (typeof max === UNDEF)? 0 : max,
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
				if (ao.isIncluded() && allow[cat] && (cat !== Category.folder || !ao.isHidden())) {
					r.push(ao);
					if (max === 1) {
						break;
					}
					max--;
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
	
			// Trying to read from the Exif data
			// Now jAlbum reads it as "gpsLocation" / deprecated
			/*
			var lon, 
				lat, 
				lonr, 
				latr,
				met = vars.get('meta');
			
			if (met &&
				(lat = formatGps(met.get('GPS.GPS Latitude'))) &&
				(lon = formatGps(met.get('GPS.GPS Longitude')))) {
	
				latr = met.get('GPS.GPS Latitude Ref');
				lonr = met.get('GPS.GPS Longitude Ref');
				
				if (latr && latr === 'S') {
					lat = '-' + lat;
				}
				
				if (lonr && lonr === 'W') {
					lon = '-' + lon;
				}
	
				return (lat + ',' + lon).replace('--', '');
			}
			*/
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
	 * Process a template string :: replacing ${variable} keys
	 * Usage: processTemplate(ao, "${fileName} is ${fileSize}");
	 * Returns: "IMG0001.JPG is 3.2MB"
	 */
	 
	processTemplate = function(ao, templ, keepEmptyTags) {
			if (!ao || !templ) {
				return '';
			}
			
			var v = ao.getVars(),
				sb,
				
				doProcess = function(templ) {
						var b;
					
						try {
							b = engine.processSection(new Section(templ), v);
						} catch(e) {
							logger(Level.WARNING, 'Parsing error in file "{0}": {1}', [ao.getName(), e]);
							return '';
						}
						
						return b;
					};
					
			templ = stripCrlf(templ.trim());
			sb = doProcess(templ);
			//print(sb);
			if (sb && sb.contains('${')) {
				// Nested variables
				sb = doProcess(sb);
			}	
			
			return keepEmptyTags? sb : stripEmptyHTML(sb);
		};
		
	/*
	 * Shortcut for processing thumbnail captions
	 */
	 
	getThumbCaption = function(ao) {
			if (!thumbCaptionTemplate) {
				return ao.getVars.get('comment');
			}
			return processTemplate(ao, thumbCaptionTemplate);
		};

	/*
	 * Shortcut for processing image captions
	 */
	 
	getCaption = function(ao) {
			if (!imgCaptionTemplate) {
				return ao.getVars.get('comment');
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
	 */
	 
	getRelPath = function(ao) {
			var p = ao.getPathFromRoot();
			
			if (p === '/') {
				p = '';
			} else if (p.length) {
				p = (isUrlEncode? encodeAsJava(p).replace(/%2F/g, '/') : p) + '/';
			}
			
			return p; 
		};
		
	/*
	 * Relative path between album objects
	 */
	 
	getRelativePath = function(folder, ao) {
			var p = [];
			
			if (!folder || !ao || folder === ao) {
				return '';
			}
			
			// Path to ao until the root or folder
			do {
				if (ao === folder) {
					// Within folder
					//print(folder.toString() + ' -> ' + ao.toString() + ' = ' + p.reverse().join('/'));
					return p.reverse().join('/');
				} else if (ao !== rootFolder) {
					p.push(ao.getName());
				}
			} while ((ao = ao.getParent()) !== null)
			
			// ao isn't within folder: generate root path
			if (folder !== rootFolder) {
				while (folder !== rootFolder) {
					p.push('..');
					folder = folder.getParent();
				}
			}
			
			//print(folder.toString() + ' -> ' + ao.toString() + ' = ' + p.reverse().join('/'));
			return p.reverse().join('/');
		};
		
	/*
	 * Path to root from the current folder or object
	 */
	 
	getRootPath = function(ao) {
			var p = '';
			
			if (ao) {
				if (ao.getCategory() !== Category.folder) {
					ao = ao.getParent();
				}
				
				while ((ao = ao.getParent()) !== null) {
					p += '../';
				} 
			}
			
			return p;
		};
	
	/*
	 * Path to current folder in absolute form
	 */
	 
	getFolderPath = function(ao) {
			return isUrlEncode? (basePath + encodeAsJava(ao.getPathFromRoot())) : (basePath + ao.getPathFromRoot());
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
				sb = new Array();
				
			while (folder = folder.getParent()) {
				
				prefix += '../';
				sb.splice(0, 0, '<a href="' + prefix + indexName + '">' + shorten(folder.getTitle() || folder.getName(), 64, true) + '</a>');
			}
			
			return sb.length? sb.join(pathSep) : '';
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
				// No thumbnail exists just icon
				return (cat === Category.folder)? (resPath + '/folder.png') : tp;
			} 
			
			tp = vars.get('thumbPath');
			
			if (currentFolder === ao.getParent()) {
				// We're in the current folder
				return tp;
			}
			
			return [ getRelativePath(currentFolder, ao.getParent()), tp ].join('/');
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
	 
	getRandomChildren = function(folder, max, types, skipFolderThumb) {
			var max = (typeof max !== UNDEF)? max : 3,
				types = (typeof types !== UNDEF)? types : 'image,video',
				skipFolderThumb = (typeof skipFolderThumb !== UNDEF)? skipFolderThumb : true,
				imgs,
				rnd,
				r = [],
				rep = folder.getRepresentingAlbumObject();
			
			if (typeof types === 'boolean') {
				skipFolderThumb = types;
				types = 'image,video';
			}
			
			imgs = getChildrenOfType(folder, types);
			rnd = getShuffledNumbers(imgs.length, Math.min(max + 1, imgs.length));
			
			for (var i = 0, j = 0, mx = Math.min(rnd.length, max); i < mx; i++, j++) {
				if (skipFolderThumb && imgs[rnd[j]] === rep) {
					j++;
				}
				if (j < rnd.length) {
					r.push(imgs[rnd[j]]);
				} else {
					break;
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
						t = shorten(vars.get('title'), 32, true);
						sb.push('<a href="' + path + '"' + 
							(co.isWithin(ao)? ' class="actual"' : '') + '>' + t + '</a>');
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
	 
	getDropdownMenu = function(folder, co, home, includeFolders, includePages, includeWebLocations, depth, relPath) {
			var home = (typeof home === UNDEF)? false : home,
				includeFolders = (typeof includeFolders === UNDEF)? true : includeFolders,
				includePages = (typeof includePages === UNDEF)? true : includePages,
				includeWebLocations = (typeof includeWebLocations === UNDEF)? true : includeWebLocations,
				depth = (typeof depth === UNDEF)? 4 : depth,
				relp = (typeof relPath === UNDEF)? '' : (relPath + '/'),
				sb = new Array(),
				vars,
				cat,
				t,
				cp,
				path,
				root = getRootPath(co);

			if (co.isWithin(folder)) {
				path = simplifyUrl(root, relp);
			} else {
				path = root + relp;
			}
			
			for each (ao in folder.getChildren()) {
				
				if (ao.isIncluded()) {
					cat = ao.getCategory();
				
					if (includePages && cat === Category.webPage ||
						includeWebLocations && cat === Category.webLocation ||
						includeFolders && cat === Category.folder && !ao.isHidden()) {
						
						vars = ao.getVars();
						cp = vars.get('closeupPath');
						
						if (cp && indexName !== cp) {
							
							t = shorten(vars.get('title'), 32, true);
							
							sb.push('<li' + 
								((co.isWithin(ao) || co == ao)? ' class="actual"' : '') + 
								'><a href="' + (getExternalLink(vars) || (((cat === Category.webLocation)? '' : path) + cp)) + '">' + t + '</a>' +			
								((cat === Category.folder && depth)?
									getDropdownMenu(ao, co, home, includeFolders, includePages, includeWebLocations, depth - 1, relp + cp.substring(0, cp.length - indexName.length - 1)) : '') +
								'</li>');
						}
					}
				}
			}
			
			if (sb.length) {
				if (folder === rootFolder) {
					// Top level
					return '<ul class="dropdown menu" data-dropdown-menu>' + 
						(homepageAddress? ('<li><a class="icon-home" href="' + homepageAddress + '" data-tooltip title="' + (homepageLinkText || getText('home')) + '"></a></li>') : '') +
						(home? ('<li><a class="icon-' + (homepageAddress? 'arrow-up':'home') + '" href="' + root + indexName + '" data-tooltip title="' + getText('mainPage') + '"></a></li>') : '') +
						sb.join('') +
						'</ul>';
				} else {
					// Subfolder
					return '<ul class="menu">' + sb.join('') + '</ul>';
				}
			}
	
			// Empty
			return '';
		};

	/*
	 * Get multi-level navigation tree
	 */
	 
	getTree = function(folder, includeFolders, includePages, includeWebLocations) {
			var includeFolders = (typeof includeFolders === UNDEF)? true : includeFolders,
				includePages = (typeof includePages === UNDEF)? true : includePages,
				includeWebLocations = (typeof includeWebLocations === UNDEF)? true : includeWebLocations,
				sb = new Array(),
				vars,
				cat,
				t,
				cp,
				path,
				root = getRootPath(currentFolder),
				relp = getRelPath(folder);

			if (folder.isWithin(currentFolder)) {
				path = simplifyUrl(root, relp);
			} else {
				path = root + relp;
			}
			
			//print(folder.getName() + ': Path=' + path + ' Root=' + root + ' Relp=' + relp);
			for each (ao in folder.getChildren()) {
				
				if (ao.isIncluded()) {
					cat = ao.getCategory();
				
					if (includePages && cat === Category.webPage ||
						includeWebLocations && cat === Category.webLocation ||
						includeFolders && cat === Category.folder && !ao.isHidden()) {
						
						vars = ao.getVars();
						cp = vars.get('closeupPath');
						
						if (cp && indexName !== cp) {
							
							t = shorten(vars.get('title'), 32, true);
							
							sb.push('<li' + 
								((currentObject == ao)? ' class="actual"' : '') + 
								'><a href="' + (getExternalLink(vars) || (((cat === Category.webLocation)? '' : path) + cp)) + '">' + t + '</a>' +			
								((cat === Category.folder)?
									getTree(ao, includeFolders, includePages, includeWebLocations) : '') +
								'</li>');
						}
					}
				}
			}
			
			if (sb.length) {
				// Top level
				if (folder == rootFolder) {
					t = shorten(folder.getTitle() || folder.getName(), 32, true);
					return '<div class="home' + 
						((rootFolder == currentFolder)? ' actual' : '') + '"><a href="' + (root? root : './') + indexName + '">' + t + '</a>' +
						'</div><ul class="menu">' + sb.join('') + '</ul>';
				} 
					
				// Subfolder
				return '<ul class="menu">' + sb.join('') + '</ul>';
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
						path = getExternalLink(vars) || (((cat === Category.webLocation)? '' : (root + relp)) + p); 
						
						if (path && indexName !== path) {
							t = shorten(vars.get('title'), 32, true);
							
							if (cat === Category.webPage && t === 'NewPhotos') {
								t = getText('newPhotos');
							}
							
							sb.push('<li' + (co.isWithin(ao)? ' class="actual"' : '') + '>' + 
								'<a href="' + path + '">' + t + '</a>' +				
								((cat === Category.folder && depth)?
									getNavigation(ao, co, relp + cp.substring(0, cp.length - indexName.length - 1), depth - 1) : '') +
								'</li>');
						}
					}
				}
			}
	
			return sb.length? ('<ul>' + sb.join('') + '</ul>') : '';
		};
		
	/*
	 * Returns the albumObject of the previous folder if exists
	 */
	 
	getPreviousFolder = function(folder) {
		
			if (folder) {
				var prev = null, 
					parent = folder.getParent();

				if (parent) {
					for each (ao in parent.getChildren()) {
						
						if (ao.isFolder() && ao.isIncluded() && !ao.isHidden()) {
							if (ao === folder) {
								return prev;
							}
							prev = ao;
						}
					}
				}
			}
			
			return null;
		};
		
	/*
	 * Returns the albumObject of the next folder if exists
	 */
	
	getNextFolder = function(folder) {
		
			if (folder) {
				var parent = folder.getParent(),
					found = false;
				
				if (parent) {
					for each (ao in parent.getChildren()) {
						if (ao.isFolder() && ao.isIncluded() && !ao.isHidden()) {
							if (found) {
								return ao;
							} else if (ao === folder) {
								found = true;
							}
						}
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
					if (!ao.isFolder() && ao.isIncluded()) {
						if (ao.getCategory() !== Category.webPage) {
							return ao;
						}
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
							sb = new Array();
												
						for each (ao in folder.getChildren()) {
							
							if (ao.isIncluded()) {
								
								cat = ao.getCategory();
				
								if (cat === Category.webPage || (cat === Category.folder && !ao.isHidden()) || cat === Category.webLocation) {
									vars = ao.getVars();
									path = getRelativePath(currentFolder, (cat === Category.folder)? ao : ao.getParent()),
									t = vars.get('label');
									link = getExternalLink(vars) ||
											(((path && cat !== Category.webLocation)? (path + '/') : '') + 
												((cat === Category.folder)? indexName : vars.get('closeupPath')));
											
									if (t !== 'Sitemap') {
										
										s = '';
										
										if (thumbs) {
											s += '<a href="' + link + '" class="thumb' + 
												(t.endsWith('.png')? ' icon' : '') +
												'"><img src="' + getThumbPath(ao) + '"></a><div>';
										}
										
										s += '<a href="' + link + '">' + shorten(vars.get('title'), 32, true) + '</a>';
										
										if (desc && 
											(t = (cat !== Category.folder)? vars.get('comment') : ao.getComment()) &&
											(t = shorten(t, 160))) {
											s += '<small>' + t + '</small>';
										}
										
										// Recursive for subfolders
										if ((cat === Category.folder) && (sm = getFolder(ao))) {
											s += '<ul>' + sm + '</ul>';
										}
										
										if (thumbs) {
											s += '</div>';
										}
				
										sb.push('<li class="clearfix">' + s + '</li>');
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
	 
	getCatalogue = function(folder, relPath, desc, thumbs, pages) {
			var folder = folder || rootFolder,
				desc = (typeof desc === UNDEF)? true : desc,
				thumbs = (typeof thumbs === UNDEF)? false : thumbs,
				pages = (typeof pages === UNDEF)? true : pages,
				catalogue = new Array(),
				root = getRootPath(folder),
				sb = '',
			
				addFolder = function(folder, relPath) {
					var	relp = relPath? (relPath + '/') : '',
						vars,
						cat,
						path, 
						tpath, 
						caption,
						lbl;
				
						for each (ao in folder.getChildren()) {
				
							if (ao.isIncluded()) {
								
								cat = ao.getCategory();
								
								if ((pages && cat == Category.webPage) || (cat == Category.folder && !ao.isHidden()) || cat === Category.webLocation) {
									
									vars = ao.getVars();
									path = getExternalLink(vars) || (((cat === Category.webLocation)? '' : relp) + vars.get('closeupPath'));
									lbl = vars.get('label');
				
									if (lbl !== 'Contents') {
										
										if (cat !== Category.webPage) {
											tpath = relp + vars.get('thumbPath');
										} else {
											tpath = root + (root? '/' : '') + 'res/htt.png';
										}
										
										caption = stripHTML((cat === Category.webPage)? vars.get('comment') : ao.getComment());
										catalogue.push(new Array(shorten(vars.get('title'), 32, true), path, tpath, shorten(caption)));
										
										if (cat === Category.folder) {
											addFolder(ao, path.endsWith(indexName)? path.substring(0, path.length - indexName.length - 1) : path);
										}
									}
								}
							}
						}
					};

			addFolder(folder, relPath);
	
			if (catalogue) {
				
				catalogue.sort(function(a1, a2) {
					return a1[0].localeCompare(a2[0], locale);
				});
				
				var lch = '!', 
					cch,
					a;
						
				for (var i = 0; i < catalogue.length; i++) {
					
					a = catalogue[i];
					
					cch = a[0].charAt(0).toUpperCase();
					
					if (cch !== lch) {
						if (sb) {
							sb += '</ul></div>';
						}
						sb += '<div class="one-letter"><h2>' + cch + '</h2><ul>';
						lch = cch;
					}
					
					sb += '<li class="clearfix">';
					
					if (thumbs) {
						sb += '<a href="' + a[1] + '" class="thumb' +
							(a[2].endsWith('.png')? ' icon' : '') +
							'"><img src="' + a[2] + '"></a>';
					}
					
					sb += '<div><a href="' + a[1] + '">' + a[0] + '</a>';
					
					if (desc) {
						sb += '<small>' + a[3] + '</small>';
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
						if (typeof dst === 'string') { 
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
	 * Get area tagging
	 */
	 
	getRegions = function(ao) {
			var regionsPrefixPicasa = 'mwg-rs:Regions/mwg-rs:RegionList',
				regionsPrefixMS = 'MP:RegionInfo/MPRI:Regions',
				sb = new Array(),
				p, 
				name,
				i,
				xmp,
				vars = ao.getVars();
	
			if (vars && (xmp = vars.get('xmp'))) {
				
				if (xmp.containsKey(regionsPrefixPicasa + '[1]/mwg-rs:Name')) {
					// Picasa notation
					var x, 
						y, 
						w, 
						h;
						
					for (i = 1; name = xmp.get(regionsPrefixPicasa + '[' + i + ']/mwg-rs:Name'); i++) { 
						p = regionsPrefixPicasa + '[' + i + ']/mwg-rs:Area/stArea:';
						if (typeof (x = parseFloat(xmp.get(p + "x"))) === 'number' &&
							typeof (y = parseFloat(xmp.get(p + "y"))) === 'number' &&
							typeof (w = parseFloat(xmp.get(p + "w"))) === 'number' &&
							typeof (h = parseFloat(xmp.get(p + "h"))) === 'number') {				
							sb.push(name + ';' + (x - w / 2).toFixed(3) + ';' + (y - h / 2).toFixed(3) + ';' + w.toFixed(3) + ';' + h.toFixed(3));
						}
					}
				}
				
				if (xmp.containsKey(regionsPrefixMS + '[1]/MPReg:PersonDisplayName')) {
					// Microsoft notation
					
					for (i = 1; name = xmp.get(regionsPrefixMS + '[' + i + ']/MPReg:PersonDisplayName'); i++) {
						p = xmp.get(regionsPrefixMS + '[' + i + ']/MPReg:Rectangle');
						
						if (p) {
							sb.push(name + ';' + p.replace(/,/g, ';').replace(/\s/g, ''));
						}
					}
				}
				
				return sb.length? sb : null;
			}
			
			return null;
		};
	
	/*
	 * Extracts the names from a getRegions() output string
	 */
	 
	getRegionNames = function(s) {
			var r,
				sb = new Array();
				
			if (s) {
				for each (r in s.split('::')) {
					sb.push(r.split(';')[0]);
				}
			}
			
			return sb.join(',');
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
			
			return im? new Dimension(im.width, im.height) : null;
		};

	/*
	 * Copy folder image to the output folder cropped to specified size
	 * Save the latest settings in order to avoid generating the scaled image multiple times
	 */

	createFolderImage = function(folder, folderImageDims, folderThumbDims) {
	
			var	folderImageDims = folderImageDims? folderImageDims : '1080x240',
				folderThumbDims = folderThumbDims? folderThumbDims : '600x420',
				props = folder.getProperties(),
				rep,
				dim,
				sdim,
				dst, 
				path,
				src, 
				ai,
				cf,
				s,
				success = true;
				
			rep = folder.getProperties().get('themeImagePath');

			// Checking if representing image exists
			if (!rep) {
				rep = folder.getRepresentingAlbumObject();
			} else {
				rep = folder.getChild(rep);
			}
			
			if (!rep) {
				
				logger(Level.INFO, 'No representing image in folder "{0}"', folder.getName());
				return false;
				
			} else {
			
				dst = new File(outputDirectory, folderImageFileName);
				path = rep.getPathFromRoot();
			
				// Folder Image
				if (!exists(dst) || rep.getLastModified() > dst.lastModified() ||
					(s = props.get('lastFolderImagePath')) === null || s !== path ||
					(s = props.get('lastFolderImageSize')) === null || s !== folderImageDims) {
					/*
					var reason;
					if (!exists(dst)) reason = 'folder image doesn\'t exist';
					else if(rep.getLastModified() > dst.lastModified()) reason = 'changed since ' + new Date(dst.lastModified());
					else if ((s = props.get('lastFolderImagePath')) === null) reason = 'no props.lastFolderImagePath';
					else if (s !== folderImagePath) reason = 'folderImagePath is different: ' + s + '=/=' + folderImagePath;
					else if ((s = props.get('lastFolderImageSize')) === null) reason = 'no props.lastFolderImageSize';
					else if (s !== folderImageDims) reason = 'folderImageSize is different: ' + s + '=/=' + folderImageDims;
					logger(Level.FINEST, 'Theme image / thumbnail "{0}" needs refresh, because {1}', [ folder.getName(), reason ]);
					*/
					
					dim = getDim(folderImageDims);
					
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
		
						ai = ai.applyFilters(JAFilter.ALL_PRESCALE_STAGE);
						sdim = getImageDimensions(ai);
						
						// Scaling
						if ((dim.width / dim.height) < (sdim.width / sdim.height)) {
							// Fit to height
							if (sdim.height <= dim.height) {
								// Smaller than crop - no need to scale
								dim = new Dimension(Math.round((sdim.height * dim.width) / dim.height), sdim.height);
								logger(Level.WARNING, 'Folder image "{0}" is too short: {1}x{2}px', [ rep.toString(), sdim.width, sdim.height ]);
							} else {
								// Large enough
								ai = ai.scaleToFit(new Dimension(100000, dim.height));
							}
						} else {
							// Fit to width
							if (sdim.width <= dim.width) {
								// Smaller than crop
								dim = new Dimension(sdim.width, Math.round((sdim.width * dim.height) / dim.width));
								logger(Level.WARNING, 'Folder image "{0}" is too narrow: {1}x{2}px', [ rep.toString(), sdim.width, sdim.height ]);
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
						logger(Level.FINEST, 'Cropping folder image "{0}" for {1}x{2}px', [ rep.toString(), sdim.width, sdim.height ]);
						ai = ai.applyFilters(JAFilter.ALL_PRESCALE_STAGE);
						
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
					logger(Level.FINEST, 'Folder image in "{0}" already exists and healthy.', folder.getName());
				}
			}
			
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
						sdim = getImageDimensions(ai);
						
						// Fit
						if ((dim.width / dim.height) < (sdim.width / sdim.height)) {
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
				sdim,
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
				
				sdim = getImageDimensions(ai);
				// Folder Thumbnail
				ai = ai.applyFilters(JAFilter.ALL_PRESCALE_STAGE);
				
				if (crop) {
					var cf = new CropFilter();
					
					if (sdim.width < dim.width || sdim.height < dim.height) {
						// Source is smaller than target dims
						if ((dim.width / dim.height) < (sdim.width / sdim.height)) {
							// Fit for height
							dim = new Dimension(Math.floor(sdim.height * dim.width / dim.height), sdim.height);
						} else {
							// Fit for width
							dim = new Dimension(sdim.width, Math.ceil(sdim.width * dim.height / dim.width));
						}
						//print(dim);
					} else {
						if ((dim.width / dim.height) < (sdim.width / sdim.height)) {
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
					return getFallbackThumb(ao);						
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
			
			if (typeof sizes === 'string') {
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

