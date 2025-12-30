// Comprehensive Analytics System for AI Chat Application
import { supabase } from './supabaseClient';
import { useAuth } from '../context/useAuth';

// Analytics Event Types
export enum AnalyticsEventType {
  // User Actions
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  
  // Chat Interactions
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
  MESSAGE_RETRY = 'message_retry',
  MESSAGE_SAVED = 'message_saved',
  MESSAGE_DELETED = 'message_deleted',
  
  // UI Interactions
  CHAT_STARTED = 'chat_started',
  CHAT_ENDED = 'chat_ended',
  SESSION_CREATED = 'session_created',
  SESSION_VIEWED = 'session_viewed',
  SESSION_DELETED = 'session_deleted',
  
  // Component Interactions
  SUGGESTION_CLICKED = 'suggestion_clicked',
  TEMPLATE_USED = 'template_used',
  CHAIN_OF_THOUGHT_EXPANDED = 'chain_of_thought_expanded',
  CHAIN_OF_THOUGHT_COLLAPSED = 'chain_of_thought_collapsed',
  FILE_UPLOADED = 'file_uploaded',
  MODEL_CHANGED = 'model_changed',
  
  // Navigation
  PAGE_VIEWED = 'page_viewed',
  NAVIGATION_CLICKED = 'navigation_clicked',
  
  // Performance
  LOAD_TIME = 'load_time',
  ERROR_OCCURRED = 'error_occurred',
  API_RESPONSE_TIME = 'api_response_time',
  
  // Engagement
  SCROLL_BEHAVIOR = 'scroll_behavior',
  TYPING_DURATION = 'typing_duration',
  IDLE_TIME = 'idle_time',
  SESSION_DURATION = 'session_duration'
}

// Analytics Event Interface
export interface AnalyticsEvent {
  id?: string;
  userId?: string;
  sessionId?: string;
  eventType: AnalyticsEventType;
  timestamp: Date;
  data: Record<string, any>;
  metadata?: {
    userAgent?: string;
    screenResolution?: string;
    viewport?: string;
    language?: string;
    timezone?: string;
    referrer?: string;
    url?: string;
  };
}

// User Behavior Metrics
export interface UserBehaviorMetrics {
  userId: string;
  sessionId: string;
  totalMessages: number;
  totalSessions: number;
  averageSessionDuration: number;
  averageMessagesPerSession: number;
  mostUsedModel: string;
  mostUsedTemplates: string[];
  averageTypingSpeed: number;
  scrollBehavior: {
    totalScrolls: number;
    averageScrollDepth: number;
    timeSpentScrolling: number;
  };
  engagement: {
    totalTimeSpent: number;
    activeTime: number;
    idleTime: number;
    bounceRate: number;
  };
  preferences: {
    theme: 'light' | 'dark';
    defaultModel: string;
    autoScrollEnabled: boolean;
    notificationsEnabled: boolean;
  };
}

// Session Analytics
export interface SessionAnalytics {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  messageCount: number;
  userMessageCount: number;
  aiMessageCount: number;
  averageResponseTime: number;
  modelsUsed: string[];
  templatesUsed: string[];
  filesUploaded: number;
  chainOfThoughtInteractions: number;
  suggestionClicks: number;
  scrollEvents: number;
  errors: number;
  userJourney: AnalyticsEvent[];
}

// Analytics Service Class
export class AnalyticsService {
  private static instance: AnalyticsService;
  private eventQueue: AnalyticsEvent[] = [];
  private isOnline: boolean = navigator.onLine;
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  private constructor() {
    this.setupOnlineListener();
    this.startBatchFlush();
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Track a single event
  public async trackEvent(
    eventType: AnalyticsEventType,
    data: Record<string, any> = {},
    metadata?: AnalyticsEvent['metadata']
  ): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        eventType,
        timestamp: new Date(),
        data,
        metadata: {
          ...metadata,
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          referrer: document.referrer,
          url: window.location.href,
          ...metadata
        }
      };

      // Add to queue
      this.eventQueue.push(event);

