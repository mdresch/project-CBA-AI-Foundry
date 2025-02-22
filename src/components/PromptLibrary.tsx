import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { format } from 'date-fns';
import { Save, Copy, Trash2 } from 'lucide-react';

interface PromptComparison {
  id: string;
  title: string;
  prompt: string;
  response: string;
  category: string;
  date: Date;
}

function PromptLibrary() {
  const { isDarkTheme } = useTheme();
  const [selectedComparison, setSelectedComparison] = useState<PromptComparison | null>(null);
  
  const promptEditor = useEditor({
    extensions: [StarterKit],
    content: selectedComparison?.prompt || '',
    editorProps: {
      attributes: {
        class: `prose max-w-none ${isDarkTheme ? 'prose-invert' : ''} focus:outline-none`,
      },
    },
  });

  const responseEditor = useEditor({
    extensions: [StarterKit],
    content: selectedComparison?.response || '',
    editorProps: {
      attributes: {
        class: `prose max-w-none ${isDarkTheme ? 'prose-invert' : ''} focus:outline-none`,
      },
    },
  });

  // Sample data
  const comparisons: PromptComparison[] = [
    {
      id: '1',
      title: 'Code Review Analysis',
      prompt: 'Review this React component for best practices...',
      response: 'Here are the suggested improvements...',
      category: 'Code',
      date: new Date(),
    },
    {
      id: '2',
      title: 'Content Generation',
      prompt: 'Write a blog post about AI...',
      response: 'Artificial Intelligence has transformed...',
      category: 'Content',
      date: new Date(),
    },
  ];

  return (
    <div className={`min-h-screen pt-16 ${isDarkTheme ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Prompt Library</h1>
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              isDarkTheme
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <Save className="w-4 h-4" />
            Save Current
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className={`lg:col-span-1 rounded-lg shadow-lg ${
            isDarkTheme ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
          }`}>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">Saved Prompts</h2>
              <div className="space-y-4">
                {comparisons.map((comparison) => (
                  <div
                    key={comparison.id}
                    onClick={() => setSelectedComparison(comparison)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      isDarkTheme
                        ? 'bg-zinc-800 hover:bg-zinc-700'
                        : 'bg-gray-50 hover:bg-gray-100'
                    } ${selectedComparison?.id === comparison.id ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <h3 className="font-medium">{comparison.title}</h3>
                    <p className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      {format(comparison.date, 'MMM dd, yyyy')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDarkTheme ? 'bg-zinc-700' : 'bg-gray-200'
                      }`}>
                        {comparison.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Editors */}
          <div className="lg:col-span-3 space-y-8">
            {/* Prompt Editor */}
            <div className={`rounded-lg shadow-lg ${
              isDarkTheme ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
            }`}>
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Prompt</h2>
                  <div className="flex gap-2">
                    <button
                      className={`p-2 rounded-lg ${
                        isDarkTheme ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <EditorContent editor={promptEditor} />
              </div>
            </div>

            {/* Response Editor */}
            <div className={`rounded-lg shadow-lg ${
              isDarkTheme ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
            }`}>
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Response</h2>
                  <div className="flex gap-2">
                    <button
                      className={`p-2 rounded-lg ${
                        isDarkTheme ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <EditorContent editor={responseEditor} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromptLibrary;