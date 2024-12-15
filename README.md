# Real-Time Weather Information Feature

Develop a functionality within the AI assistant to fetch and display real-time weather information for a specified city using OpenAI's Assistant Tools and the OpenWeather API. This feature will allow the assistant to provide weather updates as part of the conversation, helping users plan activities like outdoor photo shoots or other weather-dependent events.

## Key Components:
### OpenWeather API Integration:
Use the OpenWeather API to fetch current weather data for a given city. API response includes weather conditions, temperature, humidity, wind speed, etc.

### OpenAI Assistant Integration:
Use OpenAI’s Assistant Tools to manage the conversation flow. The assistant will prompt the user for the city they want weather information about and then use the OpenWeather API to retrieve and display this data.

### User Interaction:
Users can specify a city, and the assistant will return the current weather conditions, including:
- Temperature (in Celsius or Fahrenheit)
- Weather conditions (e.g., clear, cloudy, rainy)
- Wind speed
- Humidity
This information can be displayed in an easy-to-read format as part of the ongoing conversation.

### Workflow:
- User Request: The user asks the assistant for weather updates for a specific city, e.g., "What’s the weather like in Paris today?"
- Assistant Query: The assistant receives the city name from the user input.
- API Call: The assistant makes a request to the OpenWeather API with the specified city to fetch real-time weather data.
- Data Display: The assistant processes the weather data and responds with a concise, informative message displaying the current weather conditions in the specified city.
- Response Example: The assistant responds with: The current weather in Paris is 18°C with clear skies. The wind is calm at 5 km/h, and the humidity is 65%. Would you like to know more?

### Technologies:
- OpenWeather API: To get real-time weather data.
- OpenWeather API Documentation
- OpenAI Assistant Tools: To handle the natural language processing and conversation flow.

# Installation

### 1. Clone the repository:
- git clone <repository_url>
- cd weather-information

### 2. Install dependencies:
- npm install

### 3. Set up environment variables: Create a .env file in the root directory and configure your API key and other environment variables:
- OPENAI_API_KEY=your_api_key_here
- ASSISTANT_ID=your_api_key_here
- OPENWEATHER_API_KEY=your_api_key_here
- API_KEY=your_api_key_here
- PORT=3000

### 4. Start the development server:
- npm start

### 5. Dependencies
The application uses the following NPM packages:
- axios: For making HTTP requests.
- body-parser: For parsing incoming request bodies.
- dotenv: For managing environment variables.
- ejs: For rendering dynamic templates.
- express: Web framework for building the server.
- ngrok: For creating secure tunnels to localhost.
- nodemon: For monitoring changes and restarting the server automatically.
- openai: To interact with OpenAI APIs (if required for features).

### 6. Usage
Start the application: npm start

Open your browser and navigate to http://localhost:<PORT> (default port is 3000).

Use the interface to fetch weather information by entering the required details.

### 7. License
This project is licensed under the MIT License.


## Author: Usman Mahmood

Version: 1.0.0

Make sure to replace `<repository_url>` and `[Your Name]` with the actual repository link and your name. If you have additional details about the project, feel free to expand the documentation further!
