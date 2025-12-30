import React, { useState } from 'react';
import { 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Share2, 
  BookmarkPlus,
  Check,
  X
} from 'lucide-react';
import { useTheme } from '../../context/useTheme';
import { toast } from 'react-toastify';

interface ActionsProps {
  messageId: string;
  content: string;
  onRetry?: () => void;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
  onCopy?: (content: string) => void;
  onShare?: (content: string) => void;
  onSaveToLibrary?: (content: string, messageId: string) => void;
  isRetrying?: boolean;
  isLiked?: boolean;
  isDisliked?: boolean;
  isDarkTheme: boolean;
}

export const Actions: React.FC<ActionsProps> = ({
  messageId,
  content,
  onRetry,
  onLike,
  onDislike,
  onCopy,
  onShare,
  onSaveToLibrary,
  isRetrying = false,
  isLiked = false,
  isDisliked = false,
  isDarkTheme,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      toast.success('Copied to clipboard!');
      onCopy?.(content);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Response',
          text: content,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(content);
        toast.success('Content copied to clipboard for sharing');
      }
      onShare?.(content);
    } catch (error) {
      console.error('Failed to share:', error);
      toast.error('Failed to share content');
    }
  };

  const handleSaveToLibrary = async () => {
    setIsSaving(true);
    try {
      // Create a prompt template from the AI response
      const promptTemplate = {
        id: `ai-response-${messageId}`,
        name: `AI Response - ${new Date().toLocaleDateString()}`,
        template: content,
        variables: [],
        category: 'AI Responses',
        description: 'Response saved from AI conversation',
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage for now (in a real app, this would go to the database)
      const existingTemplates = JSON.parse(localStorage.getItem('ai-prompt-templates') || '[]');
      existingTemplates.push(promptTemplate);
      localStorage.setItem('ai-prompt-templates', JSON.stringify(existingTemplates));

      toast.success('Saved to AI Prompt Library!');
      onSaveToLibrary?.(content, messageId);
    } catch (error) {
      console.error('Failed to save to library:', error);
      toast.error('Failed to save to library');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = () => {
    onLike?.(messageId);
    toast.success('Liked!');
  };

  const handleDislike = () => {
    onDislike?.(messageId);
    toast.success('Disliked!');
  };

  const handleRetry = () => {
    onRetry?.();
    toast.info('Retrying...');
  };

  const buttonClass = `p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
    isDarkTheme 
      ? 'hover:bg-zinc-700 text-gray-300 hover:text-white' 
      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
  }`;

  const activeButtonClass = `p-2 rounded-lg transition-all duration-200 ${
    isDarkTheme 
      ? 'bg-zinc-700 text-white' 
      : 'bg-gray-200 text-gray-900'
  }`;

  return (
    <div className={`flex items-center gap-1 p-2 rounded-lg ${
      isDarkTheme ? 'bg-zinc-800' : 'bg-gray-50'
    }`}>
      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className={`${buttonClass} ${isRetrying ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Retry this response"
        >
          <RotateCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
        </button>
      )}

      {/* Like Button */}
      {onLike && (
        <button
          onClick={handleLike}
          className={isLiked ? activeButtonClass : buttonClass}
          title="Like this response"
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? 'text-green-500' : ''}`} />
        </button>
      )}

      {/* Dislike Button */}
      {onDislike && (
        <button
          onClick={handleDislike}
          className={isDisliked ? activeButtonClass : buttonClass}
          title="Dislike this response"
        >
          <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'text-red-500' : ''}`} />
        </button>
      )}

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className={isCopied ? activeButtonClass : buttonClass}
        title={isCopied ? 'Copied!' : 'Copy to clipboard'}
      >
        {isCopied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className={buttonClass}
        title="Share this response"
      >
        <Share2 className="w-4 h-4" />
      </button>

      {/* Save to Library Button */}
      <button
        onClick={handleSaveToLibrary}
        disabled={isSaving}
        className={`${buttonClass} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Save to AI Prompt Library"
      >
        {isSaving ? (
          <X className="w-4 h-4 animate-pulse" />
        ) : (
          <BookmarkPlus className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};
