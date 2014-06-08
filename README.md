chrome.sen.se
=============

Generate a visualization of your open tab count over time

Installation
=============

 1. In the Chrome menu -> Tools -> Extensions, check the box next to `Developer mode`
 2. Press the `Load Unpacked Extension...` button and select the root of this repository
 3. Click the _Options_ link and set your open.sen.se API key
 4. Create a new Chrome device with two new input feeds: a high-speed and low-speed
 5. Set the feed IDs in the options screen
 6. Click Save
 7. Your first data should show up immediately

The high-speed data is sent in once every 15 minutes, and the low-speed data is sent once every hour.  This has the effect of showing 2 days of high-speed data and about 1 week of low-speed data in the current sen.se graphs (MultiViz).
