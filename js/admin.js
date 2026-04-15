const API = "https://ustalar-frontend.onrender.com/api";
let token = localStorage.getItem("token");
let currentUser = JSON.parse(localStorage.getItem("user") || "{}");

// Check admin
if (!token || currentUser.role !== "admin") {
  window.location.href = "login.html";
}

// Set admin info
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
  window.location.href = "login.html";
}

function avatarEl(user) {
  if (user.avatar) return `<img src="${user.avatar}" class="avatar-sm" />`;
  return `<div class="avatar-placeholder">${(user.fullname || "?")[0].toUpperCase()}</div>`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Stats ────────────────────────────────────────────
async function loadStats() {
  const r = await fetch(`${API}/admin/stats`, { headers: headers() });
  const d = await r.json();
  document.getElementById("statUsers").textContent = d.totalUsers;
  document.getElementById("statUstalar").textContent = d.totalUstalar;
  document.getElementById("statPending").textContent = d.pendingCount;
  document.getElementById("pendingBadge").textContent = d.pendingCount;
}

// ── Pending ──────────────────────────────────────────
async function loadPending(forDash = false) {
  const r = await fetch(`${API}/admin/pending`, { headers: headers() });
  const data = await r.json();
  const targetId = forDash ? "dashPendingList" : "pendingList";
  const container = document.getElementById(targetId);

  if (!data.length) {
    container.innerHTML = `<div class="empty-state"><i class="bi bi-inbox"></i>Hozircha kutayotgan e'lon yo'q</div>`;
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
          <td>${formatDate(u.createdAt)}</td>
          ${
            !forDash
              ? `<td style="display:flex;gap:6px">
            <button class="action-btn btn-approve" onclick="approveUsta(${u.id})"><i class="bi bi-check-lg"></i> Tasdiqlash</button>
            <button class="action-btn btn-reject" onclick="rejectUsta(${u.id})"><i class="bi bi-x-lg"></i> Rad etish</button>
          </td>`
              : `<td><span class="badge-status pending"><i class="bi bi-clock"></i> Kutmoqda</span></td>`
          }
        </tr>
      `,
    )
    .join("");

  container.innerHTML = `
        <table>
          <thead><tr>
            <th>Ism</th><th>Telefon</th><th>Mutaxassislik</th><th>Shahar</th><th>Sana</th>
            <th>${forDash ? "Status" : "Amal"}</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
}

async function approveUsta(id) {
  const r = await fetch(`${API}/admin/approve/${id}`, {
    method: "POST",
    headers: headers(),
  });
  if (r.ok) {
    showToast("E'lon tasdiqlandi!");
    loadAll();
  } else showToast("Xatolik yuz berdi", "error");
}

async function rejectUsta(id) {
  if (!confirm("E'lonni rad etmoqchimisiz?")) return;
  const r = await fetch(`${API}/admin/reject/${id}`, {
    method: "POST",
    headers: headers(),
  });
  if (r.ok) {
    showToast("E'lon rad etildi");
    loadAll();
  } else showToast("Xatolik yuz berdi", "error");
}

// ── Ustalar ──────────────────────────────────────────
async function loadUstalar() {
  const r = await fetch(`${API}/ustalar`);
  const data = await r.json();
  const container = document.getElementById("ustalarList");

  if (!data.length) {
    container.innerHTML = `<div class="empty-state"><i class="bi bi-people"></i>Hozircha tasdiqlangan usta yo'q</div>`;
    return;
  }

  container.innerHTML = `
        <table>
          <thead><tr><th>Ista</th><th>Telefon</th><th>Mutaxassislik</th><th>Shahar</th><th>Tasdiqlangan</th><th>Amal</th></tr></thead>
          <tbody>${data
            .map(
              (u) => `
            <tr>
              <td>${avatarEl(u)} <span style="margin-left:8px">${u.fullname}</span></td>
              <td>${u.phone}</td>
              <td><span class="badge-status approved">${u.job}</span></td>
              <td>${u.city}</td>
              <td>${formatDate(u.createdAt)}</td>
              <td><button class="action-btn btn-delete" onclick="deleteUsta(${u.id})"><i class="bi bi-trash"></i> O'chirish</button></td>
            </tr>`,
            )
            .join("")}
          </tbody>
        </table>`;
}

async function deleteUsta(id) {
  if (!confirm("Ustani o'chirishni tasdiqlaysizmi?")) return;
  const r = await fetch(`${API}/admin/ustalar/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (r.ok) {
    showToast("Usta o'chirildi");
    loadUstalar();
    loadStats();
  } else showToast("Xatolik", "error");
}

// ── Users ────────────────────────────────────────────
async function loadUsers() {
  const r = await fetch(`${API}/admin/users`, { headers: headers() });
  const data = await r.json();
  const container = document.getElementById("usersList");

  container.innerHTML = `
        <table>
          <thead><tr><th>#</th><th>Ism</th><th>Telefon</th><th>Rol</th><th>Ro'yxatdan o'tgan</th><th>Amal</th></tr></thead>
          <tbody>${data
            .map(
              (u, i) => `
            <tr>
              <td style="color:var(--muted)">${i + 1}</td>
              <td><div class="avatar-placeholder" style="display:inline-flex">${u.fullname[0].toUpperCase()}</div> <span style="margin-left:8px">${u.fullname}</span></td>
              <td>${u.phone}</td>
              <td><span class="badge-status ${u.role}">${u.role === "admin" ? "👑 Admin" : "👤 Foydalanuvchi"}</span></td>
              <td>${formatDate(u.createdAt)}</td>
              <td>${u.role !== "admin" ? `<button class="action-btn btn-delete" onclick="deleteUser(${u.id})"><i class="bi bi-person-x"></i> O'chirish</button>` : '<span style="color:var(--muted);font-size:0.8rem">Himoyalangan</span>'}</td>
            </tr>`,
            )
            .join("")}
          </tbody>
        </table>`;
}

async function deleteUser(id) {
  if (!confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?")) return;
  const r = await fetch(`${API}/admin/users/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (r.ok) {
    showToast("Foydalanuvchi o'chirildi");
    loadUsers();
    loadStats();
  } else showToast("Xatolik", "error");
}

async function loadAll() {
  await loadStats();
  await loadPending(true);
}

// Init
loadAll();
