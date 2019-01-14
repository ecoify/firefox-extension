// popup opened
document.addEventListener('DOMContentLoaded', function() {
  // init share buttons
  getBackgroundPage().then(page => {
    page.readCounter().then(counter => {
      var text = "I saved "+encodeURIComponent(countToCarbon(counter))+" CO2 using Ecoify for Firefox. Join now!";
      document.getElementById('share_twitter').href = "https://twitter.com/intent/tweet/?text="+text+"&amp;url=https%3A%2F%2Fecoify.org%2F";
    })
  })

  // options page
  document.getElementById('options_link').addEventListener('click', function() {
    if (browser.runtime.openOptionsPage) {
      browser.runtime.openOptionsPage();
    } else {
      window.open(browser.runtime.getURL('options/options.html'));
    }
  });

  // toggle
  var toggle = document.getElementById('toggle');
  getBackgroundPage().then(page => page.readToggle().then(new_toggle => {
    toggle.checked = new_toggle;
    updateToggle(toggle.checked);
  }))

  toggle.addEventListener('click', function () {
    updateToggle(toggle.checked);
  });

  // update carbon grams counter
  var carbon_grams = document.getElementById('carbon_grams');
  getBackgroundPage().then(page => {
    page.readCounter().then(counter => {
      carbon_grams.innerHTML = countToCarbon(counter);
    })
  })

}, false);

function getBackgroundPage() {
  return new Promise((resolve, reject) => {
    browser.runtime.getBackgroundPage((page) => {
      if (browser.runtime.lastError) {
        console.error(browser.runtime.lastError.message);
        reject(browser.runtime.lastError.message);
      } else {
        resolve(page);
      }
    })
  });
}

function countToCarbon(count) {
  new_carbon_grams = count * 0.2;

  var new_carbon_grams_text;
  if (new_carbon_grams < 1000) {
    new_carbon_grams_text = parseFloat((new_carbon_grams).toFixed(4)) + " g";
  } else if (new_carbon_grams < 1000000) {
    new_carbon_grams_text = parseFloat((new_carbon_grams / 1000).toFixed(4)) + " kg";
  } else {
    new_carbon_grams_text = parseFloat((new_carbon_grams / 1000000).toFixed(4)) + " t";
  }

  return new_carbon_grams_text;
}

function updateToggle(toggle) {
  var body = document.getElementsByTagName("BODY")[0];
  if (toggle) {
    // listener
    getBackgroundPage().then(page => {page.addReqListener();});
    // popup background
    body.classList.remove('off');
    body.classList.add('on');
  } else {
    // listener
    getBackgroundPage().then(page => {page.removeReqListener();});
    // popup background
    body.classList.remove('on');
    body.classList.add('off');
  }
}
