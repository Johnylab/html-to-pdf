import createPage from './createPage';

const pages = {
  init() {
    this.root = document.querySelector('#app');
    this.mainHeader = this.root.querySelector('#main-header');
    this.mainFooter = this.root.querySelector('#main-footer');
    this.pageHeader = this.root.querySelector('#page-header');
    this.pageFooter = this.root.querySelector('#page-footer');
    this.firstPage = this.root.querySelector('#cover');
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

    const cover = this.addPage();
    cover.content.innerHTML = this.firstPage.innerHTML;

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

    const summary = cover.content.querySelector('#sumario');
    summary.innerHTML += `
      <table>
        ${sections.map(({ title, pageNum }) => /* html */`
          <tr>
            <td width="100%">${title}</td>
            <td width="1%">${pageNum}</td>
          </tr>
        `).join('')}
      </table>
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

export default pages;
