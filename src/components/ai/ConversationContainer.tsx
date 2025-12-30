import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../../types/ai';
import { MessageList } from './MessageList';
import { AutoScrollChatContainer, useAutoScroll } from './AutoScrollChatContainer';
import { useTheme } from '../../context/useTheme';
import './ConversationAnimations.css';

interface ConversationContainerProps {
  messages: Message[];
  isLoading: boolean;
  onRetry?: (messageId: string) => void;
  onSave?: (message: Message) => void;
  className?: string;
  showScrollButton?: boolean;
  enableAutoScroll?: boolean;
}

export const ConversationContainer: React.FC<ConversationContainerProps> = ({
  messages,
  isLoading,
  onRetry,
  onSave,
  className = '',
  showScrollButton = true,
  enableAutoScroll = true
}) => {
  const { isDarkTheme } = useTheme();
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const { containerRef, isAtBottom, scrollToBottom, handleScroll } = useAutoScroll(isStreaming);

  // Detect streaming state
  useEffect(() => {
    const hasNewMessages = messages.length > lastMessageCount;
    const lastMessage = messages[messages.length - 1];
    const isLastMessageStreaming = lastMessage?.status === 'pending' || lastMessage?.status === 'sent';
    
    setIsStreaming(hasNewMessages && isLastMessageStreaming);
    setLastMessageCount(messages.length);
  }, [messages, lastMessageCount]);

  // Auto-scroll to bottom when new messages arrive during streaming
  useEffect(() => {
    if (enableAutoScroll && isStreaming && isAtBottom) {
      const timeoutId = setTimeout(() => {
        scrollToBottom(true);
      }, 100); // Small delay to ensure DOM is updated
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages, isStreaming, isAtBottom, enableAutoScroll, scrollToBottom]);

  // Scroll to bottom when conversation starts
  useEffect(() => {
    if (messages.length === 1) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [messages.length, scrollToBottom]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <AutoScrollChatContainer
        isStreaming={isStreaming}
        showScrollButton={showScrollButton}
        className="flex-1"
      >
        <div className="min-h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="text-center">
                <div className={`
                  w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
                  ${isDarkTheme ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-400'}
                `}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className={`
                  text-lg font-medium mb-2
                  ${isDarkTheme ? 'text-zinc-200' : 'text-gray-900'}
                `}>
                  Start a conversation
                </h3>
                <p className={`
                  text-sm
                  ${isDarkTheme ? 'text-zinc-400' : 'text-gray-500'}
                `}>
                  Ask me anything or choose a prompt template to get started
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <MessageList
                messages={messages}
                onRetry={onRetry}
                onSave={onSave}
              />
              
              {/* Loading indicator for streaming */}
              {isStreaming && (
                <div className="flex items-center gap-2 p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className={`
                    text-sm
                    ${isDarkTheme ? 'text-zinc-400' : 'text-gray-500'}
                  `}>
                    AI is thinking...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </AutoScrollChatContainer>
    </div>
  );
};

// Enhanced conversation container with advanced features
export const AdvancedConversationContainer: React.FC<ConversationContainerProps & {
  enableTypingIndicator?: boolean;
  enableMessageAnimations?: boolean;
  scrollBehavior?: 'smooth' | 'auto';
}> = ({
  messages,
  isLoading,
  onRetry,
  onSave,
  className = '',
  showScrollButton = true,
  enableAutoScroll = true,
  enableTypingIndicator = true,
  enableMessageAnimations = true,
  scrollBehavior = 'smooth'
}) => {
  const { isDarkTheme } = useTheme();
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Detect streaming and new messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    const isNewMessage = lastMessage.id !== lastMessageId;
    const isStreamingMessage = lastMessage.status === 'pending' || lastMessage.status === 'sent';
    
    setIsStreaming(isNewMessage && isStreamingMessage);
    setLastMessageId(lastMessage.id);
  }, [messages, lastMessageId]);

  // Animate new messages
  useEffect(() => {
    if (enableMessageAnimations) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && messageRefs.current.has(lastMessage.id)) {
        const element = messageRefs.current.get(lastMessage.id);
        if (element) {
          element.scrollIntoView({ behavior: scrollBehavior, block: 'end' });
        }
      }
    }
  }, [messages, enableMessageAnimations, scrollBehavior]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <AutoScrollChatContainer
        isStreaming={isStreaming}
        showScrollButton={showScrollButton}
        className="flex-1"
        smoothScroll={scrollBehavior === 'smooth'}
      >
        <div className="min-h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="text-center animate-fade-in">
                <div className={`
                  w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center
                  ${isDarkTheme ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-400'}
                  animate-pulse
                `}>
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className={`
                  text-xl font-semibold mb-3
                  ${isDarkTheme ? 'text-zinc-200' : 'text-gray-900'}
                `}>
                  Welcome to AI Chat
                </h3>
                <p className={`
                  text-base max-w-md mx-auto
                  ${isDarkTheme ? 'text-zinc-400' : 'text-gray-500'}
                `}>
                  Start a conversation with our AI assistant. Ask questions, get help, or explore creative ideas.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <MessageList
                messages={messages}
                onRetry={onRetry}
                onSave={onSave}
              />
              
              {/* Enhanced typing indicator */}
              {enableTypingIndicator && isStreaming && (
                <div className="flex items-center gap-3 p-4 animate-fade-in">
                  <div className={`
                    flex space-x-1 p-2 rounded-full
                    ${isDarkTheme ? 'bg-zinc-800' : 'bg-gray-100'}
                  `}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className={`
                    text-sm font-medium
                    ${isDarkTheme ? 'text-zinc-300' : 'text-gray-600'}
                  `}>
                    AI is typing...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </AutoScrollChatContainer>
    </div>
  );
};
