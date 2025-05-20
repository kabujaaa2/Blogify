import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "./ThemeProvider";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  User, 
  FileText, 
  Settings, 
  Search, 
  Menu, 
  X, 
  Home, 
  BookOpen,
  TrendingUp,
  Bell,
  Eye,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { eyeCare, toggleColorTemperature } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setTimeout(() => {
        document.getElementById("search-input")?.focus();
      }, 100);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
    setSearchOpen(false);
    // Add actual search implementation
  };

  // Helper to check if a link is active
  const isLinkActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  // Helper to get eye care icon and color
  const getEyeCareIcon = () => {
    if (eyeCare.colorTemperature === "warm") return <Sun className="h-5 w-5 text-amber-500" />;
    if (eyeCare.colorTemperature === "cool") return <Moon className="h-5 w-5 text-blue-500" />;
    return <Eye className="h-5 w-5" />;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card backdrop-blur-sm">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 rounded-full text-muted-foreground hover:bg-muted" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" className="font-serif text-2xl font-bold text-foreground">
              Blogify
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex ml-6 gap-1">
              <Link 
                to="/" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isLinkActive("/") 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:text-primary hover:bg-muted"
                )}
              >
                Home
              </Link>
              <Link 
                to="/explore" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isLinkActive("/explore") 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:text-primary hover:bg-muted"
                )}
              >
                Explore
              </Link>
              <Link 
                to="/trending" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isLinkActive("/trending") 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:text-primary hover:bg-muted"
                )}
              >
                Trending
              </Link>
              <Link 
                to="/categories" 
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isLinkActive("/categories") 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:text-primary hover:bg-muted"
                )}
              >
                Categories
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              className="rounded-full"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Notifications dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-card border border-border">
                <div className="flex items-center justify-between p-2 border-b border-border">
                  <h3 className="font-medium">Notifications</h3>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Mark all as read
                  </Button>
                </div>
                <div className="py-2 px-3 text-sm">
                  <div className="flex gap-3 items-start mb-3 p-2 rounded hover:bg-muted">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-blue-100 text-blue-700">S</AvatarFallback>
                    </Avatar>
                    <div>
                      <p><span className="font-medium">Sarah Wilson</span> commented on your post.</p>
                      <p className="text-muted-foreground text-xs mt-1">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start p-2 rounded hover:bg-muted">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-green-100 text-green-700">A</AvatarFallback>
                    </Avatar>
                    <div>
                      <p><span className="font-medium">Alex Johnson</span> liked your post.</p>
                      <p className="text-muted-foreground text-xs mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <div className="p-2">
                  <Button asChild variant="ghost" size="sm" className="w-full justify-center">
                    <Link to="/notifications">View all notifications</Link>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Simplified Eye Care Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleColorTemperature}
              className="rounded-full relative"
              aria-label="Toggle color temperature"
              title={
                eyeCare.colorTemperature === "normal" ? "Normal Color Temperature" :
                eyeCare.colorTemperature === "warm" ? "Warm Color Temperature" :
                "Cool Color Temperature"
              }
            >
              {getEyeCareIcon()}
              {eyeCare.colorTemperature !== "normal" && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-amber-400" />
              )}
            </Button>
            
            <ThemeToggle />
            
            {user ? (
              <>
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 hidden md:flex"
                >
                  <Link to="/editor/new">New Post</Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border border-border">
                    <div className="px-2 py-1.5 text-sm border-b border-border">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-muted-foreground text-xs truncate">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/dashboard" 
                        className={cn(
                          "flex items-center gap-2",
                          isLinkActive("/dashboard") && "bg-muted"
                        )}
                      >
                        <FileText className="h-4 w-4" />
                        <span>My Posts</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/settings" 
                        className={cn(
                          "flex items-center gap-2",
                          isLinkActive("/settings") && "bg-muted"
                        )}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      className="flex items-center gap-2 text-red-600 focus:text-red-700"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                  <Link to="/signup">Sign Up</Link>
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity duration-200",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleMobileMenu}
      />
      
      <div
        className={cn(
          "fixed top-16 left-0 bottom-0 z-30 w-64 bg-card border-r border-border shadow-lg transform transition-transform duration-200 ease-in-out md:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-4 h-full flex flex-col">
          <div className="space-y-1">
            <Link 
              to="/" 
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md",
                isLinkActive("/") 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link 
              to="/explore" 
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md",
                isLinkActive("/explore") 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="h-5 w-5" />
              <span>Explore</span>
            </Link>
            <Link 
              to="/trending" 
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md",
                isLinkActive("/trending") 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <TrendingUp className="h-5 w-5" />
              <span>Trending</span>
            </Link>
            <Link 
              to="/categories" 
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md",
                isLinkActive("/categories") 
                  ? "bg-primary/10 text-primary" 
                  : "hover:bg-muted"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FileText className="h-5 w-5" />
              <span>Categories</span>
            </Link>
          </div>
          
          {user && (
            <>
              <Link 
                to="/editor/new" 
                className="flex items-center justify-center gap-2 px-3 py-2 mt-4 bg-primary text-primary-foreground rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText className="h-5 w-5" />
                <span>New Post</span>
              </Link>
              
              <div className="mt-4 space-y-1">
                <Link 
                  to="/dashboard" 
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md",
                    isLinkActive("/dashboard") 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  <span>My Posts</span>
                </Link>
                
                <Link 
                  to="/settings" 
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md",
                    isLinkActive("/settings") 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </div>
            </>
          )}

          {!user && (
            <div className="mt-4 space-y-2">
              <Link 
                to="/signup" 
                className="flex items-center justify-center px-3 py-2 border border-primary text-primary rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
              <Link 
                to="/login" 
                className="flex items-center justify-center px-3 py-2 bg-primary text-primary-foreground rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Global Search Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-200 flex items-start justify-center pt-20",
          searchOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSearchOpen(false)}
      >
        <div 
          className="w-full max-w-2xl mx-4 bg-card rounded-lg shadow-lg overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <form onSubmit={handleSearch} className="relative">
            <input
              id="search-input"
              type="text"
              placeholder="Search articles, topics, and authors..."
              className="w-full py-4 px-5 pr-12 text-foreground bg-card outline-none border-b border-border"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-3 top-3"
            >
              <Search className="h-5 w-5" />
            </Button>
          </form>
          <div className="p-4">
            <h3 className="font-medium text-sm mb-2">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full text-xs"
                onClick={() => {
                  setSearchQuery("React hooks");
                  document.getElementById("search-input")?.focus();
                }}
              >
                React hooks
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full text-xs"
                onClick={() => {
                  setSearchQuery("Tailwind CSS");
                  document.getElementById("search-input")?.focus();
                }}
              >
                Tailwind CSS
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full text-xs"
                onClick={() => {
                  setSearchQuery("TypeScript");
                  document.getElementById("search-input")?.focus();
                }}
              >
                TypeScript
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
