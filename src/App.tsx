// In App.tsx (or your main app component)
import React, { useEffect } from 'react';
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
import {supabase} from "./supabaseClient"; //Import Supabase so Auth can be confirmed

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen">
                <Navigation/>
                <Routes>
                    <Route path="/" element={<Chat/>}/>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/library" element={<PromptLibrary/>}/>
                    <Route path="/AIHistory" element={<AIHistoryPage/>}/>
                    <Route path="/signin" element={<SignIn/>}/>
                    <Route path="/signup" element={<SignUp/>}/>
                    <Route path="/passwordreset" element={<PasswordReset/>}/>
                    <Route path="/account" element={<Account/>}/>
                    {/*  Add this new Route  */}
                    <Route path="/update-password" element={<UpdatePassword/>}/>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App