import { Router } from 'express';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import WeatherService from '../../service/weatherService'; // Ensure the path is correct
import HistoryService from '../../service/historyService'; // Ensure the path is correct

const router = Router();

// POST: Retrieve weather data for a city and save it to search history
router.post('/', async (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    // Get weather data from the city name
    const weatherData = await WeatherService.getWeatherForCity(city);

    // Save city to search history
    await HistoryService.addCity(city);

    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve weather data' });
  }
});

// GET: Retrieve search history
router.get('/history', async (req, res) => {
  try {
    const history = await HistoryService.getCities();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// DELETE: Remove a city from search history
router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await HistoryService.removeCity(id);
    res.status(204).send(); // No content response indicating successful deletion
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete city from search history' });
  }
});

export default router;
