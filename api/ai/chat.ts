// api/ai/chat.ts
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GOOGLE_AI_API_KEY = process.env.VITE_GOOGLE_AI_API_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Edge runtime configuration
export const config = {
  runtime: 'edge',
};

// Types matching the implementation plan
interface Message {
  id: string;
  sessionId: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  status: 'pending' | 'sent' | 'error' | 'done';
  createdAt: string;
  meta?: { model?: string; tokens?: number; latencyMs?: number };
}

interface ChatRequest {
  sessionId: string;
  messages: Message[];
  stream?: boolean;
  systemPrompt?: string;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const body = await req.json() as ChatRequest;
    const { sessionId, messages, stream = true, systemPrompt } = body;

    if (!sessionId || !messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'sessionId and messages are required' }), { status: 400 });
    }

    // --- Authentication ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Convert messages to Vercel AI SDK format
    const aiMessages = messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant' | 'tool',
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
    const model = messages[messages.length - 1]?.meta?.model || 'gemini-2.0-flash';

    if (stream) {
      // Use Vercel AI SDK for streaming
      const result = await streamText({
        model: google(model, {
          apiKey: GOOGLE_AI_API_KEY,
        }),
        messages: aiMessages,
        maxTokens: 1000,
        temperature: 0.7,
      });

      // Return the streaming response
      return result.toDataStreamResponse({
        headers: {
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const result = await streamText({
        model: google(model, {
          apiKey: GOOGLE_AI_API_KEY,
        }),
        messages: aiMessages,
        maxTokens: 1000,
        temperature: 0.7,
      });

      const text = await result.text;
      return new Response(JSON.stringify({ 
        response: text,
        meta: {
          model,
          tokens: result.usage?.totalTokens || 0,
        }
      }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

  } catch (err: unknown) {
    console.error('api/ai/chat error', err);
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ 
      error: { 
        code: 'API_ERROR', 
        message: msg, 
        retryable: true 
      } 
    }), { status: 500 });
  }
}