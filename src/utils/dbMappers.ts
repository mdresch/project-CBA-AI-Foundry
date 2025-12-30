import { Message, ChatSession } from '../types';

// DB row shapes returned by Supabase
export interface DBMessageRow {
  id: string;
  content?: string | null;
  role?: string | null;
  created_at?: string | null;
  promptTemplateId?: string | null;
  model?: string | null;
  session_id?: string | null;
  status?: string | null;
  chain_of_thought?: import('../types/chainOfThought').ThoughtStep[] | null;
}

export interface DBSessionRow {
  id: string;
  created_at?: string | null;
  title?: string | null;
  user_id?: string | null;
  messages?: DBMessageRow[] | null;
}

// Helper function to deserialize chain of thought data from database
function deserializeChainOfThought(chainOfThought: any): any {
  if (!chainOfThought || !Array.isArray(chainOfThought)) {
    return chainOfThought;
  }
  
  return chainOfThought.map((step: any) => {
    const deserializedStep = { ...step };
    
    // Convert timestamp string back to Date object
    if (step.timestamp && typeof step.timestamp === 'string') {
      try {
        deserializedStep.timestamp = new Date(step.timestamp);
      } catch (error) {
        console.warn('Invalid timestamp in chain of thought:', step.timestamp);
        delete deserializedStep.timestamp;
      }
    }
    
    // Recursively process sub-steps
    if (step.subSteps && Array.isArray(step.subSteps)) {
      deserializedStep.subSteps = deserializeChainOfThought(step.subSteps);
    }
    
    return deserializedStep;
  });
}

export function mapMessageRow(row: DBMessageRow): Message {
  return {
    id: String(row.id),
    session_id: (row.session_id ?? undefined) as string | undefined,
    content: row.content ?? '',
    role: ((row.role as Message['role']) ?? 'user'),
    timestamp: new Date(row.created_at ?? new Date().toISOString()),
    promptTemplateId: row.promptTemplateId ?? undefined,
    model: row.model ?? undefined,
    chainOfThought: row.chain_of_thought ? deserializeChainOfThought(row.chain_of_thought) : undefined,
  } as Message;
}

export function mapSessionRow(row: DBSessionRow): ChatSession {
  return {
    id: String(row.id),
    user_id: String(row.user_id ?? ''),
    title: String(row.title ?? ''),
    created_at: String(row.created_at ?? new Date().toISOString()),
    messages: (row.messages ?? []).map(mapMessageRow),
  } as ChatSession;
}

export function toDbMessagePayload(msg: Partial<Message>) {
  return {
    id: msg.id,
  session_id: (msg.session_id ?? (msg as unknown as { session_id?: string | null }).session_id ?? null),
    role: msg.role,
    content: msg.content ?? null,
    timestamp: msg.timestamp ? (msg.timestamp instanceof Date ? msg.timestamp.toISOString() : String(msg.timestamp)) : null,
  // promptTemplateId isn't part of the encoded Message type in types/index.ts, read from dynamic field if present
  promptTemplateId: (msg as unknown as { promptTemplateId?: string | null }).promptTemplateId ?? null,
    model: msg.model ?? null,
  };
}

export interface DBPromptLibraryRow {
  id: string;
  user_id?: string | null;
  content?: string | null;
  created_at?: string | null;
  message_id?: string | null;
  prompt_template_id?: string | null;
  model?: string | null;
}

export function mapPromptLibraryRow(row: DBPromptLibraryRow) {
  return {
    id: String(row.id),
    user_id: String(row.user_id ?? ''),
    content: String(row.content ?? ''),
    created_at: String(row.created_at ?? new Date().toISOString()),
    message_id: row.message_id ?? undefined,
    prompt_template_id: row.prompt_template_id ?? undefined,
    model: row.model ?? undefined,
  };
}

export interface DBProfileRow {
  id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  website?: string | null;
}

export function mapProfileRow(row: DBProfileRow) {
  return {
    username: row.username ?? null,
    first_name: row.first_name ?? null,
    last_name: row.last_name ?? null,
    avatar_url: row.avatar_url ?? null,
    website: row.website ?? null,
  };
}
