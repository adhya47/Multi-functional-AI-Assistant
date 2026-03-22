# Multi-functional-AI-Assistant

Multi-functional AI Assistant with Weather, News, Stocks, Currency

# 🌤️ AI Nexus - Intelligent Multi-Functional Assistant

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.x-blue.svg)](https://expressjs.com/)
[![Groq](https://img.shields.io/badge/Groq-LLM-purple.svg)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> An intelligent, multi-functional AI assistant that provides real-time weather updates, latest news, live stock prices, currency conversion, travel advice, and general knowledge responses. Powered by Groq AI and multiple external APIs with a beautiful glass-morphism interface.

## 🌐 Live Demo

[![Deploy on Render](https://img.shields.io/badge/Deploy%20on-Render-blue?logo=render)](https://render.com/deploy)
[![Deploy on Railway](https://img.shields.io/badge/Deploy%20on-Railway-purple?logo=railway)](https://railway.app)

**Live URL:** `https://ai-nexus.onrender.com` _(Replace with your deployed URL)_

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 API Integrations](#-api-integrations)
- [🚀 Quick Start](#-quick-start)
- [🔧 Installation](#-installation)
- [🔐 Environment Variables](#-environment-variables)
- [💻 Usage Examples](#-usage-examples)
- [📁 Project Structure](#-project-structure)
- [🚢 Deployment](#-deployment)
- [😓 Challenges & Solutions](#-challenges--solutions)
- [🚧 Areas for Improvement](#-areas-for-improvement)
- [⚠️ Limitations](#️-limitations)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgements](#-acknowledgements)

---

## ✨ Features

### Core Capabilities

| Feature         | Description                             | Example Queries                                            |
| --------------- | --------------------------------------- | ---------------------------------------------------------- |
| 🌤️ **Weather**  | Real-time weather with practical advice | "What's the weather in Delhi?" / "Will it rain in Mumbai?" |
| 📰 **News**     | Latest headlines on any topic           | "Latest technology news" / "Cricket updates"               |
| 📈 **Stocks**   | Live stock prices and market updates    | "Reliance stock price" / "How is TCS performing?"          |
| 💱 **Currency** | Real-time exchange rates                | "Convert 100 USD to INR" / "Euro to Rupee rate"            |
| ✈️ **Travel**   | Destination advice, packing tips        | "Best time to visit Goa" / "What to pack for Shimla?"      |
| 💬 **General**  | Any question - facts, explanations      | "What is quantum computing?" / "Tell me a fun fact"        |

### Technical Features

- ✅ **AI-Powered Intent Detection** - Automatically understands what users are asking
- ✅ **Multi-Model Fallback** - Tries 3 different AI models for 99.9% reliability
- ✅ **Real-time Data** - Fetches live information from 5+ external APIs
- ✅ **Conversation Memory** - Maintains context within sessions
- ✅ **Responsive UI** - Modern glass-morphism design with mobile optimization
- ✅ **Graceful Error Handling** - Friendly messages when APIs fail
- ✅ **No Rate Limits** - Unlimited requests via Groq's free tier
- ✅ **Session Management** - localStorage for frontend, in-memory Map for backend
- ✅ **Health Monitoring** - `/health` endpoint for uptime checking

---

---

## 🛠️ Tech Stack

### Backend

| Technology     | Version | Purpose                                |
| -------------- | ------- | -------------------------------------- |
| **Node.js**    | 18.x    | JavaScript runtime                     |
| **Express.js** | 4.18.x  | Web framework                          |
| **Groq API**   | Latest  | AI/LLM for intent detection & response |
| **dotenv**     | 16.3.x  | Environment variable management        |
| **cors**       | 2.8.x   | Cross-origin resource sharing          |

### Frontend

| Technology            | Purpose                                                  |
| --------------------- | -------------------------------------------------------- |
| **HTML5**             | Semantic structure                                       |
| **CSS3**              | Glass-morphism, gradients, animations, responsive design |
| **JavaScript (ES6+)** | Dynamic interactions, fetch API, localStorage            |

### External APIs

| API                  | Purpose                | Free Tier           |
| -------------------- | ---------------------- | ------------------- |
| **WeatherAPI**       | Real-time weather data | 1M requests/month   |
| **NewsAPI**          | Latest news headlines  | 100 requests/day    |
| **Alpha Vantage**    | Stock prices           | 5 req/min, 500/day  |
| **ExchangeRate-API** | Currency conversion    | 1500 requests/month |

---

## 📦 API Integrations

### 1. WeatherAPI

```javascript
// Endpoint: https://api.weatherapi.com/v1/current.json
// Returns: Temperature, condition, humidity, wind speed, feels like
// Endpoint: https://newsapi.org/v2/everything
// Returns: Latest articles with titles, descriptions, sources// Endpoint: https://www.alphavantage.co/query?function=GLOBAL_QUOTE
// Returns: Stock price, change percentage, volume
// Endpoint: https://api.exchangerate-api.com/v4/latest/{currency}
// Returns: Exchange rates for all currencies
```
