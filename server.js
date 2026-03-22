// const express = require("express");
// const cors = require("cors");
// const { GoogleGenAI } = require("@google/genai");
// const path = require("path");
// require("dotenv").config();

// const app = express();
// const PORT = 3000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));

// // Root route
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

// // Initialize AI
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// // Store conversation history per session
// const sessions = new Map();

// async function getWeather(locations) {
//   const weatherInfo = [];

//   for (const { city, date } of locations) {
//     try {
//       let url;
//       if (date.toLowerCase() === "today") {
//         url = `http://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}`;
//       } else {
//         url = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&dt=${date}`;
//       }

//       console.log(`🌤️ Fetching weather for ${city} (${date})`);
//       console.log(`URL: ${url}`);

//       const response = await fetch(url);

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error(
//           `❌ Weather API error for ${city}: ${response.status}`,
//           errorText,
//         );
//         throw new Error(`Weather API error: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log(`✅ Weather data received for ${city}`);

//       // Extract relevant weather info
//       let weatherText = "";
//       if (date.toLowerCase() === "today") {
//         weatherText = `${city}: ${data.current.temp_c}°C, ${data.current.condition.text}`;
//       } else {
//         weatherText = `${city} on ${date}: ${data.forecast.forecastday[0].day.avgtemp_c}°C, ${data.forecast.forecastday[0].day.condition.text}`;
//       }

//       weatherInfo.push({
//         city: city,
//         date: date,
//         summary: weatherText,
//         data: data,
//       });
//     } catch (error) {
//       console.error(`❌ Error fetching weather for ${city}:`, error.message);
//       weatherInfo.push({
//         city: city,
//         date: date,
//         error: `Could not fetch weather data for ${city}`,
//         summary: `Sorry, couldn't get weather for ${city}`,
//       });
//     }
//   }

//   return weatherInfo;
// }

// async function processQuery(sessionId, question) {
//   console.log(`\n📝 Processing query for session ${sessionId}: "${question}"`);

//   if (!sessions.has(sessionId)) {
//     sessions.set(sessionId, []);
//     console.log(`🆕 New session created: ${sessionId}`);
//   }

//   const conversationHistory = sessions.get(sessionId);

//   const prompt = `
// You are a friendly weather AI assistant. Respond in JSON format only.
// Analyze the user query and extract city and date details.
// - Date format should be "yyyy-mm-dd" for future dates
// - For today's weather, mark date as "today"

// If weather information is needed, respond with:
// {
//   "weather_details_needed": true,
//   "location": [{"city":"mumbai", "date":"today"}]
// }

// If you have enough weather information to respond, respond with:
// {
//   "weather_details_needed": false,
//   "weather_report": "Your friendly weather summary here"
// }

// User query: ${question}
// Respond only with valid JSON.
// `;

//   conversationHistory.push({
//     role: "user",
//     parts: [{ text: prompt }],
//   });

//   let maxIterations = 3;
//   let iterations = 0;
//   let finalResponse = null;

//   while (iterations < maxIterations && !finalResponse) {
//     iterations++;
//     console.log(`\n🔄 Iteration ${iterations} for session ${sessionId}`);

//     try {
//       console.log(`🤖 Calling Gemini API...`);
//       const response = await ai.models.generateContent({
//         model: "gemini-1.5-flash", // Try 1.5 Flash
//         contents: conversationHistory,
//       });

//       let aiResponse = response.text;
//       console.log(`📥 Raw AI Response: ${aiResponse.substring(0, 200)}...`);

//       conversationHistory.push({
//         role: "model",
//         parts: [{ text: aiResponse }],
//       });

//       // Clean the response
//       aiResponse = aiResponse.replace(/^```json\s*|\s*```$/g, "").trim();
//       console.log(`🧹 Cleaned Response: ${aiResponse}`);

//       const data = JSON.parse(aiResponse);
//       console.log(`📊 Parsed data:`, data);

//       if (!data.weather_details_needed) {
//         finalResponse = data.weather_report;
//         console.log(`✅ Final response ready: ${finalResponse}`);
//       } else {
//         console.log(`🌤️ Weather needed for:`, data.location);
//         const weatherInfo = await getWeather(data.location);
//         console.log(`📦 Weather info received:`, weatherInfo);

//         // Create a summary of weather info
//         const weatherSummaries = weatherInfo
//           .map((w) => w.summary || w.error)
//           .join(". ");
//         const weatherInfoText = `Weather data: ${weatherSummaries}`;

//         conversationHistory.push({
//           role: "user",
//           parts: [{ text: weatherInfoText }],
//         });
//         console.log(`📤 Sent weather info back to AI`);
//       }
//     } catch (error) {
//       console.error(`❌ Error in iteration ${iterations}:`, error);
//       if (error.message.includes("JSON")) {
//         console.error(`JSON Parse Error. Response was: ${aiResponse}`);
//       }
//       finalResponse =
//         "Sorry, I encountered an error processing your request. Please try again.";
//     }
//   }

//   if (!finalResponse) {
//     finalResponse =
//       "I'm having trouble processing your request. Please try again.";
//   }

//   return finalResponse;
// }

// // API Routes
// app.post("/api/chat", async (req, res) => {
//   const { sessionId, message } = req.body;

//   console.log(`\n🚀 Received request:`);
//   console.log(`Session: ${sessionId}`);
//   console.log(`Message: ${message}`);

//   if (!message) {
//     console.log(`❌ No message provided`);
//     return res.status(400).json({ error: "Message is required" });
//   }

//   try {
//     const response = await processQuery(sessionId, message);
//     console.log(`✅ Sending response: ${response}`);
//     res.json({ response });
//   } catch (error) {
//     console.error(`💥 Fatal error in chat endpoint:`, error);
//     res.status(500).json({ error: "Internal server error: " + error.message });
//   }
// });

// // Health check endpoint
// app.get("/health", (req, res) => {
//   res.json({
//     status: "OK",
//     timestamp: new Date().toISOString(),
//     config: {
//       geminiKey: process.env.GEMINI_API_KEY ? "✓ Set" : "✗ Missing",
//       weatherKey: WEATHER_API_KEY ? "✓ Set" : "✗ Missing",
//     },
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`\n🚀 Server running on http://localhost:${PORT}`);
//   console.log(
//     `📁 Serving static files from: ${path.join(__dirname, "public")}`,
//   );
//   console.log(`\n🔧 Configuration Check:`);
//   console.log(
//     `🌡️ Weather API Key: ${WEATHER_API_KEY ? "✓ Set (starts with: " + WEATHER_API_KEY.substring(0, 5) + "...)" : "✗ Missing"}`,
//   );
//   console.log(
//     `🤖 Gemini API Key: ${process.env.GEMINI_API_KEY ? "✓ Set (starts with: " + process.env.GEMINI_API_KEY.substring(0, 5) + "...)" : "✗ Missing"}`,
//   );
//   console.log(`\n💡 Test the API:`);
//   console.log(`1. Open http://localhost:${PORT} in browser`);
//   console.log(`2. Check health: http://localhost:${PORT}/health`);
//   console.log(`3. Send a message through the chat interface\n`);
// });

