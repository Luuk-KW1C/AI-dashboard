const API_URL = 'https://webplatform.enversedstudios.com/ai-dashboard';

document.addEventListener("DOMContentLoaded", async () => {
  const listContainer = document.querySelector(".character-list");

  try {
    let token = getToken();

    if (!token) {
      console.log("No auth token found — logging in");
      token = await login();
      if (!token) throw new Error("Login failed — no token received.");
    }

    const characters = await getCharacters(token);
    renderCharacters(characters);
    initCharacterInteractions();

  } catch (error) {
    console.error("Error fetching characters:", error);
    listContainer.innerHTML += `<p style="color: #ff88d8; margin-top: 20px;">Failed to load characters, Check console.</p>`;
  }
});

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

  if (data.success && data.token) {
    console.log("Login successful");
    window.sessionStorage.setItem("apiToken", data.token);
    return data.token;
  } else {
    console.error("Login failed,", data.error || data.message);
    return null;
  }
}

function getToken() {
  return window.sessionStorage.getItem("apiToken");
}

async function getCharacters(token) {
  const response = await fetch(`${API_URL}/api/characters`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    console.warn("Token expired — re-logging in..");
    const newToken = await login();
    if (newToken) return await getCharacters(newToken);
    throw new Error("Re-login failed");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch characters (${response.status})`);
  }

  const data = await response.json();
  console.log(`Found ${data.count} characters:`, data.data);
  return data.data;
}

function renderCharacters(characters) {
  const listContainer = document.querySelector(".character-list");

  document.querySelectorAll(".character-row").forEach((row) => row.remove());

  characters.forEach((char) => {
    const row = document.createElement("div");
    row.classList.add("character-row");

    row.innerHTML = `
      <div class="cell name">
        <img src="${char.imageUrl || "../images/steve.svg"}" alt="${char.name || "Character"}" />
        <div class="info">
          <strong><span>${char.name || "Unnamed Character"}</span></strong>
          <small>${char.description || ""}</small>
        </div>
      </div>

      <div class="cell reference">
        <div class="reference-content">
          <span class="draft-label hidden">DRAFT</span>
          <p class="number"><span>C</span>${char.id}</p>
        </div>
      </div>

      <div class="cell voice">
        <p>${char.voice || "N/A"}</p>
      </div>

      <div class="cell options">
        <button class="delete" aria-label="Delete character">
          <img src="../images/delete.svg" alt="Delete" />
        </button>
        <button class="copy" aria-label="Duplicate character">
          <img src="../images/add.svg" alt="Duplicate" />
        </button>
        <button class="edit-btn" aria-label="Edit character">
          <img src="../images/edit.svg" alt="Edit" />
        </button>
      </div>
    `;

    listContainer.appendChild(row);
  });
}

function initCharacterInteractions() {
  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".character-row");
      const img = button.querySelector("img");
      const draftLabel = row.querySelector(".draft-label");

      const isEditing = row.classList.toggle("editing");

      img.src = isEditing
        ? "../images/edit2.svg"
        : "../images/edit.svg";

      if (draftLabel) {
        draftLabel.classList.toggle("hidden", !isEditing);
      }
    });
  });
}

async function getCharacterIDs() {
  let token = getToken();
  if (!token) token = await login();
  const characters = await getCharacters(token);
  return characters.map(char => char.id);
}
