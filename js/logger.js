// Logger microservice
function logAction(action) {
    if (!currentUser) return;
    let data = getUserData(currentUser);
    const now = new Date();
    const ts = now.toLocaleString();
    data.log = data.log || [];
    data.log.unshift(`[${ts}] ${action}`);
    if (data.log.length > 100) data.log = data.log.slice(0, 100);
    setUserData(currentUser, data);
  }
  
