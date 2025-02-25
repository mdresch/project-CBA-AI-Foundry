// src/lib/googleAI.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

async function getGenAIInstance(): Promise<GoogleGenerativeAI> {
    if (!import.meta.env.VITE_GOOGLE_AI_KEY) {
        throw new Error('Missing VITE_GOOGLE_AI_KEY environment variable');
    }

    if (!genAI) {
        genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY);
    }
    return genAI;
}

export async function generateAIResponse(prompt: string, modelName: string = "gemini-pro"): Promise<string> {
    try {
        const genAI = await getGenAIInstance();
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const response = await result.response;

        if (!response) {
            throw new Error('Empty response from Gemini API');
        }

        const text = response.text();

        if (!text) {
            throw new Error('No text content in Gemini API response');
        }

        return text;

    } catch (error: any) {
        console.error('Error generating AI response:', error);

        let errorMessage = 'Failed to generate AI response';

        if (error instanceof Error) {
            errorMessage += `: ${error.message}`;
        } else if (typeof error === 'string') {
            errorMessage += `: ${error}`;
        }

        throw new Error(errorMessage);
    }
}