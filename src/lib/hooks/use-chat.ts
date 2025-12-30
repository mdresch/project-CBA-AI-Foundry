// src/lib/hooks/use-chat.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../utils/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Message, ChatSession } from '../../types';
import { mapSessionRow } from '../../utils/dbMappers';
import { generateChainOfThoughtForMessage } from '../../utils/enhancedChainOfThoughtGenerator';
import { toast } from 'react-toastify';

// Helper function to serialize chain of thought data for database storage
const serializeChainOfThought = (chainOfThought: any) => {
    if (!chainOfThought) return null;
    
    try {
        // Create a minimal version with only basic data types
        const minimal = chainOfThought.map((step: any) => {
            const minimalStep: any = {
                id: String(step.id || ''),
                title: String(step.title || ''),
                content: String(step.content || ''),
                status: String(step.status || 'completed')
            };
            
            // Only add timestamp if it exists and is valid
            if (step.timestamp && step.timestamp instanceof Date) {
                minimalStep.timestamp = step.timestamp.toISOString();
            }
            
            // Only add confidence if it's a number
            if (typeof step.confidence === 'number' && !isNaN(step.confidence)) {
                minimalStep.confidence = step.confidence;
            }
            
            // Only add reasoning if it's a string
            if (typeof step.reasoning === 'string') {
                minimalStep.reasoning = step.reasoning;
            }
            
            // Only add search results if they exist and are arrays
            if (Array.isArray(step.searchResults) && step.searchResults.length > 0) {
                minimalStep.searchResults = step.searchResults.map((result: any) => ({
                    id: String(result.id || ''),
                    title: String(result.title || ''),
                    url: String(result.url || ''),
                    snippet: String(result.snippet || ''),
                    relevanceScore: typeof result.relevanceScore === 'number' ? result.relevanceScore : 0
                }));
            }
            
            // Only add images if they exist and are arrays
            if (Array.isArray(step.images) && step.images.length > 0) {
                minimalStep.images = step.images.map((image: any) => ({
                    id: String(image.id || ''),
                    url: String(image.url || ''),
                    alt: String(image.alt || ''),
                    caption: String(image.caption || ''),
                    width: typeof image.width === 'number' ? image.width : undefined,
                    height: typeof image.height === 'number' ? image.height : undefined
                }));
            }
            
            return minimalStep;
        });
        
        // Double-check serialization
        const jsonString = JSON.stringify(minimal);
        const parsed = JSON.parse(jsonString);
        
        return parsed;
    } catch (error) {
        console.error('Error serializing chain of thought:', error);
        console.error('Problematic data:', chainOfThought);
        return null;
    }
};

