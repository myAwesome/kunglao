const parsingFunc = (allinnerText) =>{
  allinnerText = allinnerText.replace(/\W/g, ' ');
  allinnerText = allinnerText.toLowerCase()
  const words = (allinnerText.trim().split(/[\s,]+/));
  return words.filter((v, i, a) => a.indexOf(v) === i);
}


module.exports = parsingFunc;
