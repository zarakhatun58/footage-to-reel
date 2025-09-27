import { useState } from "react";
import { motion } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "./ui/dropdown-menu";
import { googleLogout } from '@react-oauth/google';
import SignInDialog from "./SignInDialog";
import {
    Video,
    Upload,
    FolderOpen,
    PenTool,
    User,
    Menu,
    X,
    Sparkles,
    Play,
    Search,
    LogOut
} from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

interface NavigationProps {
    activeSection?: string;
    onSectionChange?: (section: string) => void;
}

export const Navbar = ({ activeSection, onSectionChange }: NavigationProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const navItems = [
        { icon: Upload, label: "Upload", path: "/upload" },
        { icon: PenTool, label: "Stories", path: "/story-generator" },
        { icon: Search, label: 'Search', path: "/search" },
        { icon: Video, label: "Editor", path: "/editor" },
        { icon: FolderOpen, label: "Projects", path: "/projects" },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = () => {
        try {
            googleLogout();
            localStorage.removeItem('authToken');
            setUser(null);
            // Full page reload to the home page
            window.location.href = "/";
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    const handleSectionChange = (section: string) => {
        if ((section === "upload" || section === "editor") && !user) {
            setShowAuthDialog(true);
            return;
        }
        onSectionChange(section);
    };

    return (
        <div >
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10 bg-[#ffffff]"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <motion.div
                            className="flex items-center space-x-2 cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate("/")}
                        >
                            <div className="relative">
                                <Sparkles className="w-8 h-8 text-primary" />
                                <motion.div
                                    className="absolute inset-0"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                >
                                    <Play className="w-8 h-8 text-primary/50" />
                                </motion.div>
                            </div>
                            <span className="text-xl font-bold gradient-text">VideoFlow</span>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navItems.map((item, index) => (
                                <motion.button
                                    key={item.label}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                                    onClick={() => {
                                        if ((item.label === "Upload" || item.label === "Editor") && !user) {
                                            setShowAuthDialog(true);
                                            return;
                                        }
                                        navigate(item.path);
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </motion.button>
                            ))}
                            {/* <ThemeToggle /> */}
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <User className="w-4 h-4" />
                                            {user.profilePic && (
                                                <img
                                                    src={user.profilePic}
                                                    alt={user.username ?? "User"}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            )}
                                            {user.username ?? "Profile"}
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel className="text-sm">
                                            {user.profilePic && (
                                                <img
                                                    src={user.profilePic}
                                                    alt={user.username ?? "User"}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                            )}
                                            {user.username ?? "Profile"}
                                        </DropdownMenuLabel>
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                                            {user?.email ?? "No email"}
                                        </DropdownMenuLabel>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer">
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button variant="ghost" size="sm" onClick={() => setShowAuthDialog(true)} className="text-gray-600 hover:text-primary bg-gradient-primary hover:opacity-90 transition-opacity">
                                    Sign In
                                </Button>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-white/10 py-4"
                        >
                            {navItems.map((item, index) => (
                                <motion.button
                                    key={item.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center space-x-3 w-full px-4 py-3 text-left text-muted-foreground hover:text-primary hover:bg-white/5 transition-colors rounded-lg"
                                    onClick={() => {
                                        if ((item.label === "Upload" || item.label === "Editor") && !user) {
                                            setShowAuthDialog(true);
                                            return;
                                        }
                                        navigate(item.path);
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </motion.button>
                            ))}
                            <ThemeToggle />
                        </motion.div>
                    )}
                </div>
            </motion.nav>
            {showAuthDialog && (
                <SignInDialog open={true} onClose={() => setShowAuthDialog(false)} />
            )}
        </div>
    );
};