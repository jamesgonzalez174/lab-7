/*
  index.js — IP -> Geolocation -> Weather flow
  - Fetch public IP (ipify)
  - Geolocate IP (ipinfo.io)
  - Fetch current weather (Open-Meteo)
  Includes UI updates and error handling.
*/

function showText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function setStatus(msg) {
  showText('flowStatus', msg);
}

async function runLab() {
  setStatus('Fetching public IP...');
  showText('ip', '—');
  showText('location', '—');
  showText('coords', '—');
  showText('weather', '—');

  try {
    const ipRes = await fetch('https://api.ipify.org?format=json');
    if (!ipRes.ok) throw new Error(`IP API error ${ipRes.status}`);
    const ipData = await ipRes.json();
    const ip = ipData.ip || 'unknown';
    showText('ip', ip);

    setStatus('Geolocating IP...');
    // ipinfo gives `loc` as "lat,lon"
    const locRes = await fetch(`https://ipinfo.io/${ip}/json`);
    if (!locRes.ok) throw new Error(`Geolocation API error ${locRes.status}`);
    const locData = await locRes.json();
    const city = locData.city || locData.region || 'Unknown';
    const region = locData.region || '';
    const country = locData.country || '';
    showText('location', `${city}${region ? ', ' + region : ''}${country ? ', ' + country : ''}`);

    const loc = locData.loc || '';
    let latitude = null, longitude = null;
    if (loc) {
      const parts = loc.split(',');
      latitude = parseFloat(parts[0]);
      longitude = parseFloat(parts[1]);
      showText('coords', `${latitude}, ${longitude}`);
    } else if (locData.latitude && locData.longitude) {
      latitude = parseFloat(locData.latitude);
      longitude = parseFloat(locData.longitude);
      showText('coords', `${latitude}, ${longitude}`);
    } else {
      showText('coords', 'Unknown');
    }

    if (latitude == null || isNaN(latitude) || longitude == null || isNaN(longitude)) {
      // If we don't have coordinates, try a city-based weather lookup fallback
      setStatus('Fetching weather by city name (fallback)...');
      try {
        const wttr = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        if (!wttr.ok) throw new Error(`wttr.in error ${wttr.status}`);
        const wttrJson = await wttr.json();
        const tempC = wttrJson.current_condition?.[0]?.temp_C;
        showText('weather', tempC ? `${tempC} °C (via city)` : 'Unavailable');
        setStatus('Done');
        return;
      } catch (err) {
        showText('weather', 'Unavailable — ' + err.message);
        setStatus('Done (partial)');
        return;
      }
    }

    setStatus('Fetching weather by coordinates...');
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`);
    if (!weatherRes.ok) throw new Error(`Weather API error ${weatherRes.status}`);
    const weatherJson = await weatherRes.json();
    const cw = weatherJson.current_weather || {};
    const temp = cw.temperature !== undefined ? `${cw.temperature} °C` : 'N/A';
    const wind = cw.windspeed !== undefined ? `${cw.windspeed} km/h` : 'N/A';
    showText('weather', `${temp} — wind ${wind}`);
    // 4️⃣ API #4 — Fetch weather by city name (wttr.in) using the geolocation result
    setStatus('Fetching weather by city...');
    try {
      const cityForQuery = city || region || country || '';
      if (cityForQuery) {
        const wttrRes = await fetch(`https://wttr.in/${encodeURIComponent(cityForQuery)}?format=j1`);
        if (!wttrRes.ok) throw new Error(`wttr.in error ${wttrRes.status}`);
        const wttrJson = await wttrRes.json();
        const tempC = wttrJson.current_condition?.[0]?.temp_C;
        const feelsLike = wttrJson.current_condition?.[0]?.FeelsLikeC;
        showText('weatherCity', tempC ? `${tempC} °C (feels ${feelsLike} °C)` : 'Unavailable');
      } else {
        showText('weatherCity', 'No city available');
      }
    } catch (errCity) {
      showText('weatherCity', 'Error: ' + errCity.message);
      console.warn('City weather error', errCity);
    }

    setStatus('Done');
  } catch (err) {
    setStatus('Error');
    showText('weather', 'Error: ' + err.message);
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('runFlowBtn');
  if (btn) btn.addEventListener('click', () => {
    runLab();
  });
});
