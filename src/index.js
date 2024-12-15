require("dotenv").config();
const axios = require("axios");
const bodyParser = require("body-parser");
const express = require("express");
const OpenAIApi = require("openai");
const Configuration = require("openai");

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json()); // This will parse JSON bodies
app.use(express.static("public"));

// OpenAI Client Initialization
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const assistantId = process.env.ASSISTANT_ID;
let runId = "";
// OpenWeather API Settings
const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
const openWeatherUrl = "https://api.openweathermap.org/data/2.5/weather";

// Set up a Thread
async function createThread() {
  console.log("Creating a new thread...");
  const thread = await openai.beta.threads.create({});
  console.log("Thread created:", thread.id);
  return thread;
}

// Function to Extract City Name
async function getCityFromChat(res, message, thread) {
  try {
    const addMessage = await openai.beta.threads.messages.create(thread, {
      role: "user",
      content: message,
    });
    console.log("Message added to the thread:", addMessage.id);
    const run = await openai.beta.threads.runs.create(thread, {
      assistant_id: assistantId,
    });
    runId = run.id;
    console.log("Run created:", run.id);
    let runObject;
    do {
      runObject = await openai.beta.threads.runs.retrieve(thread, run.id);
      console.log("RunObject Status:", runObject.status);
      if (runObject.status === "completed") {
        const messagesList = await openai.beta.threads.messages.list(thread);
        const messages = messagesList.body.data;
        const recentUserMessage = messages
          .filter((message) => message.role === "user")
          .slice(0)[0];
        const recentAssistantResponse = messages
          .filter((message) => message.role === "assistant")
          .slice(0)[0];
        console.log("Recent User Message:", recentUserMessage?.content);
        console.log(
          "Recent Assistant Response:",
          recentAssistantResponse?.content
        );
        res.json({
          query: recentUserMessage?.content[0]?.text?.value,
          response: recentAssistantResponse.content[0]?.text?.value,
        });
      } else if (runObject.status === "failed") {
        throw new Error(`Run failed: ${JSON.stringify(runObject)}`);
      } else if (runObject.status === "requires_action") {
        const toolCalls =
          runObject.required_action.submit_tool_outputs.tool_calls;
        for (const toolCall of toolCalls) {
          if (
            toolCall.type === "function" &&
            toolCall.function.name === "get_city"
          ) {
            const cityInfo = JSON.parse(toolCall.function.arguments);
            if (!cityInfo.city_name) {
              console.log("City Name not found in the required action.");
              throw new Error("City name not found in the required action.");
            }

            const weatherDetails = await getWeatherByCity(cityInfo.city_name);

            if (weatherDetails) {
              console.log("Weather Details:", weatherDetails);
              console.log("City Name:", cityInfo.city_name);
              const weatherResponse = `
                Here is the weather information for ${weatherDetails.city}:
                - Temperature: ${weatherDetails.temperature}°C
                - Weather: ${weatherDetails.weather}
                - Humidity: ${weatherDetails.humidity}%
                - Wind Speed: ${weatherDetails.windSpeed} m/s
              `;
              const resonse = await openai.beta.threads.runs.submitToolOutputs(
                thread,
                run.id,
                {
                  tool_outputs: [
                    {
                      tool_call_id: toolCall.id,
                      output: weatherResponse,
                    },
                  ],
                }
              );
              console.log("toolCall.id:", toolCall.id);
              console.log("Weather response appended to the thread.", resonse);
            }
          }
        }
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } while (
      ["queued", "in_progress", "requires_action", "completed"].includes(
        runObject.status
      )
    );
  } catch (error) {
    console.error("Error in getCityFromChat:", error);
    throw error;
  }
}

// Function to Get Weather Data
async function getWeatherByCity(cityName) {
  try {
    const response = await axios.get(openWeatherUrl, {
      params: {
        q: cityName,
        appid: openWeatherApiKey,
        units: "metric",
      },
    });

    const data = response.data;

    return {
      city: data.name,
      temperature: data.main.temp,
      weather: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
    };
  } catch (error) {
    console.error(`Error fetching weather data: ${error.message}`);
    return null;
  }
}

function addSpacesToWords(inputString) {
  const result = inputString.replace(/([.,?!;])/, " $1");
  return result.split(" ").join(" ");
}

app.get("/thread", (req, res) => {
  createThread().then((thread) => {
    res.json({ threadId: thread.id });
  });
});

app.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;
  const messageString = addSpacesToWords(message);
  console.log("Thread ID:", threadId);
  console.log("Chat Message Received:", messageString);

  try {
    await getCityFromChat(res, messageString, threadId);
    let runObject;
    do {
      runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
      console.log("RunObject Status:", runObject.status);
      if (
        runObject.status === "completed" ||
        runObject.status === "failed" ||
        runObject.status === "requires_action" ||
        runObject.status === "in_progress"
      ) {
        const messagesList = await openai.beta.threads.messages.list(threadId);
        console.log("Messages List:", messagesList.body.data);
        const messages = messagesList.body.data;
        const recentUserMessage = messages
          .filter((message) => message.role === "user")
          .slice(0)[0];
        const recentAssistantResponse = messages
          .filter((message) => message.role === "assistant")
          .slice(0)[0];
        console.log("Recent User Message:", recentUserMessage?.content);
        console.log(
          "Recent Assistant Response : ",
          recentAssistantResponse?.content
        );
        if (
          !recentAssistantResponse ||
          !recentAssistantResponse.content.length
        ) {
          console.error("Assistant response is empty.");
          return res.json({
            query: recentUserMessage?.content[0]?.text?.value,
            response: "Sorry, I couldn't retrieve the weather information.",
          });
        }
        return res.json({
          query: recentUserMessage?.content[0]?.text?.value,
          response: recentAssistantResponse.content[0]?.text?.value,
        });
      }
    } while (
      ["queued", "in_progress", "requires_action", "completed"].includes(
        runObject.status
      )
    );
  } catch (error) {
    console.error("Error in POST /chat:", error);
  }
});

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
