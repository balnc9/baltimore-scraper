chrome.action.onClicked.addListener(tab => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content_script.js"]
    }).then(() => {
      chrome.tabs.create({ url: chrome.runtime.getURL("visualization.html") });
    });
  });
  