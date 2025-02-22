import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, LayoutDashboard, Library, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function Navigation() {
  const location = useLocation();
  const { isDarkTheme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', icon: MessageSquare, label: 'Chat' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Analytics' },
    { path: '/library', icon: Library, label: 'Prompt Library' },
    { path: '/AIHistory', icon: MessageSquare, label: 'AI History' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b ${
      isDarkTheme ? 'bg-black border-zinc-800' : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                AI Interface
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === path
                      ? isDarkTheme
                        ? 'border-b-2 border-white text-white'
                        : 'border-b-2 border-gray-900 text-gray-900'
                      : isDarkTheme
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${
                isDarkTheme 
                  ? 'bg-white text-black hover:bg-gray-200' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              } transition-colors`}
              aria-label="Toggle theme"
            >
              {isDarkTheme ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;