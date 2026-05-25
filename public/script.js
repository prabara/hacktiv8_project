const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");

/* =========================
   STATE CHAT
========================= */

let conversation = [
  {
    role: "model",
    text: "Assalamu’alaikum 👋 Ada yang bisa saya bantu?"
  }
];

/* =========================
   CHATBOT
========================= */

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const message = input.value.trim();

  if (!message) return;

  // tampilkan user message
  addMessage(message, "user");

  // simpan ke conversation
  conversation.push({
    role: "user",
    text: message
  });

  input.value = "";

  // loading bubble
  const loading = addMessage("Mengetik...", "bot");

  try {

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        conversation
      })
    });

    const data = await response.json();

    // hapus loading
    loading.remove();

    if (data.error) {

      addMessage("Terjadi kesalahan: " + data.error, "bot");
      return;

    }

    // tampilkan balasan AI
    addMessage(data.message, "bot");

    // simpan history AI
    conversation.push({
      role: "model",
      text: data.message
    });

  } catch (error) {

    loading.remove();

    addMessage("Server error gan 😅", "bot");

    console.error(error);

  }

});

/* =========================
   MESSAGE UI
========================= */

function addMessage(text, sender) {

  const div = document.createElement("div");

  div.classList.add("message", sender);

  div.innerText = text;

  chatBox.appendChild(div);

  chatBox.scrollTop = chatBox.scrollHeight;

  return div;
}

/* =========================
   DETEKSI LOKASI
========================= */

const locationText = document.getElementById("location");

if (navigator.geolocation) {

  navigator.geolocation.getCurrentPosition(async (position) => {

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );

      const geoData = await geoRes.json();

      const city =
        geoData.address.city ||
        geoData.address.town ||
        geoData.address.county ||
        geoData.address.state;

      locationText.innerText = city;

      getPrayerTimes(city);

    } catch (err) {

      locationText.innerText = "Lokasi tidak ditemukan";

    }

  });

} else {

  locationText.innerText = "Browser tidak mendukung GPS";

}

/* =========================
   JADWAL SHOLAT
========================= */

async function getPrayerTimes(city){

  try {

    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Indonesia&method=11`
    );

    const data = await response.json();

    const timings = data.data.timings;

    document.getElementById("fajr").innerText = timings.Fajr;
    document.getElementById("dhuhr").innerText = timings.Dhuhr;
    document.getElementById("asr").innerText = timings.Asr;
    document.getElementById("maghrib").innerText = timings.Maghrib;
    document.getElementById("isha").innerText = timings.Isha;

  } catch (error) {

    console.log(error);

  }

}