// scripts.js — Nav va karta ko'rsatish (e'lon berish auth.js ga o'tdi)
window.addEventListener("DOMContentLoaded", () => {
  // ── Mobile nav ──────────────────────────────────────────
  const menuBtn = document.querySelector(".menu-btn"),
    closeMenuBtn = document.querySelector(".close-btn"),
    navBar = document.querySelector(".navbar-list");

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      navBar.classList.add("show");
      navBar.classList.remove("hide");
      menuBtn.classList.add("hide");
      closeMenuBtn.classList.remove("hide");
    });
  }

  if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", () => {
      navBar.classList.add("hide");
      menuBtn.classList.remove("hide");
      closeMenuBtn.classList.add("hide");
    });
  }

  // ── E'lon berish ────────────────────────────────────────
  // ESLATMA: E'lon berish mantig'i auth.js ga ko'chirildi.
  // auth.js capture-phase listener ishlatadi, shuning uchun
  // bu yerda alohida submit handler kerak emas.
  // auth.js /js/auth.js ga qo'ying va scripts.js DAN KEYIN ulang.

  // ── Eski localStorage ustalarni ko'rsatmash (BEKOR QILINGAN) ──
  // Endi faqat admin tasdiqlagan ustalar api orqali ko'rinadi.
  // auth.js -> loadApprovedUstalar() buni boshqaradi.
});
