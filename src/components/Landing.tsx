import React from 'react';
import { useTheme } from '../context/useTheme';
import { ArrowRight, Brain, Shield, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

function Landing() {
  const { isDarkTheme } = useTheme();

  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Processing',
      description: 'Leverage state-of-the-art language models for intelligent responses and analysis'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security measures ensuring your data remains protected'
    },
    {
      icon: Clock,
      title: 'Rapid Response',
      description: 'Get instant insights and responses to your queries in real-time'
    },
    {
      icon: Users,
      title: 'Collaborative Platform',
      description: 'Share and learn from AI interactions across your organization'
    }
  ];

  return (
    <div className={`min-h-screen pt-16 ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              CBA AI Foundry
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Empowering innovation through intelligent conversation. Your gateway to advanced AI interactions and insights.
            </p>
            <Link
              to="/chat"
              className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-medium transition-colors ${
                isDarkTheme
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              Start Exploring
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-24 ${isDarkTheme ? 'bg-zinc-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Values</h2>
            <p className="text-lg max-w-2xl mx-auto">
              Building the future of AI interaction with a focus on security, efficiency, and innovation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg ${
                  isDarkTheme ? 'bg-zinc-800' : 'bg-gray-50'
                }`}
              >
                <feature.icon className="w-12 h-12 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg max-w-3xl mx-auto">
              To revolutionize the way organizations interact with AI by providing
              a secure, intuitive platform that transforms complex language models
              into actionable business insights.
            </p>
          </div>
        </div>
      </div>

      {/* About LLM Memory */}
      <div className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-semibold mb-4 text-center">How the LLM 'Remembers' — a short explainer</h3>
          <div className={`p-6 rounded-lg ${isDarkTheme ? 'bg-zinc-800 text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
            <p className="mb-3">
              The model itself is intentionally stateless — it doesn't store long-term memory. Instead, applications (like this chat) are responsible for storing and retrieving history from a database (for example Supabase).
            </p>
            <p className="mb-3">
              For large histories we use a Retrieval-Augmented Generation (RAG) pattern: the app stores conversation snippets (often vectorized), searches for the most relevant pieces when you ask a new question, and then includes those snippets in the prompt sent to the model. This keeps the model fast while enabling long-term memory.
            </p>
            <p>
              This separation keeps the LLM scalable and flexible: you can choose the storage and retrieval strategy that suits your needs (Supabase, a dedicated vector DB, Redis, etc.).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing