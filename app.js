function WeatherApp(apiKey) {
    this.apiKey = "9959cc3764bac55f8282210f11e4e5b6";
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    this.recentSearchesSection = document.getElementById("recent-searches-section");
    this.recentSearchesContainer = document.getElementById("recent-searches-container");
    this.clearBtn = document.getElementById("clear-history-btn");

    this.recentSearches = [];
    this.maxRecentSearches = 5;

    this.init();
}

/* ========= INIT ========= */
WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener("click", this.handleSearch.bind(this));

    this.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") this.handleSearch();
    });

    this.clearBtn.addEventListener("click", this.clearHistory.bind(this));

    this.loadRecentSearches();
    this.loadLastCity();
};

/* ========= SEARCH ========= */
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();
    if (!city) return this.showError("Please enter a city name.");
    this.getWeather(city);
};

/* ========= GET WEATHER ========= */
WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();
    this.searchBtn.disabled = true;

    const weatherUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            axios.get(weatherUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(weatherResponse.data);

        const processedData = this.processForecastData(forecastResponse.list);
        this.displayForecast(processedData);

        this.saveRecentSearch(city);
        localStorage.setItem("lastCity", city);

    } catch (error) {
        this.showError("City not found or API error.");
    } finally {
        this.searchBtn.disabled = false;
    }
};

/* ========= FORECAST ========= */
WeatherApp.prototype.getForecast = async function (city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await axios.get(url);
    return response.data;
};

WeatherApp.prototype.processForecastData = function (list) {
    return list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);
};

/* ========= DISPLAY ========= */
WeatherApp.prototype.displayWeather = function (data) {
    const html = `
        <div class="weather-info">
            <h2 class="city-name">${data.name}</h2>
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" class="weather-icon">
            <div class="temperature">${Math.round(data.main.temp)}°C</div>
            <p class="description">${data.weather[0].description}</p>
        </div>
    `;
    this.weatherDisplay.innerHTML = html;
};

WeatherApp.prototype.displayForecast = function (data) {
    let html = `
        <div class="forecast-section">
            <h3 class="forecast-title">5-Day Forecast</h3>
            <div class="forecast-container">
    `;

    data.forEach(day => {
        const date = new Date(day.dt_txt);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

        html += `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
                <p class="forecast-temp">${Math.round(day.main.temp)}°C</p>
                <p>${day.weather[0].description}</p>
            </div>
        `;
    });

    html += `</div></div>`;
    this.weatherDisplay.innerHTML += html;
};

/* ========= LOCAL STORAGE ========= */
WeatherApp.prototype.loadRecentSearches = function () {
    const saved = localStorage.getItem("recentSearches");
    if (saved) this.recentSearches = JSON.parse(saved);
    this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function (city) {
    const cityName = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    const index = this.recentSearches.indexOf(cityName);
    if (index > -1) this.recentSearches.splice(index, 1);

    this.recentSearches.unshift(cityName);

    if (this.recentSearches.length > this.maxRecentSearches)
        this.recentSearches.pop();

    localStorage.setItem("recentSearches", JSON.stringify(this.recentSearches));
    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {
    this.recentSearchesContainer.innerHTML = "";

    if (this.recentSearches.length === 0) {
        this.recentSearchesSection.style.display = "none";
        return;
    }

    this.recentSearchesSection.style.display = "block";

    this.recentSearches.forEach((city) => {
        const btn = document.createElement("button");
        btn.className = "recent-search-btn";
        btn.textContent = city;

        btn.addEventListener("click", () => {
            this.cityInput.value = city;
            this.getWeather(city);
        });

        this.recentSearchesContainer.appendChild(btn);
    });
};

WeatherApp.prototype.loadLastCity = function () {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) this.getWeather(lastCity);
    else this.showWelcome();
};

WeatherApp.prototype.clearHistory = function () {
    if (confirm("Clear all recent searches?")) {
        this.recentSearches = [];
        localStorage.removeItem("recentSearches");
        this.displayRecentSearches();
    }
};

/* ========= STATES ========= */
WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `<p class="loading">Loading weather data...</p>`;
};

WeatherApp.prototype.showError = function (message) {
    this.weatherDisplay.innerHTML = `<p class="loading">❌ ${message}</p>`;
};

WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `<p class="loading">Search for a city to see weather details.</p>`;
};

/* ========= CREATE APP ========= */
const app = new WeatherApp("9959cc3764bac55f8282210f11e4e5b6");