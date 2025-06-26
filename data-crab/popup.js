document.getElementById('start').onclick = () => {
  document.getElementById('start').style.backgroundColor = 'green';
  const seconds = parseInt(document.getElementById('interval').value);
  chrome.runtime.sendMessage({ type: 'start', interval: seconds });
};

document.getElementById('stop').onclick = () => {
  document.getElementById('start').style.backgroundColor = '';
  chrome.runtime.sendMessage({ type: 'stop' });
};
