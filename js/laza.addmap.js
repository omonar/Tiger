/*jslint browser: true*/
;(function($, window, document, undefined) {
	'use strict';
	
	/*
	 *	Google Maps functions
	 *	canvas is a jQuery element with data('location') and other optional parameters
	 */

			
	$.fn.addMap = function(settings) {
		
		settings = $.extend({}, $.fn.addMap.defaults, settings);
			
		return this.each(function() {

				var canvas 	= 	$(this),						// Map root
					ns		=	canvas.data('map-ns');			// Namespace
				
				if (typeof ns !== UNDEF) {
					// Already instantitated
					return;
				}
				
				var	options =  	$.extend({}, settings, readData(canvas, 'location,type,zoom,label,markers,current')),
					map,
					marker = [],
					active = -1,
					bounds,
					boundsApplied = false,
					
					getMarkerByName = function(n) {
						
							for (var i = 0; i < marker.length; i++) {
								if (marker[i]['link'] === n) {
									return i;
								}
							}
							
							return -1;
						},
					
					// Animates a marker and centers map around this marker
					
					animateMarker = function(m) {
							m.setAnimation(google.maps.Animation.BOUNCE);
							map.setCenter(m.getPosition());
						},
							
					// Sets a marker as active
					
					setActive = function(e, n) {
							
							if (typeof n !== UNDEF) {
								
								if (active >= 0) {
									marker[active].setAnimation(null);
									active = -1;
								}
								
								if (typeof n !== 'number') {
									n = getMarkerByName(n);
								}
								
								if (n >= 0 && n < marker.length) {
									animateMarker(marker[n]);
									active = n;
									return false;
								}
							}
							
							return true;
						},
					
					// Refreshing map, if it was rendered on a hidden layer
					
					refresh = function() {
							
							if (!boundsApplied) {
								fitBounds();
								if (active !== -1) {
									map.setCenter(marker[active].getPosition());
								}
							}
						},
						
					// Fits map into bounds
					
					fitBounds = function() {
							if (canvas.is(':visible') && options.fitBounds && bounds) {
								map.fitBounds(bounds);
								//google.maps.event.trigger(map, 'resize');
								map.panToBounds(bounds);
								boundsApplied = true;
							}
						},
						
					// Reset marker animations
					
					resetMarkers = function() {
						
							if (marker && marker.length) {
								
								if (active >= 0) {
									if (marker[active].getAnimation() !== null) {
										marker[active].setAnimation(null);
									}
									active = -1;
								}
								
								if (bounds) {
									fitBounds();
								}
							}
						},
								
					// Marker clicked event
						
					markerClicked = function() {
						
							if (marker && marker.length) {
								
								if (active >= 0) {
									if (marker[active].getAnimation() !== null) {
										marker[active].setAnimation(null);
									}
									active = -1;
								}
								
								animateMarker(this);
							}
							
							if (typeof options.onMarkerClick === FUNCTION) {
								options.onMarkerClick.call(this);
							}
						},
						
					// Loading script

					loadScript = function(doneFn) {
							
							var readyFn = function(doneFn) {
												// API is ready
												
												// internal ready function
												if (typeof doneFn === FUNCTION) {
													doneFn.call(null);
												}
												
												// external ready function
												if (typeof options['onReady'] === FUNCTION) {
													options.onReady.call(this);
												}
											};
					
							if (typeof google === 'undefined' || !google.maps) {
								// No API has loaded yet
								var script = document.createElement("script");
								script.type = "text/javascript";
								script.src = options.apiUrl + "?key=" + (options['apiKey'] || "");
								script.onload = function() {
										setTimeout(readyFn, 100, (typeof doneFn === FUNCTION)? doneFn : null);
									}
								
								document.body.appendChild(script);
								
							} else {
								
								readyFn(doneFn);
							}
							
						},

					// Rendering map

				
					renderMap = function(e, doneFn) {
							
							if (canvas.data('rendered')) {
								return;
							}
							
							var	delay,
								
								// Adding markers one-by-one with delay
								addMarker = function(i) {
										
										if (i < options.markers.length) {
											
											if (options.markers[i].hasOwnProperty('latLng')) {
												marker[i] = new google.maps.Marker({
														map: 			map,
														position:		options.markers[i]['latLng'],
														//color:		'hsl(' + (i / cnt * 360) + ',60%,60%)', 
														animation: 		google.maps.Animation.DROP
													});
												
												if (options.markers[i].hasOwnProperty('title')) {
													marker[i].setTitle(options.markers[i]['title']);
												}
					
												if (options.markers[i].hasOwnProperty('link')) {
													marker[i].link = options.markers[i]['link'];
													google.maps.event.addListener(marker[i], 'click', markerClicked);
												}
											}
											
											// Calling the next with delay
											setTimeout(addMarker, delay, i + 1);
											
										} else {
											// All markers added
											// Fit bounds if more than 1 marker
											if (options.markers.length > 1) {
												fitBounds();
											}
										}
									};
									
							
							if (!options.hasOwnProperty('markers')) {
								if (options.hasOwnProperty('location')) {
									var ll = options.location.split(',');
									options.markers = [{ 
											latLng: 	{ 
															lat:	parseFloat(ll[0]),
															lng:	parseFloat(ll[1])
														}
										}];
								} else {
									console.log('Error: initializing Map with no location!');
									options.markers = [{ 
											latLng: 	{ 
															lat: 	0, 
															lng: 	0 
														}
										}];
								}
								
							} else {
							
								// Converting between different location formats
								for (var i = 0, ll; i < options.markers.length; i++) {
									if (options.markers[i].hasOwnProperty('pos') && !options.markers[i].hasOwnProperty('latLng')) {
										ll = options.markers[i].pos.split(',');
										options.markers[i].latLng = {
												lat:	parseFloat(ll[0]),
												lng:	parseFloat(ll[1])
											};
									}
								}
							}
							
							// Delay: used to delay between dropping pins
							
							delay = Math.minMax(10, Math.round(1000 / options.markers.length), 100);
							
							// Get boundaries
							
							if (options.markers.length > 1) {
								// Only if more than 1 marker
								bounds = new google.maps.LatLngBounds()
								for (var i = 0; i < options.markers.length; i++) {
									bounds.extend(options.markers[i].latLng);
								}
							}
							
							// Creating Map
							
							map = new google.maps.Map(canvas[0], {
										mapTypeId: 			options.type,
										fullscreenControl: 	options.fullscreenControl,
										scrollwheel: 		options.enableScrollWheel,
										panControl:			false,
										controlSize:		32
									});
								
							// Center around the single marker
							
							if (options.markers.length <= 1) {
								map.setCenter(options.markers[0]['latLng']);
								map.setZoom(options.zoom);
							}
							
							// Adding markers
							
							addMarker(0);
					
							// Events
							
							if (typeof options['onTypeChanged'] === FUNCTION) {
								google.maps.event.addListener(map, 'maptypeid_changed', function() {
										options.onTypeChanged.call(map.getMapTypeId());
									});
							}
							
							if (typeof options['onZoomChanged'] === FUNCTION) {
								google.maps.event.addListener(map, 'zoom_changed', function() {
										options.onZoomChanged.call(map.getZoom());
									});
							}
							
							canvas.data('rendered', true);
							
							canvas.on('setActive', setActive);
							
							canvas.on('resetMarkers', resetMarkers);
							
							canvas.on('refresh', refresh);
							
							if (typeof doneFn === FUNCTION) {
								doneFn.call(null);
							}
						};
				
				// Loading script
				
				if (options.autoLoad) {
					// Rendering map immediately upon load
					loadScript(renderMap);
				} else {
					// Render later on trigger('render')
					loadScript();
				}
				
				canvas.on('render', renderMap);
				
			});
		
		};
					
	$.fn.addMap.defaults = {
			apiUrl:					'https://maps.googleapis.com/maps/api/js',
			zoom:					16,
			fitBounds:				true,
			type:					'roadmap',
			fullscreenControl: 		false,
			enableScrollWheel:		false,
			autoLoad:				true
		};
	
})(jQuery, window, document);
