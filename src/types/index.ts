// src/types/index.ts

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string; // Base64 encoded content for text files
  preview?: string; // Base64 encoded preview for images
}

export interface Message {
    id: string;
    session_id?: string;  // Allow null for session_id
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    promptTemplateId?: string; //Make Optional
    model?: string; // Model used for this message
    attachments?: FileAttachment[]; // File attachments
    chainOfThought?: import('../components/ai/ChainOfThought').ThoughtStep[]; // Chain of thought reasoning
  }
  
  export interface ChatSession {
    id: string;
    user_id: string;
    title: string;
    created_at: string;  // Assuming Supabase's `created_at` is a string
    messages: Message[]; //  Include the messages array
  }
  
  export interface PromptTemplateVariable {
      name: string;
      label: string;
      type: 'text' | 'number' | 'select' | 'textarea';
      options?: string[];  // Optional, only for 'select' type
  }
  
  export interface PromptTemplate {
    id: string;
    name: string;
    template: string;
    variables?: PromptTemplateVariable[];
  }
  
  export interface PromptLibraryItem {
    id: string;
    user_id: string;
    content: string;
    created_at: string; // Could also be a Date object
    message_id?: string;
    prompt_template_id?: string;
      model?: string;
  }