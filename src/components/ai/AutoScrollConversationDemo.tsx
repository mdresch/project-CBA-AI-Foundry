import React, { useState, useEffect } from 'react';
import { Message } from '../../types/ai';
import { AdvancedConversationContainer } from './ConversationContainer';
import { Button } from '../ui/button';
import { useTheme } from '../../context/useTheme';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export const AutoScrollConversationDemo: React.FC = () => {
  const { isDarkTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  // Demo messages with different scenarios
  const demoMessages: Message[] = [
    {
      id: 'demo-1',
      sessionId: 'demo-session',
      role: 'user',
      content: 'Hello! Can you help me understand how auto-scrolling works in chat applications?',
      status: 'done',
      createdAt: new Date().toISOString(),
      timestamp: new Date(),
      meta: { model: 'gemini-2.0-flash' }
    },
    {
      id: 'demo-2',
      sessionId: 'demo-session',
      role: 'assistant',
      content: `Auto-scrolling in chat applications is a crucial UX feature that ensures users always see the latest messages. Here's how it typically works:

## Key Features:

1. **Automatic Scrolling**: The chat container automatically scrolls to the bottom when new messages arrive
2. **Streaming Support**: During AI streaming, the container stays at the bottom to show real-time updates
3. **User Control**: Users can scroll up to read history, and the auto-scroll pauses until they return to the bottom
4. **Smooth Animations**: Smooth scrolling transitions provide a polished experience

## Implementation Benefits:

- **Better UX**: Users don't miss new messages
- **Real-time Updates**: Perfect for streaming AI responses
- **Intuitive Behavior**: Matches user expectations from other chat apps
- **Accessibility**: Ensures content is always visible`,
      status: 'done',
      createdAt: new Date().toISOString(),
      timestamp: new Date(),
      meta: { model: 'gemini-2.0-flash' }
    },
    {
      id: 'demo-3',
      sessionId: 'demo-session',
      role: 'user',
      content: 'That sounds great! Can you show me a live demo of the streaming effect?',
      status: 'done',
      createdAt: new Date().toISOString(),
      timestamp: new Date(),
      meta: { model: 'gemini-2.0-flash' }
    }
  ];

  // Simulate streaming AI response
  const simulateStreamingResponse = async () => {
    setIsStreaming(true);
    
    const streamingMessage: Message = {
      id: `streaming-${Date.now()}`,
      sessionId: 'demo-session',
      role: 'assistant',
      content: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      timestamp: new Date(),
      meta: { model: 'gemini-2.0-flash' }
    };

    setMessages(prev => [...prev, streamingMessage]);

    const fullResponse = `Absolutely! Here's a live demonstration of the auto-scrolling feature:

## Live Streaming Demo

Watch as this message appears word by word, and notice how the chat container automatically scrolls to keep the latest content visible. This creates a smooth, engaging experience that users expect from modern chat applications.

### Key Features in Action:

1. **Real-time Updates**: The scroll position updates as new content arrives
2. **Smooth Transitions**: No jarring jumps or sudden movements
3. **User-Friendly**: If you scroll up to read something, auto-scroll pauses
4. **Responsive Design**: Works perfectly on all screen sizes

### Technical Implementation:

- Uses React hooks for scroll management
- Detects user scrolling vs. automatic updates
- Smooth CSS transitions for polished animations
- Optimized performance for real-time updates

This creates the perfect foundation for AI-powered conversations where users can see responses being generated in real-time!`;

    // Simulate word-by-word streaming
    const words = fullResponse.split(' ');
    let currentContent = '';
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay between words
      currentContent += (i > 0 ? ' ' : '') + words[i];
      
      setMessages(prev => prev.map(msg => 
        msg.id === streamingMessage.id 
          ? { ...msg, content: currentContent, status: 'sent' as const }
          : msg
      ));
    }

    // Mark as completed
    setMessages(prev => prev.map(msg => 
      msg.id === streamingMessage.id 
        ? { ...msg, status: 'done' as const }
        : msg
    ));

    setIsStreaming(false);
  };

  // Add a new user message
  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      sessionId: 'demo-session',
      role: 'user',
      content,
      status: 'done',
      createdAt: new Date().toISOString(),
      timestamp: new Date(),
      meta: { model: 'gemini-2.0-flash' }
    };

    setMessages(prev => [...prev, newMessage]);
  };

  // Reset demo
  const resetDemo = () => {
    setMessages([]);
    setIsStreaming(false);
    setMessageCount(0);
  };

  // Load initial demo messages
  useEffect(() => {
    if (messageCount === 0) {
      setMessages(demoMessages);
      setMessageCount(demoMessages.length);
    }
  }, [messageCount]);

  return (
    <div className={`p-6 ${isDarkTheme ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-500" />
            Auto-Scrolling Chat Container Demo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Experience smooth AI conversations with automatic scrolling that stays at the bottom during streaming.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Container */}
          <div className="lg:col-span-3">
            <div className={`
              rounded-lg shadow-lg h-[600px] flex flex-col border
              ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}
            `}>
              <AdvancedConversationContainer
                messages={messages}
                isLoading={isStreaming}
                className="flex-1"
                showScrollButton={true}
                enableAutoScroll={true}
                enableTypingIndicator={true}
                enableMessageAnimations={true}
                scrollBehavior="smooth"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className={`
              p-4 rounded-lg border
              ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}
            `}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Demo Controls
              </h3>
              
              <div className="space-y-2">
                <Button
                  onClick={simulateStreamingResponse}
                  disabled={isStreaming}
                  className="w-full"
                  variant="default"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isStreaming ? 'Streaming...' : 'Simulate Streaming'}
                </Button>

                <Button
                  onClick={() => addUserMessage('This is a test message to see auto-scroll in action!')}
                  disabled={isStreaming}
                  className="w-full"
                  variant="outline"
                >
                  <User className="w-4 h-4 mr-2" />
                  Add User Message
                </Button>

                <Button
                  onClick={() => addUserMessage('Can you explain more about the technical implementation?')}
                  disabled={isStreaming}
                  className="w-full"
                  variant="outline"
                >
                  <User className="w-4 h-4 mr-2" />
                  Ask Technical Question
                </Button>

                <Button
                  onClick={resetDemo}
                  disabled={isStreaming}
                  className="w-full"
                  variant="outline"
                >
                  Reset Demo
                </Button>
              </div>
            </div>

            {/* Features List */}
            <div className={`
              p-4 rounded-lg border
              ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}
            `}>
              <h3 className="font-semibold mb-3">Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Auto-scroll during streaming
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Smooth animations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  User scroll detection
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Scroll to bottom button
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Typing indicators
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Responsive design
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            How to Test Auto-Scrolling:
          </h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>Click "Simulate Streaming" to see real-time auto-scrolling</li>
            <li>Scroll up during streaming to pause auto-scroll</li>
            <li>Scroll back to bottom to resume auto-scrolling</li>
            <li>Use the "Scroll to bottom" button when needed</li>
            <li>Add messages to see smooth animations</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
