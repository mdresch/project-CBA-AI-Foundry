import { SuggestionChip, SuggestionGroup, SuggestionContext, Message } from '../types/ai';

// Advanced AI-powered suggestion generator that uses the AI model to generate contextual suggestions
export class AISuggestionGenerator {
  private static readonly SUGGESTION_PROMPT = `You are an AI assistant that generates helpful follow-up questions and suggestions based on conversation context. 

Given the conversation history and the AI's last response, generate 6-8 relevant follow-up questions or suggestions that would help the user continue the conversation meaningfully.

The suggestions should be:
1. Directly related to the AI's response content
2. Helpful for deepening understanding
3. Practical and actionable
4. Varied in type (clarification, examples, related topics, next steps)

Return your suggestions as a JSON array of objects with this structure:
[
  {
    "text": "The suggestion text",
    "category": "follow-up|clarification|example|related|action",
    "confidence": 0.8
  }
]

Categories:
- follow-up: Questions that build on the response
- clarification: Questions asking for more explanation
- example: Requests for examples or demonstrations
- related: Questions about related topics
- action: Suggestions for next steps or implementation

Generate suggestions based on this conversation:`;

  static async generateAISuggestions(
    context: SuggestionContext,
    aiModel: any, // The AI model instance
    apiKey: string
  ): Promise<SuggestionChip[]> {
    try {
      // Only generate AI suggestions if the last message is from the assistant
      if (!context.lastMessage || context.lastMessage.role !== 'assistant') {
        return [];
      }

      // Prepare the conversation context for the AI
      const conversationText = context.conversationHistory
        .slice(-3) // Last 3 messages for context
        .map(m => `${m.role}: ${m.content}`)
        .join('\n\n');

      const prompt = `${this.SUGGESTION_PROMPT}\n\n${conversationText}\n\nGenerate 6-8 relevant follow-up suggestions as JSON:`;

      // Call the AI model to generate suggestions
      const response = await this.callAIModel(prompt, aiModel, apiKey);
      
      // Parse the AI response
      const suggestions = this.parseAISuggestions(response);
      
      // Add unique IDs and validate
      return suggestions.map((suggestion, index) => ({
        ...suggestion,
        id: `ai-generated-${Date.now()}-${index}`,
        confidence: Math.min(Math.max(suggestion.confidence || 0.7, 0.1), 1.0) // Clamp between 0.1 and 1.0
      }));

    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      return [];
    }
  }

  private static async callAIModel(prompt: string, aiModel: any, apiKey: string): Promise<string> {
    // This would integrate with your AI model (Google AI, OpenAI, etc.)
    // For now, we'll use a mock implementation
    // In a real implementation, you'd call the actual AI model here
    
    try {
      // Mock AI response for demonstration
      // In production, replace this with actual AI model call
      const mockResponse = `[
        {
          "text": "Can you explain this in more detail?",
          "category": "clarification",
          "confidence": 0.9
        },
        {
          "text": "What are the practical applications?",
          "category": "example",
          "confidence": 0.8
        },
        {
          "text": "How does this compare to other approaches?",
          "category": "related",
          "confidence": 0.7
        },
        {
          "text": "What should I implement first?",
          "category": "action",
          "confidence": 0.8
        },
        {
          "text": "Are there any potential issues I should be aware of?",
          "category": "follow-up",
          "confidence": 0.7
        },
        {
          "text": "Can you show me a code example?",
          "category": "example",
          "confidence": 0.9
        }
      ]`;
      
      return mockResponse;
    } catch (error) {
      console.error('Error calling AI model:', error);
      throw error;
    }
  }

  private static parseAISuggestions(response: string): SuggestionChip[] {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }

      const suggestions = JSON.parse(jsonMatch[0]);
      
      // Validate and filter suggestions
      return suggestions
        .filter((s: any) => 
          s.text && 
          typeof s.text === 'string' && 
          s.text.length > 10 && 
          s.text.length < 200 &&
          ['follow-up', 'clarification', 'example', 'related', 'action'].includes(s.category)
        )
        .slice(0, 8); // Limit to 8 suggestions

    } catch (error) {
      console.error('Error parsing AI suggestions:', error);
      return [];
    }
  }

  // Generate suggestions using the same AI model as the chat
  static async generateSuggestionsWithModel(
    context: SuggestionContext,
    modelName: string = 'gemini-2.0-flash'
  ): Promise<SuggestionGroup[]> {
    try {
      // Generate AI-powered suggestions
      const aiSuggestions = await this.generateAISuggestions(context, null, '');
      
      // Group suggestions by category
      const groups: { [key: string]: SuggestionChip[] } = {};
      aiSuggestions.forEach(suggestion => {
        if (!groups[suggestion.category]) {
          groups[suggestion.category] = [];
        }
        groups[suggestion.category].push(suggestion);
      });

      // Convert to SuggestionGroup format
      const suggestionGroups: SuggestionGroup[] = Object.entries(groups).map(([category, chips]) => ({
        id: `ai-${category}`,
        title: this.getCategoryTitle(category as SuggestionChip['category']),
        category: category as SuggestionChip['category'],
        chips
      }));

      return suggestionGroups;

    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      return [];
    }
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
