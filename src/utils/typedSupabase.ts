import { type SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

// Typed Supabase wrapper that returns correctly typed queries while keeping runtime stub behavior
export const typedSupabase = supabase as SupabaseClient;

// Helper to retrieve typed tables
export function fromTable<T>(table: string) {
  return typedSupabase.from<T>(table);
}

// Helper type for extracting row types from tables
export type DBRow<T> = T extends { Row: infer R } ? R : never;

// Type-safe wrappers for common operations
export async function selectRows<T>(table: string) {
  return fromTable<T>(table).select();
}

export async function insertRow<T>(table: string, row: Partial<T>) {
  return fromTable<T>(table).insert(row);
}

export async function updateRow<T>(table: string, row: Partial<T>, match: Record<string, unknown>) {
  return fromTable<T>(table).update(row).match(match);
}

export async function deleteRow<T>(table: string, match: Record<string, unknown>) {
  return fromTable<T>(table).delete().match(match);
}