// src/components/ChatSubComponents.tsx
import React, { useCallback } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PromptTemplate, Message } from '../types'; // Import types
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter, // Import CardFooter
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Import Shadcn Button
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Copy, Save } from 'lucide-react'; // Import the Copy icon


// import promptTemplatesData from '../data/promptTemplates.json';  // Rename import
// const promptTemplates: PromptTemplate[] = promptTemplatesData as PromptTemplate[];

// ---------------------- Sub-Components -----------------------

interface ChatMessageProps {
    message: Message;
    onSave: (message: Message) => void; // Add onSave prop
}

const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message }) => {
    const { isDarkTheme } = useTheme();

    const handleCopyClick = () => {
        navigator.clipboard.writeText(message.content)
            .then(() => {
                // Optionally show a success message/toast
                console.log("Message copied to clipboard!");
            })
            .catch((err) => {
                // Handle errors (e.g., user denies clipboard access)
                console.error("Failed to copy message:", err);
            });
    };

    return (
        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
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
                        {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handleCopyClick}
                        className="p-1 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Copy to Clipboard"
                    >
                        <Copy size={16} />
                    </button>
                    {/* Save to Library Button */}
                    <button
                        onClick={() => onSave(message)} // Call onSave
                        className="p-1 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Save to Library"
                    >
                        <Save size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
});

interface TemplateFormProps {
    selectedTemplate: string;
    templateVariables: { [key: string]: string };
    promptTemplates: PromptTemplate[];
    handleVariableChange: (variableName: string, value: string) => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
    selectedTemplate,
    templateVariables,
    promptTemplates,
    handleVariableChange,
}) => {
    const { isDarkTheme } = useTheme();

    const template = promptTemplates.find((t) => t.id === selectedTemplate);

    return (
        <>
            {selectedTemplate &&
                template?.variables?.map((variable) => (
                    <div key={variable.name} className="mb-2">
                        <label
                            htmlFor={variable.name}
                            className={`block text-sm font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                                }`}
                        >
                            {variable.label}:
                        </label>
                        {variable.type === 'text' && (
                            <input
                                type="text"
                                id={variable.name}
                                value={templateVariables[variable.name] || ''}
                                onChange={(e) =>
                                    handleVariableChange(variable.name, e.target.value)
                                }
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDarkTheme
                                    ? 'bg-zinc-800 text-white border-zinc-700'
                                    : 'bg-white text-gray-900'
                                    }`}
                            />
                        )}
                        {variable.type === 'number' && (
                            <input
                                type="number"
                                id={variable.name}
                                value={templateVariables[variable.name] || ''}
                                onChange={(e) =>
                                    handleVariableChange(variable.name, e.target.value)
                                }
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDarkTheme
                                    ? 'bg-zinc-800 text-white border-zinc-700'
                                    : 'bg-white text-gray-900'
                                    }`}
                            />
                        )}
                        {variable.type === 'select' && (
                            <select
                                id={variable.name}
                                value={templateVariables[variable.name] || ''}
                                onChange={(e) =>
                                    handleVariableChange(variable.name, e.target.value)
                                }
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDarkTheme
                                    ? 'bg-zinc-800 text-white border-zinc-700'
                                    : 'bg-white text-gray-900'
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
                                onChange={(e) =>
                                    handleVariableChange(variable.name, e.target.value)
                                }
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${isDarkTheme
                                    ? 'bg-zinc-800 text-white border-zinc-700'
                                    : 'bg-white text-gray-900'
                                    }`}
                                rows={4}
                            />
                        )}
                    </div>
                ))}
        </>
    );
};

export { ChatMessage, TemplateForm };