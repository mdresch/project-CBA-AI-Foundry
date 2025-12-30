import { SuggestionChip, SuggestionGroup, SuggestionContext, Message } from '../types/ai';

// Predefined suggestion templates based on conversation context
const SUGGESTION_TEMPLATES = {
  followUp: [
    "Can you explain that in more detail?",
    "What are the next steps?",
    "How does this work?",
    "Can you give me an example?",
    "What are the alternatives?",
    "How can I implement this?",
    "What are the best practices?",
    "Can you break this down further?",
    "What should I consider?",
    "How do I get started?"
  ],
  clarification: [
    "I don't understand this part",
    "Can you clarify what you mean?",
    "What does this term mean?",
    "Can you explain it differently?",
    "I need more context",
    "What are you referring to?",
    "Can you be more specific?",
    "I'm confused about...",
    "What's the difference between...?",
    "Can you simplify this?"
  ],
  example: [
    "Show me a code example",
    "Give me a real-world example",
    "Can you demonstrate this?",
    "What does this look like in practice?",
    "Show me the syntax",
    "Give me a sample implementation",
    "What's a concrete example?",
    "How would I use this?",
    "Show me the output",
    "What's the expected result?"
  ],
  related: [
    "What else should I know?",
    "Are there related topics?",
    "What's similar to this?",
    "What comes next?",
    "What are the prerequisites?",
    "What builds on this?",
    "Are there variations?",
    "What's the opposite approach?",
    "What are the alternatives?",
    "What's the history of this?"
  ],
  action: [
    "Let's try this",
    "I want to implement this",
    "Help me get started",
    "Let's build something",
    "I want to test this",
    "Let's create an example",
    "I want to learn more",
    "Let's explore this further",
    "I want to practice",
    "Let's dive deeper"
  ]
};

// Context-aware suggestion patterns
const CONTEXT_PATTERNS = {
  technical: {
    keywords: ['code', 'programming', 'function', 'class', 'method', 'algorithm', 'API', 'database', 'framework'],
    suggestions: [
      "Can you show me the code?",
      "What's the time complexity?",
      "How do I optimize this?",
      "What are the edge cases?",
      "How do I test this?"
    ]
  },
  creative: {
    keywords: ['design', 'creative', 'art', 'writing', 'story', 'idea', 'brainstorm', 'inspiration'],
    suggestions: [
      "Give me some creative ideas",
      "What are some variations?",
      "How can I make this unique?",
      "What's a fresh perspective?",
      "Can you help me brainstorm?"
    ]
  },
  analytical: {
    keywords: ['analyze', 'data', 'research', 'study', 'compare', 'evaluate', 'metrics', 'statistics'],
    suggestions: [
      "What does the data show?",
      "How do I interpret this?",
      "What are the trends?",
      "Can you help me analyze?",
      "What are the key insights?"
    ]
  },
  problemSolving: {
    keywords: ['problem', 'issue', 'error', 'bug', 'fix', 'solve', 'troubleshoot', 'debug'],
    suggestions: [
      "How do I fix this?",
      "What's causing the issue?",
      "How do I debug this?",
      "What are the solutions?",
      "How do I prevent this?"
    ]
  }
};

