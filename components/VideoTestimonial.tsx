'use client';

import { useState, useRef } from 'react';
import { Play, Pause, X, Star, Quote } from 'lucide-react';
import Image from 'next/image';

const videoTestimonials = [
  {
    name: 'Marie-Claire D.',
    origin: 'France',
    program: 'PEQ — Diplômés',
    quote: 'Mon CSQ obtenu en 4 mois grâce à SOS Hub Canada!',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=400&fit=crop&crop=face',
    rating: 5,
  },
  {
    name: 'Ahmed K.',
    origin: 'Maroc',
    program: 'Entrée Express',
    quote: 'Score CRS optimisé, ITA reçu au deuxième tirage!',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=face',
    rating: 5,
  },
  {
    name: 'Sofia L.',
    origin: 'Colombie',
    program: 'Permis de travail',
    quote: 'Processus clair et communication constante. Je recommande!',
    thumbnail: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=400&fit=crop&crop=face',
    rating: 5,
  },
];

export function VideoTestimonial() {
  const [activeVideo, setActiveVideo] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 bg-navy relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-float" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-float" style={{ animationDelay: '1.5s' }} />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold/20 rounded-full animate-particle"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-16 scroll-hidden">
          <span className="text-gold font-semibold text-sm uppercase tracking-[0.2em] font-sans">Témoignages</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">Ils nous ont fait confiance</h2>
          <div className="divider-gold mx-auto mt-4 mb-6" />
          <p className="text-white/50 max-w-xl mx-auto font-sans">
            Découvrez les histoires de familles qui ont réalisé leur rêve canadien avec notre accompagnement.
          </p>
        </div>

        {/* Video testimonial grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {videoTestimonials.map((t, i) => (
            <div
              key={i}
              className="scroll-hidden group relative rounded-2xl overflow-hidden cursor-pointer card-premium"
              style={{ transitionDelay: `${i * 150}ms` }}
              onClick={() => setActiveVideo(i)}
            >
              {/* Thumbnail with play button */}
              <div className="relative aspect-[3/2] overflow-hidden">
                <Image
                  src={t.thumbnail}
                  alt={t.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent group-hover:from-navy/90 transition-all duration-500" />

                {/* Play button with pulse */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gold/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="relative w-16 h-16 bg-gold/90 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-gold group-hover:scale-110 transition-all duration-300">
                      <Play className="w-7 h-7 text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>

                {/* Rating stars */}
                <div className="absolute top-4 right-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-gold text-gold" />
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <Quote className="w-6 h-6 text-gold/40 mb-2" />
                <p className="text-white/90 text-sm font-medium italic mb-3 font-sans">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gold/30">
                    <Image src={t.thumbnail} alt={t.name} width={32} height={32} className="object-cover" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-gold/60 text-xs font-sans">{t.origin} — {t.program}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Promo video banner */}
        <div className="mt-16 scroll-hidden">
          <div
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            onClick={() => setActiveVideo(-1)}
          >
            <div className="relative h-[300px] md:h-[400px]">
              <Image
                src="https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1920&h=600&fit=crop"
                alt="Découvrez SOS Hub Canada"
                fill
                sizes="100vw"
                className="object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/90 group-hover:from-navy/80 group-hover:via-navy/60 group-hover:to-navy/80 transition-all duration-500" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {/* Animated play button */}
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-[-12px] border-2 border-gold/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}>
                      <div className="absolute top-0 left-1/2 w-2 h-2 bg-gold rounded-full -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="absolute inset-[-6px] border border-gold/20 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
                    <div className="relative w-20 h-20 bg-gold rounded-full flex items-center justify-center shadow-2xl shadow-gold/30 group-hover:scale-110 transition-transform duration-500">
                      <Play className="w-9 h-9 text-white ml-1" fill="white" />
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Découvrez SOS Hub Canada</h3>
                  <p className="text-white/50 font-sans text-sm">Regardez comment nous accompagnons nos familles — 2 min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video modal */}
      {activeVideo !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-4xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative rounded-2xl overflow-hidden bg-navy shadow-2xl aspect-video">
              {activeVideo === -1 ? (
                /* Promo video */
                <video
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  playsInline
                >
                  <source src="https://videos.pexels.com/video-files/3015510/3015510-hd_1920_1080_24fps.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              ) : (
                /* Testimonial placeholder — future: real testimonial videos */
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-navy to-navy-dark p-8 text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gold/30 mb-6">
                    <Image
                      src={videoTestimonials[activeVideo].thumbnail}
                      alt={videoTestimonials[activeVideo].name}
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-gold text-gold" />
                    ))}
                  </div>
                  <blockquote className="text-xl md:text-2xl text-white/90 italic max-w-lg mb-6 leading-relaxed">
                    &quot;{videoTestimonials[activeVideo].quote}&quot;
                  </blockquote>
                  <p className="text-white font-semibold text-lg">{videoTestimonials[activeVideo].name}</p>
                  <p className="text-gold/70 font-sans text-sm mt-1">{videoTestimonials[activeVideo].origin} — {videoTestimonials[activeVideo].program}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
