// Split between some local and some synced storage
function save_options() {
    save_local();
    save_synced();
}

function save_local() {
  var slow_tab_count_feed = document.getElementById('slow_tab_count_feed').value;
  var fast_tab_count_feed = document.getElementById('fast_tab_count_feed').value;
  var slow_email_count_feed = document.getElementById('slow_email_count_feed').value;
  var fast_email_count_feed = document.getElementById('fast_email_count_feed').value;
  chrome.storage.local.set({
    slow_tab_count_feed: slow_tab_count_feed,
    fast_tab_count_feed: fast_tab_count_feed,
    slow_email_count_feed: slow_email_count_feed,
    fast_email_count_feed: fast_email_count_feed
  }, function() {
    var status = document.getElementById('status');
    status.textContent = status.textContent + 'Feed IDs saved. ';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function save_synced() {
  var sense_key = document.getElementById('sense_key').value;
  chrome.storage.sync.set({
    sense_key: sense_key
  }, function() {
    var status = document.getElementById('status');
    status.textContent = status.textContent + 'API Key saved. ';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    restore_local();
    restore_synced();
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_local() {
  chrome.storage.local.get({
    slow_tab_count_feed: '',
    fast_tab_count_feed: '',
    slow_email_count_feed: '',
    fast_email_count_feed: ''
  }, function(items) {
    document.getElementById('fast_tab_count_feed').value = items.fast_tab_count_feed;
    document.getElementById('slow_tab_count_feed').value = items.slow_tab_count_feed;
    document.getElementById('fast_email_count_feed').value = items.fast_email_count_feed;
    document.getElementById('slow_email_count_feed').value = items.slow_email_count_feed;
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_synced() {
  chrome.storage.sync.get({
    sense_key: ''
  }, function(items) {
    document.getElementById('sense_key').value = items.sense_key;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
