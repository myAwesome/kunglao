chrome.runtime.onInstalled.addListener(() => {

  chrome.contextMenus.create({
    title: "Send %s to ignore",
    id: "send_to_ignore",
    contexts: ["page", "selection"]
  })

})

chrome.contextMenus.onClicked.addListener((event) => {
  console.log(event)
  console.log(event.menuItemId)
  if (event.menuItemId === "send_to_ignore") {
    fetch(`http://localhost:8080/ignore`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({word:event.selectionText})})
      .then(res => res.json())
      .then(data => { console.log(data) })
  }
})

chrome.runtime.onMessage.addListener((msg,sender) => {

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

  return Promise.resolve("Dummy response to keep the console quiet");
})