// src/components/PromptLibrary.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface PromptLibraryItem {
  id: string;
  user_id: string;
  content: string;
  created_at: string; // Could also be a Date object
  message_id?: string;
  prompt_template_id?:string;
  model?:string;
}

const PromptLibrary: React.FC = () => {
  const [prompts, setPrompts] = useState<PromptLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPrompts = async () => {
      if (!user) {
        setError("You must be logged in to view your prompt library.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from<PromptLibraryItem>('userPromptLibrary')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          setError(`Error fetching prompts: ${error.message}`);
          console.error("Error fetching prompts:", error);
          return;
        }

        if (data) {
          setPrompts(data);
        } else {
          setPrompts([]); // Set to empty array if no data
        }
      } catch (err: any) {
        setError(`Unexpected error: ${err.message}`);
        console.error("Unexpected error fetching prompts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [user]); // Run when user changes

    if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Prompt Library</h1>
      {prompts.length === 0 ? (
        <p>You haven't saved any prompts yet.</p>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="border p-4 rounded-lg shadow">
              <p className="whitespace-pre-wrap">{prompt.content}</p>
              <p className="text-sm text-gray-500">
                Saved on: {new Date(prompt.created_at).toLocaleString()}
              </p>
              {/* Optionally display message_id and prompt_template_id */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptLibrary;