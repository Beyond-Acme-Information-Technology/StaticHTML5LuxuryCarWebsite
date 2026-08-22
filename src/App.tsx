import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import VideoLanding from './components/VideoLanding';
import HomePage from './components/HomePage';
import Services from './components/Services';
import FleetGallery from './components/FleetGallery';
import BookOnline from './components/BookOnline';
import ContactUs from './components/ContactUs';
import Jobs from './components/Jobs';
import LoginPortal from './components/LoginPortal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import StaffInbox from './components/StaffInbox';
import ClientPortal from './components/ClientPortal';
import PaidThankYou from './components/PaidThankYou';
import { CLIENT_AUTH_EVENT, hasClientSession } from './utils/clientSession';

const VALID_PAGES = ['home', 'services', 'fleet', 'book', 'contact', 'jobs', 'privacy', 'login', 'terms', 'staff', 'account', 'paid'] as const;
type PageId = (typeof VALID_PAGES)[number];

function pageFromHash(): PageId {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return (VALID_PAGES as readonly string[]).includes(raw) ? (raw as PageId) : 'home';
}

export default function App() {
  const [showVideo, setShowVideo] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [clientSignedIn, setClientSignedIn] = useState(false);

  useEffect(() => {
    const initialPage = pageFromHash();
    const hasSeenVideo = sessionStorage.getItem('hasSeenVideo');
    const skipIntro = Boolean(window.location.hash) && initialPage !== 'home';
    if (hasSeenVideo || skipIntro) {
      setShowVideo(false);
    }
    setCurrentPage(initialPage);
    setClientSignedIn(hasClientSession());

    const onHashChange = () => setCurrentPage(pageFromHash());
    const onAuth = () => setClientSignedIn(hasClientSession());
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener(CLIENT_AUTH_EVENT, onAuth);
    window.addEventListener('storage', onAuth);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
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
      if (window.location.hash) {
        history.pushState(null, '', `${window.location.pathname}${window.location.search}`);
      }
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
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} clientSignedIn={clientSignedIn} />
      <main>
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
