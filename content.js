const cat = document.createElement("div");
cat.id = "cat";
cat.style.backgroundImage = `url('${chrome.runtime.getURL("image.png")}')`;
document.body.appendChild(cat);