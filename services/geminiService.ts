import { GoogleGenAI, Chat } from "@google/genai";

export const initializeChat = (systemInstruction: string): Chat => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not set in environment variables.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });

  return chat;
};

export const sendMessage = async (chat: Chat, message: string) => {
  const result = await chat.sendMessageStream({ message });
  return result;
};
