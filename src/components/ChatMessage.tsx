// ChatMessage.tsx
import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Message } from '../types'; // Assuming you have a types.ts file

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({message}) => {
    const {isDarkTheme} = useTheme();

    return (
        <div
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
                        {message.role === 'user' ? 'You' : 'AI Assistant'} - {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
        </div>
    );
};

export default React.memo(ChatMessage);