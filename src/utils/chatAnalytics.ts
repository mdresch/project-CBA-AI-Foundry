// Chat-Specific Analytics Tracker
import { AnalyticsService, AnalyticsEventType, useAnalytics } from './analytics';
import { Message } from '../types/ai';

export interface ChatInteractionMetrics {
  messageId: string;
  sessionId: string;
  userId: string;
  messageType: 'user' | 'assistant';
  contentLength: number;
  responseTime?: number;
  model?: string;
  hasAttachments: boolean;
  attachmentTypes: string[];
  chainOfThoughtSteps: number;
  suggestionClicks: number;
  retryCount: number;
  timestamp: Date;
}

export interface ScrollBehaviorMetrics {
  sessionId: string;
  userId: string;
  totalScrolls: number;
  scrollDepth: number;
  timeSpentScrolling: number;
  autoScrollEvents: number;
  manualScrollEvents: number;
  scrollToBottomClicks: number;
  timestamp: Date;
}

export interface TypingBehaviorMetrics {
  sessionId: string;
  userId: string;
  messageId: string;
  typingDuration: number;
  typingSpeed: number; // characters per minute
  pauseCount: number;
  backspaceCount: number;
  timestamp: Date;
}

export class ChatAnalyticsTracker {
  private analytics: AnalyticsService;
  private sessionStartTime: Date;
  private messageStartTime: Date | null = null;
  private typingStartTime: Date | null = null;
  private scrollEvents: number = 0;
  private autoScrollEvents: number = 0;
  private manualScrollEvents: number = 0;
  private scrollToBottomClicks: number = 0;
  private totalScrollDepth: number = 0;
  private scrollStartTime: Date | null = null;

  constructor() {
    this.analytics = AnalyticsService.getInstance();
    this.sessionStartTime = new Date();
  }

  // Message tracking
  public trackMessageSent(message: Message, responseTime?: number): void {
    const metrics: ChatInteractionMetrics = {
      messageId: message.id,
      sessionId: message.sessionId,
      userId: message.userId || '',
      messageType: message.role,
      contentLength: message.content.length,
      responseTime,
      model: message.meta?.model,
      hasAttachments: !!(message.attachments && message.attachments.length > 0),
      attachmentTypes: message.attachments?.map(a => a.type) || [],
      chainOfThoughtSteps: message.chainOfThought?.length || 0,
      suggestionClicks: 0, // Will be updated separately
      retryCount: 0, // Will be updated separately
      timestamp: new Date()
    };

    this.analytics.trackEvent(AnalyticsEventType.MESSAGE_SENT, {
      messageId: message.id,
      sessionId: message.sessionId,
      messageType: message.role,
      contentLength: message.content.length,
      hasAttachments: metrics.hasAttachments,
      attachmentTypes: metrics.attachmentTypes,
      chainOfThoughtSteps: metrics.chainOfThoughtSteps
    });
  }

  public trackMessageReceived(message: Message, responseTime: number): void {
    this.analytics.trackEvent(AnalyticsEventType.MESSAGE_RECEIVED, {
      messageId: message.id,
      sessionId: message.sessionId,
      responseTime,
      model: message.meta?.model,
      contentLength: message.content.length
    });
  }

  public trackMessageRetry(messageId: string, sessionId: string): void {
    this.analytics.trackEvent(AnalyticsEventType.MESSAGE_RETRY, {
      messageId,
      sessionId
    });
  }

  public trackMessageSaved(messageId: string, sessionId: string): void {
    this.analytics.trackEvent(AnalyticsEventType.MESSAGE_SAVED, {
      messageId,
      sessionId
    });
  }

  // Typing behavior tracking
  public startTypingTracking(): void {
    this.typingStartTime = new Date();
  }

