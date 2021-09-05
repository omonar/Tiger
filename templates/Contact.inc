<% 	// Contact.inc

	if (fileTitle) {
		out.println('\t\t\t\t\t\t<h2>' + fileTitle + '</h2>');
	}
	
	if (comment) {
		out.println('\t\t\t\t\t\t<div class="caption">' + comment + '</div>');
	}
	
	
	if (map_location) {
		out.println('\t\t\t\t\t\t<div id="map_canvas" class="map" style="min-height:30vh;"></div>');
		out.println('\t\t\t\t\t\t<script src="https://maps.googleapis.com/maps/api/js' + 
				(googleApiKey? ('?key=' + googleApiKey) : '') +
			'"></script>');
		out.println('<script>');
			out.println('\tfunction init_map() {');                                                                                                                                  
				out.println('\t\tvar pos = new google.maps.LatLng(' + map_location + '),');
				out.println('\t\t\tmap = new google.maps.Map(document.getElementById(\'map_canvas\'), {' +
						'center: pos, zoom: ' + map_zoom + ', mapTypeId: google.maps.MapTypeId.ROADMAP' +
					'}),');
				out.println('\t\t\tmarker = new google.maps.Marker({' +
						'position: pos, map: map' +
						(postal_address? (', title: "' + postal_address.replaceAll("\n", " :: ").replaceAll("\'", "\\\\\'") + '"') : '') +
					'});');
			out.println('\t}');
			out.println('\tgoogle.maps.event.addDomListener(window, \'load\', init_map);');
		out.println('</script>');
	}

	if (email_address) {
		out.println('\t\t\t\t\t<div class="email"><strong>' + getText('email') + '</strong><a href="mailto:' + email_address + '" class="icon-email"> ' + email_address + '</a></div>');
	}
	if (postal_address) {
		out.println('\t\t\t\t\t<div class="address"><strong>' + getText('postalAddress') + '</strong><blockquote>' + postal_address.replaceAll("\n", "<br/>") + '</blockquote></div>');
	}
	if (phone_number) {
		out.println('\t\t\t\t\t<div class="phone"><strong>' + getText('phoneNumber') + '</strong><a href="callto://' + phone_number + '" class="icon-phone"> ' + phone_number + '</a></div>');
	}
	if (custom_link1 || custom_link2 || custom_link3) {
		out.println('\t\t\t\t\t<div class="custom"><strong>' + ((typeof custom_links_label !== 'undefined')? custom_links_label : '&nbsp;') + '</strong>');
		if (custom_link1) {
			out.println('\t\t\t\t\t\t<a href="' + custom_link1 + '" target="_blank">' + custom_linktext1 + '</a>');
		}
		if (custom_link2) {
			out.println('\t\t\t\t\t\t<a href="' + custom_link2 + '" target="_blank">' + custom_linktext2 + '</a>');
		}
		if (custom_link3) {
			out.println('\t\t\t\t\t\t<a href="' + custom_link3 + '" target="_blank">' + custom_linktext3 + '</a>');
		}
		out.println('\t\t\t\t\t</div>');
	}
	if (skype_id) {
		out.println('\t\t\t\t\t<div class="skype"><strong>Skype</strong><a href="skype:' + skype_id + '?call" target="_blank" class="icon-skype"> ' + skype_id + '</a></div>');
	}
	if (facebook_id) {
		out.println('\t\t\t\t\t<div class="facebook"><strong>Facebook</strong><a href="http://www.facebook.com/' + facebook_id + '" target="_blank" class="icon-facebook"> https://www.facebook.com/' + facebook_id + '</a></div>');
	}
	if (twitter_id) {
		out.println('\t\t\t\t\t<div class="twitter"><strong>Twitter</strong><a href="https://twitter.com/#!/' + twitter_id + '" target="_blank" class="icon-twitter"> https://twitter.com/' + twitter_id + '</a></div>');
	}
	if (pinterest_id) {
		out.println('\t\t\t\t\t<div class="pinterest"><strong>Pinterest</strong>: <a href="http://pinterest.com/' + pinterest_id + '" target="_blank" class="icon-pinterest"> https://pinterest.com/' + pinterest_id + '</a></div>');
	}
	if (tumblr_id) {
		out.println('\t\t\t\t\t<div class="tumblr"><strong>Tumblr</strong><a href="http://' + tumblr_id + '.tumblr.com/" target="_blank" class="icon-tumblr"> https://' + tumblr_id + '.tumblr.com/</a></div>');
	}
	if (jalbum_id) {
		out.println('\t\t\t\t\t<div class="jalbum"><strong>jAlbum</strong><a href="http://' + jalbum_id + '.jalbum.net/" target="_blank" class="icon-jalbum"> https://' + jalbum_id + '.jalbum.net/</a></div>');
	}
	if (flickr_id) {
		out.println('\t\t\t\t\t<div class="flickr"><strong>flickr</strong><a href="http://www.flickr.com/photos/' + flickr_id + '/" target="_blank" class="icon-flickr"> https://www.flickr.com/photos/' + flickr_id + '/</a></div>');
	}
	if (foursquare_id) {
		out.println('\t\t\t\t\t<div class="foursquare"><strong>Foursquare</strong><a href="http://foursquare.com/' + foursquare_id + '" target="_blank" class="icon-foursquare"> https://foursquare.com/' + foursquare_id + '</a></div>');
	}
	if (google_id) {
		out.println('\t\t\t\t\t<div class="google"><strong>Google +</strong><a href="https://plus.google.com/u/0/' + google_id + '/posts" target="_blank" class="icon-google-plus"> https://plus.google.com/u/0/' + google_id + '/posts</a></div>');
	}
	if (linkedin_id) {
		out.println('\t\t\t\t\t<div class="linkedin"><strong>LinkedIn</strong><a href="http://www.linkedin.com/in/' + linkedin_id + '" target="_blank" class="icon-linkedin">https://www.linkedin.com/in/' + linkedin_id + '</a></div>');
	}
	if (vimeo_id) {
		out.println('\t\t\t\t\t<div class="vimeo"><strong>Vimeo</strong><a href="http://vimeo.com/' + vimeo_id + '" target="_blank" class="icon-vimeo"> https://vimeo.com/' + vimeo_id + '</a></div>');
	}
	if (youtube_id) {
		out.println('\t\t\t\t\t<div class="youtube"><strong>YouTube</strong><a href="http://www.youtube.com/user/' + youtube_id + '" target="_blank" class="icon-play-video"> https://www.youtube.com/user/' + youtube_id + '</a></div>');
	}
	if (instagram_id) {
		out.println('\t\t\t\t\t<div class="instagram"><strong>Instagram</strong><a href="http://instagram.com/' + instagram_id + '" target="_blank" class="icon-instagram"> https://instagram.com/' + instagram_id + '</a></div>');
	}
	
%>