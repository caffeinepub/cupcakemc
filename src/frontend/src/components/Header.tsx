import { useState, useEffect, memo } from 'react';
import { Menu, X, ShoppingCart, LogIn, LogOut, User, Settings } from 'lucide-react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCart, useGetCallerUserProfile, useIsCallerAdmin, useGetWebsiteConfig } from '../hooks/useQueries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { getLogoSrc } from '../utils/websiteAppearance';

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
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: websiteConfig } = useGetWebsiteConfig();

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

  // Get logo source with fallback
  const logoSrc = websiteConfig ? getLogoSrc(websiteConfig.logo) : '/assets/generated/cupcakesmp-logo-transparent.dim_200x200.png';

  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-md border-b border-pink-500/30">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between lg:grid lg:grid-cols-3">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logoSrc}
              alt="CupCakeMC" 
              className="h-10 w-10" 
              loading="eager"
              onError={(e) => {
                e.currentTarget.src = '/assets/generated/cupcakesmp-logo-transparent.dim_200x200.png';
              }}
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
              <Button variant="outline" disabled className="rounded-full border-pink-500/30">
                Loading...
              </Button>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full border-pink-500/30 hover:bg-pink-500/10">
                    <User className="h-4 w-4 mr-2" />
                    {displayName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-black/95 border-pink-500/30">
                  <DropdownMenuLabel className="text-pink-400">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-pink-500/30" />
                  <DropdownMenuItem onClick={() => navigate({ to: '/history' })} className="cursor-pointer hover:bg-pink-500/10">
                    Purchase History
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate({ to: '/admin' })} className="cursor-pointer hover:bg-pink-500/10">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-pink-500/30" />
                  <DropdownMenuItem onClick={handleAuth} className="cursor-pointer hover:bg-pink-500/10">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={handleAuth}
                disabled={isLoggingIn}
                className="rounded-full bg-pink-500 hover:bg-pink-600 text-white"
              >
                {isLoggingIn ? (
                  'Logging in...'
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-300 hover:text-pink-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-pink-500/30">
            <div className="flex flex-col gap-4">
              <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
              <NavLink to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</NavLink>
              <NavLink to="/vote" onClick={() => setMobileMenuOpen(false)}>Vote</NavLink>
              <NavLink to="/discord" onClick={() => setMobileMenuOpen(false)}>Discord</NavLink>
              {isAuthenticated && (
                <NavLink to="/history" onClick={() => setMobileMenuOpen(false)}>Purchase History</NavLink>
              )}
              {isAdmin && (
                <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</NavLink>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
