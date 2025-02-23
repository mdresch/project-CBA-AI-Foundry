import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient'; // Adjust path as needed

const Account = () => {
  const [displayName, setDisplayName] = useState('');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      const { data: userData, error: userError } = await supabase.auth.getSession();

      if (userError) {
        console.error("Error getting user data:", userError);
        navigate('/signin'); //Redirect to Sign In if there are not the proper credentials.
        return;
      }
      if (!userData?.session) {
        console.error("Error getting user data:", userError);
        navigate('/signin'); //Redirect to Sign In if there are not the proper credentials.
        return;
      }

      setUser(userData.session.user); //Gets the session

        const {data, error} = await supabase
            .from('profiles')
            .select(`username, full_name, avatar_url, website`)
            .eq('id', userData.session.user.id)
            .single()

      if (error) {
        console.error("Error getting Profile:", error);
        return;
      }
      //If everything worked properly
        setDisplayName(data?.full_name || '');
    }
        getProfile() //Call the function after it is declared

  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: displayName })
        .eq('id', user.id);

      if (error) {
        setError(error.message);
      } else {
        setMessage('Profile updated successfully!');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      } else {
        navigate('/signin'); // Redirect to sign-in page
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Account</h2>
        {message && <div className="bg-green-100 text-green-500 p-2 rounded-md mb-4">{message}</div>}
        {error && <div className="bg-red-100 text-red-500 p-2 rounded-md mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-gray-700 text-sm font-bold mb-2">Display Name</label>
            <input
              type="text"
              id="displayName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Update Profile
            </button>
            <button
              type="button"
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Account;