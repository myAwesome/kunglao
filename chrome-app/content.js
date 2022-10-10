'use strict';

const parsingFunc = allinnerText => {
  allinnerText = allinnerText.replace(/\W/g, ' ');
  allinnerText = allinnerText.toLowerCase();
  const words = (allinnerText.trim().split(/[\s,]+/));
  return words.filter((v, i, a) => a.indexOf(v) === i);
};

const uniqWords = parsingFunc(document.body.innerText);
chrome.runtime.sendMessage(null, uniqWords);
chrome.runtime.onMessage.addListener(msg => {
  applyCss();
  allDescendants(document.body, msg);
  return Promise.resolve('Dummy response to keep the console quiet');
});

function applyCss() {
  const styles = '.kunglao { background-color: #fddbdb}';
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  styleSheet.setAttribute('type', 'text/css');
  document.head.appendChild(styleSheet);
}

function allDescendants(node, msg) {
  if (node.childNodes.length === 0) {
    if (node.nodeName === '#text') {
      const found = msg.some(r => node.textContent.toLowerCase()
        .includes(r.toLowerCase()));
      if (found) {
        let newHtml = node.textContent;
        const myRegexp = new RegExp(`\\b(${msg.map(r => r)
          .join('|')})\\b`, 'gi');
        newHtml = newHtml.replace(myRegexp, (match, odin) =>
          `<span class="kunglao">${odin}</span>`);
        const replacementNode = document.createElement('span');
        replacementNode.innerHTML = newHtml;
        node.parentNode.insertBefore(replacementNode, node);
        node.parentNode.removeChild(node);
      }
    }
  }

  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (node.nodeName === 'SCRIPT') {
      return;
    }
    allDescendants(child, msg);
  }
}

