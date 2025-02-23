import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';  // Your Supabase client

//Create a type for AuthContext Props
type AuthContextProps = {
  session: any,
  user: any,
  isLoading: boolean,
  error: any
}

// 1. Create a Context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// 2. Create a Provider
export const AuthProvider = ({ children }: any) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let subscription: any = null;

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
              setSession(session);
              setUser(session?.user || null); // Update user based on session
              setIsLoading(false);
            } catch (subscribeError: any) {
              console.error("Error in auth state change handler:", subscribeError);
              setError(subscribeError);
              setIsLoading(false);
            }
          }
        );

        subscription = authListener; // Store the subscription


      } catch (err: any) {
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
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};