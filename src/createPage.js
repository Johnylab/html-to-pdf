import splitContent from './splitContent';

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

export default createPage;
