const API_URL = 'https://webplatform.enversedstudios.com/ai-dashboard';

async function getDialogues(token) {
  const response = await fetch(`${API_URL}/api/dialogues`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const data = await response.json();
  console.log(`Found ${data.count} dialogues:`, data.data);
  return data.data;
}