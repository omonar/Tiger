<% // Newimages.htt skin specific part
	var thumbs = [],										// Thumbnails buffer
		dmax = newImagesDays * 24 * 60 * 60 * 1000,			// Difference in ms
		n = 0,
		start = (typeof skippedCount === 'undefined')? 0 : skippedCount,
		preload = (typeof preloadThumbs === 'undefined')? 20 : preloadThumbs,
		
		getTitle = function() {
				var s;
				
				switch (newImagesSource) {
					case 'dateTaken':
						s = getText('imagesTaken');
						break;
					case 'fileModified':
						s = getText('imagesModified');
						break;
					default:
						s = getText('imagesAdded');
				}
				
				return s + ' ' + getTimespan(newImagesDays); 
			},
		
		writeOutThumbnails = function() {

					//print('Writing out thumbs [' + thumbs.length + ']');

					out.print('\t\t\t\t<h4>' + getTitle() + '</h4>' +
						'<section class="thumbnails"><div class="' +
							[	'cont',
								'thumb-cont',
								thumbLayout, 
								(typeof captionPlacement !== 'undefined')? ('caption-' + captionPlacement) : '',
								(typeof captionStyle !== 'undefined')? ('caption-' + captionStyle) : '',
								((thumbs.length >= thumbCols)? 'multi' : ('single cnt-' + thumbs.length))
							].filter(Boolean).join(' ') +
						'">');

					for (var i = 0; i < thumbs.length; i++) {
						var ao		= thumbs[i],
							vars 	= ao.getVars(),
							tp		= vars.get('thumbPath'),
							cp 		= vars.get('closeupPath'),
							tw		= parseInt(vars.get('thumbWidth')),
							alt 	= addAltTags? (' alt="' + stripHTML(vars.get('title')).trim() + '"') : '',
							c 		= vars.get('thumbCaption'),
							rp		= ao.getPathFrom(currentFolder),
							ar		= tw / parseInt(vars.get('thumbHeight')),
							st		= ((thumbLayout === 'masonry')? 
											(' style="width:' + ((thumbs.length >= thumbCols)? Math.round(tw * 0.8) : tw) + 'px;"')
											:
											''
										);

						rp = rp.substring(0, rp.length - ao.getName().length);

						out.print('<div class="card ' + 
								((i < preload)? 'preload' : 'lazyload') + ' ' + 
								((ar >= 1.25)? 'landscape' : ((ar <= 0.8)? 'portrait' : 'square')) + 		// AR type
								'"' + st + ' data-path="' + getEncodedPathFromRoot(ao) + '">' +
								'<a class="thumb" href="' + rp + cp + '">' +
									((i < preload)? ('<img src="' + rp + tp + '"' + alt + '>') : '') +
								'</a>' +
								(c? ('<div class="caption">' + c + '</div>') : '') +
							'</div>');

					}

					out.println('</div></section>');
				},
				
			sortThumbnails = function() {
				
					if (newImagesSort === 'date') {
						if (newImagesReverse) {
							thumbs.sort(function(a, b) {
									return  a['refDate'] - b['refDate'];
								});
						} else {
							thumbs.sort(function(a, b) {
									return  b['refDate'] - a['refDate'];
								});
						}
					} else if (newImagesSort === 'random') {
						thumbs.sort(function() {
								return  0.5 - Math.random();
							});
					}
				},
				
			// Gathering new images		
			
			gatherNew = function(folder) {
				
					var images = folder.getChildren(),
						ao,
						cat,				// Category
						now = new Date(),
						d;
				
					for (var i = start; i < images.length; i++) {
	
						ao = images[i];
						
						if (ao.isIncluded()) {
							cat = ao.getCategory();
							//print(ao.getName() + ' [' + cat + ']');
		
							if (cat === Category.folder) {
								if (newImagesDepth !== 'current' && !ao.isHidden()) {
									gatherNew(ao);
								}
							} else if (cat === Category.image || cat === Category.other ||
								cat === Category.audio || cat === Category.video) {
								
								if (newImagesSource === 'added') {
									d = ao.getWhenAdded();
								} else if (newImagesSource === 'dateTaken') {
									d = getEpochDate(ao, false);
								} else {
									d = ao.getLastModified();
								}
								
								if (d && (now - d) <= dmax) {
									ao['refDate'] = d;
									thumbs.push(ao);
								}
							}
						}
					}
				};
		
	if (newImagesDays) {
			
		gatherNew((newImagesDepth === 'tree')? rootFolder : currentFolder);
		
		if (newImagesSort !== 'original') {
			sortThumbnails();
		}
		
		writeOutThumbnails();
	}

%>