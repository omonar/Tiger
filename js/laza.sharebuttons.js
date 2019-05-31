/* 
 *	Rendering share buttons
 */

;(function($) {
	'use strict';
	$.fn.renderShares = function(settings) {
		
		settings = $.extend({}, $.fn.renderShares.defaults, settings);
		
		var self = 				$(this),
			text = 				getTranslations({
										share: 			'Share',
										shareOn: 		'Share on',
										checkThisOut: 	'Found this page',
										localWarning: 	'Can\'t share local albums. Please upload your album first!'
									}),
			call = 				encodeURIComponent(settings.callAction || text['checkThisOut']),
			label = 			settings.label || text['share'],
			
			updateLinks = function(e, opt) {
				
					opt = (typeof opt !== UNDEF)? $.extend({}, settings, opt) : settings;
					
					// Fallbacks 
					
					if (!opt.hasOwnProperty('href')) {
						opt.href = window.location.href;
					}
					
					if (opt.hasOwnProperty('description')) {
						opt.description = opt.description.stripHTML();
					} else {
						opt.description = $('meta[name=description]').attr('content') || ''
					}
					
					if (opt.hasOwnProperty('title')) {
						opt.title = opt.title.stripHTML();
					} else {
						opt.title = $('meta[name=title]').attr('content') || $('title').text() || '';
					}
					
					if (!opt.hasOwnProperty('image')) {
						var im = $('link[rel=image_src]');
						opt.image = (im.length)? im.attr('href') : (window.location.href.getDir() + 'folderthumb.jpg');
					} 
					
					if (!opt.image.startsWith('http')) {
						opt.image = window.location.href.getDir() + opt.image;
					}
					
					// Encoded versions
					var href = 			encodeURIComponent(opt.href),
						title = 		encodeURIComponent(opt.title),
						description = 	encodeURIComponent(opt.description),
						image = 		encodeURIComponent(opt.image),
						link;
					
					self.find('.' + settings.className + ' a').each(function() {
						var a = $(this);
						
						switch (a.data('share')) {
						
							case 'facebook':
								// FB has removed the custom sharing option :(
								if (opt.href.indexOf('#') > 0) {
									return;
								}
								
								if (typeof FB === UNDEF) {
									link = 'https://www.facebook.com/sharer.php?s=100&p%5Burl%5D=' + opt.href + '&p%5Bimages%5D%5B0%5D=' + opt.image + '&p%5Btitle%5D=' + title;
								} else {
									a.off('.share').on('click.share', function() {
										FB.ui({
											method: 		'feed',
											link: 			opt.href,
											caption: 		opt.title,
											description: 	opt.description,
											picture: 		opt.image
										});
										return false;
									});
									return;
								}
								break;
							
							case 'twitter':			
								link = 'https://twitter.com/home?status=' + title + ': ' + href;
								break;
								
							case 'tumblr':
								link = 'https://www.tumblr.com/share/link?url=' + href + '&name=' + title; 
								break;
								
							case 'pinterest':
								link = 'https://pinterest.com/pin/create/button/?url=' + href + '&media=' + image + '&description=' + title;
								break;
							
							case 'linkedin':
								link = 'https://www.linkedin.com/shareArticle?mini=true&url=' + href + '&title=' + title + '&summary=' + description;
								break;
								
							case 'digg':
								link = 'https://digg.com/submit?url=' + opt.href;
								break;
								
							case 'stumbleupon':
								link = 'https://www.stumbleupon.com/submit?url=' + opt.href + '&title=' + title;
								break;
								
							case 'reddit':
								link = 'https://www.reddit.com/submit?url=' + opt.href;
								break;
								
							case 'email':
								a.attr({
										href: 	'mailto:?subject=' + call + '&body=' + title + '%0D%0A' + description + '%0D%0A' + encodeURI(opt.href)
									});
								
							default:
								return;
								
						}
					
						a.attr({
							href: 		link,
							target: 	'_blank'
						});
					});
				},
		
			createButtons = function() {
					
					var buttons = 	settings.buttons.split(','),
						href = 		encodeURIComponent(window.location.href.split('#')[0]),
						title = 	encodeURIComponent(settings.title || $('meta[name=title]').attr('content') || $('title').text()),
						image = 	settings.image? 
										(window.location.href.getDir() + encodeURIComponent(settings.image)) : 
										$('link[rel=image_src]').attr('href'),
						cont = 		$('<div>', {
											'class': 	settings.buttonsClassName
										}).appendTo(self);
					
					for (var i = 0; i < buttons.length; i++) {
						
						switch (buttons[i]) {
							
							case 'facebook':
								cont.append('<div class="likebtn fb-like" data-href="' + href + '" data-layout="button_count" data-action="like" data-size="large" data-show-faces="false" data-share="false"></div>');
								break;
							
							case 'twitter':
								cont.append('<a class="likebtn twitter-share-button icon-twitter" href="https://twitter.com/intent/tweet?text=' + title + '&url=' + href + '" data-size="large" target="_blank"> Tweet</a>');
								break;

							case 'pinterest':
								cont.append('<div class="likebtn"><a data-pin-do="buttonPin" data-pin-count="beside" data-pin-tall="true" data-pin-save="true" href="https://www.pinterest.com/pin/create/button/?url=' + href + '&media=' + image + '&description=' + title + '" data-pin-do="buttonPin"></a></div>');
								break;
						}
					}
				},
			
			createLinks = function(cont) {
					var n,
						cont = $('<div>', {
								'class': 	settings.className
							}).appendTo(self),
						sites = settings.sites.split(',');
					
					for (var i = 0; i < sites.length; i++) {
						
						n = sites[i];
						if ('facebook,twitter,tumblr,pinterest,linkedin,digg,stumbleupon,reddit,email'.indexOf(n) >= 0) {
							cont.append($('<a>', {
									'class': 	settings.buttonClassName + ' icon-' + n.unCamelCase(),
									title: 		text['shareOn'] + ' ' + n.capitalize(),
									text:		' ' + (settings.buttonLabels? n.capitalize() : '')
								})
								.data('share', n));
						}
					}
					
					updateLinks();
					cont.children('a').addTooltip();
				};
		
		
		createLinks();
		
		if (settings.hasOwnProperty('buttons') && !LOCAL) {
			createButtons();
		}
		
		if (self.closest('.modal').length) {
			self.find('.' + settings.className + ' a').on('click', function() {
					$(this).closest('.modal').trigger('close');
					return true;
				});
		}
		
		self.on('updateLinks', updateLinks);
				
		return this;
	};
	
	$.fn.renderShares.defaults = {
			buttonLabels:		true,		
			className: 			'shares',
			buttonsClassName:	'buttons',
			buttonClassName:	'button',
			sites: 				'facebook,twitter,tumblr'
		};

})(jQuery);