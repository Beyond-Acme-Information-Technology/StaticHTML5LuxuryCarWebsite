import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import VideoLanding from './components/VideoLanding';
import HomePage from './components/HomePage';
import { CLIENT_AUTH_EVENT, hasClientSession } from './utils/clientSession';

const Services = lazy(() => import('./components/Services'));
const FleetGallery = lazy(() => import('./components/FleetGallery'));
const BookOnline = lazy(() => import('./components/BookOnline'));
const ContactUs = lazy(() => import('./components/ContactUs'));
const Jobs = lazy(() => import('./components/Jobs'));
const LoginPortal = lazy(() => import('./components/LoginPortal'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const StaffInbox = lazy(() => import('./components/StaffInbox'));
const ClientPortal = lazy(() => import('./components/ClientPortal'));
const PaidThankYou = lazy(() => import('./components/PaidThankYou'));
const DriverPortal = lazy(() => import('./components/DriverPortal'));
const TrackTrip = lazy(() => import('./components/TrackTrip'));

const VALID_PAGES = ['home', 'services', 'fleet', 'book', 'contact', 'jobs', 'privacy', 'login', 'terms', 'staff', 'account', 'paid', 'driver', 'track'] as const;
type PageId = (typeof VALID_PAGES)[number];

function pageFromLocation(): PageId {
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  if ((VALID_PAGES as readonly string[]).includes(hash)) return hash as PageId;
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
  if ((VALID_PAGES as readonly string[]).includes(path)) return path as PageId;
  return 'home';
}

function skipIntroVideo() {
  const page = pageFromLocation();
  return Boolean(sessionStorage.getItem('hasSeenVideo')) || (Boolean(window.location.hash || window.location.pathname !== '/') && page !== 'home');
}

class PageErrorBoundary extends Component<{ children: ReactNode; page: string }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    (window as unknown as { __alsPageError?: string }).__alsPageError =
      `${error.message}\n${error.stack || ''}`;
  }

  componentDidUpdate(prevProps: { page: string }) {
    if (prevProps.page !== this.props.page && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-black text-white pt-32 px-6 pb-20 text-center">
          <h1 className="text-3xl text-[#D4AF37] mb-4">This page could not load</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Please refresh, or open Home and try again. Call +1 (408) 805-4386 if you need a car right now.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageFallback() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6 text-center">
      <p className="text-[#D4AF37] tracking-widest">Loading…</p>
    </div>
  );
}

export default function App() {
  const [showVideo, setShowVideo] = useState(() => !skipIntroVideo());
  const [currentPage, setCurrentPage] = useState<PageId>(() => pageFromLocation());
  const [clientSignedIn, setClientSignedIn] = useState(false);

  useEffect(() => {
    const initialPage = pageFromLocation();
    if (skipIntroVideo()) setShowVideo(false);
    setCurrentPage(initialPage);
    setClientSignedIn(hasClientSession());

    if (!window.location.hash && initialPage !== 'home' && window.location.pathname.replace(/\//g, '') === initialPage) {
      history.replaceState(null, '', `/#/${initialPage}${window.location.search}`);
    }

    const onHashChange = () => setCurrentPage(pageFromLocation());
    const onAuth = () => setClientSignedIn(hasClientSession());
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onHashChange);
    window.addEventListener(CLIENT_AUTH_EVENT, onAuth);
    window.addEventListener('storage', onAuth);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onHashChange);
      window.removeEventListener(CLIENT_AUTH_EVENT, onAuth);
      window.removeEventListener('storage', onAuth);
    };
  }, []);

  const handleSkipVideo = () => {
    setShowVideo(false);
    sessionStorage.setItem('hasSeenVideo', 'true');
  };

  const handleNavigate = (page: string) => {
    const next = (VALID_PAGES as readonly string[]).includes(page) ? (page as PageId) : 'home';
    setCurrentPage(next);
    if (next === 'home') {
      history.pushState(null, '', `/${window.location.search}`);
    } else if (window.location.hash !== `#/${next}`) {
      window.location.hash = `/${next}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showVideo) {
    return <VideoLanding onSkip={handleSkipVideo} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'services':
        return <Services onNavigate={handleNavigate} />;
      case 'fleet':
        return <FleetGallery onNavigate={handleNavigate} />;
      case 'book':
        return <BookOnline />;
      case 'contact':
        return <ContactUs />;
      case 'jobs':
        return <Jobs />;
      case 'privacy':
        return <PrivacyPolicy onNavigate={handleNavigate} />;
      case 'terms':
        return <TermsOfService onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPortal onNavigate={handleNavigate} />;
      case 'staff':
        return <StaffInbox onNavigate={handleNavigate} />;
      case 'account':
        return <ClientPortal onNavigate={handleNavigate} />;
      case 'paid':
        return <PaidThankYou onNavigate={handleNavigate} />;
      case 'driver':
        return <DriverPortal onNavigate={handleNavigate} />;
      case 'track':
        return <TrackTrip onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} clientSignedIn={clientSignedIn} />
      <main>
        <PageErrorBoundary page={currentPage}>
          <Suspense fallback={<PageFallback />}>{renderPage()}</Suspense>
        </PageErrorBoundary>
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
