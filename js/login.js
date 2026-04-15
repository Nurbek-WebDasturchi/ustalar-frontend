const API = "https://ustalar-frontend.onrender.com/api";

function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((b, i) => {
    b.classList.toggle("active", (i === 0) === (tab === "login"));
  });
  document
    .getElementById("loginForm")
    .classList.toggle("active", tab === "login");
  document
    .getElementById("registerForm")
    .classList.toggle("active", tab === "register");
}

function showAlert(id, msg, type) {
  const el = document.getElementById(id);
  el.className = `alert-box ${type}`;
  el.innerHTML = `<i class="bi bi-${type === "error" ? "exclamation-circle" : "check-circle"}"></i> ${msg}`;
}

async function handleLogin() {
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value;
  const btn = event.target;

  if (!phone || !password)
    return showAlert("loginAlert", "Barcha maydonlarni to'ldiring", "error");

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Kirmoqda...';

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();

    if (!res.ok) return showAlert("loginAlert", data.error, "error");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    showAlert(
      "loginAlert",
      "Muvaffaqiyatli kirildingiz! Yo'naltirilmoqda...",
      "success",
    );

    setTimeout(() => {
      window.location.href =
        data.user.role === "admin" ? "admin.html" : "../index.html";
    }, 1000);
  } catch {
    showAlert("loginAlert", "Server bilan bog'lanib bo'lmadi", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Kirish";
  }
}

async function handleRegister() {
  const fullname = document.getElementById("regName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regConfirm").value;
  const btn = event.target;

  if (!fullname || !phone || !password)
    return showAlert("registerAlert", "Barcha maydonlarni to'ldiring", "error");
  if (password.length < 6)
    return showAlert(
      "registerAlert",
      "Parol kamida 6 ta belgidan iborat bo'lsin",
      "error",
    );
  if (password !== confirm)
    return showAlert("registerAlert", "Parollar mos kelmadi", "error");

  btn.disabled = true;
  btn.innerHTML = "<span class=\"spinner\"></span>Ro'yxatdan o'tilmoqda...";

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname, phone, password }),
    });
    const data = await res.json();

    if (!res.ok) return showAlert("registerAlert", data.error, "error");

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    showAlert(
      "registerAlert",
      "Muvaffaqiyatli ro'yxatdan o'tdingiz!",
      "success",
    );
    setTimeout(() => (window.location.href = "../index.html"), 1000);
  } catch {
    showAlert("registerAlert", "Server bilan bog'lanib bo'lmadi", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Ro'yxatdan o'tish";
  }
}

// Enter key support
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (document.getElementById("loginForm").classList.contains("active"))
      handleLogin();
    else handleRegister();
  }
});

// URL param: ?tab=register -> register tabni ochish
const urlTab = new URLSearchParams(window.location.search).get("tab");
if (urlTab === "register") switchTab("register");

// If already logged in
if (localStorage.getItem("token")) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  window.location.href = user.role === "admin" ? "admin.html" : "../index.html";
}