  public stopTypingTracking(
    messageId: string,
    sessionId: string,
    userId: string,
    contentLength: number,
    pauseCount: number = 0,
    backspaceCount: number = 0
  ): void {
    if (!this.typingStartTime) return;

    const typingDuration = Date.now() - this.typingStartTime.getTime();
    const typingSpeed = (contentLength / typingDuration) * 60000; // characters per minute

    const metrics: TypingBehaviorMetrics = {
      sessionId,
      userId,
      messageId,
      typingDuration,
      typingSpeed,
      pauseCount,
      backspaceCount,
      timestamp: new Date()
    };

    this.analytics.trackEvent(AnalyticsEventType.TYPING_DURATION, {
      messageId,
      sessionId,
      typingDuration,
      typingSpeed,
      pauseCount,
      backspaceCount
    });

    this.typingStartTime = null;
  }

  // Scroll behavior tracking
  public trackScrollEvent(
    sessionId: string,
    userId: string,
    scrollDepth: number,
    isAutoScroll: boolean = false
  ): void {
    this.scrollEvents++;
    this.totalScrollDepth += scrollDepth;

    if (isAutoScroll) {
      this.autoScrollEvents++;
    } else {
      this.manualScrollEvents++;
    }

    if (!this.scrollStartTime) {
      this.scrollStartTime = new Date();
    }

    this.analytics.trackEvent(AnalyticsEventType.SCROLL_BEHAVIOR, {
      sessionId,
      scrollDepth,
      isAutoScroll,
      totalScrolls: this.scrollEvents
    });
  }

  public trackScrollToBottomClick(sessionId: string, userId: string): void {
    this.scrollToBottomClicks++;
    this.analytics.trackEvent(AnalyticsEventType.SCROLL_BEHAVIOR, {
      sessionId,
      action: 'scroll_to_bottom_click',
      totalClicks: this.scrollToBottomClicks
    });
  }

  public getScrollBehaviorMetrics(sessionId: string, userId: string): ScrollBehaviorMetrics {
    const timeSpentScrolling = this.scrollStartTime 
      ? Date.now() - this.scrollStartTime.getTime() 
      : 0;

    return {
      sessionId,
      userId,
      totalScrolls: this.scrollEvents,
      scrollDepth: this.totalScrollDepth,
      timeSpentScrolling,
      autoScrollEvents: this.autoScrollEvents,
      manualScrollEvents: this.manualScrollEvents,
      scrollToBottomClicks: this.scrollToBottomClicks,
      timestamp: new Date()
    };
  }

  // Chain of Thought tracking
  public trackChainOfThoughtExpanded(
    messageId: string,
    sessionId: string,
    stepCount: number
  ): void {
    this.analytics.trackEvent(AnalyticsEventType.CHAIN_OF_THOUGHT_EXPANDED, {
      messageId,
      sessionId,
      stepCount
    });
  }

  public trackChainOfThoughtCollapsed(
    messageId: string,
    sessionId: string
  ): void {
    this.analytics.trackEvent(AnalyticsEventType.CHAIN_OF_THOUGHT_COLLAPSED, {
      messageId,
      sessionId
    });
  }

  // Suggestion tracking
  public trackSuggestionClicked(
    suggestionId: string,
    sessionId: string,
    suggestionText: string
  ): void {
    this.analytics.trackEvent(AnalyticsEventType.SUGGESTION_CLICKED, {
      suggestionId,
      sessionId,
      suggestionText
    });
  }

  // Template tracking
  public trackTemplateUsed(
    templateId: string,
    sessionId: string,
    templateName: string
  ): void {
    this.analytics.trackEvent(AnalyticsEventType.TEMPLATE_USED, {
      templateId,
      sessionId,
      templateName
    });
  }

  // File upload tracking
  public trackFileUploaded(
    sessionId: string,
    fileType: string,
    fileSize: number,
    fileName: string
  ): void {
    this.analytics.trackEvent(AnalyticsEventType.FILE_UPLOADED, {
      sessionId,
      fileType,
      fileSize,
      fileName
    });
  }

