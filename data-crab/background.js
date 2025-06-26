let timer = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'start') {
    clearInterval(timer);
    timer = setInterval(captureTab, msg.interval * 1000);
  }
  if (msg.type === 'stop') {
    clearInterval(timer);
  }
});

function captureTab() {
  chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
    if (!dataUrl) return;
    const now = new Date();
    const filename = `uncat_training_data/screenshot_${now.toISOString().replace(/[:.]/g, '-')}.png`;
    chrome.downloads.download({
      url: dataUrl,
      filename: filename
    });
  });
}
