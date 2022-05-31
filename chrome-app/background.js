chrome.runtime.onInstalled.addListener((details) => {

  chrome.contextMenus.create({
    title: "Send to ignore",
    id: "send_to_ignore",
    contexts: ["page", "selection"]
  })
  chrome.contextMenus.onClicked.addListener((event) => {
    if (event.menuItemId === "send_to_ignore") {
      console.log("send_to_ignore", event.selectionText)

      fetch(`http://localhost:8080/ignore`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({word:event.selectionText})})
        .then(res => res.json())
        .then(data => {
          console.log(data)
        })

    }
  })
})

chrome.runtime.onMessage.addListener((msg,sender,sendResponse) => {

  fetch(`http://localhost:8080/filter-unknown`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(msg)})
    .then(res => res.json())
    .then(data => {
      chrome.tabs.sendMessage(sender.tab.id, data)
    })
})

