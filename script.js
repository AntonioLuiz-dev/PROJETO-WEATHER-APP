const API_KEY = "51bf6f6f97a5bd5f6458a5a91fa1520c";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const geoBtn = document.getElementById("geo-btn");
const toggleUnitBtn = document.getElementById("toggle-unit");

const weatherInfo = document.getElementById("weather-info");
const errorEl = document.getElementById("error");

const cityNameEl = document.getElementById("city-name");
const tempEl = document.getElementById("temperature");
const iconEl = document.getElementById("weather-icon");
const descEl = document.getElementById("description");
const feelsEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");

const forecastEl = document.getElementById("forecast");
const hourlyCarousel = document.getElementById("hourly-carousel");

const canvas = document.getElementById("tempChart");
const ctx = canvas.getContext("2d");

let isCelsius = true;
let cachedData = null;

/* 🔍 BUSCA */
searchBtn.onclick = () => cityInput.value && fetchCity(cityInput.value);

/* 🌡️ TOGGLE °C / °F */
toggleUnitBtn.onclick = () => {
  isCelsius = !isCelsius;
  toggleUnitBtn.textContent = isCelsius
    ? "Alternar °C / °F"
    : "Alternar °F / °C";

  if (cachedData) {
    renderWeather(cachedData);
  }
};

/* 📍 GEOLOCALIZAÇÃO */
geoBtn.onclick = () => {
  navigator.geolocation.getCurrentPosition(
    pos => fetchCoords(pos.coords.latitude, pos.coords.longitude),
    () => alert("Não foi possível acessar sua localização 😕")
  );
};

function fetchCity(city) {
  fetchWeather(`q=${city}`);
}

function fetchCoords(lat, lon) {
  fetchWeather(`lat=${lat}&lon=${lon}`);
}

async function fetchWeather(query) {
  try {
    errorEl.classList.add("hidden");

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?${query}&appid=${API_KEY}&lang=pt_br&units=metric`
    );

    if (!res.ok) throw new Error();

    cachedData = await res.json();
    renderWeather(cachedData);
  } catch {
    weatherInfo.classList.add("hidden");
    errorEl.classList.remove("hidden");
  }
}

/* 🔄 RENDER PRINCIPAL */
function renderWeather(data) {
  weatherInfo.classList.remove("hidden");

  const current = data.list[0];

  cityNameEl.textContent = `${data.city.name}, ${data.city.country}`;
  tempEl.textContent = `${convertTemp(current.main.temp)}°${isCelsius ? "C" : "F"}`;
  feelsEl.textContent = `${convertTemp(current.main.feels_like)}°`;
  descEl.textContent = current.weather[0].description;
  humidityEl.textContent = `${current.main.humidity}%`;
  windEl.textContent = `${current.wind.speed} km/h`;

  iconEl.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
  iconEl.loading = "lazy";

  renderHourly(data.list.slice(0, 8));
  renderForecast(data.list);
  renderChart(data.list);
}

/* 🌡️ CONVERSÃO CORRETA */
function convertTemp(tempCelsius) {
  return Math.round(
    isCelsius ? tempCelsius : (tempCelsius * 9) / 5 + 32
  );
}

/* 🕒 PREVISÃO HORÁRIA (CARROSSEL INFINITO) */
function renderHourly(hours) {
  hourlyCarousel.innerHTML = "";

  [...hours, ...hours].forEach(h => {
    hourlyCarousel.innerHTML += `
      <div class="hour">
        <strong>${new Date(h.dt * 1000).getHours()}h</strong>
        <img loading="lazy" src="https://openweathermap.org/img/wn/${h.weather[0].icon}.png">
        <span>${convertTemp(h.main.temp)}°</span>
      </div>
    `;
  });
}

/* 📅 PREVISÃO DIÁRIA */
function renderForecast(list) {
  forecastEl.innerHTML = "";

  list
    .filter(i => i.dt_txt.includes("12:00:00"))
    .slice(0, 5)
    .forEach(d => {
      forecastEl.innerHTML += `
        <div class="forecast-card">
          <p>${new Date(d.dt * 1000).toLocaleDateString("pt-BR", {
            weekday: "short"
          })}</p>
          <img loading="lazy" src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png">
          <strong>${convertTemp(d.main.temp)}°</strong>
          <div class="tooltip">
            ${d.weather[0].description}<br>
            💧 ${d.main.humidity}%<br>
            🌬️ ${d.wind.speed} km/h
          </div>
        </div>
      `;
    });
}

/* 📊 GRÁFICO */
function renderChart(list) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.width = canvas.offsetWidth;
  canvas.height = 160;

  const tempsCelsius = list
    .filter(i => i.dt_txt.includes("12:00:00"))
    .slice(0, 5)
    .map(d => d.main.temp);

  const temps = tempsCelsius.map(t => convertTemp(t));
  const max = Math.max(...temps);
  const min = Math.min(...temps);

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();

  temps.forEach((t, i) => {
    const x = (canvas.width / (temps.length - 1)) * i;
    const y =
      canvas.height -
      ((t - min) / (max - min)) * (canvas.height - 20) -
      10;

    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });

  ctx.stroke();
}