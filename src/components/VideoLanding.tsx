import { useEffect, useRef, useState } from 'react';

interface VideoLandingProps {
  onSkip: () => void;
}

export default function VideoLanding({ onSkip }: VideoLandingProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnded, setIsVideoEnded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log("Autoplay prevented:", err);
      });
    }
  }, []);

  const handleVideoEnd = () => {
    setIsVideoEnded(true);
    setTimeout(() => {
      onSkip();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        playsInline
        onEnded={handleVideoEnd}
      >
        {/* IMPORTANT: Replace this source with your actual video file path */}
        {/* For now using a placeholder. Upload your video to /public folder and update the path */}
        <source src="/luxury-car-intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Skip Button */}
      {!isVideoEnded && (
        <button
          onClick={onSkip}
          className="absolute top-8 right-8 px-6 py-3 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 z-10 tracking-wider"
        >
          SKIP VIDEO
        </button>
      )}

      {/* Loading overlay if video fails */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-[#D4AF37] mb-4 tracking-widest">
            AWESOME LUXURY SERVICES GROUP
          </div>
          <p className="text-white">Loading premium experience...</p>
          <button
            onClick={onSkip}
            className="mt-8 px-8 py-3 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 tracking-wider"
          >
            ENTER SITE
          </button>
        </div>
      </div>
    </div>
  );
}
