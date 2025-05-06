// Entry point
let currentUser = null;
localStorage.removeItem('currentUser');

let activeTab = 'collection';
const genreList = [
  "Action", "Adventure", "RPG", "Strategy", "Simulation", "Puzzle", "Sports", "Racing", "Shooter", "Platformer"
];

// ---- Authentication and Navigation ----
function renderLogin(errorMsg = '') {
  document.getElementById('app').innerHTML = `
    <h1 class="center">Game Collection Manager</h1>
    <div class="section">
      <h2>Login</h2>
      <div class="error">${errorMsg}</div>
      <input id="login-username" placeholder="Username"><br>
      <input id="login-password" type="password" placeholder="Password"><br>
      <button onclick="doLogin()" title="Sign in with your username and password.">Login</button>
      <button onclick="renderRegister()" title="Create a new account.">Register</button>
      <button onclick="renderHelp()" title="How to use this app.">Help</button>
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
      <button onclick="doRegister()" title="Create your account.">Register</button>
      <button onclick="renderLogin()" title="Back to login screen.">Back to Login</button>
      <button onclick="renderHelp()" title="How to use this app.">Help</button>
    </div>
  `;
}
function renderHelp() {
  document.getElementById('app').innerHTML = `
    <h1 class="center">Game Collection Manager</h1>
    <div class="section">
      <h2>Help & Instructions</h2>
      <ul>
        <li><b>Login/Register:</b> Enter a username and password to log in or create a new account. Each user has a separate collection and wishlist.</li>
        <li><b>Add a Game:</b> Enter a title and select a genre, then click <b title="Add the game to your personal collection.">Add to Collection</b> or <b title="Add the game to your wishlist (games you want to play).">Add to Wishlist</b>.</li>
        <li><b>Remove a Game:</b> Click <b title="Remove this game from your collection.">Remove</b> to delete a game from your collection or wishlist.</li>
        <li><b>Tabs:</b> Use the Collection, Wishlist, Log, and Help tabs to navigate between sections.</li>
        <li><b>Sorting:</b> Use the sort drop-downs to order your games by title or genre, ascending or descending.</li>
        <li><b>Searching:</b> Use the search box above each list to filter by game title.</li>
        <li><b>Tooltips:</b> Hover over any button to see a short description of what it does.</li>
        <li><b>Performance Log:</b> The Log tab records your actions (add/remove).</li>
        <li><b>Logout:</b> Click the Logout button (top left) to sign out and return to the login screen.</li>
      </ul>
      <button onclick="renderLogin()" title="Back to login screen.">Back to Login</button>
      <button onclick="currentUser ? renderApp() : renderLogin()" title="Go to main app.">Go to App</button>
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

// ---- Main App ----
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
    <button class="logout-btn" onclick="logout()" title="Sign out and return to the login screen.">Logout (${currentUser})</button>
    <h1>Game Collection Manager</h1>
    <div class="section">
      <h2>Add Game</h2>
      <input id="title" placeholder="Title" required>
      <select id="genre">
        <option value="">Select Genre</option>
        ${genreOptions}
      </select>
      <button onclick="addGame()" title="Add the game to your personal collection.">Add to Collection</button>
      <button onclick="addWishlist()" title="Add the game to your wishlist (games you want to play).">Add to Wishlist</button>
    </div>
    <div class="tabs">
      <button class="tab${activeTab==='collection'?' active':''}" onclick="switchTab('collection')" title="View your game collection.">Collection</button>
      <button class="tab${activeTab==='wishlist'?' active':''}" onclick="switchTab('wishlist')" title="View your wishlist.">Wishlist</button>
      <button class="tab${activeTab==='log'?' active':''}" onclick="switchTab('log')" title="View your performance log.">Performance Log</button>
      <button class="tab${activeTab==='help'?' active':''}" onclick="switchTab('help')" title="How to use this app.">Help</button>
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
              <button onclick="removeGame(${g.i})" title="Remove this game from your collection.">Remove</button>
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
              <button onclick="removeWishlist(${g.i})" title="Remove this game from your wishlist.">Remove</button>
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
    <div class="tab-content${activeTab==='help'?' active':''}" id="tab-help">
      <div class="section">
        <h2>Help & Instructions</h2>
        <ul>
          <li><b>Login/Register:</b> Enter a username and password to log in or create a new account. Each user has a separate collection and wishlist.</li>
          <li><b>Add a Game:</b> Enter a title and select a genre, then click <b title="Add the game to your personal collection.">Add to Collection</b> or <b title="Add the game to your wishlist (games you want to play).">Add to Wishlist</b>.</li>
          <li><b>Remove a Game:</b> Click <b title="Remove this game from your collection.">Remove</b> to delete a game from your collection or wishlist.</li>
          <li><b>Tabs:</b> Use the Collection, Wishlist, Log, and Help tabs to navigate between sections.</li>
          <li><b>Sorting:</b> Use the sort drop-downs to order your games by title or genre, ascending or descending.</li>
          <li><b>Searching:</b> Use the search box above each list to filter by game title.</li>
          <li><b>Tooltips:</b> Hover over any button to see a short description of what it does.</li>
          <li><b>Performance Log:</b> The Log tab records your actions (add/remove).</li>
          <li><b>Logout:</b> Click the Logout button (top left) to sign out and return to the login screen.</li>
        </ul>
      </div>
    </div>
  `;
}

