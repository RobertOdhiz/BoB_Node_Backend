const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

// Access your API key as an environment variable.
const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
console.log(genAI);

async function run() {
  // Choose a model that's appropriate for your use case.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const prompt = "How can I improve my savings?"

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  console.log(text);
}

run();