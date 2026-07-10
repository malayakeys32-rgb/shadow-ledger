// ===============================
// Shadow Ledger - Dashboard Logic
// ===============================

const API_URL = window._env_?.API_URL || "https://your-backend.onrender.com";

// -------------------------------
// LOAD USER DATA
// -------------------------------
async function loadDashboard() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  const response = await fetch(`${API_URL}/user/me`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    alert("Session expired. Please log in again.");
    localStorage.removeItem("token");
    window.location.href = "/login.html";
    return;
  }

  // Display user info
  document.getElementById("user-email").innerText = data.email;
}

// -------------------------------
// LOGOUT BUTTON
// -------------------------------
function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}
