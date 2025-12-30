import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../context/useTheme';

interface AutoScrollChatContainerProps {
  children: React.ReactNode;
  isStreaming?: boolean;
  className?: string;
  showScrollButton?: boolean;
  scrollThreshold?: number;
  smoothScroll?: boolean;
}

export const AutoScrollChatContainer: React.FC<AutoScrollChatContainerProps> = ({
  children,
  isStreaming = false,
  className = '',
  showScrollButton = true,
  scrollThreshold = 100,
  smoothScroll = true
}) => {
  const { isDarkTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButtonState, setShowScrollButtonState] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is at the bottom of the container
  const checkIfAtBottom = useCallback(() => {
    if (!containerRef.current) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= scrollThreshold;
  }, [scrollThreshold]);

  // Scroll to bottom with smooth animation
  const scrollToBottom = useCallback((force = false) => {
    if (!containerRef.current) return;
    
    const shouldScroll = force || (isAtBottom && !isUserScrolling);
    
    if (shouldScroll) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smoothScroll ? 'smooth' : 'auto'
      });
    }
  }, [isAtBottom, isUserScrolling, smoothScroll]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);
    setShowScrollButtonState(!atBottom);
    
    // Detect if user is manually scrolling
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    setIsUserScrolling(true);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 150);
  }, [checkIfAtBottom]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming && isAtBottom && !isUserScrolling) {
      scrollToBottom();
    }
  }, [isStreaming, isAtBottom, isUserScrolling, scrollToBottom]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (isAtBottom && !isUserScrolling) {
      scrollToBottom();
    }
  }, [children, isAtBottom, isUserScrolling, scrollToBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Manual scroll to bottom
  const handleScrollToBottom = useCallback(() => {
    scrollToBottom(true);
    setIsAtBottom(true);
    setShowScrollButtonState(false);
  }, [scrollToBottom]);

  return (
    <div className={`relative ${className}`}>
      {/* Chat Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`
          h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
          scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500
          ${isDarkTheme ? 'scrollbar-thumb-zinc-600' : 'scrollbar-thumb-gray-300'}
        `}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: isDarkTheme ? '#4a5568 transparent' : '#cbd5e0 transparent'
        }}
      >
        {children}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButtonState && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            onClick={handleScrollToBottom}
            size="sm"
            className={`
              rounded-full shadow-lg transition-all duration-200 hover:scale-105
              ${isDarkTheme 
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-600' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              }
            `}
            variant="outline"
          >
            <ChevronDown className="w-4 h-4" />
            <span className="ml-1 text-xs">Scroll to bottom</span>
          </Button>
        </div>
      )}

      {/* Streaming Indicator */}
      {isStreaming && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className={`
            flex items-center gap-2 px-3 py-2 rounded-full shadow-lg
            ${isDarkTheme 
              ? 'bg-zinc-800 text-zinc-200 border border-zinc-600' 
              : 'bg-white text-gray-700 border border-gray-200'
            }
          `}>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs font-medium">AI is typing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for managing auto-scroll behavior
export const useAutoScroll = (isStreaming: boolean = false) => {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    if (!containerRef.current) return;
    
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  const checkIfAtBottom = useCallback(() => {
    if (!containerRef.current) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= 50;
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);
    
    // Detect user scrolling
    setIsUserScrolling(true);
    setTimeout(() => setIsUserScrolling(false), 150);
  }, [checkIfAtBottom]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming && isAtBottom && !isUserScrolling) {
      scrollToBottom();
    }
  }, [isStreaming, isAtBottom, isUserScrolling, scrollToBottom]);

  return {
    containerRef,
    isAtBottom,
    isUserScrolling,
    scrollToBottom,
    handleScroll
  };
};
