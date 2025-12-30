import { ThoughtStep, SearchResult, ThoughtImage } from '../types/chainOfThought';

export interface ReasoningContext {
  prompt: string;
  response: string;
  model: string;
  timestamp: Date;
  userContext?: {
    previousMessages?: string[];
    userPreferences?: string[];
    domain?: string;
  };
}

export class EnhancedChainOfThoughtGenerator {
  private static readonly REASONING_PATTERNS = {
    analytical: [
      'Problem Analysis',
      'Data Gathering',
      'Pattern Recognition',
      'Hypothesis Formation',
      'Validation',
      'Conclusion Synthesis'
    ],
    creative: [
      'Inspiration Gathering',
      'Ideation',
      'Concept Development',
      'Prototype Thinking',
      'Refinement',
      'Final Concept'
    ],
    technical: [
      'Requirement Analysis',
      'Architecture Design',
      'Implementation Planning',
      'Testing Strategy',
      'Optimization',
      'Deployment'
    ],
    research: [
      'Literature Review',
      'Research Hypothesis Formation',
      'Methodology Design',
      'Data Collection',
      'Analysis',
      'Results Interpretation'
    ]
  };

  private static readonly CONFIDENCE_FACTORS = {
    high: ['definitive', 'certain', 'proven', 'established', 'confirmed'],
    medium: ['likely', 'probable', 'suggests', 'indicates', 'appears'],
    low: ['possibly', 'might', 'could', 'uncertain', 'unclear']
  };

  static generateChainOfThought(context: ReasoningContext): ThoughtStep[] {
    const pattern = this.detectReasoningPattern(context.prompt);
    const steps = this.createStepsFromPattern(pattern, context);
    return this.enhanceStepsWithDetails(steps, context);
  }

  private static detectReasoningPattern(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('analyze') || lowerPrompt.includes('examine') || lowerPrompt.includes('evaluate')) {
      return 'analytical';
    }
    if (lowerPrompt.includes('create') || lowerPrompt.includes('design') || lowerPrompt.includes('imagine')) {
      return 'creative';
    }
    if (lowerPrompt.includes('code') || lowerPrompt.includes('build') || lowerPrompt.includes('implement')) {
      return 'technical';
    }
    if (lowerPrompt.includes('research') || lowerPrompt.includes('study') || lowerPrompt.includes('investigate')) {
      return 'research';
    }
    