  // Model change tracking
  public trackModelChanged(
    sessionId: string,
    oldModel: string,
    newModel: string
  ): void {
    this.analytics.trackEvent(AnalyticsEventType.MODEL_CHANGED, {
      sessionId,
      oldModel,
      newModel
    });
  }

  // Error tracking
  public trackError(
    sessionId: string,
    errorType: string,
    errorMessage: string,
    stackTrace?: string
  ): void {
    this.analytics.trackEvent(AnalyticsEventType.ERROR_OCCURRED, {
      sessionId,
      errorType,
      errorMessage,
      stackTrace
    });
  }

  // Performance tracking
  public trackLoadTime(
    sessionId: string,
    component: string,
    loadTime: number
  ): void {
    this.analytics.trackEvent(AnalyticsEventType.LOAD_TIME, {
      sessionId,
      component,
      loadTime
    });
  }

  public trackApiResponseTime(
    sessionId: string,
    endpoint: string,
    responseTime: number,
    statusCode: number
  ): void {
    this.analytics.trackEvent(AnalyticsEventType.API_RESPONSE_TIME, {
      sessionId,
      endpoint,
      responseTime,
      statusCode
    });
  }

  // Session tracking
  public trackSessionStart(sessionId: string, userId: string): void {
    this.analytics.trackEvent(AnalyticsEventType.SESSION_CREATED, {
      sessionId,
      userId
    });
  }

  public trackSessionEnd(sessionId: string, userId: string, duration: number): void {
    this.analytics.trackEvent(AnalyticsEventType.SESSION_DURATION, {
      sessionId,
      userId,
      duration
    });
  }

  // Reset tracking for new session
  public reset(): void {
    this.sessionStartTime = new Date();
    this.scrollEvents = 0;
    this.autoScrollEvents = 0;
    this.manualScrollEvents = 0;
    this.scrollToBottomClicks = 0;
    this.totalScrollDepth = 0;
    this.scrollStartTime = null;
    this.typingStartTime = null;
  }
}

// React Hook for Chat Analytics
export const useChatAnalytics = () => {
  const analytics = useAnalytics();
  const tracker = new ChatAnalyticsTracker();

  return {
    tracker,
    trackMessageSent: tracker.trackMessageSent.bind(tracker),
    trackMessageReceived: tracker.trackMessageReceived.bind(tracker),
    trackMessageRetry: tracker.trackMessageRetry.bind(tracker),
    trackMessageSaved: tracker.trackMessageSaved.bind(tracker),
    startTypingTracking: tracker.startTypingTracking.bind(tracker),
    stopTypingTracking: tracker.stopTypingTracking.bind(tracker),
    trackScrollEvent: tracker.trackScrollEvent.bind(tracker),
    trackScrollToBottomClick: tracker.trackScrollToBottomClick.bind(tracker),
    trackChainOfThoughtExpanded: tracker.trackChainOfThoughtExpanded.bind(tracker),
    trackChainOfThoughtCollapsed: tracker.trackChainOfThoughtCollapsed.bind(tracker),
    trackSuggestionClicked: tracker.trackSuggestionClicked.bind(tracker),
    trackTemplateUsed: tracker.trackTemplateUsed.bind(tracker),
    trackFileUploaded: tracker.trackFileUploaded.bind(tracker),
    trackModelChanged: tracker.trackModelChanged.bind(tracker),
    trackError: tracker.trackError.bind(tracker),
    trackLoadTime: tracker.trackLoadTime.bind(tracker),
    trackApiResponseTime: tracker.trackApiResponseTime.bind(tracker),
    trackSessionStart: tracker.trackSessionStart.bind(tracker),
    trackSessionEnd: tracker.trackSessionEnd.bind(tracker),
    getScrollBehaviorMetrics: tracker.getScrollBehaviorMetrics.bind(tracker),
    reset: tracker.reset.bind(tracker)
  };
};
