import { ThoughtStep } from './chainOfThought';

export type Role = 'system' | 'user' | 'assistant' | 'tool'

export type MessageStatus = 'pending' | 'sent' | 'error' | 'done' | 'canceled'

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  content: string // Base64 encoded content
  url?: string
}

export interface Message {
  id: string
  sessionId: string
  parentMessageId?: string | null
  role: Role
  contentRaw: string
  content: string
  status: MessageStatus
  model?: string | null
  tokens?: number | null
  latencyMs?: number | null
  provenance?: Record<string, unknown> | null
  createdAt: string
  updatedAt?: string | null
  deletedAt?: string | null
  chainOfThought?: ThoughtStep[] | null
  attachments?: FileAttachment[]
  promptTemplateId?: string
  timestamp?: Date
  meta?: Record<string, unknown>
  session_id?: string
}

export interface Session {
  id: string
  userId?: string | null
  title?: string | null
  systemPrompt?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
  updatedAt?: string | null
}

export interface ChatRequest {
  sessionId: string
  messages: Array<Partial<Message> & { role: Role; contentRaw: string }>
  stream?: boolean
  systemPrompt?: string | null
}

export interface ChatResponseDelta {
  messageId?: string
  delta?: string
  done?: boolean
  meta?: { model?: string; tokens?: number; latencyMs?: number }
}

export interface ApiError {
  code: string
  message: string
  retryable?: boolean
}

// Suggestion Chips Types
export interface SuggestionChip {
  id: string
  text: string
  category: 'follow-up' | 'clarification' | 'example' | 'related' | 'action'
  confidence?: number
  metadata?: Record<string, unknown>
}

export interface SuggestionGroup {
  id: string
  title: string
  chips: SuggestionChip[]
  category: SuggestionChip['category']
}

export interface SuggestionContext {
  conversationHistory: Message[]
  currentTopic?: string
  userPreferences?: Record<string, unknown>
  lastMessage?: Message
}

// Re-export Chain of Thought types for convenience
export { ThoughtStep, SearchResult, ThoughtImage } from './chainOfThought';