// // const express = require("express");
// // const cors = require("cors");
// // const { GoogleGenAI } = require("@google/genai");
// // const path = require("path");
// // require("dotenv").config();

// // const app = express();
// // const PORT = 3000;

// // // Set this to false when your Gemini quota resets
// // const USE_MOCK_MODE = true; // 👈 Using mock mode until quota resets

// // app.use(cors());
// // app.use(express.json());
// // app.use(express.static(path.join(__dirname, "public")));

// // const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// // const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// // // Store conversation history per session
// // const sessions = new Map();

// // async function getWeather(locations) {
// //   const weatherInfo = [];

// //   for (const { city, date } of locations) {
// //     try {
// //       let url;
// //       if (date.toLowerCase() === "today") {
// //         url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}`;
// //       } else {
// //         url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&dt=${date}`;
// //       }

// //       console.log(`🌤️ Fetching weather for ${city} (${date})`);
// //       const response = await fetch(url);

// //       if (!response.ok) {
// //         throw new Error(`Weather API error: ${response.status}`);
// //       }

// //       const data = await response.json();

// //       let weatherText = "";
// //       if (date.toLowerCase() === "today") {
// //         weatherText = `${city}: ${data.current.temp_c}°C, ${data.current.condition.text}`;
// //       } else {
// //         weatherText = `${city} on ${date}: ${data.forecast.forecastday[0].day.avgtemp_c}°C, ${data.forecast.forecastday[0].day.condition.text}`;
// //       }

// //       weatherInfo.push({
// //         city: city,
// //         date: date,
// //         summary: weatherText,
// //         data: data,
// //       });
// //     } catch (error) {
// //       console.error(`❌ Error fetching weather for ${city}:`, error.message);
// //       weatherInfo.push({
// //         city: city,
// //         date: date,
// //         error: `Could not fetch weather data for ${city}`,
// //         summary: `Sorry, couldn't get weather for ${city}`,
// //       });
// //     }
// //   }

// //   return weatherInfo;
// // }

// // // Mock responses for when Gemini API is rate limited
// // function getMockWeatherResponse(question) {
// //   const lowerQuestion = question.toLowerCase();

// //   // Extract city from question
// //   const cities = {
// //     delhi: {
// //       temp: 25,
// //       condition: "Sunny",
// //       humidity: "45%",
// //       wind: "12 km/h",
// //       aqi: "Moderate (120)",
// //     },
// //     mumbai: {
// //       temp: 28,
// //       condition: "Humid with light rain",
// //       humidity: "78%",
// //       wind: "8 km/h",
// //       aqi: "Good (65)",
// //     },
// //     bangalore: {
// //       temp: 22,
// //       condition: "Partly cloudy",
// //       humidity: "60%",
// //       wind: "15 km/h",
// //       aqi: "Good (45)",
// //     },
// //     chennai: {
// //       temp: 32,
// //       condition: "Hot and humid",
// //       humidity: "70%",
// //       wind: "10 km/h",
// //       aqi: "Moderate (95)",
// //     },
// //     kolkata: {
// //       temp: 27,
// //       condition: "Light breeze",
// //       humidity: "65%",
// //       wind: "14 km/h",
// //       aqi: "Moderate (110)",
// //     },
// //     hyderabad: {
// //       temp: 26,
// //       condition: "Clear skies",
// //       humidity: "55%",
// //       wind: "9 km/h",
// //       aqi: "Good (55)",
// //     },
// //     pune: {
// //       temp: 24,
// //       condition: "Sunny",
// //       humidity: "50%",
// //       wind: "11 km/h",
// //       aqi: "Good (48)",
// //     },
// //     jaipur: {
// //       temp: 30,
// //       condition: "Sunny",
// //       humidity: "35%",
// //       wind: "8 km/h",
// //       aqi: "Poor (150)",
// //     },
// //     lucknow: {
// //       temp: 28,
// //       condition: "Clear",
// //       humidity: "40%",
// //       wind: "6 km/h",
// //       aqi: "Moderate (130)",
// //     },
// //     ahmedabad: {
// //       temp: 33,
// //       condition: "Hot and dry",
// //       humidity: "30%",
// //       wind: "14 km/h",
// //       aqi: "Poor (145)",
// //     },
// //   };

