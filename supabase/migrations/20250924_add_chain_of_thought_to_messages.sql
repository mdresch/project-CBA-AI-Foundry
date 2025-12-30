-- Migration: add chain_of_thought field to messages table

ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS chain_of_thought jsonb;

COMMENT ON COLUMN public.messages.chain_of_thought IS 'JSON data containing the AI reasoning process and chain of thought steps';
