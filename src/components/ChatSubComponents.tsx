// src/components/ChatSubComponents.tsx
import React, { useCallback } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PromptTemplate, Message } from '../types';
// Removed unused imports:
// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardFooter,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css'; // Keep this - it's for CSS
import { Copy, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
    message: Message;
    onSave: (message: Message) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message, onSave }) => {
    const { isDarkTheme } = useTheme();

    const handleCopyClick = () => {
        navigator.clipboard.writeText(message.content)
            .then(() => {
                toast.success("Message copied to clipboard!");
            })
            .catch((err) => {
                toast.error("Failed to copy message!");
                console.error("Failed to copy message:", err);
            });
    };

    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)\n```/;
    const match = message.content.match(codeBlockRegex);
    const isCode = match !== null;
    const codeLanguage = match ? (match[1] || 'plaintext') : '';
    const codeContent = match ? match[2] : '';
    const nonCodeContent = message.content
        .split(codeBlockRegex)
        .filter(part => typeof part === 'string' && !codeBlockRegex.test(part) && part.trim() !== '')
        .join('\n');


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

                <div className="prose prose-sm max-w-none">
                    {isCode ? (
                        <SyntaxHighlighter language={codeLanguage} style={darcula}>
                            {codeContent}
                        </SyntaxHighlighter>
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} children={nonCodeContent} />
                    )}
                </div>

                <div className="flex justify-end mt-2">
                    <button
                         onClick={handleCopyClick}
                         className="group p-1 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                         title="Copy to Clipboard"
                     >
                         <Copy size={16} className="group-hover:scale-110 transition-transform" />
                     </button>
                     <button
                         onClick={() => onSave(message)}
                         className="group p-1 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                         title="Save to Library"
                     >
                         <Save size={16}  className="group-hover:scale-110 transition-transform"/>
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