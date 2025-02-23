import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Welcome to AI Chat Assistant</h1>
        <p className="text-lg md:text-xl mb-8">
          Your intelligent conversation partner for enhanced productivity. Get instant answers, generate creative content, and automate tasks.
        </p>

        <div className="space-x-4 flex flex-col md:flex-row items-center">
          <Link
            to="/signin"
            aria-label="Sign in to your account"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg mb-2 md:mb-0"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            aria-label="Create a new account"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;