import { useEffect, useRef, useState } from 'react';

interface VideoLandingProps {
  onSkip: () => void;
}

export default function VideoLanding({ onSkip }: VideoLandingProps) {
  const videoRef = useRef(null) as React.MutableRefObject<HTMLVideoElement | null>;
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // prefer unmuted by default; browsers may block autoplay with sound
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err: unknown) => {
        console.log('Autoplay with sound prevented or blocked by browser:', err);
        // If autoplay with sound is blocked, mute and let user opt-in
        try {
          if (videoRef.current) {
            videoRef.current.muted = true;
          }
        } catch (e) {}
        setIsMuted(true);
        // hide loading so user can proceed
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
    videoRef.current?.play().catch((err) => {
      // if playing now fails (e.g., autoplay with sound blocked), fallback to muted
      console.log('Play attempt on canplay failed:', err);
      try {
        if (videoRef.current) videoRef.current.muted = true;
      } catch (e) {}
      setIsMuted(true);
    });
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

      {/* Mute / Unmute control */}
      {!isVideoEnded && (
        <div className="absolute top-6 right-24 flex flex-col items-end gap-3 z-50">
          {isMuted ? (
            <>
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = false;
                    videoRef.current.play().catch(() => {});
                    setIsMuted(false);
                  }
                }}
                aria-label="Unmute video"
                className="px-5 py-3 bg-[#D4AF37] text-black rounded-full shadow-lg transform hover:scale-105 transition duration-200 tracking-wider text-sm font-semibold animate-pulse"
              >
                UNMUTE
              </button>

              <div role="status" aria-live="polite" className="bg-black/60 text-white text-xs px-3 py-1 rounded">
                Audio is muted by default in some browsers. Click UNMUTE to enable sound.
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  setIsMuted(true);
                }
              }}
              aria-label="Mute video"
              className="px-3 py-2 bg-white text-black rounded shadow-sm hover:opacity-90 transition duration-200 tracking-wider text-sm font-medium"
            >
              MUTE
            </button>
          )}
        </div>
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
