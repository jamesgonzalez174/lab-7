async function runLab() {

  // 1️⃣ API #1 — Get public IP
  const ipRes = await fetch("https://api.ipify.org?format=json");
  const ipData = await ipRes.json();
  const ip = ipData.ip;
  document.getElementById("ip").innerText = "Your IP: " + ip;


  // 2️⃣ API #2 — Get location using the IP
  const locRes = await fetch(`https://ipapi.co/${ip}/json/`);
  const loc = await locRes.json();
  document.getElementById("location").innerText =
    `Location: ${loc.city}, ${loc.region}, ${loc.country_name}`;

  const { latitude, longitude } = loc;


  // 3️⃣ API #3 — Get weather using lat/lon (from API #2)
  const weatherRes1 = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );
  const weatherData1 = await weatherRes1.json();
  document.getElementById("weather1").innerText =
    "Weather (via lat/lon): " + weatherData1.current_weather.temperature + "°C";


  // 4️⃣ API #4 — Weather using city name (different API)
  const weatherRes2 = await fetch(`https://wttr.in/${loc.city}?format=j1`);
  const weatherData2 = await weatherRes2.json();
  document.getElementById("weather2").innerText =
    "Weather (via city name): " +
    weatherData2.current_condition[0].temp_C + "°C";
}

runLab();
