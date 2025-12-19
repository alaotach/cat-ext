const mode = document.getElementById('mode');
const pos = document.getElementById('pos');
const meowSound = document.getElementById('meow-sound');
const typingSound = document.getElementById('typing-sound');

chrome.storage.local.get(
  ["mode", "pos", "sound", "typing-sound"],
  (data) => {
    mode.value = data.mode ?? "walk";
    pos.value = data.pos ?? "br";
    meowSound.checked = data.sound ?? true;
    typingSound.checked = data["typing-sound"] ?? true;
  }
);

function saveSettings() {
    chrome.storage.local.set({
        mode: mode.value,
        pos: pos.value,
        sound: meowSound.checked,
        "typing-sound": typingSound.checked
    });
}

mode.addEventListener('change', saveSettings);
pos.addEventListener('change', saveSettings);
meowSound.addEventListener('change', saveSettings);
typingSound.addEventListener('change', saveSettings);

