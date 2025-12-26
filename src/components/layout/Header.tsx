import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useSecret } from "@/hooks/useSecret";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { AppLogo } from "@/components/ui/AppLogo";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState("");
  
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isSecretEnabled, unlock } = useSecret();
  
  // Logic for accessing the secret vault
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  // Triple Click Logic (Works well on Desktop & Mobile)
  const handleLogoClick = (e: React.MouseEvent) => {
    if (!isSecretEnabled) return;

    // Increment click counter
    clickCountRef.current += 1;

    // Reset timer if it's running
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    // Check for triple click
    if (clickCountRef.current >= 3) {
      e.preventDefault(); // Prevent navigation
      clickCountRef.current = 0;
      setShowModeDialog(true);
      return;
    }

    // Set timer to reset clicks after 500ms
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 500);
  };

  // Long Press Logic (Mobile backup)
  const startPress = () => {
    if (!isSecretEnabled) return;
    isLongPress.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPress.current = true;
      setShowModeDialog(true);
    }, 1500); // Reduced to 1.5 seconds for better responsiveness
  };

  const endPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Keyboard Shortcut (Desktop Power Users: Ctrl+Shift+X)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'X' && isSecretEnabled) {
        e.preventDefault();
        setShowModeDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSecretEnabled]);

  // Handle touch/click events for long press
  const longPressProps = {
    onMouseDown: startPress,
    onMouseUp: endPress,
    onMouseLeave: endPress,
    onTouchStart: startPress,
    onTouchEnd: endPress,
  };

  const handleUnlock = () => {
    if (unlock(pinInput)) {
      setShowPinDialog(false);
      setShowModeDialog(false);
      setPinInput("");
      navigate("/vault");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Secret Cheat Code in Search
      if (searchQuery.toLowerCase() === "open sesame" || searchQuery.toLowerCase() === "vault") {
        if (isSecretEnabled) {
          setShowModeDialog(true);
          setSearchQuery("");
          return;
        }
      }
      navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Browse", href: "/browse" },
    { label: "Discover", href: "/discover" },
    { label: "Latest", href: "/browse" },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group select-none"
            {...longPressProps}
            onClick={(e) => {
              handleLogoClick(e);
              if (isLongPress.current) {
                e.preventDefault();
              }
            }}
          >
            <AppLogo className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-gradient hidden sm:block">
              MangaReader
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                to={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search manga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-secondary border-border focus:ring-2 focus:ring-primary"
              />
            </div>
          </form>

          {/* Auth Buttons & Theme Toggle */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <NotificationBell />
                <Link to="/profile">
                  <Button size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {profile?.username || "Profile"}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            {user && <NotificationBell />}
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search manga or 'vault'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  to={link.href}
                  className="py-2 px-4 rounded-lg hover:bg-secondary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-4">
                {user ? (
                  <Link to="/profile" className="flex-1">
                    <Button className="w-full">Profile</Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="flex-1">
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                    <Link to="/login" className="flex-1">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Mode Selection Dialog */}
      <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Browsing Mode</DialogTitle>
            <DialogDescription>
              Choose between standard browsing or access the hidden vault.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button 
              variant="outline" 
              onClick={() => setShowModeDialog(false)} 
              className="w-full"
            >
              Normal Mode
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setShowModeDialog(false);
                setShowPinDialog(true);
              }} 
              className="w-full"
            >
              Hidden Secret
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN Entry Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Vault PIN</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            />
            <Button onClick={handleUnlock} className="w-full">
              Unlock
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
