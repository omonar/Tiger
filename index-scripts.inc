<%-- Index page scripts to be executed on document.ready() --%>
<%-- Allow caching on JSON files too --%>
$.ajaxSetup({cache:true,contentType:false});
					<%-- Foundation --%>
					$(document).foundation();
					<%-- Skin code --%>
					$(document).skin(<%= getJsVars() %>);
					<%-- Tooltips --%>
					$('[data-tooltip]').addTooltip();
					$('[data-modal-open]').on('click', function(e){
						var t = $(e.target).data('modal-open');
						if (t && (t=$('#'+t)).length) {
							$('body').modal(t);
						}
					});
					<ja:if exists="topNavigation">
					$('#topnav-toggle').on('click',function(){$('#topnav').toggle();});
					</ja:if>
					<ja:if test="${scrollToTopButton}">
					$('body').scrollToTopBtn();
					</ja:if>
					<ja:if test="${askTrackingConsent}">
					<%-- GDPR compliance --%>
					askTrackingConsent(${jsCookiePolicyVars}, <%= getAPIs() %>);
					</ja:if><ja:else>
					<%-- Unconditionally loading APIs / Optional Cookie use consent --%>
					loadAPIs(<%= getAPIs() %>);
					<ja:if test="${showCookiePolicy}">
					askTrackingConsent(${jsCookiePolicyVars});
					</ja:if>
					</ja:else>