// //   let detectedCity = null;
// //   for (const city of Object.keys(cities)) {
// //     if (lowerQuestion.includes(city)) {
// //       detectedCity = city;
// //       break;
// //     }
// //   }

// //   if (detectedCity && cities[detectedCity]) {
// //     const w = cities[detectedCity];
// //     return (
// //       `🌤️ **Weather Update for ${detectedCity.toUpperCase()}**\n\n` +
// //       `🌡️ **Temperature:** ${w.temp}°C\n` +
// //       `☁️ **Condition:** ${w.condition}\n` +
// //       `💧 **Humidity:** ${w.humidity}\n` +
// //       `🌬️ **Wind Speed:** ${w.wind}\n` +
// //       `🏭 **Air Quality:** ${w.aqi}\n\n` +
// //       `💡 **Tip:** ${w.temp > 30 ? "Stay hydrated and avoid going out in the afternoon heat!" : "Great weather to go out and enjoy!"}\n\n` +
// //       `_*Note: Using mock data while Gemini API quota resets. Real weather data will appear soon!*_`
// //     );
// //   }

// //   return (
// //     `🌡️ **Weather Assistant**\n\nI can help you with weather updates for major Indian cities like:\n` +
// //     `• Delhi • Mumbai • Bangalore • Chennai • Kolkata\n` +
// //     `• Hyderabad • Pune • Jaipur • Lucknow • Ahmedabad\n\n` +
// //     `Just ask me: "What's the weather in Delhi?"\n\n` +
// //     `_*Currently using mock mode while Gemini API quota resets.*_`
// //   );
// // }

// // async function processQuery(sessionId, question) {
// //   console.log(`\n📝 Processing query: "${question}"`);

// //   // MOCK MODE - Bypass Gemini API when rate limited
// //   if (USE_MOCK_MODE) {
// //     console.log("🎭 Using MOCK MODE (Gemini quota exceeded)");
// //     return getMockWeatherResponse(question);
// //   }

// //   // REAL GEMINI MODE - Will work when quota resets
// //   if (!sessions.has(sessionId)) {
// //     sessions.set(sessionId, []);
// //   }

// //   const conversationHistory = sessions.get(sessionId);

// //   const prompt = `
// // You are a friendly weather AI assistant. Respond in JSON format only.
// // Analyze the user query and extract city and date details.
// // - Date format should be "yyyy-mm-dd" for future dates
// // - For today's weather, mark date as "today"

// // If weather information is needed, respond with:
// // {
// //   "weather_details_needed": true,
// //   "location": [{"city":"mumbai", "date":"today"}]
// // }

// // If you have enough weather information to respond, respond with:
// // {
// //   "weather_details_needed": false,
// //   "weather_report": "Your friendly weather summary here"
// // }

// // User query: ${question}
// // Respond only with valid JSON.
// // `;

// //   conversationHistory.push({
// //     role: "user",
// //     parts: [{ text: prompt }],
// //   });

// //   let maxIterations = 3;
// //   let iterations = 0;
// //   let finalResponse = null;

// //   while (iterations < maxIterations && !finalResponse) {
// //     iterations++;

// //     try {
// //       console.log(`🤖 Calling Gemini API...`);

// //       const response = await ai.models.generateContent({
// //         model: "gemini-2.0-flash",
// //         contents: conversationHistory,
// //       });

// //       let aiResponse = response.text;
// //       conversationHistory.push({
// //         role: "model",
// //         parts: [{ text: aiResponse }],
// //       });

// //       aiResponse = aiResponse.replace(/^```json\s*|\s*```$/g, "").trim();
// //       const data = JSON.parse(aiResponse);

// //       if (!data.weather_details_needed) {
// //         finalResponse = data.weather_report;
// //         console.log(`✅ Response ready`);
// //       } else {
// //         console.log(`🌤️ Weather needed for:`, data.location);

// //         if (
// //           !data.location ||
// //           !Array.isArray(data.location) ||
// //           data.location.length === 0
// //         ) {
// //           finalResponse =
// //             "I couldn't understand which city you're asking about. Please specify a city name.";
// //           break;
// //         }

// //         const weatherInfo = await getWeather(data.location);
// //         const weatherSummaries = weatherInfo
// //           .map((w) => w.summary || w.error)
// //           .join(". ");
// //         const weatherInfoText = `Here is the weather data: ${weatherSummaries}`;

// //         conversationHistory.push({
// //           role: "user",
// //           parts: [{ text: weatherInfoText }],
// //         });
// //       }
// //     } catch (error) {
// //       console.error(`❌ Error:`, error.message);

// //       if (error.message.includes("429")) {
// //         finalResponse =
// //           "I'm currently busy. Please wait a moment and try again.";
// //       } else {
// //         finalResponse = `Sorry, I encountered an error. Please try again.`;
// //       }
// //     }
// //   }

// //   if (!finalResponse) {
// //     finalResponse =
// //       "I'm having trouble processing your request. Please try again.";
// //   }

// //   return finalResponse;
// // }

