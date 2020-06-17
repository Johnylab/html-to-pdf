const splitHtml = (el) => {
  const tokens = [];
  for (let node = el.firstChild; node; node = node.nextSibling) {
    if (node.nodeName.toLowerCase() === 'tbody') {
      [...node.children].forEach((k) => tokens.push(k.outerHTML));
    } else if (node.nodeType === Node.TEXT_NODE) {
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

const createPage = (pageHeader, pageFooter) => {
  const container = document.createElement('div');
  container.className = 'page';
  const content = document.createElement('div');
  content.className = 'page-content';
  const header = pageHeader.cloneNode(true);
  header.removeAttribute('id');
  const footer = pageFooter.cloneNode(true);
  footer.removeAttribute('id');

  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(footer);

  return {
    container,
    content,
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
    const page = createPage(header, footer);
    this.state.push(page);
    this.root.appendChild(page.container);
    return page;
  },
  render() {
    this.state = [];
    this.root.innerHTML = '';

    const summary = this.addPage();

    let page = this.addPage();

    this.sectionElements.forEach((section) => {
      let nextContent = page.append(section.innerHTML);
      while (nextContent) {
        page = pages.addPage();
        nextContent = page.append(nextContent);
      }
    });

    const nonPrintableChars = /[\000-\031]+/gi;

    const sections = pages.state.reduce((arr, { content }, index) => {
      const titles = [...content.querySelectorAll('.section-title')]
        .map((el) => el.textContent.trim().replace(nonPrintableChars, ''))
        .map((title) => ({ title, pageNum: index + 1 }));
      return [...arr, ...titles];
    }, []);

    summary.content.innerHTML = /* html */`
      <div class="summary">
        <table>
          <caption>SUMÁRIO</caption>
          ${sections.map(({ title, pageNum }) => /* html */`
            <tr>
              <td width="100%">${title}</td>
              <td width="1%">${pageNum}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;

    pages.state
      .map(({ container }) => container)
      .reduce((arr, container) => {
        const templates = [...container.children].filter((element) => (
          element.textContent.includes('{{pagina}}')
          || element.textContent.includes('{{totalPaginas}}')
        ));
        return [...arr, ...templates];
      }, [])
      .forEach((el, index) => {
        const { innerHTML } = el;
        // eslint-disable-next-line no-param-reassign
        el.innerHTML = innerHTML
          .replace('{{pagina}}', index + 1)
          .replace('{{totalPaginas}}', pages.state.length);
      });
  },
};

pages.init();
