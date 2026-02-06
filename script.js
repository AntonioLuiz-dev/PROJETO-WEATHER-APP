const API_KEY = "51bf6f6f97a5bd5f6458a5a91fa1520c";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
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

let isCelsius = true;
let cachedData = null;

searchBtn.onclick = () => {
  if (cityInput.value) {
    fetchWeather(cityInput.value);
    localStorage.setItem("lastCity", cityInput.value);
  }
};

toggleUnitBtn.onclick = () => {
  isCelsius = !isCelsius;
  if (cachedData) renderWeather(cachedData);
};

async function fetchWeather(city) {
  try {
    errorEl.classList.add("hidden");

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&lang=pt_br&units=metric`
    );

    if (!res.ok) throw new Error();

    const data = await res.json();
    cachedData = data;
    renderWeather(data);
  } catch {
    weatherInfo.classList.add("hidden");
    errorEl.classList.remove("hidden");
  }
}

function renderWeather(data) {
  weatherInfo.classList.remove("hidden");

  const current = data.list[0];
  const temp = convertTemp(current.main.temp);
  const feels = convertTemp(current.main.feels_like);

  cityNameEl.textContent = `${data.city.name}, ${data.city.country}`;
  tempEl.textContent = `${temp}°${isCelsius ? "C" : "F"}`;
  feelsEl.textContent = `${feels}°`;
  descEl.textContent = current.weather[0].description;
  humidityEl.textContent = `${current.main.humidity}%`;
  windEl.textContent = `${current.wind.speed} km/h`;

  iconEl.classList.remove("animate-icon");
  void iconEl.offsetWidth;
  iconEl.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;
  iconEl.loading = "lazy";
  iconEl.classList.add("animate-icon");

  renderHourly(data.list.slice(0, 8));
  renderForecast(data.list);
}

function convertTemp(temp) {
  return Math.round(isCelsius ? temp : (temp * 9/5 + 32));
}

function renderHourly(hours) {
  hourlyCarousel.innerHTML = "";
  const loop = [...hours, ...hours];

  loop.forEach(h => {
    const hour = document.createElement("div");
    hour.className = "hour";

    hour.innerHTML = `
      <strong>${new Date(h.dt * 1000).getHours()}h</strong>
      <img loading="lazy" src="https://openweathermap.org/img/wn/${h.weather[0].icon}.png">
      <span>${convertTemp(h.main.temp)}°</span>
    `;

    hourlyCarousel.appendChild(hour);
  });
}

function renderForecast(list) {
  forecastEl.innerHTML = "";
  const days = [];

  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    if (!days.find(d => d.date === date) && days.length < 5) {
      days.push(item);
    }
  });

  days.forEach(d => {
    const card = document.createElement("div");
    card.innerHTML = `
      <p>${new Date(d.dt * 1000).toLocaleDateString("pt-BR",{weekday:"short"})}</p>
      <img loading="lazy" src="https://openweathermap.org/img/wn/${d.weather[0].icon}.png">
      <strong>${convertTemp(d.main.temp)}°</strong>
    `;
    forecastEl.appendChild(card);
  });
}

const lastCity = localStorage.getItem("lastCity");
if (lastCity) {
  cityInput.value = lastCity;
  fetchWeather(lastCity);
}