const API_URL = 'https://webplatform.enversedstudios.com/ai-dashboard';

document.addEventListener("DOMContentLoaded", async () => {
  const table = document.querySelector(".table");

  try {
    let token = getToken();

    if (!token) {
      console.log("No auth token found — logging in...");
      token = await login();
      if (!token) throw new Error("Login failed — no token received.");
    }

    const scenarios = await getScenarios(token);
    renderScenarios(scenarios);
    initScenarioInteractions();

  } catch (error) {
    console.error("Error fetching scenarios:", error);
    table.innerHTML += `<p style="color: #ff88d8; margin-top: 20px;">Failed to load scenarios. Check console.</p>`;
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
    console.log("Login successful!");
    window.sessionStorage.setItem("apiToken", data.token);
    return data.token;
  } else {
    console.error("Login failed:", data.error || data.message);
    return null;
  }
}

function getToken() {
  return window.sessionStorage.getItem("apiToken");
}

async function getScenarios(token) {
  const response = await fetch(`${API_URL}/api/scenarios`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    console.warn("⚠️ Token expired or invalid — trying to log in again...");
    const newToken = await login();
    if (newToken) return await getScenarios(newToken);
    throw new Error("Re-login failed. Cannot fetch scenarios.");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch scenarios (${response.status})`);
  }

  const data = await response.json();
  console.log(`📦 Found ${data.count} scenarios:`, data.data);
  return data.data;
}

function renderScenarios(scenarios) {
  const table = document.querySelector(".table");
  const header = document.querySelector(".table-header");

  document.querySelectorAll(".scenario-row").forEach((row) => row.remove());

  scenarios.forEach((scenario) => {
    const row = document.createElement("div");
    row.classList.add("scenario-row");
    if (scenario.active) row.classList.add("active");

    row.innerHTML = `
      <div class="cell toggle">
        <button class="toggle-switch ${scenario.active ? "on" : "off"}" aria-label="Toggle active scenario">
          <img src="../images/${scenario.active ? "check" : "cross"}.svg" alt="${scenario.active ? "Active" : "Inactive"}" />
        </button>
      </div>

      <div class="cell name">
        <strong>${scenario.name || "Unnamed Scenario"}</strong>
        <small>${scenario.description || ""}</small>
      </div>

      <div class="cell ref">
        <p><span>S</span>${scenario.referenceId || "0000"}</p>
      </div>

      <div class="cell plays">
        <p><span>${scenario.timesPlayed || 0}</span> TIMES</p>
      </div>

      <div class="cell options">
        <button class="delete" aria-label="Delete scenario">
          <img src="../images/delete.svg" alt="Delete" />
        </button>
        <button class="copy" aria-label="Duplicate scenario">
          <img src="../images/add.svg" alt="Duplicate" />
        </button>
        <button class="edit-btn" aria-label="Edit scenario">
          <img src="../images/edit.svg" alt="Edit" />
        </button>
      </div>
    `;

    header.insertAdjacentElement("afterend", row);
  });
}

function initScenarioInteractions() {
  const toggleButtons = document.querySelectorAll(".toggle-switch");
  const editButtons = document.querySelectorAll(".edit-btn");

  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const img = button.querySelector("img");
      const row = button.closest(".scenario-row");
      const isActive = img.getAttribute("src").includes("check.svg");

      if (isActive) {
        img.setAttribute("src", "../images/cross.svg");
        row.classList.remove("active");
        button.classList.remove("on");
        button.classList.add("off");
      } else {
        img.setAttribute("src", "../images/check.svg");
        row.classList.add("active");
        button.classList.remove("off");
        button.classList.add("on");
      }
    });
  });

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".scenario-row");
      const img = button.querySelector("img");
      const playsCell = row.querySelector(".cell.plays");
      const isEditing = row.classList.toggle("editing");

      img.src = isEditing
        ? "../images/edit2.svg"
        : "../images/edit.svg";

      const existingDraft = playsCell.querySelector(".draft-label");
      if (existingDraft) existingDraft.remove();

      if (isEditing) {
        const draft = document.createElement("span");
        draft.classList.add("draft-label");
        draft.textContent = "Draft";
        playsCell.prepend(draft);
      }
    });
  });
}
