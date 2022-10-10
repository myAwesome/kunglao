'use strict';

const HIGHLIGHT = 'kunglao';

const parsingFunc1 = allinnerText => {
  allinnerText = allinnerText.replace(/\W/g, ' ');
  allinnerText = allinnerText.toLowerCase();
  const words = (allinnerText.trim().split(/[\s,]+/));
  return words.filter((v, i, a) => a.indexOf(v) === i);
};

const clearHighlight = async selectionText => {
  const currentTab = await getCurrentTab();
  await chrome.scripting.executeScript(
    {
      target: { tabId: currentTab.id },
      func: (selectionText, HIGHLIGHT) => {
        const selectedWords = selectionText.map(w => w.toLowerCase());
        const allHighlightedNodes =
          Array.from(document.getElementsByClassName(HIGHLIGHT));
        for (const node of allHighlightedNodes) {
          if (selectedWords.includes(node.textContent.toLowerCase())) {
            node.classList.remove(HIGHLIGHT);
          }
        }
      },
      args: [selectionText, HIGHLIGHT]
    });

};

const sendKnow = selectionText => {
  fetch('http://localhost:8080/know', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ words: selectionText }) })
    .then(res => res.json());
};

const sendIgnore = selectionText => {
  fetch('http://localhost:8080/ignore', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ words: selectionText }) })
    .then(res => res.json());
};

chrome.runtime.onInstalled.addListener(() => {

  chrome.contextMenus.create({
    title: 'Send %s to ignore',
    id: 'send_to_ignore',
    contexts: ['page', 'selection']
  });

  chrome.contextMenus.create({
    title: 'Send %s to know',
    id: 'send_to_know',
    contexts: ['page', 'selection']
  });

});

chrome.contextMenus.onClicked.addListener(event => {
  const listOfUniqWords = parsingFunc1(event.selectionText);
  if (event.menuItemId === 'send_to_ignore') {
    sendIgnore(listOfUniqWords);
    clearHighlight(listOfUniqWords);
  }

  if (event.menuItemId === 'send_to_know') {
    sendKnow(listOfUniqWords);
    clearHighlight(listOfUniqWords);
  }
});



chrome.runtime.onMessage.addListener((msg, sender) => {
  fetch('http://localhost:8080/filter-unknown', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(msg) })
    .then(res => res.json())
    .then(data => {
      chrome.tabs.sendMessage(sender.tab.id, data);
    });

  return Promise.resolve('Dummy response to keep the console quiet');
});

chrome.action.onClicked.addListener(
  tab => {
    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, files: ['content.js'] });
  }
);

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

chrome.commands.onCommand.addListener(async command => {
  if (command === 'Ctrl+K') {
    const currentTab = await getCurrentTab();
    let result;
    try {
      [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        function: () => getSelection().toString(),
      });
      const listOfUniqWords = parsingFunc1(result);
      sendKnow(listOfUniqWords);
      clearHighlight(listOfUniqWords);
    } catch (e) {
      return;
    }
  }

  if (command === 'Ctrl+I') {
    const currentTab = await getCurrentTab();
    let result;
    try {
      [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        function: () => getSelection().toString(),
      });
      const listOfUniqWords = parsingFunc1(result);
      sendIgnore(listOfUniqWords);
      clearHighlight(listOfUniqWords);
    } catch (e) {
      return;
    }
  }

});
