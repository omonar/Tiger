/*jslint browser: true*/
;( function($, window, document, undefined) {
	'use strict';
	
	/*
	 *	Google Maps functions
	 *	canvas is a jQuery element with data('location') and other optional parameters
	 */

			
	$.fn.addMap = function(options) {
		
		options = $.extend({}, $.fn.addMap.defaults, options);
		
		var getLatLng = function(ll) {
					var lat, lng;
					if (typeof ll === 'string') {
						ll = ll.split(',');
						lat = parseFloat(ll[0]);
						lng = (ll.length > 1)? parseFloat(ll[1]) : 0;
					} else {
						lat = ll[0] || ll['lat'] || 0;
						lng = ll[1] || ll['lng'] || 0;
					}
					return {
						lat: lat,
						lng: lng 
					};
				},
			
			processLatLng = function(markers) {
					for (var i = 0; i < markers.length; i++) {
						if (markers[i].hasOwnProperty('pos') && !(markers[i].hasOwnProperty('latLng'))) {
							markers[i]['latLng'] = getLatLng(markers[i]['pos']);
						}
					}
				},
			
			getBounds = function(markers) {
					var	e = -180,
						n = -90,
						s = 90,
						w = 180,
						ll;
						
					for (var i = 0; i < markers.length; i++) {
						ll = markers[i]['latLng'];
						if (ll) {
							if (w > ll.lng) {
								w = ll.lng;
							}
							if (s > ll.lat) {
								s = ll.lat;
							}
							if (e < ll.lng) {
								e = ll.lng;
							}
							if (n < ll.lat) {
								n = ll.lat;
							}
						}
					}
					
					if (e < w) {
						e = 180;
						w = -180;
					}
					
					if (n < s) {
						n = 90;
						s = -90;
					}
					
					return {
						east: 	e,
						west: 	w,
						north: 	n,
						south: 	s
					};
				},
			
			loadMap = function(canvas, options) {
			
					if (typeof google === 'undefined' || !google.maps) {
						// No API is loaded yet
						var script = document.createElement('script');
						script.type = 'text/javascript';
						script.src = options.apiUrl + ((typeof options.apiKey === 'undefined')? '' : ('?key=' + options.apiKey));
						//canvas.attr('id', 'map-canvas');
						script.onload = function() {
							setTimeout(function() {
								showMap(canvas, options);
							}, 40);
						}
						document.body.appendChild(script);
						return;
					} else {
						// API is ready
						showMap(canvas, options);
					}
				},
				
			showMap = function(canvas, options) {
					var map,
						marker,
						clicked = function() {
								if ($.isFunction(options.click)) {
									options.click.call(this);
								}
							};
						
					if (options.markers && options.markers.length > 1) {
						
						processLatLng(options.markers);
						
						var bounds = getBounds(options.markers),
							cnt = options.markers.length;
						
						map = new google.maps.Map(canvas[0], {
								center: 			{
														lat:	(bounds.north + bounds.south) / 2,
														lng:	(bounds.east + bounds.west) / 2
													},
								zoom: 				options.zoom,
								mapTypeId: 			options.type,
								fullscreenControl: 	options.fullscreenControl,
								scrollwheel: 		false,
								panControl:			false,
								controlSize:		32
							});
						
						for (var i = 0; i < cnt; i++) {
							if (options.markers[i].hasOwnProperty('latLng')) {
								marker = new google.maps.Marker({
									position:	options.markers[i]['latLng'],
									//color:		'hsl(' + (i / cnt * 360) + ',60%,60%)', 
									map: 		map
								});
								
								if (options.markers[i].hasOwnProperty('title')) {
									marker.setTitle(options.markers[i]['title']);
								}
	
								if (options.markers[i].hasOwnProperty('link')) {
									marker.link = options.markers[i]['link'];
									google.maps.event.addListener(marker, 'click', clicked);
								}
							}
						}
						
						if (options.fitBounds && (bounds.east !== bounds.west || bounds.north !== bounds.south)) {
							google.maps.event.addListenerOnce(map, 'idle', function() {
									map.fitBounds(bounds);
								});
						}
						
					} else {
						
						var pos = getLatLng(options.location || options.markers[0].pos);
						
						map = new google.maps.Map(canvas[0], {
								center: 			pos, 
								zoom: 				options.zoom,
								mapTypeId: 			options.type,
								fullscreenControl: 	options.fullscreenControl,
								scrollwheel: 		false,
								panControl:			false,
								controlSize:		32
							});
						
						marker = new google.maps.Marker({
								position:		pos, 
								map: 			map
							});
					}
					
					// Events
					
					if (options.hasOwnProperty('onTypeChanged') && $.isFunction(options.onTypeChanged)) {
						google.maps.event.addListener(map, 'maptypeid_changed', function() {
							options.onTypeChanged.call(map.getMapTypeId());
						});
					}
					
					if (options.hasOwnProperty('onZoomChanged') && $.isFunction(options.onZoomChanged)) {
						google.maps.event.addListener(map, 'zoom_changed', function() {
							options.onZoomChanged.call(map.getZoom());
						});
					}
					
				};
				
		
		if (location.protocol !== 'file:' && location.host !== 'localhost') {
			return $(this).each(function() {
					loadMap($(this), $.extend(options, readData($(this), "location,type,zoom,label,markers,current")));
				});
		}
		
		return this;
		
	};
					
	$.fn.addMap.defaults = {
			apiUrl:					'https://maps.googleapis.com/maps/api/js',
			zoom:					16,
			fitBounds:				true,
			type:					'roadmap',
			fullscreenControl:		true
		};
	
})(jQuery, window, document);
