const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyBb8N5KJngMVxylnaarfeNGn8ZZ7-eqfzQ");

async function listModels() {
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Model fetch test successful");
  } catch (error) {
    console.error("Model fetch test failed:", error);
  }
}

listModels();
