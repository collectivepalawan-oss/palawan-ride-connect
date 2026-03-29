import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Ship, Menu, LogOut, User, MapPin, Calendar, Shield, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const Navigation = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Ship className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg hidden sm:inline">Palawan Transport</span>
          <span className="font-semibold text-lg sm:hidden">PCT</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2">
            {userRole === "traveler" && (
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link to="/my-trips">
                  <Calendar className="h-4 w-4 mr-2" />
                  My Trips
                </Link>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                {userRole === "traveler" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/book" className="cursor-pointer">
                        <MapPin className="mr-2 h-4 w-4" />
                        Book a Ride
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="sm:hidden">
                      <Link to="/my-trips" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        My Trips
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                {userRole === "operator" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/operator" className="cursor-pointer">
                        <Ship className="mr-2 h-4 w-4" />
                        Operator Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/operator/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Operator Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/operator/bookings" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                {userRole === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        Manage Users
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
};
