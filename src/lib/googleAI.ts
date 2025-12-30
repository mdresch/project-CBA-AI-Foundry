// src/lib/googleAI.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-toastify";

// Access the API key from the environment variable
const API_KEY = import.meta.env.VITE_GOOGLE_AI_KEY;

// Fail gracefully when API key is missing: warn at import time but do not throw.
if (!API_KEY) {
    // Avoid throwing during module import (which would crash the whole app).
    // Provide a clear console warning — UI features that require Google AI will be disabled.
    // Note: toast may not be available at import time in some environments, so prefer console.warn.
    // We still avoid throwing so the app can render and the developer can add the env var.
    // Use console.warn to make the message visible in browser devtools.
    // If you want a toast, the functions below will show toasts when invoked.
    console.warn(
        "Google AI API key not found. Make sure VITE_GOOGLE_AI_KEY is set in your .env file. Google AI features will be disabled."
    );
}

let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
    } catch (initError: unknown) {
        // Initialization failed; log and keep genAI null so callers can handle gracefully.
        console.error("Failed to initialize GoogleGenerativeAI:", initError);
        genAI = null;
    }
}

// --- listAvailableModels Function ---
export async function listAvailableModels(): Promise<string[] | null> {
    if (!API_KEY) {
        console.warn("listAvailableModels: VITE_GOOGLE_AI_KEY not set; skipping Google AI call.");
        return null;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
        const data = await response.json();

        if (!response.ok) {
            console.error("ListModels API Error:", data);
            try {
                toast.error(`Failed to fetch models: ${data.errorMessage || 'Unknown error'}`);
            } catch (toastErr: unknown) {
                console.warn('Toast failed in listAvailableModels:', toastErr);
            }
            throw new Error(`Failed to fetch models: ${data?.error?.message || 'Unknown error'}`);
        }

            if (data && data.models && Array.isArray(data.models)) {
            const modelNames = data.models
                .map((model: unknown) => ((model as Record<string, unknown>).name as string || '').replace("models/", ""))
                .filter((modelName: string) => modelName.startsWith("gemini") && !modelName.includes("vision") && !modelName.includes("embedding"));
            return modelNames;
        } else {
            console.error("Unexpected response format:", data);
            try {
                toast.error("Unexpected response format while fetching models.");
            } catch (toastErr: unknown) {
                console.warn('Toast failed in listAvailableModels:', toastErr);
            }
            return null;
        }
    } catch (error: unknown) {
        console.error("Error listing models:", error);
        const message = error instanceof Error ? error.message : String(error);
        try {
            toast.error(`Error listing models: ${message}`);
        } catch (toastErr: unknown) {
            console.warn('Toast failed in listAvailableModels:', toastErr);
        }
        throw new Error(`Error fetching model list: ${message}`);
    }
}

export async function generateAIResponse(prompt: string, modelName: string): Promise<string> {
    if (!API_KEY || !genAI) {
        const msg = "Google AI is not configured. Set VITE_GOOGLE_AI_KEY in your .env to enable AI generation.";
    console.warn("generateAIResponse: ", msg);
        throw new Error(msg);
    }

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
                            const reason = response.candidates[0].finishReason;
                        throw new Error(`[GoogleGenerativeAI Error]: Generation did not complete. Finish reason: ${reason}`);
        }

        const text = response.text();

        return text;

    } catch (error: unknown) {
        // Ensure *all* errors are caught and re-thrown with a clear message
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`[GoogleGenerativeAI Error]: ${message}`);
    }
}