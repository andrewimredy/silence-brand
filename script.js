document.getElementById('muteButton').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      let tab = tabs[0];
      chrome.tabs.update(tab.id, { muted: !tab.mutedInfo.muted });
    });
  });
  