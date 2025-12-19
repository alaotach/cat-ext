const mode = document.getElementById('mode');
const pos = document.getElementById('pos');
const meowSound = document.getElementById('meow-sound');
const typingSound = document.getElementById('typing-sound');
const bongoTyping = document.getElementById('bongo-typing');

chrome.storage.local.get(
  ["mode", "pos", "sound", "typing-sound", "bongo-typing"],
  (data) => {
    mode.value = data.mode ?? "walk";
    pos.value = data.pos ?? "br";
    meowSound.checked = data.sound !== undefined ? data.sound : true;
    typingSound.checked = data["typing-sound"] !== undefined ? data["typing-sound"] : true;
    bongoTyping.checked = data["bongo-typing"] !== undefined ? data["bongo-typing"] : true;
    disableBongo();
  }
);

function saveSettings() {
    chrome.storage.local.set({
        mode: mode.value,
        pos: pos.value,
        sound: meowSound.checked,
        "typing-sound": typingSound.checked,
        "bongo-typing": bongoTyping.checked
    });
}

mode.addEventListener('change', saveSettings);
pos.addEventListener('change', saveSettings);
meowSound.addEventListener('change', saveSettings);
typingSound.addEventListener('change', () => {saveSettings(); disableBongo();});
bongoTyping.addEventListener('change', saveSettings);

const bongoSetting = document.getElementById("bongo-setting");

function disableBongo() {
  if (!typingSound.checked) {
    bongoSetting.classList.add("disabled");
    bongoTyping.disabled = true;
  } else {
    bongoSetting.classList.remove("disabled");
    bongoTyping.disabled = false;
  }
}