// // // API Routes
// // app.post("/api/chat", async (req, res) => {
// //   const { sessionId, message } = req.body;

// //   if (!message) {
// //     return res.status(400).json({ error: "Message is required" });
// //   }

// //   try {
// //     const response = await processQuery(sessionId, message);
// //     res.json({ response });
// //   } catch (error) {
// //     console.error("Chat error:", error);
// //     res.status(500).json({ error: "Internal server error" });
// //   }
// // });

// // app.get("/health", (req, res) => {
// //   res.json({
// //     status: "OK",
// //     mode: USE_MOCK_MODE ? "MOCK MODE (Gemini quota exceeded)" : "REAL MODE",
// //     timestamp: new Date().toISOString(),
// //   });
// // });

// // app.listen(PORT, () => {
// //   console.log(`\n🚀 Server running on http://localhost:${PORT}`);
// //   console.log(
// //     `📁 Serving static files from: ${path.join(__dirname, "public")}`,
// //   );
// //   console.log(`\n🔧 Configuration:`);
// //   console.log(
// //     `🤖 Mode: ${USE_MOCK_MODE ? "MOCK MODE (No Gemini API calls)" : "REAL MODE"}`,
// //   );
// //   console.log(`🌡️ Weather API: ${WEATHER_API_KEY ? "✓ Set" : "✗ Missing"}`);
// //   console.log(
// //     `\n💡 Mock mode is ON - Your app will work with sample weather data!`,
// //   );
// //   console.log(
// //     `📝 To switch to real Gemini, set USE_MOCK_MODE = false in server.js`,
// //   );
// // });

//with only weatherApi and grok
// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// require("dotenv").config();

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));

// const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
// const GROQ_API_KEY = process.env.GROQ_API_KEY;

// // List of working free models on Groq
// const WORKING_MODELS = [
//   "llama-3.3-70b-versatile", // Most capable, free
//   "llama-3.1-8b-instant", // Fast and free
//   "gemma2-9b-it", // Google's model, free
// ];

// let currentModelIndex = 0;

// // Try different models until one works
// async function callGroq(prompt) {
//   let lastError = null;

//   for (let i = 0; i < WORKING_MODELS.length; i++) {
//     const model = WORKING_MODELS[i];
//     try {
//       console.log(`🔄 Trying model: ${model}`);

//       const response = await fetch(
//         "https://api.groq.com/openai/v1/chat/completions",
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${GROQ_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             model: model,
//             messages: [{ role: "user", content: prompt }],
//             temperature: 0.7,
//             max_tokens: 500,
//           }),
//         },
//       );

//       if (!response.ok) {
//         const error = await response.text();
//         console.log(`❌ ${model} failed:`, error.substring(0, 100));
//         lastError = error;
//         continue;
//       }

//       const data = await response.json();
//       console.log(`✅ Using model: ${model}`);
//       return data.choices[0].message.content;
//     } catch (error) {
//       console.log(`❌ ${model} error:`, error.message);
//       lastError = error;
//       continue;
//     }
//   }

//   throw new Error(`All models failed. Last error: ${lastError}`);
// }

// // Get real weather
// async function getRealWeather(city) {
//   const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}`;
//   const response = await fetch(url);

//   if (!response.ok) {
//     throw new Error(`Could not get weather for ${city}`);
//   }

//   const data = await response.json();
//   return {
//     city: city,
//     temp: data.current.temp_c,
//     condition: data.current.condition.text,
//     humidity: data.current.humidity,
//     wind: data.current.wind_kph,
//     feelsLike: data.current.feelslike_c,
//   };
// }

// app.post("/api/chat", async (req, res) => {
//   const { message } = req.body;
//   console.log(`\n📝 User: ${message}`);

//   try {
//     // Extract city using Groq
//     const cityPrompt = `Extract the city name from: "${message}". Reply with ONLY the city name in lowercase. If no city, reply "none".`;
//     let city = await callGroq(cityPrompt);
//     city = city.trim().toLowerCase();
//     console.log(`📍 City detected: ${city}`);

//     if (city === "none") {
//       const response = await callGroq(
//         `You are a friendly travel assistant. Answer: "${message}" with helpful tips, emojis, and practical advice.`,
//       );
//       return res.json({ response });
//     }

//     // Get real weather
//     try {
//       const weather = await getRealWeather(city);
//       console.log(`🌤️ Weather: ${weather.temp}°C, ${weather.condition}`);

//       // Generate final response
//       const finalPrompt = `Real weather data for ${weather.city}:
// - Temperature: ${weather.temp}°C (feels like ${weather.feelsLike}°C)
// - Condition: ${weather.condition}
// - Humidity: ${weather.humidity}%
// - Wind: ${weather.wind} km/h

// User asked: "${message}"

// Give a friendly, helpful response with:
// - The current weather (use emojis like 🌡️ ☀️ 🌧️ 🌬️)
// - Practical advice (umbrella, sunscreen, clothing)
// - Be warm and conversational

// Response:`;

//       const response = await callGroq(finalPrompt);
//       return res.json({ response });
//     } catch (weatherError) {
//       console.log(`❌ Weather API error: ${weatherError.message}`);
//       const fallbackPrompt = `User asked about weather in ${city}: "${message}"
//       Since I couldn't get live weather, give general advice about typical weather in ${city} and what to expect. Use emojis.`;
//       const response = await callGroq(fallbackPrompt);
//       return res.json({ response });
//     }
//   } catch (error) {
//     console.error(`❌ Error:`, error.message);
//     res.json({
//       response:
//         "🌟 I'm here to help! Please ask about a specific city, like 'What's the weather in Delhi?'",
//     });
//   }
// });

// app.get("/health", (req, res) => {
//   res.json({
//     status: "OK",
//     provider: "Groq",
//     models: WORKING_MODELS,
//     message: "Working! Try asking about weather in any city",
//     timestamp: new Date().toISOString(),
//   });
// });

// app.listen(PORT, () => {
//   console.log(`\n🚀 Server running on http://localhost:${PORT}`);
//   console.log(`🤖 Using Groq with working models`);
//   console.log(`✨ Models: ${WORKING_MODELS.join(", ")}`);
//   console.log(`\n💡 Try asking:`);
//   console.log(`   • "What's the weather in Delhi?"`);
//   console.log(`   • "Will it rain in Mumbai?"`);
//   console.log(`   • "Temperature in Bangalore"`);
//   console.log(`   • "Best time to visit Goa?"`);
// });

// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// require("dotenv").config();

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, "public")));

