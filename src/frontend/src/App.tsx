import { useEffect, lazy, Suspense } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute, useRouterState } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import HomePage from './pages/HomePage';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

// Lazy load non-critical pages
const ShopPage = lazy(() => import('./pages/ShopPage'));
const VotePage = lazy(() => import('./pages/VotePage'));
const DiscordPage = lazy(() => import('./pages/DiscordPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Optimized QueryClient with aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes - increased from 5
      gcTime: 1000 * 60 * 30, // 30 minutes cache
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      retryDelay: 500,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
    </div>
  );
}

// Component to handle dynamic title updates
function TitleUpdater() {
  const router = useRouterState();
  
  useEffect(() => {
    const path = router.location.pathname;
    let pageTitle = 'CupCakeMC';
    
    if (path === '/') {
      pageTitle = 'CupCakeMC';
    } else if (path === '/shop') {
      pageTitle = 'Shop - CupCakeMC';
    } else if (path === '/vote') {
      pageTitle = 'Vote - CupCakeMC';
    } else if (path === '/discord') {
      pageTitle = 'Discord - CupCakeMC';
    } else if (path === '/history') {
      pageTitle = 'History - CupCakeMC';
    } else if (path === '/admin') {
      pageTitle = 'Admin Dashboard - CupCakeMC';
    }
    
    document.title = pageTitle;
  }, [router.location.pathname]);
  
  return null;
}

// Wrapper component that includes TitleUpdater
function LayoutWithTitle() {
  return (
    <>
      <TitleUpdater />
      <Layout />
    </>
  );
}

const rootRoute = createRootRoute({
  component: LayoutWithTitle,
  notFoundComponent: () => (
    <Suspense fallback={<PageLoader />}>
      <NotFoundPage />
    </Suspense>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shop',
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <ShopPage />
    </Suspense>
  ),
});

const voteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vote',
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <VotePage />
    </Suspense>
  ),
});

const discordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discord',
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <DiscordPage />
    </Suspense>
  ),
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <HistoryPage />
    </Suspense>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <AdminDashboardPage />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute, shopRoute, voteRoute, discordRoute, historyRoute, adminRoute]);

const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadDelay: 100,
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
