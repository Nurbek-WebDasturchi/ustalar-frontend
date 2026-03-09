window.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-btn"),
    closeMenuBtn = document.querySelector(".close-btn"),
    navBar = document.querySelector(".navbar-list");
  menuBtn.addEventListener("click", () => {
    navBar.classList.add("show");
    navBar.classList.remove("hide");
    menuBtn.classList.add("hide");
    closeMenuBtn.classList.remove("hide");
  });
  closeMenuBtn.addEventListener("click", () => {
    navBar.classList.add("hide");
    menuBtn.classList.remove("hide");
    closeMenuBtn.classList.add("hide");
  });
});
