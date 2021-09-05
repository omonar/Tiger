<%--------------------------------

			Page initialization scripts
	  
----------%><%
		out.println('\t\t\t$(document).ready(function(){');
			// REL_PATH = path/to/folder is needed for some external libraries
			out.println('\t\t\t\tREL_PATH=\'' + relPath.replaceAll('\'', '\\\\\'') + '\';');
			// Allow caching on JSON files too
			out.println('\t\t\t\t$.ajaxSetup({cache:true,contentType:false});');
			// Removing class that stops initital animations
			out.println('\t\t\t\t$(\'body\').removeClass(\'stop-transitions\');');
			// Skin code
			out.println('\t\t\t\t$(\'#main\').skin(' + getJsVars() + ');');
			// Tooltips
			out.println('\t\t\t\t$(\'[data-tooltip]\').addTooltip();');
			// Modals
			out.println('\t\t\t\t$(\'[data-modal-open]\').on(\'click\', function(e){' +
					'\n\t\t\t\t\tvar t=$(e.target).data(\'modal-open\');' + 
					'\n\t\t\t\t\tif(t&&(t=$(\'#\'+t)).length){$(\'body\').modal(t);}' +
				'\n\t\t\t\t});');
			// Ask permission
			out.println('\t\t\t\t$(\'[data-ask-permission]\').askPermission();');
			// Fix sticky sections
			//out.println('\t\t\t\t$(\'[data-sticky]\').sticky();');
			// GDPR compliance
			var apis = getAPIs();
			if (showCookiePolicy || apis) {
				if (showCookiePolicy || askTrackingConsent) {
					out.println('\t\t\t\taskTrackingConsent(' + [ jsCookiePolicyVars, apis ].filter(Boolean).join(',') + ');');
				} else { 
					out.println('\t\t\t\tloadAPIs(' + apis + ');');
				}
			}
		out.print('\t\t\t});');
%>