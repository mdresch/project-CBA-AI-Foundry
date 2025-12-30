// src/utils/supabaseClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Define a minimal partial type for the stub to avoid using `any` everywhere.
type PartialAuth = {
	getSession: () => Promise<{ data: { session: null } }>;
	onAuthStateChange: (cb: (event: string, session: unknown) => void) => { data: { subscription: { unsubscribe: () => void } } };
	signOut: () => Promise<{ error: null }>;
    resetPasswordForEmail: (email: string, options?: { redirectTo?: string }) => Promise<{ data: null; error: null }>;
};

type PartialSupabase = {
	auth: PartialAuth;
	from: (table: string) => { select: () => Promise<unknown> };
};

let supabaseClient: SupabaseClient | PartialSupabase;

if (!supabaseUrl || !supabaseAnonKey) {
	console.warn(
		'Supabase environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are not set. Supabase features will be disabled.'
	);

	const noOp = async () => ({ data: null });
	const stubSubscription = { data: { subscription: { unsubscribe: () => {} } } };

	supabaseClient = {
			auth: {
				getSession: async () => ({ data: { session: null } }),
				onAuthStateChange: () => stubSubscription,
				signOut: async () => ({ error: null }),
                resetPasswordForEmail: async () => ({ data: null, error: null }),
			},
		from: () => ({ select: noOp }),
	};

} else {
	supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;