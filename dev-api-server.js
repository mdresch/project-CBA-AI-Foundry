// Development API server for handling /api/ai/chat
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Get Google AI API key from environment (check multiple possible names)
const GOOGLE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.VITE_GOOGLE_AI_API_KEY || process.env.VITE_GOOGLE_AI_KEY;

if (!GOOGLE_AI_API_KEY) {
  console.error('❌ Google AI API key is required');
  console.error('Please set your Google AI API key using one of these environment variables:');
  console.error('1. GOOGLE_GENERATIVE_AI_API_KEY (preferred)');
  console.error('2. VITE_GOOGLE_AI_API_KEY');
  console.error('3. VITE_GOOGLE_AI_KEY');
  console.error('');
  console.error('Get your API key from: https://makersuite.google.com/app/apikey');
  console.error('Add to your .env file: GOOGLE_GENERATIVE_AI_API_KEY=your-api-key');
  console.error('');
  console.error('For now, falling back to mock responses...');
} else {
  console.log('✅ Google AI API key found, using real AI responses');
  console.log('API Key (first 10 chars):', GOOGLE_AI_API_KEY.substring(0, 10) + '...');
}

// Middleware
app.use(cors());
app.use(express.json());

// Mock authentication for development
const mockAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // For development, accept any Bearer token
  req.user = { id: 'dev-user-123' };
  next();
};

// API endpoint
app.post('/api/ai/chat', mockAuth, async (req, res) => {
  try {
    console.log('Raw request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { sessionId, messages, stream = true, systemPrompt } = req.body;
    
    console.log('API Request:', { sessionId, messageCount: messages?.length, stream, systemPrompt });

    if (!sessionId || !messages || messages.length === 0) {
      return res.status(400).json({ error: 'sessionId and messages are required' });
    }

    // Convert messages to Vercel AI SDK format
    const aiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add system prompt if provided
    if (systemPrompt) {
      aiMessages.unshift({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Get the model from the last message or use default
    const model = messages[messages.length - 1]?.meta?.model || 'gemini-1.5-flash';

    console.log('Using model:', model);
    console.log('AI Messages:', aiMessages);

    if (stream) {
      // Set up streaming response
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });

      if (!GOOGLE_AI_API_KEY) {
        // Fallback to mock response when API key is not available
        const mockResponse = `Hello! This is a mock response because the Google AI API key is not configured. You sent: "${aiMessages[aiMessages.length - 1]?.content}". Please set VITE_GOOGLE_AI_API_KEY to use real AI responses.`;
        
        // Send response in chunks to simulate streaming
        for (let i = 0; i < mockResponse.length; i += 3) {
          const chunk = mockResponse.slice(i, i + 3);
          res.write(`0:${chunk}`);
          await new Promise(resolve => setTimeout(resolve, 30)); // Simulate network delay
        }
        
        // Send completion signal
        res.write(`\n\n`);
        res.end();
      } else {
        try {
          console.log('Making Google AI streaming API call...');
          console.log('API Key being used:', GOOGLE_AI_API_KEY ? 'Present' : 'Missing');
          console.log('API Key length:', GOOGLE_AI_API_KEY ? GOOGLE_AI_API_KEY.length : 0);
          // Use Vercel AI SDK for streaming
          const result = await streamText({
            model: google(model, {
              apiKey: GOOGLE_AI_API_KEY,
            }),
            messages: aiMessages,
            maxTokens: 1000,
            temperature: 0.7,
          });

          console.log('Google AI streaming API call successful, streaming response...');
          // Stream the response
          for await (const chunk of result.textStream) {
            res.write(`0:${chunk}`);
          }
          
          // Send completion signal
          res.write(`\n\n`);
          res.end();
        } catch (aiError) {
          console.error('Google AI Streaming Error:', aiError);
          console.error('Error details:', {
            message: aiError.message,
            stack: aiError.stack,
            name: aiError.name
          });
          res.write(`0:Error: ${aiError.message}`);
          res.end();
        }
      }
    } else {
      // Non-streaming response
      if (!GOOGLE_AI_API_KEY) {
        // Fallback to mock response when API key is not available
        const mockResponse = `Mock response: ${aiMessages[aiMessages.length - 1]?.content}. Please set VITE_GOOGLE_AI_API_KEY to use real AI responses.`;
        res.json({
          response: mockResponse,
          meta: {
            model: 'mock-model',
            tokens: mockResponse.length,
            latencyMs: 100
          }
        });
      } else {
        try {
          console.log('Making Google AI API call...');
          console.log('API Key being used:', GOOGLE_AI_API_KEY ? 'Present' : 'Missing');
          console.log('API Key length:', GOOGLE_AI_API_KEY ? GOOGLE_AI_API_KEY.length : 0);
          const result = await streamText({
            model: google(model, {
              apiKey: GOOGLE_AI_API_KEY,
            }),
            messages: aiMessages,
            maxTokens: 1000,
            temperature: 0.7,
          });

          console.log('Google AI API call successful, getting text...');
          const text = await result.text;
          console.log('Response text length:', text.length);
          
          res.json({
            response: text,
            meta: {
              model,
              tokens: result.usage?.totalTokens || 0,
              latencyMs: 100
            }
          });
        } catch (aiError) {
          console.error('Google AI Error:', aiError);
          console.error('Error details:', {
            message: aiError.message,
            stack: aiError.stack,
            name: aiError.name
          });
          res.status(500).json({
            error: {
              code: 'AI_ERROR',
              message: aiError.message,
              retryable: true
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: { 
        code: 'API_ERROR', 
        message: error.message, 
        retryable: true 
      } 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/ai/chat`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});