// ---- Tab and Sorting Handlers ----
function switchTab(tab) { activeTab = tab; renderApp(); }
function setSort(tab, by, dir) {
  localStorage.setItem('sort_' + tab, JSON.stringify({by, dir}));
  renderApp();
}
function getSort(tab) {
  return JSON.parse(localStorage.getItem('sort_' + tab) || '{"by":"title","dir":"asc"}');
}
function sortGames(arr, by, dir) {
  return arr.slice().sort((a, b) => {
    let cmp = (a[by] || '').localeCompare(b[by] || '');
    return dir === 'asc' ? cmp : -cmp;
  });
}

// ---- Game/Wishlist Actions ----
function addGame() {
  let title = document.getElementById('title').value.trim();
  let genre = document.getElementById('genre').value;
  if (!title || !genre) return;
  let data = getUserData(currentUser);
  data.games.push({title, genre});
  logAction(`Added "${title}" (${genre}) to collection.`);
  setUserData(currentUser, data);
  renderApp();
}
function addWishlist() {
  let title = document.getElementById('title').value.trim();
  let genre = document.getElementById('genre').value;
  if (!title || !genre) return;
  let data = getUserData(currentUser);
  data.wishlist.push({title, genre});
  logAction(`Added "${title}" (${genre}) to wishlist.`);
  setUserData(currentUser, data);
  renderApp();
}
function removeGame(idx) {
  let data = getUserData(currentUser);
  let g = data.games[idx];
  if (g) logAction(`Removed "${g.title}" (${g.genre}) from collection.`);
  data.games.splice(idx, 1);
  setUserData(currentUser, data);
  renderApp();
}
function removeWishlist(idx) {
  let data = getUserData(currentUser);
  let g = data.wishlist[idx];
  if (g) logAction(`Removed "${g.title}" (${g.genre}) from wishlist.`);
  data.wishlist.splice(idx, 1);
  setUserData(currentUser, data);
  renderApp();
}
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  renderLogin();
}
function logAction(msg) {
  let data = getUserData(currentUser);
  let now = new Date();
  let timestamp = now.toLocaleString();
  data.log = data.log || [];
  data.log.unshift(`[${timestamp}] ${msg}`);
  if (data.log.length > 100) data.log = data.log.slice(0, 100);
  setUserData(currentUser, data);
}

// ---- User Data Helpers ----
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

// ---- Expose for inline handlers ----
window.renderLogin = renderLogin;
window.renderRegister = renderRegister;
window.renderHelp = renderHelp;
window.doLogin = doLogin;
window.doRegister = doRegister;
window.renderApp = renderApp;
window.switchTab = switchTab;
window.setSort = setSort;
window.addGame = addGame;
window.addWishlist = addWishlist;
window.removeGame = removeGame;
window.removeWishlist = removeWishlist;

// ---- App Start ----
if (currentUser) renderApp();
else renderLogin();
