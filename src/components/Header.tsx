
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "./ThemeProvider";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, FileText, Settings, Moon, Sun, Eye } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, colorTemperature, toggleColorTemperature } = useTheme();

  return (
    <header className="border-b">
      <div className="container mx-auto h-16 flex items-center justify-between px-4">
        <Link to="/" className="font-serif text-2xl font-bold">
          Blogify
        </Link>
        <div className="flex items-center gap-3">
          {/* Eye protection toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleColorTemperature}
            className="rounded-full relative"
            title={colorTemperature === "warm" ? "Disable Eye-care Mode" : "Enable Eye-care Mode"}
          >
            <Eye className={`h-5 w-5 ${colorTemperature === "warm" ? "text-amber-500" : ""}`} />
            {colorTemperature === "warm" && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-amber-400" />
            )}
          </Button>
          
          <ThemeToggle />
          
          {user ? (
            <>
              <Button asChild variant="outline" size="sm" className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10">
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
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>My Posts</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
