/** @param {string} company */
export function researchLinks(company) {
  const q = encodeURIComponent(company);
  return [
    { label: 'LinkedIn', url: `https://www.linkedin.com/search/results/companies/?keywords=${q}` },
    { label: 'Glassdoor reviews', url: `https://www.glassdoor.com/Search/results.htm?keyword=${q}` },
    { label: 'Recent news', url: `https://news.google.com/search?q=${q}` },
    { label: 'Salaries (Levels.fyi)', url: `https://www.levels.fyi/search/?searchText=${q}` },
  ];
}