    return 'analytical'; // default
  }

  private static createStepsFromPattern(pattern: string, context: ReasoningContext): ThoughtStep[] {
    const stepTitles = this.REASONING_PATTERNS[pattern as keyof typeof this.REASONING_PATTERNS];
    
    return stepTitles.map((title, index) => ({
      id: `step-${index + 1}`,
      title,
      content: this.generateStepContent(title, context, index),
      status: 'completed' as const,
      timestamp: new Date(context.timestamp.getTime() + index * 1000),
      confidence: this.calculateConfidence(context.response, index),
      searchResults: this.generateSearchResults(title, context),
      images: this.generateImages(title, context),
      reasoning: this.generateReasoning(title, context, index),
      subSteps: this.generateSubSteps(title, context, index)
    }));
  }

  private static generateStepContent(title: string, context: ReasoningContext, stepIndex: number): string {
    const templates = {
      'Problem Analysis': `I need to understand the core problem: "${context.prompt}". Let me break this down into key components and identify what the user is really asking for.`,
      'Data Gathering': `I'll gather relevant information about this topic. Based on my training data, I can access knowledge about ${this.extractTopics(context.prompt).join(', ')}.`,
      'Pattern Recognition': `Looking for patterns and relationships in the information. I can see connections between ${this.findConnections(context.prompt)}.`,
      'Hypothesis Formation': `Based on the analysis, I'm forming a hypothesis about the best approach to answer this question.`,
      'Validation': `Let me validate my reasoning by checking for logical consistency and accuracy.`,
      'Conclusion Synthesis': `Synthesizing all the information to provide a comprehensive response.`,
      
      'Inspiration Gathering': `Drawing inspiration from various sources and creative approaches to address: "${context.prompt}".`,
      'Ideation': `Generating multiple creative ideas and approaches for this challenge.`,
      'Concept Development': `Developing the most promising concepts into more detailed solutions.`,
      'Prototype Thinking': `Thinking through how this concept would work in practice.`,
      'Refinement': `Refining the concept based on practical considerations and feedback.`,
      'Final Concept': `Finalizing the creative solution with all refinements applied.`,
      
      'Requirement Analysis': `Analyzing the technical requirements for: "${context.prompt}".`,
      'Architecture Design': `Designing the technical architecture and system structure.`,
      'Implementation Planning': `Planning the step-by-step implementation approach.`,
      'Testing Strategy': `Developing a comprehensive testing strategy.`,
      'Optimization': `Identifying optimization opportunities and performance improvements.`,
      'Deployment': `Planning the deployment and rollout strategy.`,
      
      'Literature Review': `Reviewing relevant literature and research on this topic.`,
      'Research Hypothesis Formation': `Forming a testable hypothesis based on the research.`,
      'Methodology Design': `Designing the research methodology and approach.`,
      'Data Collection': `Planning data collection methods and sources.`,
      'Analysis': `Analyzing the collected data and findings.`,
      'Results Interpretation': `Interpreting the results and drawing conclusions.`
    };

    return templates[title as keyof typeof templates] || `Processing step: ${title}`;
  }

  private static calculateConfidence(response: string, stepIndex: number): number {
    const responseLower = response.toLowerCase();
    let confidence = 0.7; // base confidence

    // Adjust based on response content
    for (const [level, keywords] of Object.entries(this.CONFIDENCE_FACTORS)) {
      const matches = keywords.filter(keyword => responseLower.includes(keyword)).length;
      if (level === 'high') confidence += matches * 0.1;
      else if (level === 'medium') confidence += matches * 0.05;
      else if (level === 'low') confidence -= matches * 0.1;
    }

    // Adjust based on step position (later steps are more confident)
    confidence += stepIndex * 0.05;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private static generateSearchResults(title: string, context: ReasoningContext): SearchResult[] {
    const topics = this.extractTopics(context.prompt);
    const searchResults: SearchResult[] = [];

    topics.forEach((topic, index) => {
      if (index < 3) { // Limit to 3 search results
        searchResults.push({
          id: `search-${index + 1}`,
          title: `Research on ${topic}`,
          url: `https://example.com/research/${topic.toLowerCase().replace(/\s+/g, '-')}`,
          snippet: `Recent research and findings related to ${topic} that support the reasoning in this step.`,
          relevanceScore: 0.9 - (index * 0.1)
        });
      }
    });

    return searchResults;
  }

  private static generateImages(title: string, context: ReasoningContext): ThoughtImage[] {
    const images: ThoughtImage[] = [];

    // Generate relevant images based on the step
    if (title.includes('Analysis') || title.includes('Pattern')) {
      images.push({
        id: 'chart-1',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM0NzVkYSIvPjx0ZXh0IHg9IjEwMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFuYWx5c2lzIENoYXJ0PC90ZXh0Pjwvc3ZnPg==',
        alt: 'Analysis Chart',
        caption: 'Visual representation of the analysis process',
        width: 200,
        height: 100
      });
    }

    if (title.includes('Architecture') || title.includes('Design')) {
      images.push({
        id: 'diagram-1',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzEwYjk4MSIvPjx0ZXh0IHg9IjEwMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFyY2hpdGVjdHVyZTwvdGV4dD48L3N2Zz4=',
        alt: 'Architecture Diagram',
        caption: 'System architecture overview',
        width: 200,
        height: 100
      });
    }

    return images;
  }

  private static generateReasoning(title: string, context: ReasoningContext, stepIndex: number): string {
    const reasoningTemplates = {
      'Problem Analysis': `The user's question "${context.prompt}" requires careful analysis to understand the underlying needs and constraints.`,
      'Data Gathering': `I'm drawing from my training data which includes extensive information about this domain.`,
      'Pattern Recognition': `I can identify patterns and relationships that help structure the response logically.`,
      'Hypothesis Formation': `Based on the analysis, I'm developing a hypothesis about the best approach.`,
      'Research Hypothesis Formation': `Based on the research analysis, I'm developing a testable hypothesis for this investigation.`,
      'Validation': `I'm checking my reasoning for logical consistency and accuracy.`,
      'Conclusion Synthesis': `I'm synthesizing all the information to provide a comprehensive response.`
    };

    return reasoningTemplates[title as keyof typeof reasoningTemplates] || 
           `This step involves ${title.toLowerCase()} to build a comprehensive response.`;
  }

  private static generateSubSteps(title: string, context: ReasoningContext, stepIndex: number): ThoughtStep[] {
    if (stepIndex < 2) return []; // Only add sub-steps to first few steps

    const subStepTitles = [
      'Identify key components',
      'Gather relevant information',
      'Apply logical reasoning'
    ];

    return subStepTitles.map((subTitle, index) => ({
      id: `substep-${stepIndex}-${index + 1}`,
      title: subTitle,
      content: `Sub-step: ${subTitle} for ${title}`,
      status: 'completed' as const,
      timestamp: new Date(context.timestamp.getTime() + stepIndex * 1000 + index * 500),
      confidence: 0.8 - (index * 0.1)
    }));
  }

  private static enhanceStepsWithDetails(steps: ThoughtStep[], context: ReasoningContext): ThoughtStep[] {
    return steps.map(step => ({
      ...step,
      content: this.addContextualDetails(step.content, context),
      searchResults: this.enhanceSearchResults(step.searchResults || [], context),
      images: this.enhanceImages(step.images || [], context)
    }));
  }

  private static addContextualDetails(content: string, context: ReasoningContext): string {
    if (context.userContext?.domain) {
      content += ` This is particularly relevant in the ${context.userContext.domain} domain.`;
    }
    return content;
  }

  private static enhanceSearchResults(searchResults: SearchResult[], context: ReasoningContext): SearchResult[] {
    return searchResults.map(result => ({
      ...result,
      snippet: `${result.snippet} Context: ${context.prompt.substring(0, 100)}...`
    }));
  }

  private static enhanceImages(images: ThoughtImage[], context: ReasoningContext): ThoughtImage[] {
    return images.map(image => ({
      ...image,
      caption: `${image.caption} (Generated for: ${context.prompt.substring(0, 50)}...)`
    }));
  }

  private static extractTopics(prompt: string): string[] {
    // Simple topic extraction - in a real implementation, you'd use NLP
    const words = prompt.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return words
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5);
  }

  private static findConnections(prompt: string): string[] {
    const topics = this.extractTopics(prompt);
    return topics.slice(0, 3);
  }
}

// Export the main function for backward compatibility
export function generateChainOfThoughtForMessage(prompt: string): ThoughtStep[] {
  const context: ReasoningContext = {
    prompt,
    response: '', // This will be filled in later
    model: 'gemini-2.0-flash',
    timestamp: new Date()
  };
  
  return EnhancedChainOfThoughtGenerator.generateChainOfThought(context);
}
