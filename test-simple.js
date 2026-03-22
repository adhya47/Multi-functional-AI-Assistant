// test-openrouter.js
require("dotenv").config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
console.log("API Key exists:", !!OPENROUTER_API_KEY);
console.log("API Key starts with:", OPENROUTER_API_KEY?.substring(0, 10));

async function testOpenRouter() {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-lite-preview-02-05:free",
          messages: [{ role: "user", content: 'Say "Hello, working!"' }],
          max_tokens: 50,
        }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SUCCESS! OpenRouter is working!");
      console.log("Response:", data.choices[0].message.content);
    } else {
      console.log("❌ Error:", data);
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testOpenRouter();
