
// src/components/ai/MessageList.tsx
import React from 'react';
import { Message } from '../../types';
import { ChatMessage } from './Message';

interface MessageListProps {
    messages: Message[];
    onSaveMessage: (message: Message) => void;
    onRetryMessage?: (messageId: string) => void;
    isRetrying?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onSaveMessage, onRetryMessage, isRetrying }) => {
    const handleRetry = (messageId: string) => {
        onRetryMessage?.(messageId);
    };

    return (
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((m) => (
                <ChatMessage 
                    key={m.id} 
                    message={m} 
                    onSave={onSaveMessage}
                    onRetry={m.role === 'assistant' ? () => handleRetry(m.id) : undefined}
                    isRetrying={isRetrying}
                />
            ))}
        </div>
    );
};
