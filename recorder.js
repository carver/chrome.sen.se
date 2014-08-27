
//TODO trigger stat check on tabs.onCreated and tabs.onRemoved

slow_count_gap_ms = 4 * 60 * 60 * 1000;

if (!localStorage.lastSlowRecord) {
    localStorage.lastSlowRecord = 0;
}

function startRepeater() {
    chrome.alarms.getAll(function (alarms) {
        if (!alarms.length) {
            chrome.alarms.create("stat checker", {delayInMinutes: 0, periodInMinutes: 15});
        }
    });
}

chrome.alarms.onAlarm.addListener(record);

function record() {
    chrome.storage.sync.get({
        sense_key : ''
    }, function (items) {
        var key = items.sense_key;
        if (key) {
            chrome.storage.local.get({
                fast_tab_count_feed: '',
                slow_tab_count_feed: ''
            }, function (items) {
                checkStats(key, items.fast_tab_count_feed, items.slow_tab_count_feed);
            });
        }
    });
}

function checkStats(api_key, fast_tabs, slow_tabs) {
    var stat = chrome.tabs.query({}, function (tabs) {
        if(tabs.length > 1) { //exclude scenario where chrome crashes, and hasn't restored yet
            recordTabCount(api_key, fast_tabs, slow_tabs, tabs.length);
        }
    });
}

function recordTabCount(api_key, fast_tabs, slow_tabs, stat) {
    if (Date.now() - localStorage.lastSlowRecord > slow_count_gap_ms - 60 * 1000) {
        postStat(api_key, slow_tabs, stat);
        localStorage.lastSlowRecord = Date.now();
    }
    postStat(api_key, fast_tabs, stat);
}

function postStat(api_key, feed_id, stat) {
    if (!feed_id) return;
    var statObj = {feed_id: feed_id, value: stat};
    $.post('http://api.sen.se/events?sense_key='+api_key, JSON.stringify(statObj));
}

chrome.runtime.onInstalled.addListener(startRepeater);
chrome.runtime.onStartup.addListener(startRepeater);
