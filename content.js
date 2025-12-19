const cat = document.createElement("div");
cat.id = "cat";
document.body.appendChild(cat);

let pos = 0;
let dir = 1;
const speed = 1; //pixels per frame
let state = "walk";
let timer = null;

const sprites = {
  walk: chrome.runtime.getURL("cat_walk.png"),
  sit: chrome.runtime.getURL("cat_sit.png"),
  sleep: chrome.runtime.getURL("cat_sleep.png")
};

function move() {
    setInterval(() => {
        if (state !== "walk") return;
        pos += dir * speed;
        const screenW = window.innerWidth;
        if (pos + 80 >= screenW) {
        dir = -1;
        cat.style.transform = "scaleX(-1)";
        Idle();
        }
        if ( pos <= 0) {
            dir = 1;
            cat.style.transform = "scaleX(1)";
            Idle();
        }
        cat.style.left = pos + "px";
    }, 16);
}

function setState(newState) {
    state = newState;
    cat.style.backgroundImage = `url('${sprites[state]}')`;
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

setState("walk");
move();