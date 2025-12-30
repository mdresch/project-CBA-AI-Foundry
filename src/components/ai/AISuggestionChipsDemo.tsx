import React, { useState, useEffect } from 'react';
import { SuggestionChips } from './SuggestionChips';
import { SuggestionGroup, SuggestionChip, Message } from '../../types/ai';
import { useTheme } from '../../context/useTheme';
import { SuggestionGenerator } from '../../utils/suggestionGenerator';
import { AISuggestionGenerator } from '../../utils/aiSuggestionGenerator';

export const AISuggestionChipsDemo: React.FC = () => {
  const { isDarkTheme } = useTheme();
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
  const [suggestions, setSuggestions] = useState<SuggestionGroup[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [demoConversation, setDemoConversation] = useState<Message[]>([]);

  // Demo conversation scenarios
  const conversationScenarios = [
    {
      name: 'Code Explanation',
      messages: [
        {
          id: '1',
          sessionId: 'demo-1',
          role: 'user' as const,
          content: 'How do I implement a binary search algorithm?',
          status: 'done' as const,
          createdAt: new Date().toISOString(),
          meta: { model: 'gemini-2.0-flash' }
        },
        {
          id: '2',
          sessionId: 'demo-1',
          role: 'assistant' as const,
          content: `Here's how to implement a binary search algorithm:

\`\`\`javascript
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid; // Found the target
        } else if (arr[mid] < target) {
            left = mid + 1; // Search right half
        } else {
            right = mid - 1; // Search left half
        }
    }
    
    return -1; // Target not found
}
\`\`\`

**Key Points:**
1. **Time Complexity:** O(log n) - much faster than linear search
2. **Space Complexity:** O(1) - constant space
3. **Prerequisite:** Array must be sorted
4. **Use Cases:** Searching in large datasets, finding insertion points

The algorithm works by repeatedly dividing the search space in half, eliminating half of the remaining elements with each comparison.`,
          status: 'done' as const,
          createdAt: new Date().toISOString(),
          meta: { model: 'gemini-2.0-flash' }
        }
      ]
    },
    {
      name: 'Problem Solving',
      messages: [
        {
          id: '3',
          sessionId: 'demo-2',
          role: 'user' as const,
          content: 'I have a performance issue with my React app',
          status: 'done' as const,
          createdAt: new Date().toISOString(),
          meta: { model: 'gemini-2.0-flash' }
        },
        {
          id: '4',
          sessionId: 'demo-2',
          role: 'assistant' as const,
          content: `Here are the most common React performance issues and solutions:

## 1. **Unnecessary Re-renders**
- Use \`React.memo()\` for functional components
- Implement \`useMemo()\` and \`useCallback()\` for expensive calculations
- Check for object/array dependencies in useEffect

## 2. **Large Component Trees**
- Implement code splitting with \`React.lazy()\`
- Use virtual scrolling for long lists
- Consider component composition patterns

## 3. **Inefficient State Management**
- Avoid storing derived state
- Use state normalization for complex data
- Consider using useReducer for complex state logic

## 4. **Bundle Size Issues**
- Analyze bundle with webpack-bundle-analyzer
- Implement tree shaking
- Use dynamic imports for large libraries

**Next Steps:**
1. Profile your app with React DevTools Profiler
2. Identify the slowest components
3. Apply the appropriate optimization technique`,
          status: 'done' as const,
          createdAt: new Date().toISOString(),
          meta: { model: 'gemini-2.0-flash' }
        }
      ]
    },
    {
      name: 'Concept Explanation',
      messages: [
        {
          id: '5',
          sessionId: 'demo-3',
          role: 'user' as const,
          content: 'What is machine learning?',
          status: 'done' as const,
          createdAt: new Date().toISOString(),
          meta: { model: 'gemini-2.0-flash' }
        },
        {
          id: '6',
          sessionId: 'demo-3',
          role: 'assistant' as const,
          content: `Machine Learning (ML) is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every task.

## **Core Concepts:**

### **Types of Machine Learning:**
1. **Supervised Learning** - Learning with labeled examples
2. **Unsupervised Learning** - Finding patterns in unlabeled data
3. **Reinforcement Learning** - Learning through trial and error

### **Common Algorithms:**
- **Linear Regression** - Predicting continuous values
- **Decision Trees** - Making decisions through branching
- **Neural Networks** - Mimicking human brain structure
- **Clustering** - Grouping similar data points

### **Real-World Applications:**
- **Recommendation Systems** (Netflix, Amazon)
- **Image Recognition** (Medical diagnosis, self-driving cars)
- **Natural Language Processing** (Chatbots, translation)
- **Fraud Detection** (Banking, e-commerce)

The key principle is that the machine improves its performance on a specific task through experience with data.`,
          status: 'done' as const,
          createdAt: new Date().toISOString(),
          meta: { model: 'gemini-2.0-flash' }
        }
      ]
    }
  ];

  const [currentScenario, setCurrentScenario] = useState(0);

  // Generate suggestions when conversation changes
  useEffect(() => {
    if (demoConversation.length === 0) return;

    const generateSuggestions = async () => {
      setIsGenerating(true);
      try {
        const context = {
          conversationHistory: demoConversation,
          lastMessage: demoConversation[demoConversation.length - 1],
          userPreferences: {}
        };

        // Generate both pattern-based and AI-powered suggestions
        const [patternSuggestions, aiSuggestions] = await Promise.all([
          Promise.resolve(SuggestionGenerator.generateSuggestions(context)),
          AISuggestionGenerator.generateSuggestionsWithModel(context, 'gemini-2.0-flash')
        ]);

        // Combine and prioritize AI-powered suggestions
        const combinedSuggestions = [...aiSuggestions, ...patternSuggestions];
        
        // Remove duplicates and limit total suggestions
        const uniqueSuggestions = combinedSuggestions.reduce((acc, group) => {
          const existingGroup = acc.find(g => g.category === group.category);
          if (existingGroup) {
            const existingChips = existingGroup.chips.map(c => c.text);
            const newChips = group.chips.filter(c => !existingChips.includes(c.text));
            existingGroup.chips.push(...newChips);
          } else {
            acc.push(group);
          }
          return acc;
        }, [] as SuggestionGroup[]);

        setSuggestions(uniqueSuggestions.slice(0, 4));
      } catch (error) {
        console.error('Error generating suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsGenerating(false);
      }
    };

    generateSuggestions();
  }, [demoConversation]);

  const handleScenarioChange = (scenarioIndex: number) => {
    setCurrentScenario(scenarioIndex);
    setDemoConversation(conversationScenarios[scenarioIndex].messages);
    setSelectedSuggestion('');
  };

  const handleSuggestionClick = (suggestion: SuggestionChip) => {
    setSelectedSuggestion(suggestion.text);
    console.log('Selected suggestion:', suggestion);
  };

  // Initialize with first scenario
  useEffect(() => {
    if (demoConversation.length === 0) {
      setDemoConversation(conversationScenarios[0].messages);
    }
  }, [demoConversation.length]);

  return (
    <div className={`p-6 ${isDarkTheme ? 'bg-zinc-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">AI-Powered Suggestion Chips Demo</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Experience intelligent suggestion chips that analyze AI responses and generate contextual follow-up questions.
        </p>

        {/* Scenario Selector */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Choose a Conversation Scenario:</h3>
          <div className="flex flex-wrap gap-2">
            {conversationScenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => handleScenarioChange(index)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  currentScenario === index
                    ? 'bg-blue-500 text-white border-blue-500'
                    : isDarkTheme
                    ? 'bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Display */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Conversation:</h3>
          <div className={`rounded-lg border p-4 ${isDarkTheme ? 'bg-zinc-800 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
            {demoConversation.map((message, index) => (
              <div key={message.id} className="mb-4 last:mb-0">
                <div className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? isDarkTheme
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkTheme
                        ? 'bg-zinc-700 text-gray-100'
                        : 'bg-white text-gray-900 border'
                  }`}>
                    <div className="text-sm font-medium mb-1">
                      {message.role === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI-Powered Suggestion Chips */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            AI-Generated Follow-up Suggestions:
            {isGenerating && <span className="ml-2 text-sm text-gray-500">(Generating...)</span>}
          </h3>
          <SuggestionChips
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            isLoading={isGenerating}
            isCollapsible={true}
            defaultCollapsed={false}
            className="border rounded-lg p-4"
          />
        </div>

        {/* Selected Suggestion Display */}
        {selectedSuggestion && (
          <div className={`p-4 rounded-lg border mb-8 ${
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
          <h3 className="text-lg font-semibold mb-4">AI-Powered Features:</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>• <strong>Context Analysis:</strong> Analyzes AI responses to generate relevant follow-ups</li>
            <li>• <strong>Content Detection:</strong> Detects code, algorithms, steps, examples, and concepts</li>
            <li>• <strong>Smart Categorization:</strong> Automatically categorizes suggestions by type</li>
            <li>• <strong>Confidence Scoring:</strong> AI-powered confidence scores for each suggestion</li>
            <li>• <strong>Topic Extraction:</strong> Extracts key topics for related question generation</li>
            <li>• <strong>Response Length Analysis:</strong> Adapts suggestions based on response complexity</li>
            <li>• <strong>Pattern Recognition:</strong> Recognizes technical, creative, and analytical contexts</li>
            <li>• <strong>Fallback System:</strong> Graceful degradation to pattern-based suggestions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
