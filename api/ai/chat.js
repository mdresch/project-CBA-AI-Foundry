import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { toDbMessagePayload } from '../../src/utils/dbMappers.js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// Minimal JS serverless handler with an in-memory fallback when SUPABASE env vars are not set.
// Exports default(req, res) for the local shim to call.

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin = null
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
}

// Lightweight toDbMessagePayload equivalent
function toDbMessagePayload(msg = {}) {
  return {
    id: msg.id,
    session_id: msg.sessionId,
    parent_message_id: msg.parentMessageId ?? null,
    role: msg.role,
    content_raw: msg.contentRaw ?? msg.content,
    content: msg.content ?? msg.contentRaw,
    status: msg.status ?? 'pending',
    model: msg.model ?? null,
    tokens: msg.tokens ?? null,
    latency_ms: msg.latencyMs ?? null,
    provenance: msg.provenance ?? null,
    created_at: msg.createdAt,
    updated_at: msg.updatedAt ?? null,
    deleted_at: msg.deletedAt ?? null,
  }
}

// Map a DB message row to a runtime Message-like object
function mapMessageRow(row = {}) {
  return {
    id: String(row.id),
    sessionId: row.session_id ?? row.sessionId ?? null,
    content: row.content ?? row.content_raw ?? '',
    role: row.role ?? 'user',
    timestamp: row.timestamp ? new Date(row.timestamp) : new Date(),
    promptTemplateId: row.promptTemplateId ?? row.prompt_template_id ?? undefined,
    model: row.model ?? undefined,
  };
}

// In-memory fallback store (only used when no supabase env configured)
const _inMemory = {
  messages: [],
}

async function insertMessageToDb(payload) {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('messages').insert(payload).select('*').single()
    if (error) throw error
    return data
  } else {
    // simulate DB insert
    _inMemory.messages.push(payload)
    return payload
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { sessionId, message } = body

    if (!sessionId || !message || !message.contentRaw) {
      res.status(400).json({ error: 'Missing sessionId or message.contentRaw' })
      return
    }

    // Create optimistic user message
    const userTempId = randomUUID()
    const now = new Date().toISOString()
    const userMessage = {
      id: userTempId,
      sessionId,
      role: message.role ?? 'user',
      contentRaw: message.contentRaw,
      content: message.contentRaw,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }

  const userPayload = toDbMessagePayload(userMessage)
  const insertedUser = await insertMessageToDb(userPayload)

    // Create canned assistant response
    const assistantId = randomUUID()
    const assistantNow = new Date().toISOString()
    const cannedContent = 'Hello! This is a canned assistant response from the local API.'

    const assistantMessage = {
      id: assistantId,
      sessionId,
      role: 'assistant',
      contentRaw: cannedContent,
      content: cannedContent,
      status: 'done',
      model: 'local-canned',
      tokens: 0,
      createdAt: assistantNow,
      updatedAt: assistantNow,
    }

  const assistantPayload = toDbMessagePayload(assistantMessage)
  const insertedAssistant = await insertMessageToDb(assistantPayload)

    // Finalize user message (mark done)
    if (supabaseAdmin) {
      await supabaseAdmin.from('messages').update({ status: 'done', updated_at: new Date().toISOString() }).eq('id', userTempId)
    } else {
      // update in-memory
      const m = _inMemory.messages.find((x) => x.id === userTempId)
      if (m) m.status = 'done'
    }

  // Map DB rows to consistent runtime domain objects
  const userMapped = supabaseAdmin ? mapMessageRow(insertedUser) : insertedUser
  const assistantMapped = supabaseAdmin ? mapMessageRow(insertedAssistant) : insertedAssistant
  res.status(200).json({ user: userMapped, assistant: assistantMapped })
  } catch (err) {
    console.error('api/ai/chat.js error', err)
    res.status(500).json({ error: err?.message ?? String(err) })
  }
}
