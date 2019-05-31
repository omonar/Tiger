/*
 * laza.util - miscellaneous utility functions and prototype extensions
 */

;

// Ensuring no 'console is undefined' errors happen

window.console = window.console || (function(){
		return {
			log: function(msg) {}
		};
	})();


/*
 *	Extending prototypes
 */
if (!String.prototype.hasOwnProperty('trim')) {
	
	String.wsp = [];
	String.wsp[0x0009] = true;
	String.wsp[0x000a] = true;
	String.wsp[0x000b] = true;
	String.wsp[0x000c] = true;
	String.wsp[0x000d] = true;
	String.wsp[0x0020] = true;
	String.wsp[0x0085] = true;
	String.wsp[0x00a0] = true;
	String.wsp[0x1680] = true;
	String.wsp[0x180e] = true;
	String.wsp[0x2000] = true;
	String.wsp[0x2001] = true;
	String.wsp[0x2002] = true;
	String.wsp[0x2003] = true;
	String.wsp[0x2004] = true;
	String.wsp[0x2005] = true;
	String.wsp[0x2006] = true;
	String.wsp[0x2007] = true;
	String.wsp[0x2008] = true;
	String.wsp[0x2009] = true;
	String.wsp[0x200a] = true;
	String.wsp[0x200b] = true;
	String.wsp[0x2028] = true;
	String.wsp[0x2029] = true;
	String.wsp[0x202f] = true;
	String.wsp[0x205f] = true;
	String.wsp[0x3000] = true;
	
	String.prototype.trim = function() { 
			var str = this + '', 
				j = str.length;
			if (j) {
				var ws = String.wsp, 
					i = 0;
				--j;
				while (j >= 0 && ws[str.charCodeAt(j)]) {
					--j;
				}
				++j;
				while (i < j && ws[str.charCodeAt(i)]) { 
					++i; 
				}
				str = str.substring(i, j);
			}
			return str;
		};
}

if (!String.prototype.hasOwnProperty('trunc')) {

	String.prototype.trunc = function( n ) {
			var t = this + '';
			
			if (t.length <= n) {
				return t.toString();
			}
			
			var s = t.substring(0, n - 1), 
				i = s.lastIndexOf(' ');
				
			return ((i > 6 && (s.length - i) < 20)? s.substring(0, i) : s) + '...';
		};
}

if (!String.prototype.hasOwnProperty('startsWith')) {

	String.prototype.startsWith = function( s ) {
			return (this + '').indexOf( s ) === 0;
		};
}

