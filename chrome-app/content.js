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
  if (msg.error) {
    showErrorPopup();
  } else {
    applyCss();
    allDescendants(document.body, msg);
    return Promise.resolve('Dummy response to keep the console quiet');
  }

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


function showErrorPopup() {
  const html = `
<style>
        #overlay {
            display: none;
            position: absolute;
            top: 0;
            bottom: 0;
            background: #999;
            width: 100%;
            height: 100%;
            opacity: 0.8;
            z-index: 100;
        }

        #popup {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            background: #f99;
            width: 500px;
            height: 100px;
            margin-left: -250px; 
            margin-top: -250px; 
            z-index: 200;
            border-radius: 10px;
            padding: 10px;
        }
        #popupclose {
            float: right;
            padding: 10px;
            cursor: pointer;
        }
        .popupcontent {
            padding: 10px;
        }
    </style>
<div id="overlay"></div>
<div id="popup">
    <div class="popupcontrols">
        <span id="popupclose">X</span>
    </div>
    <div class="popupcontent">
        Server stopped
    </div>
</div>`;
  document.body.innerHTML += html;
  const closePopup = document.getElementById('popupclose');
  const overlay = document.getElementById('overlay');
  const popup = document.getElementById('popup');

  const showPopup = () => {
    overlay.style.display = 'block';
    popup.style.display = 'block';
  };

  closePopup.onclick = function() {
    overlay.style.display = 'none';
    popup.style.display = 'none';
  };
  showPopup();
}

