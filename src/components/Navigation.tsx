import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Search, Sparkles, Upload, Menu, X, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { googleLogout } from '@react-oauth/google';
import { useNavigate } from "react-router-dom";
import SignInDialog from "./SignInDialog";
import axios from "axios";
import { BASE_URL } from "@/services/apis";
import { useAuth } from "@/context/AuthContext";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}



export const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();


  const navigationItems = [
    { id: 'home', label: 'Home', icon: Video },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'stories', label: 'Stories', icon: Sparkles },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    try {
      googleLogout();
      localStorage.removeItem('authToken');
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSectionChange = (section: string) => {
    if (["upload"].includes(section) && !user) {
      setShowAuthDialog(true);
      return;
    }
    onSectionChange(section);
  };


  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">StoryWeaver</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "ai" : "ghost"}
                    size="sm"
                    onClick={() => handleSectionChange(item.id)}
                    className={`gap-2 ${isActive ? 'shadow-ai' : ''}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
              {user ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <User className="w-4 h-4" />
                        {user.profilePic && (
                          <img
                            src={user.profilePic}
                            alt={user.username}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}{user.username}
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="text-sm">
                        {user.profilePic && (
                          <img
                            src={user.profilePic}
                            alt={user.username}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}{user.username || "Profile"}
                      </DropdownMenuLabel>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {user?.email || "No email"}
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowAuthDialog(true)}>
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-6 py-4 space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "ai" : "ghost"}
                    size="sm"
                    onClick={() => {
                      handleSectionChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full justify-start gap-3 ${isActive ? 'shadow-ai' : ''}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
              {user ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => onSectionChange("profile")}>
                    <User className="w-4 h-4 mr-1" />  {user.profilePic && (
                      <img
                        src={user.profilePic}
                        alt={user.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}{user.username}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAuthDialog(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {showAuthDialog && (
        <SignInDialog open={true} onClose={() => setShowAuthDialog(false)} />
      )}
    </>
  );
};
