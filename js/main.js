// Entry point
let currentUser = null;
localStorage.removeItem('currentUser');

function renderLogin(errorMsg = '') {
  document.getElementById('app').innerHTML = `
    <h1 class="center">Game Collection Manager</h1>
    <div class="section">
      <h2>Login</h2>
      <div class="error">${errorMsg}</div>
      <input id="login-username" placeholder="Username"><br>
      <input id="login-password" type="password" placeholder="Password"><br>
      <button onclick="doLogin()">Login</button>
      <button onclick="renderRegister()">Register</button>
    </div>
  `;
}
function renderRegister(errorMsg = '') {
  document.getElementById('app').innerHTML = `
    <h1 class="center">Game Collection Manager</h1>
    <div class="section">
      <h2>Register</h2>
      <div class="error">${errorMsg}</div>
      <input id="reg-username" placeholder="Username"><br>
      <input id="reg-password" type="password" placeholder="Password"><br>
      <input id="reg-password2" type="password" placeholder="Confirm Password"><br>
      <button onclick="doRegister()">Register</button>
      <button onclick="renderLogin()">Back to Login</button>
    </div>
  `;
}
function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const users = getUsers();
  if (!users[username]) {
    renderLogin('User does not exist.');
    return;
  }
  if (users[username] !== password) {
    renderLogin('Incorrect password.');
    return;
  }
  login(username);
}
function doRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const password2 = document.getElementById('reg-password2').value;
  if (!username || !password) {
    renderRegister('Please fill all fields.');
    return;
  }
  if (password !== password2) {
    renderRegister('Passwords do not match.');
    return;
  }
  const users = getUsers();
  if (users[username]) {
    renderRegister('Username already exists.');
    return;
  }
  users[username] = password;
  setUsers(users);
  setUserData(username, {games: [], wishlist: [], log: []});
  login(username);
}

function login(username) {
  currentUser = username;
  renderApp();
}
window.login = login;


function renderApp() {
  if (!currentUser) { renderLogin(); return; }
  let data = getUserData(currentUser);
  const searchCollection = (document.getElementById('search-collection') || {value:''}).value.trim().toLowerCase();
  const searchWishlist = (document.getElementById('search-wishlist') || {value:''}).value.trim().toLowerCase();
  let games = data.games.map((g, i) => ({...g, i}));
  let wishlist = data.wishlist.map((g, i) => ({...g, i}));
  // Sorting
  let sortCol = getSort('collection');
  let sortWish = getSort('wishlist');
  games = sortGames(games, sortCol.by, sortCol.dir);
  wishlist = sortGames(wishlist, sortWish.by, sortWish.dir);
  // Filtering
  games = games.filter(g => g.title.toLowerCase().includes(searchCollection));
  wishlist = wishlist.filter(g => g.title.toLowerCase().includes(searchWishlist));
  // Genre options
  const genreOptions = genreList.map(g => `<option value="${g}">${g}</option>`).join('');
  // Tabs
  document.getElementById('app').innerHTML = `
    <button class="logout-btn" onclick="logout()">Logout (${currentUser})</button>
    <h1>Game Collection Manager</h1>
    <div class="section">
      <h2>Add Game</h2>
      <input id="title" placeholder="Title" required>
      <select id="genre">
        <option value="">Select Genre</option>
        ${genreOptions}
      </select>
      <button onclick="addGame()">Add to Collection</button>
      <button onclick="addWishlist()">Add to Wishlist</button>
    </div>
    <div class="tabs">
      <button class="tab${activeTab==='collection'?' active':''}" onclick="switchTab('collection')">Collection</button>
      <button class="tab${activeTab==='wishlist'?' active':''}" onclick="switchTab('wishlist')">Wishlist</button>
      <button class="tab${activeTab==='log'?' active':''}" onclick="switchTab('log')">Performance Log</button>
    </div>
    <div class="tab-content${activeTab==='collection'?' active':''}" id="tab-collection">
      <div class="sort-controls">
        <label>Sort by:
          <select id="sortby-collection" onchange="setSort('collection', this.value, document.getElementById('sortdir-collection').value)">
            <option value="title"${sortCol.by==='title'?' selected':''}>Title</option>
            <option value="genre"${sortCol.by==='genre'?' selected':''}>Genre</option>
          </select>
          <select id="sortdir-collection" onchange="setSort('collection', document.getElementById('sortby-collection').value, this.value)">
            <option value="asc"${sortCol.dir==='asc'?' selected':''}>Ascending</option>
            <option value="desc"${sortCol.dir==='desc'?' selected':''}>Descending</option>
          </select>
        </label>
      </div>
      <input id="search-collection" placeholder="Search by title" oninput="renderApp()" value="${searchCollection}">
      <div id="games" class="games-list">
        ${games.length === 0 ? '<div class="center" style="color:var(--text-light);margin-top:16px;">No games found.</div>' : games.map(g => `
          <div class="game-item">
            <div>
              <span class="game-title">${g.title}</span>
              <span class="game-genre">${g.genre || 'Unknown'}</span>
            </div>
            <div class="actions">
              <button onclick="removeGame(${g.i})">Remove</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="tab-content${activeTab==='wishlist'?' active':''}" id="tab-wishlist">
      <div class="sort-controls">
        <label>Sort by:
          <select id="sortby-wishlist" onchange="setSort('wishlist', this.value, document.getElementById('sortdir-wishlist').value)">
            <option value="title"${sortWish.by==='title'?' selected':''}>Title</option>
            <option value="genre"${sortWish.by==='genre'?' selected':''}>Genre</option>
          </select>
          <select id="sortdir-wishlist" onchange="setSort('wishlist', document.getElementById('sortby-wishlist').value, this.value)">
            <option value="asc"${sortWish.dir==='asc'?' selected':''}>Ascending</option>
            <option value="desc"${sortWish.dir==='desc'?' selected':''}>Descending</option>
          </select>
        </label>
      </div>
      <input id="search-wishlist" placeholder="Search by title" oninput="renderApp()" value="${searchWishlist}">
      <div id="wishlist" class="games-list">
        ${wishlist.length === 0 ? '<div class="center" style="color:var(--text-light);margin-top:16px;">No games in wishlist.</div>' : wishlist.map(g => `
          <div class="game-item">
            <div>
              <span class="game-title">${g.title}</span>
              <span class="game-genre">${g.genre || 'Unknown'}</span>
            </div>
            <div class="actions">
              <button onclick="removeWishlist(${g.i})">Remove</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="tab-content${activeTab==='log'?' active':''}" id="tab-log">
      <div class="logger-title"><b>Performance Log</b></div>
      <div class="logger" id="logger">
        ${data.log && data.log.length ? data.log.map(l => `<div>${l}</div>`).join('') : '<div style="color:#b8c1ec;">No actions yet.</div>'}
      </div>
    </div>
  `;
}
window.renderLogin = renderLogin;
window.renderRegister = renderRegister;
window.doLogin = doLogin;
window.doRegister = doRegister;
window.renderApp = renderApp;
window.switchTab = switchTab;
window.setSort = setSort;

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}
function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function setUserData(username, data) {
  localStorage.setItem('data_' + username, JSON.stringify(data));
}
function getUserData(username) {
  return JSON.parse(localStorage.getItem('data_' + username) || '{"games":[],"wishlist":[],"log":[]}');
}


if (currentUser) renderApp();
else renderLogin();
