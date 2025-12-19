const cat = document.createElement("div");
cat.id = "cat";
cat.style.backgroundImage = `url('${chrome.runtime.getURL("image.png")}')`;
document.body.appendChild(cat);

let pos = 0;
let dir = 1;
const speed = 1; //pixels per frame

function walk() {
    setInterval(() => {
        pos += dir * speed;
        const screenW = window.innerWidth;
        if (pos + 80 >= screenW) {
        dir = -1;
        cat.style.transform = "scaleX(-1)";
        }
        if ( pos <= 0) {
            dir = 1;
            cat.style.transform = "scaleX(1)";
        }
        cat.style.left = pos + "px";
    }, 16);
}
walk();