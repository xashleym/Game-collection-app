// Wishlist microservice
function addWishlist() {
    const title = document.getElementById('title').value.trim();
    const genre = document.getElementById('genre').value;
    if (!title) return alert('Enter a title!');
    let data = getUserData(currentUser);
    data.wishlist.push({title, genre});
    setUserData(currentUser, data);
    logAction(`Added game "${title}" to wishlist`);
    renderApp();
    switchTab('wishlist');
  }
  function removeWishlist(idx) {
    let data = getUserData(currentUser);
    const removed = data.wishlist[idx];
    data.wishlist.splice(idx, 1);
    setUserData(currentUser, data);
    logAction(`Removed game "${removed.title}" from wishlist`);
    renderApp();
  }
  
