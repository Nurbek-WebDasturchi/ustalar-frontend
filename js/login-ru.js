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
    return showAlert("loginAlert", "Заполните все поля", "error");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Вход...';
  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msgs = {
        "Telefon yoki parol noto'g'ri": "Неверный телефон или пароль",
      };
      return showAlert("loginAlert", msgs[data.error] || data.error, "error");
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("lang", "ru");
    showAlert("loginAlert", "Вы успешно вошли! Перенаправление...", "success");
    setTimeout(() => {
      window.location.href =
        data.user.role === "admin" ? "admin-ru.html" : "../pages/rus.html";
    }, 1000);
  } catch {
    showAlert("loginAlert", "Не удалось подключиться к серверу", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Войти";
  }
}

async function handleRegister() {
  const fullname = document.getElementById("regName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regConfirm").value;
  const btn = event.target;
  if (!fullname || !phone || !password)
    return showAlert("registerAlert", "Заполните все поля", "error");
  if (password.length < 6)
    return showAlert(
      "registerAlert",
      "Пароль должен содержать минимум 6 символов",
      "error",
    );
  if (password !== confirm)
    return showAlert("registerAlert", "Пароли не совпадают", "error");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Регистрация...';
  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname, phone, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      const msgs = {
        "Bu telefon raqam allaqachon ro'yxatdan o'tgan":
          "Этот номер уже зарегистрирован",
      };
      return showAlert(
        "registerAlert",
        msgs[data.error] || data.error,
        "error",
      );
    }
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("lang", "ru");
    showAlert("registerAlert", "Регистрация прошла успешно!", "success");
    setTimeout(() => (window.location.href = "../pages/rus.html"), 1000);
  } catch {
    showAlert("registerAlert", "Не удалось подключиться к серверу", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Зарегистрироваться";
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (document.getElementById("loginForm").classList.contains("active"))
      handleLogin();
    else handleRegister();
  }
});

const urlTab = new URLSearchParams(window.location.search).get("tab");
if (urlTab === "register") switchTab("register");

if (localStorage.getItem("token")) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  window.location.href =
    user.role === "admin" ? "admin-ru.html" : "../pages/rus.html";
}
