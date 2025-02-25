// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Corrected imports
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import PromptLibrary from './components/PromptLibrary';
import AIHistoryPage from './components/AIHistoryPage';
import Navigation from './components/Navigation';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import PasswordReset from './auth/PasswordReset';
import Account from './auth/Account';
import UpdatePassword from "./auth/UpdatePassword";
import { AuthPage } from './components/AuthPage';
import Landing from './components/Landing';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify'; // Correct import
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { useTheme } from './context/ThemeContext';

function App() {
    const { isDarkTheme } = useTheme();
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <div className="min-h-screen">
                        <Navigation />
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/library" element={<PromptLibrary />} />
                            <Route path="/AIHistory" element={<AIHistoryPage />} />
                            <Route path="/signin" element={<SignIn />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route path="/passwordreset" element={<PasswordReset />} />
                            <Route path="/account" element={<Account />} />
                            <Route path="/update-password" element={<UpdatePassword />} />
                            <Route path="/auth" element={<AuthPage />} />
                        </Routes>
                    </div>
                    <ToastContainer
                        position="bottom-right" // Position of the toast notifications (Best practice is top right)
                        autoClose={5000} // Auto close the toast notifications after 5 seconds (5 seconds is better)
                        hideProgressBar={false} // Show the progress bar
                        newestOnTop={true} // Show the newest toast notifications on top in general better UX true
                        closeOnClick // Close the toast notifications when clicked
                        rtl={false} // Right to left text direction
                        pauseOnFocusLoss // Pause the toast notifications when the window is not focused
                        draggable
                        pauseOnHover
                        theme={isDarkTheme ? "dark" : "light"}
                        limit={3}  // Limit the number of toast notifications to 3
                    />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;