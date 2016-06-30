var imageOnClick = function (info, tab) {
  chrome.tabs.create({
      url: 'https://whatanime.ga/?auto&url='+info.srcUrl
  });
};
chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  id: "search-on-whatanime.ga",
  title: "Search on whatanime.ga",
  contexts:["image"],
  onclick: imageOnClick
});