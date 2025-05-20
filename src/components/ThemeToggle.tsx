import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  
  // Get the current theme icon
  const getThemeIcon = () => {
    if (theme === "dark") return <Moon className="h-5 w-5 text-indigo-300" />;
    if (theme === "system") return <Monitor className="h-5 w-5 text-gray-600" />;
    return <Sun className="h-5 w-5 text-amber-500" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className="rounded-full"
        >
          {getThemeIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as any)}>
          <DropdownMenuRadioItem value="light" className="cursor-pointer">
            <Sun className="h-4 w-4 mr-2 text-amber-500" />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="cursor-pointer">
            <Moon className="h-4 w-4 mr-2 text-indigo-300" />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="cursor-pointer">
            <Monitor className="h-4 w-4 mr-2" />
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;
