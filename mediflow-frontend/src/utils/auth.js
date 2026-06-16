export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // Decode base64url payload
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    }
    return false;
  } catch (e) {
    return true;
  }
};

export const isSessionExpired = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return true;
  
  if (isTokenExpired(token)) return true;
  
  const loginTime = localStorage.getItem('loginTimestamp') || sessionStorage.getItem('loginTimestamp');
  const lastActivity = localStorage.getItem('lastActivityTimestamp') || sessionStorage.getItem('lastActivityTimestamp');
  const now = Date.now();
  const threeHours = 3 * 60 * 60 * 1000;
  
  if (loginTime && now - parseInt(loginTime, 10) >= threeHours) return true;
  if (lastActivity && now - parseInt(lastActivity, 10) >= threeHours) return true;
  
  return false;
};

export const getSessionExpirationReason = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return null;
  
  if (isTokenExpired(token)) return 'session';
  
  const loginTime = localStorage.getItem('loginTimestamp') || sessionStorage.getItem('loginTimestamp');
  const lastActivity = localStorage.getItem('lastActivityTimestamp') || sessionStorage.getItem('lastActivityTimestamp');
  const now = Date.now();
  const threeHours = 3 * 60 * 60 * 1000;
  
  if (loginTime && now - parseInt(loginTime, 10) >= threeHours) return 'session';
  if (lastActivity && now - parseInt(lastActivity, 10) >= threeHours) return 'inactivity';
  
  return null;
};
