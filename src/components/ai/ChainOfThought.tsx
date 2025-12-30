import React, { useState, memo, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Image as ImageIcon, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Brain,
  Lightbulb,
  Target
} from 'lucide-react';
import { useTheme } from '../../context/useTheme';
import ChainOfThoughtAnalytics from '../../utils/chainOfThoughtAnalytics';
import { SearchResult, ThoughtImage, ThoughtStep } from '../../types/chainOfThought';

interface ChainOfThoughtProps {
  steps: ThoughtStep[];
  isExpanded?: boolean;
  onStepClick?: (stepId: string) => void;
  onSearchResultClick?: (result: SearchResult) => void;
  onImageClick?: (image: ThoughtImage) => void;
  isDarkTheme: boolean;
  className?: string;
  sessionId?: string;
  messageId?: string;
}

const ChainOfThoughtComponent: React.FC<ChainOfThoughtProps> = ({
  steps,
  isExpanded = false,
  onStepClick,
  onSearchResultClick,
  onImageClick,
  isDarkTheme: propIsDarkTheme,
  className = '',
  sessionId = 'unknown',
  messageId = 'unknown',
}) => {
  const { isDarkTheme: hookIsDarkTheme } = useTheme();
  const isDarkTheme = propIsDarkTheme !== undefined ? propIsDarkTheme : hookIsDarkTheme;
  
  const [isMainExpanded, setIsMainExpanded] = useState(isExpanded);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(
    isExpanded ? new Set(steps.map(step => step.id)) : new Set()
  );

  // Add error boundary and null checks
  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return null;
  }

  const toggleStep = useCallback((stepId: string) => {
    try {
      const step = steps.find(s => s.id === stepId);
      const isCurrentlyExpanded = expandedSteps.has(stepId);
      
      setExpandedSteps(prev => {
        const newSet = new Set(prev);
        if (newSet.has(stepId)) {
          newSet.delete(stepId);
        } else {
          newSet.add(stepId);
        }
        return newSet;
      });
      
      // Track analytics with error handling
      try {
        ChainOfThoughtAnalytics.trackInteraction({
          stepId,
          stepTitle: step?.title || stepId,
          action: isCurrentlyExpanded ? 'collapse' : 'expand',
          sessionId,
          messageId
        });
      } catch (error) {
        console.error('Error tracking chain of thought interaction:', error);
        // Continue without analytics if tracking fails
      }
      
      onStepClick?.(stepId);
    } catch (error) {
      console.error('Error in toggleStep:', error);
    }
  }, [steps, expandedSteps, sessionId, messageId, onStepClick]);

  const getStatusIcon = (status: ThoughtStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'thinking':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ThoughtStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'thinking':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'pending':
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50';
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-400';
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderSearchResults = (searchResults: SearchResult[]) => {
    if (!searchResults.length) return null;

    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <Search className="w-4 h-4" />
          Search Results ({searchResults.length})
        </div>
        <div className="space-y-2">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                isDarkTheme ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-white'
              }`}
              onClick={() => {
                try {
                  // Track search result click analytics
                  ChainOfThoughtAnalytics.trackInteraction({
                    stepId: 'search-result',
                    stepTitle: result.title,
                    action: 'search_result_click',
                    sessionId,
                    messageId
                  });
                  onSearchResultClick?.(result);
                } catch (error) {
                  console.error('Error in search result click:', error);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate">
                    {result.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {result.snippet}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
                    {result.url}
                  </p>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-400 ml-2 flex-shrink-0" />
              </div>
              {result.relevanceScore && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Relevance:</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${result.relevanceScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(result.relevanceScore * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderImages = (images: ThoughtImage[]) => {
    if (!images.length) return null;

    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <ImageIcon className="w-4 h-4" />
          Images ({images.length})
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group cursor-pointer"
              onClick={() => {
                try {
                  // Track image click analytics
                  ChainOfThoughtAnalytics.trackInteraction({
                    stepId: 'image',
                    stepTitle: image.alt,
                    action: 'image_click',
                    sessionId,
                    messageId
                  });
                  onImageClick?.(image);
                } catch (error) {
                  console.error('Error in image click:', error);
                }
              }}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                loading="lazy"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep = useCallback((step: ThoughtStep, depth = 0) => {
    const isExpanded = expandedSteps.has(step.id);
    const hasSubSteps = step.subSteps && step.subSteps.length > 0;

    return (
      <div key={step.id} className={`${depth > 0 ? 'ml-6' : ''}`}>
        <div
          className={`p-4 rounded-lg border transition-all duration-200 ${
            getStatusColor(step.status)
          } ${onStepClick ? 'cursor-pointer hover:shadow-md' : ''}`}
          onClick={() => toggleStep(step.id)}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(step.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {step.title}
                </h3>
                <div className="flex items-center gap-2">
                  {step.confidence && (
                    <div className={`text-xs ${getConfidenceColor(step.confidence)}`}>
                      {Math.round(step.confidence * 100)}% confidence
                    </div>
                  )}
                  {hasSubSteps && (
                    <div className="text-gray-400">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {step.timestamp && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(() => {
                    try {
                      let date: Date;
                      if (step.timestamp instanceof Date) {
                        date = step.timestamp;
                      } else if (typeof step.timestamp === 'string' || typeof step.timestamp === 'number') {
                        date = new Date(step.timestamp);
                      } else {
                        return 'Invalid time';
                      }
                      
                      // Check if the date is valid
                      if (isNaN(date.getTime())) {
                        return 'Invalid time';
                      }
                      
                      return date.toLocaleTimeString();
                    } catch (error) {
                      console.warn('Invalid timestamp:', step.timestamp);
                      return 'Invalid time';
                    }
                  })()}
                </p>
              )}

              {isExpanded && (
                <div className="mt-3 space-y-3">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {step.content}
                  </div>

                  {step.reasoning && (
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Reasoning
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.reasoning}
                      </p>
                    </div>
                  )}

                  {step.searchResults && renderSearchResults(step.searchResults)}
                  {step.images && renderImages(step.images)}

                  {hasSubSteps && step.subSteps && (
                    <div className="space-y-2">
                      {step.subSteps.map((subStep) => renderStep(subStep, depth + 1))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }, [expandedSteps, isDarkTheme, sessionId, messageId, onStepClick, onSearchResultClick, onImageClick, toggleStep]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Collapsible Header */}
      <button
        onClick={useCallback(() => {
          try {
            setIsMainExpanded(!isMainExpanded);
            // Track main toggle analytics
            ChainOfThoughtAnalytics.trackInteraction({
              stepId: 'main-toggle',
              stepTitle: 'Chain of Thought',
              action: isMainExpanded ? 'collapse' : 'expand',
              sessionId,
              messageId
            });
          } catch (error) {
            console.error('Error in main toggle:', error);
          }
        }, [isMainExpanded, sessionId, messageId])}
        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
          isDarkTheme 
            ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-750' 
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Chain of Thought
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Target className="w-4 h-4" />
            {steps.length} step{steps.length !== 1 ? 's' : ''}
          </div>
          {isMainExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isMainExpanded && (
        <div className="space-y-3">
          {steps.map((step) => renderStep(step))}
          
          {steps.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No reasoning steps available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const ChainOfThought = memo(ChainOfThoughtComponent);
