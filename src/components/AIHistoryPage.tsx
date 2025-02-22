import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { BookMarked } from 'lucide-react';

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
    sessionTimestamp: Date;
}

const AIHistoryPage: React.FC = () => {
    const {isDarkTheme} = useTheme();
    const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
        try {
            const storedSessions = localStorage.getItem('chatHistory');
            console.log("1. Raw data from localStorage:", storedSessions);
            const initialSessions = storedSessions ? JSON.parse(storedSessions) : [];
            console.log("2. Parsed chatSessions:", initialSessions);
            return initialSessions;
        } catch (error) {
            console.error("Error loading chat history from localStorage:", error);
            return [];
        }
    });

    const [promptTemplates, setPromptTemplates] = React.useState([]);

    React.useEffect(() => {
        const loadData = async () => {
            try{
                const data = await import('../data/promptTemplates.json');
                setPromptTemplates(data.default);
            } catch (err) {
              console.error("Error loading promptTemplates", err)
            }
        }
        loadData();
    }, [])


    return (
        <div className={`min-h-screen pt-16 ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold mb-4">AI History</h1>
                </div>

                <div className="space-y-6">
                    {chatSessions.map(session => {
                        //Find the user Message
                        const userMessage = session.messages.find(msg => msg.role === 'user');
                        //Find the ai Message
                        const aiMessage = session.messages.find(msg => msg.role === 'assistant');

                        //If there is not a user message then return
                        if (!userMessage) {
                            console.warn(`Skipping session ${session.id} because it has no user message`);
                            return null; // Skip sessions without user messages
                        }
                        //Make the Session Date time
                        const sessionDate = new Date(session.sessionTimestamp).toLocaleDateString();
                        const sessionTime = new Date(session.sessionTimestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

                        const userDate = new Date(userMessage.timestamp).toLocaleDateString();
                        const userTime = new Date(userMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

                        const aiDate = new Date(aiMessage.timestamp).toLocaleDateString();
                        const aiTime = new Date(aiMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

                        try {
                          //Find the Template used.
                            const template = promptTemplates.find((t: any) => t.id === userMessage.promptTemplateId);

                            // Extract template variables (if available)
                            let templateVariablesDisplay = null;
                            if (template?.variables) {
                                templateVariablesDisplay = (
                                    <div>
                                        <h4 className="text-sm font-semibold mt-2">Template Variables:</h4>
                                        <ul className="list-disc list-inside pl-4">
                                            {template.variables.map((variable: any) => {
                                                // Extract the variable value from the userMessage.content
                                                const regex = new RegExp(`{{${variable.name}}}:\\s*([^\\n]*)`); //Match each line if multiline not working
                                                const match = userMessage.content.match(regex);
                                                const variableValue = match ? match[1].trim() : 'N/A';
                                                return (
                                                    <li key={variable.name} className="text-xs">
                                                        {variable.label}: {variableValue}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                );
                            }

                              return (
                                  <div key={session.id} className={`rounded-lg p-4 shadow-md border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                                      <h2 className="text-lg font-semibold mb-2">Session: {sessionDate} - {sessionTime}</h2>

                                      <div className="mb-4">
                                          <h3 className="text-md font-medium">User Prompt: {userDate} - {userTime}</h3>
                                          <p className="text-sm">{userMessage.content}</p>
                                          {template && (
                                              <>
                                                  <h4 className="text-sm font-semibold mt-2">Prompt Template:</h4>
                                                  <p className="text-xs">{template.name}</p>
                                                  {templateVariablesDisplay}
                                              </>
                                          )}
                                      </div>

                                      {aiMessage && (
                                          <div>
                                              <h3 className="text-md font-medium">AI Response: {aiDate} - {aiTime}</h3>
                                              <p className="text-sm">{aiMessage.content}</p>
                                          </div>
                                      )}
                                  </div>
                              );
                        } catch (error:any) {
                          console.warn(`Skipping session ${session.id} due to Template Retrieval Error`,error.message)
                          return null;
                        }

                    })}
                </div>
            </div>
        </div>
    );
};

export default AIHistoryPage;