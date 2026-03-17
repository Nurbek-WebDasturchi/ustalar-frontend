const form = document.querySelector("form");
const input = document.querySelector(".typer");
window.addEventListener("DOMContentLoaded", () => {
  input.focus();
});
const chat = document.querySelector(".chat");
const noMessage = document.querySelector(".no-message");
// uxlab qomasilik uchun

setInterval(() => {
  fetch("https://ustalar-platformasi-api.onrender.com/ping");
}, 300000);
// /uxlab qolmasik uchun.
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  noMessage.classList.add("hide");

  // USER MESSAGE
  const askPocket = document.createElement("div");
  askPocket.className = "ask-pocket";

  const askValue = document.createElement("div");
  askValue.className = "ask";
  askValue.innerText = message;

  askPocket.appendChild(askValue);
  chat.appendChild(askPocket);

  input.value = "";

  // LOADING
  const loading = document.createElement("div");
  loading.className = "response";
  loading.innerHTML = `<p>Yozmoqda...</p><div class="loader"></div> `;

  chat.appendChild(loading);

  chat.scrollTop = chat.scrollHeight;

  try {
    const res = await fetch(
      "https://ustalar-platformasi-api.onrender.com/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      },
    );

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    chat.removeChild(loading);

    const resPocket = document.createElement("div");
    resPocket.className = "response-pocket";

    const resValue = document.createElement("div");
    resValue.className = "response";

    if (res.status === 429) {
      resValue.innerText = "Limit tugadi, keyinroq urinib ko‘ring";
    } else if (!res.ok) {
      resValue.innerText = "Serverda xatolik";
    } else {
      resValue.innerText = data.reply || "AI javob bera olmadi";
    }

    resPocket.appendChild(resValue);
    chat.appendChild(resPocket);

    chat.scrollTop = chat.scrollHeight;
  } catch (error) {
    console.error("Fetch error:", error);

    chat.removeChild(loading);

    const errorMsg = document.createElement("div");
    errorMsg.className = "response";
    errorMsg.innerText = "Server bilan ulanishda xato";

    chat.appendChild(errorMsg);
  }
});
