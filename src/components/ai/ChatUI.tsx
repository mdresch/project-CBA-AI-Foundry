
// src/components/ai/ChatUI.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../../lib/hooks/use-chat';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { AdvancedConversationContainer } from './ConversationContainer';
import { EnhancedPromptInput } from './EnhancedPromptInput';
import { SuggestionChips } from './SuggestionChips';
import { BookMarked } from 'lucide-react';
import { useTheme } from '../../context/useTheme';
import { listAvailableModels } from '../../lib/googleAI';
import promptTemplatesData from '../../data/promptTemplates.json';
import { PromptTemplate, Message, ChatSession, SuggestionGroup, SuggestionChip, SuggestionContext } from '../../types';
import { supabase } from '../../utils/supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '../../context/useAuth';
import { toast } from 'react-toastify';
import { SuggestionGenerator } from '../../utils/suggestionGenerator';
import { AISuggestionGenerator } from '../../utils/aiSuggestionGenerator';
import { useChatAnalytics } from '../../utils/chatAnalytics';

const promptTemplates: PromptTemplate[] = promptTemplatesData as PromptTemplate[];

export const ChatUI: React.FC = () => {
    const { isDarkTheme } = useTheme();
    const { user } = useAuth();
    const { chatSessions, isLoading, handleSubmit: handleChatSubmit } = useChat();

    const [prompt, setPrompt] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
    const [selectedModel, setSelectedModel] = useState('');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const mainContentRef = useRef<HTMLDivElement | null>(null);
    const [chatSummary, setChatSummary] = useState<Record<string, { id: string; content: string; time: string; sessionId: string; userId: string }[]>>({});
    const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<SuggestionGroup[]>([]);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    const { trackMessageSent, trackMessageReceived, trackMessageRetry, trackMessageSaved, trackSessionStart, trackSessionEnd, trackError } = useChatAnalytics();

    const defaultModel = 'gemini-2.0-flash';

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const models = await listAvailableModels();
                if (models && models.length > 0) {
                    setAvailableModels(models);
                    setSelectedModel(models.includes(defaultModel) ? defaultModel : models[0]);
                }
            } catch (err) {
                console.error('Error fetching models', err);
            }
        };
        fetchModels();
    }, []);

    const calculateChatSummary = useCallback(() => {
        const summary = chatSessions.reduce<Record<string, { id: string; content: string; time: string; sessionId: string; userId: string }[]>>((acc, s) => {
          const firstUser = s.messages.find((m) => m.role === 'user');
          if (!firstUser) return acc;
          const date = new Date(firstUser.timestamp).toLocaleDateString();
          const time = new Date(firstUser.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (!acc[date]) acc[date] = [];
          acc[date].push({ id: firstUser.id, content: firstUser.content, time, sessionId: s.id, userId: s.user_id });
          return acc;
        }, {});
        setChatSummary(summary);
      }, [chatSessions]);
    
      useEffect(() => { calculateChatSummary(); }, [calculateChatSummary]);

    // Generate suggestions based on conversation context
    const generateSuggestions = useCallback(async () => {
        if (chatSessions.length === 0) {
            setSuggestions([]);
            return;
        }

        setIsGeneratingSuggestions(true);
        try {
            const currentSession = chatSessions[chatSessions.length - 1];
            const context: SuggestionContext = {
                conversationHistory: currentSession.messages,
                lastMessage: currentSession.messages[currentSession.messages.length - 1],
                userPreferences: {}
            };

            // Generate both pattern-based and AI-powered suggestions
            const [patternSuggestions, aiSuggestions] = await Promise.all([
                Promise.resolve(SuggestionGenerator.generateSuggestions(context)),
                AISuggestionGenerator.generateSuggestionsWithModel(context, selectedModel)
            ]);

            // Combine and prioritize AI-powered suggestions
            const combinedSuggestions = [...aiSuggestions, ...patternSuggestions];
            
            // Remove duplicates and limit total suggestions
            const uniqueSuggestions = combinedSuggestions.reduce((acc, group) => {
                const existingGroup = acc.find(g => g.category === group.category);
                if (existingGroup) {
                    // Merge chips, removing duplicates
                    const existingChips = existingGroup.chips.map(c => c.text);
                    const newChips = group.chips.filter(c => !existingChips.includes(c.text));
                    existingGroup.chips.push(...newChips);
                } else {
                    acc.push(group);
                }
                return acc;
            }, [] as SuggestionGroup[]);

            setSuggestions(uniqueSuggestions.slice(0, 4)); // Limit to 4 groups
        } catch (error) {
            console.error('Error generating suggestions:', error);
            // Fallback to pattern-based suggestions only
            try {
                const currentSession = chatSessions[chatSessions.length - 1];
                const context: SuggestionContext = {
                    conversationHistory: currentSession.messages,
                    lastMessage: currentSession.messages[currentSession.messages.length - 1],
                    userPreferences: {}
                };
                const fallbackSuggestions = SuggestionGenerator.generateSuggestions(context);
                setSuggestions(fallbackSuggestions);
            } catch (fallbackError) {
                console.error('Error generating fallback suggestions:', fallbackError);
                setSuggestions([]);
            }
        } finally {
            setIsGeneratingSuggestions(false);
        }
    }, [chatSessions, selectedModel]);

    // Generate suggestions when conversation changes
    useEffect(() => {
        const timer = setTimeout(() => {
            generateSuggestions();
        }, 1000); // Debounce suggestion generation

        return () => clearTimeout(timer);
    }, [generateSuggestions]);

    const applyTemplate = (templateObj: PromptTemplate) => {
        const { template, variables } = templateObj;
        if (variables && variables.length > 0) {
            const vars: Record<string, string> = {};
            variables.forEach((v) => (vars[v.name] = ''));
            setTemplateVariables(vars);
            setPrompt(template);
        } else {
            setTemplateVariables({});
            setPrompt(template);
        }
        setSelectedTemplate(templateObj.id);
    };

    const handleVariableChange = useCallback((variableName: string, value: string) => {
        setTemplateVariables((prev) => ({ ...prev, [variableName]: value }));
        setPrompt((prev) => {
            const t = promptTemplates.find((p) => p.id === selectedTemplate);
            if (!t) return prev;
            let newPrompt = t.template || '';
            (t.variables || []).forEach((v) => { const val = v.name === variableName ? value : templateVariables[v.name] || ''; newPrompt = newPrompt.replace(`{{${v.name}}}`, val); });
            return newPrompt;
        });
    }, [selectedTemplate, templateVariables]);

    const clearTemplate = () => { setSelectedTemplate(''); setTemplateVariables({}); setPrompt(''); };

    const handleSubmit = (e: React.FormEvent, fileAttachments?: import('./FileUpload').FileAttachment[]) => {
        e.preventDefault();
        
        // Track message sent
        const currentSession = chatSessions[chatSessions.length - 1];
        if (currentSession) {
            trackMessageSent({
                id: `temp-${Date.now()}`,
                sessionId: currentSession.id,
                role: 'user',
                content: prompt,
                status: 'sent',
                createdAt: new Date().toISOString(),
                timestamp: new Date(),
                meta: { model: selectedModel || defaultModel },
                attachments: fileAttachments
            });
        }
        
        handleChatSubmit(prompt, selectedModel, selectedTemplate, templateVariables, fileAttachments);
        setPrompt('');
        setTemplateVariables({});
    };

    const saveToPromptLibrary = async (message: Message) => {
        if (!user?.id) { toast.error('You must be logged in to save prompts.'); return; }
        try {
            const { error } = await (supabase as SupabaseClient).from('userpromptlibrary').insert([{ user_id: user.id, content: message.content, message_id: message.id, model: message.model }]);
            if (error) throw error;
            
            // Track message saved
            trackMessageSaved(message.id, message.sessionId);
            
            toast.success('Prompt saved to library!');
        } catch (err) { 
            console.error('Failed to save prompt:', err); 
            trackError(message.sessionId, 'save_prompt_error', err instanceof Error ? err.message : 'Unknown error');
            toast.error('Failed to save prompt.'); 
        }
    };

    const handleRetryMessage = async (messageId: string) => {
        setRetryingMessageId(messageId);
        try {
            // Find the message to retry
            const messageToRetry = chatSessions
                .flatMap(s => s.messages)
                .find(m => m.id === messageId);
            
            if (!messageToRetry) {
                toast.error('Message not found');
                return;
            }
            
            // Track message retry
            trackMessageRetry(messageId, messageToRetry.sessionId);

            // Find the user message that prompted this AI response
            const session = chatSessions.find(s => 
                s.messages.some(m => m.id === messageId)
            );
            
            if (!session) {
                toast.error('Session not found');
                return;
            }

            const userMessage = session.messages
                .filter(m => m.role === 'user')
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .pop();

            if (!userMessage) {
                toast.error('Original user message not found');
                return;
            }

            // Retry with the same prompt and model
            await handleChatSubmit(
                userMessage.content,
                userMessage.model || selectedModel,
                undefined,
                {},
                undefined
            );

            toast.success('Retrying message...');
        } catch (error) {
            console.error('Failed to retry message:', error);
            toast.error('Failed to retry message');
        } finally {
            setRetryingMessageId(null);
        }
    };

    const handleSuggestionClick = (suggestion: SuggestionChip) => {
        setPrompt(suggestion.text);
        // Auto-focus the input after setting the prompt
        setTimeout(() => {
            const input = document.querySelector('textarea[placeholder*="Type your message"]') as HTMLTextAreaElement;
            if (input) {
                input.focus();
            }
        }, 100);
    };

    return (
        <div className={`min-h-screen pt-16 pb-32 ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        {/* Template Sidebar */}
                        <div className={`rounded-lg p-4 shadow-lg border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <BookMarked className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`} />
                                <h2 className="font-semibold">Templates</h2>
                            </div>
                            <div className="space-y-2">
                                {promptTemplates.map((t) => (
                                    <button key={t.id} onClick={() => applyTemplate(t)} className={`w-full text-left text-sm p-2 rounded transition-colors ${isDarkTheme ? 'text-gray-400 hover:bg-zinc-800' : 'text-gray-600 hover:bg-gray-100'} ${selectedTemplate === t.id ? 'font-bold' : ''}`}>{t.name}</button>
                                ))}
                            </div>
                        </div>
                        {/* History Sidebar */}
                        <div className={`rounded-lg p-4 shadow-lg border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                            <h2 className="font-semibold mb-2">AI History</h2>
                            <div className="space-y-2">
                            {Object.entries(chatSummary).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([date, prompts]) => (
                                <div key={date}>
                                <h3 className="text-sm font-medium">{date}</h3>
                                <ul className="list-disc list-inside">
                                    {prompts.map((p) => (
                                    <li key={p.id} className="text-xs"><a href={`#session-${p.sessionId}`} onClick={(ev) => { ev.preventDefault(); const el = document.getElementById(`session-${p.sessionId}`); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="hover:underline">{p.time} - {p.content.substring(0, 50)}...</a></li>
                                    ))}
                                </ul>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className={`rounded-lg shadow-lg min-h-[600px] flex flex-col border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                            <AdvancedConversationContainer
                                messages={chatSessions.flatMap(s => s.messages)}
                                isLoading={isLoading}
                                onRetry={handleRetryMessage}
                                onSave={saveToPromptLibrary}
                                className="flex-1"
                                showScrollButton={true}
                                enableAutoScroll={true}
                                enableTypingIndicator={true}
                                enableMessageAnimations={true}
                                scrollBehavior="smooth"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Suggestion Chips */}
            {suggestions.length > 0 && (
                <div className="fixed bottom-32 left-0 right-0 z-10 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <SuggestionChips
                            suggestions={suggestions}
                            onSuggestionClick={handleSuggestionClick}
                            isLoading={isGeneratingSuggestions}
                            isCollapsible={true}
                            defaultCollapsed={true}
                            className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg"
                        />
                    </div>
                </div>
            )}

            {/* Enhanced Prompt Input at Bottom */}
            <EnhancedPromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                isLoading={isLoading}
                handleSubmit={handleSubmit}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                availableModels={availableModels}
                selectedTemplate={selectedTemplate}
                templateVariables={templateVariables}
                promptTemplates={promptTemplates}
                handleVariableChange={handleVariableChange}
                clearTemplate={clearTemplate}
                isDarkTheme={isDarkTheme}
                placeholder="Type your message here... (Ctrl+Enter to send)"
                maxFiles={5}
                maxFileSize={10}
                acceptedFileTypes={['image/*', 'text/*', 'application/pdf', 'application/json']}
                isCollapsible={false}
                defaultCollapsed={false}
            />
        </div>
    );
};
