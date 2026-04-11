const { GoogleGenerativeAI } = require("@google/generative-ai");

const KEY = "AIzaSyBb8N5KJngMVxylnaarfeNGn8ZZ7-eqfzQ";
const genAI = new GoogleGenerativeAI(KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent("Hello, who are you?");
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
