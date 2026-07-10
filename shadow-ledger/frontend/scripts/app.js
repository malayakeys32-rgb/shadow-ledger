// ===============================
// Shadow Ledger Frontend Script
// ===============================

// Backend API URL (Render will inject this if you set env vars)
const API_URL = window._env_?.API_URL || "https://your-backend.onrender.com";

// -------------------------------
// LOGIN HANDLER
// -------------------------------
async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "Login failed");
    return;
  }

  // Save token
  localStorage.setItem("token", data.token);

  // Redirect to dashboard
  window.location.href = "/dashboard.html";
}

// -------------------------------
// SIGNUP HANDLER
// -------------------------------
async function signupUser(event) {
  event.preventDefault();

  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();

  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "Signup failed");
    return;
  }

  alert("Account created. You can now log in.");
  window.location.href = "/login.html";
}

// -------------------------------
// CHECK AUTH (for dashboard)
// -------------------------------
function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/login.html";
  }
}

// -------------------------------
// LOGOUT
// -------------------------------
function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}
