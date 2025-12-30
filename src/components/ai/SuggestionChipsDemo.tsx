import React, { useState } from 'react';
import { SuggestionChips } from './SuggestionChips';
import { SuggestionGroup, SuggestionChip } from '../../types/ai';
import { useTheme } from '../../context/useTheme';

export const SuggestionChipsDemo: React.FC = () => {
  const { isDarkTheme } = useTheme();
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');

  // Demo suggestion data
  const demoSuggestions: SuggestionGroup[] = [
    {
      id: 'follow-up',
      title: 'Follow-up',
      category: 'follow-up',
      chips: [
        {
          id: '1',
          text: 'Can you explain that in more detail?',
          category: 'follow-up',
          confidence: 0.9
        },
        {
          id: '2',
          text: 'What are the next steps?',
          category: 'follow-up',
          confidence: 0.8
        },
        {
          id: '3',
          text: 'How does this work?',
          category: 'follow-up',
          confidence: 0.7
        },
        {
          id: '4',
          text: 'Can you give me an example?',
          category: 'follow-up',
          confidence: 0.9
        }
      ]
    },
    {
      id: 'clarification',
      title: 'Clarify',
      category: 'clarification',
      chips: [
        {
          id: '5',
          text: 'I don\'t understand this part',
          category: 'clarification',
          confidence: 0.8
        },
        {
          id: '6',
          text: 'Can you clarify what you mean?',
          category: 'clarification',
          confidence: 0.9
        },
        {
          id: '7',
          text: 'What does this term mean?',
          category: 'clarification',
          confidence: 0.7
        }
      ]
    },
    {
      id: 'example',
      title: 'Examples',
      category: 'example',
      chips: [
        {
          id: '8',
          text: 'Show me a code example',
          category: 'example',
          confidence: 0.9
        },
        {
          id: '9',
          text: 'Give me a real-world example',
          category: 'example',
          confidence: 0.8
        },
        {
          id: '10',
          text: 'What does this look like in practice?',
          category: 'example',
          confidence: 0.7
        }
      ]
    },
    {
      id: 'related',
      title: 'Related',
      category: 'related',
      chips: [
        {
          id: '11',
          text: 'What else should I know?',
          category: 'related',
          confidence: 0.6
        },
        {
          id: '12',
          text: 'Are there related topics?',
          category: 'related',
          confidence: 0.7
        },
        {
          id: '13',
          text: 'What\'s similar to this?',
          category: 'related',
          confidence: 0.6
        }
      ]
    },
    {
      id: 'action',
      title: 'Actions',
      category: 'action',
      chips: [
        {
          id: '14',
          text: 'Let\'s try this',
          category: 'action',
          confidence: 0.8
        },
        {
          id: '15',
          text: 'I want to implement this',
          category: 'action',
          confidence: 0.9
        },
        {
          id: '16',
          text: 'Help me get started',
          category: 'action',
          confidence: 0.8
        }
      ]
    }
  ];

  const handleSuggestionClick = (suggestion: SuggestionChip) => {
    setSelectedSuggestion(suggestion.text);
    console.log('Selected suggestion:', suggestion);
  };

  return (
    <div className={`p-6 ${isDarkTheme ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Suggestion Chips Demo</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Interactive suggestion chips similar to ChatGPT's follow-up prompts. 
          Click on any suggestion to see it in action.
        </p>

        {/* Demo Suggestion Chips */}
        <div className="mb-8">
          <SuggestionChips
            suggestions={demoSuggestions}
            onSuggestionClick={handleSuggestionClick}
            isLoading={false}
            isCollapsible={true}
            defaultCollapsed={false}
            className="border rounded-lg p-4"
          />
        </div>

        {/* Selected Suggestion Display */}
        {selectedSuggestion && (
          <div className={`p-4 rounded-lg border ${
            isDarkTheme 
              ? 'bg-zinc-800 border-zinc-700' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <h3 className="font-semibold mb-2">Selected Suggestion:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              "{selectedSuggestion}"
            </p>
          </div>
        )}

        {/* Features List */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Features:</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• <strong>Scrollable pills:</strong> Horizontal scrolling with smooth animations</li>
            <li>• <strong>Category grouping:</strong> Organized by follow-up, clarification, example, related, and action</li>
            <li>• <strong>Confidence indicators:</strong> Visual confidence scores for each suggestion</li>
            <li>• <strong>Responsive design:</strong> Works on mobile and desktop</li>
            <li>• <strong>Theme support:</strong> Dark and light mode compatible</li>
            <li>• <strong>Interactive:</strong> Click to select and use suggestions</li>
            <li>• <strong>Context-aware:</strong> Suggestions adapt based on conversation context</li>
            <li>• <strong>Accessible:</strong> Keyboard navigation and screen reader support</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
