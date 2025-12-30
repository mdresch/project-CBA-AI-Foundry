import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';  // Your Supabase client
import { AuthContext } from './authContextValue';

// 2. Create a Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<unknown | null>(null);
  const [user, setUser] = useState<unknown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
  let subscription: { data?: { subscription?: { unsubscribe: () => void } } } | null = null;

    const fetchSession = async () => {
      try {
        const { data: { session }, error: initialError } = await supabase.auth.getSession();
        if (initialError) {
          console.error("Error fetching initial session:", initialError);
          setError(initialError);
        }

        setSession(session);
        setUser(session?.user || null); // Set user based on session
        setIsLoading(false);

        // Subscribe to auth state changes
        const authListener = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            try {
              setSession(session as unknown);
              const sess = session as Record<string, unknown> | null;
              if (sess && 'user' in sess) {
                setUser((sess as { user?: unknown }).user || null);
              } else {
                setUser(null);
              }
              setIsLoading(false);
            } catch (subscribeError: unknown) {
              console.error("Error in auth state change handler:", subscribeError);
              setError(subscribeError);
              setIsLoading(false);
            }
          }
        );

        subscription = authListener; // Store the subscription


      } catch (err: unknown) {
        console.error("Unexpected error in auth provider:", err);
        setError(err);
        setIsLoading(false);
      }
    };

    fetchSession();

    // Cleanup function to unsubscribe on unmount
    return () => {
      if (subscription && subscription.data && subscription.data.subscription) {
        subscription.data.subscription.unsubscribe();
      }
    };
  }, []);

  const value = { session, user, isLoading, error };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook to use the context
// Note: useAuth hook moved to './useAuth.ts' to keep this file exporting only the provider component.