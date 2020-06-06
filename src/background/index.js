/* eslint-disable no-console */

let genericOnClick = (info, tab) => {
    // console.log(111, e, a, b)
    console.log(22222)
    chrome.tabs.sendMessage(tab.id, "getClickedEl", function(clickedEl) {
        console.log(111, clickedEl.value);
    });
}

chrome.contextMenus.create({
    type: 'normal',
    title: '获取元素',
    id: 'menuDemo',
    contexts: ['all'],
    onclick: genericOnClick
}, function () {
    console.log('contextMenus are create.');
});