// // API Keys
// const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
// const GROQ_API_KEY = process.env.GROQ_API_KEY;
// const NEWS_API_KEY = process.env.NEWS_API_KEY || "YOUR_NEWS_API_KEY"; // Get from newsapi.org
// const STOCK_API_KEY = process.env.STOCK_API_KEY || "YOUR_STOCK_API_KEY"; // Get from alphavantage.co
// const CURRENCY_API_KEY =
//   process.env.CURRENCY_API_KEY || "YOUR_CURRENCY_API_KEY"; // Get from exchangerate-api.com

// // Working Groq models
// const WORKING_MODELS = [
//   "llama-3.3-70b-versatile",
//   "llama-3.1-8b-instant",
//   "gemma2-9b-it",
// ];

// async function callGroq(prompt) {
//   for (const model of WORKING_MODELS) {
//     try {
//       console.log(`🔄 Trying model: ${model}`);

//       const response = await fetch(
//         "https://api.groq.com/openai/v1/chat/completions",
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${GROQ_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             model: model,
//             messages: [{ role: "user", content: prompt }],
//             temperature: 0.7,
//             max_tokens: 500,
//           }),
//         },
//       );

//       if (!response.ok) continue;

//       const data = await response.json();
//       console.log(`✅ Using model: ${model}`);
//       return data.choices[0].message.content;
//     } catch (error) {
//       console.log(`❌ ${model} failed:`, error.message);
//       continue;
//     }
//   }

//   throw new Error("All models failed");
// }

// // ==================== API FUNCTIONS ====================

// // 1. Weather API
// async function getWeather(city) {
//   try {
//     const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}`;
//     const response = await fetch(url);

//     if (!response.ok) throw new Error(`Weather API error`);

//     const data = await response.json();
//     return {
//       type: "weather",
//       city: city,
//       temp: data.current.temp_c,
//       feelsLike: data.current.feelslike_c,
//       condition: data.current.condition.text,
//       humidity: data.current.humidity,
//       wind: data.current.wind_kph,
//       icon: data.current.condition.icon,
//     };
//   } catch (error) {
//     return { type: "weather", error: `Could not fetch weather for ${city}` };
//   }
// }

// // 2. News API (Get top news for a city/country)
// async function getNews(query) {
//   try {
//     const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`;
//     const response = await fetch(url);

//     if (!response.ok) throw new Error(`News API error`);

//     const data = await response.json();
//     return {
//       type: "news",
//       query: query,
//       articles: data.articles.slice(0, 5).map((article) => ({
//         title: article.title,
//         description: article.description,
//         url: article.url,
//         source: article.source.name,
//         publishedAt: article.publishedAt,
//       })),
//     };
//   } catch (error) {
//     return { type: "news", error: `Could not fetch news for ${query}` };
//   }
// }

// // 3. Stock Price API (Using Alpha Vantage - free tier)
// async function getStockPrice(symbol) {
//   try {
//     const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${STOCK_API_KEY}`;
//     const response = await fetch(url);

//     if (!response.ok) throw new Error(`Stock API error`);

//     const data = await response.json();
//     const quote = data["Global Quote"];

//     if (!quote || !quote["05. price"]) {
//       return { type: "stock", error: `Could not find stock: ${symbol}` };
//     }

//     return {
//       type: "stock",
//       symbol: symbol.toUpperCase(),
//       price: quote["05. price"],
//       change: quote["09. change"],
//       changePercent: quote["10. change percent"],
//       volume: quote["06. volume"],
//     };
//   } catch (error) {
//     return { type: "stock", error: `Could not fetch stock for ${symbol}` };
//   }
// }

// // 4. Currency Conversion API
// async function getCurrencyConversion(from, to, amount = 1) {
//   try {
//     const url = `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`;
//     const response = await fetch(url);

//     if (!response.ok) throw new Error(`Currency API error`);

//     const data = await response.json();
//     const rate = data.rates[to.toUpperCase()];

//     if (!rate) {
//       return { type: "currency", error: `Could not convert ${from} to ${to}` };
//     }

//     const convertedAmount = amount * rate;

//     return {
//       type: "currency",
//       from: from.toUpperCase(),
//       to: to.toUpperCase(),
//       amount: amount,
//       rate: rate,
//       convertedAmount: convertedAmount,
//     };
//   } catch (error) {
//     return { type: "currency", error: `Could not fetch exchange rates` };
//   }
// }

// // 5. Intent Detection using Groq
// async function detectIntent(message) {
//   const intentPrompt = `Analyze this user query: "${message}"

// Classify into ONE of these categories:
// - WEATHER: asking about weather, temperature, rain, humidity
// - NEWS: asking about latest news, current events, headlines
// - STOCK: asking about stock prices, share market, company stocks
// - CURRENCY: asking about exchange rates, currency conversion, money conversion
// - TRAVEL: asking about travel, packing, tourism, destinations
// - GENERAL: anything else

// Reply with ONLY the category name (WEATHER/NEWS/STOCK/CURRENCY/TRAVEL/GENERAL)`;

//   const intent = await callGroq(intentPrompt);
//   return intent.trim().toUpperCase();
// }

// // 6. Extract parameters from query
// async function extractParameters(message, intent) {
//   let prompt = "";

//   switch (intent) {
//     case "WEATHER":
//       prompt = `Extract city name from: "${message}". Reply with ONLY city name.`;
//       break;
//     case "NEWS":
//       prompt = `Extract topic/country/city for news from: "${message}". Reply with ONLY the main topic. Example: "technology", "india", "cricket".`;
//       break;
//     case "STOCK":
//       prompt = `Extract stock symbol or company name from: "${message}". Reply with ONLY the stock symbol (e.g., RELIANCE, TCS, AAPL).`;
//       break;
//     case "CURRENCY":
//       prompt = `Extract from currency, to currency, and amount from: "${message}". Reply in format: FROM,TO,AMOUNT. Example: "USD,INR,100".`;
//       break;
//     default:
//       return null;
//   }

//   const params = await callGroq(prompt);
//   return params.trim().toLowerCase();
// }

// // Main processing function
// async function processQuery(message) {
//   console.log(`\n📝 User: ${message}`);

//   try {
//     // Step 1: Detect intent
//     const intent = await detectIntent(message);
//     console.log(`🎯 Intent: ${intent}`);

//     // Step 2: Handle different intents
//     switch (intent) {
//       case "WEATHER": {
//         const city = await extractParameters(message, intent);
//         if (!city || city === "none") {
//           return "🌤️ Which city would you like the weather for? Please specify a city name.";
//         }

//         const weather = await getWeather(city);
//         if (weather.error) return weather.error;

//         const responsePrompt = `Weather data: ${weather.city}: ${weather.temp}°C, feels like ${weather.feelsLike}°C, ${weather.condition}, Humidity: ${weather.humidity}%, Wind: ${weather.wind} km/h.

// User asked: "${message}"

// Give a friendly weather response with emojis and practical advice.`;

//         return await callGroq(responsePrompt);
//       }

//       case "NEWS": {
//         const topic = await extractParameters(message, intent);
//         if (!topic || topic === "none") {
//           return "📰 What news topic are you interested in? (e.g., technology, sports, business, or a specific country)";
//         }

//         const news = await getNews(topic);
//         if (news.error) return news.error;

//         const newsList = news.articles
//           .map(
//             (a, i) =>
//               `${i + 1}. **${a.title}**\n   ${a.description?.substring(0, 100)}...\n   Source: ${a.source}\n`,
//           )
//           .join("\n");

//         return `📰 **Latest News about ${topic.toUpperCase()}**\n\n${newsList}\n\n💡 ${news.articles.length} articles found. Ask me for more details about any story!`;
//       }

//       case "STOCK": {
//         const symbol = await extractParameters(message, intent);
//         if (!symbol || symbol === "none") {
//           return "📈 Which stock symbol would you like to check? (e.g., RELIANCE, TCS, AAPL)";
//         }

//         const stock = await getStockPrice(symbol);
//         if (stock.error) return stock.error;

//         const changeEmoji = parseFloat(stock.change) >= 0 ? "📈" : "📉";

//         return (
//           `${changeEmoji} **${stock.symbol}** Stock Update\n\n` +
//           `💰 Price: ₹${stock.price}\n` +
//           `${changeEmoji} Change: ${stock.change} (${stock.changePercent})\n` +
//           `📊 Volume: ${parseInt(stock.volume).toLocaleString()}\n\n` +
//           `💡 ${parseFloat(stock.change) >= 0 ? "Stock is up! Great performance!" : "Stock is down. Keep monitoring market trends."}`
//         );
//       }

//       case "CURRENCY": {
//         const params = await extractParameters(message, intent);
//         if (!params || params === "none") {
//           return "💱 Please specify currency conversion. Example: 'Convert 100 USD to INR' or 'USD to EUR rate'";
//         }

//         const [from, to, amount] = params.split(",");
//         const conversion = await getCurrencyConversion(
//           from,
//           to,
//           parseFloat(amount) || 1,
//         );

//         if (conversion.error) return conversion.error;

//         return (
//           `💱 **Currency Conversion**\n\n` +
//           `${conversion.amount} ${conversion.from} = ${conversion.convertedAmount.toFixed(2)} ${conversion.to}\n` +
//           `📊 Exchange Rate: 1 ${conversion.from} = ${conversion.rate.toFixed(4)} ${conversion.to}\n\n` +
//           `💡 Need to convert other currencies? Just ask!`
//         );
//       }

//       case "TRAVEL": {
//         const travelPrompt = `You are a friendly travel assistant. Answer: "${message}" with helpful travel tips, packing advice, best time to visit, and recommendations. Use emojis.`;
//         return await callGroq(travelPrompt);
//       }

//       default: {
//         const generalPrompt = `You are WeatherMind AI, a helpful assistant for weather, news, stocks, currency, and travel. Answer: "${message}" in a friendly, helpful way. Use emojis.`;
//         return await callGroq(generalPrompt);
//       }
//     }
//   } catch (error) {
//     console.error(`❌ Error:`, error.message);
//     return "🌟 I'm here to help! Try asking about:\n• Weather in any city\n• Latest news\n• Stock prices\n• Currency conversion\n• Travel tips";
//   }
// }

// // API Endpoint
// app.post("/api/chat", async (req, res) => {
//   const { message } = req.body;

//   if (!message) {
//     return res.status(400).json({ error: "Message is required" });
//   }

//   try {
//     const response = await processQuery(message);
//     res.json({ response });
//   } catch (error) {
//     console.error("Chat error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.get("/health", (req, res) => {
//   res.json({
//     status: "OK",
//     capabilities: ["weather", "news", "stocks", "currency", "travel"],
//     models: WORKING_MODELS,
//     timestamp: new Date().toISOString(),
//   });
// });

// app.listen(PORT, () => {
//   console.log(
//     `\n🚀 Multi-Function AI Assistant running on http://localhost:${PORT}`,
//   );
//   console.log(`🤖 Capabilities: Weather | News | Stocks | Currency | Travel`);
//   console.log(`\n💡 Try asking:`);
//   console.log(`   • "What's the weather in Delhi?"`);
//   console.log(`   • "Latest news about technology"`);
//   console.log(`   • "What's the price of Reliance stock?"`);
//   console.log(`   • "Convert 100 USD to INR"`);
//   console.log(`   • "Best time to visit Goa?"`);
// });

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API Keys
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY || "";
const STOCK_API_KEY = process.env.STOCK_API_KEY || "";
const CURRENCY_API_KEY = process.env.CURRENCY_API_KEY || "";

// Working Groq models
const WORKING_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
];

