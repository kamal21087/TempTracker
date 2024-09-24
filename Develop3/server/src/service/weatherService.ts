import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Define interfaces
interface Coordinates {
  lat: number;
  lon: number;
}

interface LocationResponse {
  lat: number;
  lon: number;
}

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

class WeatherService {
  private apiKey = process.env.API_KEY || '';

  private async fetchLocationData(city: string): Promise<Coordinates> {
    const response = await axios.get<LocationResponse[]>(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`
    );
    const data = response.data[0];
    if (!data) throw new Error('City not found');
    return { lat: data.lat, lon: data.lon };
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<WeatherResponse> {
    const response = await axios.get<WeatherResponse>(
      `https://api.openweathermap.org/data/2.5/forecast`, {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lon,
          appid: this.apiKey,
          units: 'metric',
        },
      }
    );
    return response.data;
  }

  private parseCurrentWeather(data: WeatherResponse) {
    return new Weather(data.list[0]);
  }

  private buildForecastArray(weatherData: WeatherResponse['list']): Weather[] {
    return weatherData.map((data) => new Weather(data));
  }

  // Get weather for a city by name
  async getWeatherForCity(city: string) {
    const coordinates = await this.fetchLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecast = this.buildForecastArray(weatherData.list.slice(1, 6));

    return {
      currentWeather,
      forecast,
    };
  }
}

export default new WeatherService();
