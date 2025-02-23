// In App.tsx (or your main app component)
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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
import { AuthProvider } from './context/AuthContext'; // Import SessionContextProvider

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen">
                    <Navigation/>
                    <Routes>
                        <Route path="/" element={<Landing/>}/>
                        <Route path="/chat" element={<Chat/>}/>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/library" element={<PromptLibrary/>}/>
                        <Route path="/AIHistory" element={<AIHistoryPage/>}/>
                        <Route path="/signin" element={<SignIn/>}/>
                        <Route path="/signup" element={<SignUp/>}/>
                        <Route path="/passwordreset" element={<PasswordReset/>}/>
                        <Route path="/account" element={<Account/>}/>
                        <Route path="/update-password" element={<UpdatePassword/>}/>
                        <Route path="/auth" element={<AuthPage />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;