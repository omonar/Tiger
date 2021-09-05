/* 
 *	Rendering share buttons
 */

;(function($) {
	'use strict';
		
	$.fn.renderShares = function(settings) {
		
			settings = $.extend({}, $.fn.renderShares.defaults, settings);
			
			var self = 				$(this),
				cont,
				image,
				caption,
				socialLinks,
				text = 				getTranslations({
											share: 			'Share',
											shareOn: 		'Share on',
											checkThisOut: 	'Found this page',
											email:			'Email',
											slideshow:		'Slideshow',
											copy:			'Copy',
											copied:			'Copied',
											localWarning: 	'Can\'t share local albums. Please upload your album first!'
										}),
				call = 				encodeURIComponent(settings.callAction || text['checkThisOut']),
				label = 			settings.label || text['share'],
				pageExt =			settings.indexName.getExt(),
				
				// Copying URL to the clipboard
				
				copyUrl = function(e) {
						var url = this.querySelector('input[name=url]'),
							save = url.value,
							succ;
						
						if (url) {
							url.focus();
							url.setSelectionRange(0, save.length);
							
							try {
								succ = document.execCommand('copy');
							} catch(err) {
								succ = false;
							}
							
							if (succ) {
								url.value = text['copied'] + '...';
								url.classList.add('copied');
								setTimeout(function() {
										url.value = save;
										url.classList.remove('copied');
									}, 500);
							}
						}
						
						return false;
					},
					
				// Updating URL in the input box
				
				changeUrl = function(e) {
						var opt = this.checked,
							option = this.name,
							url = this.parentNode.querySelector('input[name=url]');
						
						if (opt) {
							if (url.value.indexOf('#') >= 0) {
								if (url.value.indexOf(new RegExp('[\#&]' + option)) === -1) {
									url.value += '&' + option;
								}
							} else {
								url.value += '#' + option;
							}
						} else {
							url.value = url.value.replace(new RegExp('[\#&]' + option, 'g'), '');
						}
					},
				
				// Updating links on trigger (e, opt), or initial
				
				updateLinks = function(e, opt) {
					
						if (typeof e === UNDEF) {
							// Initial
							opt = settings;
							
						} else {
							// Triggered
							if (typeof opt === UNDEF) {
								opt = {};
							}
							
							// Reading URL 
							if (!opt.hasOwnProperty('href')) {
								opt.href = window.location.href;
							}
							
							// Fixing HTML title
							if (opt.hasOwnProperty('title')) {
								opt.title = opt.title.stripHTML();
							}
							
							// Fixing HTML description
							if (opt.hasOwnProperty('description')) {
								opt.description = opt.description.stripHTML();
							} 
							
							opt = $.extend({}, settings, opt);
						}
						
						// Fixing relative URL
						if (!opt.image.startsWith('http')) {
							opt.image = window.location.href.getDir() + opt.image;
						}
						
						var cc = $(opt.currCardHook);			// Current lightbox image
											
						if (cc.length) {
							// Reading data from current card inthe lightbox
							
							// Title
							opt.title = cc.find('.caption .title').text();
							
							if (!opt['title']) {
								// No title: it's mandatory, so trying to read something from the image / video
								var img = cc.find('img, video');
								opt.title = img.length?
												img.attr('title') || img.attr('alt') || (img.attr('src')? img.attr('src').getFile().replace(/\.(jpg|gif|png|mp4)$/i, '').replace(/_/g, ' ') : '')
												:
												'';
							}
							
							// Reading lightbox caption
							opt.description = cc.find('.caption .comment').text();
							
							// Image
							if (!opt.hasOwnProperty('image')) {
								var c = $(opt.currCardHook + ' img');
								if (c.length) {
									// Image
									opt.image = c.attr('src');
								} else {
									c = $(opt.currCardHook + ' video');
									if (c.length) {
										// Video
										opt.image = c.attr('src').replaceExt('jpg');
									} else {
										// Nothing found: fall back to meta
										c = $('link[rel=image_src]');
										opt.image = (c.length)? c.attr('href') : (window.location.href.getDir() + 'folderthumb.jpg');
									}
								} 
							}
							
							// Updating preview card
							if (opt.usePreview) {
								
								if (opt['image']) {
									image.attr('src', opt.image);
								}
								
								caption.empty();
								
								if (opt['title']) {
									caption.append('<h3 class="title">' + opt.title + '</h3>');
								}
								
								if (opt['description']) {
									caption.append('<div class="description">' + opt.description + '</div>');
								}
							}
						}
											
						// Encoded versions
						var href = 			encodeURIComponent(opt.href),
							slideHref =		(opt.href.indexOf('#img=') > 0)? opt.href.replace(settings.indexName, '').replace('#img=', 'slides/').replaceExt(opt.pageExt) : opt.href,
							title = 		encodeURIComponent(opt.title),
							description = 	encodeURIComponent(opt.description),
							image = 		encodeURIComponent(opt.image),
							link;
						
						self.find('.' + settings.sharesClass + ' a').each(function() {
								var a = $(this);
								
								switch (a.data('share')) {
								
									case 'facebook':
										
										if (typeof FB === UNDEF) {
											link = 'https://www.facebook.com/sharer.php?s=100&p%5Burl%5D=' + opt.href + '&p%5Bimages%5D%5B0%5D=' + opt.image + '&p%5Btitle%5D=' + title;
										} else {
											a.off('.share').on('click.share', function() {
												FB.ui({
														method: 		'feed',
														link: 			slideHref,
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
										
									case 'reddit':
										link = 'https://www.reddit.com/submit?url=' + opt.href;
										break;
										
									case 'email':
										link = 'mailto:?subject=' + call + '&body=' + title + '%0D%0A' + description + '%0D%0A' + encodeURI(opt.href);
										break;
										
									case 'link':
										var tt = $('<form class="copy-url">' +
												'<input name="url" type="text" readonly value="' + opt.href + '">' +
												'<input name="slideshow" id="slideshowcb" type="checkbox">' +
												'<label for="slideshowcb">' + text['slideshow'] + '</label>' +
												' <button type="submit" class="button icon-copy"> ' + text['copy'] + '</button>' +
											'</form>');
										
										tt.on('submit', copyUrl);
										tt.find('[name=slideshow]').on('change', changeUrl);
										
										a.trigger('destroyTooltip').addTooltip(tt, {
												stay:	3000,
												pos: 	settings.pos 
											});
										
										return;
										
									default:
										return;
										
								}
							
								a.attr({
										href: 		link,
										target: 	'_blank'
									});
								
							});
					},
			
				// Creating like buttons initially 
				
				createButtons = function(target) {
						
						var buttons = 	settings.buttons.split(','),
							href = 		encodeURIComponent(window.location.href.split('#')[0]),
							title = 	encodeURIComponent(settings.title || $('meta[name=title]').attr('content') || $('title').text()),
							image = 		settings.image? 
											((settings.image.startsWith('http')? '' : window.location.href.getDir()) + 
												encodeURIComponent(settings.image)) 
											: 
											$('link[rel=image_src]').attr('href'),
							btns = 		$('<div>', {
												'class': 	settings.buttonsClass
											}).appendTo(target || self);
						
						for (var i = 0; i < buttons.length; i++) {
							
							switch (buttons[i]) {
								
								case 'facebook':
									btns.append('<div class="likebtn fb-like" data-href="' + href + '" data-layout="button_count" data-action="like" data-size="large" data-show-faces="false" data-share="false"></div>');
									break;
								
								case 'twitter':
									btns.append('<a class="likebtn twitter-share-button icon-twitter" href="https://twitter.com/intent/tweet?text=' + title + '&url=' + href + '" data-size="large" target="_blank"> Tweet</a>');
									break;
	
								case 'pinterest':
									btns.append('<div class="likebtn"><a data-pin-do="buttonPin" data-pin-count="beside" data-pin-tall="true" data-pin-save="true" href="https://www.pinterest.com/pin/create/button/?url=' + href + '&media=' + image + '&description=' + title + '" data-pin-do="buttonPin"></a></div>');
									break;
							}
						}
					},
				
				// Creating share links the first time
				
				createLinks = function(target) {
						var n,
							links = $('<div>', {
									'class': 	settings.sharesClass
								}).appendTo(target || self),
							sites = settings.sites.split(',');
						
						for (var i = 0, a; i < sites.length; i++) {
							
							n = sites[i];
							if ('facebook,twitter,tumblr,pinterest,linkedin,digg,reddit,email,link'.indexOf(n) >= 0) {
								a = $('<a>', {
										'class': 	settings.btnClass + ' icon-' + n.unCamelCase(),
										rel:		'noopener',
										text:		' ' + (settings.buttonLabels? n.capitalize() : '')
									})
									.data('share', n)
									.appendTo(links);
								
								if (n === 'email') {
									a.data('tooltip', text['email']);
								} else if (n !== 'link') {
									a.data('tooltip', text['shareOn'] + ' ' + n.capitalize());
								}
							}
						}
						
						updateLinks();
						
						links.children('a').not('.icon-link').addTooltip({ 
								pos: 	settings.pos 
							});
					};
			
			// Reading smart defaults if missing
			
			// URL
			if (!settings.hasOwnProperty('href')) {
				settings.href = window.location.href;
			}
			
			// Image
			if (!settings.hasOwnProperty('image')) {
				var image = $('link[rel=image_src]');
				settings.image = (image.length)? image.attr('href') : (window.location.href.getDir() + 'folderthumb.jpg');
			}
			
			// Title
			if (!settings.hasOwnProperty('title')) {
				settings.title = self.find('h3,.title').eq(0).text() || $('meta[name=title]').attr('content') || $('title').text() || '';
			}
			
			// Description
			if (!settings.hasOwnProperty('description')) {
				settings.description = self.find('.description').text() || '';
			}
			
			// Page extension
			if (!settings.hasOwnProperty('pageExt')) {
				settings.pageExt = settings.indexName.getExt();
			}
			
			if (settings.usePreview) {
				// Complete share card with preview
				
				// Wrapping element
				cont = self.find('.' + settings.contClass);
				
				if (!cont.length) {
					cont = $('<div>', {
							'class':	settings.contClass
						}).appendTo(self);
				}
				
				// Image
				image = cont.find('img');
				
				if (!image.length) {
					image = $('<img>', {
							src:		settings.image				// Relative URL is fine
						}).appendTo(cont);
				}
				
				// Caption
				caption = cont.find('.' + settings.captionClass);
				
				if (!caption.length) {
					caption = $('<div>', {
							'class':	settings.captionClass,
							html:		'<h3 class="title">' + settings.title + '</h3>' + 
										(settings.description? ('<div class="description">' + settings.description + '</div>') : '')
						}).appendTo(cont);
				}
		
				// Social links wrap
				socialLinks = cont.find('.' + settings.socialLinksClass);
				
				if (!socialLinks.length) {
					socialLinks = $('<div>', {
							'class':	settings.socialLinksClass
						}).appendTo(cont);
				}
				
			} else {
				// Simple share buttons, no card
				
				socialLinks = self;
			}
			
			createLinks(socialLinks);
			
			if (settings.hasOwnProperty('buttons') && !LOCAL) {
				createButtons(socialLinks);
			}
			
			if (self.closest('.modal').length) {
				self.find('.' + settings.sharesClass + ' a').on('click', function() {
						$(this).closest('.modal').trigger('close');
						return true;
					});
			}
			
			self.on('updateLinks', updateLinks);
					
			return this;
		};
	
	$.fn.renderShares.defaults = {
			buttonLabels:			false,
			usePreview:				true,
			contClass:				'preview',
			captionClass:			'caption',
			socialLinksClass:		'social-links',
			sharesClass: 			'shares',
			buttonsClass:			'buttons',
			btnClass:				'btn',
			sites: 					'facebook,twitter,tumblr',
			indexName:				'index.html',
			currCardHook:			'.lightbox .curr',
			pos:					[2,1,0,1]
		};

})(jQuery);

/* Generated structure
<div class="share-cont social-links text-center">
	<div class="thumb">
		<img src="http://">
		<div class="caption">
			<h3>Patrik</h3>
			<div class="description">People</div>
		</div>
		<div class="social-links">
			<div class="shares">
				<a class="btn icon-facebook" rel="noopener" data-tooltip-id="_ltt_1742"> </a>
				<a class="btn icon-twitter" rel="noopener" href="https://twitter.com/home?status=Patrik: http%3A%2F%2F127.0.0.1%3A8080%2FTiger%2FPeople%2Findex.html%23img%3DPatrik.jpg" target="_blank" data-tooltip-id="_ltt_4248"> </a>
				<a class="btn icon-email" rel="noopener" href="mailto:?subject=Check%20this%20out&amp;body=Patrik%0D%0APeople%0D%0Ahttp://127.0.0.1:8080/Tiger/People/index.html#img=Patrik.jpg" target="_blank" data-tooltip-id="_ltt_6930"> </a>
			</div>
		</div>
	</div>
</div>
*/