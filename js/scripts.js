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

  // e'lon berish
  const form = document.querySelector("#myForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const data = {
      fullname: formData.get("fullName"),
      phone: formData.get("phoneNumber"),
      city: formData.get("cities"),
      job: formData.get("jobs"),
    };

    const file = formData.get("cardImg");

    const saveUser = () => {
      let users = JSON.parse(localStorage.getItem("userData"));

      if (!Array.isArray(users)) {
        users = [];
      }

      users.push(data);

      localStorage.setItem("userData", JSON.stringify(users));

      console.log("Saqlangan:", users);
      form.reset();
      alert("E'lon muvaffaqiyatli qo'shildi!");
      location.reload();
    };

    if (file && file.size > 0) {
      const reader = new FileReader();

      reader.onload = function () {
        data.avatar = reader.result;
        saveUser();
      };

      reader.readAsDataURL(file);
    } else {
      saveUser();
    }
  });

  // e'lon ni chiqarish
  const users = JSON.parse(localStorage.getItem("userData")) || [];
  const cardsParent = document.querySelector(".cards");
  users.forEach((user) => {
    const cardColumn = document.createElement("div");
    cardColumn.className = "col-12 col-sm-6 col-md-4 col-lg-3";
    cardColumn.innerHTML = `
      <div class="card">
      <span class="badge-mine">sizniki</span>
        <img src="${user.avatar || "./img/bg-main.jpg"}" alt="Usta img" />
        <div class="card-body">
          <div>${user.fullname}</div>
          <p><b>Mutaxassislik:</b> ${user.job}</p>
          <p><b>Shahar:</b> ${user.city}</p>
          <p><b>Telefon:</b>${user.phone}</p>
        </div>
      </div>
    `;
    cardsParent.prepend(cardColumn);
  });
});
