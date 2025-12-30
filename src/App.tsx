// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChatUI } from './components/ai/ChatUI';
import Dashboard from './components/Dashboard';
import PromptLibrary from './components/PromptLibrary';
import AIHistoryPage from './components/AIHistoryPage';
import Navigation from './components/Navigation';
import Docs from './components/Docs';
import SignIn from './auth/SignIn';
import SignUp from './auth/SignUp';
import PasswordReset from './auth/PasswordReset';
import Account from './auth/Account';
import UpdatePassword from "./auth/UpdatePassword";
import { AuthPage } from './components/AuthPage';
import Landing from './components/Landing';
import { PromptInputDemo } from './components/ai/PromptInputDemo';
import { ActionsDemo } from './components/ai/ActionsDemo';
import { ChainOfThoughtDemo } from './components/ai/ChainOfThoughtDemo';
import { SuggestionChipsDemo } from './components/ai/SuggestionChipsDemo';
import { AISuggestionChipsDemo } from './components/ai/AISuggestionChipsDemo';
import { AutoScrollConversationDemo } from './components/ai/AutoScrollConversationDemo';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <div className="min-h-screen">
                    <Navigation />
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/chat" element={<ChatUI />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/library" element={<PromptLibrary />} />
                        <Route path="/AIHistory" element={<AIHistoryPage />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/passwordreset" element={<PasswordReset />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/update-password" element={<UpdatePassword />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/docs" element={<Docs />} />
                        <Route path="/prompt-demo" element={<PromptInputDemo />} />
                        <Route path="/actions-demo" element={<ActionsDemo />} />
                        <Route path="/chain-of-thought-demo" element={<ChainOfThoughtDemo />} />
                        <Route path="/suggestion-chips-demo" element={<SuggestionChipsDemo />} />
                        <Route path="/ai-suggestion-chips-demo" element={<AISuggestionChipsDemo />} />
                        <Route path="/auto-scroll-conversation-demo" element={<AutoScrollConversationDemo />} />
                        <Route path="/analytics" element={<AnalyticsDashboard />} />
                    </Routes>
                </div>
                <ToastProvider />
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;