if (!String.prototype.hasOwnProperty('endsWith')) {

	String.prototype.endsWith = function( s ) {
			return (this + '').substring(this.length - s.length) === s;
		};
}

	String.prototype.capitalize = function() {
			return this.charAt(0).toUpperCase() + this.slice(1);
		};
	
	String.prototype.unCamelCase = function() {
			return this.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
		};
	
	String.prototype.getExt = function() {
			var t = this + '', 
				i = t.lastIndexOf('.');
			return (i <= 0 || i >= t.length - 1)? '' : t.substring(i + 1).toLowerCase();
		};
		
	String.prototype.stripExt = function() {
			var t = this + '',
				i = t.lastIndexOf('.');
			return (i <= 0 || i > t.length - 1)? t : t.substring(0, i);
		};
	
	String.prototype.hasExt = function(x) {
			var t = (this + ''), 
				i = t.lastIndexOf('.');
			if (i >= 0) {
				t = t.substring(i + 1).toLowerCase();
				return (x + ',').indexOf(t + ',') >= 0;
			}
			return !1;
		};
	
	String.prototype.replaceExt = function( s ) {
			var t = this + '', 
				i = t.lastIndexOf('.');
			return (i <= 0)? t : (t.substring(0, i + 1) + s);  
		};
	
	String.prototype.fixExtension = function() {
			return (this + '').replace(/.gif$/gi, '.png').replace(/.tif+$/gi, '.jpg');
		};
	
	String.prototype.getDir = function() {
			var u = (this + '').split('#')[0];
			return u.substring(0, u.lastIndexOf('/') + 1);
		};
	
	String.prototype.getFile = function() {
			var u = (this + '').split('#')[0];
			return u.substring(u.lastIndexOf('/') + 1);
		};
	
	String.prototype.getRelpath = function(level) {
			var t = (this + ''), 
				i = t.lastIndexOf('#');
			if (i === -1) {
				i = t.length - 1;
			} else {
				i--;
			}
			for (; i >= 0; i--) {
				if (t[i] === '/' && (level--) === 0)
					break;
			}
			return t.substring(i + 1);
		};
	
	String.prototype.fixUrl = function() {
			var i, 
				j, 
				t = this + '';
			while ((i = t.indexOf('../')) > 0) {
				if (i === 1 || (j = t.lastIndexOf('/', i - 2)) === -1) {
					return t.substring(i + 3);
				}
				t = t.substring(0, j) + t.substring(i + 2);
			}
			return t;
		};
	
	String.prototype.fullUrl = function() {
			var t = this + '';
			if (!t.match(/^(http|ftp|file)/)) {
				t = window.location.href.getDir() + t;
			}
			return t.fixUrl();
		};
	
	String.prototype.cleanupHTML = function() {
			var htmlregex = [
				[ /<(b|h)r\/?>/gi, '\n' ],
				[ /\&amp;/g, '&' ],
				[ /\&nbsp;/g, ' ' ],
				[ /\&lt;/g, '<' ],
				[ /\&gt;/g, '>' ],
				[ /\&(m|n)dash;/g , '-' ],
				[ /\&apos;/g, '\'' ],
				[ /\&quot;/g, '"' ]
			];
			var t = this + '';
			for (var i = htmlregex.length - 1; i >= 0; i--) {
				t = t.replace(htmlregex[i][0], htmlregex[i][1]);
			}
			return t.replace; 
		};
	
	String.prototype.stripHTML = function(format) { 
			var s = (this + '');
			
			if (format) {
				s = s.cleanupHTML();
			}
			
			return s.replace(/<\/?[^>]+>/g, ''); 
		};
	
	String.prototype.stripQuote = function() {
			return (this + '').replace(/\"/gi, '&quot;');
		};
	
	String.prototype.appendSep = function(s, sep) {
			return (this.length? (this + (sep || ' &middot; ')) : '') + s; 
		};
	
	String.prototype.rgb2hex = function() {
			var t = this + '';
			if (t.charAt(0) === '#' || t === 'transparent') {
				return t;
			}
			var n, r = t.match(/\d+/g), h = '';
			if ( r ) {
				for (var i = 0; i < r.length && i < 3; ++i) {
					n = parseInt( r[i], 10 ).toString(16);
					h += ((n.length < 2)? '0' : '') + n;
				}
				return '#' + h;
			}
			return 'transparent';
		};
	
	String.prototype.template = function(s) {
			if (typeof s === 'undefined' || !this) {
				return this;
			}
			if (!isNaN(parseFloat(s)) && isFinite(s)) {
				s = s + '';
			}
			var t = this + '';
			if (s.constructor === Array) {
				for (var i = 0; i < s.length; ++i) {
					t = t.replace(new RegExp('\\{' + i + '\\}', 'gi'), s[i]);
				}
			} else {
				t = t.replace( /\{0\}/gi, s );
			}
			return t;
		};
	
	String.prototype.getSearchTerms = function() {
			var t = this + '';
			
			if (t.indexOf('"') === -1) {
				return t.split(' ');
			} else {
				var a = [],
					i;
			
				do {
					if ((i = t.indexOf('"')) > 0) {
						a.push.apply(a, t.substring(0, i).split(' '));
					}
					t = t.substring(i + 1);
					i = t.indexOf('"');
					if (i < 0) {
						a.push(t);
						break;
					}
					a.push(t.substring(0, i));
					t = t.substring(i + 1);
					
				} while (t.length);
			
				return a;
			}
		};
	
	String.prototype.objectify = function() {
			if (!this || !this.length) {
				return this;
			}
			var t = this + '';
			if (t.charAt(0) === '?' || t.charAt(0) === '#') {
				t = t.substring(1);
			}
			var r = {}, o, os = t.split('&');
			for (var i = 0, l = os.length; i < l; ++i) {
				o = os[i].split('=');
				if (o.length > 1) {
					r[o[0]] = decodeURIComponent(o[1]);
				}
			}
			return r;
		};
	
	// Test if 's' is in the string
	String.prototype.testIn = function(s) {
			if (typeof s !== 'string') {
				s = s + '';
			}
			return (new RegExp(this, 'i')).test(s);
		};
	
	// Testing exact match
	String.prototype.testExactMatch = function(s) {
			if (s.constructor !== Array) {
				return this == s + '';
			} else {
				for (var i = 0, l = s.length; i < l; ++i) {
					if (this == s[i]) {
						return true;
					}
				}
			}
			return false;
		};
	
	// Fixing jAlbum paths
	String.prototype.fixjAlbumPaths = function(resPath, rootPath, relPath) {
			var s = (this + '').replace(/\%24/g, '\$');
			
			if (resPath) {
				s = s.replace(/\${resPath}/g, resPath);
			}
			if (rootPath) {
				s = s.replace(/\${rootPath}/g, rootPath);
			}
			if (relPath) {
				s = s.replace(/\${relPath}/g, relPath);
			}
			return s;
		};		
	
	// Ignore case but exact match
	String.prototype.testMatch = function(s) {
			if (typeof s === UNDEF) {
				return false;
			}
			
			var t = this.toLowerCase(); 
			
			if (s.constructor !== Array) {
				return t === (s + '').toLowerCase();
			} else {
				for (var i = 0, l = s.length; i < l; ++i) {
					if (t === s[i].toLowerCase()) {
						return true;
					}
				}
			}
			
			return false;
		};
	
	/* Search term in string (case insensitive) :: searching terms only in word beginnings
	 		this 		= target string, 
			s 			= serch term(s), 
			exact 		= matches word boundaries, 
			conj		= all terms must match (default: match any)
	 */
	String.prototype.searchTerm = function(s, exact, conj) {
			if (typeof s === UNDEF || !this.length) {
				return false;
			}
			
			var t = (this + '').toLowerCase(),
				exact = (typeof exact !== UNDEF)? exact : false,
				conj = (typeof conj !== UNDEF)? conj : false,
				
				findString = function(t, s) {
						t = ' ' + t + ' ';
						
						if (s.indexOf('(') >= 0 ||
							s.indexOf(')') >= 0 ||
							s.indexOf('.') >= 0 ||
							s.indexOf('+') >= 0 ||
							s.indexOf('[') >= 0 ||
							s.indexOf(']') >= 0) {
							return (exact? t.indexOf(' ' + s.toLowerCase() + ' ') : t.indexOf(s.toLowerCase())) !== -1;
						}
						
						return t.search(new RegExp('\\W' + s + (exact? '\\W' : ''), 'i')) !== -1;
					};
					
			
			if (s.constructor === Array && s.length === 1) {
				s = s[0];
			}
			
			if (s.constructor === Array) {
				// Multiple terms
				var l = s.length,
					m = 0,
					i;
					
				for (i = 0; i < l; i++) {
					if (findString(t, s[i])) {
						if (conj) {
							m++;
						} else {
							return true;
						}
					} else if (conj) {
						return false;
					}
				}
				
				return m === l;
			}
			
			return findString(t, s);
		};
	
	// Creating hash code
	String.prototype.hashCode = function() {
			for (var h = 0, i = 0, l = this.length; i < l; ++i) {
				h = (h << 5) - h + this.charCodeAt(i);
				h &= h;
			}
			return h;
		};
	
	// > Min && < Max
	Math.minMax = function(a, b, c) {
			b = (isNaN(b))? parseFloat(b) : b;
			return  (b < a)? a : ((b > c)? c : b); 
		};
		
	// Gets range
	Math.getRange = function(a, r) {
			if (r.constructor !== Array) {
				return (a >= r)? 1 : 0;
			}
			if (r.length === 1) {
				return (a >= r[0])? 1 : 0;
			}
			if (a < r[0]) {
				return 0;
			}
			for (var i = 1; i < r.length; i++) {
				if (a >= r[i - 1] && a < r[i]) {
					break;
				}
			}
			return i;
		};
		
	// Pushing array into another array
if (!Array.prototype.hasOwnProperty('pushAll')) {

	Array.prototype.pushAll = function(a) {
			
			if (this instanceof Array) {
				if (a instanceof Array) {
					for (var i = 0, l = a.length; i < l; i++) {
						this.push(a[i]);
					}
				} else {
					this.push(a);
				}
			}
			
			return this;
		};
}	

/*
 *	New functions and variables for the global context - no jQuery dependency
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

var	UNDEF 	= 'undefined',
	LOCAL 	= document.location.protocol === 'file:',
	
	ONEDAY_S	= 60 * 60 * 24,
	ONEDAY_MS	= 60 * 60 * 24 * 1000,

	isEmpty = function(o) {
	
			if (o == null) {
				return true;
			};
			return (Object.getOwnPropertyNames(o)).length === 0;
		},
	
	// Parametrize
	
	paramize = function(o) {
		
			if (typeof o === 'number') {
				return '' + o;
			} else if (typeof o === 'string') {
				return o;
			} else if (typeof o === 'object') {
				// 1 level depth only
				var s = '',
					op = Object.getOwnPropertyNames(o),
					ol = op.length; 
				for (var i = 0; i < ol; i++) {
					if (o[op[i]] !== null) {
						s += '&' + op[i] + '=' + encodeURIComponent(o[op[i]]);
					}
				}
				if (s.length) {
					return s.substring(1);
				}
			}
			return '';
		},
	
	// All elements are true in an array
	
	allTrue = function(o) {
		
			if (o && o.constructor === Array) {
				for (var i = 0; i < o.length; ++i) {
					if (!o[i]) {
						return false;
					}
				}
				return true;
			}
			return o === true;
		},
	
	// Remove empty strings from array
	
	removeEmpty = function(a) {
		
			if (a && a.constructor === Array) {
				var b = new Array(),
					i;
					
				for (i = 0; i < a.length; i++) {
					if (typeof a[i] === 'string' && a[i].length) {
						b.push(a[i]);
					}
				}
				
				return b;
			}
			
			return a;
		},

	// Get event coordinates
	
	getCoords = function(e) {
				var x, y;
				
				if (!e.touches) {
					// No touch
					return { 
						x: e.clientX, 
						y: e.clientY 
					};
				} else if (e.touches.length == 1) {
					return {
						x: e.touches[0].clientX,
						y: e.touches[0].clientY
					}
				} else if (e.changedTouches && e.changedTouches.length == 1) {
					return {
						x: e.changedTouches[0].clientX,
						y: e.changedTouches[0].clientY
					}
				}
				return null;
			},
		
	/*
	 *	Translate function
	 *	returns a translated key, or the default value (if exists), or the key itself de-camelcased
	 */
	
	translate = function(key, def) {
		
			key = key.trim();
			
			if (typeof Texts !== 'undefined') {
				if (Texts.hasOwnProperty(key)) {
					return Texts[key];
				}
			}
			
			if (typeof def !== 'undefined') {
				// Using the default
				if (DEBUG && console) {
					console.log('Using default translation: '+key+'='+def);
				}
				return def;
			}
			
			if (DEBUG && console) {
				console.log('Missing translation: '+key);
			}
			
			var s = key.replace(/([A-Z])/g, ' $1').toLowerCase();
			
			s[0] = s.charAt(0).toUpperCase();
			return s;
		},
	
	/* 
	 *	Simpler method 
	 *	text = getKeys('key1,key2,key3', [defaults])
	 */
	
	getKeys = function(keys, def) {
		
			var t = {}, i, k = keys.split(','), l = k.length;
			
			for (i = 0; i < l; i++) {
				t[k[i]] = translate(k[i], def[k]);
			}
			
			return t;
		},
	
	/*
	 *	Finds translation for each key in def Object
	 *	def should contain only elements that need translation
	 */
	
	getTranslations = function(def) {
		
			var t = {}, k;
			
			for (k in def) {
				if (typeof def[k] === 'object') {
					t[k] = getTranslations(def[k]);
				} else {
					t[k] = translate(k, def[k]);
				}
			}
			
			return t;
		},
	
	// Reading keys: k="name1,name2,... from attr="data-k" into m
	
	readData = function(el, k) {
		
			var o = {};
			
			if (el && el.length && k) {
				k = k.split(',');
				var v;
				for (var i = 0; i < k.length; i++) {
					if ((v = el.data(k[i])) != null) {
						o[k[i]] = v;
					}
				}
			}
			return o;
		},
	
	/*
	 *  Relative date
	 */
	
	getRelativeDate = function(days) {
		
			if (!days)
				return translate('today');
			
			if (days===1)
				return translate('yesterday');
				
			var s, n;
			
			if (days >= 730) {
				s = translate('yearsAgo');
				n = Math.round(days / 365);
			} else if (days >= 60) {
				s = translate('monthsAgo');
				n = Math.round(days / 30.5);
			} else {
				s = translate('daysAgo');
				n = days;
			}
			
			return s.replace('{0}', n);
		},
	
	/*
	 *  Timespan
	 */
	
	getTimespan = function(days) {
		
			if (!days) {
				return translate('inThePast24Hours');
			}
			
			if (days < 2) {
				return translate('inThePast48Hours');
			}
				
			var s, n;
			
			if (days >= 730) {
				s = translate('inThePastNYears');
				n = Math.round(days / 365);
			} else if (days >= 60) {
				s = translate('inThePastNMonths');
				n = Math.round(days / 30.42);
			} else {
				s = translate('inThePastNDays');
				n = days;
			}
			
			return s.replace('{0}', n);
		},

	
	/*
	 *	Relative path:: path/to/folder/ or ../../path/to/folder/
	 *	always ends with '/' unless current folder
	 */
	 
	getRelativePath = function(from, to) {
		
			if (typeof to === UNDEF || !to.length || typeof from === UNDEF || !from.length) {
				// invalid: must be '/' at least
				return '';
			}
			
			if (!to.endsWith('/')) {
				to += '/';
			}
			
			if (from === '/') {
				// from root
				return to;
			}
			
			if (!from.endsWith('/')) {
				from += '/';
			}
			
			if (from === to) {
				// Current folder
				return '';
			}
			
			var up = '../../../../../../../../../../../../../../../../../../../../',
				fa = from.split('/');
			
			if (to === '/') {
				// back to root
				return up.substring(0, fa.length * 3);
			}
			
			// crawl the tree
			var ta = to.split('/');
			
			while (fa.length && ta.length && fa[0] === ta[0]) {
				fa.shift();
				ta.shift();
			}
			
			return up.substring(0, (fa.length - 1) * 3) + ta.join('/');
		},

	
	/*
	 *	Encode the same as Java
	 */
	
	encodeAsJava = function(s) {
			var r = '',
				ap = /^(https?:|file:)?\/\//i;
			
			s = ap.test(s)? encodeURI(s) : encodeURIComponent(s);
			for (i = 0; i < s.length; i++) {
				r += encodeJ[s.charCodeAt(i)] || s.charAt(i);
			}
			
			return r;
		},
	
	/* 
	 *	Pure JS extend function
	 */
	
	extend = function() {
		
			if (arguments.length < 2) {
				return arguments[0] || {};
			}
			
			var r = arguments[0];
			
			for (var i = 1; i < arguments.length; i++) {
				for (var key in arguments[i]) {
					if (arguments[i].hasOwnProperty(key)) {
						r[key] = arguments[i][key];
					}
				}
			}
			
			return r;
		},
	
	/*
	 *	Passing defaults to libraries
	 */
	 
	passDefaults = function(src, dst, props) {
		
			if (src && dst) {
				if (typeof props !== 'undefined') {
					// Copy the requested properties
					props = props.split(',');
					
					for (var i = 0; i < props.length; i++) {
						if (src.hasOwnProperty(props[i])) {
							dst[props[i]] = src[props[i]];
						}
					}
				} else {
					// Copy all
					for (var prop in src) {
						dst[prop] = src[prop];
					}
				}
			}
		},
	
	/*
	 *	Reading user preferences from cookies
	 */
	 
	readUserPrefs = function(dst, props) {
		
			if (typeof props !== 'undefined' && dst) {
				props = props.split(',');
				
				var p;
				
				for (var i = 0; i < props.length; i++) {
					if ((p = $.cookie(props[i])) !== null) {
						dst[props[i]] = p;
					}
				}
			}
		 },
	
	/*
	 *	History management
	 */
	 
	 // Adds one new state component
	 
	 addParam = function(indexName, params, title) {
	
			if (HISTORY) {
				var hash = window.location.hash;
				
				if (hash) {
					// Already has hash
					if (hash.charAt(0) === '#') {
						hash = hash.substring(1);
					}
					params = extend(history.state || hash.objectify(), params);
				}
				
				hash = '#' + paramize(params);
				
				if (hash !== window.location.hash) {
					history.pushState(params, (typeof title === 'undefined')? '' : title, (hash.length > 1)? hash : (indexName || 'index.html'));
				}
			}
		},
	
	// Sets a new state
	
	setParam = function(indexName, params, title) {
	
			if (HISTORY) {
				var hash = '#' + paramize(params);
				
				if (hash !== window.location.hash) {
					history.pushState(params, (typeof title === 'undefined')? '' : title, (hash.length > 1)? hash : (indexName || 'index.html'));
				}
			}
		},

	// Removes one parameter (String)
	
	removeParam = function(indexName, param, title) {
		
			if (HISTORY) {
				var hash = window.location.hash,
					params;
				
				if (hash) {
					if (typeof param === 'undefined') {
						hash = '';
						history.pushState('', '', indexName || 'index.html');
					} else {
						if (hash.charAt(0) === '#') {
							hash = hash.substring(1);
						}
						params = history.state || hash.objectify();
						if (params.hasOwnProperty(param)) {
							delete params[param];
							hash = '#' + paramize(params);
						}
						history.pushState(params, (typeof title === 'undefined')? '' : title, (hash.length > 1)? hash : (indexName || 'index.html'));
					}
				}
			}
		},
	
	// Removing ?search
	
	removeSearch = function(title) {
		
			if (HISTORY) {
				history.replaceState(history.state, (typeof title === 'undefined')? '' : title, window.location.href.replace(window.location.search, ''));
			}
		},
	
	// Reading state object
	
	readParam = function() {
		
			if (HISTORY) {
				if (history.state) {
					return history.state;
				}
				
				var hash = window.location.hash;
				if (hash.charAt(0) === '#') {
					hash = hash.substring(1);
				}
				return  hash.objectify();
			}
			
			return null;
		},
	
	// Printing an image with caption
	
	printImage = function(src, title, caption) {
		
			if (!src) {
				return;
			}
			
			var pw = window.open('about:blank', 'print', 'location=no,status=no,titlebar=no');
			
			pw.document.open();
			pw.document.write('<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>' + (title || 'Print') + '</title>' +
				'\n<script>printOut=function(){window.print();window.close();}</scr' + 'ipt>' + 
				'\n<style>body{margin:0;padding:0;text-align:center;overflow:hidden;}\nimg{display:block;width:100%;height:auto;vertical-align:top;}</style>' +
				'\n</head>\n<body onLoad="setTimeout(printOut,100)">' +
				'<img src="' + src + '">' + (caption || '') + 
				'</body>\n</html>');
			pw.document.close();
		},
	
	// Simple decryption

	xDecrypt = function(c) {
		
			if (!typeof this === 'String') {
				return '';
			}
			
			var xs = [0x93,0xA3,0x57,0xFE,0x99,0x04,0xC6,0x17],
				cl = c.length,
				sl = Math.ceil(cl / 8) * 5,
				src = new Array(sl), 
				r = '', 
				i, 
				j = 0, 
				k, 
				v;
				
			for (i = 0; i < sl; i++) {
				src[i] = 0;
			}
			
			for (i = 0; i < cl; i++) {
				if ((v = c.charCodeAt(i) - 0x30) > 9) {
					v -= 7;
				}
				v <<= 11 - j % 8;
				k = j >> 3;
				if (k < sl) {
					src[k] |= v >> 8;
					if (++k < sl) {
						src[k] |= v & 0xff;
					}
				}
				j += 5;
			}
			
			for (i = 0; i < sl; i++) {
				src[i] ^= xs[i % 8];
			}
			
			sl = src[0] | (src[1] << 8);
			
			for (v = 0, i = 4; i < sl; i++) {
				r += String.fromCharCode(src[i]);
				v += src[i];
			}
			
			if (v != ((src[2] & 0xff) | (src[3] << 8)))
				r = '';
			
			return r;
		},
		
	// Getting computed style
	
	getStyle = function(el, style) {
		
			if (document.defaultView && document.defaultView.getComputedStyle) {
				return document.defaultView.getComputedStyle(el, '').getPropertyValue(style.unCamelCase());
			} else if (el.currentStyle) {
				return e.currentStyle[style];
			}
			
			return null;
		},
		
	// Testing scrollbar width for mobile detection
	
	scrollbarWidth = function() {
		
			var div = document.createElement("div");
			div.style.cssText = 'width:100px;height:100px;overflow:scroll !important;position:absolute;top:-9999px';
			document.body.appendChild(div);
			
			var result = div.offsetWidth - div.clientWidth;
			document.body.removeChild(div);
			
			return result;
		},
		
	// Test for touch support
	
	isTouchEnabled = function() {
		
			if (/Trident/.test(navigator.userAgent)) {
				return (typeof navigator['maxTouchPoints'] !== 'undefined' && navigator.maxTouchPoints); // || /IEMobile/.test(navigator.userAgent);
			} else if (/Edge/.test(navigator.userAgent)) {
				return (scrollbarWidth() == 0);
			} else if (/(Chrome|CriOS)/.test(navigator.userAgent)) {
				return /Mobile/.test(navigator.userAgent) || 'ontouchstart' in window; 
			}
			return 'ontouchstart' in window;
		},
	
	getTouch = function() {
	
			if (/Trident|Edge/.test(navigator.userAgent)) {
				// Setting MS events
				if (window.navigator.pointerEnabled) {
					return {
						'START': 	'pointerdown',
						'MOVE':		'pointermove',
						'END':		'pointerup',
						'CANCEL':	'pointercancel'
					};
				}
				return {
					'START': 	'MSPointerDown',
					'MOVE':		'MSPointerMove',
					'END':		'MSPointerUp',
					'CANCEL':	'MSPointerCancel'
				};
			}
		
			return {
				'START': 	'touchstart',
				'MOVE':		'touchmove',
				'END':		'touchend',
				'CANCEL':	'touchcancel'
			};
		},
	
	// Test for localStorage
	
	hasLocalStorage = function() {
			try {
				localStorage.setItem('_t', 'undefined');
				localStorage.removeItem('_t');
				return true;
			} catch(e) {
				return false;
			}
		},
	
	// Test for history
	
	hasHistory = function() {
			// Taken from Modernizr 3.1
			var ua = navigator.userAgent;
	
			if ((ua.indexOf('Android 2.') !== -1 ||
				(ua.indexOf('Android 4.0') !== -1)) &&
				ua.indexOf('Mobile Safari') !== -1 &&
				ua.indexOf('Chrome') === -1 &&
				ua.indexOf('Windows Phone') === -1) {
			  return false;
			}
	
			return (window.history && 'pushState' in window.history);
		},
	
	// Test for PDF viewer
	// from: https://github.com/featurist/browser-pdf-support/blob/master/index.js
	
	hasPDFViewer = function() {
			var hasAcrobatInstalled = function() {
						var getActiveXObject = function(name) {
								try { return new ActiveXObject(name); } catch(e) {}
							};
		
						return getActiveXObject('AcroPDF.PDF') || getActiveXObject('PDF.PdfCtrl');
					},

				isIos = function() {
						return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
					};
 
			return navigator.mimeTypes['application/pdf'] || hasAcrobatInstalled() || isIos();
		},

	
	// Adding class without jQuery (can be used anytime)
	
	addClass = function(el, className) {
			if (el.classList)
				el.classList.add(className);
			else
				el.className += ' ' + className;
		},

	// Returns browser vendor
	
	getVendor = function() {
			var ua = navigator.userAgent;
			/*
				PC:
					IE 8: "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)"
					IE 9: "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0; .NET CLR 2.0.50727; SLCC2; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; Tablet PC 2.0; .NET4.0C)"
					IE 10: "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; .NET4.0E; .NET4.0C)"
					Opera 12: "Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.15"
					Firefox 21: "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0"
					Chrome 27: "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.94 Safari/537.36"
				Mac:
					Chrome 27: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36"
					Firefox 21: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:21.0) Gecko/20100101 Firefox/21.0"
					Safari 6: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/536.26.14 (KHTML, like Gecko) Version/6.0.1 Safari/536.26.14"
			 */
			if (ua.indexOf('Trident') > 0 || ua.indexOf('Edge') > 0) {
				return 'ms';
			} else if (ua.indexOf('AppleWebKit') > 0) {
				return 'webkit';
			} else if (ua.indexOf('Gecko') > 0) {
				return 'moz';
			} else if (ua.indexOf('Presto') > 0) {
				return 'o';
			} else if (ua.indexOf('Blink') > 0) {
				return 'webkit';
			}
			return '';		
		},
		
	// Loading Google Analytics
	loadGoogleAnalytics = function(siteID, type, supportDoubleclick) {
			
			if (LOCAL) {
				return;
			}
			var sid = xDecrypt(siteID);
			if (type === 'classic') {
				// ga.js - Legacy
				var _gaq = _gaq||[];
				_gaq.push(['_setAccount', sid]);
				_gaq.push(['_trackPageview']);
				(function(d){
						var ga = d.createElement('script');
						ga.async = true;
						ga.src = ('https:'===d.location.protocol? 'https://ssl' : 'http://www') + 
							(supportDoubleclick? '.stats.g.doubleclick.net/dc.js' : '.google-analytics.com/ga.js');
						var s = d.getElementsByTagName('script')[0];
						s.parentNode.insertBefore(ga,s);
					})(document);
			} else if (type === 'universal') {
				// analytics.js
				(function(i,s,o,g,r,a,m){
						i['GoogleAnalyticsObject']=r;
						i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();
						a=s.createElement(o),m=s.getElementsByTagName(o)[0];
						a.async=1;
						a.src=g;
						m.parentNode.insertBefore(a,m)
					})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
				ga('create', sid, 'auto');
				if (supportDoubleclick) {
					ga('require','displayfeatures');
				}
				ga('send', 'pageview');
			} else {
				// gtag.js - allowing sending data
				gtag('config',sid,{'send_page_view':true});
			}
		},
		
	// Loading Google API
	loadGoogleAPI = function(badgeId, boxType) {
			if (LOCAL) {
				return;
			}
			(function(i,s,o,g,r,a,m){
				a=s.createElement(o);
				a.appendChild(s.createTextNode(r));
				m=s.getElementsByTagName(o)[0];
				a.async=1;
				a.src=g;
				m.parentNode.insertBefore(a,m);
			})(window,document,'script',('https:'==document.location.protocol?'https:':'http:')+'//apis.google.com/js/platform.js',"{parsetags:'explicit',lang:'${lang}'}");
			
			var la = 30,
				// Multiple try if ready
				launch = function() {
						if (typeof gapi === 'undefined') {
							if (la--) {
								setTimeout(launch, 200);
							} else if ('console' in window) {
								console.log('Google Plus API failed to load!');
							}
						} else {
							setTimeout(function() {
								gapi[boxType].go();
							}, 200);
						}
					};
					
			if (badgeId) {
				launch();
			}
		},
		
	// Loading Facebook API
	loadFacebookAPI = function(appId,locale) {
			if (LOCAL) {
				return;
			}
			window.fbAsyncInit = function(){
				if (typeof jQuery !== UNDEF) {
					jQuery('.social-links').trigger('updateLinks');
				}
			};
			(function(d,s,id){
				var js, 
				fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
				js = d.createElement(s); 
				js.id = id;
				js.src = 'https://connect.facebook.net/'+(locale||'en_US')+'/sdk.js#xfbml=1&version=v3.0&appId='+xDecrypt(appId);
				fjs.parentNode.insertBefore(js, fjs);
			})(document, 'script', 'facebook-jssdk');
		},
		
	// Loading Disqus API
	loadDisqusAPI = function(appId) {
			if (LOCAL) {
				return;
			}
			(function(d,s) {
				s = d.createElement(s);
				s.async = 1;
				s.src='https://'+xDecrypt(appId)+'.disqus.com/embed.js';
				s.setAttribute('data-timestamp', +new Date());
				(d.head || d.body).appendChild(s);
			})(document,'script');
		},
		
	// Loading Pinterest API
	loadPinterestAPI = function() {
			if (LOCAL) {
				return;
			}
			(function(d,s) {
				s = d.createElement(s);
				s.async = 1;
				s.src = 'https://assets.pinterest.com/js/pinit.js';
				(d.head || d.body).appendChild(s);
			})(document,'script');
		},
	
	// Loading all APIs
	loadAPIs = function(apis, allowed) {
		
			if (apis && !isEmpty(apis)) {
				
				for (var a in apis) {
					
					if (typeof allowed === UNDEF || allowed[a]) {
						
						switch (a) {
						
							case 'googleAnalytics':
								loadGoogleAnalytics(apis[a][0],apis[a][1],apis[a][2]);
								break;
								
							case 'googlePlus':
								loadGoogleAPI(apis[a][0],apis[a][1]);
								break;
								
							case 'facebook':
								loadFacebookAPI(apis[a][0]);
								break;
								
							case 'disqus':
								loadDisqusAPI(apis[a][0]);
								break;
								
							case 'pinterest':
								loadPinterestAPI();
								break;
						}
					}
				}
			}
		},
	
	// Asking permission first to load APIs
	
	askTrackingConsent = function(settings, apis) {
		
			if ((!apis || isEmpty(apis)) && !settings['cookiePolicy']) {
				return;
			}
			
			settings = $.extend({}, {
					stay: 		15
				}, settings);
			
			apis = apis || {};
			
			var text = getTranslations({		// Translated texts
						cookiePolicyText:		'This album is using cookies to remember your preferences. It does not track you, neither it stores personal data.',
						cookiePolicyLearnMore:	'Learn more',
						cookiePolicyAgree:		'Got it',
						gdprComplianceText:		'This site is using the following external services that might track your visits anonymously. Disabling tracking will stop their functionality.',
						allowAll:				'Allow all',
						denyAll:				'Deny all',
						allowSelected:			'Allow selected'
					}),
				tc = $.cookie('trackingConsent'),
				showApis = false,
				showCp = false,
				oncl = 'icon-checkbox-checked',
				offcl = 'icon-checkbox-unchecked',
				
				// Toggle one button
				toggleApi = function(e) {
						var b = $(e.target),
							sel = b.hasClass(oncl);
					
						b.toggleClass(oncl, !sel).toggleClass(offcl, sel);
						
						setButtons();
					},
				
				// Set visibility of "Allow all", "Deny all" and "Allow selected" buttons
				setButtons = function() {
						var any = $('#trackingConsent span.' + oncl).length > 0;
						
						$('#allow,#deny').toggle(!any);
						$('#allowsel').toggle(any);
					},
					
				// Saving the cookie, and launching the APIs
				saveCookie = function(e) {
						var allowed,
							btns = $('#trackingConsent span');
						
						// Based on the old setting
						allowed = $.extend({}, $.cookie('trackingConsent'), { cookie: 1 });
						
						if (this.id === 'allow') {
							btns.each(function() {
								$(this).removeClass(offcl).addClass(oncl);
								allowed[$(this).attr('id')] = 1;
							});
						} else if (this.id === 'deny') {
							btns.each(function() {
								$(this).removeClass(oncl).addClass(offcl);
								allowed[$(this).attr('id')] = 0;
							});
						} else if (this.id === 'allowsel') {
							btns.each(function(i) {
								allowed[$(this).attr('id')] = $(this).hasClass(oncl);
							});
						}
						
						$.cookie('trackingConsent', allowed, 31622400); // lasts 1 year
						
						removePopup();
						
						loadAPIs(apis, allowed);
						
						return false;
					},
					
				// Check for missing API consents
				matchApis = function() {
						
						for (var a in apis) {
							if (!tc.hasOwnProperty(a)) {
								return false;
							}
						}
						return true;
					},
				
				// Removing popup
				removePopup = function() {
						$('#cookiepolicy').fadeOut(500, function() { 
							$(this).remove(); 
						});
					};
			
			if (!tc) {
				showApis = showCp = true;
			} else {
				// Checking for changes
				showApis = !matchApis(tc, apis);
				showCp = settings.cookiePolicy && !tc.hasOwnProperty('cookie');
			}
		
			if (!showApis) {
				// Already allowed
				loadAPIs(apis, tc);
			} 
			
			if (showApis || showCp) {
				
				// Container
				var	el = $('<div>', { 
							id: 	'cookiepolicy' 
						}).appendTo($('body')),
					p;
					
				// Close button
				el.append($('<a>', {
						'class':	'close',
						html:		'&times;'
					}).on('click', removePopup));
				
				if (showCp) {
					// Showing cookie policy text 
					p = $('<p>', {
							id:			'cookiePolicy',
							html: 		text.cookiePolicyText 
						}).appendTo(el);
					
					if (!showApis) {
						// Only Cookie policy: add Agree button + readmore
						p.append($('<a>', {
								id:			'agree',
								'class': 	'btn',
								text: 		text.cookiePolicyAgree 
							}).on('click', saveCookie));
						
						if (settings.cookiePolicyUrl) {
							p.append(' ').append($('<a>', { 
									text: 		text.cookiePolicyLearnMore, 
									target: 	'_blank', 
									href: 		settings.cookiePolicyUrl 
								}));
						}
					}
				}
				
				if (showApis) {
					// Show APIs
					
					p = $('<p>', { 
							id:			'trackingConsent',
							html: 		text.gdprComplianceText 
						}).appendTo(el);
							
					for (var a in apis) {
						p.append($('<span>', {
								id:			a,
								'class':	(tc && tc[a])? oncl : offcl,
								html:		'&nbsp;' + a.capitalize()
							})
							.on('click', toggleApi));
					}
					
					p.append($('<a>', {
							id:			'allow',
							'class': 	'btn',
							text: 		text.allowAll 
						}).on('click', saveCookie));
					
					p.append($('<a>', {
							id:			'deny',
							'class': 	'btn',
							text: 		text.denyAll 
						}).on('click', saveCookie));
					
					p.append($('<a>', {
							id:			'allowsel',
							'class': 	'btn',
							text: 		text.allowSelected 
						}).on('click', saveCookie));
				
					setButtons();
				
					if (settings.cookiePolicyUrl) {
						p.append(' ').append($('<a>', { 
								text: 		text.cookiePolicyLearnMore, 
								target: 	'_blank', 
								href: 		settings.cookiePolicyUrl 
							}));
					}
				}
				
				el.fadeIn(500);
				
				setTimeout(function() {
						$('#cookiepolicy').fadeOut(500, function() { 
							$(this).remove(); 
						});
					}, settings.stay * 1000);
			
			}
		},
		
	/*
	 *	New constants
	 */

	NOLINK 			= 'javascript:void(0)',
	LOCALSTORAGE 	= hasLocalStorage(),
	HISTORY			= hasHistory(),
	VEND 			= getVendor(),
	BACKFACEBUG		= (navigator.userAgent.indexOf('Edge') > 0) && (parseInt(navigator.userAgent.match(/Edge\/(\d+\.\d+)/)[1]) <= 16),
	FITCONTENT		= (function() {
							if (/Trident/.test(navigator.userAgent) || /Edge/.test(navigator.userAgent)) {
								document.getElementsByTagName('html')[0].classList.add('no-fitcontent');
								return false;
							}
							document.getElementsByTagName('html')[0].classList.add('fitcontent');
							return true;
						})(),
	ISIOSDEVICE		= (navigator.userAgent.match(/ipad|iphone|ipod/i)),
	TOUCH			= getTouch(),
	TOUCHENABLED	= isTouchEnabled(),
	HIDPI			= matchMedia("(-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2), (min-resolution: 192dpi)").matches;
 	HASPDFVIEWER	= hasPDFViewer(),
	
	// Adding 'touch' : 'no-touch' classes
	addClass(document.getElementsByTagName('html')[0], (TOUCHENABLED? '' : 'no-') + 'touch');
	// Adding 'hidpi' : 'no-hdpi' classes
	addClass(document.getElementsByTagName('html')[0], (HIDPI? '' : 'no-') + 'hidpi');
	
	
/*	
 *	Debugging functions
 */

var log = function() {},
	DEBUG = (typeof DEBUG === 'undefined')? false : DEBUG;

// Waiting for jQuery loaded

(function($, undefined) {
	'use strict';
	// log: logging function
	
	var _logel, 
		_logover = false, 
		_lastlog, 
		_lastcnt = 1;
	
	log = function(c) {
		
			var resolveObject = function(c) {
				if ($.isArray(c)) {
					var s = '';
					for (var i = 0; i < c.length; i++) {
						s += resolveObject(c[i]) + ', ';
					}
					return '[ ' + s.substring(0, s.length-2) + ' ]';
				} else if (typeof c === 'object') {
					var s = '';
					for (var i in c) {
						s += i + ': ' + resolveObject(c[i]) + ',<br>';
					}
					return '{ ' + s + ' }';
				} else if (isNaN(c)) {
					return c;
				} else {
					return (parseInt(c) === c)? c : c.toFixed(4);
				}
			};
						
			if (!DEBUG || _logover) {
				return;
			}
			if (!_logel) {
				_logel = $('<div id="log" style="position:fixed;left:0;top:0;width:200px;bottom:0;overflow:auto;padding:10px;background-color:rgba(0,0,0,0.5);color:#fff;font-size:0.75em;z-index:999999"></div>').hover(function(){
					_logover = true;
				}, function() {
					_logover = false;
				}).appendTo('body');
			}
			if (c === _lastlog) {
				_logel.children().first().empty().html(_lastlog + ' <sup>(' + (++_lastcnt) + ')</sup>');
			} else {
				$('<div style="height:3em;overflow:auto;">' + resolveObject(c) + '</div>').prependTo(_logel);
				_lastlog = c;
				_lastcnt = 1;
			}
		};
	
	// logEvents :: debugging events
	
	$.fn.logEvents = function( e ) {
			
			if (!DEBUG) {
				return;
			}
			
			var events = e || 'mousedown mouseup mouseover mouseout mousewheel wheel dragstart click blur focus load unload reset submit change abort cut copy paste selection drag drop orientationchange touchstart touchmove touchend touchcancel pointerdown pointermove pointerup MSPointerDown MSPointerMove MSPointerUp gesturestart gesturechange gestureend';
	
			return this.each(function() {
				$(this).on(events, function(e) {
					if (typeof e === 'undefined') {
						log('Undefined event');
					} else if (e.target) {
						if (e.target.id !== 'log') { 
							log(e.type + ' <span style="padding:0 4px;font-size:0.75em;background-color:#000;border-radius:4px;"><b>' + (e.target.nodeName? e.target.nodeName.toLowerCase() : '???') + '</b>' + (e.target.id? (':'+e.target.id) : '') + '</span>' + 
								(e.relatedTarget? (' <span style="padding:0 4px;font-size:0.6em;background-color:#800;border-radius:4px;"><b>' + e.relatedTarget.nodeName.toLowerCase() + '</b>' + (e.relatedTarget.id? (':'+e.relatedTarget.id) : '') + '</span>') : ''));
						}
					} else {
						log('No event target!');
					}
					return true;
				});
			});
		};
	
	// logCss :: tracks css values until the element is live
	
	$.fn.logCss = function( p, dur, step ) {
			if (!DEBUG) {
				return;
			}
			
			step = step || 20;
			dur = dur || 2000;
			var t0 = new Date();
			
			return this.each(function() {
				var el = $(this);
				var show = function( nm ) {
					var t = new Date() - t0;
					log(t + '&nbsp;::&nbsp;' + nm + ' = ' + el.css(nm));
					if (t > dur) {
						clearInterval(iv);
					}
				};
				
				var iv = setInterval(function() {
					if ( $.isArray(p) ) {
						for (var i = 0; i < p.length; i++) {
							show(p[i]);
						}
					}
					else {
						show(p);
					}
				}, step);
			});
		};
		
	// Deserialize a serialized string
	
	if ($.fn.deserialize === undefined) {
		$.fn.deserialize = function (s) {
				
				if (!s) {
					return this;
				}
			
				var self = $(this),
					values = s.replace(/\+/g, '%20').split('&');
			
				$.each(values, function(i, pair) {
					var val = pair.split('='),
						name = decodeURIComponent(val[0]),
						value = decodeURIComponent(val[1]),
						field = self.find('[name=' + name + ']');
					
					if (field[0].type === 'radio' || field[0].type === 'checkbox') {
						
						var fieldVal = field.filter('[value="' + value + '"]'),
							found = fieldVal.length;
							
						if (!found && value === 'on') {
							field.eq(0).prop('checked', true);
						} else {
							fieldVal.prop('checked', found);
						}
						
					} else { 
						// input, textarea
						field.val(value);
					}
				});
				
				return this;
			};
	}
	
	// Making $.when working with arrays
	
	if ($.when.all === undefined) {
		$.when.all = function(deferreds) {
				var deferred = new $.Deferred();
				$.when.apply($, deferreds).then(
					function() {
						deferred.resolve(Array.prototype.slice.call(arguments));
					},
					function() {
						deferred.fail(Array.prototype.slice.call(arguments));
					}
				);
				return deferred;
			};
	}
	
	
	$.fn.waitAllImg = function(doneFn, successFn, failFn) {
		
			if (!this.length) {
				doneFn.call(self);
				return;
			}
			
			var self = $(this),
				deferreds = [],
				
				loadImage = function(image) {
					var deferred = new $.Deferred(),
						img = new Image();
						
					img.onload = function() {
						deferred.resolve(image);
					};
					
					img.onerror = function() {
						deferred.reject(new Error('Image not found: ' + image.src));
					};
					
					img.src = image.src;
					
					return deferred;
				},
				
				loadImages = function(imgs) {
					
					imgs = imgs.filter('img[src!=""]');
					
					imgs.each(function() {
						deferreds.push(loadImage(this));
					});
					
					return $.when.all(deferreds);
				};
			
			loadImages(self).then(
				
				function(self) {
					if ($.isFunction(successFn)) {
						successFn.call(self);
					}
				},
				
				function(err) {
					if ($.isFunction(failFn)) {
						failFn.call(err);
					}
				}
				
			).then(function() {
				if ($.isFunction(doneFn)) {
					doneFn.call(self);
				}
			});
			
			return this;
		};
	
	
	var isFullscreen = function() {
				return document.fullscreenElement ||
					document.webkitFullscreenElement ||
					document.mozFullScreenElement ||
					document.msFullscreenElement;
			},
	
		requestFullscreen = function( e ) {
				if (!isFullscreen()) {
					if (e.requestFullscreen) {
						e.requestFullscreen();
					} else if (e.webkitRequestFullscreen) {
						e.webkitRequestFullscreen();
					} else if (e.mozRequestFullScreen) {
						e.mozRequestFullScreen();
					} else if (e.msRequestFullscreen) {
						document.body.msRequestFullscreen();
						// Works only on body :(
						// e.msRequestFullscreen();
					}
				}
			},
		
		exitFullscreen = function() {
				if (isFullscreen()) {
					if (document.exitFullscreen) {
						document.exitFullscreen();
					} else if (document.webkitExitFullscreen) {
						document.webkitExitFullscreen();
					} else if (document.mozCancelFullScreen) {
						document.mozCancelFullScreen();
					} else if (document.msExitFullscreen) {
						document.msExitFullscreen();
					}
				}
			};
	
	$.fn.fullScreen = function(v) {
		
			if (document.fullscreenEnabled || 
				document.webkitFullscreenEnabled || 
				document.mozFullScreenEnabled ||
				document.msFullscreenEnabled
			) {
				// no state supplied :: returning the fullscreen status
				if (typeof v === 'undefined') {
					return isFullscreen();
				} else if (v) {
					requestFullscreen(this[0]);
				} else {
					exitFullscreen();
				}
				
			} else {
				return false;
			}
			
		};
	
})(jQuery);
