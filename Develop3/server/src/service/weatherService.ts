import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define an interface for the Location Response
interface LocationResponse {
  lat: number;
  lon: number;
}

// Define an interface for the expected weather data structure
interface WeatherResponse {
  list: {
    dt_txt: string;
    main: {
      temp: number;
      humidity: number;
    };
    weather: {
      description: string;
      icon: string;
    }[];
    wind: {
      speed: number;
    };
  }[];
}

// Define a class for the Weather object
class Weather {
  date: string;
  temperature: number;
  description: string;
  windSpeed: number;
  humidity: number;
  icon: string;

  constructor(data: any) {
    this.date = data.dt_txt;
    this.temperature = data.main.temp;
    this.description = data.weather[0].description;
    this.windSpeed = data.wind.speed;
    this.humidity = data.main.humidity;
    this.icon = data.weather[0].icon;
  }
}

// Complete the WeatherService class
class WeatherService {
  private baseURL = process.env.API_BASE_URL || ''; // Use the base URL from .env
  private apiKey = process.env.API_KEY || ''; // Use the API key from .env

  // Fetch location data by city name
  private async fetchLocationData(city: string): Promise<Coordinates> {
    const response = await axios.get<LocationResponse[]>(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`
    );
    const data = response.data[0];
    if (!data) throw new Error('City not found');
    return { lat: data.lat, lon: data.lon };
  }

  // Fetch weather data using coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<WeatherResponse> {
    const response = await axios.get<WeatherResponse>(this.baseURL, {
      params: {
        lat: coordinates.lat,
        lon: coordinates.lon,
        appid: this.apiKey,
        units: 'metric',
      },
    });
    return response.data;
  }

  // Parse and format the current weather data
  private parseCurrentWeather(data: WeatherResponse) {
    return new Weather(data.list[0]); // Assuming you want the first data point for current weather
  }

  // Build the forecast array for the 5-day forecast
  private buildForecastArray(weatherData: WeatherResponse['list']): Weather[] {
    return weatherData.map((data) => new Weather(data));
  }

  // Get weather for a city by name
  async getWeatherForCity(city: string) {
    const coordinates = await this.fetchLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecast = this.buildForecastArray(weatherData.list.slice(1, 6)); // Adjusting to select the 5-day forecast data

    return {
      currentWeather,
      forecast,
    };
  }
}

export default new WeatherService();
