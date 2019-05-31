/*	
 *	paypal() :: setting up the shopping cart with Paypal
 *
 *	Usage: $(targetElement).paypal( [items,] options );
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Items: jQuery element (array) holding the elements
 *
 *	Options:
		target: 		'ShoppingCart',
		currency: 		'EUR',
		locale: 		'US',
		quantityCap: 	0,
		fixedLayer:		true
 */

;(function($, $window, $body) {
	'use strict';
	
	$.fn.paypal = function(album, settings) {
		
		if (!album) {
			return this;
		}
		
		settings = $.extend({}, $.fn.paypal.defaults, album.getRootProperty(J.SHOP), settings);
		
		if (!settings.id || !settings.options || !settings.currency) {
			var m = [];
			if (!settings.id) {
				m.push('Seller ID');
			}
			if (!settings.options) {
				m.push('Shop options');
			}
			if (!settings.currency) {
				m.push('Currency');
			}
			
			console.log('paypal.js: Required parameter(s) ' + m.join(', ') +  ' missing');
			return this;
		}
		
		if (settings.hasOwnProperty('handling')) {
			settings.handling = Math.abs((typeof settings.handling === 'string')? parseFloat(settings.handling) : settings.handling);
		}
		
		if (settings.hasOwnProperty('discount')) {
			settings.discount = Math.min(Math.max(0, (typeof settings.discount === 'string')? parseInt(settings.discount) : settings.discount), 99);
		}
		
		var // global vars
			self = 		$(this).eq(0),					// parent element					
			ns = 		self.data('lpp_ns'),			// event namespace
			text = 		$.fn.paypal.text,				// texts
			seller = 	settings.id.replace('|', '@'),	// seller ID
			currency = 	settings.curr_symbol[settings.currency] || settings.currency,
														// currency display format
			savedCoupon,								// saved coupon (to be able to restore after a wrong attempt)
			albumTitle = album.getAlbumTitle(),			// album title
			albumPath = album.getAbsolutePath(album.getTree()),
			
			// jQuery elements:
			cart,										// the cart parent
			popup,										// modal window
			cont,										// modal window content
			summary,									// short list
			details,									// long list
			newItems,									// newly added items
			itemTotal,									// item total row
			itemTotalAmount,							// item total amount
			reduction,									// reductions row
			coupon,										// coupon input
			discountRate,								// global discount rate
			discountAmount,								// discounted amount
			shipping,									// shipping row
			shippingAmount,								// shipping and handling
			total,										// total row
			totalAmount,								// total amount
			tax,										// tax row
			taxAmount,									// tax amount
			buyNowBtn,									// 'Buy' button
			emptyCartBtn,								// 'Empty cart' button
			floatBtn,									// floating shortcut button
						
			id = {
					cart:					'shopping-cart',
					shortcut:				'shopping-cart-shortcut',
					window:					'cart-window',
					cont:					'cont',
					summary:				'summary',
					summaryTxt:				'summary-txt',
					details:				'details',
					newItems:				'new-items',
					items:					'items',
					pricing:				'pricing',
					price:					'price',
					itemTotal:				'item-total',
					itemTotalAmount:		'item-total-amount',
					reduction:				'reduction',
					discountRate:			'discount-rate',
					discountAmount:			'discount-amount',
					total:					'total',
					totalAmount:			'total-amount',
					shipping:				'shipping',
					shippingAmount:			'shipping-amount',
					tax:					'tax',
					taxAmount:				'tax-amount',
					coupon:					'coupon',
					redeem:					'redeem',
					buttons:				'buttons',
					item:					'item',
					path:					'path',
					file:					'file',
					thumb:					'thumb',
					title:					'title',
					data:					'data',
					options:				'options',
					quantity:				'quantity',
					discount:				'discount',
					amount:					'amount'
				},
			
			cookie = {
					data:					'paypal.cart.data',
					date:					'paypal.cart.date',
					hash:					'paypal.cart.hash',
					settingsHash:			'paypal.cart.settingsHash',
					coupon:					'paypal.cart.coupon'
				},
			/*
			nm = {
					id:						'id',
					currency:				'currency',
					locale:					'locale',
					handling:				'handling',
					tax:					'tax',
					options:				'options',
					discount:				'discount',
					discountMinQuantity:	'discountMinQuantity',
					discountMinAmount:		'discountMinAmount',
					quantityCap:			'quantityCap',
					successUrl:				'return',
					sameWindowCheckout:		'sameWindowCheckout',
					coupons:				'coupons',
					instructions:			'instructions',
					hook:					'hook',
					buttons:				'buttons'
				},
			*/
			voidCoupons = 'paypal.cart.voidCs',
			
			price = function(p) {
					return currency + ' ' + p.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
				},
			
			// Converts data from HTML form element into Object (used in saveData)
			
			getFormData = function(f) {
					var o,
						os,
						data = {};
					
					o = f.find('.'+id.title);
					if (o.length) {
						data.title = o.text();
					}
					o = f.find('.'+id.path);
					if (o.length) {
						data.path = o.val();
					}
					o = f.find('.'+id.thumb).eq(0);
					if (o.length) {
						data.file = o.attr('src').getFile();
					}
					o = f.find('.'+id.options).eq(0);
					if (o.length) {
						if (o[0].nodeName === 'SELECT') {
							os = [];
							o.find('option').each(function() {
								os.push($(this).data('val'));
							});
							if (o[0].selectedIndex > 0) {
								data.selectedOption = o[0].selectedIndex;
							}
						} else {
							os = o.data('val');
						}
						if (os !== settings.options) {
							data.options = os;
						}
					}
					o = f.find('.'+id.discount);
					if (o.length) {
						data.discountRate = Math.abs(parseFloat(o.text()));
					}
					o = f.find('.'+id.quantity);
					if (o.length) {
						data.quantity = parseInt(o.val()) || 1;
						if (os = o.data('quantityCap')) {
							data.quantityCap = os;
						}
					}
					return data;
				},
			
			wipeData = function() {
					if (LOCALSTORAGE) {
						for (var c in cookie) {
							localStorage.removeItem(cookie[c]);     
						}
					}
				},
			
			getSettingsHash = function() {
					return JSON.stringify([
							settings.id,
							settings.currency,
							settings.options
						]).hashCode();
				},
			
			// Saving the cart to the localStorage
			
			saveData = function(doneFn) {
				
					if (LOCALSTORAGE) {
						var data = [],
							o;
						
						cart.find('.'+id.item).each(function() {
							o = getFormData($(this));
							if (!isEmpty(o)) {
								data.push(o);
							}
						});
						
						if (data.length) {
							data = JSON.stringify(data);
							localStorage.setItem(cookie.data, data);
							// Saving current time
							localStorage.setItem(cookie.date, (new Date()).getTime());
							// Saving hash to reduce the possibility of tampering
							localStorage.setItem(cookie.hash, data.hashCode()); 
							localStorage.setItem(cookie.settingsHash, getSettingsHash());
							if (coupon && (o = getCoupon())) {
								localStorage.setItem(cookie.coupon, o);
							} else {
								localStorage.removeItem(cookie.coupon);
							}
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
						var data,
							date = (new Date()).getTime(),
							d;
							
						if (d = localStorage.getItem(cookie.date)) {
							if ((date - parseInt(d)) > settings.expiry) {
								wipeData();
								return;
							} else {
								localStorage.setItem(cookie.date, date);
							}
						}
							
						if ((d = localStorage.getItem(cookie.data)) &&
							(localStorage.getItem(cookie.hash) == d.hashCode()) &&
							(localStorage.getItem(cookie.settingsHash) == getSettingsHash())) {
							
							var	i;
							
							data = JSON.parse(d);
							
							for (i = 0; i < data.length; i++) {
								addItem(details, data[i]);
							}
							
							getItemTotal(true);
							
							if (i) {
								setCoupon(localStorage.getItem(cookie.coupon));
							}
						}
					}
					
					updateCart(true);
					updateSummary();
					
					if ($.isFunction(doneFn)) {
						doneFn.call(this);
					}
				},
						
			// Converting the selected option into an Object
			
			getOptionObject = function(o) {
					var d = {},
						p;
					
					o = o.split('=');
					// decoding by adding to a textarea
					d.name = $('<textarea>', { 
							html: 	o[0]
						}).text();
					
					if (o.length > 1) {
						
						p = o[1].split('+');
						d.amount = parseFloat(p[0]);
						
						if (isNaN(d.amount)) {
							return null;
						}
						
						if (p.length > 1) {
							d.shipping = parseFloat(p[1]) || 0;
							if (p.length > 2) {
								d.shipping2 = parseFloat(p[2]) || 0;
							} else {
								d.shipping2 = d.shipping;
							}
						}
					}
					
					return d;
				},
			
			// Returns the whole options Object
						
			getOptionArray = function(o) {
					var a = [];
					
					o = o.split('::');
					
					for (var i = 0; i < o.length; ++i) {
						if (o[i] && (o[i].indexOf('=') > 0)) {
							a.push(getOptionObject(o[i]));
						}
					}
					
					return a;
				},
			
			getSelectedOption = function(f) {
					var o = f.find('.' + id.options);
					
					if (o.length) {
						if (o[0].nodeName === 'SELECT') {
							o = o.find('option:selected');
						}
						return o.data('val');
					}
					console.log('paypal.js: Can\'t find shop option!');
					return null;
				},
			
			// Adding select box
			
			setOptions = function(f, name, options, selectedOption) {
					var e = $(),
						optionTxt = function(o) {
							return o.name + ' = ' + price(o.amount) + (o.shipping? (' (+' + o.shipping.toFixed(2) + ')') : '');
						};
					
					if (typeof options === 'string') {
						options = getOptionArray(options);
					}
						
					if ($.isArray(options) && options.length > 1) {
						// More than 1 option
						e = $('<select>', {
								name: 		name,
								'class': 	name
							}).appendTo(f);
						
						for (var i = 0, o; i < options.length; i++) {
							o = options[i];
							e.append($('<option>', {
									html: 	optionTxt(o),
									val: 	o.amount
								})
								.data('val', o));
						}
						e[0].selectedIndex = selectedOption || 0;
						
					} else {
						
						if ($.isArray(options)) {
							options = options[0];
						}
						
						// Single option
						e = $('<span>', {
								'class': 	name,
								html: 		optionTxt(options)
							})
							.data('val', options)
							.appendTo(f);
					}
						
					return e;
				},
			
			// Adding title
			
			setTitle = function(f, title, thumb) {
					if (thumb) {
						f.append($('<img>', {
								'class': 	id.thumb,
								src: 		thumb
							}));
					}
					f.append($('<span>', {
							'class': 	id.title,
							html: 		title
						}));
				},
						
			// Adding an input
			
			setInput = function(f, name, val, type, attr) {
					
					if (!f || !name) {
						return {};
					}
					
					var e = $('<input>', { 
								type: 	type || 'text'
							}).appendTo(f);
								
					// name
					e.prop('name', name).addClass(name); 
						
					// initial value
					if (val) {
						e.val((typeof val === 'string')? val.stripQuote() : val);
					}
						
					// simple attributes e.g. 'readonly'
					if (attr) {
						e.prop(attr, true);
					}
		
					return e;
				},
			
			// Adding one item
			
			addItem = function(target, item) {
					
					// Already 99 items in the cart :: Paypal's limit
					if (cont.find('.' + id.item).length >= 99) {
						$body.modal($('<div>', {
								html: 		text.noMoreItems
							}), {
								autoFade: 	3000,
								'class':	'warning small'
							});
						return -1;
					}
					
					// Creating the form
					var	f = $('<form>', {
								name: 		id.item,
								'class': 	id.item + ' clearfix',
								method: 	'post'
							}),
						d,
						el;
	
					// Updating on Enter
					f.on('submit', function(e) {
							e.preventDefault();
							$(this).trigger('update');
							return false;
						});
						
					// Remove button
					el = $('<a>', {
							'class': 	'button icon-cancel'
						}).appendTo(f);
						
					el.on('click.' + ns, function() {
							$(this).parents('form').eq(0).remove();
							updateCart();
						}).on('selectstart', function(e) {
							e.preventDefault();
							return false;
						});
					
					if (item.hasOwnProperty('path') && item.hasOwnProperty('file') && 
						item.hasOwnProperty('title') && item.hasOwnProperty('options')) {
						
						// Saving misc data
						setInput(f, id.path, item['path'], 'hidden');
						setInput(f, id.file, item['file'], 'hidden');
						
						// Title
						setTitle(f, item.title, (item.path? getRelativePath(settings.relPath || '/', item.path) : (settings.rootPath + '/')) + settings.thumbsFolder + item.file);
						//console.log('relpath=' + settings.relPath + ' item.path=' + item.path + ' relative=' + getRelativePath(settings.relPath, item.path)); 
						d = $('<div>', {
								'class': 	id.data
							}).appendTo(f);
						
						// Options
						el = setOptions(d, id.options, item.options, item.selectedOption);
						el.on('change', function() {
								$(this).parents('form').eq(0).trigger('update');
							});
						
						// Quantity
						d.append('&times;');
						
						var qc = item.hasOwnProperty('quantityCap')? item.quantityCap : settings.quantityCap;
						el = setInput(d, id.quantity, qc? Math.min(qc, item.quantity || 1) : item.quantity || 1);
						
						if (item.hasOwnProperty('quantityCap') && item.quantityCap > 0) {
							el.data('quantityCap', item.quantityCap);
						}
						
						if (!item.hasOwnProperty('quantityCap') && settings.quantityCap !== 1 || item.quantityCap !== 1) {
							el.on('change',function() {
								var t= $(this),
									q,
									qc = $(this).data('quantityCap');
									
								if (typeof qc === UNDEF) {
									qc = settings.quantityCap;
								}
								
								if (qc > 0 && (q = parseInt(t.val())) > qc) {
									$body.modal($('<div>', {
											html: 		text.maxNItems.replace('{0}', qc)
										}), {
											autoFade: 	3000,
											'class':	'warning small'
										});
									t.val(qc);
								}
								
								t.parents('form').eq(0).trigger('update');
							});
						} else {
							el.prop('disabled', 'disabled');
						}
						
						// Discount
						if (item.hasOwnProperty('discountRate') && item.discountRate > 0 && item.discountRate <= 99) {
							d.append($('<span>', {
									'class': 	id.discount,
									text: 		'-' + item.discountRate + '%'
								}));
						}
						
						// Tax
						/* // Only the global setting is valid
						if (item.hasOwnProperty('tax') && item.tax > 0) {
							d.append($('<span>', {
									'class': 	id.tax,
									text: 		item.tax + '%'
								}));
						}
						*/
						
						// Amount
						d.append('=');
						d.append($('<span>', {
								'class': 	id.amount
							}));
						
						// Updating item
						f.on('update.' + ns, function() {
							calculateRow($(this));
							updateCart();
						});
						
						if (calculateRow(f) !== null) {
							target.append(f);
							return f;
						} else {
							console.log('paypal.js: Calculation error! Item skipped.');
						}
					} else {
						console.log('paypal.js: Can\'t add item. Required parameter "path", "title" or "options" missing.');
					}
					return null;
				},
			
			// Converts jAlbum.Album object into Object
			
			getItem = function(item) {
					var data = {},
						d,
						shop = album.getPropertyObject(item, J.SHOP, true);
					
					if (shop && shop.hasOwnProperty('options') && shop.options !== '-') {
						
						data = {
							title: 		item[J.TITLE] || item[J.NAME] || '',
							path:		album.getFolderPath(item),
							file:		item[J.NAME],
							options:	getOptionArray(shop.options)
						}
						
						if (shop.hasOwnProperty('discountRate')) {
							d = parseInt(shop.discountRate);
							if (d > 0 && d < 100) {
								data.discountRate = d;
							}
						}
						
						if (shop.hasOwnProperty('tax')) {
							d = parseFloat(shop.tax);
							if (d > 0) {
								data.tax = d;
							}
						}
						
						if (shop.hasOwnProperty('quantityCap')) {
							d = parseInt(shop.quantityCap);
							if (d > 0) {
								data.quantityCap = d;
							}
						}
					}
					
					return data;
				},
			
			// adding jAlbum.Album objects
			
			addItems = function(items) {
					
					if (!items || !items.length) {
						return;
					}
					
					if ($.isArray(items)) {
						if (items.length > 1) {
							moveNewItems();
							for (var i = 0; i < items.length; i++) {
								if (addItem(newItems, getItem(items[i])) === -1) {
									break;
								}
							};
						} else {
							addItem(details, getItem(items[0]));
						}
					} else {
						addItem(newItems, getItem(items));
					}
					
					updateCart();
					
					showCart();
				},
			
			// get the number of items
			
			getItemCount = function() {
					var cnt = 0;
					
					cont.find('.' + id.item).each(function() {
						cnt += parseInt($(this).find('.' + id.quantity).val(), 10) || 1;
					});
					
					return cnt;
				},
				
			// updating the summary row
			
			updateSummary = function() {
					var items = details.find('.' + id.item),
						stxt = summary.find('.' + id.summaryTxt),
						l = items.length;
						
					stxt.empty();
					
					if (!l) {
						summary.hide();
					} else {
						for (var i = 0; i < 3; i++) {
							if (i >= l) {
								break;
							}
							stxt.append($('<img>', {
									src: 	items.eq(i).find('img.' + id.thumb).attr('src')
								}));
						}
						
						if (l > 3) {
							stxt.append(' +' + (l - 3) + ' ' + (text[(l > 4)? 'items' : 'item']));
						}
						
						details.hide();
						summary.show();
					}
				},		
				
			// Showing the details (instead of summary)
			
			showDetails = function() {
					if (details.is(':hidden')) {
						moveNewItems();
						summary.hide();
						details.fadeIn(400, scrollToLast);
					}
				},
			
			// Number of items
			
			itemCount = function() {
					return cont.find('.' + id.item).length;
				},
				
			
			// Moving new items into the details from newItems
			
			moveNewItems = function() {
			
					newItems.find('.' + id.item).each(function() {
						$(this).appendTo(details);
					});
					
					newItems.empty().hide();
					
					updateSummary();
				},
			
			// Calculate one item's amount
			
			calculateRow = function(f) {
					var o = getSelectedOption(f),
						q = 1,
						d,
						el,
						a,
						s = 0;
					
					if (o && o.amount) {
						if ((el = f.find('.' + id.quantity)).length) {
							q = parseInt(el.val(), 10) || 1;
						}
						a = o.amount * q;
						if ((el = f.find('.' + id.discount)).length) {
							if (d = Math.abs(parseFloat(el.text()))) {
								a *= (1 - d / 100);
							}
						}
						f.data('amount', a);
						if (o.shipping) {
							s += o.shipping;
						}
						if (o.shipping2 && q > 1) {
							s += (q - 1) * o.shipping2;
						}
						f.data('shipping', s);
						f.find('.' + id.amount).html(price(a));
					} else {
						console.log('paypal.js: Calculation error!');
					}
					
					return a;
				},
						
			// Recalculate from all the items
			
			recalculate = function() {
					var a,
						s,
						it = 0,
						sh = 0;
					
					cont.find('.' + id.item).each(function() {
						a = $(this).data('amount');
						if (typeof a === UNDEF) {
							a = calculateRow($(this));
						}
						s = $(this).data('shipping');
						it += a;
						sh += s;
					});
					
					itemTotal.data('val', it);
					shipping.data('aggregate', sh);
					return it;
				},
			
			
			// Returns item total (without discount and shipping)
			
			getItemTotal = function(force) {
					var a = itemTotal.data('val');
					
					if (force || typeof a === UNDEF) {
						// Not yet calculated or need to be recalculated
						a = recalculate();
					}
					
					return a;
				},
			
			// Updating total amount
			
			updateTotal = function(initial) {
					var d = 		0,
						cnt = 		getItemCount(),
						it = 		getItemTotal(initial),
						sh = 		shipping.data('aggregate') || 0,
						h = 		settings.handling || 0;
						
					itemTotalAmount.html(price(it));
					
					if (reduction) {
						
						if ((d = discountAmount.data('qmin')) && d > cnt) {
							
							// Below quantity minimum
							d = 0;
							if (hasCoupon()) {
								$body.modal($('<div>', {
										html: 		text.couponRemoved + ' ' + text.addMoreItems.replace('{0}', d - cnt)
									}), {
										autoFade: 	3000,
										'class':	'warning small'	
									});
								removeCoupon();
							} else {
								showDiscount(false);
							}
							
						} else if ((d = discountAmount.data('amin')) && d > it) {
								
							// Below amount minimum
							d = 0;
							if (hasCoupon()) {
								$body.modal($('<div>', {
										html: 		text.couponRemoved + ' ' + text.validAbove.replace('{0}', price(d))
									}), {
										autoFade: 	3000,
										'class':	'warning small'	
									});
								removeCoupon();
							} else {
								showDiscount(false);
							}
								
						} else {
							
							// Qualifies for discount
							if (discountRate && (d = discountRate.data('val')) && d > 0) {
									
								// Updating discount with rate if it's percent
								d = it * d / 100;
								discountAmount.data('val', d).html(price(d));
								showDiscount(true);
								
							} else if ((d = discountAmount.data('val')) && d > 0) {
								
								// Discount amount used
								if (discountRate) {
									discountRate.hide();
								}
								
								if (d > it) {
									$body.modal($('<div>', {
											html: 		text.couponRemoved + ' ' + text.amountLowerThan.replace('{0}', price(d))
										}), {
											autoFade: 	3000,
											'class':	'warning small'	
										});
									d = 0;
									// The coupon is bigger than the total amount -> removing
									removeCoupon();
								} else {
									showDiscount();
								}
							} else {
								showDiscount(false);
							}
						}
					}
					
					if (h || sh > 0) {
						shipping.show().data('val', Math.max(0, h + sh));
						shippingAmount.html(price(h + sh));
					} else {
						shipping.hide();
					}
					
					it += h + sh - d;
					
					totalAmount.data('netval', it);
					
					if (settings.tax) {
						taxAmount.html(price(it * settings.tax / 100));
						it += it * settings.tax / 100;
					}
					
					totalAmount.html(price(it));
					return it;
				},
									
			// Get/set discount rate
			
			getDiscountRate = function() {
					return discountRate.data('val') || 0; 
				},
			
			setDiscountRate = function(d) {
					if (reduction) {
						if (typeof d !== UNDEF) {
							var da = getItemTotal() * d / 100;
							discountRate.data('val', d).text('-' + d + '%').toggle(d > 0);
							discountAmount.data('val', da).html(price(da));
							showDiscount(d > 0);
						} else {
							if (coupon) {
								coupon.val('');
								if (LOCALSTORAGE) {
									localStorage.removeItem(cookie.coupon);
								}
								savedCoupon = null;
							}
							discountRate.data('val', 0).empty().hide();
							discountAmount.data('val', 0).html(price(0));
							showDiscount(false);
						}
					}
				},
			
			showDiscount = function(show) {
					reduction.find('.' + id.data).toggle((typeof show === UNDEF)? true : show);
				},
			
			setInitialDiscount = function() {
				
					// Setting up Initial discount
					if (settings.hasOwnProperty('discount') && settings.discount > 0 && settings.discount < 100) {
						// Global discount rate
						var amin = 0,
							qmin = 0,
							it = getItemTotal();
							
						discountRate.data('val', settings.discount).text('-' + settings.discount + '%');
						
						if (settings.hasOwnProperty('discountMinQuantity') && settings.discountMinQuantity > 0) {
							discountAmount.data('qmin', settings.discountMinQuantity);
							qmin = settings.discountMinQuantity;
						}
						
						if (settings.hasOwnProperty('discountMinAmount') && settings.discountMinAmount > 0) {
							discountAmount.data('amin', settings.discountMinAmount);
							amin = settings.discountMinAmount;
						}
						
						if ((qmin && getItemCount() < qmin) || (amin && it < amin)) {
							discountRate.hide();
							discountAmount.data('val', 0).html(price(0));
							showDiscount(false);
						} else {
							var da = it * settings.discount / 100;
							discountRate.show();
							discountAmount.data('val', da).html(price(da));
							showDiscount(da > 0);
						}
						
					} else if (reduction) {
						// Coupon is present?
						if (coupon) {
							coupon.val('');
							if (LOCALSTORAGE) {
								localStorage.removeItem(cookie.coupon);
							}
							savedCoupon = null;
						}
						if (discountRate) {
							discountRate.data('val', 0).empty().hide();
						}
						discountAmount.data('val', 0).html(price(0));
						showDiscount(false);
					}
				},
			
			// Get/set discount amount

			getDiscountAmount = function() {
					return discountAmount? (discountAmount.data('val') || 0) : 0; 
				},
			
			setDiscountAmount = function(d) {
					if (reduction) {
						var da = Math.min(getItemTotal(), d);
						if (discountRate) {
							discountRate.data('val', 0).empty().hide();
						}
						discountAmount.data('val', da).html(price(da));
						showDiscount(da > 0);
					}
				},
					
			
			// Something has Changed
			
			updateCart = function(initial) {
					var cnt = itemCount();
					
					if (newItems.is(':empty')) {
						newItems.hide();
						details.show();
						summary.hide();
					} else {
						newItems.show();
						details.hide();
						summary.toggle(!details.is(':empty'));
					}
					//summary.toggle(!(details.is(':empty') || details.is(':visible')));
					
					buyNowBtn.add(emptyCartBtn).toggleClass('disabled', cnt === 0);
					
					if (initial && !hasCoupon()) {
						setInitialDiscount();
					}
					
					updateTotal(true);
					updateFloatBtn(cnt);
					
					if (!cart.is(':visible') && cnt) {
						floatBtn.fadeIn(400);
					} else {
						floatBtn.hide();
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
							.html(' ' + text.viewCart + ((c > 0)? (' <b>' + c + '</b>') : ''));
					} else {
						floatBtn.find('.button')
							.removeClass('view-cart').addClass('add-cart pop')
							.html('<sup>+</sup> ' + text.addCart + ' <b>' + sel + '</b>');
					}	
				},
				
			// Restoring previous coupon / discount
			
			restoreCoupon = function() {
					if (!coupon) {
						return;
					}
					
					if (savedCoupon && savedCoupon.hasOwnProperty('code') && getCoupon() !== savedCoupon.code) {
						// We have a saved coupon
						var d;
						coupon.val(savedCoupon.code);
						if (d = savedCoupon['rate']) {
							discountRate.data('val', d).text('-' + d.toFixed(2) + '%');
						}
						if (d = savedCoupon['amount']) {
							discountAmount.data('val', d).html(price(d));
						}
					} else {
						savedCoupon = null;
						coupon.val('');
						// Falling back to default discount
						setInitialDiscount();
					}
				},
			
			// Restoring only the code (after a failed validation)
			
			restoreCouponCode = function() {
					if (!coupon) {
						return;
					}
					
					if (savedCoupon && savedCoupon.hasOwnProperty('code')) {
						coupon.val(savedCoupon.code);
					} else {
						coupon.val('');
					}
				},
			
			// Removing voupon
			
			removeCoupon = function() {
					if (coupon) {
						coupon.val('');
						savedCoupon = {};
						setInitialDiscount();
					}
				},
			
			// Save coupon
			
			saveCoupon = function() {
					var c;
					
					if (coupon && (c = getCoupon())) {
						savedCoupon = {};
						savedCoupon.code = c;
						if (c = discountRate.data('val')) {
							savedCoupon.rate = c;
						}
						if (c = discountAmount.data('val')) {
							savedCoupon.amount = c;
						}
						if (c = discountAmount.data('qmin')) {
							savedCoupon.qmin = c;
						}
						if (c = discountAmount.data('amin')) {
							savedCoupon.amin = c;
						}
					} else {
						savedCoupon = null;
					}
				},
			
			// Sets the coupon and validates right off
			
			setCoupon = function(d) {
					if (d && d.length && coupon) {
						coupon.val(d);
						validateCoupon(false);
					}
				},
			
			// Reads the coupon
			
			getCoupon = function() {
					return coupon? coupon.val().trim() : '';
				},
			
			// Has coupon?
			
			hasCoupon = function() {
					return coupon && coupon.val().trim().length > 0;
				},
				
						
			// Void coupon
			
			voidCoupon = function(c) {
					if (LOCALSTORAGE) {
						var cs = localStorage.getItem(voidCoupons);
										
						if (cs && cs.length) {
							if (!c || c == cs || cs.indexOf('::') && cs.match(new RegExp('^' + c + '::|::' + c + '::|::' + c + '$'))) {
								return;
							}
							localStorage.setItem(voidCoupons, cs + '::' + c);
						} else if (c) {
							localStorage.setItem(voidCoupons, c);
						}
					}
				},
				
			isCouponVoid = function(c) {
					if (LOCALSTORAGE) {
						var cs = localStorage.getItem(voidCoupons);
						return cs && (c == cs || cs.indexOf('::') && cs.match(new RegExp('^' + c + '::|::' + c + '::|::' + c + '$')));
					}
					return false;
				},
			
			
			// Validate coupon code
			
			validateCoupon = function(feedback) {
					var name;
					
					if (coupon && (name = getCoupon())) {
						
						if (savedCoupon && savedCoupon.hasOwnProperty('code') && savedCoupon.code === name) {
							
							// This coupon has been validated before
							return true;
						}
						
						var c, 
							d,
							isRate,
							exp,
							qmin,
							amin,
							now = 			new Date(),
							it = 			getItemTotal(),
							ic = 			getItemCount(),
							cs = 			xDecrypt(settings.coupons).split('::'),
							readDate = 		function(s) {
												var d = s.split(/-|:|\//);
												if (d.length < 2) {
													d[1] = 1;
												}
												if (d.length < 3) {
													d[2] = 1;
												}
												return new Date(parseInt(d[0]), parseInt(d[1]), parseInt(d[2]));
											};
	
							
						for (var i = 0; i < cs.length; i++) {
							
							c = cs[i].split(/=|\s/);
							
							if (c[0] === name && c.length > 1) {
								
								d = parseFloat(c[1]);
								if (typeof d === 'NaN' || d < 0.01) {
									// Too small
									continue;
								}
								
								isRate = c[1].charAt(c[1].length - 1) === '%';
								
								// Processing the extra data: expiry, min quantity, min amount
								
								exp = 0;
								qmin = 0;
								amin = 0.0;
								
								for (var j = 2; j < c.length; j++) {
									if (c[j].match(/<\d+([-|\:|\/]\d+[-|\:|\/]\d+[-|\:|\/])*/)) {
										exp = readDate(c[j].substring(1));
									} else if (c[j].match(/\d+\.\d+\+/)) {
										amin = parseFloat(c[j]);
									} else if (c[j].match(/\d+\+/)) {
										qmin = parseInt(c[j], 10) || 0;
									}
								}
								
								if (exp && exp < now) {
									
									// Expired
									
									if (feedback) {
										$body.modal($('<div>', {
												html: 		text.expired.replace('{0}', name)
											}), {
												autoFade: 	3000,
												'class':	'alert small'	
											});
									} else {
										console.log('Coupon "' + name + '" has expired!');
									}
	
									restoreCouponCode();
									
										
								} else if (amin && it < amin) {
									
									// Below the amount limt
									
									if (feedback) {
										$body.modal($('<div>', {
												html: 		text.minAmountWarning.replace('{0}', price(amin))
											}), {
												autoFade: 	3000,
												'class':	'warning small'	
											});
									} else {
										console.log('Coupon "' + name + '" can only be used if the item total amount is at least ' + price(amin));
									}
	
									restoreCouponCode();
									
								} else if (qmin && ic < qmin) {
									
									// Below the quantity limt
									
									if (feedback) {
										$body.modal($('<div>', {
												html: 		text.minQuantityWarning.replace('{0}', qmin)
											}), {
												autoFade: 	3000,
												'class':	'warning small'	
											});
									} else {
										console.log('Coupon "' + name + '" can only be used if there is at least ' + qmin + ' items in the cart!');
									}
	
									restoreCouponCode();
										
								} else if (isRate) {
									
									// Discount rate
									
									if (d > 99 || d < 1) {
										// Not allowed
										continue;
									}
									
									var dr = getDiscountRate();
									
									if (dr > d) {
										
										// Lower than current discount
										
										if (feedback) {
											$body.modal($('<div>', {
												html: 		text.lowerThanCurrent.replace('{0}', dr + '%')
											}), {
												autoFade: 	3000,
												'class':	'warning small'	
											});
										} else {
											console.log('Coupon "' + name + '" provides lower discount than current!');
										}
	
										restoreCouponCode();
										
									} else {
									
										// Better discount than the previous
										
										if (feedback) {
											// Redeem feedback
											$body.modal($('<div>', {
												html: 		text.couponAccepted.replace('{0}', d + '%')
											}), {
												autoFade: 	3000,
												title: 		text.success,
												'class':	'success small'	
											});
										}
										
										setDiscountRate(d);
										discountAmount.data({
												amin: 	amin,
												qmin: 	qmin
											});
										saveCoupon();
										updateCart();
									}
									
								} else if (isCouponVoid(name)) {
									
									// The coupon has been reclaimed already
									
									if (feedback) {
										// Redeem: warning, but no action
										$body.modal($('<div>', {
											html: 		text.reclaimed
										}), {
											autoFade: 	3000,
											'class':	'warning small'	
										});
									} else {
										console.log('Coupon "' + name + '" has been reclaimed previously.');
									}
									
									// Removing discount amount, adding back the saved rate
									restoreCouponCode();
																	
								} else {
									
									// Discount amount (coupon is not yet used since last cache clear)
									
									var dr = getDiscountRate(),
										da = (dr > 0)? (it * dr / 100) : 0;
									
									if (it < d) {
										
										// Price is lower than discount amount : no go
										
										if (feedback) {
											// Redeem: warning, but no action
											$body.modal($('<div>', {
												html: 		text.higherThanTotal.replace('{0}', price(d))
											}), {
												autoFade: 	3000,
												'class':	'warning small'	
											});
										} else {
											console.log('Coupon "' + name + '" provides higher discount that the total amount!');
										}
										
										restoreCouponCode();
										
									} else if (da > d) {
										
										// Previous discount amount is higher than current
										// Show warning, but accepting
										
										if (feedback) {
											$body.modal($('<div>', {
												html: 		text.lowerThanCurrent.replace('{0}', price(da))
											}), {
												autoFade: 	3000,
												'class':	'warning small'	
											});
										} else {
											console.log('Coupon "' + name + '" offers less discount than the current!');
										}
										
										setDiscountAmount(d);
										discountAmount.data({
											amin: amin,
											qmin: qmin
										});
										saveCoupon();
										updateCart();
										
									} else {
										
										// Great, it works
																		
										if (feedback) {
											// Redeem: feddback
											$body.modal($('<div>', {
												html: 		text.couponAccepted.replace('{0}', price(d))
											}), {
												autoFade: 	3000,
												title: 		text.success,
												'class':	'success small'	
											});
										}
										
										// Adding discount amount
										setDiscountAmount(d);
										discountAmount.data({
											amin: amin,
											qmin: qmin
										});
										saveCoupon();
										updateCart();
									}
								}
								
								// No blocking error
								return true;
							
							} // for: next coupon 
						}
						
						// Not found
						$body.modal($('<div>', {
							html: 		text.noSuch
						}), {
							autoFade: 	3000,
							'class':	'alert small'	
						});
						
						restoreCouponCode();
						
						// Do not send the form!
						return false;
					}
					
					// No coupons exists or coupon field is empty
					return true;
				},
			
			
			// Get data for sending to Paypal
			
			getDataToSend = function(f) {
					var el,
						o,
						data = {};
					
					if ((el = f.find('.' + id.title)).length) {
						data.title = el.text();
					}
					if ((el = f.find('.' + id.path)).length) {
						data.path = el.val();
					}
					if ((el = f.find('.' + id.file)).length) {
						data.file = el.val();
					}
					o = getSelectedOption(f);
					if (o) {
						if (o.hasOwnProperty('name')) {
							data.option = o.name;
						}
						if (o.hasOwnProperty('amount')) {
							data.amount = o.amount;
						}
						if (o.hasOwnProperty('shipping')) {
							data.shipping = o.shipping;
						}
						if (o.hasOwnProperty('shipping2')) {
							data.shipping2 = o.shipping2;
						}
					}
					if ((el = f.find('.' + id.quantity)).length) {
						data.quantity = el.val();
					}
					if ((el = f.find('.' + id.discount)).length) {
						data.discount = Math.abs(parseInt(el.text(), 10));
					}
					if ((el = f.find('.' + id.tax)).length) {
						data.tax = el.val();
					}
						
					return data;
				},
			
			// Sending the cart to Paypal
			
			sendCart = function() {
					
					var form = $('<form>', {
								'class': 	'hide',
								'method':	'post',
								'action':	(DEBUG? settings.sandboxurl : settings.url) + 'cgi-bin/webscr'
							}).appendTo(cont),
						items = cont.find('.'+id.item),
						inp = function(name, val) {
								form.append($('<input>', {
									type:	'hidden',
									name: 	name,
									val:	val
								}));
							};
					
					if (!items.length) {
						buyNow.addClass('disabled');
						return;
					}
					
					if (!settings.sameWindowCheckout) {
						form.attr('target', settings.target);
					}
					
					inp('cmd', '_cart');
					inp('charset', 'utf-8');
					inp('lc', settings.locale);
					inp('upload', '1');
					inp('business', settings.id.replace('|', '@'));
					inp('currency_code', settings.currency);
					inp('custom', albumTitle + ' :: ' + albumPath);
					
					if (settings.hasOwnProperty('successUrl')) {
						inp('return', settings.successUrl.fixjAlbumPaths(settings.resPath, settings.rootPath, settings.relPath));
					}
					
					if (settings.hasOwnProperty('handling') && settings.handling > 0) {
						inp('handling_cart', settings.handling);
					}
					
					items.each(function(i) {
						var d = getDataToSend($(this)),
							n = (String)(i + 1),
							f = [d['path'], d['file']].join('/');
							
						inp('item_name_' + n, decodeURIComponent(d['path'] + '/' + d['file']) + ' :: ' + ((d.title !== d.file.stripExt())? (d.title + ' :: ') : '') + d.option);
						if (d.hasOwnProperty('discount') && d.discount > 0) {
							inp('amount_' + n, (d.amount * (1 - d.discount / 100)).toFixed(2));
						} else {
							inp('amount_' + n, d.amount.toFixed(2));
						}
						if (d.hasOwnProperty('quantity') && d.quantity > 1) {
							inp('quantity_' + n, d.quantity);
						}
						if (d.hasOwnProperty('shipping') && d.shipping > 0) {
							inp('shipping_' + n, d.shipping);
							if (!d.hasOwnProperty('shipping2')) {
								inp('shipping2_' + n, d.shipping);
							} else  if (d.shipping2 > 0) {
								inp('shipping2_' + n, d.shipping2);
							}
						}
						if (d.hasOwnProperty('tax') && d.tax > 0) {
							inp('tax_' + n, d.tax);
						}
					});
					
					form.append($('<input>', {
						type: 	'submit',
						val:	'PayPal'
					}));
					
					// Sending - Checking invalid coupons
					if (!reduction || validateCoupon(false)) {
						
						if (reduction) {
							var d = discountRate.data('val');
								
							if (d) {
								
								var	a = getItemTotal(),
									amin = discountAmount.data('amin'),
									q = getItemCount(),
									qmin = discountAmount.data('qmin');
									
								if ((!amin && !qmin) || 			// Unconditional
									(!qmin && a >= amin) || 		// Only amount min.
									(!amin && q >= qmin) ||			// Only quantity min.
									(a >= amin && q >= qmin)) {		// Both 
									inp('discount_rate_cart', d);
								}
								
							} else if (d = discountAmount.data('val')) {
								
								inp('discount_amount_cart', d);
								// voiding coupon
								if (coupon) {
									voidCoupon(coupon.find('input').val());
								}
							}
						}
						
						if (settings.tax > 0) {
							var t = totalAmount.data('netval');
							if (t && settings.tax) {
								inp('tax_cart',  (t * settings.tax / 100).toFixed(2));
							}
						}
	
						if (DEBUG) {
							console.log((form.html()+'').replace(/></g,'>\n<'));
						}
						
						// Yes, ready to send
						if (!settings.sameWindowCheckout) {
							var w = Math.min($window.width() - 80, 1024),
								h = Math.min($window.height() - 80, 800);
							window.open('', settings.target, 'width=' + w + ',height=' + h + ',left=40,top=40,location=no,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,directories=no,status=no,copyhistory=no');
						}
						form.trigger('submit');
						items.remove();
						updateCart();
						hideCart();
					}
					
				},

			// Creating the cart
			
			init = function(doneFn) {
				
					// Cart exists? Yes: clean old event handlers and div's
					if (ns !== undefined) {
						$(popup).off('.' + ns);
						$('#cart_' + ns).remove();
						$('#cart_shortcut_' + ns).remove();
					}
					
					// Creating new namespace
					self.data('lpp_ns', ns = 'lpp_' + Math.floor(Math.random() * 10000));
					
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
									'class':	'small button icon-shopping-cart view-cart'
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
							'class': 	'icon-shopping-cart',
							html: 		'<strong> ' + text.shoppingCart + '</strong>' 
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
					
					// Summary row
					summary = $('<div>', {
							'class': 	id.summary + ' clearfix'
						}).hide().appendTo(cont);
					
					summary.append($('<div>', {
							'class': 	id.summaryTxt
						}));
					
					// Show details button
					summary.append($('<a>', {
							'class': 	'details-btn icon-drop-down',
							text: 		' ' + text.edit
						}).on('click.' + ns, showDetails));
					
					// Details container
					details = $('<div>', {
							'class': 	id.details + ' ' + id.items
						}).hide().appendTo(cont);
					
					// Container for recenty added items
					newItems = $('<div>', {
							'class': 	id.newItems + ' ' + id.items
						}).appendTo(cont);
					
					// Container for pricing rows
					var pricing = $('<div>', {
							'class':	id.pricing
						}).appendTo(cont);
					
					// Item toal row
					itemTotal = $('<div>', {
							'class': 	id.itemTotal,
							text: 		text.subtotal + ': '
						}).appendTo(pricing);
					
					// Item total amount
					itemTotalAmount = $('<span>', {
							'class': 	id.itemTotalAmount + ' ' + id.amount
						}).appendTo(itemTotal);
					
					if (settings.coupons || settings.discount) {
						
						// Reductions row
						reduction = $('<div>', {
							'class': 	id.reduction + ' clearfix'
						}).appendTo(pricing);
						
						// Coupons
						if (settings.coupons) {
							
							var el = $('<form>', {
									'class': 		id.coupon
								}).appendTo(reduction);
							
							// Remove button
							el.append($('<a>', {
									'class': 		'button icon-cancel'
								}).on('click.' + ns, function() {
									removeCoupon();
									updateCart();
								}));
							
							coupon = $('<input>', {
									type: 			'text',
									placeholder: 	text.couponCode
								}).appendTo(el);
							
							el.append($('<a>', {
									'class': 		'secondary button icon-refresh'
								}).on('click', function() {
									validateCoupon(true);
								}));
							
							el.on('submit', function() {
									validateCoupon(true);
									return false;
								});
							
							coupon.on('blur', function() {
									validateCoupon(true);
								});
							
							coupon.prev().addTooltip(text.remove);
						}
						
						// Discount rate and amount
						reduction.append($('<div>', {
								'class': 	id.data,
								text: 		text.discount
							}).append(discountRate = $('<span>', {
								'class': 	id.discount + ' ' + id.discountRate
							})).append(': &ndash;').append(discountAmount = $('<span>', {
								'class': 	id.discountAmount + ' ' + id.amount
							})));
					}
					
					// Shipping and handling row
					shipping = $('<div>', {
							'class': 	id.shipping,
							text: 		text.shippingAndHandling + ': +'
						}).appendTo(pricing);
					
					// Shipping amount
					shippingAmount = $('<span>', {
							'class': 	id.shippingAmount + ' ' + id.amount
						}).appendTo(shipping);
					
					if (settings.tax) {
						// Tax row
						tax = $('<div>', {
								'class': 	id.tax,
								text: 		text.tax + ' (' + settings.tax + '%): +'
							}).appendTo(pricing);
						
						// Tax amount
						taxAmount = $('<span>', {
								'class': 	id.taxAmount + ' ' + id.amount
							}).appendTo(tax);
					}
					
					// Total row
					total = $('<div>', {
							'class': 	id.total,
							text: 		text.total + ': '
						}).appendTo(pricing);
					
					// Total amount
					totalAmount = $('<span>', {
							'class': 	id.totalAmount + ' ' + id.amount
						}).appendTo(total);
					
					// Buttons
					var btns = $('<div>', {
							'class': 	id.buttons
						}).appendTo(cont);
					
					btns.append($('<a>', {
							'class': 	'secondary button icon-arrow-left',
							text: 		' ' + text.continueShopping
						}).on('click.' + ns, hideCart));
					
					emptyCartBtn = $('<a>', {
							'class': 	'alert button icon-trash',
							text: 		' ' + text.emptyCart
						}).on('click.' + ns, emptyCart).appendTo(btns);
					
					buyNowBtn = $('<a>', {
							'class': 	'disabled button icon-paypal',
							html: 		' ' + text.buyNow
						}).on('click.' + ns, sendCart).appendTo(btns);
					
					btns.append($('<p>', {
							'class':	'fineprint',
							text:		text.processedByPaypal
						}));
						
					// Instructions
					if (settings.hasOwnProperty('instructions')) {
						cont.append($('<div>', {
								'class': 	'instructions icon-info'
							})
							.append($('<div>')
							.append(settings.instructions.fixjAlbumPaths(settings.resPath, settings.rootPath, settings.relPath))));
					}
					
					setInitialDiscount();
					
					// Adding tooltip texts
					//floatBtn.find('a.button').addTooltip(text.viewCart);
					popup.find('a.close').addTooltip(text.continueShopping);
					
					loadData();
				},
			
			emptyCart = function(doneFn) {
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
									if ($.isFunction(doneFn)) {
										doneFn.call(this);
									}
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
								
							scrollToLast();
								
							if ($.isFunction(doneFn)) {
								doneFn.call(this);
							}
						})
					}
					floatBtn.fadeOut();
				},
			
			hideCart = function(doneFn) {
					var c = getItemCount();
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
					}
				};
			
		
		// Global options
		if (!settings.hasOwnProperty('options')) {
			settings.options = album.getRootProperty('shopOptionsGlobal');
		}
		
		if (typeof settings.options === 'string') {
			settings.options = getOptionArray(settings.options);
		}
		
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
		
		// Ready event
		
		if (settings.hasOwnProperty('onReady')) {
			settings.onReady(this);
		}

		return this;
		
	}
	
	$.fn.paypal.defaults = {
		currency: 			'EUR',
		locale: 			'US',
		quantityCap: 		0,					// any number of the same item
		expiry:				60 * 60 * 1000,		// 1 hour
		shippingFlat: 		false,				// Single shipping fee per finished cart
		sameWindowChekout: 	false,				// No popup for checkout
		useFloatButton:		true,
		target:				'BuyNow',
		rootPath:			'',
		relPath:			'',
		thumbsFolder:		'thumbs/',
		url: 				'https://www.paypal.com/',
		sandboxurl:			'https://www.sandbox.paypal.com/',
		curr_symbol: 		{
								'USD': 'US$',
								'EUR': '&euro;',
								'GBP': 'GB&pound;',
								'JPY': '&yen;',
								'HUF': 'Ft'
							}
	};
		
	$.fn.paypal.text = getTranslations({
		addCart: 				'Add to Cart',
		shoppingCart:			'Shopping cart',
		edit:					'Edit',
		continueShopping:		'Continue shopping',
		buyNow: 				'Buy Now',
		closeWindow:			'Close window',
		viewCart: 				'View Cart',
		emptyCart: 				'Empty Cart',
		removeAllItems:			'Remove all items?',
		yes:					'Yes',
		no:						'No',
		noMoreItems:			'Can\'t add more than 99 items at once at PayPal.',
		processedByPaypal:		'Payment processed by PayPal',
		item:					'item',
		items: 					'items',
		success: 				'Success',
		couponCode: 			'Coupon code',
		redeem: 				'Redeem',
		noSuch: 				'No such coupon exists!',
		expired: 				'The coupon code <b>{0}</b> has expired!',
		lowerThanCurrent: 		'This coupon offers lower discount than the current <b>{0}</b>.',
		reclaimed: 				'This coupon has already been used!',
		subtotal:				'Subtotal',
		shippingAndHandling:	'Shipping and handling',
		reduction:				'Reduction',
		discount:				'Discount',
		total:					'Total',
		tax:					'Tax',
		remove:					'Remove',
		couponAccepted: 		'Coupon code accepted, discounting <b>{0}</b>.',
		couponRemoved:			'Coupon has been removed.',
		amountLowerThan:		'The amount is lower than the discount <b>{0}</b>.',
		addMoreItems:			'Add {0} more item(s) to use this coupon!',
		validAbove:				'Valid only above {0} cart value.',
		higherThanTotal: 		'Coupon provides higher discount (<b>{0}</b>) than the cart total.',
		minAmountWarning:		'This coupon can only be used if the total amount exceeds <b>{0}</b>.',
		minQuantityWarning:		'This coupon can only be used if the number of items exceeds <b>{0}</b>.',
		maxNItems:				'Maximum <b>{0}</b> items allowed!'
	});
	/*
		noMoreItems=No more items
		maxNItems=Maximum <b>{0}</b> items allowed!
		couponRemoved=Coupon has been removed.
		addMoreItems=Add {0} more item(s) to use this coupon!
		validAbove=Valid only above {0} cart value.
		amountLowerThan=The amount is lower than the discount <b>{0}</b>.
		expired=The coupon code <b>{0}</b> has expired!
		minAmountWarning=This coupon can only be used if the total amount exceeds <b>{0}</b>.
		minQuantityWarning=This coupon can only be used if the number of items exceeds <b>{0}</b>.
		lowerThanCurrent=This coupon offers lower discount than the current <b>{0}</b>.
		couponAccepted=Coupon code accepted, discounting <b>{0}</b>.
		success=Success
		reclaimed=This coupon has already been used!
		higherThanTotal=Coupon provides higher discount (<b>{0}</b>) than the cart total.
		noSuch=No such coupon exists!
		shoppingCart=Shopping cart
		edit=Edit
		subtotal=Subtotal
		couponCode=Coupon code
		discount=Discount
		shippingAndHandling=Shipping and handling
		tax=Tax
		total=Total
		continueShopping=Continue shopping
		emptyCart=Empty Cart
		buyNow=Buy Now
		processedByPaypal=Payment processed by PayPal
		removeAllItems=Remove all items?
		yes=Yes
		no=No
	*/
})(jQuery, $(window), $('body'));

