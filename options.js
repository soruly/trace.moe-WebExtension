var saveOptions = (e) => {
  chrome.storage.local.set({
    autoSearch: document.querySelector('#autoSearch').checked
  })
}

var restoreOptions = () => {
  chrome.storage.local.get('autoSearch', (res) => {
    document.querySelector('#autoSearch').checked = res.autoSearch === undefined ? true : res.autoSearch
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
document.querySelector('#autoSearch').addEventListener('change', saveOptions)
