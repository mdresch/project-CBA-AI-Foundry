import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Lightbulb, HelpCircle, Zap, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { SuggestionChip, SuggestionGroup } from '../../types/ai';
import { useTheme } from '../../context/useTheme';

interface SuggestionChipsProps {
  suggestions: SuggestionGroup[];
  onSuggestionClick: (suggestion: SuggestionChip) => void;
  isLoading?: boolean;
  className?: string;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  suggestions,
  onSuggestionClick,
  isLoading = false,
  className = '',
  isCollapsible = true,
  defaultCollapsed = true
}) => {
  const { isDarkTheme } = useTheme();
  const [activeGroup, setActiveGroup] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [suggestions]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const getCategoryIcon = (category: SuggestionChip['category']) => {
    switch (category) {
      case 'follow-up':
        return <ArrowRight className="w-3 h-3" />;
      case 'clarification':
        return <HelpCircle className="w-3 h-3" />;
      case 'example':
        return <Lightbulb className="w-3 h-3" />;
      case 'related':
        return <Sparkles className="w-3 h-3" />;
      case 'action':
        return <Zap className="w-3 h-3" />;
      default:
        return <Sparkles className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: SuggestionChip['category']) => {
    switch (category) {
      case 'follow-up':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800';
      case 'clarification':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800';
      case 'example':
        return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800';
      case 'related':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800';
      case 'action':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700';
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Collapsible Header */}
      {isCollapsible && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              AI Suggestions
            </span>
            <Badge variant="secondary" className="text-xs">
              {suggestions.reduce((total, group) => total + group.chips.length, 0)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show Suggestions
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide Suggestions
              </>
            )}
          </Button>
        </div>
      )}

      {/* Collapsible Content */}
      {(!isCollapsible || !isCollapsed) && (
        <>
          {/* Group Tabs */}
          {suggestions.length > 1 && (
            <div className="flex items-center gap-2 mb-4">
              {suggestions.map((group, index) => (
                <Button
                  key={group.id}
                  variant={activeGroup === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveGroup(index)}
                  className="text-xs"
                >
                  {getCategoryIcon(group.category)}
                  <span className="ml-1">{group.title}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {group.chips.length}
                  </Badge>
                </Button>
              ))}
            </div>
          )}

      {/* Suggestion Chips Container */}
      <div className="relative">
        {/* Scroll Buttons */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="sm"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        
        {canScrollRight && (
          <Button
            variant="outline"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Scrollable Chips */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {suggestions[activeGroup]?.chips.map((chip) => (
            <Button
              key={chip.id}
              variant="outline"
              size="sm"
              onClick={() => onSuggestionClick(chip)}
              disabled={isLoading}
              className={`
                whitespace-nowrap flex items-center gap-2 px-3 py-2 h-auto
                transition-all duration-200 hover:scale-105 active:scale-95
                ${getCategoryColor(chip.category)}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {getCategoryIcon(chip.category)}
              <span className="text-sm font-medium">{chip.text}</span>
              {chip.confidence && (
                <Badge 
                  variant="secondary" 
                  className="text-xs opacity-70"
                >
                  {Math.round(chip.confidence * 100)}%
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                Generating suggestions...
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