async function callGroq(prompt) {
  for (const model of WORKING_MODELS) {
    try {
      console.log(`🔄 Trying model: ${model}`);

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 800,
          }),
        },
      );

      if (!response.ok) continue;

      const data = await response.json();
      console.log(`✅ Using model: ${model}`);
      return data.choices[0].message.content;
    } catch (error) {
      console.log(`❌ ${model} failed:`, error.message);
      continue;
    }
  }

  throw new Error("All models failed");
}

// ==================== API FUNCTIONS ====================

async function getWeather(city) {
  try {
    const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API error`);
    const data = await response.json();
    return {
      type: "weather",
      city: city,
      temp: data.current.temp_c,
      feelsLike: data.current.feelslike_c,
      condition: data.current.condition.text,
      humidity: data.current.humidity,
      wind: data.current.wind_kph,
    };
  } catch (error) {
    return { type: "weather", error: `Could not fetch weather for ${city}` };
  }
}

async function getNews(query) {
  if (!NEWS_API_KEY)
    return { type: "news", error: "News API key not configured" };
  try {
    const url = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=5&apiKey=${NEWS_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`News API error`);
    const data = await response.json();
    return {
      type: "news",
      query: query,
      articles: data.articles.slice(0, 5).map((article) => ({
        title: article.title,
        description: article.description,
        source: article.source.name,
      })),
    };
  } catch (error) {
    return { type: "news", error: `Could not fetch news for ${query}` };
  }
}

async function getStockPrice(symbol) {
  if (!STOCK_API_KEY)
    return { type: "stock", error: "Stock API key not configured" };
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${STOCK_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Stock API error`);
    const data = await response.json();
    const quote = data["Global Quote"];
    if (!quote || !quote["05. price"]) {
      return { type: "stock", error: `Could not find stock: ${symbol}` };
    }
    return {
      type: "stock",
      symbol: symbol.toUpperCase(),
      price: quote["05. price"],
      change: quote["09. change"],
      changePercent: quote["10. change percent"],
    };
  } catch (error) {
    return { type: "stock", error: `Could not fetch stock for ${symbol}` };
  }
}

