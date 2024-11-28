document.addEventListener('DOMContentLoaded', function() {
  let toggleButton = document.getElementById('toggleButton');
  let resultDisplay = document.createElement('div');
  resultDisplay.id = 'resultDisplay';
  let timeDisplay = document.createElement('div');
  timeDisplay.id = 'timeDisplay';
  document.body.appendChild(resultDisplay);
  document.body.appendChild(timeDisplay);

  let timeInterval;

  function updateButtonState(isActive) {
    toggleButton.textContent = isActive ? 'ON' : 'OFF';
    toggleButton.style.backgroundColor = isActive ? '#4CAF50' : '#F44336';
  }

  function updateResultDisplay(result) {
    resultDisplay.textContent = result || 'No analysis yet';
  }

  function updateTimeDisplay(lastEvaluationTime) {
    if (!lastEvaluationTime) {
      timeDisplay.textContent = 'No evaluation yet';
      return;
    }
    
    clearInterval(timeInterval);
    
    function updateTime() {
      const now = Date.now();
      const diff = Math.floor((now - lastEvaluationTime) / 1000) % 15;
      timeDisplay.textContent = `${diff}s ago`;
    }
    
    updateTime();
    timeInterval = setInterval(updateTime, 1000);
  }

  chrome.storage.local.get(['isActive', 'analysisResult', 'lastEvaluationTime'], (result) => {
    updateButtonState(result.isActive || false);
    updateResultDisplay(result.analysisResult);
    updateTimeDisplay(result.lastEvaluationTime);
  });

  toggleButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "toggle"}, function(response) {
      updateButtonState(response.isActive);
    });
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.analysisResult) {
      updateResultDisplay(changes.analysisResult.newValue);
    }
    if (changes.lastEvaluationTime) {
      updateTimeDisplay(changes.lastEvaluationTime.newValue);
    }
  });
});
