const API_KEY = "51bf6f6f97a5bd5f6458a5a91fa1520c";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

let unit = "metric";
let autoScrollInterval = null;

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const toggleBtn = document.getElementById("toggle-unit");

const weatherInfo = document.getElementById("weather-info");
const errorEl = document.getElementById("error");
const skeleton = document.getElementById("skeleton");

const cityNameEl = document.getElementById("city-name");
const tempEl = document.getElementById("temperature");
const descEl = document.getElementById("description");
const feelsEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const iconEl = document.getElementById("weather-icon");

const forecastEl = document.getElementById("forecast");
const hourlyEl = document.getElementById("hourly");

async function getWeather(city) {
  try {
    errorEl.classList.add("hidden");
    weatherInfo.classList.add("hidden");
    skeleton.classList.remove("hidden");

    const res = await fetch(
      `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${unit}&lang=pt_br`
    );
    if (!res.ok) throw new Error();

    const data = await res.json();
    localStorage.setItem("lastCity", city);

    updateUI(data);
    getForecast(city);
    getHourly(city);

  } catch {
    skeleton.classList.add("hidden");
    errorEl.classList.remove("hidden");
  }
}

async function getHourly(city) {
  const res = await fetch(
    `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${unit}&lang=pt_br`
  );
  const data = await res.json();

  hourlyEl.innerHTML = "";

  data.list.slice(0, 8).forEach(item => {
    const hour = new Date(item.dt * 1000).getHours().toString().padStart(2, "0");
    const unitSymbol = unit === "metric" ? "C" : "F";

    const div = document.createElement("div");
    div.className = "hour";
    div.innerHTML = `
      <strong>${hour}h</strong>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
      <div>${Math.round(item.main.temp)}°${unitSymbol}</div>
    `;
    hourlyEl.appendChild(div);
  });

  startAutoScroll();
}

function startAutoScroll() {
  stopAutoScroll();
  autoScrollInterval = setInterval(() => {
    hourlyEl.scrollLeft += 1;
    if (hourlyEl.scrollLeft + hourlyEl.clientWidth >= hourlyEl.scrollWidth) {
      hourlyEl.scrollLeft = 0;
    }
  }, 30);
}

function stopAutoScroll() {
  if (autoScrollInterval) clearInterval(autoScrollInterval);
}

hourlyEl.addEventListener("mouseenter", stopAutoScroll);
hourlyEl.addEventListener("mouseleave", startAutoScroll);
hourlyEl.addEventListener("touchstart", stopAutoScroll);
hourlyEl.addEventListener("touchend", startAutoScroll);

async function getForecast(city) {
  const res = await fetch(
    `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${unit}&lang=pt_br`
  );
  const data = await res.json();

  forecastEl.innerHTML = "";

  data.list
    .filter(item => item.dt_txt.includes("12:00:00"))
    .slice(0, 5)
    .forEach(day => {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${new Date(day.dt * 1000).toLocaleDateString("pt-BR", { weekday: "short" })}</strong>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
        <div>${Math.round(day.main.temp)}°</div>
      `;
      forecastEl.appendChild(div);
    });
}

function updateUI(data) {
  const unitSymbol = unit === "metric" ? "C" : "F";

  cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
  tempEl.innerHTML = `${Math.round(data.main.temp)}<span class="unit">°${unitSymbol}</span>`;
  descEl.textContent = data.weather[0].description;

  feelsEl.textContent = `${Math.round(data.main.feels_like)}°${unitSymbol}`;
  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${Math.round(data.wind.speed)} km/h`;

  iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  skeleton.classList.add("hidden");
  weatherInfo.classList.remove("hidden");
}

toggleBtn.onclick = () => {
  unit = unit === "metric" ? "imperial" : "metric";
  const city = localStorage.getItem("lastCity");
  if (city) getWeather(city);
};

searchBtn.onclick = () => {
  if (cityInput.value.trim()) getWeather(cityInput.value.trim());
};

cityInput.addEventListener("keyup", e => {
  if (e.key === "Enter") searchBtn.click();
});

/* 🔁 CARREGA ÚLTIMA CIDADE */
const savedCity = localStorage.getItem("lastCity");
if (savedCity) getWeather(savedCity);