// defaults
const redirects_default = {
  'facebook': 'https://www.facebook.com/',
  'fb': 'https://www.facebook.com/',
  'facebook log in': 'https://www.facebook.com/',
  'facebook login': 'https://www.facebook.com/',
  'facebook.com': 'https://www.facebook.com/',
  'facebook.de': 'https://www.facebook.de/',
  'stackoverflow': 'https://stackoverflow.com/',
  'stackoverflow.com': 'https://stackoverflow.com/',
  'netflix': 'https://www.netflix.com/',
  'netflix.com': 'https://www.netflix.com/',
  'youtube': 'https://www.youtube.com/',
  'youtube.com': 'https://www.youtube.com/',
  'youtube.de': 'https://www.youtube.de/',
  'pinterest': 'https://www.pinterest.de/',
  'gmx': 'https://www.gmx.net/',
  'gmx.net': 'https://www.gmx.net/',
  'gmx.de': 'https://www.gmx.de/',
  'amazon': 'https://www.amazon.com/',
  'amazon.com': 'https://www.amazon.com/',
  'wikipedia': 'https://wikipedia.org/',
  'wikipedia.de': 'https://wikipedia.de/',
  'twitter': 'https://twitter.com/',
  'twitter.com': 'https://twitter.com/',
  'ebay': 'https://www.ebay.com/',
  'ebay.com': 'https://www.ebay.com/',
  'instagram': 'https://www.instagram.com/',
  'instagram.com': 'https://www.instagram.com/',
};
var req_listener_active = false;

// user/browser ID
userId = '';
getBrowserId()
  .then(result => {
    userId = result;
  })

// redirects
function getRedirects() {
  return this.redirects;
}

function setRedirects(redirects) {
  this.redirects = redirects;
  setData('redirects', redirects);
}

// stats_consent

function getStatsConsent() {
  return this.stats_consent;
}

function setStatsConsent(stats_consent) {
  this.stats_consent = stats_consent;
  setData('stats_consent', stats_consent);
}

function getDataWithDefault(sKey, default_value) {
  return new Promise((resolve, reject) => {
    var data = {}
    data[sKey] = default_value;
    browser.storage.sync.get(data, (items) => {
      if (browser.runtime.lastError) {
        console.error(browser.runtime.lastError.message);
        reject(browser.runtime.lastError.message);
      } else {
        resolve(items[sKey]);
      }
    });
  });
}

function getData(sKey) {
  return new Promise((resolve, reject) => {
    browser.storage.sync.get(sKey, (items) => {
      if (browser.runtime.lastError) {
        console.error(browser.runtime.lastError.message);
        reject(browser.runtime.lastError.message);
      } else {
        resolve(items[sKey]);
      }
    });
  });
}

function setData(sKey, sValue) {
  return new Promise((resolve, reject) => {
    const data = {}
    data[sKey] = sValue
    browser.storage.sync.set(data, () => {
      if (browser.runtime.lastError) {
        console.error(browser.runtime.lastError.message);
        reject(browser.runtime.lastError.message);
      } else {
        resolve(true);
      }
    });
  });
}

function readToggle() {
  return new Promise((resolve, reject) => {
    getData("ecoify_toggle").then((ecoify_toggle) => {
      if (typeof ecoify_toggle === 'undefined' || isNaN(ecoify_toggle)) {
        ecoify_toggle = true;
      }
      resolve(ecoify_toggle)
    })
  })
}

function setToggle(new_ecoify_toggle) {
  if (new_ecoify_toggle === true || new_ecoify_toggle === false) {
    setData("ecoify_toggle", new_ecoify_toggle);
  }
}

// update Rules API – not using: see options
/*
function setAllRules(database) {
  setData('rules', database)
}

function getAllRules() {
  return new Promise((resolve, reject) => {
    getData('rules').then((ruleset) => {
      if (typeof ruleset === 'undefined') {
        setAllRules(database)
        resolve(database)
      } else {
        resolve(ruleset)
      }
    })
  })
}

function createRule(source, target) {
  return new Promise((resolve, reject) => {
    getAllRules().then((ruleset) => {
      if (source && target) {
        ruleset[source] = target
        setAllRules(ruleset)
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

function updateRule(source, target) {
  createRule(source, target)
}

function deleteRule(source) {
  updateRule(source, undefined)
}
*/

function setBrowserId() {
  var browserId = Date.now() + '-' + Math.floor(Math.random() * Math.floor(Date.now()));
  setData('browserId', browserId)
  return browserId
}

function getBrowserId() {
  return new Promise((resolve, reject) => {
    getData('browserId').then((browserId) => {
      if (typeof browserId === 'undefined') {
        browserId = setBrowserId();
      }
      resolve(browserId)
    })
  })
}

function readCounter() {
  return new Promise((resolve, reject) => {
    getData('blockedCounter').then((counter) => {
      if (typeof counter === 'undefined' || isNaN(counter)) {
        counter = 0;
      }
      resolve(counter)
    })
  })
}

function increaseCounter() {
  readCounter().then((counter) => {
    const thisCounter = counter + 1
    setData('blockedCounter', thisCounter);
    //console.log('counter was ' + thisCounter)
    if (thisCounter % 11 == 0) {
      if (this.stats_consent) {
        var data = {};
        data.carbon = thisCounter * 0.2;
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", 'https://5tepzfsmxg.execute-api.eu-central-1.amazonaws.com/dev/carbon/' + userId, true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.send(JSON.stringify(data));
        //console.log('sent data for ' + userId + ' to server');
      }
    }
  })
}

function req_callback(details) {
  try {
    if (/[&?]q=(.+?)&/.test(details.url) || /[&?]oq=(.+?)&/.test(details.url)) {
      console.log(details.url)
      const term = details.url.match(/[&?]q=(.+?)&/)[1]
      console.log(term)
      if (this.redirects && this.redirects[term]) {
        increaseCounter()
        return { redirectUrl: this.redirects[term] };
      }
    }
  }
  catch (error) {
    console.error(error);
  }
};

const filter = { urls: ['*://*.google.de/*', '*://*.google.com/*'] };
const extraInfoSpec = ['blocking'];
function addReqListener() {
  if (!req_listener_active) {
    browser.webRequest.onBeforeRequest.addListener(req_callback, filter,
      extraInfoSpec);
    req_listener_active = true;
    setToggle(true);
  }
  browser.browserAction.setIcon({ path: "../assets/icon_on_48.png" });
}

function removeReqListener() {
  if (req_listener_active) {
    browser.webRequest.onBeforeRequest.removeListener(req_callback);
    req_listener_active = false;
    setToggle(false);
  }
  browser.browserAction.setIcon({ path: "../assets/icon_off_48.png" });
}

// Init
var startup = () => {
  // get redirects
  getDataWithDefault('redirects', redirects_default)
    .then((redirects) => {
      this.redirects = redirects;
    });

  // get stats_consent
  getDataWithDefault('stats_consent', true)
    .then((stats_consent) => {
      this.stats_consent = stats_consent;
    });

  // toggle
  const togglePromise = readToggle();
  togglePromise.then((toggle) => {
    if (toggle) {
      addReqListener();
    } else {
      removeReqListener();
    }
  });
}

startup();
