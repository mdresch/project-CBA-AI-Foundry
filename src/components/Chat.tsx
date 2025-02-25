// src/components/Chat.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, BookMarked } from 'lucide-react';
import { generateAIResponse, listAvailableModels } from '../lib/googleAI';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Message, ChatSession, PromptTemplate } from '../types';
import { ChatMessage, TemplateForm } from './ChatSubComponents';
import promptTemplatesData from '../data/promptTemplates.json';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'react-toastify';

const promptTemplates: PromptTemplate[] = promptTemplatesData as PromptTemplate[];

function Chat() {
    const { isDarkTheme } = useTheme();
    const [prompt, setPrompt] = useState('');
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [templateVariables, setTemplateVariables] = useState<{ [key: string]: string }>({});
    const [chatSummary, setChatSummary] = useState<{
        [date: string]: { id: string; content: string; time: string; sessionId: string; userId: string }[];
    }>({});
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const mainContentRef = useRef<HTMLDivElement>(null);
    const [maxSessionsDisplayed, setMaxSessionsDisplayed] = useState(5);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const { session, user, isLoading: isAuthLoading, error: authError } = useAuth();
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    const defaultModel = "gemini-2.0-flash"; // Hardcoded default

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const models = await listAvailableModels();
                if (models) {
                    setAvailableModels(models);
                    console.log("Fetched models:", models); // Log fetched models

                    if (models.includes(defaultModel)) {
                        setSelectedModel(defaultModel);
                        console.log("Selected model (default):", defaultModel); // Log selected model
                    } else if (models.length > 0) {
                        setSelectedModel(models[0]);
                        console.log("Selected model (fallback):", models[0]); // Log selected model
                    } else {
                        toast.warn("No AI models are currently available.");
                    }
                }
            } catch (error) {
                console.error("Error fetching available models:", error);
                toast.error("Failed to load available AI models.");
            }
        };

        fetchModels();
    }, []);

    useEffect(() => {
        if (!isAuthLoading && !user) {
            setShowAuthDialog(true);
        }
    }, [isAuthLoading, user]);

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading authentication...</span>
            </div>
        );
    }

    const AuthDialog = () => (
        <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Authentication Required</DialogTitle>
                    <DialogDescription>
                        Please log in or create an account to use the chat feature.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-4 mt-4">
                    <a
                        href="/login"
                        className={`px-4 py-2 rounded-lg ${isDarkTheme
                            ? 'bg-white text-black hover:bg-gray-200'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                    >
                        Log In
                    </a>
                    <a
                        href="/signup"
                        className={`px-4 py-2 rounded-lg ${isDarkTheme
                            ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                            }`}
                    >
                        Sign Up
                    </a>
                </div>
            </DialogContent>
        </Dialog>
    );

    if (!user) {
        return <AuthDialog />;
    }

    const userId = user?.id;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("handleSubmit - prompt:", prompt);
        console.log("handleSubmit - isLoading (before):", isLoading);
        console.log("handleSubmit - selectedModel:", selectedModel);

        if (!prompt.trim()) {
            toast.warn("Please enter a message before sending.");
            return;
        }
        if(!selectedModel){
          toast.warn("Please select a model before sending.");
          return;
        }

        const newSessionId = Date.now().toString();
        const template = promptTemplates.find((t) => t.id === selectedTemplate);
        let newUserMessageContent = prompt;

        if (template?.variables && templateVariables) {
            template.variables.forEach((variable) => {
                newUserMessageContent += `\n{{${variable.name}}}: ${templateVariables[variable.name] || ''}`;
            });
        }

        const newUserMessage: Message = {
            id: newSessionId + '-user',
            content: newUserMessageContent,
            role: 'user',
            timestamp: new Date(),
            promptTemplateId: selectedTemplate,
            model: selectedModel,
            session_id: newSessionId,
        };

        setIsLoading(true);
        setError(null);

        try {
            console.log("handleSubmit - TRY block start");

            const aiResponse = await generateAIResponse(prompt, selectedModel);
            console.log("handleSubmit - generateAIResponse successful:", aiResponse);

            const newAssistantMessage: Message = {
                id: newSessionId + '-ai',
                content: aiResponse,
                role: 'assistant',
                timestamp: new Date(),
                promptTemplateId: selectedTemplate,
                model: selectedModel,
                session_id: newSessionId,
            };

            const sessionTitle = prompt.substring(0, 50).replace(/\s+\S*$/, '');

            const { error: sessionError } = await supabase
                .from('chat_sessions')
                .insert([{
                    id: newSessionId,
                    user_id: userId,
                    title: sessionTitle,
                    created_at: new Date().toISOString()
                }]);
            console.log("handleSubmit - Supabase session insert result:", sessionError);

            if (sessionError) {
                console.error('Error inserting chat session:', sessionError);
                toast.error(`Failed to save chat session: ${sessionError.message}`);
                setError(`Failed to save chat session: ${sessionError.message}`);
                return;
            }

            const { error: messagesError } = await supabase
                .from('messages')
                .insert([
                    { id: newUserMessage.id, session_id: newSessionId, content: newUserMessage.content, role: newUserMessage.role, timestamp: newUserMessage.timestamp.toISOString(), promptTemplateId: newUserMessage.promptTemplateId, model: newUserMessage.model },
                    { id: newAssistantMessage.id, session_id: newSessionId, content: newAssistantMessage.content, role: newAssistantMessage.role, timestamp: newAssistantMessage.timestamp.toISOString(), promptTemplateId: newAssistantMessage.promptTemplateId, model: newAssistantMessage.model }
                ]);
            console.log("handleSubmit - Supabase messages insert result:", messagesError);


            if (messagesError) {
                console.error('Error inserting messages:', messagesError);
                toast.error(`Failed to save messages: ${messagesError.message}`);
                setError(`Failed to save messages: ${messagesError.message}`);
                await supabase.from('chat_sessions').delete().eq('id', newSessionId);
                return;
            }

            toast.success("Message sent and response received!");

            setPrompt('');
            setTemplateVariables({});

        } catch (err: any) {
            console.error("Unexpected error during handleSubmit:", err);
            toast.error(`Failed to generate response: ${err.message || 'Unknown error'}`);
            setError(`Failed to generate response. Please try again. ${err.message}`);

        } finally {
            console.log("handleSubmit - FINALLY block start");
            setIsLoading(false);
            console.log("handleSubmit - isLoading (finally):", isLoading);
            setPrompt('');
            setTemplateVariables({});
            setTimeout(() => {
                if (mainContentRef.current) {
                    mainContentRef.current.scrollTop = mainContentRef.current.scrollHeight;
                }
            }, 100);
        }
    };

    const applyTemplate = (templateObj: PromptTemplate) => {
        const { template, variables } = templateObj;

        if (variables && variables.length > 0) {
            const initialVariables: { [key: string]: string } = {};
            variables.forEach((variable) => {
                initialVariables[variable.name] = '';
            });
            setTemplateVariables(initialVariables);
            setPrompt(template);
        } else {
            setPrompt(template);
            setTemplateVariables({});
        }
        setSelectedTemplate(templateObj.id);
    };

    const handleVariableChange = useCallback((variableName: string, value: string) => {
        setTemplateVariables((prev) => ({ ...prev, [variableName]: value }));

        setPrompt((prevPrompt) => {
            const templateObj = promptTemplates.find((t) => t.id === selectedTemplate);

            if (!templateObj) return prevPrompt;

            const template = templateObj.template || '';
            let newPrompt = template;
            const allVariables = templateObj.variables;

            if (allVariables) {
                allVariables.forEach((variable) => {
                    const varName = variable.name;
                    const varValue = variableName === varName ? value : (templateVariables[varName] || '');
                    newPrompt = newPrompt.replace(`{{${varName}}}`, varValue);
                });
            }

            return newPrompt;
        });
    }, [selectedTemplate, promptTemplates, templateVariables, setPrompt]);

    const clearTemplate = () => {
        setSelectedTemplate('');
        setPrompt('');
        setTemplateVariables({});
    };

    const saveToPromptLibrary = async (message: Message) => {
        if (!userId) {
            toast.error("You must be logged in to save prompts.");
            return;
        }

        try {
            const { error } = await supabase
                .from('userpromptlibrary')
                .insert([{
                    user_id: userId,
                    content: message.content,
                    message_id: message.id,
                    prompt_template_id: message.promptTemplateId,
                    model: message.model
                }]);

            if (error) {
                console.error("Error saving prompt to library:", error);
                setError(`Failed to save prompt: ${error.message}`);
                toast.error(`Failed to save prompt: ${error.message}`);
            } else {
                toast.success("Prompt saved to library!");
            }
        } catch (err: any) {
            console.error("Unexpected error saving prompt:", err);
            setError(`Unexpected error: ${err.message}`);
            toast.error(`Unexpected error: ${err.message}`);
        }
    };

    const calculateChatSummary = () => {
        const summary = chatSessions.reduce<{
          [date: string]: { id: string; content: string; time: string; sessionId: string; userId: string }[];
        }>((acc, session) => {
          const userMessage = session.messages.find((msg) => msg.role === 'user');
          if (userMessage) {
            const date = new Date(userMessage.timestamp).toLocaleDateString();
            const time = new Date(userMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push({
              id: userMessage.id,
              content: userMessage.content,
              time: time,
              sessionId: session.id,
              userId: userId,
            });
          }
          return acc;
        }, {});
        setChatSummary(summary);
    };

    useEffect(() => {
        const fetchChatSessions = async () => {
            setIsLoading(true);
            setError(null);

            if (!userId) {
                console.log("User ID not available yet. Not fetching.");
                setIsLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('chat_sessions')
                    .select(`
                        id,
                        created_at,
                        title,
                        user_id,
                        messages (
                            id,
                            content,
                            role,
                            timestamp,
                            promptTemplateId,
                            model,
                            session_id
                        )
                    `)
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching chat sessions:', error);
                    setError(`Failed to load chat history: ${error.message}`);
                    return;
                }

                if (data) {
                    const formattedSessions: ChatSession[] = data.map((session: any) => {
                        const formattedSession: ChatSession = {
                            id: session.id,
                            created_at: session.created_at,
                            sessionTimestamp: new Date(session.created_at),
                            title: session.title,
                            user_id: session.user_id,
                            messages: session.messages.map((msg: any) => {
                                return {
                                    id: msg.id,
                                    content: msg.content,
                                    role: msg.role,
                                    timestamp: new Date(msg.timestamp),
                                    promptTemplateId: msg.promptTemplateId,
                                    model: msg.model,
                                    session_id: msg.session_id,
                                };
                            }).sort((a: Message, b: Message) => a.timestamp.getTime() - b.timestamp.getTime()),
                        };
                        return formattedSession;
                    });
                    setChatSessions(formattedSessions);
                } else {
                    setChatSessions([]);
                }
            } catch (err: any) {
                console.error('Unexpected error fetching chat sessions:', err);
                setError(`Unexpected error loading chat history: ${err.message || err}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatSessions();
    }, [userId]);

      useEffect(()=> {
        calculateChatSummary();
      }, [chatSessions, userId])

    return (
        <>
            <div className={`min-h-screen pt-16 ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Templates Section */}
                            <div
                                className={`rounded-lg p-4 shadow-lg border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <BookMarked className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`} />
                                    <h2 className="font-semibold">Templates</h2>
                                </div>
                                <div className="space-y-2">
                                    {promptTemplates.map((template) => (
                                        <button
                                            key={template.id}
                                            onClick={() => applyTemplate(template)}
                                            className={`w-full text-left text-sm p-2 rounded transition-colors ${isDarkTheme ? 'text-gray-400 hover:bg-zinc-800' : 'text-gray-600 hover:bg-gray-100'
                                                } ${selectedTemplate === template.id ? 'font-bold' : ''}`}
                                        >
                                            {template.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* AI History */}
                            <div
                                className={`rounded-lg p-4 shadow-lg border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                                    }`}
                            >
                                <h2 className="font-semibold mb-2">AI History</h2>
                                <div className="space-y-2">
                                    {Object.entries(chatSummary)
                                        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                                        .map(([date, prompts]) => (
                                            <div key={date}>
                                                <h3 className="text-sm font-medium">{date}</h3>
                                                <ul className="list-disc list-inside">
                                                    {prompts.map((prompt) => (
                                                        <li key={prompt.id} className="text-xs">
                                                            <a
                                                                href={`#session-${prompt.sessionId}`}
                                                                onClick={() => setSelectedSessionId(prompt.sessionId)}
                                                                className="hover:underline"
                                                            >
                                                                {prompt.time} - {prompt.content.substring(0, 50)}...
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div
                                className={`rounded-lg shadow-lg min-h-[600px] flex flex-col border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                                    }`}
                            >
                                {/* Input Form */}
                                <form onSubmit={handleSubmit} className={`border-b p-4 ${isDarkTheme ? 'border-zinc-800' : 'border-gray-200'}`}>

                                    {/* Template Variable Inputs */}
                                    <TemplateForm
                                        selectedTemplate={selectedTemplate}
                                        templateVariables={templateVariables}
                                        promptTemplates={promptTemplates}
                                        handleVariableChange={handleVariableChange}
                                    />

                                    <div className="flex gap-4">
                                        <textarea
                                            value={prompt}
                                            onChange={e => setPrompt(e.target.value)}
                                            placeholder="Type your message here..."
                                            className={`flex-1 resize-none rounded-lg p-3 border focus:outline-none focus:ring-2 focus:border-transparent ${isDarkTheme
                                                ? 'bg-zinc-800 border-zinc-700 text-white placeholder-gray-500 focus:ring-white'
                                                : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-gray-900'
                                                }`}
                                            rows={3}
                                        />
                                        <div className='flex flex-col'>
                                             {/* --- Model Selection Dropdown --- */}
                                            <Label htmlFor="model">Model</Label>
                                            <Select onValueChange={setSelectedModel} value={selectedModel}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Select a model" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableModels.map((model) => (
                                                        <SelectItem key={model} value={model}>
                                                            {model}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <button
                                                type="submit"
                                                disabled={isLoading || !prompt.trim() || !selectedModel}
                                                className={`self-end rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors ${isDarkTheme ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'
                                                    }`}
                                            >
                                                <Send className="w-4 h-4" />
                                                <span>Send</span>
                                            </button>
                                            {selectedTemplate && (
                                                <button
                                                    type="button"
                                                    onClick={clearTemplate}
                                                    className={`self-end mt-2 rounded-lg px-4 py-2 transition-colors ${isDarkTheme ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                >
                                                    Clear Template
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </form>

                                {/* Messages  */}
                                <div ref={mainContentRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                                    {chatSessions.slice(0, maxSessionsDisplayed).map((session) => (
                                        <div key={session.id} id={`session-${session.id}`} className="mb-6">
                                            {session.messages.map((message) => (
                                                <ChatMessage
                                                    key={message.id}
                                                    message={message}
                                                    onSave={saveToPromptLibrary}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div
                                                className={`rounded-lg p-4 border ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-200'
                                                    }`}
                                            >
                                                <Loader2 className={`w-5 h-5 animate-spin ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Chat;