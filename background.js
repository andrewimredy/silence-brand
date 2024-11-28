let isActive = false;
let intervalId = null;

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
let API_KEY;

// Import API key from config.js
fetch(chrome.runtime.getURL('config.js'))
  .then(response => response.text())
  .then(text => {
    eval(text);
    API_KEY = API_KEY;
  })
  .catch(error => console.error('Error loading API key:', error));


function startAnalyzing() {
  if (!intervalId) {
    intervalId = setInterval(analyzeContent, 15000); 
  }
}

function stopAnalyzing() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

async function analyzeContent() {
  try {
    const screenshotUrl = await captureScreenshot();
    await sendPngToChatGpt(screenshotUrl);
  } catch (error) {
    console.error("Error in analyzeContent:", error);
  }
}

function captureScreenshot() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.captureVisibleTab(tabs[0].windowId, {format: "png"}, function(dataUrl) {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(dataUrl);
          }
        });
      } else {
        reject(new Error("No active tab found"));
      }
    });
  });
}

async function sendPngToChatGpt(imageUrl) {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Look at this image. If it contains a video player showing a football broadcast, reply 'football'. if not, reply 'no'" },
              { "type": "image_url",
                "image_url": {
                  "url": imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      console.log(response.text)
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;
    const timestamp = Date.now();
    chrome.storage.local.set({analysisResult: result, lastEvaluationTime: timestamp});
    console.log("OpenAI response:", result);

    // Update tab audio based on the response
    if (result === 'no') {
        updateTabAudio(true); // Mute the tab
    } else if (result === 'football') {
        updateTabAudio(false); // Unmute the tab
    }

  } catch (error) {
    console.error("Error sending to OpenAI:", error);
  }
}

function updateTabAudio(shouldMute) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.update(tabs[0].id, {muted: shouldMute});
    }
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle") {
    isActive = !isActive;
    if (isActive) {
      startAnalyzing();
    } else {
      stopAnalyzing();
    }
    chrome.storage.local.set({isActive: isActive});
    sendResponse({isActive: isActive});
  }
});

chrome.storage.local.get(['isActive'], (result) => {
  isActive = result.isActive || false;
  if (isActive) {
    startAnalyzing();
  }
});
