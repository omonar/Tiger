/*
 * 	Advent calendar component
 *	jslint browser: true
 */
 
 ;(function($, $window, $document, undefined) {
	'use strict';

	$.fn.adventCalendar = function(settings) {

			if ($(this).data('adventcalendar')) {
				settings = $.extend({}, settings, $(this).data('adventcalendar'));
			}
			
			settings = $.extend({}, $.fn.adventCalendar.defaults, settings);
					
			if (!settings.hasOwnProperty('start') || !settings.hasOwnProperty('duration')) {
				console.log('Advent Calendar error: No start date or duration specified!');
				return;
			}
			
			var defaults = $.extend({}, {
						thumbsVisible:					true,
						captionVisible:					true,
						fitImages:						true,
						scaleUp:						true
					}, settings.lightbox),
				album,
				items,
				self = $(this), 
				thumbs = self.find('.' + settings.cardClass).not('.empty'),
				ns = 'lac_' + Math.floor(Math.random() * 10000),
				opened = [],
				title = '',
				
				loadData = function() {
						var d;
						
						if (d = localStorage.getItem('advcalendar_' + title)) {
							opened = d.split(':');
						}
						
						while (opened.length < settings.duration) {
							opened.push('0');
						}
					},
					
				saveData = function() {
						
						localStorage.setItem('advcalendar_' + title, opened.join(':'));
					},
					
				initThumbs = function() {
					
						var d = new Date(settings.start),
							now = new Date(),
							items = this,
							
							loadImage = function(i, refresh) {
									var card = thumbs.eq(i),
										item = items[i % items.length],
										a = card.find('.' + settings.thumbClass),
										img;
									
									card.data(J.OBJ, item);
									
									if (album.isLightboxable(item)) {
										card.addClass(settings.lbableClass);
									}
									
									img = $('<img>', {
											'class':	'hide-image'
										}).appendTo(a);
										
									img.one('load.' + ns, function() {
											$(this).addClass('show-image')
												.removeClass('hide-image');
										})
										.on('click.' + ns, function() {
											thumbs.trigger('lightboxLoad', $(this).closest(	'.' + settings.cardClass));
										})
										.attr('src', album.getThumbPath(item));
									
									if (img[0].complete) {
										img.trigger('load');
									}
								
									if (refresh) {
										self.trigger('lightboxRemove');
										setTimeout(function() {
												self.lightbox(album, defaults);
											}, 250);
									}
								};
						
						if (!items || !items.length) {
							return;
						}
						
						thumbs.each(function(i) {
								var cover = $(this).find('.' + settings.coverClass);
								
								if (now > d) {
									if (opened[i] === '1') {
										cover.hide();
										loadImage(i);
										$(this).addClass(settings.openingClass);
									} else {
										cover.addClass(settings.canopenClass);
										cover.on('click', function() {
												var card = $(this).closest('.' + settings.cardClass),
													i = card.data('num');
												
												loadImage(i, true);
												
												card.addClass(settings.openingClass);
													
												setTimeout(function() {
														cover.remove();
													}, settings.transLength / 2);
													
												opened[i] = '1';
												saveData();
											});
									}
								} else {
									cover.addClass(settings.cannotopenClass);
								}
								
								$(this).data('num', i);
								
								d.setDate(d.getDate() + 1);
							});
						
						
						self.lightbox(album, defaults);
					
					},
					
				init = function() {
						
						title = album.getRootProperty(J.NAME);
						
						loadData();

						items = album.collectByDate({
								range:		9999,
								max:		settings.duration,
								sort:		settings.select === 'latest',
								reverse:	true,
								depth:		'tree',
								ready:		initThumbs
							});
						
					
					};
								
			album = new Album($, {
					indexName:		settings.indexName,
					rootPath:		settings.rootPath,
					relPath:		settings.relPath,
					audioPoster:	settings.audioPoster,
					videoPoster:	settings.videoPoster,
					ready: 			init
				});
			
		};
		
	$.fn.adventCalendar.defaults = {
			indexName:			'index.html',
			relPath:			'',
			rootPath:			'',
			audioPoster:		'audio.poster.png',
			videoPoster:		'video.poster.png',
			duration:			24,
			transLength:		1000,
			select:				'latest',
			cardClass:			'card',
			thumbClass:			'thumb',
			coverClass:			'cover',
			canopenClass:		'canopen',
			cannotopenClass:	'cannotopen',
			lbableClass:		'lbable',
			openingClass:		'open'
		};
		
	$('[data-adventcalendar]').adventCalendar();
		
})(jQuery, jQuery(window), jQuery(document));