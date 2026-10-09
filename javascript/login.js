const API_URL = 'https://webplatform.enversedstudios.com/ai-dashboard';

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
    console.log('Login successful! Token:', data.data.accessToken);
    return data.data.accessToken;
  } else {
    console.error('Login failed:', data.error);
    return null;
  }
}