const cat = document.createElement("div");
cat.id = "cat";

const bongo = document.createElement("div");
bongo.id = "bongo";
bongo.style.display = "none";

const leftPaw = document.createElement("div");
leftPaw.id = "left-paw";

const rightPaw = document.createElement("div");
rightPaw.id = "right-paw";

const mouseDevice = document.createElement("div");
mouseDevice.id = "mouse-device";

const meow = new Audio(chrome.runtime.getURL("meow.mp3"));
meow.volume = 0.6;
meow.loop = false;
let playing = false;

const typingAud = new Audio(chrome.runtime.getURL("typing.mp3"));
typingAud.volume = 0.3;
typingAud.loop = false;
let typing = false;

bongo.appendChild(leftPaw);
bongo.appendChild(rightPaw);
bongo.appendChild(mouseDevice);

document.body.appendChild(cat);
document.body.appendChild(bongo);

let pos = 0;
let dir = 1;
const speed = 1; //pixels per frame
let state = "walk";
let timer = null;
let mouseX = 0;
let mouseY = 0;
let mousetrack = false;

const sprites = {
  walk: chrome.runtime.getURL("cat_walk.png"),
  sit: chrome.runtime.getURL("cat_sit.png"),
  sleep: chrome.runtime.getURL("cat_sleep.png"),
  bongo: chrome.runtime.getURL("osu/mousebg.png"),
  mouse: chrome.runtime.getURL("osu/mouse.png"),
  leftPaw: chrome.runtime.getURL("osu/left.png"),
  rightPaw: chrome.runtime.getURL("osu/right.png"),
  upPaw: chrome.runtime.getURL("osu/up.png"),
  wavePaw: chrome.runtime.getURL("osu/wave.png")
};

let bongoT = null;
let prevState = "walk";

let leftState = false;
let rightState = false;
let lastWasLeft = false;


let settings = {
  mode: "walk",
  pos: "br",
  sound: true,
  "typing-sound": true,
  "bongo-typing": true
};

let moveInterval = null;

chrome.storage.local.get(settings, (data) => {
  settings = data;
  applySettings();
});

chrome.storage.onChanged.addListener((changes) => {
  for (let key in changes) {
    settings[key] = changes[key].newValue;
  }
  applySettings();
});

function startMoving() {
  if (moveInterval) return;
  moveInterval = setInterval(() => {
    if (settings.mode !== "walk") return;
    playMeow();
    if (nearCat()) {
      if (!mousetrack) {
        mousetrack = true;
        setState("sit");
      }
      const rect = cat.getBoundingClientRect();
      const catX = rect.left + rect.width / 2;
      dir = mouseX < catX ? -1 : 1;
      cat.style.transform = `scaleX(${dir})`;
      return;
    } else {
      if (mousetrack) {
        mousetrack = false;
        setState("walk");
      }
      cat.style.transform = `scaleX(${dir})`;
    }
    if (state !== "walk") return;
    pos += dir * speed;
    const screenW = window.innerWidth;
    if (pos + 80 >= screenW) {
      dir = -1;
      if (state !== "bongo") cat.style.transform = `scaleX(${dir})`;
      Idle();
    }
    if (pos <= 0) {
      dir = 1;
      if (state !== "bongo") cat.style.transform = `scaleX(${dir})`;
      Idle();
    }
    cat.style.left = pos + "px";
  }, 16);
}

function stopMoving() {
  if (moveInterval) {
    clearInterval(moveInterval);
    moveInterval = null;
  }
}



function setState(newState) { //manage state transitions and visuals
    if (newState !== "bongo" && state !== "bongo") {
        prevState = state;
    }
    state = newState;
    
    if (state === "bongo") {
        cat.style.width = "80px";
        cat.style.height = "48px";
        cat.style.backgroundImage = `url('${sprites.bongo}')`;
        bongo.style.display = "block";
        bongo.style.transform = `scaleX(${dir})`;
        const rect = cat.getBoundingClientRect();
        bongo.style.left = rect.left + "px";
        bongo.style.top = rect.top + "px";
        bongo.style.width = "80px";
        bongo.style.height = "48px";
        leftPaw.style.display = "block";
        rightPaw.style.display = "block";
        leftPaw.style.backgroundImage = `url('${sprites.upPaw}')`;
        rightPaw.style.backgroundImage = `url('${sprites.upPaw}')`;
        mouseDevice.style.backgroundImage = `url('${sprites.mouse}')`;
        mouseDevice.style.display = "block";
    } else {
        cat.style.backgroundImage = `url('${sprites[state]}')`;
        cat.style.width = "80px";
        cat.style.height = "80px";
        bongo.style.display = "none";
        leftPaw.style.display = "none";
        rightPaw.style.display = "none";
        mouseDevice.style.display = "none";
    }
    
    if (timer) clearTimeout(timer);

    if (state === "walk") { 
        timer = setTimeout(() => setState("sit"), 10000);
    } else if (state === "sit") {
        timer = setTimeout(() => setState("sleep"), 5000);
    } else if (state === "sleep") {
        timer = setTimeout(() => setState("walk"), 8000);
    }
}

