import { Outlet } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';
import { useNaturalScroll } from '../hooks/useNaturalScroll';

export default function Layout() {
  // Apply natural scrolling globally
  useNaturalScroll();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
