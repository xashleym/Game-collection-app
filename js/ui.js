// UI and tab logic microservice
const genreList = [
    'Action', 'Adventure', 'RPG', 'Shooter', 'Sports', 'Racing', 'Puzzle', 'Strategy', 'Fighting', 'Platformer', 'Simulation', 'Horror', 'Music'
  ];
  let activeTab = localStorage.getItem('activeTab') || 'collection';
  let sortOptions = JSON.parse(localStorage.getItem('sortOptions') || '{}') || {};
  
  function switchTab(tab) {
    activeTab = tab;
    localStorage.setItem('activeTab', tab);
    renderApp();
  }
  function setSort(tab, by, dir) {
    sortOptions[tab] = {by, dir};
    localStorage.setItem('sortOptions', JSON.stringify(sortOptions));
    renderApp();
  }
  function getSort(tab) {
    return sortOptions[tab] || {by: 'title', dir: 'asc'};
  }
  function sortGames(arr, by, dir) {
    let sorted = arr.slice();
    sorted.sort((a, b) => {
      let va = (a[by] || '').toLowerCase(), vb = (b[by] || '').toLowerCase();
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }
  
