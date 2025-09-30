import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { googleLogout } from "@react-oauth/google";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Call context logout to clear user and localStorage
    logout();

    // Sign out from Google OAuth if applicable
    googleLogout();

    // Redirect to homepage
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="w-4 h-4" />
          {user?.username || "Profile"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-sm">
          {user?.username || "Anonymous"}
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
  );
};
