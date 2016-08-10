if (!self.browser && self.chrome) {
  browser = chrome;
}

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: 'search-on-whatanime.ga',
    title: 'Search on whatanime.ga',
    contexts: ['image']
  })
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "search-on-whatanime.ga") {
    return;
  }

  browser.storage.local.get('autoSearch', (res) => {
    let searchURL = 'https://whatanime.ga/?auto&url=' + info.srcUrl
    if (res.autoSearch === false) {
      searchURL = 'https://whatanime.ga/?url=' + info.srcUrl
    }
    browser.tabs.create({
      url: searchURL
    })
  })
});