// Set your API URL
const API_URL = 'https://webplatform.enversedstudios.com/ai-dashboard';

// 1. Login and get access token
async function login() {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@demo-company.com',
      password: 'wachtwoord'
    })
  });

  const data = await response.json();
  if (data.success) { 
    console.log('Login successful! Token:', data.token);
    window.sessionStorage.setItem('apiToken', data.token)
    return data.token;
  } else {
    console.error('Login failed:', data.error);
    return null;
  }
}

const isLoggedIn = window.sessionStorage.getItem("apiToken");
if(!isLoggedIn){
    console.log("Nog niet ingelogd, dus ik ga nu inloggen");
    login()
}else{
    console.log("Al ingelogd, ik gebruik de oude token in de sessionStorage");
}

// 2. Get dashboard statistics
async function getDashboardStats(token) {
  const response = await fetch(`${API_URL}/api/dashboard/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  console.log('Dashboard Stats:', data.data);
  return data.data;
}
