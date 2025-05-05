// Authentication microservice
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || {};
  }
  function setUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }
  function getUserData(username) {
    return JSON.parse(localStorage.getItem('user_' + username)) || {games: [], wishlist: [], log: []};
  }
  function setUserData(username, data) {
    localStorage.setItem('user_' + username, JSON.stringify(data));
  }
  function login(username) {
    localStorage.setItem('currentUser', username);
    window.currentUser = username;
    logAction("Logged in");
    renderApp();
  }
  function logout() {
    logAction("Logged out");
    localStorage.removeItem('currentUser');
    window.currentUser = null;
    renderLogin();
  }
  
