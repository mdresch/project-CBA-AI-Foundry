// src/lib/googleAI.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-toastify";

// Access the API key from the environment variable
const API_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;

// --- Error Handling for Missing API Key ---
if (!API_KEY) {
    toast.error("Google AI API key not found. Make sure VITE_GOOGLE_AI_KEY is set in your .env file.");
    throw new Error("Google AI API key not found.  Make sure VITE_GOOGLE_AI_KEY is set in your .env file.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// --- listAvailableModels Function ---
export async function listAvailableModels(): Promise<string[] | null> {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
        const data = await response.json();

        if (!response.ok) {
            console.error("ListModels API Error:", data);
            toast.error(`Failed to fetch models: ${data.errorMessage || 'Unknown error'}`);
            throw new Error(`Failed to fetch models: ${data.error.message || 'Unknown error'}`); // Throw error
        }

        if (data && data.models && Array.isArray(data.models)) {
            const modelNames = data.models.map((model: any) => model.name.replace("models/", ""))
            .filter((modelName: string) => 
                modelName.startsWith("gemini") &&
                !modelName.includes("vision") &&
                !modelName.includes("embedding") 
            );
            return modelNames;
        } else {
            console.error("Unexpected response format:", data);
            toast.error("Unexpected response format:", data);
            return null;
        }

    } catch (error: any) {
        console.error("Error listing models:", error);
        toast.error(`Error listing models: ${error.message}`);
        throw new Error(`Error fetching model list: ${error.message}`); // Re-throw for handling
    }
}

export async function generateAIResponse(prompt: string, modelName: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });

        // Construct the request.  For vision models, this would need to include image data.
        const request = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        };

        const result = await model.generateContent(request); // Pass the request object
        const response = await result.response;

        // Check for safety ratings and other potential issues in the response
        if (response.promptFeedback) {
          console.log("Prompt Feedback:", response.promptFeedback);
            if (response.promptFeedback.blockReason) {
               throw new Error(`[GoogleGenerativeAI Error]: Prompt blocked: ${response.promptFeedback.blockReason}`);
            }
            // Check safetyRatings
            if (Array.isArray(response.promptFeedback.safetyRatings)) {
               for (const rating of response.promptFeedback.safetyRatings) {
                   if (rating.probability !== "NEGLIGIBLE") {
                      // Handle the case where a safety rating is not negligible
                       throw new Error(`Safety rating issue: ${rating.category} - ${rating.probability}`);

                   }
               }
            }
        }

        //Check if the reponse contains candidates
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("[GoogleGenerativeAI Error]: No response candidates received from the API.");
        }

        // Check for finishReason other than STOP
        if (response.candidates[0].finishReason !== "STOP") {
              let reason = response.candidates[0].finishReason;
            throw new Error(`[GoogleGenerativeAI Error]: Generation did not complete. Finish reason: ${reason}`);
        }

        const text = response.text();

        return text;

    } catch (error: any) {
        // Ensure *all* errors are caught and re-thrown with a clear message
        throw new Error(`[GoogleGenerativeAI Error]: ${error.message}`);
    }
}