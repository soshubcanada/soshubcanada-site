'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoHeroProps {
  children: React.ReactNode;
}

export function VideoHero({ children }: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => setIsLoaded(true);
    video.addEventListener('loadeddata', handleLoaded);

    // Attempt autoplay
    video.play().catch(() => {
      // Autoplay blocked — video stays as poster/fallback
    });

    return () => video.removeEventListener('loadeddata', handleLoaded);
  }, []);

  return (
    <div className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1920&h=1080&fit=crop&crop=faces"
      >
        {/* Free stock video - diverse happy people / Canada cityscape */}
        <source src="https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4" type="video/mp4" />
      </video>

      {/* Fallback image (shown while video loads) */}
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1920&h=1080&fit=crop&crop=faces)` }}
      />

      {/* Cinematic overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Animated gradient overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/30 via-transparent to-navy-dark/30 animate-gradient-pan" />

      {/* Subtle vignette */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(15,26,46,0.4) 100%)'
      }} />

      {/* Content */}
      {children}
    </div>
  );
}
