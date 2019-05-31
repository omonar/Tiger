/*	
 *	audioPlayer() :: adds an audio player to a button
 *
 *	Copyright by Lazaworx
 *	http://www.lazaworx.com
 *	Author: Laszlo Molnar
 *
 *	Dual licensed under the MIT and GPL licenses.
 *	- http://www.opensource.org/licenses/mit-license.php
 *	- http://www.gnu.org/copyleft/gpl.html
 *
 *	Usage: $(element).addAudioPlayer(options);
 *	options:
 		autoPlay:	false,
 		loop:		true,
 		volume:		0.2,
 		src:		''			// pulled from data-src '["song1.mp3","song2.mp3"]'
 		
 */

;(function($) {
	'use strict';
	
	$.fn.audioPlayer = function(settings) {
		
		if ($(this).data('audioplayer')) {
			settings = $.extend({}, settings, $(this).data('audioplayer'));
		}
		
		settings = $.extend({}, $.fn.audioPlayer.defaults, settings);
		
		var ns = 'lap_ns',
			musicFolder = ((settings.rootPath === '.')? '' : (settings.rootPath + '/')) + settings.folder + '/';
				
		return this.each(function() {
				
			var self = $(this),
				player = $(),
				playList = $(),
				audio = $(),
				source = $(),
				curr = 0,
				songs,
				promise,
				savedVolume = settings.volume,
				fadeTimeout,
				fadeOn = false,
				
				// Creating player
				
				createPlayer = function() {
					
						player = $('<div>', {
								'class':	settings.playerHook
							});
						
						audio = $('<audio>', {
								preload: 		'auto',
								controls:		true,
								controlsList:	'nofullscreen nodownload noremote'
							}).appendTo(player);
						
						audio[0].pause();
						self.data('paused', true);
						
						source = $('<source>', {
								src: 		musicFolder + songs[curr] 	
							}).appendTo(audio);
						
						setTimeout(function() {
								
								// Wiring events with a delay
								audio.on('ended.' + ns, function() {
										playNext();
										return true;
									});
								
								audio.on('pause.' + ns, function() {
										self.data('paused', true);
										self.removeClass('active');
									});
								
								audio.on('playing.' + ns, function() {
										self.data('paused', false);
										if (audio[0].volume === 0) {
											audio[0].volume = savedVolume || settings.volume;
										}
										self.addClass('active');
									});
								
								audio.on('volumechange.' + ns, function() {
										if (!fadeOn) {
											clearTimeout(fadeTimeout);
											savedVolume = audio[0]['volume'];
											//console.log('Manual change: ' + savedVolume);
										}
									});
							}, 100);
						
						if (songs.length) {
							playList = $('<ul>', {
									'class':		settings.playListHook
								}).appendTo(player);
	
							for (var i = 0; i < songs.length; i++) {
								playList.append($('<li>').append($('<a>', {
										text: 		decodeURIComponent(songs[i].replace(/\.[^\.]*$/, ''))
									}).on('click.' + ns, function(e) {
										var i = playList.children().index($(e.target).parent());
										play(i);
										return false;
									})));
							}
							
							playList.children().eq(curr).addClass('active');
						}
					},
				
				// Setting the current song's source
				
				setSource = function(n) {
					
						audio[0].pause();
						
						if (n >= songs.length || n < 0) {
							n %= songs.length;
						}
						
						source.attr({
								src: 	musicFolder + songs[n]
							})
						
						audio[0].load();
						
						curr = n;
						
						playList.children().removeClass('active');
						playList.children().eq(n).addClass('active');
					},
				
				// Start playing
				
				play = function(n) {
						if (typeof n === UNDEF || typeof n === $.event) {
							n = curr;
						}
						
						if (!source.attr('src') || n !== curr) {
							// New/missing song
							setSource(n);
						} else if (!audio[0].paused) {
							// Playing already
							return;
						}
						
						if (promise = audio[0].play()) {
							promise.then(function() {
									// Autoplay started!
									self.addClass('active');
									self.data('paused', false);
								}, function(err) {
									// Autoplay was prevented.
									// Show a "Play" button so that user can start playback.
									self.removeClass('active');
									self.data('paused', true);
									console.log('Autoplay has been prevented by the browser. Interact with the page first!');
								});
						}
					},
					
				// Fade in one step
				
				fadeInStep = function() {
					
						clearTimeout(fadeTimeout);
						
						var v = audio[0]['volume'];
						
						if (typeof v !== 'number') {
							v = parseFloat(v);
							if (typeof v !== 'number') {
								return;
							}
						}
						
						v = Math.min(v + settings.step, 1);
						
						if (v >= savedVolume) {
							audio[0]['volume'] = savedVolume;
							setTimeout(function() {
									fadeOn = false;
								}, 50);
							return;
						}
							
						audio[0]['volume'] = v;
						
						fadeTimeout = setTimeout(fadeInStep, settings.stepFreq);
					},
					
				// Fade in playing
				
				fadeIn = function() {
					
						if (audio[0].paused) {
							audio[0]['volume'] = 0.01;
							play();
						}
						
						fadeOn = true;
						fadeTimeout = setTimeout(fadeInStep, settings.stepFreq);
						
						self.data('paused', false);
					},
					
				// Fade out one step
				
				fadeOutStep = function() {
					
						clearTimeout(fadeTimeout);
						
						var v = audio[0]['volume'];
						
						if (typeof v !== 'number') {
							v = parseFloat(v);
							if (typeof v !== 'number') {
								return;
							}
						}
						
						v = Math.max(v - settings.step, 0);
						
						if (v < 0.01) {
							audio[0]['volume'] = 0;
							pause();
							setTimeout(function() {
									fadeOn = false;
								}, 50);
							return;
						}
						
						audio[0]['volume'] = v;
							
						fadeTimeout = setTimeout(fadeOutStep, settings.stepFreq);
					},
					
				// Fade out playing
				
				fadeOut = function() {
					
						if (!audio[0].paused) {
							fadeOn = true;
							fadeTimeout = setTimeout(fadeOutStep, settings.stepFreq);
						}
						
						self.data('paused', true);
					},
					
				// Next song
				
				playNext = function() {
						if (curr >= songs.length - 1) {
							if (settings.loop) {
								play(0);
							}
						} else {
							play(curr + 1);
						}
					},
				
				// Pausing play
				
				pause = function() {
						audio[0].pause();
						promise = null;
						self.removeClass('active');
						self.data('paused', true);
					},
				
				// Destroying player
				
				destroy = function() {
						player.trigger('removeTooltip');
						player.add(self).off('.' + ns);
						player.remove();
					},
				
				// Saving play status
			
				saveStatus = function() {
						if ($.cookie) {						
							$.cookie('ap-status', 
								(audio[0].paused? '0':'1') + 
								'::' + (audio[0].currentTime || 0) + 
								'::' + ((fadeOn || audio[0].paused)? savedVolume : audio[0].volume) +
								(curr? ('::' + curr) : '')
							);
						}
					},
				
				// Loading play status
				
				loadStatus = function() {
						if ( $.cookie ) {
							var c = $.cookie('ap-status');
							
							if (c) {
								c = c.split('::');
								
								settings.autoPlay = (c[0] === '1');
								settings.startTime = parseFloat(c[1] || 0, 10);
								savedVolume = settings.volume = parseFloat(c[2]) || .2;
								curr = parseInt(c[3] || 0, 10);
								
								if (curr < 0 || curr > songs.length) {
									curr = 0;
								}
							}
						}
					};
						
			// Loading playlist 
			if (self.data('src')) {
				songs = self.data('src').split('::');
			} else if (settings.hasOwnProperty('src')) {
				songs = (typeof settings.src === 'string')? settings.src.split('::') : settings.src;
			} else {
				return;
			}
			
			// Load status to initialize, save status on unload
			if (settings.saveStatus) {
				loadStatus();
			}
			
			// Creating the AUDIO element
			createPlayer();
			
			// Attaching as tooltip
			self.addTooltip(player);
			
			// Play/Pause button functionality 
			self.on('click.' + ns, function() {
					if (self.data('paused')) {
						fadeIn();
					} else {
						fadeOut();
					}
					return false;
				});
			
			// Events for outside control
			
			self.on('removePlayer.' + ns, destroy);
			
			self.on('pausePlayer.' + ns, pause);
			
			self.on('startPlayer.' + ns, play);
			
			self.on('fadeInPlayer.' + ns, fadeIn);
			
			self.on('fadeOutPlayer.' + ns, fadeOut);
			
			// Delaying the player initialization for the sake of Firefox
			
			setTimeout(function() {
				
				audio[0]['volume'] = settings.volume;
				
				if (settings.hasOwnProperty('startTime')) {
					audio[0]['currentTime'] = settings.startTime;
				}						

				// Start playing if Auto on
				if (settings.autoPlay) {
					fadeIn();
				}
				
				$(window).on('unload.' + ns, saveStatus);
				
			}, 50);
			
		});
		
	};
	
	$.fn.audioPlayer.defaults = {
			autoPlay:			true,
			loop:				true,
			volume:				0.2,
			stepFreq:			30,
			step:				.02,
			saveStatus:			true,
			playerHook: 		'player',
			playListHook:		'play-list',
			folder:				'res',
			rootPath:			'.'
		};
	
})(jQuery);
