const form = document.querySelector("form");
const input = document.querySelector(".typer");
const chat = document.querySelector(".chat");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = input.value;

  if (!message) return;

  // user message
  const askPocket = document.createElement("div");
  askPocket.className = "ask-pocket";
  const askValue = document.createElement("div");
  askValue.className = "ask";
  askValue.innerText = message;
  askPocket.appendChild(askValue);
  chat.appendChild(askPocket);
  // /user message

  input.value = "";

  const res = await fetch("https://ustalar-platformasi-api.onrender.com/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
    }),
  });

  const data = await res.json();

  const resPocket = document.createElement("div");
  resPocket.className = "response-pocket";
  const resValue = document.createElement("div");
  resValue.className = "response";
  resValue.innerText = data.reply;
  resPocket.appendChild(resValue);
  chat.appendChild(resPocket);
  chat.scrollTop = chat.scrollHeight;
});
