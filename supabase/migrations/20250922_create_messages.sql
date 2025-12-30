-- Migration: create messages table

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  parent_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  role text NOT NULL,
  content_raw text,
  content text,
  status text NOT NULL DEFAULT 'pending',
  model text,
  tokens integer,
  latency_ms integer,
  provenance jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages (session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at);
CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages (status);
