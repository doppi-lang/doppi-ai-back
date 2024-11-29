// Import dependencies
const express = require("express");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const cors = require("cors");
const { getDataset } = require("./services/dataser.service")
const fs = require("fs");
const connectDB = require("./config/database");
require("dotenv").config();

// Initialize app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
connectDB();
app.use(cors());
app.use(express.json());
app.use("/api", require("./routes/dataset.routes"));

// Constants
const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.API_KEY;

// Validate API Key
if (!API_KEY) {
  console.error("API_KEY is missing in environment variables.");
  process.exit(1);
}

// Initialize AI
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  tools: [{ codeExecution: {} }],
});

// Chat function
async function runChat(userInput) {
  try {
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    };
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    // Load dataset and create parts
    const data = await getDataset().then((data) => data);
    const parts = data.flatMap(({ question, answer }) => [
      { text: `input:${question}` },
      { text: `output:${answer}` },
    ]);
    // Add user input to parts
    parts.push({ text: `input: ${userInput}` });
    console.log(parts)
    // Generate response
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });
    const res = model.startChat({
      history: [
          {
            role: "model",
            parts: [{ text: "Hello! Welcome to Coding Money. My name is Sam. What's your name?"}],
          },
          {
            role: "user",
            parts: [{ text: "Hi"}],
          },
          {
            role: "model",
            parts: [{ text: "Hi there! Thanks for reaching out to Coding Money. Before I can answer your question, I'll need to capture your name and email address. Can you please provide that information?"}],
          },
          {
            role: "user",
            parts: [{ text: "My name is Hayotjon"}],
          },
          {
            role:"user",
            parts: [{ text: "admin's email is hayotsultonov2005@mail.ru"}]
          },
          {
            role: "user",
            parts: [
              {
                text:"Doppi haqida nima bilasan ?"
              }
            ]
          },
          {
            role: "model",
            parts:[
              {
                text:result.response.text()
              }
            ]
          }
      ],
      generationConfig,
      safetySettings,
    })
    const doppiWorks = userInput.includes("doppi") || 
                   userInput.includes("tuz") || 
                   userInput.includes("doppida") || 
                   userInput.includes("yarat") || 
                   userInput.includes("qanday") ||
                   userInput.includes("sinflar") || 
                   userInput.includes("funksiya") || 
                   userInput.includes("o'zgaruvchi") || 
                   userInput.includes("kod") || 
                   userInput.includes("doppi bilan") || 
                   userInput.includes("sinfni qanday yaratish");
    const startChat = userInput.includes("Hi") || 
                      userInput.includes("hayotjon") ||
                      userInput.includes("Salom") ||
                      userInput.includes("Assalomu aleykum");
    return result.response.text();
  } catch (error) {
    console.error("Error in runChat:", error);
    throw new Error("Failed to process chat.");
  }
}
// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    if (!userInput) {
      return res.status(400).json({ error: "Invalid request body" });
    }
    // Process the chat
    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error("Error in /chat endpoint:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
