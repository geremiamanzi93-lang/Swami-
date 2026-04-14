import { Link } from 'react-router-dom';
import { Heart, LogOut, User, Menu, X } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useState } from 'react';

const Header = () => {
    const { user, login, logout, isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header 
            className="sticky top-0 z-50 glass-header border-b border-[rgba(116,146,116,0.2)]"
            data-testid="header"
        >
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        className="flex items-center gap-2"
                        data-testid="logo-link"
                    >
                        <Heart 
                            className="w-7 h-7 text-[#2E5339] fill-[#2E5339]" 
                            data-testid="logo-heart"
                        />
                        <span className="text-2xl font-serif font-bold text-[#2E5339]">
                            Cuore Artigiano
                        </span>
                    </Link>

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button 
                                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                                        data-testid="user-menu-trigger"
                                    >
                                        <Avatar className="w-10 h-10 border-2 border-[#749274]">
                                            <AvatarImage 
                                                src={user?.profile_image || user?.picture} 
                                                alt={user?.brand_name || user?.name} 
                                            />
                                            <AvatarFallback className="bg-[#749274] text-white">
                                                {(user?.brand_name || user?.name || 'U').charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-[#4A3018]">
                                            {user?.brand_name || user?.name}
                                        </span>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link 
                                            to="/dashboard" 
                                            className="flex items-center gap-2"
                                            data-testid="dashboard-link"
                                        >
                                            <User className="w-4 h-4" />
                                            Il Mio Profilo
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        onClick={logout}
                                        className="flex items-center gap-2 text-red-600"
                                        data-testid="logout-button"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Esci
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                onClick={login}
                                className="flex items-center gap-2 bg-white border border-[rgba(116,146,116,0.2)] text-[#4A3018] rounded-full px-5 py-2 font-medium hover:bg-[#F9F6F0] transition-colors"
                                data-testid="google-login-button"
                            >
                                <FaGoogle className="w-4 h-4" />
                                Accedi con Google
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        data-testid="mobile-menu-button"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6 text-[#4A3018]" />
                        ) : (
                            <Menu className="w-6 h-6 text-[#4A3018]" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-[rgba(116,146,116,0.2)] pt-4">
                        {isAuthenticated ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border-2 border-[#749274]">
                                        <AvatarImage 
                                            src={user?.profile_image || user?.picture} 
                                            alt={user?.brand_name || user?.name} 
                                        />
                                        <AvatarFallback className="bg-[#749274] text-white">
                                            {(user?.brand_name || user?.name || 'U').charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-[#4A3018]">
                                        {user?.brand_name || user?.name}
                                    </span>
                                </div>
                                <Link 
                                    to="/dashboard" 
                                    className="flex items-center gap-2 text-[#4A3018] py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                    data-testid="mobile-dashboard-link"
                                >
                                    <User className="w-4 h-4" />
                                    Il Mio Profilo
                                </Link>
                                <button 
                                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                                    className="flex items-center gap-2 text-red-600 py-2"
                                    data-testid="mobile-logout-button"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Esci
                                </button>
                            </div>
                        ) : (
                            <Button
                                onClick={login}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-[rgba(116,146,116,0.2)] text-[#4A3018] rounded-full px-5 py-2 font-medium hover:bg-[#F9F6F0] transition-colors"
                                data-testid="mobile-google-login-button"
                            >
                                <FaGoogle className="w-4 h-4" />
                                Accedi con Google
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
