console.log("Hello from content.js!");
const data1 = [...document.getElementsByClassName("ts-main-image curdown")];
const data2 = [...document.getElementsByClassName("ts-main-image")];
let data = [...new Set(data1.concat(data2))];
data.sort((a, b) => {
  return a.getAttribute("data-index") - b.getAttribute("data-index");
});
let images = data.map((item) => item.src);
console.log(images);
