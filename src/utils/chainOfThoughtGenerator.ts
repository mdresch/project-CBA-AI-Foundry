import { ThoughtStep, SearchResult, ThoughtImage } from '../types/chainOfThought';

export const generateSampleChainOfThought = (topic: string): ThoughtStep[] => {
  const baseTime = Date.now();
  
  return [
    {
      id: '1',
      title: 'Understanding the Problem',
      content: `I need to analyze the user's question about "${topic}" and break it down into manageable components.`,
      status: 'completed',
      timestamp: new Date(baseTime - 30000),
      reasoning: 'This is the foundational step where I identify the core requirements and scope of the problem.',
      confidence: 0.95
    },
    {
      id: '2',
      title: 'Research and Information Gathering',
      content: `I should gather relevant information about "${topic}" to provide accurate and up-to-date insights.`,
      status: 'completed',
      timestamp: new Date(baseTime - 25000),
      searchResults: generateSampleSearchResults(topic),
      reasoning: 'Research ensures I provide accurate information based on current best practices and standards.',
      confidence: 0.88
    },
    {
      id: '3',
      title: 'Analysis and Pattern Recognition',
      content: `Now I'll analyze the gathered information to identify patterns, relationships, and key insights related to "${topic}".`,
      status: 'completed',
      timestamp: new Date(baseTime - 20000),
      images: generateSampleImages(topic),
      reasoning: 'Pattern recognition helps me understand the underlying principles and provide more insightful answers.',
      confidence: 0.82,
      subSteps: [
        {
          id: '3.1',
          title: 'Identify Key Concepts',
          content: `Extract the main concepts and principles related to "${topic}".`,
          status: 'completed',
          timestamp: new Date(baseTime - 18000),
          reasoning: 'Understanding core concepts is essential for building a comprehensive response.',
          confidence: 0.90
        },
        {
          id: '3.2',
          title: 'Find Relationships',
          content: `Map the relationships between different concepts and identify dependencies.`,
          status: 'completed',
          timestamp: new Date(baseTime - 15000),
          reasoning: 'Understanding relationships helps provide context and deeper insights.',
          confidence: 0.85
        }
      ]
    },
    {
      id: '4',
      title: 'Solution Generation',
      content: `Based on my analysis, I'll now generate a comprehensive solution or answer for "${topic}".`,
      status: 'thinking',
      timestamp: new Date(baseTime - 10000),
      reasoning: 'This step synthesizes all the gathered information into a coherent and helpful response.',
      confidence: 0.75
    },
    {
      id: '5',
      title: 'Validation and Quality Check',
      content: `I need to validate my solution to ensure it's accurate, complete, and helpful for the user.`,
      status: 'pending',
      reasoning: 'Validation ensures the quality and accuracy of the final response.',
      confidence: 0.0
    }
  ];
};

const generateSampleSearchResults = (topic: string): SearchResult[] => {
  const searchTerms = topic.toLowerCase().split(' ');
  const baseUrl = 'https://example.com';
  
  return [
    {
      id: '1',
      title: `${topic} - Official Documentation`,
      url: `${baseUrl}/docs/${searchTerms.join('-')}`,
      snippet: `Comprehensive documentation about ${topic} including best practices, examples, and implementation guides.`,
      relevanceScore: 0.95
    },
    {
      id: '2',
      title: `${topic} Best Practices Guide`,
      url: `${baseUrl}/best-practices/${searchTerms.join('-')}`,
      snippet: `Learn the industry best practices for ${topic} with real-world examples and case studies.`,
      relevanceScore: 0.88
    },
    {
      id: '3',
      title: `${topic} Tutorial and Examples`,
      url: `${baseUrl}/tutorials/${searchTerms.join('-')}`,
      snippet: `Step-by-step tutorial with practical examples to help you master ${topic}.`,
      relevanceScore: 0.82
    },
    {
      id: '4',
      title: `${topic} Community Discussions`,
      url: `${baseUrl}/community/${searchTerms.join('-')}`,
      snippet: `Community discussions and Q&A about ${topic} with expert insights and solutions.`,
      relevanceScore: 0.75
    }
  ];
};

const generateSampleImages = (topic: string): ThoughtImage[] => {
  const searchTerms = topic.toLowerCase().split(' ');
  
  // Create data URIs for placeholder images to avoid network requests
  const createDataUri = (text: string, color: string) => {
    const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="${color}"/><text x="50%" y="50%" font-family="Arial" font-size="18" fill="white" text-anchor="middle" dy=".3em">${text}</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };
  
  return [
    {
      id: '1',
      url: createDataUri(topic, '#4F46E5'),
      alt: `${topic} Overview Diagram`,
      caption: `High-level overview of ${topic} concepts and relationships`,
      width: 400,
      height: 300
    },
    {
      id: '2',
      url: createDataUri(`${topic} Flow`, '#10B981'),
      alt: `${topic} Process Flow`,
      caption: `Step-by-step process flow for ${topic}`,
      width: 400,
      height: 300
    },
    {
      id: '3',
      url: createDataUri(`${topic} Examples`, '#F59E0B'),
      alt: `${topic} Examples`,
      caption: `Practical examples and use cases for ${topic}`,
      width: 400,
      height: 300
    }
  ];
};

export const generateChainOfThoughtForMessage = (messageContent: string): ThoughtStep[] => {
  // Extract key topics from the message content
  const topics = extractTopics(messageContent);
  const mainTopic = topics[0] || 'the question';
  
  return generateSampleChainOfThought(mainTopic);
};

const extractTopics = (content: string): string[] => {
  // Simple topic extraction - in a real app, this would be more sophisticated
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Return unique words, limited to 3
  return [...new Set(words)].slice(0, 3);
};
