const API = "https://ustalar-frontend.onrender.com/api";
let token = localStorage.getItem("token");
let currentUser = JSON.parse(localStorage.getItem("user") || "{}");

if (!token || currentUser.role !== "admin")
  window.location.href = "login-ru.html";

document.getElementById("adminName").textContent =
  currentUser.fullname || "Admin";
document.getElementById("adminInitial").textContent = (currentUser.fullname ||
  "A")[0].toUpperCase();

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = (type === "success" ? "✅ " : "❌ ") + msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.classList.remove("show"), 3000);
}

function showSection(name) {
  document
    .querySelectorAll(".section-tab")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document.getElementById(name + "Section").classList.add("active");
  event?.target?.closest(".nav-item")?.classList.add("active");
  if (name === "dashboard") loadAll();
  if (name === "pending") loadPending();
  if (name === "ustalar") loadUstalar();
  if (name === "users") loadUsers();
  if (window.innerWidth < 768)
    document.getElementById("sidebar").classList.remove("open");
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login-ru.html";
}

function avatarEl(user) {
  if (user.avatar)
    return `<img src="${user.avatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover" />`;
  return `<div class="avatar-placeholder">${(user.fullname || "?")[0].toUpperCase()}</div>`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function loadStats() {
  const r = await fetch(`${API}/admin/stats`, { headers: headers() });
  const d = await r.json();
  document.getElementById("statUsers").textContent = d.totalUsers;
  document.getElementById("statUstalar").textContent = d.totalUstalar;
  document.getElementById("statPending").textContent = d.pendingCount;
  document.getElementById("pendingBadge").textContent = d.pendingCount;
}

async function loadPending(forDash = false) {
  const r = await fetch(`${API}/admin/pending`, { headers: headers() });
  const data = await r.json();
  const container = document.getElementById(
    forDash ? "dashPendingList" : "pendingList",
  );
  if (!data.length) {
    container.innerHTML = `<div class="empty-state"><i class="bi bi-inbox"></i>Нет ожидающих объявлений</div>`;
    return;
  }
  const rows = (forDash ? data.slice(0, 5) : data)
    .map(
      (u) => `
        <tr>
          <td>${avatarEl(u)} <span style="margin-left:8px">${u.fullname}</span></td>
          <td>${u.phone}</td>
          <td>${u.job}</td>
          <td>${u.city}</td>
          <td>${formatDate(u.created_at || u.createdAt)}</td>
          ${
            !forDash
              ? `<td style="display:flex;gap:6px">
            <button class="action-btn btn-approve" onclick="approveUsta(${u.id})"><i class="bi bi-check-lg"></i> Подтвердить</button>
            <button class="action-btn btn-reject" onclick="rejectUsta(${u.id})"><i class="bi bi-x-lg"></i> Отклонить</button>
          </td>`
              : `<td><span class="badge-status pending"><i class="bi bi-clock"></i> Ожидает</span></td>`
          }
        </tr>`,
    )
    .join("");
  container.innerHTML = `
        <table>
          <thead><tr><th>Имя</th><th>Телефон</th><th>Специализация</th><th>Город</th><th>Дата</th><th>${forDash ? "Статус" : "Действие"}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
}

async function approveUsta(id) {
  const r = await fetch(`${API}/admin/approve/${id}`, {
    method: "POST",
    headers: headers(),
  });
  if (r.ok) {
    showToast("Объявление подтверждено!");
    loadAll();
  } else showToast("Ошибка", "error");
}

async function rejectUsta(id) {
  if (!confirm("Отклонить это объявление?")) return;
  const r = await fetch(`${API}/admin/reject/${id}`, {
    method: "POST",
    headers: headers(),
  });
  if (r.ok) {
    showToast("Объявление отклонено");
    loadAll();
  } else showToast("Ошибка", "error");
}

async function loadUstalar() {
  const r = await fetch(`${API}/ustalar`);
  const data = await r.json();
  const container = document.getElementById("ustalarList");
  if (!data.length) {
    container.innerHTML = `<div class="empty-state"><i class="bi bi-people"></i>Нет подтверждённых мастеров</div>`;
    return;
  }
  container.innerHTML = `
        <table>
          <thead><tr><th>Мастер</th><th>Телефон</th><th>Специализация</th><th>Город</th><th>Подтверждён</th><th>Действие</th></tr></thead>
          <tbody>${data
            .map(
              (u) => `
            <tr>
              <td>${avatarEl(u)} <span style="margin-left:8px">${u.fullname}</span></td>
              <td>${u.phone}</td>
              <td><span class="badge-status approved">${u.job}</span></td>
              <td>${u.city}</td>
              <td>${formatDate(u.created_at || u.createdAt)}</td>
              <td><button class="action-btn btn-delete" onclick="deleteUsta(${u.id})"><i class="bi bi-trash"></i> Удалить</button></td>
            </tr>`,
            )
            .join("")}
          </tbody>
        </table>`;
}

async function deleteUsta(id) {
  if (!confirm("Удалить этого мастера?")) return;
  const r = await fetch(`${API}/admin/ustalar/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (r.ok) {
    showToast("Мастер удалён");
    loadUstalar();
    loadStats();
  } else showToast("Ошибка", "error");
}

async function loadUsers() {
  const r = await fetch(`${API}/admin/users`, { headers: headers() });
  const data = await r.json();
  const container = document.getElementById("usersList");
  container.innerHTML = `
        <table>
          <thead><tr><th>#</th><th>Имя</th><th>Телефон</th><th>Роль</th><th>Дата регистрации</th><th>Действие</th></tr></thead>
          <tbody>${data
            .map(
              (u, i) => `
            <tr>
              <td style="color:var(--muted)">${i + 1}</td>
              <td><div class="avatar-placeholder" style="display:inline-flex">${u.fullname[0].toUpperCase()}</div> <span style="margin-left:8px">${u.fullname}</span></td>
              <td>${u.phone}</td>
              <td><span class="badge-status ${u.role}">${u.role === "admin" ? "👑 Админ" : "👤 Пользователь"}</span></td>
              <td>${formatDate(u.created_at || u.createdAt)}</td>
              <td>${u.role !== "admin" ? `<button class="action-btn btn-delete" onclick="deleteUser(${u.id})"><i class="bi bi-person-x"></i> Удалить</button>` : '<span style="color:var(--muted);font-size:0.8rem">Защищён</span>'}</td>
            </tr>`,
            )
            .join("")}
          </tbody>
        </table>`;
}

async function deleteUser(id) {
  if (!confirm("Удалить этого пользователя?")) return;
  const r = await fetch(`${API}/admin/users/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (r.ok) {
    showToast("Пользователь удалён");
    loadUsers();
    loadStats();
  } else showToast("Ошибка", "error");
}

async function loadAll() {
  await loadStats();
  await loadPending(true);
}
loadAll();
