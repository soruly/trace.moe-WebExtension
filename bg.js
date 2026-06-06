if (!self.browser && self.chrome) {
  browser = chrome;
}

// add context menu on image and video
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "search-on-trace.moe",
    title: browser.i18n.getMessage("contextMenuName"),
    contexts: ["image", "video"],
  });
});

let imageDataURL = null;
let targetSrc = null;
let targetCurrentTime = null;
let tempTab = null;
let newTab = null;

browser.runtime.onMessage.addListener((request, { tab }, sendResponse) => {
  if (newTab && tab.id === newTab.id && request.type === "getImageDataURL" && imageDataURL) {
    sendResponse({ imageDataURL });
    imageDataURL = null;
    newTab = null;
  }
  if (tempTab && tab.id === tempTab.id && request.type === "getTargetSrc" && targetSrc) {
    browser.tabs.sendMessage(
      tempTab.id,
      {
        action: "getSearchImage",
        srcUrl: targetSrc,
        currentTime: targetCurrentTime,
      },
      (response) => {
        browser.tabs.remove(tempTab.id).catch(() => {});
        tempTab = null;
        if (!response) return;
        if (response.searchImage) {
          search(response.searchImage);
        }
      },
    );
    targetSrc = null;
    targetCurrentTime = null;
  }
});

const search = async (dataURL) => {
  imageDataURL = dataURL;
  newTab = await browser.tabs.create({
    url: "https://trace.moe",
  });
};

browser.contextMenus.onClicked.addListener(async ({ srcUrl }, tab) => {
  if (!srcUrl) return;
  browser.tabs.sendMessage(
    tab.id,
    {
      action: "getSearchImage",
      srcUrl,
    },
    async (response) => {
      if (!response) return;
      if (response.searchImage) {
        search(response.searchImage);
        return;
      }
      targetSrc = srcUrl;
      targetCurrentTime = response.currentTime;
      tempTab = await browser.tabs.create({
        active: response.currentTime !== null,
        url: srcUrl,
      });
    },
  );
});
