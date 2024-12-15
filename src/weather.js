const axios = require("axios");
require("dotenv").config();

const getWeather = async (city) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  try {
    const response = await axios.get(url);
    const { main, weather, wind } = response.data;
    return {
      temperature: `${main.temp}°C`,
      description: weather[0].description,
      humidity: `${main.humidity}%`,
      windSpeed: `${wind.speed} m/s`,
    };
  } catch (error) {
    return {
      error: "Could not fetch weather data. Please check the city name.",
    };
  }
};

module.exports = getWeather;
