import { ThoughtStep, StepInteraction, ChainOfThoughtMetrics } from '../types/chainOfThought';

class ChainOfThoughtAnalytics {
  private static interactions: StepInteraction[] = [];
  private static readonly STORAGE_KEY = 'chain_of_thought_analytics';

  static trackInteraction(interaction: Omit<StepInteraction, 'timestamp'>): void {
    try {
      const fullInteraction: StepInteraction = {
        ...interaction,
        timestamp: new Date()
      };

      this.interactions.push(fullInteraction);
      this.saveToStorage();
      
      // Send to analytics service (in a real app, you'd send to your analytics backend)
      this.sendToAnalytics(fullInteraction);
    } catch (error) {
      console.error('Error tracking interaction:', error);
      // Continue without tracking if analytics fails
    }
  }

  static getMetrics(sessionId?: string): ChainOfThoughtMetrics {
    const relevantInteractions = sessionId 
      ? this.interactions.filter(i => i.sessionId === sessionId)
      : this.interactions;

    const stepCounts = this.getStepClickCounts(relevantInteractions);
    const mostClickedSteps = this.getMostClickedSteps(stepCounts);
    const averageTimeSpent = this.calculateAverageTimeSpent(relevantInteractions);
    const mostValuableSteps = this.calculateStepValue(stepCounts, relevantInteractions);
    const userEngagement = this.calculateUserEngagement(relevantInteractions);

    return {
      totalInteractions: relevantInteractions.length,
      mostClickedSteps,
      averageTimeSpent,
      mostValuableSteps,
      userEngagement
    };
  }

  static getStepInsights(stepId: string): {
    clickCount: number;
    lastClicked: Date | null;
    averageTimeSpent: number;
    userRating: number;
  } {
    const stepInteractions = this.interactions.filter(i => i.stepId === stepId);
    
    return {
      clickCount: stepInteractions.length,
      lastClicked: stepInteractions.length > 0 
        ? new Date(Math.max(...stepInteractions.map(i => i.timestamp.getTime())))
        : null,
      averageTimeSpent: this.calculateAverageTimeSpent(stepInteractions),
      userRating: this.calculateUserRating(stepInteractions)
    };
  }

  static exportAnalytics(): string {
    const metrics = this.getMetrics();
    const interactions = this.interactions;
    
    return JSON.stringify({
      metrics,
      interactions,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  static clearAnalytics(): void {
    this.interactions = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private static getStepClickCounts(interactions: StepInteraction[]): Map<string, number> {
    const counts = new Map<string, number>();
    
    interactions.forEach(interaction => {
      if (interaction.action === 'click' || interaction.action === 'expand') {
        const current = counts.get(interaction.stepId) || 0;
        counts.set(interaction.stepId, current + 1);
      }
    });
    
    return counts;
  }

  private static getMostClickedSteps(stepCounts: Map<string, number>): { stepTitle: string; count: number }[] {
    return Array.from(stepCounts.entries())
      .map(([stepId, count]) => {
        const interaction = this.interactions.find(i => i.stepId === stepId);
        return {
          stepTitle: interaction?.stepTitle || stepId,
          count
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private static calculateAverageTimeSpent(interactions: StepInteraction[]): number {
    if (interactions.length < 2) return 0;
    
    const expandEvents = interactions.filter(i => i.action === 'expand');
    const collapseEvents = interactions.filter(i => i.action === 'collapse');
    
    let totalTime = 0;
    let sessionCount = 0;
    
    expandEvents.forEach(expand => {
      const collapse = collapseEvents.find(c => 
        c.stepId === expand.stepId && 
        c.timestamp > expand.timestamp
      );
      
      if (collapse) {
        totalTime += collapse.timestamp.getTime() - expand.timestamp.getTime();
        sessionCount++;
      }
    });
    
    return sessionCount > 0 ? totalTime / sessionCount / 1000 : 0; // Return seconds
  }

  private static calculateStepValue(stepCounts: Map<string, number>, interactions: StepInteraction[]): { stepTitle: string; valueScore: number }[] {
    const stepValues = new Map<string, number>();
    
    stepCounts.forEach((count, stepId) => {
      const stepInteractions = interactions.filter(i => i.stepId === stepId);
      const timeSpent = this.calculateAverageTimeSpent(stepInteractions);
      const searchClicks = stepInteractions.filter(i => i.action === 'search_result_click').length;
      const imageClicks = stepInteractions.filter(i => i.action === 'image_click').length;
      
      // Calculate value score based on clicks, time spent, and engagement
      const valueScore = (count * 0.4) + (timeSpent * 0.3) + (searchClicks * 0.2) + (imageClicks * 0.1);
      stepValues.set(stepId, valueScore);
    });
    
    return Array.from(stepValues.entries())
      .map(([stepId, valueScore]) => {
        const interaction = interactions.find(i => i.stepId === stepId);
        return {
          stepTitle: interaction?.stepTitle || stepId,
          valueScore
        };
      })
      .sort((a, b) => b.valueScore - a.valueScore)
      .slice(0, 5);
  }

  private static calculateUserEngagement(interactions: StepInteraction[]): 'low' | 'medium' | 'high' {
    const totalInteractions = interactions.length;
    const uniqueSteps = new Set(interactions.map(i => i.stepId)).size;
    const averageTimeSpent = this.calculateAverageTimeSpent(interactions);
    
    // Calculate engagement score
    const engagementScore = (totalInteractions * 0.3) + (uniqueSteps * 0.4) + (averageTimeSpent * 0.3);
    
    if (engagementScore < 5) return 'low';
    if (engagementScore < 15) return 'medium';
    return 'high';
  }

  private static calculateUserRating(interactions: StepInteraction[]): number {
    const totalInteractions = interactions.length;
    const searchClicks = interactions.filter(i => i.action === 'search_result_click').length;
    const imageClicks = interactions.filter(i => i.action === 'image_click').length;
    
    // Simple rating based on engagement depth
    const rating = Math.min(5, (totalInteractions * 0.5) + (searchClicks * 0.3) + (imageClicks * 0.2));
    return Math.round(rating * 10) / 10; // Round to 1 decimal place
  }

  private static saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.interactions));
    } catch (error) {
      console.warn('Failed to save analytics to localStorage:', error);
    }
  }

  private static loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.interactions = JSON.parse(stored).map((i: any) => ({
          ...i,
          timestamp: new Date(i.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load analytics from localStorage:', error);
    }
  }

  private static sendToAnalytics(interaction: StepInteraction): void {
    // In a real application, you would send this to your analytics backend
    // For now, we'll just log it
    console.log('Analytics Event:', interaction);
    
    // Example: Send to analytics service
    // analytics.track('chain_of_thought_interaction', {
    //   stepId: interaction.stepId,
    //   action: interaction.action,
    //   sessionId: interaction.sessionId
    // });
  }
}

// Initialize analytics on load
ChainOfThoughtAnalytics['loadFromStorage']();

export default ChainOfThoughtAnalytics;
