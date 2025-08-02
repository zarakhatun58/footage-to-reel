import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Video, Search, Sparkles, Upload, Menu, X, User, LogOut } from "lucide-react";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { app } from "@/lib/firebase";
import SignInDialog from "./OldSignInDialog";
import { ProfileDropdown } from "./ProfileDropdown";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [user, setUser] = useState(null);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Video },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'stories', label: 'Stories', icon: Sparkles },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const handleGoogleLogin = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowAuthDialog(false);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
  };

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleUploadClick = () => {
    if (!user) {
      setShowAuthDialog(true);
    } else {
      onSectionChange("upload");
    }
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
                    onClick={() => onSectionChange(item.id)}
                    className={`gap-2 ${isActive ? 'shadow-ai' : ''}`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
              {user ? (
                <ProfileDropdown user={user} onLogout={handleLogout} />
              ) : <Button variant="ghost" size="sm" onClick={() => {
                setShowAuthDialog(true);
              }}> Sign In</Button>}
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
                      onSectionChange(item.id);
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
                    <User className="w-4 h-4 mr-1" /> Profile
                  </Button>
                </>
              ) : <Button variant="ghost" size="sm" onClick={() => {
                setShowAuthDialog(true);
                setIsMobileMenuOpen(false);
              }}> Sign In</Button>}
            </div>
          </div>
        )}
      </nav>

      {showAuthDialog && (
        <SignInDialog
          open={true}
          onClose={() => setShowAuthDialog(false)}
        />
      )}

    </>
  );
};