const data1 = [...document.getElementsByClassName("ts-main-image curdown")];
const data2 = [...document.getElementsByClassName("ts-main-image")];
let data = [...new Set(data1.concat(data2))];
data.sort((a, b) => {
  return a.getAttribute("data-index") - b.getAttribute("data-index");
});
let images = data.map((item) => item.src);

chrome.runtime.sendMessage(
  { action: "translateText", images: images },
  (response) => {
    console.log(response.translatedText); // logs the translated text
  }
);
