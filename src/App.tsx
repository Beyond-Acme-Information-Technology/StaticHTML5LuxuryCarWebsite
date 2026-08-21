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

const VALID_PAGES = ['home', 'services', 'fleet', 'book', 'contact', 'jobs', 'privacy', 'login', 'terms', 'staff'] as const;
type PageId = (typeof VALID_PAGES)[number];

function pageFromHash(): PageId {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return (VALID_PAGES as readonly string[]).includes(raw) ? (raw as PageId) : 'home';
}

export default function App() {
  const [showVideo, setShowVideo] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageId>('home');

  useEffect(() => {
    const hasSeenVideo = sessionStorage.getItem('hasSeenVideo');
    if (hasSeenVideo) {
      setShowVideo(false);
    }
    setCurrentPage(pageFromHash());

    const onHashChange = () => setCurrentPage(pageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
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
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <main>
        {renderPage()}
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
