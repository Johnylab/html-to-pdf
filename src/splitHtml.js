const splitHtml = (el) => {
  const tokens = [];

  for (let node = el.firstChild; node; node = node.nextSibling) {
    if (node.nodeName.toLowerCase() === 'tbody') {
      const rows = [...node.children].map(({ outerHTML }) => outerHTML);
      tokens.push(...rows);
    } else if (node.nodeType === Node.TEXT_NODE) {
      tokens.push(...node.textContent.trim().split(' '));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      tokens.push(node.outerHTML);
    }
  }

  return tokens;
};

export default splitHtml;