async function getCurrencyConversion(from, to, amount = 1) {
  try {
    const url = `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Currency API error`);
    const data = await response.json();
    const rate = data.rates[to.toUpperCase()];
    if (!rate)
      return { type: "currency", error: `Could not convert ${from} to ${to}` };
    return {
      type: "currency",
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      amount: amount,
      rate: rate,
      convertedAmount: amount * rate,
    };
  } catch (error) {
    return { type: "currency", error: `Could not fetch exchange rates` };
  }
}

// Enhanced Intent Detection - Now includes GENERAL knowledge
async function detectIntent(message) {
  const intentPrompt = `Analyze this user query: "${message}"
  
Classify into ONE of these categories:
- WEATHER: asking about weather, temperature, rain, humidity, forecast
- NEWS: asking about latest news, current events, headlines, updates
- STOCK: asking about stock prices, share market, company stocks, NSE, BSE
- CURRENCY: asking about exchange rates, currency conversion, money conversion
- TRAVEL: asking about travel, tourism, destinations, packing, best time to visit
- GENERAL: ANY other question including: facts, definitions, explanations, calculations, history, science, technology, entertainment, advice, opinions, recommendations, how-to, what is, who is, when did, why does, etc.

Reply with ONLY the category name (WEATHER/NEWS/STOCK/CURRENCY/TRAVEL/GENERAL)`;

  const intent = await callGroq(intentPrompt);
  return intent.trim().toUpperCase();
}

