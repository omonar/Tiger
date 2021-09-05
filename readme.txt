:
: Readme.txt
:

------------------------------------------------------

Version 3.5.3

Fixed:
- Map doesn't show up in search results
- Exit full-screen button lingers on sometimes after returned from full-screen

------------------------------------------------------

Version 3.5.2

Fixed:
- Map doesn't show up in the lightbox
- Map type is not taken into account (always using "roadmap")

------------------------------------------------------

Version 3.5.1

Fixed:
- Can't go into lightbox error when no maps are used

------------------------------------------------------

Version 3.5

New:
- Placemarks (GPS locations) of search results or tag cloud search or filtering are displayed on a map

Changed:
- Simplified formatting for the BLOCKQUOTE and HR tags
- Better default layout for the custom content section and footer's custom content

Fixed:
- Tag cloud does not always find all images in the whole album or shows some with a broken thumbnail

------------------------------------------------------

Version 3.4.1

Fixed:
- Cross-fade transition does not work properly

Improved:
- All lightbox image transitions

------------------------------------------------------

Version 3.4

New:
- You can choose if you want to use the same background image in the lightbox as on the index page, or use a plain color

Fixed:
- Initial "Fit to screen" does not take the "Max. zoom" setting into account
- Thumbnails in "Fixed grid" might not fill the card completely
- Styles with background image in the lightbox in v2 show no background image in v3
- Thumbnails might align wrong or sized wrong in the instant preview
- Footer text color is not always correct in the instant preview

Updated:
- French, Dutch, and Hungarian translations

------------------------------------------------------

Version 3.3

New:
- Thumbnail layout - "Flexible grid" - in which the cards adapt to the thumbnails better but the caption positions are not aligned vertically.
- Added explanation for thumbnail layouts. Click the (i) icon!

Fixed:
- Top-level page link (up arrow) might be doubled when the top menu is used
- Adjusted Grid layout thumbnail sizes
- Adjusted Masonry layout thumbnail sizes
- Unordered list (UL) and Ordered list (OL) margins and padding restored

Changed:
- Homepage link's tooltip text doesn't fall back to "Home", can be empty if you leave the corresponding box empty.

Updated:
- French and Dutch translations

------------------------------------------------------

Version 3.2

New:
- Custom page content can have a background box. Useful when the text color is unreadable on the selected background. Works for both the embedded and separate custom pages.
- Help links point to the new v3+ help pages (not all pages are ready yet)

Fixed:
- Feedback email contains links to folders double-encoded (e.g. %2520 instead of %20)
- Inconsistent height for folder thumbnails after the 20th
- Thumbnail text might be hard to read when placed below the thumbnail
- Small images could be enlarged beyond the maximum allowed zoom level
- Sharing the URL is not possible on the index page
- Custom page links placed below each other instead of next
- Bottom navigation did not appear on custom pages

------------------------------------------------------

Version 3.1.2

Fixed:
- Sharing individual images to Facebook didn't succeed when the file or folder name contains a non-web-safe character(s)

Note, even though the image preview does not always appear in the FB popup, it always appears in the newsfeed. Also, when you hit F5 (refresh) in the popup. 

------------------------------------------------------

Version 3.1.1

Fixed:
- Footer background color isn't applied
- The text on Previous/Next links might become hard-to-read
- Some of the texts are missing on the User Interface
- No hero background image is used in subfolders when "Album image" is selected
- Map displays in restricted mode for the lightbox image if no Map section is used
- Virtually empty select box or cropped text in the shopping cart when at least one of the options is too long

Changed:
- Map settings moved under the Site tab because the map can be used both in the Sections and in the Lightbox
- Better handling and notification of skin or major version changes

------------------------------------------------------

Version 3.1.0

Changed:
- Zoom slider, Shopping cart, Feedback setting is also reflected in the Lightbox preview
- Panoramic images got scaled to fit only vertically (not both) when "Fit to screen" is selected
- Auto panorama is used by default

Fixed:
- The original GIF files are used instead of PNG's created by jAlbum (keeping animation)
- Too small images aligned improperly on the thumbnail cards
- Soundclip controls appear twice

Updated:
- French and Dutch translations

------------------------------------------------------

Version 3.0.16

Fixed:
- Folder thumbnails might be too small and can be cropped after the 20th with the non-fixed-shape variant
- Home icon in the top bar might be too small and not styled like other buttons
- Lightbox image won't load in certain cases when using the Fit toggle button
- Can't share individual images on Facebook
- Search for area tags is difficult; added "regions" as default option for Search and Tag cloud
- Some settings got cropped or hidden in some languages (e.g. Deutch)

Changed:
- Compatibility has changed to jAlbum 18.0+

------------------------------------------------------

Version 3.0.15

Fixed:
- Folder thumbnail is not generated (folderthumb.jpg)

------------------------------------------------------

Version 3.0.14

Fixed:
- Thumbnails (the first 20) might jump during page load

Changed:
- Full-screen button is added for Google maps on the index page

------------------------------------------------------

Version 3.0.13

Changed:
- Thumbnail size on "Masonry layout" got further optimized, most noticeably on small screens 
- Custom content has been removed. You can use the "Custom section" for the same purpose.

Fixed:
- Hero area background is broken when "Album thumbnail" is chosen as "Type"
- Wrong cropping/justification of the hero background on small screens
- Apostrophe in folder name makes the page broken
- Custom section doesn't work
- Unnecessary backups of settings

------------------------------------------------------

Version 3.0.12

Changed:
- Better share title: if no title was given, the file name is used, cleaned up
- Smaller User Interface window that supposed to fit into a laptop monitor as well

Fixed:
- Folder thumbnails are still improperly sized on small screens with "No limit" page width
- Loading too large thumbnails in Masonry layout (after the 20th)
- Sharing a folder with a changed folder thumb, the previously selected thumbnail remains
- Tooltips might linger on the screen after closing a dialog or the lightbox
- Top menu links of deep folders are not encoded

