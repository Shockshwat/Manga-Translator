chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translateText") {
    let translatedImages = translateImages(request.images);
    sendResponse({ translatedText: translatedImages });
  }
});

import cv from "opencv.js";
import Tesseract from "tesseract.js";
import axios from "axios";
async function translateImages(images) {
  for (let i = 0; i < images.length; i++) {
    let image = images[i];

    // Convert image to OpenCV Mat
    let src = cv.imread(image);

    // Convert to grayscale and apply threshold to get binary image
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    let binary = new cv.Mat();
    cv.threshold(gray, binary, 127, 255, cv.THRESH_BINARY);

    // Find contours (dialogue boxes)
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(
      binary,
      contours,
      hierarchy,
      cv.RETR_CCOMP,
      cv.CHAIN_APPROX_SIMPLE
    );

    // Fill contours with white color and place translated text
    for (let j = 0; j < contours.size(); j++) {
      let contour = contours.get(j);

      // Fill contour with white color
      cv.drawContours(src, contours, j, [255, 255, 255, 255], -1);

      // Extract text from contour
      let result = await Tesseract.recognize(contour, "jpn");
      let text = result.data.text;

      // Translate text
      let response = await axios.post(
        "https://translation.googleapis.com/language/translate/v2",
        {
          q: text,
          source: "ja",
          target: "en",
          format: "text",
          key: "YOUR_GOOGLE_TRANSLATE_API_KEY",
        }
      );
      let translatedText = response.data.data.translations[0].translatedText;

      // Get bounding box of contour
      let rect = cv.boundingRect(contour);

      // Draw translated text onto image
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      ctx.drawImage(src, 0, 0);
      ctx.fillStyle = "black";
      ctx.font = "20px Arial";
      ctx.fillText(translatedText, rect.x, rect.y);

      // Replace original image with new image
      image.src = canvas.toDataURL("image/png");
    }

    // Clean up
    src.delete();
    gray.delete();
    binary.delete();
    contours.delete();
    hierarchy.delete();
  }
}
