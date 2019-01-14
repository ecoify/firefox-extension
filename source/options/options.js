// background page
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

// Saves options to browser storage
function save_options() {
  // redirects
  let parse_json_error = false;
  let newRedirects = {};
  try {
    newRedirects = JSON.parse(document.getElementById('redirects-text').value);
  } catch(e) {
    //console.log("Error parsing JSON: ", e);
    parse_json_error = true;
  }
  if (!parse_json_error) {
    getBackgroundPage().then(page => { page.setRedirects(newRedirects) });
  }

  // stats
  const stats_consent = document.getElementById('stats-checkbox').checked;
  getBackgroundPage().then(page => { page.setStatsConsent(stats_consent) });

  const status = document.getElementById('status');
  if (parse_json_error) {
    status.style.color = 'red';
    status.textContent = 'Error parsing JSON. NOT SAVED! Check your JSON.';
  } else {
    status.style.color = 'green';
    status.textContent = 'Options saved.';
  }
}

// loads options from browser storage
function restore_options() {
  getBackgroundPage().then(page => {
    document.getElementById('redirects-text').value =
      JSON.stringify(page.getRedirects(), null, " ");
    document.getElementById('stats-checkbox').checked = page.getStatsConsent();
  })
}

// init
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('save').addEventListener('click', save_options);
  restore_options();
});
