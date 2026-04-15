// auth-ru.js — rus.html uchun (auth.js ning ruscha versiyasi)
// rus.html da scripts.js DAN KEYIN qo'shing:
// <script src="/js/auth-ru.js"></script>

const API_BASE_RU = 'http://localhost:3001/api';

function getToken()  { return localStorage.getItem('token'); }
function getUser()   { return JSON.parse(localStorage.getItem('user') || 'null'); }
function isAdminRu() { return getUser()?.role === 'admin'; }

// ── Nav ichiga Войти/Регистрация tugmalari ─────────────
function renderAuthButtonsRu() {
  const user = getUser();

  // Desktop: second bar (AI va lang tugmalari yoniga)
  const secondBarRight = document.querySelector('.d-none.d-md-inline-block');
  if (secondBarRight) {
    const authWrap = document.createElement('span');
    authWrap.id = 'authBtnsDesktop';
    authWrap.style.cssText = 'display:inline-flex;align-items:center;gap:8px;margin-left:8px';
    if (user) {
      authWrap.innerHTML = `
        <span style="color:#00c896;font-size:.82rem;font-weight:700;padding:6px 10px;background:rgba(0,200,150,.1);border-radius:8px;border:1px solid rgba(0,200,150,.2)">
          <i class="bi bi-person-check-fill"></i> ${user.fullname.split(' ')[0]}
        </span>
        ${isAdminRu() ? `<a href="./admin-ru.html" style="background:rgba(255,165,2,.15);border:1px solid rgba(255,165,2,.3);color:#ffa502;padding:6px 12px;border-radius:8px;font-size:.8rem;font-weight:700;text-decoration:none"><i class="bi bi-shield-lock-fill"></i> Админ</a>` : ''}
        <button id="logoutBtnRu" style="background:rgba(255,71,87,.12);border:1px solid rgba(255,71,87,.3);color:#ff4757;padding:6px 14px;border-radius:8px;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit">
          <i class="bi bi-box-arrow-right"></i> Выйти
        </button>`;
    } else {
      authWrap.innerHTML = `
        <a href="./login-ru.html" style="background:rgba(0,200,150,.12);border:1px solid rgba(0,200,150,.3);color:#00c896;padding:7px 16px;border-radius:8px;font-size:.85rem;font-weight:700;text-decoration:none">
          <i class="bi bi-box-arrow-in-right"></i> Войти
        </a>
        <a href="./login-ru.html?tab=register" style="background:#00c896;color:#000;padding:7px 16px;border-radius:8px;font-size:.85rem;font-weight:700;text-decoration:none">
          <i class="bi bi-person-plus-fill"></i> Регистрация
        </a>`;
    }
    secondBarRight.appendChild(authWrap);
  }

  // Mobile nav
  const mobileNav = document.querySelector('.d-md-none.links.text-uppercase.navbar-list');
  if (mobileNav) {
    const mobileAuth = document.createElement('div');
    mobileAuth.style.cssText = 'margin-top:10px;display:flex;flex-direction:column;gap:8px';
    if (user) {
      mobileAuth.innerHTML = `
        <div style="color:#00c896;font-size:.9rem;font-weight:700;padding:8px 12px;background:rgba(0,200,150,.1);border-radius:8px;text-align:center">
          <i class="bi bi-person-fill"></i> ${user.fullname}
        </div>
        ${isAdminRu() ? `<a href="./admin-ru.html" style="color:#ffa502;font-weight:700;font-size:.9rem;text-decoration:none;text-align:center;padding:8px;background:rgba(255,165,2,.1);border-radius:8px"><i class="bi bi-shield-lock-fill"></i> Админ панель</a>` : ''}
        <button id="logoutBtnRuMobile" style="background:rgba(255,71,87,.15);border:1px solid rgba(255,71,87,.3);color:#ff4757;padding:9px;border-radius:8px;font-size:.9rem;font-weight:700;cursor:pointer;font-family:inherit">
          <i class="bi bi-box-arrow-right"></i> Выйти
        </button>`;
    } else {
      mobileAuth.innerHTML = `
        <a href="./login-ru.html" style="text-align:center;padding:9px;background:rgba(0,200,150,.12);border:1px solid rgba(0,200,150,.3);color:#00c896;border-radius:8px;font-size:.9rem;font-weight:700;text-decoration:none">
          <i class="bi bi-box-arrow-in-right"></i> Войти
        </a>
        <a href="./login-ru.html?tab=register" style="text-align:center;padding:9px;background:#00c896;color:#000;border-radius:8px;font-size:.9rem;font-weight:700;text-decoration:none">
          <i class="bi bi-person-plus-fill"></i> Регистрация
        </a>`;
    }
    mobileNav.appendChild(mobileAuth);
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#logoutBtnRu') || e.target.closest('#logoutBtnRuMobile')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
  });
}

