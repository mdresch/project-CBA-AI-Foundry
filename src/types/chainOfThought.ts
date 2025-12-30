export interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  relevanceScore?: number;
}

export interface ThoughtImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ThoughtStep {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'thinking' | 'completed' | 'error';
  timestamp?: Date;
  searchResults?: SearchResult[];
  images?: ThoughtImage[];
  reasoning?: string;
  confidence?: number; // 0-1
  subSteps?: ThoughtStep[];
}

export interface StepInteraction {
  stepId: string;
  stepTitle: string;
  action: 'expand' | 'collapse' | 'click' | 'search_result_click' | 'image_click';
  timestamp: Date;
  sessionId: string;
  messageId: string;
}

export interface ChainOfThoughtMetrics {
  totalInteractions: number;
  mostClickedSteps: { stepTitle: string; count: number }[];
  averageTimeSpent: number;
  mostValuableSteps: { stepTitle: string; valueScore: number }[];
  userEngagement: 'low' | 'medium' | 'high';
}
