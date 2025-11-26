import Navbar from './components/Navbar.jsx';
import Landing from './pages/Landing.jsx';
import Footer from './components/Footer.jsx';
import QuestionBank from './pages/QuestionBank.jsx';
import Results from './pages/Results.jsx';
import Questions from './pages/Questions.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import './App.css';
import {
    AdjustmentsHorizontalIcon,
    ArrowRightIcon,
    ArrowTrendingUpIcon,
    BookOpenIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { Routes, Route, Link } from "react-router-dom";
import LoginForm from "./pages/LoginForm.jsx";
import SignupForm from "./pages/SignupForm.jsx";
import AuthLayout from "./components/AuthLayout.jsx";
import MainLayout from "./components/MainLayout.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Profile from "./pages/Profile.jsx";
import './index.css';
import { AuthProvider } from "./context/AuthContext.jsx";
import AdminFeedback from './pages/AdminFeedback.jsx';

// ✅ Correct import for Vercel Analytics in React (NOT Next.js)
import { Analytics } from "@vercel/analytics/react";

function App() {
    return (
        <>
            <AuthProvider>
                <ScrollToTop />

                <Routes>
                    <Route path="/" element={<MainLayout><Landing /></MainLayout>} />
                    <Route path="/questions" element={<MainLayout><QuestionBank /></MainLayout>} />
                    <Route path="/results" element={<MainLayout><Results /></MainLayout>} />
                    <Route path="/questions/:subject/:topicName" element={<MainLayout><Questions /></MainLayout>} />
                    <Route path="/login" element={<AuthLayout><LoginForm /></AuthLayout>} />
                    <Route path="/signup" element={<AuthLayout><SignupForm /></AuthLayout>} />
                    <Route path="/admin/feedback" element={<MainLayout><AdminFeedback /></MainLayout>} />
                    <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
                    <Route path="/community" element={<MainLayout><CommunityPage /></MainLayout>} />
                </Routes>

                {/* ✅ Add Vercel Analytics at root level */}
                <Analytics />
            </AuthProvider>
        </>
    );
}

export default App;
