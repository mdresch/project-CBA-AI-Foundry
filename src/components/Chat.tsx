import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageSquare, Sparkles, BookMarked, AlertCircle } from 'lucide-react';
import { generateAIResponse } from '../lib/googleAI';
import { useTheme } from '../context/ThemeContext';
import promptTemplates from '../data/promptTemplates.json';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    promptTemplateId?: string; // Optional ID of the template used
}

interface ChatSession {
    id: string;
    messages: Message[]; // Array of messages within this session
    sessionTimestamp: Date;  // Add the sessionTimestamp
}

function Chat() {
    const {isDarkTheme} = useTheme();
    const [prompt, setPrompt] = useState('');
    const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
        try {
            const storedSessions = localStorage.getItem('chatHistory');
            return storedSessions ? JSON.parse(storedSessions) : [];
        } catch (error) {
            console.error("Error loading chat history from localStorage:", error);
            return [];
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [templateVariables, setTemplateVariables] = useState<{ [key: string]: string }>({}); // Track template variable values.
    const [chatSummary, setChatSummary] = useState<{ [date: string]: { id: string, content: string, time: string, sessionId: string }[] }>({});

    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null); // Track selected session for linking
    const mainContentRef = useRef<HTMLDivElement>(null); // Reference to the main content area
    const [maxSessionsDisplayed, setMaxSessionsDisplayed] = useState(5);  // Max number of sessions to show on main screen.

    const promptCategories = [
        'concept',
        'code',
        'text',
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;
    
        const newSessionId = Date.now().toString();  // Unique ID for this prompt/response session
    
        // Get the prompt template
        const template = promptTemplates.find((t: any) => t.id === selectedTemplate);
        let newUserMessageContent = prompt
    
        // Append template variable values to the prompt
        if (template?.variables && templateVariables) {
          template.variables.forEach((variable: any) => {
            newUserMessageContent += `\n{{${variable.name}}}: ${templateVariables[variable.name] || ''}`;
          });
        }
    
        const newUserMessage: Message = {
            id: newSessionId + '-user',  // Unique ID
            content: newUserMessageContent,
            role: 'user',
            timestamp: new Date(),
            promptTemplateId: selectedTemplate || undefined,
        };
    
        setIsLoading(true);
        setError(null);
    
        try {
            const aiResponse = await generateAIResponse(prompt);
            const newAssistantMessage: Message = {
                id: newSessionId + '-ai',  // Unique ID
                content: aiResponse,
                role: 'assistant',
                timestamp: new Date(),
                promptTemplateId: selectedTemplate || undefined,
            };
    
            const newSession: ChatSession = {
                id: newSessionId,
                messages: [newUserMessage, newAssistantMessage],
                sessionTimestamp: newUserMessage.timestamp, // Add this line to set sessionTimestamp
            };
    
            setChatSessions(prev => [newSession, ...prev]); // Add to the beginning of array.
            setSelectedSessionId(newSessionId); //Automatically shows the latest messages
        } catch (err: any) {
            setError('Failed to generate response. Please try again.');
        } finally {
            setIsLoading(false);
            setPrompt('');
            setTemplateVariables({}); // Clear variables after submission
            setTimeout(() => {
                if (mainContentRef.current) {
                    mainContentRef.current.scrollTop = 0; // Scroll to the top after submission
                }
            }, 100); //Add delay to get new state.
        }
    };

    const applyTemplate = (templateObj: { id: string, name: string, template: string, variables?: any[] }) => {
        // Update type of variables
        const {template, variables} = templateObj;

        if (variables && variables.length > 0) {
            // Initialize template variables in state
            const initialVariables: { [key: string]: string } = {};
            variables.forEach(variable => {
                initialVariables[variable.name] = '';  // Use variable.name
            });
            setTemplateVariables(initialVariables);
            setPrompt(template); // Set the template in the prompt for editing.
        } else {
            setPrompt(template);
            setTemplateVariables({});
        }
        setSelectedTemplate(templateObj.id);
    };

    const handleVariableChange = (variableName: string, value: string) => {
        setTemplateVariables(prev => ({...prev, [variableName]: value}));
        // Update prompt dynamically.
        setPrompt(prevPrompt => {
            const template = promptTemplates.find(t => t.id === selectedTemplate)?.template || '';
            let newPrompt = template;
            const allVariables = promptTemplates.find(t => t.id === selectedTemplate)?.variables;

            if (allVariables) {
                allVariables.forEach(variable => {
                    const varName = variable.name;
                    const varValue = templateVariables[varName] || (variableName === varName ? value : ''); // Ensure current variable is updated
                    newPrompt = newPrompt.replace(`{{${varName}}}`, varValue);
                });
            }

            return newPrompt;
        });
    };

    useEffect(() => {
        try {
            localStorage.setItem('chatHistory', JSON.stringify(chatSessions));
        } catch (error) {
            console.error("Error saving chat history to localStorage:", error);
        }
    }, [chatSessions]); // Save when chatSessions change

    useEffect(() => {
        const calculateChatSummary = () => {
            const summary: { [date: string]: { id: string, content: string, time: string, sessionId: string }[] } = {};

            chatSessions.forEach(session => {
                const userMessage = session.messages.find(msg => msg.role === 'user');
                if (userMessage) {
                    const date = new Date(userMessage.timestamp).toLocaleDateString();
                    const time = new Date(userMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

                    if (!summary[date]) {
                        summary[date] = [];
                    }
                    summary[date].push({
                        id: userMessage.id,
                        content: userMessage.content,
                        time: time,
                        sessionId: session.id,
                    });
                }
            });
            setChatSummary(summary);
        };
        calculateChatSummary();
    }, [chatSessions]);

    return (
        <div className={`min-h-screen pt-16 ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Templates Section */}
                        <div
                            className={`rounded-lg p-4 shadow-lg border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <BookMarked className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}/>
                                <h2 className="font-semibold">Templates</h2>
                            </div>
                            <div className="space-y-2">
                                {promptTemplates.map(template => (
                                    <button
                                        key={template.id}
                                        onClick={() => applyTemplate(template)}
                                        className={`w-full text-left text-sm p-2 rounded transition-colors ${
                                            isDarkTheme ? 'text-gray-400 hover:bg-zinc-800' : 'text-gray-600 hover:bg-gray-100'
                                        } ${selectedTemplate === template.id ? 'font-bold' : ''}`} // Highlight selected template
                                    >
                                        {template.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AI History */}
                        <div className={`rounded-lg p-4 shadow-lg border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                            <h2 className="font-semibold mb-2">AI History</h2>
                            <div className="space-y-2">
                                {Object.entries(chatSummary)
                                    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Sort dates in descending order
                                    .map(([date, prompts]) => (
                                        <div key={date}>
                                            <h3 className="text-sm font-medium">{date}</h3>
                                            <ul className="list-disc list-inside">
                                                {prompts.map(prompt => (
                                                    <li key={prompt.id} className="text-xs">
                                                        <a
                                                            href={`#session-${prompt.sessionId}`} //Link based on session ID
                                                            onClick={() => setSelectedSessionId(prompt.sessionId)} // Select the correct session
                                                            className="hover:underline" // Add underline on hover to indicate it's a link
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
                            className={`rounded-lg shadow-lg min-h-[600px] flex flex-col border ${
                                isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                            }`}
                        >
                            {/* Input Form */}
                            <form onSubmit={handleSubmit} className={`border-b p-4 ${isDarkTheme ? 'border-zinc-800' : 'border-gray-200'}`}>
                                {/* Template Variable Inputs */}
                                {selectedTemplate &&
                                    promptTemplates
                                        .find(t => t.id === selectedTemplate)
                                        ?.variables?.map(variable => (
                                            <div key={variable.name} className="mb-2">
                                                <label
                                                    htmlFor={variable.name}
                                                    className={`block text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}
                                                >
                                                    {variable.label}:
                                                </label>
                                                {variable.type === 'text' && (
                                                    <input
                                                        type="text"
                                                        id={variable.name}
                                                        value={templateVariables[variable.name] || ''}
                                                        onChange={e => handleVariableChange(variable.name, e.target.value)}
                                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                                            isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900'
                                                        }`}
                                                    />
                                                )}
                                                {variable.type === 'number' && (
                                                    <input
                                                        type="number"
                                                        id={variable.name}
                                                        value={templateVariables[variable.name] || ''}
                                                        onChange={e => handleVariableChange(variable.name, e.target.value)}
                                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                                            isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900'
                                                        }`}
                                                    />
                                                )}
                                                {variable.type === 'select' && (
                                                    <select
                                                        id={variable.name}
                                                        value={templateVariables[variable.name] || ''}
                                                        onChange={e => handleVariableChange(variable.name, e.target.value)}
                                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                                            isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900'
                                                        }`}
                                                    >
                                                        <option value="">Select an option</option>
                                                        {variable.options?.map(option => (
                                                            <option key={option} value={option}>
                                                                {option}
                                                            </option> // Use optional chaining
                                                        ))}
                                                    </select>
                                                )}
                                                {variable.type === 'textarea' && (
                                                    <textarea
                                                        id={variable.name}
                                                        value={templateVariables[variable.name] || ''}
                                                        onChange={e => handleVariableChange(variable.name, e.target.value)}
                                                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                                                            isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900'
                                                        }`}
                                                        rows={4} // Adjust the number of rows as needed
                                                    />
                                                )}
                                            </div>
                                        ))}

                                <div className="flex gap-4">
                                    <textarea
                                        value={prompt}
                                        onChange={e => setPrompt(e.target.value)}
                                        placeholder="Type your message here..."
                                        className={`flex-1 resize-none rounded-lg p-3 border focus:outline-none focus:ring-2 focus:border-transparent ${
                                            isDarkTheme
                                                ? 'bg-zinc-800 border-zinc-700 text-white placeholder-gray-500 focus:ring-white'
                                                : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-gray-900'
                                        }`}
                                        rows={3}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading || !prompt.trim()}
                                        className={`self-end rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors ${
                                            isDarkTheme ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        <Send className="w-4 h-4"/>
                                        <span>Send</span>
                                    </button>
                                </div>
                            </form>

                            {/* Messages */}
                            <div ref={mainContentRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                                {chatSessions.slice(0, maxSessionsDisplayed).map(session => (
                                    <div key={session.id} id={`session-${session.id}`} className="mb-6">
                                        {session.messages.map(message => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-lg p-4 ${
                                                        message.role === 'user'
                                                            ? isDarkTheme
                                                                ? 'bg-white text-black'
                                                                : 'bg-gray-900 text-white'
                                                            : isDarkTheme
                                                                ? 'bg-zinc-800 text-white border border-zinc-700'
                                                                : 'bg-gray-100 text-gray-900 border border-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {message.role === 'user' ? (
                                                            <MessageSquare className="w-4 h-4"/>
                                                        ) : (
                                                            <Sparkles className="w-4 h-4"/>
                                                        )}
                                                        <span className="text-sm font-medium">
                                                                {message.role === 'user' ? 'You' : 'AI Assistant'} - {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                    </div>
                                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div
                                            className={`rounded-lg p-4 border ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-200'}`}
                                        >
                                            <Loader2
                                                className={`w-5 h-5 animate-spin ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chat;