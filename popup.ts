
document.addEventListener('DOMContentLoaded', function() {
  let screenshotButton = document.getElementById('screenshotButton');
  let frame = document.getElementById('ssPlaceholder');
  let saveDiv = document.getElementById('saveBtnContainer');
  let saveAdBtn = document.getElementById('saveAd');
  let saveBroadcastBtn = document.getElementById('saveBroadcast');
  
  if (!(screenshotButton instanceof HTMLElement)) {
    alert('screenshotButton not found or invalid type');
    return;
  }
  if (!(frame instanceof Image)){
    alert("image frame not found");
    return;
  }
  if (!(saveDiv instanceof HTMLElement)){
    alert("save button container not found!")
    return;
  }



  screenshotButton.addEventListener("click", (event) => {
    //NB: chrome.tabs.update(tabId, {muted});

    let capturePromise = chrome.tabs.captureVisibleTab();
    capturePromise.then((b64) => {
        frame.src = b64;
        saveDiv.style.display = 'flex';
      })
      .catch(error => {
        console.error("Error capturing screenshot:", error);
        alert("Error capturing screenshot: " + error.message);
      });
    console.log(capturePromise);

  });

});
