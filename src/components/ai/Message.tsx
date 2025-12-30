// src/components/ai/Message.tsx
import React, { useState } from 'react';
import { MessageSquare, Sparkles, File, Image, Download } from 'lucide-react';
import { useTheme } from '../../context/useTheme';
import { Message } from '../../types';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Actions } from './Actions';
import { ChainOfThought } from './ChainOfThought';
import { ThoughtStep } from '../../types/chainOfThought';
import { ErrorBoundary } from '../ErrorBoundary';

interface ChatMessageProps {
    message: Message;
    onSave: (message: Message) => void;
    onRetry?: () => void;
    isRetrying?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({ message, onSave, onRetry, isRetrying }) => {
    const { isDarkTheme } = useTheme();
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);

    const handleLike = (messageId: string) => {
        setIsLiked(true);
        setIsDisliked(false);
        // In a real app, this would save to the database
        console.log('Liked message:', messageId);
    };

    const handleDislike = (messageId: string) => {
        setIsDisliked(true);
        setIsLiked(false);
        // In a real app, this would save to the database
        console.log('Disliked message:', messageId);
    };

    const handleCopy = (content: string) => {
        // Additional copy handling if needed
        console.log('Copied content:', content);
    };

    const handleShare = (content: string) => {
        // Additional share handling if needed
        console.log('Shared content:', content);
    };

    const handleSaveToLibrary = (content: string, messageId: string) => {
        // Additional save handling if needed
        console.log('Saved to library:', messageId);
    };

    const safeContent = (message.content ?? '').toString();
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)\n```/;
    const match = safeContent.match(codeBlockRegex);
    const isCode = match !== null;
    const codeLanguage = match ? (match[1] || 'plaintext') : '';
    const codeContent = match ? match[2] : '';
    const nonCodeContent = safeContent
        .split(codeBlockRegex)
        .filter(part => !codeBlockRegex.test(part) && (part ?? '').toString().trim() !== '')
        .join('\n');

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return Image;
        return File;
    };

    const handleFileDownload = (attachment: import('../../types').FileAttachment) => {
        if (attachment.content) {
            try {
                const content = atob(attachment.content);
                const blob = new Blob([content], { type: attachment.type });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = attachment.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading file:', error);
                toast.error('Failed to download file');
            }
        }
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

                {/* File Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-3">
                        <div className={`text-xs font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                            Attachments ({message.attachments.length})
                        </div>
                        <div className="space-y-2">
                            {message.attachments.map((attachment) => {
                                const IconComponent = getFileIcon(attachment.type);
                                return (
                                    <div
                                        key={attachment.id}
                                        className={`
                                            flex items-center gap-3 p-2 rounded-lg border
                                            ${isDarkTheme ? 'bg-zinc-700 border-zinc-600' : 'bg-gray-50 border-gray-200'}
                                        `}
                                    >
                                        <IconComponent className={`w-4 h-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
                                        
                                        {attachment.preview && (
                                            <img
                                                src={attachment.preview}
                                                alt={attachment.name}
                                                className="w-8 h-8 object-cover rounded"
                                            />
                                        )}
                                        
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm truncate ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {attachment.name}
                                            </p>
                                            <p className={`text-xs ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {formatFileSize(attachment.size)}
                                            </p>
                                        </div>
                                        
                                        {attachment.content && (
                                            <button
                                                onClick={() => handleFileDownload(attachment)}
                                                className={`
                                                    p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500
                                                    ${isDarkTheme ? 'hover:bg-zinc-600' : 'hover:bg-gray-200'}
                                                `}
                                                title="Download file"
                                            >
                                                <Download className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- Markdown and Code Content --- */}
                <div className="prose prose-sm max-w-none">
                    {isCode ? (
                        <SyntaxHighlighter language={codeLanguage} style={darcula}>
                            {codeContent}
                        </SyntaxHighlighter>
                    ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{nonCodeContent}</ReactMarkdown>
                    )}
                </div>

                {/* Chain of Thought */}
                {message.role === 'assistant' && message.chainOfThought && Array.isArray(message.chainOfThought) && message.chainOfThought.length > 0 && (
                    <div className="mt-4">
                        <ErrorBoundary
                            fallback={
                                <div className="p-3 border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 rounded-lg">
                                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                        Chain of Thought temporarily unavailable
                                    </p>
                                </div>
                            }
                        >
                            <ChainOfThought
                                steps={message.chainOfThought}
                                isExpanded={false}
                                isDarkTheme={isDarkTheme}
                                sessionId={message.session_id || 'unknown'}
                                messageId={message.id}
                                onStepClick={(stepId) => console.log('Step clicked:', stepId)}
                                onSearchResultClick={(result) => {
                                    window.open(result.url, '_blank');
                                }}
                                onImageClick={(image) => {
                                    // Open image in a modal or new tab
                                    window.open(image.url, '_blank');
                                }}
                            />
                        </ErrorBoundary>
                    </div>
                )}
                

                {/* Actions Component */}
                <div className="mt-3">
                    <Actions
                        messageId={message.id}
                        content={safeContent}
                        onRetry={onRetry}
                        onLike={handleLike}
                        onDislike={handleDislike}
                        onCopy={handleCopy}
                        onShare={handleShare}
                        onSaveToLibrary={handleSaveToLibrary}
                        isRetrying={isRetrying}
                        isLiked={isLiked}
                        isDisliked={isDisliked}
                        isDarkTheme={isDarkTheme}
                    />
                </div>
            </div>
        </div>
    );
});
