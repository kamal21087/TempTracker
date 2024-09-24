import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __filename and __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a City class with name and id properties
class City {
  id: string;
  name: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

class HistoryService {
  private filePath = path.join(__dirname, '../../db/db.json'); // Adjusted path to the correct location

  // Read method to read from the searchHistory.json file
  private async read(): Promise<City[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  // Write method to write the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing to history:', error);
    }
  }

  // Get cities method that returns the cities from the searchHistory.json file
  async getCities(): Promise<City[]> {
    return this.read();
  }

  // Add city method to add a city to the searchHistory.json file
  async addCity(name: string): Promise<void> {
    const cities = await this.read();
    const newCity = new City(name, uuidv4());
    cities.push(newCity);
    await this.write(cities);
  }

  // Remove city method to remove a city by ID from the searchHistory.json file
  async removeCity(id: string): Promise<void> {
    const cities = await this.read();
    const updatedCities = cities.filter((city) => city.id !== id);
    await this.write(updatedCities);
  }
}

export default new HistoryService();
