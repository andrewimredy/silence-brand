
document.addEventListener('DOMContentLoaded', function() {
  let screenshotButton = document.getElementById('screenshotButton');
  
  if (!(screenshotButton instanceof HTMLElement)) {
    alert('screenshotButton not found or invalid type');
    return;
  }

  screenshotButton.addEventListener("click", (event) => {
    //NB: chrome.tabs.update(tabId, {muted});

    let capturePromise = chrome.tabs.captureVisibleTab();
    capturePromise.then(dataUrl => {
      alert(dataUrl);
    })
      .catch(error => {
        console.error("Error capturing screenshot:", error);
        alert("Error capturing screenshot: " + error.message);
      });
    console.log(capturePromise);

  });

});
