const API_URL = 'https://webplatform.enversedstudios.com/ai-dashboard';

document.addEventListener("DOMContentLoaded", async () => {
  try {
    let token = getToken();

    if (!token) {
      console.log("No auth token found — logging in...");
      token = await login();
      if (!token) throw new Error("Login failed — no token received.");
    }

    console.log("Environment page initialized.");
    initEnvironmentInteractions();
    // Uncomment below when ready to load from API:
    // const environments = await getEnvironments(token);
    // renderEnvironments(environments);
  } catch (error) {
    console.error("Error initializing environments:", error);
  }
});

function initEnvironmentInteractions() {
  const editButtons = document.querySelectorAll(".edit");

  editButtons.forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".card");
      const img = button.querySelector("img");
      const draftLabel = card.querySelector(".draft-label");

      const isEditing = card.classList.toggle("editing");

      if (img) {
        img.src = isEditing
          ? "../images/edit2.svg"
          : "../images/edit.svg";
      }

      if (isEditing) {
        draftLabel.classList.remove("hidden");
      } else {
        draftLabel.classList.add("hidden");
      }
    });
  });
}

async function getEnvironments(token) {
  const response = await fetch(`${API_URL}/api/environments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    console.warn("Token expired — re-logging in...");
    const newToken = await login();
    if (newToken) return await getEnvironments(newToken);
    throw new Error("Re-login failed.");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch environments (${response.status})`);
  }

  const data = await response.json();
  console.log(`Found ${data.count} environments:`, data.data);
  return data.data;
}

function renderEnvironments(environments) {
  const grid = document.querySelector(".grid");
  grid.innerHTML = "";

  environments.forEach(env => {
    const card = document.createElement("article");
    card.classList.add("card");

    card.innerHTML = `
      <div class="image-container">
        <img src="${env.imageUrl || "../images/environment-placeholder.svg"}" alt="${env.name || "Environment"}" />
        <span class="draft-label hidden">DRAFT</span>
        <span class="bottom-line"></span>
      </div>
      <div class="environment-info pink">
        <strong><span>${env.name || "Unnamed Environment"}</span></strong>
        <p>${env.description || "No description"}</p>
        <div class="options">
          <button class="delete" aria-label="Delete"></button>
          <button class="copy" aria-label="Copy"></button>
          <button class="edit" aria-label="Edit"></button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  initEnvironmentInteractions();
}

function getToken() {
  return window.sessionStorage.getItem("apiToken");
}

async function login() {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@demo-company.com",
      password: "wachtwoord",
    }),
  });

  const data = await response.json();

  if (data.success && data.token) {
    console.log("Login successful!");
    window.sessionStorage.setItem("apiToken", data.token);
    return data.token;
  } else {
    console.error("Login failed:", data.error || data.message);
    return null;
  }
}
