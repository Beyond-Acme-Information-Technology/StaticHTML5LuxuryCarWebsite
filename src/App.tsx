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

export default function App() {
  const [showVideo, setShowVideo] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  // Check if user has already seen the video in this session
  useEffect(() => {
    const hasSeenVideo = sessionStorage.getItem('hasSeenVideo');
    if (hasSeenVideo) {
      setShowVideo(false);
    }
  }, []);

  const handleSkipVideo = () => {
    setShowVideo(false);
    sessionStorage.setItem('hasSeenVideo', 'true');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
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
      case 'login':
        return <LoginPortal />;
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
      <Footer />
    </div>
  );
}
