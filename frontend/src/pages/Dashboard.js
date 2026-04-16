
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from "../components/ui/sonner";
import Home from "./Home";
import Dashboard from "./Dashboard";
import ArtisanProfile from "./ArtisanProfile";
import WorkDetail from "./WorkDetail";
import AuthCallback from "./AuthCallback";

function AppRouter() {
    const location = useLocation();
    
    // Check URL fragment for session_id - must be synchronous
    if (location.hash?.includes('session_id=')) {
        return <AuthCallback />;
    }
    
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/artisan/:userId" element={<ArtisanProfile />} />
            <Route path="/work/:workId" element={<WorkDetail />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRouter />
                <Toaster position="top-center" />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
