
// 备选： ⛏️
chrome.devtools.panels.elements.createSidebarPane('⚙️ Easy Select', function (sidebar) {
  // sidebar initialization code here
  sidebar.setPage('devtools-panel.html')
  // sidebar.onShown.addListener(handleShown)
  // sidebar.onHidden.addListener(handleHidden)
})

// browser.devtools.panels.create(
//   "Easy Select",                      // title
//   "",                // icon
//   "devtools-panel.html"      // content
// ).then((newPanel) => {
//   newPanel.onShown.addListener(handleShown);
//   newPanel.onHidden.addListener(handleHidden);
// });
