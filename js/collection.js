// Collection microservice
function addGame() {
    const title = document.getElementById('title').value.trim();
    const genre = document.getElementById('genre').value;
    if (!title) return alert('Enter a title!');
    let data = getUserData(currentUser);
    data.games.push({title, genre});
    setUserData(currentUser, data);
    logAction(`Added game "${title}" to collection`);
    renderApp();
    switchTab('collection');
  }
  function removeGame(idx) {
    let data = getUserData(currentUser);
    const removed = data.games[idx];
    data.games.splice(idx, 1);
    setUserData(currentUser, data);
    logAction(`Removed game "${removed.title}" from collection`);
    renderApp();
  }
  
