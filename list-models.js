/* eslint-disable */
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // For v1beta, use the model listing from the admin API or just try to list
  try {
    // The SDK might not expose listModels directly on the main instance easily in all versions,
    // but let's try assuming standard usage.
    // If not, we can make a raw fetch.
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
    );
    const data = await response.json();
    console.log("Available Models:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
