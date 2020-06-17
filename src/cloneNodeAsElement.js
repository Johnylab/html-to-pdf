const cloneNodeAsElement = (node) => {
  if (node instanceof Element) {
    return node.cloneNode(true);
  }
  const cloneContainer = document.createElement('span');
  cloneContainer.innerHTML = node.textContent;
  return cloneContainer;
};

export default cloneNodeAsElement;