------------------------------------------------------

Version 3.0.11

Fixed:
- Folder thumbnails are improperly sized on small screens when "No limit" is selected as "Max. page width"
- Share dialog can be too small to fit everything onto it
- Mark new files with the "Text" option looks bad

Changed:
- Less obtrusive backlinks to jAlbum and the skin
- Removed <blockquote> preformatting

Updated:
- French and Dutch translations

------------------------------------------------------

Version 3.0.10

Fixed:
- "New images" custom page is broken
- Can't turn off background image on Previous/Next folder buttons

Changed:
- Facebook and Twitter share turned OFF as default
- Default "Thumb padding": small -> none
- Default "Box gap": tiny -> small
- Cookie Policy agreement and Tracking consent turned OFF by default

------------------------------------------------------

Version 3.0.9

Fixed:
- Full-screen mode has triggered an error on Safari for macOS
- Start slideshow button appears on pages without images too
- Oversized initial image on High DPI displays using image variants
- Difficulty bringing up the zoom slider panel on touch devices
- Toggling the control bar on touch devices has toggled the info panel too 
- Skin change notification might appear more than once

------------------------------------------------------

Version 3.0.8

Fixed:
- Feedback controls section might not show up if the shopping cart is not used
- Feedback popup doesn't show the items
- Better optimized background image for full-width hero layout
- Some styles didn't show the box background image
- Button text and background color in some styles

------------------------------------------------------

Version 3.0.7

Fixed:
- Folder thumbnail might be too high and not always reflect the [Same as thumbnail size] setting
- Start slideshow readability
- Skin version in the footer is lagging behind

------------------------------------------------------

Version 3.0.6

Fixed:
- Layout falls apart (sections get arranged horizontally) when any content is used in the "Top bar -> Custom content" box

Updated:
- French and Dutch translations

------------------------------------------------------

Version 3.0.5

New:
- The skin warns about major version change and saves the old project file, so you can restore the old settings later if you'd like to go back
- Link added to the latest major skin version on the About page

Fixed:
- Feedback cart half off-screen
- Folder thumbnails (beyond the 20th) might grow too big in "Grid" layout
- Too tall folder thumbnails on iPad's
- Slideshow resumes after being stopped and used the prev/next button after that 

Changed defaults:
- "Fit images by default" = ON
- "Zoom slider" = OFF
- "Max. zoom" = 1.2
- "Thumbnail layout" = Fixed grid
- Buttons on hero show button color right away and not only on mouseover
- Disabling full-screen button on iPad's and iPhone's due to missing support

------------------------------------------------------

Version 3.0.4

Fixed:
- Wrong thumbnail title alignment
- Jumping directly into the lightbox doesn't work for audio/video

Improved:
- Thumbnails appear smoother after loading

------------------------------------------------------

Version 3.0.3

