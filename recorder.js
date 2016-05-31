
//TODO trigger stat check on tabs.onCreated and tabs.onRemoved

slow_count_gap_ms = 4 * 60 * 60 * 1000;

if (!localStorage.lastSlowRecord) {
    localStorage.lastSlowRecord = 0;
}

function startRepeater() {
    var statAlarm = "stat checker";
    chrome.alarms.get(statAlarm, function (alarm) {
        if (!alarm) {
            chrome.alarms.create(statAlarm, {delayInMinutes: 15, periodInMinutes: 15});
            record();
        }
    });
}

chrome.alarms.onAlarm.addListener(record);

function record() {
    // Collect api key and the feed id's
    chrome.storage.sync.get({
        sense_key : ''
    }, function (items) {
        var key = items.sense_key;
        if (key) {
            chrome.storage.local.get({
                fast_tab_count_feed: '',
                slow_tab_count_feed: '',
                fast_email_count_feed: '',
                slow_email_count_feed: ''
            }, function (items) {

                // decide whether to record the low frequency data
                if (isTimeForSlowData()) {
                    localStorage.lastSlowRecord = Date.now();
                }
                else {
                    items.slow_tab_count_feed = '';
                    items.slow_email_count_feed = '';
                }

                // collect and record data
                recordTabs(key,
                    [items.fast_tab_count_feed,
                    items.slow_tab_count_feed]);
                recordEmails(key,
                    [items.fast_email_count_feed,
                    items.slow_email_count_feed]);
            });
        }
    });
}

function isTimeForSlowData() {
    return Date.now() - localStorage.lastSlowRecord > slow_count_gap_ms - 60 * 1000;
}

//************ Tabs **************
function recordTabs(api_key, feeds) {
    var stat = chrome.tabs.query({}, function (tabs) {
        if(tabs.length > 1) { //exclude scenario where chrome crashes, and hasn't restored yet
            postStats(api_key, feeds, tabs.length);
        }
    });
}

//************ Email **************
// Useful docs:
// gmail api quickstart: https://developers.google.com/gmail/api/quickstart/js#prerequisites
// gmail api def'n: https://developers.google.com/gmail/api/v1/reference/users/threads/list#parameters
// google oauth credentials: https://console.developers.google.com/apis/credentials?project=brave-arcadia-132223
// gmail api in extension: http://developer.streak.com/2014/10/how-to-use-gmail-api-in-chrome-extension.html
// oauth in extension debugging: http://stackoverflow.com/questions/31110795/invalid-oauth2-client-id-while-chrome-identity-getauthtoken

function recordEmails(api_key, feeds) {
    chrome.identity.getAuthToken(
        {'interactive': true},
        function () {
            authorizeGoogle(api_key, feeds);
        }
    );
}

function authorizeGoogle(api_key, feeds) {
    gapi.auth.authorize(
        {
            client_id: '38681986693-u4039cn3nf40qpbetnm77huu991igfvd.apps.googleusercontent.com',
            immediate: true,
            scope: 'https://www.googleapis.com/auth/gmail.readonly'
        },
        function(){
            gapi.client.load('gmail', 'v1', function() {
                getUnreadCount(api_key, feeds);
            });
        }
    );
}

function getUnreadCount(api_key, feeds) {
    var request = gapi.client.gmail.users.labels.get({'userId': 'me', id: 'INBOX'});
    // alternatively, get an approximate count of messages matching all labels:
    // gapi.client.gmail.users.threads.list({'userId': 'me', 'labelIds': ['IMPORTANT','INBOX']})
    request.execute(function (label) {
        postStats(api_key, feeds, label.threadsUnread);
    });
}

//************ Stats **************
function postStats(api_key, feed_ids, stat) {
    for (var feed_id of feed_ids) {
        postStat(api_key, feed_id, stat);
    }
}

function postStat(api_key, feed_id, stat) {
    if (!feed_id) return;
    var statObj = {feed_id: feed_id, value: stat};
    $.post('http://api.sen.se/events?sense_key='+api_key, JSON.stringify(statObj));
}

chrome.runtime.onInstalled.addListener(startRepeater);
chrome.runtime.onStartup.addListener(startRepeater);
