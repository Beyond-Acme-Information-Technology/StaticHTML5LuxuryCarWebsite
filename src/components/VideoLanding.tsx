import { useEffect, useRef, useState } from 'react';

interface VideoLandingProps {
  onSkip: () => void;
}

export default function VideoLanding({ onSkip }: VideoLandingProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ended, setEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);

  function unmute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    setMuted(false);
    video.play().catch(() => {});
  }

  function mute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    setMuted(true);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.defaultMuted = true;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50">
      <video
        ref={videoRef}
        className="w-full h-full object-cover cursor-pointer"
        src="/luxury-car-intro.mp4"
        autoPlay
        muted={muted}
        playsInline
        preload="auto"
        onClick={unmute}
        onLoadedData={() => setLoading(false)}
        onCanPlay={() => setLoading(false)}
        onEnded={() => {
          setEnded(true);
          window.setTimeout(onSkip, 1000);
        }}
        onError={() => setLoading(false)}
      />

      {!ended && (
        <button
          type="button"
          onClick={onSkip}
          className="absolute top-8 right-8 px-6 py-3 bg-[#D4AF37] text-black hover:bg-[#B4941F] transition-all duration-300 z-50 tracking-wider"
        >
          SKIP VIDEO
        </button>
      )}

      {!ended && muted && !loading && (
        <button
          type="button"
          onClick={unmute}
          aria-label="Play intro music"
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/35"
        >
          <span className="px-8 py-4 bg-[#D4AF37] text-black tracking-wider text-lg hover:bg-[#B4941F]">
            TAP FOR SOUND
          </span>
        </button>
      )}

      {!ended && !muted && (
        <button
          type="button"
          onClick={mute}
          aria-label="Mute video"
          className="absolute top-8 right-40 px-5 py-3 bg-white text-black z-50 tracking-wider text-sm"
        >
          MUTE
        </button>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-30">
          <div className="text-center">
            <div className="text-[#D4AF37] mb-4 tracking-widest">
              AWESOME LUXURY SERVICES GROUP
            </div>
            <p className="text-white">Loading premium experience...</p>
            <button
              type="button"
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
