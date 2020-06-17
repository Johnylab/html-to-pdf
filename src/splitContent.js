import cloneNodeAsElement from './cloneNodeAsElement';
import splitHtml from './splitHtml';

const splitContent = (content) => {
  if (content.scrollHeight <= content.clientHeight) {
    return '';
  }

  const nextElement = document.createElement('div');
  let lastChild;
  let cloneChild;

  while (content.scrollHeight > content.clientHeight) {
    if (content.lastChild.clientHeight >= content.clientHeight) {
      break;
    }
    lastChild = content.lastChild;
    cloneChild = cloneNodeAsElement(lastChild);
    nextElement.insertAdjacentElement('afterbegin', cloneChild);
    lastChild.remove();
  }

  lastChild.innerHTML = '';
  content.appendChild(lastChild);

  let tokens = splitHtml(cloneChild);
  let lastToken = '';

  while (content.scrollHeight <= content.clientHeight) {
    const [newWord, ...newTokens] = tokens;
    tokens = newTokens;
    lastToken = newWord;
    lastChild.innerHTML += `${newWord} `;
    cloneChild.innerHTML = tokens.join(' ');
  }

  const lastSpace = lastChild.innerHTML.lastIndexOf(lastToken);
  lastChild.innerHTML = lastChild.innerHTML.slice(0, lastSpace);
  cloneChild.innerHTML = `${lastToken} ${cloneChild.innerHTML}`;
  if (!lastChild.innerHTML.trim()) {
    lastChild.remove();
  }

  return nextElement.innerHTML;
};

export default splitContent;
