/*
  index.js — Completed Lab Version
  One button per API (Part A + Part B)
*/

/* ==================== PART A — HTTP METHODS ==================== */

const API = "https://jsonplaceholder.typicode.com/todos";

function showOutput(data) {
    document.getElementById("outputBox").textContent =
        typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

// GET
function doGet() {
    fetch(API)
        .then(res => res.json())
        .then(data => showOutput(data));
}

// POST
function doPost() {
    fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 10, title: "POST Example", completed: false })
    })
    .then(res => res.json())
    .then(data => showOutput(data));
}

// PUT
function doPut() {
    fetch(`${API}/5`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1, id: 5, title: "PUT Updated", completed: true })
    })
    .then(res => res.json())
    .then(data => showOutput(data));
}

// PATCH
function doPatch() {
    fetch(`${API}/1`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true })
    })
    .then(res => res.json())
    .then(data => showOutput(data));
}

// DELETE
function doDelete() {
    fetch(`${API}/1`, { method: "DELETE" })
        .then(() => showOutput("Deleted successfully"));
}


/* ==================== PART B — FOUR APIs ==================== */

// 1️⃣ API #1 – Public IP
async function api1() {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    document.getElementById("ip").innerText = data.ip;
    showOutput(data);
}

// 2️⃣ API #2 – Geolocate IP
async function api2() {
    const ip = document.getElementById("ip").innerText;

    if (ip === "—") return alert("Run API #1 first!");

    const res = await fetch(`https://ipinfo.io/${ip}/json`);
    const data = await res.json();

    document.getElementById("location").innerText =
        `${data.city}, ${data.region}, ${data.country}`;

    if (data.loc) {
        document.getElementById("coords").innerText = data.loc;
    }

    showOutput(data);
}

// 3️⃣ API #3 – Weather by Coordinates
async function api3() {
    const coords = document.getElementById("coords").innerText;

    if (coords === "—") return alert("Run API #2 first!");

    const [lat, lon] = coords.split(",");

    const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
    );
    const data = await res.json();

    const cw = data.current_weather;
    document.getElementById("weather").innerText =
        `${cw.temperature}°C — wind ${cw.windspeed} km/h`;

    showOutput(data);
}

// 4️⃣ API #4 – Weather by City
async function api4() {
    const location = document.getElementById("location").innerText;

    if (location === "—") return alert("Run API #2 first!");

    const city = location.split(",")[0];

    const res = await fetch(`https://wttr.in/${city}?format=j1`);
    const data = await res.json();

    const temp = data.current_condition?.[0]?.temp_C;
    const feels = data.current_condition?.[0]?.FeelsLikeC;

    document.getElementById("weatherCity").innerText =
        `${temp}°C (feels like ${feels}°C)`;

    showOutput(data);
}
