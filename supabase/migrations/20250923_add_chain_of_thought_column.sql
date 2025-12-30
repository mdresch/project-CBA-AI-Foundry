-- Migration: Add chain_of_thought column to messages table
-- This migration adds a JSONB column to store chain of thought reasoning data

-- Add the chain_of_thought column
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS chain_of_thought jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN public.messages.chain_of_thought IS 'JSON data containing the AI reasoning process and chain of thought steps';

-- Create an index for better query performance on chain_of_thought data
CREATE INDEX IF NOT EXISTS idx_messages_chain_of_thought 
ON public.messages USING GIN (chain_of_thought);

-- Add a check constraint to ensure chain_of_thought is valid JSON
ALTER TABLE public.messages 
ADD CONSTRAINT check_chain_of_thought_is_json 
CHECK (chain_of_thought IS NULL OR jsonb_typeof(chain_of_thought) = 'object');
