-- Migration: create message_events table

CREATE TABLE IF NOT EXISTS public.message_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_message_events_message_id ON public.message_events (message_id);
CREATE INDEX IF NOT EXISTS idx_message_events_created_at ON public.message_events (created_at);
