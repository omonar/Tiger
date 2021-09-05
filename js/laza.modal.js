/*	
 *	laza.modal() :: adding modal window to any layer (typically 'body')
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).modal( content, buttons, options );
 */
 
;(function($, $window, $body) {
	'use strict';
		
	$.fn.modal = function(content, buttons, settings) {
		
			if (typeof content === 'string') {
				content = $(document.createTextNode(content));
			}
			
			if (!(content instanceof $ && content.length)) {
				return;
			}
			
			if (!Array.isArray(buttons)) { 
				settings = buttons; 
				buttons = null;
			}
			
			settings = $.extend({}, $.fn.modal.defaults, settings);
	
			var self = $(this),
				text = getTranslations($.fn.modal.text),
				modal,
				popup,
				closeBtn,
				cont,
				keep = false,
				
				ns = 'lmo_' + Math.floor(Math.random() * 10000),
			
				to = null,
				rto = null,
				
				init = function() {
					
						if ($.contains(document.documentElement, content[0])) {
							
							modal = content;
							popup = modal.children().eq(0);
							closeBtn = popup.find('.close').eq(0);
							cont = popup.find('.content').eq(0);
							keep = true;
							
						} else {
							
							modal = $('<div>', {
									'class': 	'modal'
								}).appendTo(self);
								
							popup = $('<div>', {
									'class': 	'window ' + (settings['class'] || ''),
									role: 		'dialog'
								}).appendTo(modal);
								
							closeBtn = $('<a>', {
									'class': 	'btn close',
									'title': 	text.closeWindow
								}).appendTo(popup);
								
							closeBtn.addTooltip();
							
							cont = $('<div>', {
									'class': 	'content scrollable'
								}).appendTo(popup);
								
							if (settings.title) {
								popup.addClass('has-header').prepend($('<header>', {
										text: settings.title
									}));
							}
							
							cont.append(content.show());
							
							if (buttons) {
								
								var i, 
									a, 
									
									btnCont = $('<div>', { 
											'class': 'buttons' 
										}).appendTo(cont),
									
									clickhandler = function(e) {
										e.preventDefault();
										var a = e.target;
										
										if (typeof a.handler === FUNCTION) {
											if (a.handler.call(this) !== false) {
												close();
											}
										}
										return false;
									};
								
								for (i = 0; i < buttons.length; i++) {
									a = $('<button>', {
											'class': 	'button ' + (buttons[i].c || ''),
											html: 		' ' + buttons[i].t
										}).on('click', clickhandler).appendTo(btnCont);
									
									if (typeof buttons[i].h === FUNCTION) {
										a[0].handler = buttons[i].h;
									}
								}
							}
						}
							
						// Prepare
						modal.hide().css('opacity', 1).fadeIn(settings.speed);
						$body.addClass('has-modal');
						
						modal.on('destroy', close);
						
						modal.on('close', close);
						
						closeBtn.add(modal).on('click', function(e) {
								if (e.target === this) {
									if (typeof settings['onClose'] === FUNCTION) {
										settings.onClose.call(this);
									}
									close();
								}
							});
						
						//setMaxHeight();
					},
							
				setMaxHeight = function() {
						cont.css({
							overflow:	'auto',
							maxHeight:	Math.round($window.height() * 0.9) - (popup.hasClass('has-header')? closeBtn.height() : 0)
						});
					},
					
				close = function() {
						to = clearTimeout(to);
						
						modal.destroyAllTooltips();
						
						modal.fadeOut(settings.speed, function() {
								if (keep) {
									modal.hide().css('opacity', 1);
								} else {
									modal.remove();
								}
								$window.off('.' + ns);
							});
						
						$body.removeClass('has-modal');
						
						return false;
					};
			
			// Starts here
			
			init();
			
			if (settings.autoFade) {
				to = setTimeout(close, settings.autoFade);
			}

			return this;
		};
	
	$.fn.modal.defaults = {
			speed: 			300,
			autoFade: 		0,
			width: 			400,
			type: 			'normal'
		};
	
	$.fn.modal.text = {
			closeWindow: 	'Close window'
		};

})(jQuery, jQuery(window), jQuery('body'));
