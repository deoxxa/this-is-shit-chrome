var shit_url = "http://thisisshit.info/shit";
var shit_cache = {};

setInterval(function() { shit_cache = {}; }, 600000);

function this_is_shit(url, cb) {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status !== 200) {
        return cb(Error("invalid response code"));
      }

      var data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch (e) {
        return cb(Error("error parsing json"));
      }

      cb(null, data);
    }
  }

  xhr.open("POST", shit_url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({url: url}));
}

function is_this_shit(url, cb) {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status !== 200) {
        return cb(Error("invalid response code"));
      }

      try {
        data = JSON.parse(xhr.responseText);
      } catch (e) {
        return cb(Error("error parsing json"));
      }

      cb(null, data);
    }
  }

  xhr.open("GET", shit_url + "?url=" + encodeURIComponent(url), true);
  xhr.send();
}

function am_i_shit(tab) {
  if (typeof tab === "number") {
    chrome.tabs.get(tab, am_i_shit);
    return;
  }

  if (shit_cache[tab.id] && shit_cache[tab.id].url === tab.url) {
    if (shit_cache[tab.id].count) {
      chrome.browserAction.setBadgeText({text: shit_cache[tab.id].count.toString()});
    } else {
      chrome.browserAction.setBadgeText({text: ""});
    }

    return;
  }

  is_this_shit(tab.url, function(err, data) {
    if (err || !data) {
      chrome.browserAction.setBadgeText({text: ":("});
      return;
    }

    if (!data.urls.length) {
      chrome.browserAction.setBadgeText({text: ""});
      return;
    }

    shit_cache[tab.id] = data.urls.shift();

    am_i_shit(tab);
  });
}

chrome.tabs.onActiveChanged.addListener(am_i_shit);
chrome.tabs.onUpdated.addListener(function(id) {
  if (shit_cache[id]) {
    delete shit_cache[id];
  }

  am_i_shit(id);
});

chrome.browserAction.onClicked.addListener(function(tab) {
  this_is_shit(tab.url, function(err, res) {
    if (shit_cache[tab.id]) {
      delete shit_cache[tab.id];
    }

    am_i_shit(tab);
  });
});