// ── E'lon forma: API ga yuborish ────────────────────────
function setupElonFormRu() {
  const form = document.querySelector('#myForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const user = getUser();
    if (!user) { showLoginPromptRu(); return; }

    const formData = new FormData(form);
    const file = formData.get('cardImg');
    const data = {
      fullname: formData.get('fullName'),
      phone:    formData.get('phoneNumber'),
      city:     formData.get('cities'),
      job:      formData.get('jobs'),
    };

    if (!data.fullname || !data.phone || data.city === '0' || data.job === '0') {
      showNotificationRu('Заполните все поля!', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Отправка...';

    const sendIt = async (avatar) => {
      if (avatar) data.avatar = avatar;
      try {
        const res = await fetch(`${API_BASE_RU}/ustalar/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok) {
          showNotificationRu('✅ Ваше объявление отправлено на проверку администратору!', 'success');
          form.reset();
        } else {
          showNotificationRu('❌ Ошибка: ' + result.error, 'error');
        }
      } catch {
        showNotificationRu('❌ Не удалось подключиться к серверу', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    };

    if (file && file.size > 0) {
      const reader = new FileReader();
      reader.onload = () => sendIt(reader.result);
      reader.readAsDataURL(file);
    } else {
      sendIt(null);
    }
  }, true);
}

// ── Tasdiqlangan ustalarni yuklash ──────────────────────
function loadApprovedUstalarRu() {
  const cardsParent = document.querySelector('.cards');
  if (!cardsParent) return;

  fetch(`${API_BASE_RU}/ustalar`)
    .then(r => r.json())
    .then(ustalar => {
      document.querySelectorAll('.api-usta-card-ru').forEach(el => el.remove());
      ustalar.forEach(u => {
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 api-usta-card-ru';
        col.innerHTML = `
          <div class="card" style="position:relative">
            <span style="position:absolute;top:8px;right:8px;background:#00c896;color:#000;font-size:.68rem;padding:3px 8px;border-radius:20px;font-weight:800;z-index:1">✓ Подтверждён</span>
            <img src="${u.avatar || '../img/bg-main.jpg'}" alt="${u.fullname}" />
            <div class="card-body">
              <div>${u.fullname}</div>
              <p><b>Специализация:</b> ${u.job}</p>
              <p><b>Город:</b> ${u.city}</p>
              <p><b>Телефон:</b> ${u.phone}</p>
            </div>
          </div>`;
        cardsParent.prepend(col);
      });
    })
    .catch(() => {});
}

// ── Login kerak modal ───────────────────────────────────
function showLoginPromptRu() {
  const existing = document.getElementById('loginPromptRu');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'loginPromptRu';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `
    <div style="background:#111827;border:1px solid #1e2d3d;border-radius:20px;padding:36px 32px;max-width:380px;width:90%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,.6)">
      <div style="font-size:2.8rem;margin-bottom:12px">🔐</div>
      <h3 style="color:#e2e8f0;font-size:1.15rem;font-weight:700;margin-bottom:8px">Требуется авторизация</h3>
      <p style="color:#64748b;font-size:.88rem;margin-bottom:24px;line-height:1.5">Для размещения объявления необходимо войти в систему или зарегистрироваться</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <a href="./login-ru.html" style="padding:10px 22px;background:#00c896;color:#000;border-radius:10px;font-weight:700;font-size:.88rem;text-decoration:none">Войти</a>
        <a href="./login-ru.html?tab=register" style="padding:10px 22px;background:rgba(0,200,150,.12);border:1px solid rgba(0,200,150,.3);color:#00c896;border-radius:10px;font-weight:700;font-size:.88rem;text-decoration:none">Регистрация</a>
        <button onclick="document.getElementById('loginPromptRu').remove()" style="padding:10px 14px;background:transparent;border:1px solid #1e2d3d;color:#64748b;border-radius:10px;cursor:pointer;font-size:.88rem">Закрыть</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ── Notification ────────────────────────────────────────
function showNotificationRu(msg, type = 'success') {
  const t = document.createElement('div');
  const ok = type === 'success';
  t.style.cssText = `
    position:fixed;top:24px;right:24px;z-index:9999;
    background:${ok ? 'rgba(0,200,150,.15)' : 'rgba(255,71,87,.15)'};
    border:1px solid ${ok ? 'rgba(0,200,150,.4)' : 'rgba(255,71,87,.4)'};
    color:${ok ? '#00c896' : '#ff4757'};
    padding:14px 20px;border-radius:12px;font-size:.88rem;font-weight:600;
    max-width:340px;box-shadow:0 10px 30px rgba(0,0,0,.4);
    font-family:inherit;line-height:1.4;
    animation:ruToastIn .3s ease;
  `;
  t.innerHTML = `<style>@keyframes ruToastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}</style>${msg}`;
  document.body.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 4000);
}

// ── Init ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  renderAuthButtonsRu();
  setupElonFormRu();
  loadApprovedUstalarRu();
});
