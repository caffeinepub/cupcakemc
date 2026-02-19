import { Outlet } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';
import ProfileSetupModal from './ProfileSetupModal';
import { useNaturalScroll } from '../hooks/useNaturalScroll';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetWebsiteConfig } from '../hooks/useQueries';
import { getBackgroundStyle } from '../utils/websiteAppearance';

export default function Layout() {
  // Apply natural scrolling globally
  useNaturalScroll();

  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: websiteConfig } = useGetWebsiteConfig();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Get background style from config
  const backgroundStyle = websiteConfig ? getBackgroundStyle(websiteConfig.backgroundSetting) : {};

  return (
    <div className="min-h-screen bg-background" style={backgroundStyle}>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ProfileSetupModal open={showProfileSetup} />
    </div>
  );
}