export const useChat = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const userId = (user as unknown as { id?: string | undefined })?.id;

    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const safeErrorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

    useEffect(() => {
        const fetchChatSessions = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const { data, error } = await (supabase as unknown as SupabaseClient).from('sessions')
                    .select(`
                        id, 
                        created_at, 
                        title, 
                        user_id, 
                        messages (
                            id,
                            content,
                            role,
                            created_at,
                            model,
                            session_id,
                            status,
                            chain_of_thought
                        )
                    `) 
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });
                if (error) throw error;
                const rows = (data ?? []) as unknown[];
                const formatted: ChatSession[] = rows.map((r) => mapSessionRow(r as unknown as import('../../utils/dbMappers').DBSessionRow));
                setChatSessions(formatted);
            } catch (err: unknown) {
                console.error('Failed to load chat sessions:', err);
                console.error('Error details:', safeErrorMessage(err));
            } finally {
                setIsLoading(false);
            }
        };
        if (!isAuthLoading) {
            fetchChatSessions();
        }
    }, [userId, isAuthLoading]);

    const handleSubmit = async (prompt: string, selectedModel: string, selectedTemplate?: string, _templateVariables?: Record<string, string>, fileAttachments?: import('../../components/ai/FileUpload').FileAttachment[]) => {
        if (!prompt.trim()) return toast.warn('Please enter a message before sending.');
        if (!selectedModel) return toast.warn('Please select a model before sending.');
        if (!userId) return toast.error('You must be logged in to chat.');

        setIsLoading(true);
        const tempSessionId = `temp-${Date.now()}`;
        const sessionTitle = prompt.substring(0, 50).replace(/\s+\S*$/, '');

        // Process file attachments
        const processedAttachments: import('../../types').FileAttachment[] = [];
        if (fileAttachments && fileAttachments.length > 0) {
            for (const fileAttachment of fileAttachments) {
                const processedAttachment: import('../../types').FileAttachment = {
                    id: fileAttachment.id,
                    name: fileAttachment.name,
                    size: fileAttachment.size,
                    type: fileAttachment.type,
                    preview: fileAttachment.preview
                };

                // For text files, read content
                if (fileAttachment.type.startsWith('text/') || fileAttachment.type === 'application/json') {
                    try {
                        const content = await new Promise<string>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsText(fileAttachment.file);
                        });
                        processedAttachment.content = btoa(content); // Base64 encode
                    } catch (error) {
                        console.error('Error reading file content:', error);
                    }
                }

                processedAttachments.push(processedAttachment);
            }
        }

        const newUserMessage: Message = { 
            id: `${tempSessionId}-user`, 
            content: prompt, 
            role: 'user', 
            timestamp: new Date(), 
            model: selectedModel, 
            session_id: tempSessionId,
            attachments: processedAttachments.length > 0 ? processedAttachments : undefined
        };
        const assistantPlaceholder: Message = { 
            id: `${tempSessionId}-ai`, 
            content: '', 
            role: 'assistant', 
            timestamp: new Date(Date.now() + 1), 
            model: selectedModel, 
            session_id: tempSessionId 
        };

        const optimisticSession: ChatSession = { 
            id: tempSessionId, 
            created_at: new Date().toISOString(), 
            title: sessionTitle, 
            user_id: userId, 
            messages: [newUserMessage, assistantPlaceholder] 
        };
        setChatSessions((prev) => [optimisticSession, ...prev]);

        let fullResponse = '';

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            // Prepare messages array for the new API contract
            const messagesForAPI = [newUserMessage].map(msg => ({
                id: msg.id,
                sessionId: msg.session_id!,
                role: msg.role as 'system' | 'user' | 'assistant' | 'tool',
                content: msg.content,
                status: 'sent' as const,
                createdAt: msg.timestamp.toISOString(),
                meta: {
                    model: msg.model,
                }
            }));

            // For development, use a mock response when API is not available
            const useMockResponse = false; // Set to false when API is working
            
            if (useMockResponse) {
                // Mock streaming response for development
                const mockResponse = `Hello! This is a mock response from the development environment. You sent: "${prompt}" using model: ${selectedModel}. This response simulates the Vercel AI SDK integration.`;
                
                // Simulate streaming by sending chunks
                for (let i = 0; i < mockResponse.length; i += 5) {
                    const chunk = mockResponse.slice(i, i + 5);
                    fullResponse += chunk;
                    setChatSessions((prev) => prev.map((s) => s.id === tempSessionId ? { 
                        ...s, 
                        messages: s.messages.map((m) => m.id === assistantPlaceholder.id ? { 
                            ...m, 
                            content: fullResponse,
                            status: 'sent' as const
                        } : m) 
                    } : s));
                    
                    // Small delay to simulate streaming
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            } else {
                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ 
                        sessionId: tempSessionId,
                        messages: messagesForAPI,
                        stream: true,
                        systemPrompt: selectedTemplate ? `Template: ${selectedTemplate}` : undefined
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || errorData.error || 'API request failed');
                }

                if (!response.body) {
                    throw new Error("Response body is empty");
                }

                // Handle Vercel AI SDK streaming format
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(line => line.trim());
                    
                    for (const line of lines) {
                        if (line.startsWith('0:')) {
                            // Vercel AI SDK format: "0:content"
                            const content = line.substring(2);
                            if (content) {
                                fullResponse += content;
                                setChatSessions((prev) => prev.map((s) => s.id === tempSessionId ? { 
                                    ...s, 
                                    messages: s.messages.map((m) => m.id === assistantPlaceholder.id ? { 
                                        ...m, 
                                        content: fullResponse,
                                        status: 'sent' as const
                                    } : m) 
                                } : s));
                            }
                        } else if (line.startsWith('data:')) {
                            // Legacy format support
                            const jsonStr = line.replace(/^data: /, '');
                            try {
                                const parsed = JSON.parse(jsonStr);
                                const delta = parsed.delta;
                                if (delta) {
                                    fullResponse += delta;
                                    setChatSessions((prev) => prev.map((s) => s.id === tempSessionId ? { 
                                        ...s, 
                                        messages: s.messages.map((m) => m.id === assistantPlaceholder.id ? { 
                                            ...m, 
                                            content: fullResponse,
                                            status: 'sent' as const
                                        } : m) 
                                    } : s));
                                }
                            } catch (e) {
                                console.error("Failed to parse stream chunk", jsonStr);
                            }
                        }
                    }
                }
            }

                // Generate chain of thought for the AI response
                let chainOfThought = null;
                try {
                    chainOfThought = generateChainOfThoughtForMessage(prompt);
                    console.log('Chain of thought generated successfully');
                } catch (error) {
                    console.error('Error generating chain of thought:', error);
                    // Continue without chain of thought if generation fails
                }

            const finalAssistantMessage: Message = { 
                ...assistantPlaceholder, 
                content: fullResponse, 
                timestamp: new Date(),
                chainOfThought: chainOfThought || undefined
            };

            // Update the message with chain of thought in the UI
            setChatSessions((prev) => prev.map((s) => s.id === tempSessionId ? { 
                ...s, 
                messages: s.messages.map((m) => m.id === assistantPlaceholder.id ? { 
                    ...m, 
                    content: fullResponse,
                    chainOfThought: chainOfThought || undefined,
                    status: 'sent' as const
                } : m) 
            } : s));

            // Persist to DB - let Supabase generate the UUID for id
            const { data: sessionData, error: sessionError } = await (supabase as SupabaseClient).from('sessions').insert([{ 
                user_id: userId, 
                title: sessionTitle
            }]).select('id').single();
            if (sessionError) throw sessionError;
            
            // Update the session ID with the actual UUID from the database
            const actualSessionId = sessionData.id;

                const serializedChainOfThought = serializeChainOfThought(finalAssistantMessage.chainOfThought);
                
                const messagesToInsert = [
                    { 
                        session_id: actualSessionId, 
                        content: newUserMessage.content, 
                        role: newUserMessage.role, 
                        created_at: newUserMessage.timestamp.toISOString(), 
                        model: newUserMessage.model,
                        status: 'done'
                    },
                    { 
                        session_id: actualSessionId, 
                        content: finalAssistantMessage.content, 
                        role: finalAssistantMessage.role, 
                        created_at: finalAssistantMessage.timestamp.toISOString(), 
                        model: finalAssistantMessage.model,
                        status: 'done',
                        chain_of_thought: serializedChainOfThought
                    },
                ];
                
                const { error: messagesError } = await (supabase as SupabaseClient).from('messages').insert(messagesToInsert);

            if (messagesError) {
                await (supabase as SupabaseClient).from('sessions').delete().eq('id', actualSessionId);
                throw messagesError;
            }

            // Update the session with the actual database ID
            setChatSessions((prev) => prev.map((s) => s.id === tempSessionId ? { 
                ...s, 
                id: actualSessionId,
                messages: s.messages.map((m) => ({ ...m, session_id: actualSessionId }))
            } : s));

            toast.success('Response received!');
        } catch (err: unknown) {
            console.error('Send failed:', err);
            console.error('Error details:', safeErrorMessage(err));
            toast.error(`Failed to generate response: ${safeErrorMessage(err)}`);
            setChatSessions((prev) => prev.map((s) => s.id === tempSessionId ? { 
                ...s, 
                messages: s.messages.map((m) => m.id.endsWith('-ai') ? { 
                    ...m, 
                    content: `Failed to generate response. Please try again.`,
                    status: 'error' as const
                } : m) 
            } : s));
        } finally {
            setIsLoading(false);
        }
    };

    return { chatSessions, isLoading, handleSubmit };
};