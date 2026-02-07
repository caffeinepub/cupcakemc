import { useState, useEffect, memo } from 'react';
import { Menu, X, ShoppingCart, LogIn, LogOut, User } from 'lucide-react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCart, useGetCallerUserProfile } from '../hooks/useQueries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const NavLink = memo(({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className="nav-link"
  >
    {children}
  </Link>
));

NavLink.displayName = 'NavLink';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { login, clear, loginStatus, identity, isInitializing, isLoginSuccess } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { data: cart = [] } = useGetCart();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';
  const cartItemCount = cart.reduce((sum, item) => sum + Number(item.quantity), 0);

  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (isLoginSuccess && isAuthenticated) {
      const timer = setTimeout(() => {
        queryClient.invalidateQueries();
        
        if (redirectPath) {
          const path = redirectPath;
          setRedirectPath(null);
          navigate({ to: path as any });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoginSuccess, isAuthenticated, redirectPath, navigate, queryClient]);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
    } else {
      setRedirectPath(routerState.location.pathname);
      login();
    }
  };

  const displayName = userProfile?.name || 'User';

  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-md border-b border-pink-500/30">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between lg:grid lg:grid-cols-3">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/assets/generated/cupcakesmp-logo-transparent.dim_200x200.png" 
              alt="CupCakeMC" 
              className="h-10 w-10" 
              loading="eager" 
            />
            <span className="text-xl font-bold text-pink-400">
              CupCakeMC
            </span>
          </Link>

          {/* Center: Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center justify-center gap-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/vote">Vote</NavLink>
            <NavLink to="/discord">Discord</NavLink>
          </nav>

          {/* Right: Cart + Login */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-gray-300 hover:text-pink-400 hover:bg-pink-500/10"
              onClick={() => navigate({ to: '/shop' })}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-500 text-xs font-bold text-white flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
            
            {isInitializing ? (
              <Button variant="outline" disabled className="hidden lg:inline-flex gap-2 border-pink-500/50">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Loading...</span>
              </Button>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden lg:inline-flex gap-2 border-pink-500/50 text-pink-400 hover:bg-pink-500/10 rounded-full px-4">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{profileLoading ? 'Loading...' : displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-pink-500/30">
                  <DropdownMenuLabel className="text-pink-400">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-pink-500/20" />
                  <div className="px-2 py-1.5 text-sm text-gray-400">
                    <div className="font-medium text-gray-300 mb-1">{userProfile?.name || 'User'}</div>
                    <div className="text-xs break-all text-gray-500">{identity?.getPrincipal().toString()}</div>
                  </div>
                  <DropdownMenuSeparator className="bg-pink-500/20" />
                  <DropdownMenuItem onClick={handleAuth} className="text-red-400 focus:text-red-400 focus:bg-red-500/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleAuth}
                disabled={isLoggingIn || isInitializing}
                className="hidden lg:inline-flex gap-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6"
              >
                {isLoggingIn ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </>
                )}
              </Button>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-pink-400"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-pink-500/20">
            <nav className="flex flex-col gap-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left px-4 py-2 text-sm font-medium text-gray-300 hover:text-pink-400 hover:bg-pink-500/10 rounded-md transition-colors"
              >
                Home
              </Link>
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left px-4 py-2 text-sm font-medium text-gray-300 hover:text-pink-400 hover:bg-pink-500/10 rounded-md transition-colors"
              >
                Shop
              </Link>
              <Link
                to="/vote"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left px-4 py-2 text-sm font-medium text-gray-300 hover:text-pink-400 hover:bg-pink-500/10 rounded-md transition-colors"
              >
                Vote
              </Link>
              <Link
                to="/discord"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left px-4 py-2 text-sm font-medium text-gray-300 hover:text-pink-400 hover:bg-pink-500/10 rounded-md transition-colors"
              >
                Discord
              </Link>
              
              {isInitializing ? (
                <Button variant="outline" disabled className="mx-4 mt-2 gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Loading...</span>
                </Button>
              ) : isAuthenticated ? (
                <div className="mx-4 mt-2 space-y-2">
                  <div className="px-4 py-2 text-sm border border-pink-500/30 rounded-md bg-pink-500/5">
                    <div className="flex items-center gap-2 text-pink-400 font-medium">
                      <User className="h-4 w-4" />
                      {profileLoading ? 'Loading...' : displayName}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 break-all">{identity?.getPrincipal().toString()}</div>
                  </div>
                  <Button
                    onClick={handleAuth}
                    variant="destructive"
                    className="w-full gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleAuth}
                  disabled={isLoggingIn || isInitializing}
                  className="mx-4 mt-2 gap-2 bg-pink-500 hover:bg-pink-600"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </>
                  )}
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
