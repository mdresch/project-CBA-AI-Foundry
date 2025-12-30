import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { mapProfileRow } from '../utils/dbMappers';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface Profile {
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    avatar_url: string | null;
    website: string | null;
}

const Account: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Add a loading state
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      setLoading(true); // Set loading to true when starting to fetch
      try {
        const sessionResp = await supabase.auth.getSession();
        const userData = sessionResp.data;
        const sessionError = 'error' in sessionResp ? (sessionResp as { error?: unknown }).error ?? null : null;

        if (sessionError) {
          console.error("Error getting user data:", sessionError);
          navigate('/signin'); //Redirect to Sign In if not authenticated.
          return;
        }
        if (!userData?.session) {
          console.error("No user session found");
          navigate('/signin'); //Redirect if no session.
          return;
        }

        setUser(userData.session.user);

        const query = (supabase as unknown as SupabaseClient)
          .from('profiles')
          .select(`username, first_name, last_name, avatar_url, website`)
          .eq('id', userData.session.user.id)
          .single();
        const { data, error } = await (query as unknown) as { data: unknown | null; error: Error | null };

        if (error) {
          console.error('Error getting profile:', error);
          setError('Failed to load profile data.'); // Set an error message
          return;
        }

        if (data) {
          const dbRow = data as unknown as import('../utils/dbMappers').DBProfileRow;
          const mapped = mapProfileRow(dbRow);
          setProfile(mapped);
        } else {
          setProfile({ first_name: null, last_name: null, username: null, avatar_url: null, website: null });
        }

      } catch (err: unknown) {
        console.error("Unexpected error:", err);
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setLoading(false); // Set loading to false after fetching, success or failure
      }
    };

    getProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      if (!profile || !user) {
        setError("Profile data is not loaded yet.");
        return;
      }

      const updates: Partial<Profile> = {};
      if (profile.first_name !== undefined) updates.first_name = profile.first_name;
      if (profile.last_name !== undefined) updates.last_name = profile.last_name;
      if (profile.username !== undefined) updates.username = profile.username;
      if (profile.avatar_url !== undefined) updates.avatar_url = profile.avatar_url; //Handle if URL field is empty
      if (profile.website !== undefined) updates.website = profile.website;

      const { error } = await (supabase as unknown as SupabaseClient)
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        setError(error.message);
      } else {
        setMessage('Profile updated successfully!');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

    const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (profile) {
            setProfile({ ...profile, first_name: e.target.value });
        }
    };

    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (profile) {
            setProfile({ ...profile, last_name: e.target.value });
        }
    };
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(profile) {
            setProfile({...profile, username: e.target.value});
        }
    };
    const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(profile){
            setProfile({...profile, website: e.target.value});
        }
    };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      setError("Error signing out. Please try again.");
    } else {
      navigate('/signin');
    }
  };


  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user || !profile) {
    return <div>Unable to load profile. Please try again later.</div>;
  }


  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          {message && <div className="bg-green-100 text-green-700 p-2 rounded-md mb-4">{message}</div>}
          {error && <div className="bg-red-100 text-red-700 p-2 rounded-md mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
            <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  type="text"
                  id="firstName"
                  placeholder="First Name"
                  value={profile.first_name || ""}
                  onChange={handleFirstNameChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  type="text"
                  id="lastName"
                  placeholder="Last Name"
                  value={profile.last_name || ""}
                  onChange={handleLastNameChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  placeholder="Username"
                  value={profile.username || ""}
                  onChange={handleUsernameChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  type="url"
                  id="website"
                  placeholder="https://yourwebsite.com"
                  value={profile.website || ""}
                  onChange={handleWebsiteChange}
                />
                </div>
                </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="submit" onClick={handleSubmit}>Update Profile</Button>
          <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Account;