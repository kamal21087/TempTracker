import './styles/jass.css';


// * All necessary DOM elements selected
const searchForm: HTMLFormElement = document.getElementById(
  'search-form'
) as HTMLFormElement;
const searchInput: HTMLInputElement = document.getElementById(
  'search-input'
) as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById(
  'history'
) as HTMLDivElement;
const heading: HTMLHeadingElement = document.getElementById(
  'search-title'
) as HTMLHeadingElement;
const weatherIcon: HTMLImageElement = document.getElementById(
  'weather-img'
) as HTMLImageElement;
const tempEl: HTMLParagraphElement = document.getElementById(
  'temp'
) as HTMLParagraphElement;
const windEl: HTMLParagraphElement = document.getElementById(
  'wind'
) as HTMLParagraphElement;
const humidityEl: HTMLParagraphElement = document.getElementById(
  'humidity'
) as HTMLParagraphElement;

/*

API Calls

*/

const fetchWeather = async (cityName: string) => {
  try {
    const response = await fetch('/api/weather/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ city: cityName }),
    });

    const weatherData = await response.json();
    console.log('weatherData:', weatherData);
    console.log('Current Weather Data:', weatherData.currentWeather); // Log full object
    console.log('Temperature (C):', weatherData.currentWeather?.temperature);

    // Check if data is structured correctly
    if (weatherData.currentWeather && weatherData.forecast) {
      renderCurrentWeather({
        city: weatherData.currentWeather.city, // Correctly pass the city name
        date: weatherData.currentWeather.date,
        icon: weatherData.currentWeather.icon,
        iconDescription: weatherData.currentWeather.description,
        temperature: weatherData.currentWeather.temperature,
        windSpeed: weatherData.currentWeather.windSpeed,
        humidity: weatherData.currentWeather.humidity,
      });
      renderForecast(weatherData.forecast);
    } else {
      console.error('Unexpected weather data format:', weatherData);
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
};

// Fetch the search history
const fetchSearchHistory = async (): Promise<Response> => {
  const response = await fetch('/api/weather/history', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response;
};

// Delete a city from the search history
const deleteCityFromHistory = async (id: string): Promise<void> => {
  await fetch(`/api/weather/history/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/*

Render Functions

*/

// Helper function to convert Celsius to Fahrenheit
const celsiusToFahrenheit = (celsius: number): number => (celsius * 9) / 5 + 32;

const renderCurrentWeather = (currentWeather: {
  city: string;
  date: string;
  icon: string;
  iconDescription: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
}): void => {
  if (!currentWeather) {
    console.error('Current weather data is missing.');
    return;
  }

  const { city, date, icon, iconDescription, temperature, windSpeed, humidity } = currentWeather;

  // Check if the city is being correctly passed
  console.log('Rendering weather for city:', city);

  heading.textContent = `${city || 'Unknown City'} (${date || 'N/A'})`;
  weatherIcon.setAttribute('src', icon ? `https://openweathermap.org/img/w/${icon}.png` : '');
  weatherIcon.setAttribute('alt', iconDescription || 'No description');
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);

  // Convert Celsius to Fahrenheit if necessary
  const temperatureF = temperature !== undefined ? celsiusToFahrenheit(temperature).toFixed(2) : 'N/A';
  console.log('Temperature (C):', temperature);
  console.log(`Converted Temperature (F): ${temperatureF}`);

  tempEl.textContent = `Temp: ${temperatureF}°F`;
  windEl.textContent = `Wind: ${windSpeed !== undefined ? windSpeed : 'N/A'} MPH`;
  humidityEl.textContent = `Humidity: ${humidity !== undefined ? humidity : 'N/A'} %`;

  if (todayContainer) {
    todayContainer.innerHTML = '';
    todayContainer.append(heading, tempEl, windEl, humidityEl);
  }
};

const renderForecast = (forecast: Array<{
  date: string;
  icon: string;
  iconDescription: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
}>): void => {
  if (!forecast || forecast.length === 0) {
    console.error('No forecast data available.');
    return;
  }

  const headingCol = document.createElement('div');
  const heading = document.createElement('h4');
  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  if (forecastContainer) {
    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
    forecast.forEach(renderForecastCard);
  }
};

const renderForecastCard = (forecast: {
  date: string;
  icon: string;
  iconDescription: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
}): void => {
  const { date, icon, iconDescription, temperature, windSpeed, humidity } = forecast;
  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();

  cardTitle.textContent = date || 'N/A';
  weatherIcon.setAttribute('src', icon ? `https://openweathermap.org/img/w/${icon}.png` : '');
  weatherIcon.setAttribute('alt', iconDescription || 'No description');
  tempEl.textContent = `Temp: ${temperature !== undefined ? celsiusToFahrenheit(temperature).toFixed(2) : 'N/A'} °F`;
  windEl.textContent = `Wind: ${windSpeed !== undefined ? windSpeed : 'N/A'} MPH`;
  humidityEl.textContent = `Humidity: ${humidity !== undefined ? humidity : 'N/A'} %`;

  if (forecastContainer) {
    forecastContainer.append(col);
  }
};

const renderSearchHistory = async (searchHistory: Response): Promise<void> => {
  try {
    const historyList = await searchHistory.json();

    if (searchHistoryContainer) {
      searchHistoryContainer.innerHTML = '';

      if (!Array.isArray(historyList) || historyList.length === 0) {
        searchHistoryContainer.innerHTML = '<p class="text-center">No Previous Search History</p>';
        return;
      }

      historyList.reverse().forEach((city: any) => {
        const historyItem = buildHistoryListItem(city);
        searchHistoryContainer.append(historyItem);
      });
    }
  } catch (error) {
    console.error('Failed to render search history:', error);
  }
};

/*

Helper Functions

*/

const createForecastCard = () => {
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add('col-auto');
  card.classList.add(
    'forecast-card',
    'card',
    'text-white',
    'bg-primary',
    'h-100'
  );
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
};

const createHistoryButton = (city: string) => {
  const btn = document.createElement('button');
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-controls', 'today forecast');
  btn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  btn.textContent = city;

  return btn;
};

const createDeleteButton = () => {
  const delBtnEl = document.createElement('button');
  delBtnEl.setAttribute('type', 'button');
  delBtnEl.classList.add(
    'fas',
    'fa-trash-alt',
    'delete-city',
    'btn',
    'btn-danger',
    'col-2'
  );

  delBtnEl.addEventListener('click', handleDeleteHistoryClick);
  return delBtnEl;
};

const createHistoryDiv = () => {
  const div = document.createElement('div');
  div.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  return div;
};

const buildHistoryListItem = (city: any) => {
  const newBtn = createHistoryButton(city.name);
  const deleteBtn = createDeleteButton();
  deleteBtn.dataset.city = JSON.stringify(city);
  const historyDiv = createHistoryDiv();
  historyDiv.append(newBtn, deleteBtn);
  return historyDiv;
};

/*

Event Handlers

*/

const handleSearchFormSubmit = (event: any): void => {
  event.preventDefault();
  console.log('Submit button clicked'); // Log to confirm function trigger

  if (!searchInput.value) {
    console.error('City input is blank'); // Log error if input is empty
    throw new Error('City cannot be blank');
  }

  const search: string = searchInput.value.trim();
  console.log('City searched:', search); // Log the city name being searched

  fetchWeather(search)
    .then(() => {
      console.log('Fetched weather data successfully'); // Log if fetch is successful
      getAndRenderHistory();
    })
    .catch((error) => console.error('Error fetching weather data:', error)); // Log any errors
  searchInput.value = '';
};

const handleSearchHistoryClick = (event: any) => {
  if (event.target.matches('.history-btn')) {
    const city = event.target.textContent;
    console.log('History item clicked:', city); // Log which city was clicked
    fetchWeather(city)
      .then(() => {
        console.log('Fetched weather from history successfully');
        getAndRenderHistory();
      })
      .catch((error) => console.error('Error fetching weather from history:', error)); // Log any errors
  }
};

const handleDeleteHistoryClick = (event: any) => {
  event.stopPropagation();
  const cityID = JSON.parse(event.target.getAttribute('data-city')).id;
  console.log('Deleting city with ID:', cityID); // Log which city is being deleted
  deleteCityFromHistory(cityID)
    .then(() => {
      console.log('Deleted city from history successfully');
      getAndRenderHistory();
    })
    .catch((error: any) => console.error('Error deleting city from history:', error));

};

/*

Initial Render

*/

const getAndRenderHistory = () =>
  fetchSearchHistory().then(renderSearchHistory);

searchForm?.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer?.addEventListener('click', handleSearchHistoryClick);

getAndRenderHistory();
