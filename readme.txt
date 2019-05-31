:
: Readme.txt
:

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
