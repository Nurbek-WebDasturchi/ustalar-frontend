window.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search-input"),
    searchBtn = document.querySelector(".search-btn"),
    modal = document.querySelector(".custom-modal"),
    closeModal = document.querySelector(".close-modal"),
    results = document.querySelector(".results");

  let ustalar = [];

  // 1️⃣ JSON faylni yuklash
  fetch("/dataBase/data.json")
    .then((response) => response.json())
    .then((data) => {
      ustalar = data;
    })
    .catch((err) => console.error("JSON yuklanmadi", err));

  // 2️⃣ Qidiruv funksiyasi
  function searchUstalar(query) {
    query = query.toLowerCase();
    return ustalar.filter(
      (usta) =>
        usta.ism_familya_yoki_shirkat.toLowerCase().includes(query) ||
        usta.mutaxasislik.toLowerCase().includes(query) ||
        usta.shahar.toLowerCase().includes(query),
    );
  }

  // 3️⃣ Qidiruv tugmasi
  searchBtn.addEventListener("click", () => {
    const value = searchInput.value.trim();
    const filtered = searchUstalar(value);

    results.innerHTML = ""; // eski natijalarni tozalash
    modal.classList.remove("hide");

    if (filtered.length === 0) {
      results.innerHTML = "<p class='text-white'>Hech narsa topilmadi</p>";
      return;
    }

    filtered.forEach((usta) => {
      const container = document.createElement("div");
      container.classList.add("mb-3", "p-2", "border", "rounded");
      container.innerHTML = `
        <h5 class="text-success">${usta.ism_familya_yoki_shirkat}</h5>
        <p class="color"><b>Mutaxassislik:</b> ${usta.mutaxasislik}</p>
        <p class="color"><b>Shahar:</b> ${usta.shahar}</p>
        <p class="color"><b>Telefon:</b> ${usta.telefon}</p>
      `;
      results.appendChild(container);
    });
  });

  // 4️⃣ Modalni yopish
  closeModal.addEventListener("click", () => {
    modal.classList.add("hide");
    searchInput.value = "";
    results.innerHTML = ""; // yopilganda natijani tozalash
  });
});
