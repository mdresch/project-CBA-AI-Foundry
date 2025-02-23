// src/components/Chat.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Loader2, MessageSquare, Sparkles, BookMarked } from 'lucide-react';
import { generateAIResponse } from '../lib/googleAI';
import { useTheme } from '../context/ThemeContext';
import promptTemplates from '../data/promptTemplates.json';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext'; // Or the correct path to your AuthContext file
// Import types (Assuming you have a types.ts file)
import { Message, ChatSession } from '../types'; // Update this path

// ---------------------- Sub-Components -----------------------

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message }) => { // Apply React.memo
  const { isDarkTheme } = useTheme();

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
            <MessageSquare className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {message.role === 'user' ? 'You' : 'AI Assistant'} -{' '}
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
});

interface TemplateFormProps {
  selectedTemplate: string;
  promptTemplates: any[]; // Replace 'any' with the correct type if possible
  templateVariables: { [key: string]: string };
  handleVariableChange: (variableName: string, value: string) => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  selectedTemplate,
  promptTemplates,
  templateVariables,
  handleVariableChange,
}) => {
  const { isDarkTheme } = useTheme();

  const template = promptTemplates.find((t: any) => t.id === selectedTemplate);

  return (
    <>
      {selectedTemplate &&
        template?.variables?.map((variable) => (
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
                onChange={(e) => handleVariableChange(variable.name, e.target.value)}
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
                onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900'
                }`}
              />
            )}
            {variable.type === 'select' && (
              <select
                id={variable.name}
                value={templateVariables[variable.name] || ''}
                onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900'
                }`}
              >
                <option value="">Select an option</option>
                {variable.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            {variable.type === 'textarea' && (
              <textarea
                id={variable.name}
                value={templateVariables[variable.name] || ''}
                onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  isDarkTheme ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-gray-900'
                }`}
                rows={4}
              />
            )}
          </div>
        ))}
    </>
  );
};

// ---------------------- Main Component -----------------------

function Chat() {
  const { isDarkTheme } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateVariables, setTemplateVariables] = useState<{ [key: string]: string }>({});
  const [chatSummary, setChatSummary] = useState<{
    [date: string]: { id: string; content: string; time: string; sessionId: string }[];
  }>({});

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [maxSessionsDisplayed, setMaxSessionsDisplayed] = useState(5);

  const { session, user, isLoading: isAuthLoading , error: authError} = useAuth(); //Use your context

    useEffect(() => {
        if (user) {
            console.log("User ID:", user.id); //Log user ID for debugging purposes
        }
    }, [user]);

  const userId = user?.id;

  if (isAuthLoading) {
      return <div>Loading authentication...</div>;
  }


  if (!userId) {
     // Handle the case where the user is not logged in
     return <div>Please log in to use the chat.</div>; //Or redirect
  }

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prompt.trim()) return;

      const newSessionId = Date.now().toString();

      // Get the prompt template
      const template = promptTemplates.find((t: any) => t.id === selectedTemplate);
      let newUserMessageContent = prompt;

      // Append template variable values to the prompt
      if (template?.variables && templateVariables) {
        template.variables.forEach((variable: any) => {
          newUserMessageContent += `\n{{${variable.name}}}: ${templateVariables[variable.name] || ''}`;
        });
      }

      const newUserMessage: Message = {
        id: newSessionId + '-user',
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
          id: newSessionId + '-ai',
          content: aiResponse,
          role: 'assistant',
          timestamp: new Date(),
          promptTemplateId: selectedTemplate || undefined,
        };

        // **Supabase Insertion**
          const sessionTitle = prompt.substring(0, 50);  // Generate title from prompt
        const { error: sessionError } = await supabase
          .from('chat_sessions')
          .insert([{
            id: newSessionId,
            user_id: userId,
            title: sessionTitle // Or title from input field
          }]);

        if (sessionError) {
          console.error('Error inserting chat session:', sessionError);
          setError(`Failed to save chat session: ${sessionError.message}`); //Display detailed error
          return;
        }

        // Insert messages
        const { error: messagesError } = await supabase
          .from('messages')
          .insert([
            { id: newUserMessage.id, session_id: newSessionId, content: newUserMessage.content, role: newUserMessage.role, timestamp: newUserMessage.timestamp.toISOString(), promptTemplateId: newUserMessage.promptTemplateId },
            { id: newAssistantMessage.id, session_id: newSessionId, content: newAssistantMessage.content, role: newAssistantMessage.role, timestamp: newAssistantMessage.timestamp.toISOString(), promptTemplateId: newAssistantMessage.promptTemplateId  }
          ]);

        if (messagesError) {
          console.error('Error inserting messages:', messagesError);
          setError(`Failed to save messages: ${messagesError.message}`); //Display detailed error

           // Rollback:  Consider deleting the chat_session if messages fail
           await supabase.from('chat_sessions').delete().eq('id', newSessionId);
          return;
        }

        setPrompt('');
        setTemplateVariables({});// **End Supabase Insertion**

      } catch (err: any) {
        console.error("Unexpected error during handleSubmit:", err);
        setError(`Failed to generate response. Please try again. ${err.message}`); //Detailed Error.
      } finally {
        setIsLoading(false);
        setPrompt('');
        setTemplateVariables({});
        setTimeout(() => {
          if (mainContentRef.current) {
            mainContentRef.current.scrollTop = 0;
          }
        }, 100);
      }
    };

    const applyTemplate = (templateObj: { id: string; name: string; template: string; variables?: any[] }) => {
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

      // Update prompt dynamically.  Consider using useCallback here.
      setPrompt((prevPrompt) => {
        const template = promptTemplates.find((t) => t.id === selectedTemplate)?.template || '';
        let newPrompt = template;
        const allVariables = promptTemplates.find((t) => t.id === selectedTemplate)?.variables;

        if (allVariables) {
          allVariables.forEach((variable) => {
            const varName = variable.name;
            const varValue = templateVariables[varName] || (variableName === varName ? value : ''); // Ensure current variable is updated
            newPrompt = newPrompt.replace(`{{${varName}}}`, varValue);
          });
        }

        return newPrompt;
      });
    }, [selectedTemplate, templateVariables, promptTemplates]);

    // Clear selected Template.
      const clearTemplate = () => {
        setSelectedTemplate('');
        setPrompt('');
        setTemplateVariables({});
      };

    useEffect(() => {
      try {
        localStorage.setItem('chatHistory', JSON.stringify(chatSessions));
      } catch (error) {
        console.error('Error saving chat history to localStorage:', error);
      }
    }, [chatSessions]);

    useEffect(() => {
      const calculateChatSummary = () => {
        const summary: {
          [date: string]: { id: string; content: string; time: string; sessionId: string }[];
        } = {};

        chatSessions.forEach((session) => {
          const userMessage = session.messages.find((msg) => msg.role === 'user');
          if (userMessage) {
            const date = new Date(userMessage.timestamp).toLocaleDateString();
            const time = new Date(userMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

    useEffect(() => {
        const fetchChatSessions = async () => {
            if (!userId) {
                console.log("User ID not available yet."); //Debugging
                return; // Don't fetch if user is not logged in
            }

            try {
                const { data, error } = await supabase
                    .from('chat_sessions')
                    .select(`
                      *,
                      messages (*)
                    `)
                    .eq('user_id', userId) // Filter by user_id
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('Error fetching chat sessions:', error);
                    setError(`Failed to load chat history: ${error.message}`);
                    return;
                }

                console.log("Fetched Data:", data); //Debugging: Log the fetched data

                if (data) {
                    setChatSessions(data as ChatSession[]);
                }
            } catch (err) {
                console.error('Unexpected error fetching chat sessions:', err);
                setError(`Unexpected error loading chat history: ${err}`);
            }
        };

        fetchChatSessions();
    }, [userId]);

    return (
      <div className={`min-h-screen pt-16 ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Templates Section */}
              <div
                className={`rounded-lg p-4 shadow-lg border ${
                  isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
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
                      className={`w-full text-left text-sm p-2 rounded transition-colors ${
                        isDarkTheme ? 'text-gray-400 hover:bg-zinc-800' : 'text-gray-600 hover:bg-gray-100'
                      } ${selectedTemplate === template.id ? 'font-bold' : ''}`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI History */}
              <div
                className={`rounded-lg p-4 shadow-lg border ${
                  isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
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
                className={`rounded-lg shadow-lg min-h-[600px] flex flex-col border ${
                  isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
                }`}
              >
                {/* Input Form */}
                <form onSubmit={handleSubmit} className={`border-b p-4 ${isDarkTheme ? 'border-zinc-800' : 'border-gray-200'}`}>

                  {/* Template Variable Inputs */}
                  <TemplateForm
                    selectedTemplate={selectedTemplate}
                    promptTemplates={promptTemplates}
                    templateVariables={templateVariables}
                    handleVariableChange={handleVariableChange}
                  />

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
                      <div className='flex flex-col'>
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
                        {selectedTemplate && (
                          <button
                            type="button"
                            onClick={clearTemplate}
                            className={`self-end mt-2 rounded-lg px-4 py-2 transition-colors ${
                              isDarkTheme ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            Clear Template
                          </button>
                        )}
                      </div>
                  </div>
                </form>

                {/* Messages */}
                <div ref={mainContentRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                  {chatSessions.slice(0, maxSessionsDisplayed).map((session) => (
                    <div key={session.id} id={`session-${session.id}`} className="mb-6">
                      {session.messages.map((message) => (
                        <ChatMessage key={message.id} message={message} /> // Use the memoized ChatMessage
                      ))}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div
                        className={`rounded-lg p-4 border ${
                          isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-100 border-gray-200'
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
    );
  }

  export default Chat;