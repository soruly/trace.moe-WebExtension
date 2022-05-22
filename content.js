if (!self.browser && self.chrome) {
  browser = chrome;
}

const toDataURL = (element) => {
  try {
    const canvas = document.createElement("canvas");
    canvas.crossOrigin = "anonymous";
    canvas.height = 720;
    if (element instanceof HTMLVideoElement) {
      canvas.width = (element.videoWidth / element.videoHeight) * canvas.height;
    } else {
      canvas.width = (element.width / element.height) * canvas.height;
    }
    canvas.getContext("2d").drawImage(element, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch (err) {
    return null;
  }
};

browser.runtime.sendMessage({ type: "getTargetSrc" });

browser.runtime.onMessage.addListener(({ action, srcUrl, currentTime }, sender, sendResponse) => {
  if (action === "getSearchImage" && srcUrl) {
    //assume only one element match the src
    const element = Array.from(document.querySelectorAll("img, video")).find(
      (e) => e.currentSrc === srcUrl
    );
    if (!element) return alert("Fail to get search image");
    if (currentTime && element instanceof HTMLVideoElement) {
      element.pause();
      element.volume = 0;
      element.currentTime = currentTime;
      element.oncanplay = () => {
        const searchImage = toDataURL(element);
        if (searchImage) {
          sendResponse({ searchImage });
        }
      };
    } else {
      const searchImage = toDataURL(element);
      if (searchImage) {
        sendResponse({ searchImage });
      } else {
        sendResponse({
          currentTime: element instanceof HTMLVideoElement ? element.currentTime : null,
        });
      }
    }
  }
  return true;
});
