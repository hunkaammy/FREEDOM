import { GoogleGenAI } from "@google/genai";

// IMPORTANT: Replace "YOUR_API_KEY_HERE" with your actual Google AI Studio API key.
const API_KEY = "YOUR_API_KEY_HERE";

export const initializeChat = (systemInstruction) => {
  if (API_KEY === "YOUR_API_KEY_HERE" || !API_KEY) {
    throw new Error("API_KEY is not set. Please add your API key in services/geminiService.js");
  }
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });

  return chat;
};

export const sendMessage = async (chat, message) => {
  const result = await chat.sendMessageStream({ message });
  return result;
};