async function extractParameters(message, intent) {
  let prompt = "";

  switch (intent) {
    case "WEATHER":
      prompt = `Extract city name from: "${message}". Reply with ONLY city name.`;
      break;
    case "NEWS":
      prompt = `Extract topic/country/city from: "${message}". Reply with ONLY the main topic.`;
      break;
    case "STOCK":
      prompt = `Extract stock symbol or company name from: "${message}". Reply with ONLY the stock symbol.`;
      break;
    case "CURRENCY":
      prompt = `Extract from currency, to currency, and amount from: "${message}". Reply in format: FROM,TO,AMOUNT. Example: "USD,INR,100".`;
      break;
    default:
      return null;
  }

  const params = await callGroq(prompt);
  return params.trim().toLowerCase();
}

// Main processing function
async function processQuery(message) {
  console.log(`\n📝 User: ${message}`);

  try {
    const intent = await detectIntent(message);
    console.log(`🎯 Intent: ${intent}`);

    switch (intent) {
      case "WEATHER": {
        const city = await extractParameters(message, intent);
        if (!city || city === "none") {
          return "🌤️ Which city would you like the weather for? Please specify a city name like 'Delhi' or 'Mumbai'.";
        }
        const weather = await getWeather(city);
        if (weather.error) return weather.error;

        const responsePrompt = `Weather: ${weather.city}: ${weather.temp}°C, feels ${weather.feelsLike}°C, ${weather.condition}, Humidity: ${weather.humidity}%, Wind: ${weather.wind} km/h. User asked: "${message}". Give a friendly response with emojis and practical advice.`;
        return await callGroq(responsePrompt);
      }

      case "NEWS": {
        const topic = await extractParameters(message, intent);
        if (!topic || topic === "none") {
          return "📰 What news topic are you interested in? (e.g., technology, sports, business, India)";
        }
        const news = await getNews(topic);
        if (news.error) return news.error;

        const newsList = news.articles
          .map(
            (a, i) =>
              `${i + 1}. **${a.title}**\n   ${a.description?.substring(0, 100)}...\n`,
          )
          .join("\n");
        return `📰 **Latest ${topic.toUpperCase()} News**\n\n${newsList}\n💡 Ask me for more details!`;
      }

      case "STOCK": {
        const symbol = await extractParameters(message, intent);
        if (!symbol || symbol === "none") {
          return "📈 Which stock symbol would you like to check? (e.g., RELIANCE, TCS, AAPL)";
        }
        const stock = await getStockPrice(symbol);
        if (stock.error) return stock.error;
        const changeEmoji = parseFloat(stock.change) >= 0 ? "📈" : "📉";
        return `${changeEmoji} **${stock.symbol}**\n💰 Price: ₹${stock.price}\n${changeEmoji} Change: ${stock.change} (${stock.changePercent})`;
      }

      case "CURRENCY": {
        const params = await extractParameters(message, intent);
        if (!params || params === "none") {
          return "💱 Please specify currency conversion. Example: 'Convert 100 USD to INR'";
        }
        const [from, to, amount] = params.split(",");
        const conversion = await getCurrencyConversion(
          from,
          to,
          parseFloat(amount) || 1,
        );
        if (conversion.error) return conversion.error;
        return `💱 ${conversion.amount} ${conversion.from} = ${conversion.convertedAmount.toFixed(2)} ${conversion.to}\n📊 Rate: 1 ${conversion.from} = ${conversion.rate.toFixed(4)} ${conversion.to}`;
      }

      case "TRAVEL": {
        const travelPrompt = `You are a friendly travel assistant. Answer: "${message}" with helpful travel tips, packing advice, best time to visit, and recommendations. Use emojis.`;
        return await callGroq(travelPrompt);
      }

      case "GENERAL":
      default: {
        // Enhanced general response prompt
        const generalPrompt = `You are a friendly, knowledgeable AI assistant. The user asked: "${message}"

Provide a helpful, accurate, and engaging response. You can help with:
- Facts and explanations
- Definitions and concepts
- Calculations and math
- History and science
- Technology and programming
- Entertainment and fun facts
- Life advice and tips
- Any general knowledge

Rules:
- Be conversational and friendly
- Use emojis appropriately
- Keep it concise but informative
- If unsure, acknowledge it
- Be helpful and positive

Response:`;

        return await callGroq(generalPrompt);
      }
    }
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return "🌟 I'm here to help! Ask me about weather, news, stocks, currency, travel, or anything else you'd like to know!";
  }
}

// API Endpoint
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const response = await processQuery(message);
    res.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    capabilities: [
      "weather",
      "news",
      "stocks",
      "currency",
      "travel",
      "general",
    ],
    models: WORKING_MODELS,
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI Nexus running on http://localhost:${PORT}`);
  console.log(
    `🤖 Capabilities: Weather | News | Stocks | Currency | Travel | General Knowledge`,
  );
  console.log(`\n💡 Try asking ANYTHING:`);
  console.log(`   • "What's the weather in Delhi?" (Weather)`);
  console.log(`   • "Latest tech news" (News)`);
  console.log(`   • "Reliance stock price" (Stocks)`);
  console.log(`   • "Convert 100 USD to INR" (Currency)`);
  console.log(`   • "Best time to visit Goa" (Travel)`);
  console.log(`   • "What is quantum computing?" (General)`);
  console.log(`   • "Tell me a fun fact" (General)`);
  console.log(`   • "How does a CPU work?" (General)`);
  console.log(`   • "Write a poem about nature" (General)`);
});
