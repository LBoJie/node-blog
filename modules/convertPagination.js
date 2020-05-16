const convertPagination = (articles, currentPage) => {
  const totalResult = articles.length - 1;
  const perpage = 5;
  const pageTotal = Math.ceil(articles.length / perpage);
  const min = perpage * currentPage - perpage;
  const max = perpage * currentPage - 1;
  const data = [];
  for (let i = min; i <= max; i += 1) {
    if (i > totalResult) {
      break;
    }
    data.push(articles[i]);
  }
  const page = {
    pageTotal,
    currentPage,
    hasPre: currentPage > 1,
    hasNext: currentPage < pageTotal,
  };
  return {
    page,
    data,
  };
};

module.exports = convertPagination;
