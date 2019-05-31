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
			floatBtn,									// floating shortcut button
						
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
			
			wipeData = function() {
					if (LOCALSTORAGE) {
						for (var c in cookie) {
							localStorage.removeItem(cookie[c]);     
						}
					}
				},
			
			// Returns one items: path and serialized values
			
			getFormData = function(f) {
				
					return {
						itemPath:	f.data('itemPath'),
						title:		f.find('.' + id.title).text(),
						data:		f.find('.' + id.data + ' form').serialize()
					};
				},
				
			// Returns relative thumbnail path from the root object path
			/*
			getRelativeThumbPath = function(path) {
				
					var i = path.lastIndexOf('/'),
						folder = path.substring(0, i + 1),
						name = path.substring(i + 1);
				
					return (folder? getRelativePath(settings.relPath, folder) : '')
							+ settings.thumbsFolder + name.replaceExt('jpg');
				},
			*/
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
									var f = $(this); 
									d.items.push({
										path:		f.data('path'),
										file:		f.data('file'),
										title:		f.find('.' + id.title).text(),
										data:		f.find('.' + id.data + ' form').serialize()
									});
								});
						}
						
						el = cart.find('.' + id.afterItems + ' form');
						if (el.length) {
							d.after = el.serialize();
						}
						
						if (!isEmpty(d)) {
							d = JSON.stringify(d);
							localStorage.setItem(cookie.data, d);
							// Saving current time
							localStorage.setItem(cookie.date, (new Date()).getTime());
						} else {
							wipeData();
						}
					}
					
					if ($.isFunction(doneFn)) {
						doneFn.call(this);
					}
				},
			
			// Loading the cart from the localStorage
			
			loadData = function(doneFn) {
				
					if (LOCALSTORAGE) {
						var date = (new Date()).getTime(),
							d;
							
						if (d = localStorage.getItem(cookie.date)) {
							if ((date - parseInt(d)) > settings.expiry) {
								wipeData();
								return;
							} else {
								localStorage.setItem(cookie.date, date);
							}
						}
							
						if (d = localStorage.getItem(cookie.data)) {
							
							var data = JSON.parse(d);
							
							if (!isEmpty(data)) {
								
								if (data['before']) {
									cart.find('.' + id.beforeItems + ' form').deserialize(data.before);
								}
								
								if (data['items']) {
									for (var i = 0; i < data.items.length; i++) {
										createItem(data.items[i]['path'], data.items[i]['file'], data.items[i]['title'], data.items[i]['data']);
									}
								}
								
								if (data['after']) {
									cart.find('.' + id.afterItems + ' form').deserialize(data.after);
								}
							}
						}
					}
					
					updateCart(true);
					
					if ($.isFunction(doneFn)) {
						doneFn.call(this);
					}
				},
						
			// Creating a new item
			
			createItem = function(path, file, title, data) {
				
					if (!file) {
						return;
					}
						
					// Creating the item
					var	it,
						lb,
						tp = path? getRelativePath(settings.relPath || '/', path) : (settings.rootPath + '/');
					
					it = $('<div>', {
							'class':	id.item + ' clearfix'
						});
					
					lb = $('<div>', {
							'class':	id.info
						}).appendTo(it);
						
					// Remove button
					lb.append($('<a>', {
							'class': 	'button icon-cancel'
						}).on('click.' + ns, function() {
							$(this).parents('.' + id.item).remove();
						}).on('selectstart', function(e) {
							e.preventDefault();
							return false;
						}));
						
					// Thumb image
					lb.append($('<img>', {
							'class': 	id.thumb,
							src: 		tp + settings.thumbsFolder + '/' + file
						}));
					
					// Title
					lb.append($('<span>', {
							'class': 	id.title,
							html: 		title
						}));
					
					// Data from template
					it.append($('<div>', {
							'class': 	id.data,
							html:		album.processTemplate(itemTemplate)
						}));
						
					itemCont.append(it);
					
					if (data) {
						it.find('form').deserialize(data, true);
					}
					
					it.data({
							path:		path,
							file:		file
						});
					
					return it;
				},
				
			// Adding one item as Object
			
			addItem = function(item) {
				
					return createItem(album.getFolderPath(item), album.getThumbPath(item).getFile(), item[J.TITLE] || item[J.NAME] || '');
				},
			
			// adding jAlbum.Album objects
			
			addItems = function(items) {
					
					var cnt = itemCount();
					
					if (!items || !items.length) {
						return;
					}
					
					if ($.isArray(items)) {
						for (var i = 0; i < items.length; i++) {
							addItem(items[i]);
						}
					} else {
						addItem(items);
					}
					
					
					updateCart();
					showCart(function() {
							// Settings the focus to the first added item
							itemCont.find('.' + id.item).eq(cnt).find('input,textarea,select')[0].focus();
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
					
					updateFloatBtn(cnt);
					
					if (!cart.is(':visible') && cnt) {
						floatBtn.fadeIn(400);
					}
					
					if (!initial) {
						saveData();
					}
				},
			
			// Updating the float button

			updateFloatBtn = function(c, sel) {
					if (typeof sel === UNDEF || !sel) {
						c = (sel === 0 || typeof c === UNDEF)? itemCount() : c;
						floatBtn.find('.button')
							.removeClass('add-cart pop').addClass('view-cart')
							.html(' ' + text.viewFeedbackCart + ((c > 0)? (' <b>' + c + '</b>') : ''));
					} else {
						floatBtn.find('.button')
							.removeClass('view-cart').addClass('add-cart pop')
							.html('<sup>+</sup> ' + text.addComment + ' <b>' + sel + '</b>');
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
								path = self.data('path') + '/' + self.data('file'),
								form = self.find('form').eq(0);
							
							switch (settings.formatting) {
								
								case 'human':
									items.push(
											(i? LBR : '') + (String)(i + 1) + '.' + TAB + 
											(encodeURI(path)).replace(/%/g, '%25') + 
											(form? (LBR + TAB + form.serialize().replace(/\+/g, SPACE).replace(/=/g, ': ').replace(/\&/g, ',' + SPACE)) : '') 
										);
									break;
									
								case 'serialized':
									items.push(
											'{file:"' + encodeURI(path).replace(/%/g, '%25') + '"' +
											(form? (',' + (form.attr('name') || form.attr('id') || 'form') + ':"' + encodeURIComponent(self.find('form').serialize()) + '"') : '') + 
											'},'
										);
									break;
									
								default:
									items.push(
											(String)(i + 1) + '.' + TAB + 
											encodeURI(path).replace(/%/g, '%25') + 
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
										html: 	(tooLarge? ('<h4 class="icon-warning">' + text.tooLong + '</h4>') : '') +
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
					
					// Creating the floating cart show button
					if (settings.useFloatButton) {
						floatBtn = $('<div>', {
								id:			'cart_shortcut_' + ns,
								'class': 	id.shortcut
							})
							//.hide()
							.append($('<a>', {
									'class':	'small button icon-email view-cart'
								})
								.on('click.' + ns, function() {
									if ($(this).hasClass('view-cart')) {
										showCart();
									} else {
										if ($.isFunction(settings.getSelected)) {
											addItems(settings.getSelected.call());
											if ($.isFunction(settings.selectNone)) {
												settings.selectNone.call();
											}
										}
									}
								})
							).appendTo(self);
					}
					
					// The inside popup
					popup = $('<div>', {
							'class': 	'window has-header ' + id.window,
							role: 		'dialog'
						}).appendTo(cart);
					
					// Header
					popup.append($('<header>', {
							'class': 	'icon-email',
							html: 		'<strong> ' + text.feedbackOnAlbum.template(album.getAlbumTitle()) + '</strong>' 
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
								'class': 	'disabled button icon-email',
								html: 		' ' + settings.sendBtnLabel
							}).on('click.' + ns, sendCart).appendTo(btns);
						btns.append($('<p>', {
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
					
					if ($.isFunction(doneFn)) {
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
			
			itemsSelected = function(count) {
					updateFloatBtn(0, count);
					floatBtn.fadeIn(400);
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
							if ($.isFunction(doneFn)) {
								doneFn.call(this);
							}
							scrollToLast();
						})
					}
					floatBtn.fadeOut();
				},
			
			hideCart = function(doneFn) {
					var c = itemCount();
					
					if (cart.is(':visible')) {
						
						$('body,html').removeClass('no-scroll');
						$('body').removeClass('has-modal');
						cart.fadeOut(400, function() {
							//if (c >= 0) {
								floatBtn.fadeIn(400);
							//}
							if ($.isFunction(doneFn)) {
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
					itemsSelected(count);
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
		
	}
	
	$.fn.feedback.defaults = {
		expiry:					60 * 60 * 1000,		// 1 hour
		useFloatButton:			true,
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
		addComment:				'Add comment',
		viewFeedbackCart:		'Feedback window',
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