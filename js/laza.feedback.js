/*	
 *	feedback() :: setting up the shopping cart with Feedback
 *
 *	Usage: $(targetElement).feedback( [items,] options );
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Items: jQuery element (array) holding the elements
 *
 *	Options:
		to: 			(the email address),
		cc:				(cc email),
		subject:		(default subject),
		template: 		(template),
*/

;(function($, $window, $body) {
	'use strict';
	
	$.fn.feedback = function(album, settings) {
		
			if (!album) {
				return this;
			}
			
			settings = $.extend({}, $.fn.feedback.defaults, album.getRootProperty(J.FEEDBACK), settings);
			
			if (!settings.to) {
				console.log('feedback.js: no target email found');
				return this;
			}
			
			var // global vars
				self = 		$(this).eq(0),					// parent element					
				ns = 		self.data('lfb_ns'),			// event namespace
				text = 		$.fn.feedback.text,				// texts
				to = 		xDecrypt(settings.to),			// send target
				itemTemplate,								// Item template
				
				LBR =		'%0D%0A',						// line break
				TAB =		'%09',							// Tab
				SPACE = 	'%20',							// Space
				AMP =		'%26',							// Ampersand
				
				// jQuery elements:
				cart,										// the cart parent
				popup,										// modal window
				cont,										// modal window content
				itemCont,									// item container
				copyBtn = $(),								// 'Copy' button
				sendBtn = $(),								// 'Send' button
				emptyCartBtn = $(),							// 'Empty' button
				shortcutBtn,								// floating shortcut button
							
				id = {
						cart:			'feedback-cart',
						shortcut:		'feedback-shortcut',
						window:			'feedback-window',
						cont:			'cont',
						beforeItems:	'before-items',
						summary:		'summary',
						summaryTxt:		'summary-txt',
						details:		'details',
						newItems:		'new-items',
						items:			'items',
						afterItems:		'after-items',
						buttons:		'buttons',
						item:			'item',
						path:			'path',
						file:			'file',
						info:			'info',
						thumb:			'thumb',
						title:			'title',
						data:			'data',
						options:		'options'
					},
				
				cookie = {
						data:			'feedback.cart.data',
						date:			'feedback.cart.date'
					},
				
				PATH = DIR_PATH || '/',
					
				setStorage = function(key, value) {
						localStorage.setItem(PATH + key, value); 
					},
					
				getStorage = function(key) {
						return localStorage.getItem(PATH + key);
					},
					
				removeStorage = function(key) {
						localStorage.removeItem(PATH + key);
					},
					
				wipeData = function() {
						if (LOCALSTORAGE) {
							for (var c in cookie) {
								removeStorage(cookie[c]);     
							}
						}
					},
				
				// Returns one items: path and serialized values
				
				getFormData = function(f) {
						var d = {
								path:		f.data('path'),
								file:		f.data('file'),
								title:		f.find('.' + id.title).text(),
								data:		f.find('.' + id.data + ' form').serialize()
							};
							
						if (typeof f.data('thumbFormat') !== UNDEF) {
							d.thumbFormat = f.data('thumbFormat');
						}
							
						return d;
					},
					
				// Saving the cart to the localStorage
				
				saveData = function(doneFn) {
					
						if (LOCALSTORAGE) {
							var d = {},
								el;
							
							el = cart.find('.' + id.beforeItems + ' form');
							if (el.length) {
								d.before = el.serialize();
							}
							
							el = cart.find('.' + id.item);
							if (el.length) {
								d.items = new Array();
								el.each(function() {
										d.items.push(getFormData($(this)));
									});
							}
							
							el = cart.find('.' + id.afterItems + ' form');
							if (el.length) {
								d.after = el.serialize();
							}
							
							if (!isEmpty(d)) {
								d = JSON.stringify(d);
								setStorage(cookie.data, d);
								// Saving current time
								setStorage(cookie.date, (new Date()).getTime());
							} else {
								wipeData();
							}
						}
						
						if (typeof doneFn === FUNCTION) {
							doneFn.call(this);
						}
					},
				
				// Loading the cart from the localStorage
				
				loadData = function(doneFn) {
					
						if (LOCALSTORAGE) {
							var date = (new Date()).getTime(),
								d;
								
							if (d = getStorage(cookie.date)) {
								if ((date - parseInt(d)) > settings.expiry) {
									wipeData();
									return;
								} else {
									setStorage(cookie.date, date);
								}
							}
								
							if (d = getStorage(cookie.data)) {
								
								var data = JSON.parse(d);
								
								if (!isEmpty(data)) {
									
									if (data['before']) {
										cart.find('.' + id.beforeItems + ' form').deserialize(data.before);
									}
									
									if (data['items']) {
										for (var i = 0; i < data.items.length; i++) {
											addItem(data.items[i]);
										}
									}
									
									if (data['after']) {
										cart.find('.' + id.afterItems + ' form').deserialize(data.after);
									}
								}
							}
						}
						
						updateCart(true);
						
						if (typeof doneFn === FUNCTION) {
							doneFn.call(this);
						}
					},
							
				// Adding an item
				
				addItem = function(data) {
					
						if (!data || !data.hasOwnProperty('file')) {
							return;
						}
							
						// Creating the item
						var	it,
							lb,
							tp;
							
						if (data.hasOwnProperty('path')) {
							if (settings.hasOwnProperty('relPath')) {
								tp = getRelativePath(settings.relPath || '/', data.path);
							} else {
								tp = data.path;
							}
						} else {
							tp = '';
						}
						
						tp += settings.thumbsFolder;
						
						if (data.hasOwnProperty('thumbFormat')) {
							tp += data.file.replaceExt(data.thumbFormat);
						} else {
							tp += data.file;
						}
							
						it = $('<div>', {
								'class':	id.item + ' clearfix'
							});
						
						lb = $('<div>', {
								'class':	id.info
							}).appendTo(it);
							
						// Remove button
						lb.append($('<a>', {
								'class': 	'button icon-close'
							}).on('click.' + ns, function() {
								$(this).parents('.' + id.item).remove();
							}).on('selectstart', function(e) {
								e.preventDefault();
								return false;
							}));
							
						// Thumb image
						lb.append($('<img>', {
								'class': 	id.thumb,
								src: 		tp
							}));
						
						// Title
						lb.append($('<span>', {
								'class': 	id.title,
								html: 		data.title
							}));
						
						// Data from template
						it.append($('<div>', {
								'class': 	id.data,
								html:		album.processTemplate(itemTemplate)
							}));
							
						itemCont.append(it);
						
						if (data.data) {
							it.find('form').deserialize(data.data, true);
						}
						
						it.data({
								path:		data.path,
								file:		data.file
							});
						
						if (data.hasOwnProperty('thumbFormat')) {
							it.data('thumbFormat', data.thumbFormat);
						}
						
						return it;
					},
					
				// Converting jalbum.album item into data Object
				
				getData = function(item) {
					
						var data = {
									title: 		item[J.TITLE] || item[J.NAME] || '',
									path: 		album.getFolderPath(item), 
									file: 		encodeURI(item[J.NAME])
								},
								tx;
								
							// Thumb extension (save if different from image ext)
							tx = item[J.THUMB][J.PATH].getExt();
							if (item[J.NAME].getExt() !== tx) { 
								data.thumbFormat = tx;
							}
						
						return data;
						//data.items[i]['path'], data.items[i]['file'], data.items[i]['title'], data.items[i]['data']);
					},
				
				// adding jAlbum.Album objects
				
				addItems = function(items) {
						
						if (!items) {
							return;
						}
						
						var cnt = itemCount();
						
						if (Array.isArray(items)) {
							for (var i = 0; i < items.length; i++) {
								addItem(getData(items[i]));
							}
						} else {
							addItem(getData(items));
						}
						
						updateCart();
						
						showCart(function() {
								// Settings the focus to the first added item
								var f = itemCont.find('.' + id.item);
								if (f.length) {
									f = f.eq(cnt).find('input,textarea,select');
									if (f.length) {
										f[0].focus();
									}
								}
							});
					},
				
				// Number of items
				
				itemCount = function() {
						return cont.find('.' + id.item).length;
					},
									
				// Something has Changed
				
				updateCart = function(initial) {
						var cnt = itemCount();
						
						sendBtn.add(copyBtn).add(emptyCartBtn).toggleClass('disabled', cnt === 0);
						
						updateShortcutBtn(cnt);
						
						if (!initial) {
							saveData();
						}
					},
				
				// Updating the buttons (item count, selected items count)
	
				updateShortcutBtn = function(cnt) {
					
						if (settings.hasOwnProperty('button') && settings.button.length) {
							
							if (cnt) {
								var b = settings.button.children('.badge');
								
								if (!b.length) {
									b = $('<span>', {
											'class':	'badge top-right'
										}).appendTo(settings.button);
								}
								
								b.text(cnt).show();
								
							} else {
								
								settings.button.children('.badge').hide();
							}
						}
					},
					
				updateSelectedCount = function(cnt) {
						var btn = shortcutBtn.find('.global.add-cart');
						
						if (cnt) {
							var b = btn.children('.badge');
							
							if (!b.length) {
								b = $('<span>', {
										'class':	'badge red'
									}).appendTo(btn);
							}
							
							b.text(cnt).show();
							btn.removeClass('disabled');
							btn.addTooltip(text.addSelectedItems);
							
						} else {
							
							btn.addClass('disabled').children('.badge').hide();
							btn.addTooltip(text.selectItems);
						}
					},
					
				// Reading form
					
				readForm = function(f) {
					
						if (f) {
							var v,
								b = [];
								
							f.find('input,textarea,select').each(function() {
									if ((v = $(this).val()) !== null) {
										b.push((this.name || this.id || this.nodeName) + ': ' + v);
									}
								});
							
							return b.join(', ');
						}
						
						return '';
					},
					
				// Formatting form
				
				format = function(f) {
					
						if (f) {
							switch (settings.formatting) {
								case 'human':
									return f.serialize().replace(/\+/g, SPACE).replace(/=/g, ': ').replace(/\&/g, LBR);
								case 'serialized':
									return (f.attr('name') || f.attr('id') || 'form') + '="' + encodeURIComponent(f.serialize()) + '";';
								default:
									return encodeURIComponent(readForm(f));
							}
						}
						
						return '';
					},
					
				// Reading content before items
				
				getBeforeItems = function() {
						var f;
							
						if ((f = cont.find('.' + id.beforeItems + ' form')).length) {
							return format(f);
						}
						
						return '';
					},
				
				// Reading items
					
				getItems = function() {
						var items = [];
						
						if (settings.formatting === 'serialized') {
							items.push('items={');
						} else {
							items.push(LBR + '----------------------');
						}
						
						cont.find('.' + id.item).each(function(i) {
								var self = $(this),
									path = self.data('path') + self.data('file'),
									form = self.find('form').eq(0);
								
								switch (settings.formatting) {
									
									case 'human':
										items.push(
												(i? LBR : '') + (String)(i + 1) + '.' + TAB + 
												(encodeURI(path)) + 
												(form? (LBR + TAB + form.serialize().replace(/\+/g, SPACE).replace(/=/g, ': ').replace(/\&/g, ',' + SPACE)) : '') 
											);
										break;
										
									case 'serialized':
										items.push(
												'{file:"' + encodeURI(path) + '"' +
												(form? (',' + (form.attr('name') || form.attr('id') || 'form') + ':"' + encodeURIComponent(self.find('form').serialize()) + '"') : '') + 
												'},'
											);
										break;
										
									default:
										items.push(
												(String)(i + 1) + '.' + TAB + 
												encodeURI(path) + 
												(form? (':' + TAB + encodeURIComponent(readForm(form))) : '') 
											);
										break;
								}
							});
					
						if (settings.formatting === 'serialized') {
							items[items.length - 1] = items[items.length - 1].replace(/\,$/, '');
							items.push('};');
						} else {
							items.push('----------------------' + LBR);
						}
						
						return items.join(LBR);
					},
				
				// Reading content after items
				
				getAfterItems = function() {
						var f;
						
						if ((f = cont.find('.' + id.afterItems + ' form')).length) {
							return format(f);
						}
						
						return '';
					},
					
				// Copying the cart to the clipboard
				
				copyCart = function(tooLarge) {
						var body = getBeforeItems() + LBR + getItems() + LBR + getAfterItems(),
							warn = typeof tooLarge !== UNDEF && tooLarge,
							msg = $('<div>', {
											html: 	(tooLarge? ('<h4 class="icon-warning"> ' + text.tooLong + '</h4>') : '') +
													'<p><textarea name="body" rows="8">' + text.to + ': ' + to + '\n' +
														text.subject + ': ' + popup.find('header').text() + '\n\n' +
														decodeURIComponent(body) + '</textarea></p>' +
													'<p class="icon-info instructions"> ' + text.copyInstructions + '</p>'
										});
						
						$body.modal(msg, 
								[{
									t: 	text.okButton,
									c:	'icon-ok',
									h: 	function() {
											emptyCart();
										}
								}],
								{
									title:		tooLarge? text.warning : text.copiedToClipboard,
									'class': 	(tooLarge? 'warning' : 'success') + ' small'
								});
						
						msg.find('[name=body]')[0].select();
						document.execCommand('copy');
					
					},
							
				// Sending the cart
				
				sendCart = function() {
					
						var message,
							head = 	'mailto:' + encodeURIComponent(to) +
									'?subject=' + encodeURIComponent(popup.find('header').text()),
							body = 	getBeforeItems() + LBR + getItems() + LBR + getAfterItems();
						
						if (DEBUG) {
							try {
								console.log(decodeURIComponent(body));
							} catch(err) {
								console.log(err);
							}
						}
						
						message = head + '&body=' + body;
							
						if (message.length > 2048) {
							
							copyCart(true);
							
						} else {
						
							window.location.href = message;
							
							emptyCart();
						}
						
						hideCart();
						
					},
	
				// Creating the cart
				
				init = function(doneFn) {
					
						var cnt,
							btns;
							
						// Cart exists? Yes: clean old event handlers and div's
						if (ns !== undefined) {
							$(popup).off('.' + ns);
							$('#cart_' + ns).remove();
							$('#cart_shortcut_' + ns).remove();
						}
						
						// Creating new namespace
						self.data('lfb_ns', ns = 'lfb_' + Math.floor(Math.random() * 10000));
						
						// Creating the modal base (full screen)
						cart = $('<div>', {
								id: 		'cart_' + ns,
								'class': 	'modal ' + id.cart,
								'role':		'modal'
							}).hide().appendTo($body);
						
						// Creating the buttons
						shortcutBtn = $('<div>', {
								id:			'cart_shortcut_' + ns,
								'class': 	settings.useShortcutButton? id.shortcut : 'buttons'
							})
							.append($('<a>', {
									'class':	'secondary button view-cart',
									html:		' ' + text.view
								})
								.on('click.' + ns, function() {
										showCart();
									})
							)
							.append($('<a>', {
									'class':	'global button disabled add-cart icon-email-send',
									html:		' ' + text.writeFeedback
								})
								.on('click.' + ns, function() {
										if (typeof settings.getSelected === FUNCTION) {
											addItems(settings.getSelected.call());
											if (typeof settings.selectNone === FUNCTION) {
												settings.selectNone.call();
											}
										}
									})
							)
							.appendTo(self);
						
						// The inside popup
						popup = $('<div>', {
								'class': 	'window has-header ' + id.window,
								role: 		'dialog'
							}).appendTo(cart);
						
						// Header
						popup.append($('<header>', {
								'class': 	'icon-email-send',
								html: 		' <strong> ' + text.feedbackOnAlbum.template(album.getAlbumTitle()) + '</strong>' 
							}));
						
						// Close button
						popup.append($('<a>', {
								'class': 	'btn close',
							}).on('click.' + ns, hideCart));
						
						cart.on('click.' + ns, function(e) {
								if (e.target.id === 'cart_' + ns) {
									hideCart();
									return false;
								};
								return true;
							});
						
						// Modal window content
						cont = $('<div>', {
								'class': 	'content'
							}).appendTo(popup);
						
						cnt = settings.template.split(settings.itemsStart)[0].trim();
						
						if (cnt) {
							cont.append($('<div>', {
									'class':	id.beforeItems,
									html:		album.processTemplate(cnt)
								}));
						}
											
						// Details container
						itemCont = $('<div>', {
								'class': 	id.items
							}).appendTo(cont);
												
						cnt = settings.template.split(settings.itemsStop);
						
						if (cnt.length && (cnt = cnt[1].trim())) {
							cont.append($('<div>', {
									'class':	id.afterItems,
									html:		album.processTemplate(cnt)
								}));
						}
										
						// Buttons
						btns = $('<div>', {
								'class': 	id.buttons
							}).appendTo(cont);
						
						btns.append($('<a>', {
								'class': 	'secondary button icon-arrow-left',
								text: 		' ' + text.continueBrowsing
							}).on('click.' + ns, hideCart));
						
						emptyCartBtn = $('<a>', {
								'class': 	'alert button icon-trash',
								text: 		' ' + text.removeAll
							}).on('click.' + ns, emptyCart).appendTo(btns);
							
						copyBtn = $('<a>', {
								'class': 	'success disabled button icon-external',
								html: 		' ' + settings.copyBtnLabel
							}).on('click.' + ns, function() { copyCart(false); return false; }).appendTo(btns);
						
						if (settings.useSendButton) {
							sendBtn = $('<a>', {
									'class': 	'disabled button icon-email-send',
									html: 		' ' + settings.sendBtnLabel
								}).on('click.' + ns, sendCart).appendTo(btns);
							btns.after($('<p>', {
									'class':	'fineprint',
									html:		text.feedbackButtonExplanation
								}));
						}
							
											
						// Instructions
						if (settings.hasOwnProperty('instructions') && settings.instructions) {
							cont.append($('<div>', {
									'class': 	'instructions icon-info'
								})
								.append($('<div>')
								.append(settings.instructions.fixjAlbumPaths(settings.resPath, settings.rootPath, settings.relPath))));
						}
						
						// Adding tooltip texts
						popup.find('a.close').addTooltip(text.continueBrowsing);
						
						if (settings.template.indexOf(settings.itemsStart) >= 0) {
							cnt = settings.template.split(settings.itemsStart)[1].trim();
							if (cnt) {
								cnt = cnt.split(settings.itemsStop)[0].trim();
								if (cnt) {
									itemTemplate = cnt.replace(/\$\{fileName\}/g, '\$\{name\}');
								}
							}
						}
						
						if (typeof doneFn === FUNCTION) {
							doneFn.call(this);
						}
					},
				
				emptyCart = function() {
						$body.modal($('<h3>', {
								'class':	'text-center icon-warning',	
								html:		' ' + text.removeAllItems
							}), [{
								t: 	text.yes,
								c:	'alert icon-trash',
								h: 	function() {
										cont.find('.item').remove();
										updateCart();
										hideCart();
									}
							}, {	
								t: 	text.no,
								h:	function() {}
							}], {
								'class':	'alert small'
							});
					},
				
				scrollToLast = function() {
						cont.animate({ 
								scrollTop: 	cont[0].scrollHeight - Math.round(cont.outerHeight())  
							}, 400);
					},
					
				showCart = function(doneFn) {			
						
					if (!cart.is(':visible')) {
							
							$body.addClass('no-scroll');
							$body.addClass('has-modal');
							
							cart.fadeIn(400, function() {
									
								scrollToLast();
								
								if (typeof doneFn === FUNCTION) {
									doneFn.call(this);
								}
							})
						}
					},
				
				hideCart = function(doneFn) {
						var c = itemCount();
						
						if (cart.is(':visible')) {
							
							$('body,html').removeClass('no-scroll');
							$('body').removeClass('has-modal');
							
							cart.fadeOut(400, function() {
									
								if (typeof doneFn === FUNCTION) {
									doneFn.call(this);
								}
							});
							
							saveData();
						}
					};
				
			
			// Initializing
			
			init(loadData);
			
			// Handlers
			
				// Adding new items
			self.on('addItems', function(e) {
						var items = Array.prototype.slice.call(arguments, 1);
						addItems(items);
					})
				// Emptying cart
				.on('emptyCart', function(e, doneFn) {
						emptyCart(doneFn);
					})
				// Showing add cart button
				.on('itemsSelected', function(e, count) {
						updateSelectedCount(count);
					})
				// Showing cart
				.on('showCart', function(e, doneFn) {
						showCart(doneFn);
					})
				// Hiding the cart
				.on('hideCart', function(e, doneFn) {
						hideCart(doneFn);
					});
			
			//$window.on('unload.' + ns, saveData);
			
			// Ready event
			
			if (settings.hasOwnProperty('onReady')) {
				settings.onReady(this);
			}
	
			return this;
		};
	
	$.fn.feedback.defaults = {
			expiry:					60 * 60 * 1000,		// 1 hour
			useShortcutButton:		false,
			rootPath:				'',
			relPath:				'',
			formatting:				'human', 			// 'serialized' || 'human' || 'text'
			thumbsFolder:			'thumbs/',
			copyBtnLabel:			'Copy to clipboard',
			sendBtnLabel:			'Send feedback',
			useSendButton:			true,
			itemsStart:				'<!-- items:start -->',
			itemsStop:				'<!-- items:stop -->'
		};
		
	$.fn.feedback.text = getTranslations({
			edit:					'Edit',
			continueBrowsing:		'Continue browsing',
			feedback:				'Feedback',
			sendFeedback:			'Send feedback',
			writeFeedback:			'Write feedback',
			addFeedbackCart:		'Feedback on images',
			view:					'View',
			selectItems:			'Select items to add!',
			addSelectedItems:		'Add selected items!',
			feedbackOnAlbum:		'Feedback on album "{0}"',
			closeWindow:			'Close window',
			removeAll:				'Remove all',
			removeAllItems:			'Remove all items?',
			yes:					'Yes',
			no:						'No',
			to:						'To',
			subject:				'Subject',
			warning:				'Warning',
			copiedToClipboard:		'Copied to clipboard!',
			okButton:				'OK',
			tooLong:				'This is too long to pass to the email application directly.',
			copyInstructions:		'The text has been copied to your clipboard. Now switch to the email applicaiton or the webmail and paste it as message body. Move "To" and "Subject" into the appropriate boxes!',
			feedbackButtonExplanation:'Try "Send" if you have an email application installed, use "Copy" for web mail!' 
		});
	
})(jQuery, $(window), $('body'));