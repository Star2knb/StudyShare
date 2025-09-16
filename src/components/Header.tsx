import { Search, User, Upload, Bell, LogOut, Settings, Shield, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useAuth } from "./AuthContext";
import { Logo } from "./Logo";

interface HeaderProps {
  onSearchChange: (value: string) => void;
  onUploadClick: () => void;
  onAuthClick: () => void;
  onAdminClick: () => void;
}

export function Header({ onSearchChange, onUploadClick, onAuthClick, onAdminClick }: HeaderProps) {
  const { user, userProfile, signOut, isAdmin } = useAuth();
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Logo size="md" />
          </div>
          
          {/* Desktop Search */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search files, authors, topics..."
                className="pl-10"
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="space-y-4 py-4">
                    <div className="px-3 py-2">
                      <Logo size="sm" />
                    </div>
                    
                    {/* Mobile Search */}
                    <div className="px-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search files..."
                          className="pl-10"
                          onChange={(e) => onSearchChange(e.target.value)}
                        />
                      </div>
                    </div>

                    {user ? (
                      <div className="space-y-2 px-3">
                        <div className="flex items-center space-x-3 py-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {userProfile?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        
                        <Button onClick={onUploadClick} className="w-full" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                        
                        {isAdmin && (
                          <Button onClick={onAdminClick} variant="outline" className="w-full" size="sm">
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Button>
                        )}
                        
                        <Button onClick={() => signOut()} variant="outline" className="w-full" size="sm">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="px-3">
                        <Button onClick={onAuthClick} className="w-full">
                          Sign In
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {user && (
                <Button onClick={onUploadClick} className="flex items-center space-x-2" size="sm">
                  <Upload className="h-4 w-4" />
                  <span className="hidden lg:inline">Upload</span>
                </Button>
              )}
              
              {user ? (
                <>
                  <Button variant="ghost" size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {userProfile?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{userProfile?.name || 'User'}</p>
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      {isAdmin && (
                        <>
                          <DropdownMenuItem onClick={onAdminClick}>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Panel</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => signOut()}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={onAuthClick}>Sign In</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}