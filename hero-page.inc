<%		/*********************************************************************************
		 *								Header a.k.a Hero
		 */

		out.println('\t\t<section class="hero ' + [
					'title-' + folderTitlePosition,
					(heroFullWidth? 'full' : 'page') + '-width',
					(heroType === 'flatColor')? 'flat' : 'bg-image',
					heroPattern? 'pattern' : ''
				].join(' ') + '">');
				
			out.println('\t\t\t<div class="cont">');
			
				/*
				 *	Page title
				 */
				
				out.println('\t\t\t\t<header>');
				
					out.print('\t\t\t\t\t<div class="title">');
					
						// Up link
						out.println('<a class="back-btn button icon-one-level-up" href="' + indexName + '"></a>');
					
						out.println('\t\t\t\t\t\t<div class="head">');
						
							// Folder title + description + breadcrumb
							out.println('\t\t\t\t\t\t\t' + pageTitle);
							
							// Breadcrumb path
							if (showBreadcrumbPath !== 'none' && typeof breadcrumbPath !== UNDEF) {
								out.println('\t\t\t\t\t\t\t<div id="breadcrumb" class="breadcrumb' + ((showBreadcrumbPath === 'tooltip')? ' hidden' : '') + '">' + breadcrumbPath + '</div>');
							}
								
						out.println('\t\t\t\t\t\t</div>');

					out.println('\t\t\t\t\t</div>');
					
				out.println('\t\t\t\t</header>');
								
			out.println('\t\t\t</div>');		// cont
			
		out.println('\t\t</section>');			// Hero
%>