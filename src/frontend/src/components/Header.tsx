import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, ShoppingCart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetWebsiteConfig, useIsCallerAdmin, useGetCart } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getLogoSrc } from '../utils/websiteAppearance';

export default function Header() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: websiteConfig } = useGetWebsiteConfig();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: cart = [] } = useGetCart();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const cartItemCount = cart.reduce((sum, item) => sum + Number(item.quantity), 0);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
    } else {
      try {
        await login();
        toast.success('Logged in successfully');
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const logoSrc = websiteConfig ? getLogoSrc(websiteConfig.logo) : '/assets/generated/cupcakesmp-logo-transparent.dim_200x200.png';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pink-500/20 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={logoSrc} alt="CupCakeMC" className="h-10 w-10" />
            <span className="text-xl font-bold text-pink-400 heading-pixel">CupCakeMC</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="nav-link text-gray-300 hover:text-pink-400 transition-colors text-sm font-medium"
              activeProps={{ className: 'text-pink-400' }}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="nav-link text-gray-300 hover:text-pink-400 transition-colors text-sm font-medium flex items-center gap-2"
              activeProps={{ className: 'text-pink-400' }}
            >
              <ShoppingCart className="h-4 w-4" />
              Shop
              {cartItemCount > 0 && (
                <Badge className="bg-pink-500 text-white text-xs px-1.5 py-0 h-5 min-w-[20px]">{cartItemCount}</Badge>
              )}
            </Link>
            <Link
              to="/vote"
              className="nav-link text-gray-300 hover:text-pink-400 transition-colors text-sm font-medium"
              activeProps={{ className: 'text-pink-400' }}
            >
              Vote
            </Link>
            <Link
              to="/discord"
              className="nav-link text-gray-300 hover:text-pink-400 transition-colors text-sm font-medium"
              activeProps={{ className: 'text-pink-400' }}
            >
              Discord
            </Link>
            {isAuthenticated && (
              <Link
                to="/history"
                className="nav-link text-gray-300 hover:text-pink-400 transition-colors text-sm font-medium"
                activeProps={{ className: 'text-pink-400' }}
              >
                History
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-pink-500/30 text-white">
                  <DropdownMenuItem
                    onClick={() => navigate({ to: '/admin' })}
                    className="cursor-pointer hover:bg-pink-500/10 focus:bg-pink-500/10"
                  >
                    Admin Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: '/admin/shop' })}
                    className="cursor-pointer hover:bg-pink-500/10 focus:bg-pink-500/10"
                  >
                    Shop Management
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              onClick={handleAuth}
              disabled={disabled}
              className={`${
                isAuthenticated
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-pink-500 hover:bg-pink-600 text-white'
              } transition-colors`}
            >
              {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-pink-400 hover:text-pink-300 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-3 border-t border-pink-500/20">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-pink-400 transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-gray-300 hover:text-pink-400 transition-colors text-sm font-medium"
            >
              <ShoppingCart className="h-4 w-4" />
              Shop
              {cartItemCount > 0 && (
                <Badge className="bg-pink-500 text-white text-xs px-1.5 py-0 h-5 min-w-[20px]">{cartItemCount}</Badge>
              )}
            </Link>
            <Link
              to="/vote"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-pink-400 transition-colors text-sm font-medium"
            >
              Vote
            </Link>
            <Link
              to="/discord"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-pink-400 transition-colors text-sm font-medium"
            >
              Discord
            </Link>
            {isAuthenticated && (
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-300 hover:text-pink-400 transition-colors text-sm font-medium"
              >
                History
              </Link>
            )}
            {isAuthenticated && isAdmin && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-pink-400 transition-colors text-sm font-medium"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-pink-400 transition-colors text-sm font-medium"
                >
                  Shop Management
                </Link>
              </>
            )}
            <Button
              onClick={() => {
                handleAuth();
                setMobileMenuOpen(false);
              }}
              disabled={disabled}
              className={`w-full ${
                isAuthenticated
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-pink-500 hover:bg-pink-600 text-white'
              } transition-colors`}
            >
              {loginStatus === 'logging-in' ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
