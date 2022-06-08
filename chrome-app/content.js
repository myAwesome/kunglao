console.log("CONTENT SCRIPT");

const parsingFunc = (allinnerText) =>{
  allinnerText = allinnerText.replace(/\W/g, ' ');
  allinnerText = allinnerText.toLowerCase()
  const words = (allinnerText.trim().split(/[\s,]+/));
  return words.filter((v, i, a) => a.indexOf(v) === i);
}

const uniqWords = parsingFunc(document.body.innerText);
chrome.runtime.sendMessage(null, uniqWords)
chrome.runtime.onMessage.addListener((msg) => {
  allDescendants(document.body,msg);
  return Promise.resolve("Dummy response to keep the console quiet");
});

function allDescendants (node, msg) {
  if (node.childNodes.length === 0){
      if(node.nodeName ==='#text'){
        const found = msg.some(r=> node.textContent.toLowerCase().includes(r.toLowerCase()))
        if(found){
          let newHtml = node.textContent;
          const myRegexp = new RegExp(`\\b(${msg.map(r => r).join('|')})\\b`, 'gi')
          newHtml = newHtml.replace(myRegexp, (match, odin)=>{
            return `<span style="background-color: #fab1b1">${odin}</span>`
          })
          const replacementNode = document.createElement('span')
          replacementNode.innerHTML = newHtml
          node.parentNode.insertBefore(replacementNode, node);
          node.parentNode.removeChild(node);
        }
      }
  }

  for (var i = 0; i < node.childNodes.length; i++) {
    var child = node.childNodes[i];
    if (node.nodeName === 'SCRIPT'){
      return;
    }
    allDescendants(child,msg);
  }
}