/********************************************************************* Structure:

<XXX class="has-cart">																// = "self"		created outside
	<div class="modal shopping-cart">												// = "cart"		cart
		<div class="window has-heaeder cart-window">								// 				window
			<header>Shopping cart</header>											// 				title
			<a class="btn-close"></a>												//				close button
			<div class="cont">														// = "cont"		container
				<div class="summary">												// = "summary"	summary
					<span class="text">138 items</span>								//				summary text
					<a class="icon-drop-down">See details</a>						//
				</div>
				<div class="details">												// = "details"	details
					<form class="item">
						<input type="text" hidden class="path" value="">			//				folder path
						<a>															//				click the title to show it
							<img class="thumb" scr="thumbpath">
							<span class="title">DSC07984</span>
						</a>
						<select class="select">										//				options
							<option val="10">Print 7x10"</option>
							<option val="20">Print 15x20"</option>
						</select>
						<input type="text" class="quantity" vlaue="1">				//				quantity
						<span class="discount">-20%</span>
						<a class="warning button icon-trash" title="Remove"></a>
						<span class="amount">&euro;10</span>						//				amount
					</form>
				</div>
				<div class="pricing">
					<div class="new-items">											// = "newItems"	newly added items
						<form class="item">
						</form>
					</div>
					<div class="item-total">										// = "itemTotal"
						Subtotal
						<span class="item-total-amount amount">&euro; 5</span>		// = "itemTotalAmount"
					</div>
					<div class="reduction">											// = "reduction"
						<div class="coupon">	
							<a class="button icon-cancel" title="Remove"></a>						
							<input type="text" placeholder="Coupon code">			// = "coupon"
							<a class="small icon-refresh" title="Redeem coupon"></a>
						</div>
						<span class="discount discount-rate">20%</span>				// = "discountRate" 
						<span class="discount-amount amount">&euro; -12.00</span>	// = "discountAmount"
					</div>
					<div class="shipping-handling">									// = "shipping"
						Shipping and handling
						<span class="shipping-amount amount">&euro; 5</span>		// = "shippingAmount"
					</div>
					<div class="total">												// = "total"
						Total
						<span class="total-amount amount">&euro; 10</span>			// = "totalAmount"
					</div>
					<div class="tax">												// = "tax"
						Tax
						<span class="tax-rate">20%</span>
						<span class="tax-amount amount">&euro; 2</span>				// = "taxAmount"
					</div>
				</div>
				<div class="buttons">
					<a class="secondary button icon-arrow-left">Continue shopping</a>
					<a class="warning button icon-trash">Empty cart</a>				// = "emptyCartBtn"
					<a class="button icon-paypal">Checkout with Paypal</a>			// = "buyNowBtn"
				</div>
			</div>
		<div>
	</div>
	<div class="shopping-cart-shortcut">
		<a class="small button icon-shopping-cart">123 items</a> 					// = "floatBtn"
	</div>
</XXX>

*/