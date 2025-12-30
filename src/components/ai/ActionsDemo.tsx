import React, { useState } from 'react';
import { Actions } from './Actions';
import { useTheme } from '../../context/useTheme';

export const ActionsDemo: React.FC = () => {
  const { isDarkTheme } = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleLike = (messageId: string) => {
    setIsLiked(true);
    setIsDisliked(false);
    console.log('Liked message:', messageId);
  };

  const handleDislike = (messageId: string) => {
    setIsDisliked(true);
    setIsLiked(false);
    console.log('Disliked message:', messageId);
  };

  const handleRetry = () => {
    setIsRetrying(true);
    console.log('Retrying message...');
    setTimeout(() => setIsRetrying(false), 2000);
  };

  const handleCopy = (content: string) => {
    console.log('Copied content:', content);
  };

  const handleShare = (content: string) => {
    console.log('Shared content:', content);
  };

  const handleSaveToLibrary = (content: string, messageId: string) => {
    console.log('Saved to library:', messageId);
  };

  const sampleContent = `# AI Response Example

This is a sample AI response that demonstrates the Actions component functionality.

## Features:
- **Retry**: Regenerate the response
- **Like/Dislike**: Rate the response quality
- **Copy**: Copy to clipboard
- **Share**: Share the response
- **Save to Library**: Save as a prompt template

The Actions component provides a flexible row of action buttons for AI responses with common actions.`;

  return (
    <div className={`min-h-screen pt-16 pb-32 ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Actions Component Demo</h1>
        
        <div className={`rounded-lg p-6 shadow-lg border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
          <h2 className="text-xl font-semibold mb-4">Sample AI Response</h2>
          
          {/* Mock message content */}
          <div className={`p-4 rounded-lg mb-4 ${isDarkTheme ? 'bg-zinc-800' : 'bg-gray-100'}`}>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap">{sampleContent}</pre>
            </div>
          </div>

          {/* Actions Component */}
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Actions Bar:</h3>
            <Actions
              messageId="demo-message-123"
              content={sampleContent}
              onRetry={handleRetry}
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

          {/* Status Display */}
          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <h4 className="font-medium mb-2">Current Status:</h4>
            <ul className="text-sm space-y-1">
              <li>Liked: {isLiked ? '✅' : '❌'}</li>
              <li>Disliked: {isDisliked ? '✅' : '❌'}</li>
              <li>Retrying: {isRetrying ? '✅' : '❌'}</li>
            </ul>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-zinc-800">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Click the <strong>retry</strong> button to see the retry animation</li>
              <li>Click <strong>like</strong> or <strong>dislike</strong> to rate the response</li>
              <li>Click <strong>copy</strong> to copy the content to clipboard</li>
              <li>Click <strong>share</strong> to test the share functionality</li>
              <li>Click <strong>save to library</strong> to save as a prompt template</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
