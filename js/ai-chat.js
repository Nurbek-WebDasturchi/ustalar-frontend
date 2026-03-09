const form = document.querySelector("form");
const input = document.querySelector(".typer");
const chat = document.querySelector(".chat");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  // USER MESSAGE
  const askPocket = document.createElement("div");
  askPocket.className = "ask-pocket";

  const askValue = document.createElement("div");
  askValue.className = "ask";
  askValue.innerText = message;

  askPocket.appendChild(askValue);
  chat.appendChild(askPocket);

  input.value = "";

  try {
    const res = await fetch(
      "https://ustalar-platformasi-api.onrender.com/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      },
    );

    const data = await res.json();

    console.log("Server response:", data);

    // AI MESSAGE
    const resPocket = document.createElement("div");
    resPocket.className = "response-pocket";

    const resValue = document.createElement("div");
    resValue.className = "response";

    resValue.innerText = data.reply || "AI javob bera olmadi";

    resPocket.appendChild(resValue);
    chat.appendChild(resPocket);

    chat.scrollTop = chat.scrollHeight;
  } catch (error) {
    console.error("Fetch error:", error);

    const errorMsg = document.createElement("div");
    errorMsg.className = "response";
    errorMsg.innerText = "Server bilan ulanishda xato";

    chat.appendChild(errorMsg);
  }
});