function Idle() {
  if (Math.random() < 0.4) {
    setState(Math.random() < 0.5 ? "sit" : "sleep");
  }
}

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

document.addEventListener("keydown", (e) => {
  if (settings.mode === "bongo") {
    if (lastWasLeft) {
      rightState = true;
      rightPaw.style.backgroundImage = `url('${sprites.rightPaw}')`;
      lastWasLeft = false;
    } else {
      leftState = true;
      leftPaw.style.backgroundImage = `url('${sprites.leftPaw}')`;
      lastWasLeft = true;
    }
    if (!e.repeat && settings["typing-sound"]) {
      typingAud.currentTime = 0;
      typingAud.play().catch(() => {});
      setTimeout(() => {
        typingAud.pause();
        typingAud.currentTime = 0;
      }, 150);
    }
    return;
  }
  
  if (!settings["bongo-typing"]) {
    return;
  }
  
  if (state !== "bongo") {
    prevState = state;
    setState("bongo");
  }
  // handling paw movement
  if (lastWasLeft) {
    rightState = true;
    rightPaw.style.backgroundImage = `url('${sprites.rightPaw}')`;
    lastWasLeft = false;
  } else {
    leftState = true;
    leftPaw.style.backgroundImage = `url('${sprites.leftPaw}')`;
    lastWasLeft = true;
  }
  if (!e.repeat && settings["typing-sound"]) {
    typingAud.currentTime = 0;
    typingAud.play().catch(() => {});

    setTimeout(() => {
      typingAud.pause();
      typingAud.currentTime = 0;
    }, 150);
  
  }
  if (bongoT) clearTimeout(bongoT);
  bongoT = setTimeout(() => {
    setState(prevState);
  }, 500);
}, true);



document.addEventListener("keyup", (e) => { // reset paw positions to up paw
  leftState = false;
  rightState = false;
  
  if (state === "bongo") {
    leftPaw.style.backgroundImage = `url('${sprites.upPaw}')`;
    rightPaw.style.backgroundImage = `url('${sprites.upPaw}')`;
  }
}, true);

function nearCat() { // if mouse is near cat it will look at it hehe cutee
    const rect = cat.getBoundingClientRect();
    const catX = rect.left + rect.width / 2;
    const catY = rect.top + rect.height / 2;
    const dx = mouseX - catX;
    const dy = mouseY - catY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < 3.14*3.14*3.14*3.14;
}


function playMeow() {
    if (!settings.sound) {
        if (playing) {
            meow.pause();
            meow.currentTime = 0;
            playing = false;
        }
        return;
    }
    if (nearCat() && !playing) {
        meow.currentTime = 0;
        meow.play();
        playing = true;
    }
    if (!nearCat() && playing) {
        meow.pause();
        meow.currentTime = 0;
        playing = false;
    }
}



function applySettings() {
  cat.style.bottom = "auto";
  cat.style.top = "auto";
  cat.style.left = "auto";
  cat.style.right = "auto";
  const positions = {
    bl: { bottom: "20px", left: "20px" },
    br: { bottom: "20px", right: "20px" },
    tl: { top: "20px", left: "20px" },
    tr: { top: "20px", right: "20px" }
  };
  const p = positions[settings.pos] || positions.br;
  Object.assign(cat.style, p);  
  if (settings.mode === "walk") {
    if (settings.pos === "br" || settings.pos === "tr") {
      pos = window.innerWidth - 100;
      dir = -1;
    } else {
      pos = 0;
      dir = 1;
    }
    cat.style.left = pos + "px";
  }
  
  // Apply mode
  if (timer) clearTimeout(timer);
  if (bongoT) clearTimeout(bongoT);
  
  switch (settings.mode) {
    case "walk":
      setState("walk");
      if (!moveInterval) startMoving();
      break;
    case "idle":
      if (moveInterval) stopMoving();
      setState(Math.random() < 0.5 ? "sit" : "sleep");
      break;
    case "sleep":
      if (moveInterval) stopMoving();
      setState("sleep");
      break;
    case "bongo":
      if (moveInterval) stopMoving();
      setState("bongo");
      break;
  }
}




setState("walk");
startMoving();