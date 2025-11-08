
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, MessageSender, ActiveBooking } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getChatbotResponse = async (
  newMessage: string,
  chatHistory: ChatMessage[],
  parkingStats: { available: number, occupied: number, total: number },
  activeBooking: ActiveBooking | null
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    let bookingInfo = "The user has not booked a spot yet.";
    if (activeBooking) {
        const timeRemaining = Math.floor((activeBooking.endTime.getTime() - new Date().getTime()) / 60000);
        if (timeRemaining > 0) {
            bookingInfo = `The user has an active booking for spot ${activeBooking.spotId}. Their time expires in about ${timeRemaining} minutes. The booking cost was $${activeBooking.cost.toFixed(2)}.`;
        } else {
            bookingInfo = `The user is currently overstaying at spot ${activeBooking.spotId}. Their booked time has expired.`;
        }
    }
    
    const systemInstruction = `You are a helpful and friendly AI assistant for 'ParkWise AI', a modern parking booking app for consumers.
    Your role is to assist the user with their questions about parking.
    You have access to real-time data about the parking lot and the user's current booking.

    Current parking lot status: ${parkingStats.available} spots available, ${parkingStats.occupied} spots occupied, out of ${parkingStats.total} total spots.
    User's booking status: ${bookingInfo}

    Be concise and helpful. Answer questions about parking availability, booking, pricing ($5/hour), overstay penalties ($10/hour, billed per hour or part thereof), and general help.
    Do not ask them to perform actions you cannot do, like booking a spot for them. Instead, guide them on how to use the app (e.g., "You can book a spot by clicking on any green, available spot on the map.").`;

    // FIX: Use config.systemInstruction for system prompts as per Gemini API guidelines.
    const response = await ai.models.generateContent({
        model: model,
        contents: newMessage,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error getting response from Gemini API:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
  }
};
