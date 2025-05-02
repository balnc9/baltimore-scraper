document.getElementById('details').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting
        .executeScript({ target: { tabId: tabs[0].id }, files: ['content_script.js'] })
        .then(() => chrome.tabs.create({ url: chrome.runtime.getURL('details.html') }));
    });
  });
  
  document.getElementById('visualize').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.scripting
        .executeScript({ target: { tabId: tabs[0].id }, files: ['content_script.js'] })
        .then(() => chrome.tabs.create({ url: chrome.runtime.getURL('visualization.html') }));
    });
  });
  