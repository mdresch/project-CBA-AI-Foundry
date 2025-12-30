import React, { useState } from 'react';
import { ChainOfThought } from './ChainOfThought';
import { ThoughtStep, SearchResult, ThoughtImage } from '../../types/chainOfThought';
import { useTheme } from '../../context/useTheme';

export const ChainOfThoughtDemo: React.FC = () => {
  const { isDarkTheme } = useTheme();
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Sample search results
  const sampleSearchResults: SearchResult[] = [
    {
      id: '1',
      title: 'React Hooks Documentation',
      url: 'https://react.dev/reference/react',
      snippet: 'Hooks let you use state and other React features without writing a class...',
      relevanceScore: 0.95
    },
    {
      id: '2',
      title: 'useState Hook Examples',
      url: 'https://react.dev/reference/react/useState',
      snippet: 'useState is a React Hook that lets you add a state variable to your component...',
      relevanceScore: 0.88
    },
    {
      id: '3',
      title: 'React State Management Best Practices',
      url: 'https://react.dev/learn/state-as-a-snapshot',
      snippet: 'State is a snapshot of data at a point in time. When you update state...',
      relevanceScore: 0.72
    }
  ];

  // Sample images - using data URIs to avoid network requests
  const sampleImages: ThoughtImage[] = [
    {
      id: '1',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzRGNDZFNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UmVhY3QgQ29tcG9uZW50PC90ZXh0Pjwvc3ZnPg==',
      alt: 'React Component Structure',
      caption: 'Example React component structure',
      width: 300,
      height: 200
    },
    {
      id: '2',
      url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzEwQjk4MSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U3RhdGUgRmxvdzwvdGV4dD48L3N2Zz4=',
      alt: 'State Flow Diagram',
      caption: 'State flow in React applications',
      width: 300,
      height: 200
    }
  ];

  // Sample chain of thought steps
  const sampleSteps: ThoughtStep[] = [
    {
      id: '1',
      title: 'Understanding the Problem',
      content: 'The user is asking about implementing a React component with state management. I need to understand what specific functionality they want to achieve.',
      status: 'completed',
      timestamp: new Date(Date.now() - 30000),
      reasoning: 'This is the first step in any problem-solving process. Understanding the requirements helps me provide more targeted assistance.',
      confidence: 0.95
    },
    {
      id: '2',
      title: 'Researching React Patterns',
      content: 'I should look up current React patterns and best practices for state management, particularly focusing on hooks and modern approaches.',
      status: 'completed',
      timestamp: new Date(Date.now() - 25000),
      searchResults: sampleSearchResults,
      reasoning: 'Research helps ensure I provide up-to-date and accurate information based on current React best practices.',
      confidence: 0.88
    },
    {
      id: '3',
      title: 'Analyzing Component Structure',
      content: 'Based on the research, I need to determine the appropriate component structure and state management approach.',
      status: 'completed',
      timestamp: new Date(Date.now() - 20000),
      images: sampleImages,
      reasoning: 'Visual analysis helps me understand the component architecture and recommend the best approach.',
      confidence: 0.82,
      subSteps: [
        {
          id: '3.1',
          title: 'Identify State Requirements',
          content: 'Determine what state variables are needed and their relationships.',
          status: 'completed',
          timestamp: new Date(Date.now() - 18000),
          reasoning: 'State analysis is crucial for proper component design.',
          confidence: 0.90
        },
        {
          id: '3.2',
          title: 'Choose State Management Pattern',
          content: 'Decide between useState, useReducer, or external state management based on complexity.',
          status: 'completed',
          timestamp: new Date(Date.now() - 15000),
          reasoning: 'The choice depends on the complexity and requirements of the component.',
          confidence: 0.85
        }
      ]
    },
    {
      id: '4',
      title: 'Generating Code Solution',
      content: 'Now I will create a comprehensive code example that demonstrates the recommended approach with proper TypeScript types and best practices.',
      status: 'thinking',
      timestamp: new Date(Date.now() - 10000),
      reasoning: 'Code generation requires careful consideration of all the requirements and best practices identified in previous steps.',
      confidence: 0.75
    },
    {
      id: '5',
      title: 'Validating Solution',
      content: 'I need to review the generated code to ensure it follows React best practices and meets all requirements.',
      status: 'pending',
      reasoning: 'Validation ensures the solution is correct and follows best practices.',
      confidence: 0.0
    }
  ];

  const handleStepClick = (stepId: string) => {
    console.log('Step clicked:', stepId);
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const handleSearchResultClick = (result: SearchResult) => {
    console.log('Search result clicked:', result);
    // In a real app, this would open the URL
    alert(`Would open: ${result.url}`);
  };

  const handleImageClick = (image: ThoughtImage) => {
    console.log('Image clicked:', image);
    // In a real app, this would open the image in a modal
    alert(`Would open image: ${image.alt}`);
  };

  return (
    <div className={`min-h-screen pt-16 pb-32 ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Chain of Thought Demo</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Demo */}
          <div className={`rounded-lg p-6 shadow-lg border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
            <h2 className="text-xl font-semibold mb-4">AI Reasoning Process</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This demonstrates how an AI assistant thinks through a problem step by step, 
              showing its reasoning process, research, and decision-making.
            </p>
            
            <ChainOfThought
              steps={sampleSteps}
              isExpanded={true}
              onStepClick={handleStepClick}
              onSearchResultClick={handleSearchResultClick}
              onImageClick={handleImageClick}
              isDarkTheme={isDarkTheme}
            />
          </div>

          {/* Interactive Controls */}
          <div className={`rounded-lg p-6 shadow-lg border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
            <h2 className="text-xl font-semibold mb-4">Interactive Features</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Step Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Completed - Step finished successfully</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Thinking - Currently processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Pending - Waiting to start</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Error - Step failed</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Confidence Levels</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>High (80%+) - Very confident</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Medium (60-79%) - Somewhat confident</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Low ({'<'}60%) - Less confident</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Features</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Expandable/collapsible steps</li>
                  <li>Search results with relevance scores</li>
                  <li>Image galleries with captions</li>
                  <li>Sub-steps for detailed reasoning</li>
                  <li>Confidence indicators</li>
                  <li>Timestamp tracking</li>
                  <li>Interactive elements</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Try It Out</h3>
                <div className="space-y-2 text-sm">
                  <p>• Click on any step to expand/collapse it</p>
                  <p>• Click on search results to "open" them</p>
                  <p>• Click on images to view them</p>
                  <p>• Notice the different status indicators</p>
                  <p>• Check the confidence levels</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className={`mt-8 rounded-lg p-6 shadow-lg border ${isDarkTheme ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
          <h2 className="text-xl font-semibold mb-4">Usage Example</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`import { ChainOfThought, ThoughtStep } from './ChainOfThought';

const steps: ThoughtStep[] = [
  {
    id: '1',
    title: 'Understanding the Problem',
    content: 'Analyze the user\'s request...',
    status: 'completed',
    confidence: 0.95,
    reasoning: 'This step helps clarify requirements...'
  },
  // ... more steps
];

<ChainOfThought
  steps={steps}
  isDarkTheme={isDarkTheme}
  onStepClick={(stepId) => console.log('Step clicked:', stepId)}
  onSearchResultClick={(result) => window.open(result.url)}
  onImageClick={(image) => openImageModal(image)}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
};
