/*	
 *	cookie() :: Cookie handling - using localStorage if exists
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: 
 *		cookie( key ) :: returns cookie or null
 *		cookie( key, null ) :: deletes cookie
 *		cookie( key, value, [expire]) :: saves cookie, expire in # seconds - default expiry is 1 hour
 */
 
(function($) {
	'use strict';
				
	var LOCALSTORAGE = (function(){
			try {
				localStorage.setItem('_t', VER);
				localStorage.removeItem('_t');
				return true;
			} catch(e) {
				return false;
			}
		}());
	
	$.cookie = function(key, value, expire) { 
		
		var cookie_sep = '; @',
			
			getVal = function(v) {
					return (/^(true|yes)$/).test(v)? true : 
						((/^(false|no)$/).test(v)? false : ((/^([\d.]+)$/).test(v)? parseFloat(v) : v));
				},
				
			cookie_val = function(v) {
					
					if (typeof v !== 'string') {
						return v;
					}
					
					if (v[0] === '[' || v[0] === '{') {
						v = JSON.parse(v);
						
						for (var o in v) {
							if (typeof o[v] === 'string') {
								o[v] = getVal(o[v]);
							}
						}
						return v;
					}
					
					return getVal(v);
				};
		
		if (arguments.length > 1) { 
			
			// write
			var d = new Date();
			
			if (value === null) {
				
				// remove
				if (LOCALSTORAGE) {
					localStorage.removeItem(key);
				} else {
					document.cookie = encodeURIComponent(key) + '=' + '; expires=' + d.toGMTString() + "; path=/";
				}
				
			} else {
				
				if (typeof value === 'object') {
					value = JSON.stringify(value);
				} else {
					value = String(value);
				}
				
				// store
				d.setTime(d.getTime() + (((typeof expire !== 'number')? 3600 : expire) * 1000));
				
				if (LOCALSTORAGE) {
					localStorage.setItem(key, value + cookie_sep + String(d.getTime()));
				} else {
					document.cookie = encodeURIComponent(key) + '=' + value + '; expires=' + d.toGMTString() + "; path=/";
				}
			}
			
			return value;
		
		} else if (key) { 
			
			// read
			if (LOCALSTORAGE) {
				
				var v = localStorage.getItem(key);
				
				if (v) {
					v = v.split(cookie_sep);
					
					if (v.length === 1) {
						v = v[0].split('; ');
					}
					
					if (v.length > 1) {
						var d = new Date();
						if (d.getTime() < parseInt(v[1], 10)) {
							// not yet expired 
							return cookie_val(v[0]);
						} else {
							// remove expired cookie
							localStorage.removeItem(key);
						}
					} else {
						// no expiration was set
						return cookie_val(v);
					}
				}
				
			} else {
				
				var c = document.cookie.split(/;\s*/),
					v;
					
				key += '=';
				
				for (var i = 0; i < c.length; i++) {
					if (c[i].substring(0, key.length) === key) {
						return cookie_val(c[i].substring(key.length));
					}
				}
			}
		}
		
		return null;
	};
	
})(jQuery);