      // Flush if batch size reached
      if (this.eventQueue.length >= this.batchSize) {
        await this.flushEvents();
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Track user behavior metrics
  public async trackUserBehavior(
    userId: string,
    sessionId: string,
    metrics: Partial<UserBehaviorMetrics>
  ): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_behavior_metrics')
        .upsert({
          user_id: userId,
          session_id: sessionId,
          ...metrics,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('User behavior tracking error:', error);
    }
  }

  // Track session analytics
  public async trackSessionAnalytics(sessionAnalytics: SessionAnalytics): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('session_analytics')
        .upsert({
          session_id: sessionAnalytics.sessionId,
          user_id: sessionAnalytics.userId,
          start_time: sessionAnalytics.startTime.toISOString(),
          end_time: sessionAnalytics.endTime?.toISOString(),
          duration: sessionAnalytics.duration,
          message_count: sessionAnalytics.messageCount,
          user_message_count: sessionAnalytics.userMessageCount,
          ai_message_count: sessionAnalytics.aiMessageCount,
          average_response_time: sessionAnalytics.averageResponseTime,
          models_used: sessionAnalytics.modelsUsed,
          templates_used: sessionAnalytics.templatesUsed,
          files_uploaded: sessionAnalytics.filesUploaded,
          chain_of_thought_interactions: sessionAnalytics.chainOfThoughtInteractions,
          suggestion_clicks: sessionAnalytics.suggestionClicks,
          scroll_events: sessionAnalytics.scrollEvents,
          errors: sessionAnalytics.errors,
          user_journey: sessionAnalytics.userJourney,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Session analytics tracking error:', error);
    }
  }

  // Get analytics data
  public async getAnalyticsData(
    userId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    userBehavior: UserBehaviorMetrics[];
    sessionAnalytics: SessionAnalytics[];
    events: AnalyticsEvent[];
  }> {
    try {
      const queries = [];

      // Get user behavior metrics
      let behaviorQuery = supabase
        .from('user_behavior_metrics')
        .select('*');
      
      if (userId) behaviorQuery = behaviorQuery.eq('user_id', userId);
      if (startDate) behaviorQuery = behaviorQuery.gte('created_at', startDate.toISOString());
      if (endDate) behaviorQuery = behaviorQuery.lte('created_at', endDate.toISOString());

      queries.push(behaviorQuery);

      // Get session analytics
      let sessionQuery = supabase
        .from('session_analytics')
        .select('*');
      
      if (userId) sessionQuery = sessionQuery.eq('user_id', userId);
      if (startDate) sessionQuery = sessionQuery.gte('start_time', startDate.toISOString());
      if (endDate) sessionQuery = sessionQuery.lte('start_time', endDate.toISOString());

      queries.push(sessionQuery);

      // Get events
      let eventsQuery = supabase
        .from('analytics_events')
        .select('*');
      
      if (userId) eventsQuery = eventsQuery.eq('user_id', userId);
      if (startDate) eventsQuery = eventsQuery.gte('timestamp', startDate.toISOString());
      if (endDate) eventsQuery = eventsQuery.lte('timestamp', endDate.toISOString());

      queries.push(eventsQuery);

      const [behaviorResult, sessionResult, eventsResult] = await Promise.all(queries);

      return {
        userBehavior: behaviorResult.data || [],
        sessionAnalytics: sessionResult.data || [],
        events: eventsResult.data || []
      };
    } catch (error) {
      console.error('Analytics data retrieval error:', error);
      return {
        userBehavior: [],
        sessionAnalytics: [],
        events: []
      };
    }
  }

  // Private methods
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private startBatchFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, this.flushInterval);
  }

  private async flushEvents(): Promise<void> {
    if (!this.isOnline || this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert(eventsToFlush.map(event => ({
          user_id: event.userId,
          session_id: event.sessionId,
          event_type: event.eventType,
          timestamp: event.timestamp.toISOString(),
          data: event.data,
          metadata: event.metadata
        })));

      if (error) throw error;
    } catch (error) {
      console.error('Analytics flush error:', error);
      // Re-queue events on error
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  // Cleanup
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents();
  }
}

// React Hook for Analytics
export const useAnalytics = () => {
  const analytics = AnalyticsService.getInstance();
  const { user } = useAuth();

  const trackEvent = async (
    eventType: AnalyticsEventType,
    data: Record<string, any> = {},
    metadata?: AnalyticsEvent['metadata']
  ) => {
    await analytics.trackEvent(eventType, data, {
      ...metadata,
      userId: user?.id
    });
  };

  const trackUserBehavior = async (
    sessionId: string,
    metrics: Partial<UserBehaviorMetrics>
  ) => {
    if (user?.id) {
      await analytics.trackUserBehavior(user.id, sessionId, metrics);
    }
  };

  const trackSessionAnalytics = async (sessionAnalytics: SessionAnalytics) => {
    await analytics.trackSessionAnalytics(sessionAnalytics);
  };

  const getAnalyticsData = async (
    startDate?: Date,
    endDate?: Date
  ) => {
    return await analytics.getAnalyticsData(user?.id, startDate, endDate);
  };

  return {
    trackEvent,
    trackUserBehavior,
    trackSessionAnalytics,
    getAnalyticsData
  };
};

// Utility functions
export const createSessionAnalytics = (
  sessionId: string,
  userId: string,
  startTime: Date = new Date()
): SessionAnalytics => ({
  sessionId,
  userId,
  startTime,
  messageCount: 0,
  userMessageCount: 0,
  aiMessageCount: 0,
  averageResponseTime: 0,
  modelsUsed: [],
  templatesUsed: [],
  filesUploaded: 0,
  chainOfThoughtInteractions: 0,
  suggestionClicks: 0,
  scrollEvents: 0,
  errors: 0,
  userJourney: []
});

export const calculateEngagementMetrics = (
  events: AnalyticsEvent[],
  sessionStart: Date,
  sessionEnd: Date
) => {
  const totalDuration = sessionEnd.getTime() - sessionStart.getTime();
  const activeEvents = events.filter(e => 
    e.eventType === AnalyticsEventType.MESSAGE_SENT ||
    e.eventType === AnalyticsEventType.SUGGESTION_CLICKED ||
    e.eventType === AnalyticsEventType.CHAIN_OF_THOUGHT_EXPANDED
  );
  
  const idleTime = totalDuration - (activeEvents.length * 1000); // Rough calculation
  
  return {
    totalTimeSpent: totalDuration,
    activeTime: activeEvents.length * 1000,
    idleTime: Math.max(0, idleTime),
    bounceRate: events.length < 3 ? 1 : 0
  };
};
