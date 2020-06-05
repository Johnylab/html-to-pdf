const splitHtml = (el) => {
  const tokens = [];
  for (let node = el.firstChild; node; node = node.nextSibling) {
    if (node.nodeType === Node.TEXT_NODE) {
      tokens.push(...node.textContent.trim().split(' '));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      tokens.push(node.outerHTML);
    }
  }
  return tokens;
};

const cloneNodeAsElement = (node) => {
  if (node instanceof Element) {
    return node.cloneNode(true);
  }
  const cloneContainer = document.createElement('span');
  cloneContainer.innerHTML = node.textContent;
  return cloneContainer;
};

const splitContent = (content) => {
  if (content.scrollHeight <= content.clientHeight) {
    return '';
  }

  const nextElement = document.createElement('div');
  let lastChild;
  let cloneChild;

  while (content.scrollHeight > content.clientHeight) {
    lastChild = content.lastChild;
    lastChild.remove();
    cloneChild = cloneNodeAsElement(lastChild);
    nextElement.insertAdjacentElement('afterbegin', cloneChild);
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

const createPage = (pageNum, header, footer) => {
  const container = document.createElement('div');
  container.className = 'page';
  const content = document.createElement('div');
  content.className = 'page-content';
  container.appendChild(header.cloneNode(true));
  container.appendChild(content);
  container.appendChild(footer.cloneNode(true));

  return {
    container,
    content,
    pageNum,
    append: (html) => {
      content.innerHTML += html.trim();
      return splitContent(content);
    },
  };
};

const pages = {
  init() {
    this.root = document.querySelector('#app');
    this.mainHeader = this.root.querySelector('#main-header');
    this.mainFooter = this.root.querySelector('#main-footer');
    this.pageHeader = this.root.querySelector('#page-header');
    this.pageFooter = this.root.querySelector('#page-footer');
    this.sectionElements = [...this.root.querySelectorAll('.doc-section')];
    this.render();
  },
  get first() {
    return this.state[0];
  },
  get last() {
    const lastIndex = this.state.length - 1;
    return this.state[lastIndex];
  },
  addPage() {
    const pageNum = this.state.length;
    const header = pageNum ? this.pageHeader : this.mainHeader;
    const footer = pageNum ? this.pageFooter : this.mainFooter;
    const page = createPage(pageNum + 1, header, footer);
    this.state.push(page);
    this.root.appendChild(page.container);
    return page;
  },
  render() {
    this.state = [];
    this.root.innerHTML = '';

    const summary = this.addPage();

    let page = this.addPage();

    const sections = this.sectionElements.map((section) => {
      const titleElement = section.querySelector('.section-title');
      const title = titleElement && titleElement.textContent.trim();
      const { pageNum } = page;
      const nextContent = page.append(section.innerHTML);

      if (nextContent) {
        page = pages.addPage();
        page.append(nextContent);
      }

      return { title, pageNum };
    });

    summary.content.innerHTML = /* html */`
<ul style="margin: 0; padding: 0;">
  ${sections.map(({ title, pageNum }) => /* html */`
    <li style="display: flex;">
      <span>${title}</span>
      <span style="flex: 1 1 auto;"></span>
      <span>${pageNum}</span>
    </li>
  `).join('')}
</ul>
    `;
  },
};

pages.init();

const copyToClipboard = (str) => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

window.addEventListener('keypress', (e) => {
  const charCode = e.keyCode || e.which;

  if (String.fromCharCode(charCode) === 'p') {
    const root = document.documentElement.cloneNode(true);
    [...root.querySelectorAll('script, link')].forEach((s) => s.remove());
    copyToClipboard(root.innerHTML);
    // eslint-disable-next-line no-alert
    alert('Código copiado para a área de transferência.');
  }
});
