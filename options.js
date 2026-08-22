const box = document.getElementById('aliases');
const status = document.getElementById('status');

chrome.storage.sync.get({ aliases: [] }, cfg => {
  box.value = cfg.aliases.join('\n');
});

document.getElementById('save').addEventListener('click', () => {
  const aliases = box.value.split('\n').map(s => s.trim()).filter(Boolean);
  chrome.storage.sync.set({ aliases }, () => {
    status.textContent = 'Saved — reload the Scholar page.';
    setTimeout(() => (status.textContent = ''), 2500);
  });
});