export class SuggestionGenerator {
  private static generateContextualSuggestions(context: SuggestionContext): SuggestionChip[] {
    const suggestions: SuggestionChip[] = [];
    const lastMessage = context.lastMessage;
    const conversationHistory = context.conversationHistory;
    
    if (!lastMessage) {
      return this.getDefaultSuggestions();
    }

    // Analyze conversation context
    const conversationText = conversationHistory
      .slice(-5) // Last 5 messages
      .map(m => m.content)
      .join(' ')
      .toLowerCase();

    // Determine context type
    let contextType = 'general';
    for (const [type, pattern] of Object.entries(CONTEXT_PATTERNS)) {
      if (pattern.keywords.some(keyword => conversationText.includes(keyword))) {
        contextType = type;
        break;
      }
    }

    // Generate AI-powered suggestions based on the last AI response
    const aiPoweredSuggestions = this.generateAIResponseBasedSuggestions(lastMessage, conversationHistory);
    
    // Generate suggestions based on context
    const baseSuggestions = this.getBaseSuggestions(contextType);
    const contextualSuggestions = this.getContextualSuggestions(conversationText, lastMessage);
    
    // Combine and deduplicate, prioritizing AI-powered suggestions
    const allSuggestions = [...aiPoweredSuggestions, ...baseSuggestions, ...contextualSuggestions];
    const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text === suggestion.text)
    );

    return uniqueSuggestions.slice(0, 8); // Limit to 8 suggestions
  }

  private static getDefaultSuggestions(): SuggestionChip[] {
    return [
      {
        id: 'default-1',
        text: "Hello! How can I help you today?",
        category: 'follow-up',
        confidence: 0.9
      },
      {
        id: 'default-2',
        text: "What would you like to know?",
        category: 'follow-up',
        confidence: 0.9
      },
      {
        id: 'default-3',
        text: "Can you explain something to me?",
        category: 'clarification',
        confidence: 0.8
      }
    ];
  }

  private static getBaseSuggestions(contextType: string): SuggestionChip[] {
    const suggestions: SuggestionChip[] = [];
    
    // Add context-specific suggestions
    if (contextType !== 'general') {
      const pattern = CONTEXT_PATTERNS[contextType as keyof typeof CONTEXT_PATTERNS];
      pattern.suggestions.forEach((text, index) => {
        suggestions.push({
          id: `${contextType}-${index}`,
          text,
          category: 'follow-up',
          confidence: 0.8
        });
      });
    }

    // Add general follow-up suggestions
    SUGGESTION_TEMPLATES.followUp.slice(0, 3).forEach((text, index) => {
      suggestions.push({
        id: `follow-up-${index}`,
        text,
        category: 'follow-up',
        confidence: 0.7
      });
    });

    return suggestions;
  }

  private static getContextualSuggestions(conversationText: string, lastMessage: Message): SuggestionChip[] {
    const suggestions: SuggestionChip[] = [];
    
    // Extract key topics from conversation
    const topics = this.extractTopics(conversationText);
    
    // Generate topic-specific suggestions
    topics.forEach((topic, index) => {
      suggestions.push({
        id: `topic-${index}`,
        text: `Tell me more about ${topic}`,
        category: 'related',
        confidence: 0.6
      });
    });

    // Generate clarification suggestions based on last message
    if (lastMessage.role === 'assistant' && lastMessage.content.length > 100) {
      suggestions.push({
        id: 'clarify-1',
        text: "Can you summarize the key points?",
        category: 'clarification',
        confidence: 0.7
      });
    }

    // Generate example requests for technical content
    if (conversationText.includes('code') || conversationText.includes('programming')) {
      suggestions.push({
        id: 'example-1',
        text: "Can you show me a code example?",
        category: 'example',
        confidence: 0.8
      });
    }

    return suggestions;
  }

  private static extractTopics(text: string): string[] {
    // Simple topic extraction - in a real implementation, this would be more sophisticated
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they']);
    
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 3 && !commonWords.has(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });

    return Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);
  }

  // Generate AI-powered suggestions based on the AI's response
  private static generateAIResponseBasedSuggestions(lastMessage: Message, conversationHistory: Message[]): SuggestionChip[] {
    const suggestions: SuggestionChip[] = [];
    
    // Only generate AI-powered suggestions if the last message is from the assistant
    if (lastMessage.role !== 'assistant') {
      return suggestions;
    }

    const aiResponse = lastMessage.content;
    const responseLength = aiResponse.length;
    
    // Analyze the AI response content
    const responseAnalysis = this.analyzeAIResponse(aiResponse);
    
    // Generate follow-up questions based on response analysis
    if (responseAnalysis.hasCode) {
      suggestions.push({
        id: 'ai-code-1',
        text: 'Can you explain this code step by step?',
        category: 'follow-up',
        confidence: 0.9
      });
      suggestions.push({
        id: 'ai-code-2',
        text: 'How can I optimize this code?',
        category: 'follow-up',
        confidence: 0.8
      });
    }

    if (responseAnalysis.hasAlgorithm) {
      suggestions.push({
        id: 'ai-algo-1',
        text: 'What\'s the time complexity of this approach?',
        category: 'follow-up',
        confidence: 0.9
      });
      suggestions.push({
        id: 'ai-algo-2',
        text: 'Are there alternative algorithms I could use?',
        category: 'follow-up',
        confidence: 0.8
      });
    }

    if (responseAnalysis.hasSteps) {
      suggestions.push({
        id: 'ai-steps-1',
        text: 'What should I do first?',
        category: 'action',
        confidence: 0.9
      });
      suggestions.push({
        id: 'ai-steps-2',
        text: 'Can you break this down into smaller tasks?',
        category: 'clarification',
        confidence: 0.8
      });
    }

    if (responseAnalysis.hasExamples) {
      suggestions.push({
        id: 'ai-example-1',
        text: 'Can you show me a real-world example?',
        category: 'example',
        confidence: 0.9
      });
    }

    if (responseAnalysis.hasConcepts) {
      suggestions.push({
        id: 'ai-concept-1',
        text: 'Can you explain this concept in simpler terms?',
        category: 'clarification',
        confidence: 0.8
      });
      suggestions.push({
        id: 'ai-concept-2',
        text: 'What are the key principles here?',
        category: 'follow-up',
        confidence: 0.7
      });
    }

    // Generate contextual follow-ups based on specific topics mentioned
    if (responseAnalysis.topics.length > 0) {
      responseAnalysis.topics.forEach((topic, index) => {
        suggestions.push({
          id: `ai-topic-${index}`,
          text: `Tell me more about ${topic}`,
          category: 'related',
          confidence: 0.7
        });
      });
    }

    // Generate questions based on response length and complexity
    if (responseLength > 500) {
      suggestions.push({
        id: 'ai-summary-1',
        text: 'Can you summarize the key points?',
        category: 'clarification',
        confidence: 0.8
      });
    }

    if (responseAnalysis.hasQuestions) {
      suggestions.push({
        id: 'ai-question-1',
        text: 'What questions should I be asking?',
        category: 'follow-up',
        confidence: 0.7
      });
    }

    return suggestions;
  }

  // Analyze AI response to extract features for suggestion generation
  private static analyzeAIResponse(response: string): {
    hasCode: boolean;
    hasAlgorithm: boolean;
    hasSteps: boolean;
    hasExamples: boolean;
    hasConcepts: boolean;
    hasQuestions: boolean;
    topics: string[];
  } {
    const lowerResponse = response.toLowerCase();
    
    return {
      hasCode: /```|function|class|const|let|var|def |import|from|#include/.test(response),
      hasAlgorithm: /algorithm|complexity|big o|o\(|time complexity|space complexity|sort|search|tree|graph/.test(lowerResponse),
      hasSteps: /step \d+|first|second|third|next|then|finally|1\.|2\.|3\./.test(lowerResponse),
      hasExamples: /example|for instance|such as|like|e\.g\.|for example/.test(lowerResponse),
      hasConcepts: /concept|principle|theory|idea|notion|understanding/.test(lowerResponse),
      hasQuestions: /\?|what if|how about|have you considered/.test(response),
      topics: this.extractTopics(response)
    };
  }

  static generateSuggestions(context: SuggestionContext): SuggestionGroup[] {
    const chips = this.generateContextualSuggestions(context);
    
    // Group suggestions by category
    const groups: { [key: string]: SuggestionChip[] } = {};
    chips.forEach(chip => {
      if (!groups[chip.category]) {
        groups[chip.category] = [];
      }
      groups[chip.category].push(chip);
    });

    // Convert to SuggestionGroup format
    const suggestionGroups: SuggestionGroup[] = Object.entries(groups).map(([category, chips]) => ({
      id: category,
      title: this.getCategoryTitle(category as SuggestionChip['category']),
      category: category as SuggestionChip['category'],
      chips
    }));

    return suggestionGroups;
  }

  private static getCategoryTitle(category: SuggestionChip['category']): string {
    switch (category) {
      case 'follow-up':
        return 'Follow-up';
      case 'clarification':
        return 'Clarify';
      case 'example':
        return 'Examples';
      case 'related':
        return 'Related';
      case 'action':
        return 'Actions';
      default:
        return 'Suggestions';
    }
  }
}
