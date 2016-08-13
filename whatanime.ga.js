if (!self.browser && self.chrome) {
  browser = chrome;
}

browser.runtime.sendMessage({
  type: "getImageDataURL"
}, (response) => {
  if (response) {
    document.querySelector("#autoSearch").checked = true;
    document.querySelector("#originalImage").src = response.imageDataURL;
  }
});