Changed:
- Added back the 5 column option for folders (on user's demand)
- Added "Same as on thumbnails" for folder thumbnail aspect ratio

Fixed:
- Play button appears even though "Show Start/Stop" is disabled
- Fit toggle (zoom) button appears even though "Show fit toggle" is disabled
- Top "hamburger" menu button doesn't work on mobiles
- When started right within the lightbox, some thumbnails left unloaded after returning to the index page
- Could not start right in the lightbox on lazy loaded thumbnails (> 20)
- "Fit image by default" setting is ignored
- Does not display the lightbox image in the integrated browser (the load animation remains)
- Folder thumbnail aspect ratio might fall back to 1:2, which looks bad in most cases
- Selecting FixGrid as thumbnail layout might corrupt the instant preview, and results in wrong thumbnail aspect ratio
- Folder thumbnails won't load beyond the 20th (or whatever the "Preload thumbs" setting)

------------------------------------------------------

Version 3.0.2

New:
- The download button shows the file size

Fixed:
- The download button didn't show up with certain settings
- Zoom slider doesn't show the direction (zoom in, zoom out, or both)
- Zoom slider appears on content where it's not usable (e.g. external content)
- External content box is improperly sized and positioned
- Mouse scroll triggers image change on the external content
- Share to Facebook didn't work for individual images, i.e. from the lightbox 

Updated:
- Dutch translation

------------------------------------------------------

Version 3.0.1

Fixed:
- The Download button doesn't show up on slide image with the original not present
- The Download button shows up on images with originals, even though the download button has been disabled
- Preset selectors do not match the template

Updated:
- French translation

------------------------------------------------------

Version 3.0

New:
- Instant preview for the index page and the lightbox on the user interface
- Support for jAlbum v24's image variants
- New thumbnail layout type: masonry (variable width horizontal)
- New folder thumbnail layout: the text placed beside the image (like in Turtle)
- Removed Zurb Foundation framework, replaced with vanilla CSS flex layout
- 2 icon styles: fat (legacy) and thin
- Rounded borders are used universally
- Some sections can be made "sticky" - Filtering and Sort, Shopping cart, and Feedback - so users have always access to them
- Continuous zoom support (zoom slider), which also allows maximizing to the original (if included)
- Preloading the icon font and the hero background (before the page composition starts)
- 4 folder icon designs (displayed if no folder thumbnail found)
- Auto fullscreen mode for the lightbox

------------------------------------------------------

Version 2.14

New:
- Nicer scrollbars, matching the theme
- You can refer to metadata in templates by ${meta.metaName} format
- Unnecessary files (e.g. humns.txt or robots.txt) get removed if the option is turned off

Fixed:
- When "web location open in new window" is set, the subfolders open in new window too
- Cannot made folder, thumbnail and image captions empty, even if the template was emptied
- Can't jump to the next folder after the last photo if "Neighboring folders" was turned off
- Added missing translations
- Better formatting of non-ascii characters in Feedback
- Twitter sharing
- Google map marker indexing start form "0"
- Better date range formatting
- Better processing of area tags, especially if both Picasa and MS tags are present

Updated:
- JQuery to 3.5.1
- Java 15 Javascript compatibility

------------------------------------------------------

Version 2.13.6

Fixed:
- Unnecessary System console printouts
- About page text did not process jAlbum variables
- Improper alignment of tooltip nub (pointing triangle) in rare cases
- Make album error if Filtering box title is empty

------------------------------------------------------

Version 2.13.5

Fixed:
- "undefined" in date range

------------------------------------------------------

Version 2.13.4

Changed:
- Further optimization of Filtering and Sort box, especially in case of a single box

------------------------------------------------------

Version 2.13.3

Fixed:
- Date range formatting was wrong in languages separating the time with comma, e.g. 18.45

------------------------------------------------------

Version 2.13.2

Fixed:
- jAlbum ratings inherited even with "Use jAlbum rating" turned off

------------------------------------------------------

Version 2.13.1

New:
- Rating can be based on jAlbum ratings or left uninitialized when "Visitor rating" is used
- Visitors can remove rating completely in visitor rating mode (= unrated)

Fixed:
- Improperly placed nub (pointing triangle) on tooltips

Updated:
- French and Dutch translations

------------------------------------------------------

Version 2.13.0

New:
- ${fileName} variable converted to human readable format in captions
- Added visitor rating
- Ability to use any camera data field in the Filtering and Sort panel; syntax: meta.fieldName, e.g. meta.Color Space
- Search box can be moved to the Hero area. It's also bigger here.
- Reset button in Filtering and Sort restores the original view. It's also red when used on an overlay.

Fixed:
- Start slideshow button doesn't work in the header
- Numerous fixes related to the Filtering and Sort functionality
- Duplicate fields in JSON files when metadata is used for Filtering or Sort

------------------------------------------------------

Version 2.12.2

Fixed:
- HiDpi images appear twice as large in the lightbox when linked to originals

Changed:
- Initial delay on the first slide made longer (2s) when started through the "Start slideshow" button 

------------------------------------------------------

Version 2.12.1

Fixed:
- Sitemap XML always created

------------------------------------------------------

Version 2.12.0

New:
- Sitemap in XML format for Google bots

------------------------------------------------------

Version 2.11.0

New:
- Optional full screen button in lightbox
- Option to start the slideshow from the index page always with the first image
- Currency sign got removed or shortened at various places in case of 'AU$' and 'CAN$' and similar currencies

Fixed:
- The "zoom in" button disappear when the slide image is larger then the availablbe space still smaller than the lightbox
- The current image is left at the last image when the slideshow ends and returns to the index page
- The External content size and zoomability might be improperly calculated

------------------------------------------------------

Version 2.10.3

Fixed:
- New features and fixes worked only in "Debug" mode. Sorry!

------------------------------------------------------

Version 2.10.2

New:
- Can guess the dimensions of an external content (e.g. youtube or vimeo video) from the HTML code 

Fixed:
- HiDpi images might be double sized

------------------------------------------------------

Version 2.10.1

New:
- Customizable Subject line for sharing through email

Fixed:
- Twitter share button stopped working

------------------------------------------------------

Version 2.10.0

New:
- Optional "Radio button" format for shop options (instead of "Combo box")

------------------------------------------------------

Version 2.9.8

Fixed:
- Date format error (TypeError: dateFormat.replace is not a function)

------------------------------------------------------

Version 2.9.7

New:
- You can leave the labels empty in the Filtering box

Fixed:
- Date format corrected (when custom format is empty) on earlier versions too
- Time got removed from Date range, as it was unnecessary and often messed up the output
- Further optimized Filtering and Sort box layout
- Empty Filtering and Sort box might appear

------------------------------------------------------

Version 2.9.6

New:
- No need to press the Search button in the "Filtering" box if there's only one select box
- Reset button in Filtering box is dimmed if there's nothing to reset

Fixed:
- Filtering didn't always find images when using "keywords"
- Improved layout for "Filtering and Sort" box
- Comma in Date format triggers bad date range formatting
- Fall back to System date format instead of dd/MM/yy if the corresponding Setting box is empty (unfortunately jAlbum also gave back wrong System date format before v19.3) 

------------------------------------------------------

Version 2.9.5

New:
- Tag cloud can use "thumbCaption" and "imageCaption" too as source
- Custom fields - e.g. "creator" - can be used in the Tag cloud box and Search

Fixed:
- Difficulties searching in HTML formatted fields, e.g. comment

------------------------------------------------------

Version 2.9.4

Fixed:
- ZIP button generated unnecessarily
- "Alla" instead of "Liten" in Swedish translation of the select button

------------------------------------------------------

Version 2.9.3

Fixed:
- Up link from custom pages might bring to the upper level folder
- Diacritics (accented letters) in words cause them to be ignored or chunked in tag cloud

------------------------------------------------------

Version 2.9.2

New:
- Upload path can include index.html: http://me.jalbum.net/albumname/index.html (more convenient)

------------------------------------------------------

Version 2.9.1

New:
- Search finds fragments in filenames too

Changed:
- Shopping cart doesn't send filenames twice (JPG and PNG) to PayPal in case of PNG originals
- Better "responsive" embedding. Note, this still is not a good idea to embed a responsive page into another web page, because this way the responsiveness goes away
- Pinch zoom is enabled on the main image. Note, using this visitors might zoom important controls out of the screen. They should zoom out to get the full page again. 

------------------------------------------------------

Version 2.9.0

New:
- Individual Price (see Edit mode -> Description) can be used as single shop option
- Added spinners to shopping cart quantity boxes

Fixed:
- Financial data type in Filtering and sort fell back to string type, resulting in wrong ordering
- Visiting the same album again, items already removed or checked out migh reappear in the shopping cart

------------------------------------------------------

Version 2.8.7

Fixed:
- Actual menu color might left blue with any color settings
- In certain cases the first image becomes invisible (reduced to 0 by 0 dimensions)

------------------------------------------------------

Version 2.8.6

Fixed:
- Deep data loading is further optimized

------------------------------------------------------

Version 2.8.5

Fixed:
- Face tags do not appear
- Instead of the deep database (deep-data.json) the per-folder (data1.json) databases got loaded, e.g. with search and gathering new images.

------------------------------------------------------

Version 2.8.4

Fixed:
- Odd scaling of lightbox images
- Autopano applied to images unnecessarily
- Default poster for audio files
- Autopano starts at the same direction as the slideshow progressing

------------------------------------------------------

Version 2.8.3

New:
- Added maximum zoom control for lightbox images to avoid pixelated images in scale up mode
- Added "Panorama" setting in Edit mode -> Image data panel for marking images as panoramas

Changed:
- If "Auto pano" is off in the "Lightbox panel" you can manually designate images as panoramas 

Fixed:
- Folder's datarange is not always simplified: e.g. 2019/07/25-2019/07/28 instead of 2019/07/25-28
- Auto pano unnecessarily run in some cases

------------------------------------------------------

Version 2.8.2

Fixed:
- Missing video controls

------------------------------------------------------

Version 2.8.1

Fixed:
- Images don't show up in the lightbox with "Cross-fade and Zoom" transition

Updated:
- French and Dutch translations

------------------------------------------------------

Version 2.8

New:
- Auto pano option for both horizontal and vertical panoramas

------------------------------------------------------

Version 2.7.4

New:
- Option for including the album name in the shopping cart notification email
- Better optimization of shopping cart email, e.g. skipping title if same as filename
- Video loop option

------------------------------------------------------

Version 2.7.3

Fixed:
- The following 4 characters are still triggered the bug fixed in 2.7.2: ' ( ) and !
- Javascript error (missing thumbnails) with IE11 and below and some older Android browsers

------------------------------------------------------

Version 2.7.2

Fixed:
- The album can't go to lightbox directly when the file name contains extra characters (e.g. punctuation, diacritics) after copy/paste URL2 or refresh
- '<span>' appears on the Download button in lightbox

Updated:
- Help pages with the new features: http://jalbum.net/help/en/Skin/Tiger

------------------------------------------------------

Version 2.7.1

Fixed:
- Price range on "Buy" buttons might trigger Javascript error
- Number formatting for prices follow the visitor's language

Updated:
- French translation by Henri Spagnolo

------------------------------------------------------

Version 2.7.0

New:
- "Filtering and Sort" section
- Google Map works in the localhost too (provided you've added localhost/* to the API key's allowed domains) 
- Shopping cart: both the "Add to cart" button on the index page and the one in the lightbox can display the minimal price or the price range 
- Added icons for buttons in the Lightbox

Fixed:
- Cookie / Localstorage management. E.g. shopping cart items might got infiltrated into other albums on the same site.
- Map button doesn't show up in the lightbox

------------------------------------------------------

Version 2.6.2

Fixed:
- No tooltip on desktop on some browsers only after the user has clicked with the mouse
- "Mark folders new" marks older folders too with "Added date" and "Modified date" setting  

------------------------------------------------------

Version 2.6.1

Fixed:
- Disabling the Play/Pause button in Lightbox results in JS error
- When importing Turtle albums the hero height might get impossible to modify if the value was below 110px
- The zoom-in effect on thumbnails doesn't work even if the corresponding setting is on

Updated:
- German translation
- Underlying ZURB foundation to 6.5.1

------------------------------------------------------

Version 2.6.0

New:
- You can turn off the mouseover zoom-in animations on buttons
- Added control for the maximum horizontal and vertical aspect ratio on thumbnails when not in "Fixed shape" mode
- When the search field is set to be visible by default it will stay put after a search too 

Fixed:
- Stop slideshow button does not change back to start button when clicked
- Music can't be stopped (or hard to stop) on touch devices

Updated:
- German translation

------------------------------------------------------

Version 2.5.6

Fixed:
- MS IE and Edge browser Javascript Error 

------------------------------------------------------

Version 2.5.5

Fixed:
- ALT text broken

------------------------------------------------------

Version 2.5.4

Fixed:
- Search, Tag cloud search missing results
- HTML entities might show up in Tag cloud
- HTML tags in Titles cause the ALT text broken

Updated:
- Hungarian, French and Dutch translations

------------------------------------------------------

Version 2.5.3

New:
- Mandatory fields are marked with red asterisk

Fixed:
- 360° panorama viewer is used on other than "equirectangular" projections too, resulting distorted panoramas
- Search for strings containing special characters ".+-()[]" triggers error or no search results
- Fotomoto integration broken

------------------------------------------------------

Version 2.5.2

New:
- PgUp and PgDn buttons can also be used to move between images in the lightbox

Fixed:
- Empty folder title didn't work, always showing the folder name
- Folder thumbnails in 1 column layout were too small

------------------------------------------------------

Version 2.5.1

New:
- "Keep only selected" button: filtering for the selected thumbs when using the shopping cart or feedback
- Mp3 sound clips can be played along images. Use the same base name and place the mp3 in the same folder as the source image.

Fixed:
- Tag cloud is missing some tags from images tagged with multiple words
- Share buttons invisible
- Debug prints on the System console
- Incoherently disabled "Select all" and "None" buttons
- Removed IMG tag from comments

------------------------------------------------------

Version 2.5.0

New:
- Feedback cart can copy the form to the clipboard for use with web mails
- Better Shopping cart and Feedback user experience
- Additional SEO text for Title and Meta description tags
- Can hide Web locations in the Folders section

Fixed:
- HTML text encoding can be other than UTF-8, still UTF-8 is strongly recommended
- Fixed search issues

------------------------------------------------------

Version 2.4.4

Fixed:
- ${resPath} does not work in comments or folder descriptions when used in a caption template
- Lightroom style facetags didn't work

------------------------------------------------------

Version 2.4.3

Fixed:
- Deep data (for large albums) isn't loaded

Changed:
- Where the Shop/Feedback section was hidden on pages with folders only, it didn't show up even after a Search or Label search. Now the section shows up if there are selectable thumbnails.   

------------------------------------------------------

Version 2.4.2

New:
- The focus is automatically set to the first newly added element in the feedback box

Fixed:
- The contents of the Feedback cart does not kept after changing folders

------------------------------------------------------

Version 2.4.1

Fixed:
- Using the feedback (without PayPal) the lightbox comes up when clicking the selection box

Updated:
- French and Dutch translations

------------------------------------------------------

Version 2.4.0

New:
- Option to display feedback only on pages with images (by default on)
- The float buttons changes to "Add to cart" / "Add comment" when at least one thumb is selected
- Float button shows the number of selected thumbnails (also nicer number styling)

Changed:
- Shopping cart (and feedback) floating button always on, not only after adding an item

Fixed:
- Float button position when only shopping cart is present

------------------------------------------------------

Version 2.3.5

New:
- Added link to the image's original folder on search and label search results 
- Smooth audio transitions (in Lightbox and the background music)
- Added option to mute background music during audio/video playback (on by default)

Fixed:
- Background music play position isn't kept after folder change

Changed:
- Larger "select" and "Add to cart" buttons on thumbnails to conform to Google Mobile Usability guidelines

------------------------------------------------------

Version 2.3.4

Fixed:
- Empty author image on the About page results in a broken image
- When the page is initialized by a parameter (e.g. search results) the original thumbnail layout is not refreshed after closing the overlay

Changed:
- Added 1.5s delay for the first photo when the "Start slideshow" button is pressed 

------------------------------------------------------

Version 2.3.3

Changed:
- Feedback got different labels from the shopping cart (e.g. "Add comment" instead of "Add to cart") so visitors will not afraid they have to pay

------------------------------------------------------

Version 2.3.2

Fixed:
- Always used <HTML lang="en"> whatever language was selected.

------------------------------------------------------

Version 2.3.1

Fixed:
- The folder thumbnail caption might get cropped at the bottom

------------------------------------------------------

Version 2.3.0

New:
- You can select to hide/show the "Download" button independently of the "Right-click protect" setting on "Site / Extra" panel.
- Added option for loading jQuery from the site instead of Google CDN

Changed:
- Sitemap works in subfolders too

Fixed:
- Only one set is made of the "Extra sizes" at the top level
- Download button isn't generated on videos when "Allow download of non-images" is selected
- IE11 displays the search box out of screen
- On touch devices tapping the main image most of the time didn't bring back the control bar

------------------------------------------------------

Version 2.2.6

Fixed:
- Can't select crop focus on the file properties panel, only through right-click -> Set crop focus

Updated:
- Dutch translation (by Ron van Rossum)

------------------------------------------------------

Version 2.2.5

Fixed:
- Just empty frame shows on mobile phones when viewing PDF files 

------------------------------------------------------

Version 2.2.4

New:
- PDF files are displayed in the Lightbox in full size, not just a link. Browsers not capable of displaying PDF files are showing the link as before.

Fixed:
- Background music player button forced to a separate line instead of staying next to the search button
- When auto-starting, the thumbnail strip doesn't align the thumbnails properly during the first image

Updated:
- French translation, thanks Daniel!

------------------------------------------------------

Version 2.2.3

Fixed:
- Multiple Shop coupons didn't work, only the first one was accepted
- Main image padding didn't work

------------------------------------------------------

Version 2.2.2

Fixed:
- Regions tagged with MS Live Photo Gallery doesn't show up in the album
- Date formatting error when the first and last date is of same year/month and same day of week

------------------------------------------------------

Version 2.2.1

Fixed:
- Thumbnail rows of images or folders might get slip over each in fixed shape thumbnails mode, with captions below or above

Changed:
- Slightly bigger gap below the Hero area

------------------------------------------------------

Version 2.2.0

New:
- Context sensitive help: click the blue "?" to get help with Tiger settings
- PayPal notification contains album name and path

Fixed:
- Tax amount was not added to the cart

Changed
- PayPal notification encoded file names replaced with simple
- Removed title in the PayPal cart if that's the same as file name

------------------------------------------------------

Version 2.1.0

Changed:
- If "Home page address" is defined the top menu will contain a home link besides the "Album start page" (top level page) link
- Top menu, bottom menu and breadcrumb path shows only short titles (max 32 chars)
- Starting a video by tapping the video area will hide the info panel but never show if it was already hidden 

Fixed:
- Invalid shop options - e.g. missing price - triggers JS errors
- Bottom menu moves to left on medim screen size, even if there's no Facebook or Google box
- Link in comment can trigger layout errors with "tooltip" type captions
- Custom shop options for subfolders get overwritten by the global options 

------------------------------------------------------

Version 2.0.4

Fixed:
- APIs not loaded if no GDPR consent was asked
- Unnecessary Google API load attempt when no Google Box is used 

------------------------------------------------------

Version 2.0.3

Fixed:
- Logo is missing if there's no top navigation

------------------------------------------------------

Version 2.0.2

Fixed:
- Cookie policy link didn't work if there was any API affecting GDPR policy
- Cookie consent didn't show up if GDPR was on but there were no API's that fall into the GDPR law

------------------------------------------------------

Version 2.0.1

Fixed:
- Local preview won't work when offline

------------------------------------------------------

Version 2.0.0

New:
- Support for "deep data": loads the database from one single file, "deep-data.json" (requires jAlbum 15.5+), instead of loading data from all folders separately. Can speed up search significantly. The skin is still backwards compatible with older jAlbum versions, falls back using the separate folder data. 

Changed:
- Optimized performance and accessibility
- Upgraded Zurb Framework to 6.4.3
- Upgraded jQuery to 3.3.1

Fixed:
- Extreme wide image's thumbnails (panoramic) are not properly aligned vertically

------------------------------------------------------

Version 1.10.1

New:
- Google Analytics "Global Site Tag" (gtag.js) added

Fixed:
- GDPR compliance warning appears even if no external API's used
- Refusing new API's added recently until cookies get cleared

------------------------------------------------------

Version 1.10.0

New:
- GDPR compatibility update

------------------------------------------------------

Version 1.9.2

Fixed:
- Google API loaded even if there was no need for it
- Background image doesn't reach the bottom if the page is too short

------------------------------------------------------

Version 1.9.1

Fixed:
- Sharing lightbox image through email might generate broken link if the file name contains spaces or other non-websafe characters
- Email feedback links are not URL-encoded

------------------------------------------------------

Version 1.9

New:
- Optional text labels on lighbox control buttons

------------------------------------------------------

Version 1.8.4

Fixed:
- jAlbum widget bar covers part of the caption below the images

------------------------------------------------------

Version 1.8.3

Fixed:
- Going beyond the last photo in "Ask what to do next" mode, the navigation becomes broken

------------------------------------------------------

Version 1.8.2

Fixed:
- Unnecessary "Save jAlbum project" popups

------------------------------------------------------

Version 1.8.1

Fixed:
- Font size setting has influenced the page width

New:
- Turkish translation thanks to Osman Oz

------------------------------------------------------

Version 1.8

New:
- Added presets to all Caption template boxes

------------------------------------------------------

Version 1.7.1

New:
- Added "External links" on folders
- Better formatting of keywords in Photo data

Fixed:
- Empty "Custom section" in subfolders
- Facebook Share might not use the Javascript API (which works better on mobiles) even if FB commenting or FB box is used

------------------------------------------------------

Version 1.7.0

New:
- Fotomoto integration

Fixed:
- Share through email might produce broken links
- Now the Advent calendar is using a fixed 7-coloumn layout to match the days of the week 

------------------------------------------------------

Version 1.6.4

Fixed:
- Too small images in lightbox on HiDpi screens
- "Variable 's' is undefined" error 

Changed:
- Advent calendar uses more calendar-like layout, day of month is in big instead of the serial number

------------------------------------------------------

Version 1.6.3

Fixed:
- Advent calendar JS error before start date
- Advent calendar didn't follow global preferences (e.g. fit screen, or thumbs visibility)
- Pixelated User Interface icons 

------------------------------------------------------

Version 1.6.2

New:
- Several improvements on the feedback feature, e.g. customized button labels

Fixed:
- Feedback on top level folder didn't work
- Feedback formatting does not follow the settings
- Removing items in feedback cart doesn't remove them completely
- Some html entities (&, ndash, copy, ...) are improperly converted in social share descriptions
- Lightbox images appear twice as big on HiDpi screens

------------------------------------------------------

Version 1.6.1

New:
- Advent calendar custom page (or any calendar with surprise photos that can be opened day-by-day)

Fixed:
- "rep.getPathFrom" error on jAlbum 14
- Underscores in the title triggered underlining when "Preformat" was on

------------------------------------------------------

Version 1.6.0

New:
- Feedback feature (visitors can select photos and send feedback on them). Can be used also to order photos through email.

Fixed:
- Folder thumbnail isn't generated, the hero image is in low resolution
- After switching back and forth the full screen mode in VR viewer the frame might get positioned off center 

------------------------------------------------------

Version 1.5.0

New:
- You can select different folder thumbnail image and "hero"/theme image (needs jAlbum 14.3+)

Fixed:
- Broken folder thumbnail if the selected image was in camera RAW format
- Place marks not clickable beyond nr. 10 if "Link to originals" was selected
- Too small folder thumbnails with portrait images and fixed shape = OFF
- Some cropped or bleeding thumbnails (in the first dozen) when refreshing the page
- VR 360 images has ground to a halt in the integrated browser
- Broken links to Weblocations from Top menu, Sitemap and Contents pages
- With no folder thumbnail selected the folder icon is missing in subfolders
- Header/Footer Custom content's "Top level only" setting is not respected

------------------------------------------------------

Version 1.4.2

New:
- 360 player has auto-pano, zoom and fullscreen functions
- Option to disable the 360 player even if image holds the "projectionType=equiRectangular" attribute

Changed:
- No preview image is sent to 360-viewer as jAlbum 14.2 provides the proper resolution image
- Changed 360 player from "Google VRview" to "Photo Sphere Viewer" by Jérémy Heleine (https://github.com/JeremyHeleine/Photo-Sphere-Viewer)

Note:
- 360 player's full screen mode is buggy on Chrome/Win

------------------------------------------------------

Version 1.4.1

Fixed:
- Date range with double separating chars (e.g. ". ") ends up in wrong formatting

Changed:
- VR library is included in the skin, so no CORS error appears in the absence of proper headers

------------------------------------------------------

Version 1.4

New:
- Separately sized folder thumbnails
- Folder thumbnails can be fixed shape independent of image thumbnails and vica-versa
- Selectable aspect ratio for fixed shaped thumbnails. The dimensions are calculated automatically based on the column count.
- New vector-based folder icon for folders with no selected folder thumbnail
- Support for 360 VR files (Experimental)

Fixed:
- Javascript error if no folder thumbnail was selected (e.g. empty folders)
- Equalizing folder thumbnails didn't always succeed
- Web location thumbnails different from other folder thumbnails
- External content's empty HTML tags get stripped

Changed:
- "Fixed shape thumbnails" setting moved to "Sections / Images" as now it applies only to images 

Updated:
- Swedish translation

------------------------------------------------------

Version 1.3.12

Fixed:
- Background image doesn't reach out to the page bottom
- IE11 and Edge: audio/video controls disappear 

------------------------------------------------------

Version 1.3.11

New:
- Option to open web locations in new window

Fixed:
- IE11 Javascript error
- Other files' (PDF, XLS) icon is not centered in Lightbox 
- Audio files' poster image doesn't fit in Fit to window mode  
- Empty line in shop options leads to broken cart

Updated:
- Hungarian translation

------------------------------------------------------

Version 1.3.10

Fixed:
- Mixed content error: "http:" links on secure sites
- Print button missing

------------------------------------------------------

Version 1.3.9

Fixed:
- Slow scrolling due to high CPU usage
- Deepest folder level isn't marked as "New"
- Missing tags from the "Tag cloud box" in some folders 

------------------------------------------------------

Version 1.3.8

Fixed:
- Delay in loading the thumbnails during scroll

------------------------------------------------------

Version 1.3.7

New:
- Added option for the number of thumbnail rows to be preloaded

Changed:
- Smaller H5 and H6 fonts in the captions
- SVG type added in web.config for IIS servers
- Google Box "Type" added because previously not all URL's were recognized
- Turtle -> Tiger transition: thumbnail caption template gets replaced by Tiger's default + image number 

------------------------------------------------------

Version 1.3.6

New:
- Google maps pins show image number / title / caption as tooltip

------------------------------------------------------

Version 1.3.5

Fixed:
- ${imageNum} missing from captions
- "Start slideshow" isn't translated
- Download original (or HiRes) doesn't work on images from search results or tag cloud search
- Blurry folder thumbnails if folder columns is 1 or 2

------------------------------------------------------

Version 1.3.4

Fixed:
- External content missing if it's a simple <iframe> tag
- Modal windows theme 'Dark' isn't dark on light styles 
- Headline sizes "200%" and "400%" doesn't stick, falls back to "120%" after loading the album again
- Search box placeholder "Search..." isn't translated
- Hero image's pattern background is too large and blurred
- Shopping Cart coupons doesn't work
- Seller instructions doesn't work
- Map on the index page didn't respect the "Type" and "Zoom" seeting 
- Top menu: custom pages don't get marked as actual when you're on the page
- Top menu: 2nd+ level arrow different color than the rest
- Height-matching on thumbnail rows fails sometimes
- Top menu with submenus triggers flash during page rendering
- Duplicate results in Search if the keyword is found in more than one places (e.g. keywords and filename)

Changed:
- Facebook share button is disabled on individual images because Facebook has stopped supporting this type of sharing :(
- When you click a share button, the popup will disappear automatically
- Bigger Help graphics
- Removed Full screen button from the lightbox maps

------------------------------------------------------

Version 1.3.2

Fixed:
- "null" appears below web location thumbnails if "Show image count" is on
- Top navigation depth isn't used on custom pages
- No height matching on folders when the page has first loaded with a paramater (e.g. tags=)
- In "tag cloud search" and "search" resulting in mixed results (e.g. folders) clicking a thumbnail might open the wrong image 
- Font samples didn't show the fallback font
- Box backgrounds on sections are different from thumbnails: Brushed, Shine, Techno styles
- Unnecessary box border in Facebook commenting section

Changed:
- Top navigation depth = 1 means no subfolders
- Added warning when testing local albums in browsers that block the database access
- Search box has been removed from custom pages because no lightbox exists on these pages

------------------------------------------------------

Version 1.3.1

New:
- Selectable top menu depth (1-5)

Fixed:
- Google Maps "Api key missing" error
- Tag cloud, search doesn't work on keywords
- Accented characters cause broken entries in the tag cloud box
- Tag cloud search box doesn't work

Changed:
- Tag cloud box now collects tags by words from comments and titles
- Smaller line height in dropdown menus
- Custom content remains visible after search

------------------------------------------------------

Version 1.3.0

New:
- Added "External content" feature. (Edit mode -> External content panel) You can add a link, HTML code or <iframe>.
- Added "Help" window

Fixed:
- Headline font = "Same as base font"
- Design / Font size resets to default
- Design / Headline font size resets to default
- Tag cloud box: duplicate findings
- IE11, Edge: last image sticks to cursor after swiping

------------------------------------------------------

Version 1.2.1

New:
- Added type-specific fields to search and Tag cloud: e.g. folder:title or webPage:name

Fixed:
- Start slideshow = Auto doesn't work
- When slideshow is set to "Auto start" upon clicking the "Start slideshow" wrong navigation happens
- Tag cloud search finds irrelevant results

------------------------------------------------------

Version 1.2.0

New:
- Added Folders, Custom pages, Web locations to Search results and Tag cloud search

Fixed:
- "Use thumbnail strip" = OFF + "Thumbnails visible by default" = ON caused broken lightbox
- ${folderModDate} isn't removed on some places if its source is set to "None"

------------------------------------------------------

Version 1.1.2

New:
- ${folderModDate} can be set to "None": easy to skip from the header

Fixed:
- Sitemap contains broken links below level 2
- Stacked folder thumbnails when scrolled quick
- Top menu missing on Custom pages
- Broken links in top menu in deep folders
- "Scroll to top button" tooltip

Changed:
- Headline font to "Oswald" (default) - it has more code pages
- Lightbox / Fit image to "Both" (default)

Updated:
- French translation

------------------------------------------------------

Version 1.1.1

Fixed:
- Next folder link

------------------------------------------------------

Version 1.1.0

New:
- Instead of preprocessing the whole tree upfront, the skin generates variables per folder, which results in much quicker album builds, and allows creating huge albums (> 50 000)
- Added text to the "Scroll to top" button, reading "Top"

Fixed:
- Date range simplification, e.g. 2017/06/15-2017/06/21 -> 2017/06/15-21
- Missing pages from 2nd level and below on Contents page
- "Mark new images" and "Search new images" working only on "Date taken" date
- "Offer download as ZIP" creates broken files

------------------------------------------------------

Version 1.0.11

Fixed:
- Can't add items to shopping cart (with deep folder structure)

------------------------------------------------------

Version 1.0.10

Fixed:
- Folder fails if name is containing , & ' ( ) @ and similar characters
- Folder fails if name is containing space(s) and "URL-encode links" is OFF
- Click for previous image works only on the far left side of the image

Changed:
- New link for Google Maps API key generation
- Explanation added for API key usage

------------------------------------------------------

Version 1.0.9

Fixed:
- Attempting to write out XMP (GPS) info when "Write XMP..." is OFF
- Background music "Controlled by slideshow" ignored
- Start slideshow doesn't start slideshow just opens lightbox
- IE11/Edge picture sticks to mouse when clicked

------------------------------------------------------

Version 1.0.8

Fixed:
- Shopping cart discount rate, individual discount rate problems
- Auto-hide control bar setting ignored
- Better Auto hide controls behavior
- Cookie-related Javascript error

Changed:
- Added View cart button in the Lightbox
- Changed text "View cart (3)" instead of "3 items".
- Controls automatically hidden after 1.5 second not 3

------------------------------------------------------

Version 1.0.7

New:
- Tiger now writes the GPS coordinates back in jAlbum's format previously geotagged in Turtle skin. Gets activated on the first Make album.
- xmp.aux:Lens field added to the Photo data template

Fixed:
- Full screen mode
- Click for next - can't disable
- Click beside to get back to index page - can't disable
- Auto-start slideshow
- Added scrollbars for User Interface panels for using on smaller screens
- Printed pages look disturbed
- Shop Discount missing

Changed:
- Safer custom page templates: when changing skins won't break the calls to skin-specific functions

------------------------------------------------------

Version 1.0.6

Fixed:
- "folderModDate missing" error when using custom pages
- No top menu if only "custom pages" selected
- Number folder names caused the folder to be broken 

------------------------------------------------------

Version 1.0.5

New:
- Lens Information added for Canon cameras
- Added button to reset the "Photo data template". Can come handy when migrating from Turtle skin.

Fixed:
- No checkbox on thumbnails which you can't place into the shopping cart
- Preformatting did not work on comments (e.g. respecting line breaks)

------------------------------------------------------

Version 1.0.4

Fixed:
- Image number doesn't show up in the Lightbox
- Image caption might become empty when switched from Turtle

------------------------------------------------------

Version 1.0.3

Fixed:
- Some Lightbox settings and defaults ignored, like thumbnail strip, caption, buttons visibility
- "Cannot read property 'hasOwnProperty' of null" (map)
- Empty caption box displayed
- Double-encoded URL in the case of Video and Audio files
- Unnecessary theme image generation

------------------------------------------------------

Version 1.0.2

Fixed:
- IE11 error
- Broken page beyond the 3rd level
- Broken Google+ link on Contact.htt
- Can't hide album modification date and image count in the footer
- Thumbnail caption's "flyover" at page load in "tooltip" mode
- Set Crop Focus tool now picks up the Hero image dimensions

Changed:
- Changed many defaults to match Turtle's defaults
- Intelligent mapping of Turtle variables to Tiger variables

------------------------------------------------------

Version 1.0.1

Fixed:
- Sitemap.htt and Contents.htt page errors

Changed:
- More sensible default settings (less used features got turned off)

------------------------------------------------------

IMPORTANT! Please read this:

Local preview:
--------------
Testing the Local album (Preview) does not work in some browsers with the default settings. This is because Tiger is based on a database (JSON format) to which the access from local HTML files is limited, due to security reasons. jAlbum's built-in browser works, however. If you want to test in Chrome please read this sticky:
http://jalbum.net/forum/ann.jspa?annID=146

Switching from Turtle:
----------------------
Please note, as Tiger is based on a different language than Turtle, the function calls has changed too. Custom pages therefore might carry old code from Turtle skin, which causes errors.
Install the tool from here: https://jalbum.net/forum/thread.jspa?threadID=52475 to fix the old HTT files - if you had one - after importing a Turtle album into Tiger! 

------------------------------------------------------

Version 1.0 - Initial release

LICENSE

Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 
<http://creativecommons.org/licenses/by-nc-sa/3.0/>

You are free:
- to Share - to copy, distribute and transmit the work
- to Remix - to adapt the work

Under the following conditions:
- Attribution - You must attribute the work in the manner specified by the author or licensor (but not in any way that suggests that they endorse you or your use of the work).
- Noncommercial - You may not use this work for commercial purposes.
- Share Alike - If you alter, transform, or build upon this work, you may distribute the resulting work only under the same or similar license to this one.

With the understanding that:
- Waiver - Any of the above conditions can be waived if you get permission from the copyright holder.
- Public Domain - Where the work or any of its elements is in the public domain under applicable law, that status is in no way affected by the license.
- Other Rights - In no way are any of the following rights affected by the license:
   Your fair dealing or fair use rights, or other applicable copyright exceptions and limitations;
   The author's moral rights;
   Rights other persons may have either in the work itself or in how the work is used, such as publicity or privacy rights.

FREE ASSETS

- Zurb Foundation framework 6
- Subtle patterns from <http://subtlepatterns.com/>
- jQuery javascript library <http://jquery.com/>
- OpenGraph API
- Google Maps API 3
- Google social API
- Google Analytics
- Paypal Web Standards Payment API
- Java Development Kit 1.8

Enjoy Tiger skin,

Laza
laza@jalbum.net
