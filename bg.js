var imageOnClick = (info, tab) => {
  chrome.storage.local.get('autoSearch', (res) => {
    let searchURL = 'https://whatanime.ga/?auto&url=' + info.srcUrl
    if (res.autoSearch === false) {
      searchURL = 'https://whatanime.ga/?url=' + info.srcUrl
    }
    chrome.tabs.create({
      url: searchURL
    })
  })
}

chrome.contextMenus.create({
  id: 'search-on-whatanime.ga',
  title: 'Search on whatanime.ga',
  contexts: ['image'],
  onclick: imageOnClick
})
