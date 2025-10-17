import { useEffect, useRef, useState } from 'react';

interface VideoLandingProps {
  onSkip: () => void;
}

export default function VideoLanding({ onSkip }: VideoLandingProps) {
  const videoRef = useRef(null) as React.MutableRefObject<HTMLVideoElement | null>;
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err: unknown) => {
        console.log("Autoplay prevented:", err);
        // if autoplay is prevented, still hide loading so user can enter site
        setIsLoading(false);
      });
    }
  }, []);

  const handleVideoEnd = () => {
    setIsVideoEnded(true);
    setTimeout(() => {
      onSkip();
    }, 1000);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    // attempt to play once metadata/frames are available
    videoRef.current?.play().catch(() => {});
  };

  const handleVideoError = () => {
    // hide loading overlay on error so user can still enter site
    console.error('Video failed to load');
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted={isMuted}
        playsInline
        onEnded={handleVideoEnd}
        onCanPlay={handleCanPlay}
        onError={handleVideoError}
      >
    {/* IMPORTANT: Replace this source with your actual video file path */}
    {/* Try root path first (works for vite preview and when assets are in `public/`),
      then fall back to the historical `build/` path used by this repo. */}
    <source src="/luxury-car-intro.mp4" type="video/mp4" />
    <source src="/build/luxury-car-intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Skip Button */}
      {!isVideoEnded && (
        <button
          onClick={onSkip}
          className="absolute top-8 right-8 px-6 py-3 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 z-50 tracking-wider"
        >
          SKIP VIDEO
        </button>
      )}

      {/* Unmute control (user interaction required by many browsers) */}
      {!isVideoEnded && isMuted && (
        <button
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.muted = false;
              videoRef.current.play().catch(() => {});
              setIsMuted(false);
            }
          }}
          className="absolute top-8 right-32 px-4 py-2 bg-white text-black hover:opacity-90 transition-all duration-200 z-50 tracking-wider"
        >
          UNMUTE
        </button>
      )}

      {/* Loading overlay (shows while video is loading) */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
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
      )}
    </div>
  );
}
