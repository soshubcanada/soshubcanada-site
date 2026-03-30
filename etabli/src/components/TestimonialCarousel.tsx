"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useLang } from "@/lib/i18n";

interface Testimonial {
  name: string;
  flag: string;
  origin: { fr: string; en: string };
  quote: { fr: string; en: string };
}

const testimonials: Testimonial[] = [
  {
    name: "Fatima B.",
    flag: "\u{1F1F2}\u{1F1E6}",
    origin: { fr: "Casablanca, Maroc", en: "Casablanca, Morocco" },
    quote: {
      fr: "Gr\u00e2ce \u00e0 \u00e9tabli, j\u2019ai obtenu 620 points Arrima en 3 mois. Le parcours \u00e9tait clair et motivant.",
      en: "Thanks to \u00e9tabli, I scored 620 Arrima points in 3 months. The path was clear and motivating.",
    },
  },
  {
    name: "Carlos M.",
    flag: "\u{1F1E8}\u{1F1F4}",
    origin: { fr: "Bogot\u00e1, Colombie", en: "Bogot\u00e1, Colombia" },
    quote: {
      fr: "L\u2019outil de francisation m\u2019a permis de passer de z\u00e9ro \u00e0 B2 en fran\u00e7ais. Incroyable\u00a0!",
      en: "The francisation tool helped me go from zero to B2 in French. Incredible!",
    },
  },
  {
    name: "Anh T.",
    flag: "\u{1F1FB}\u{1F1F3}",
    origin: { fr: "H\u00f4-Chi-Minh-Ville, Vietnam", en: "Ho Chi Minh City, Vietnam" },
    quote: {
      fr: "Le simulateur Arrima m\u2019a aid\u00e9 \u00e0 comprendre exactement quoi am\u00e9liorer dans mon profil.",
      en: "The Arrima simulator helped me understand exactly what to improve in my profile.",
    },
  },
  {
    name: "Amina D.",
    flag: "\u{1F1F8}\u{1F1F3}",
    origin: { fr: "Dakar, S\u00e9n\u00e9gal", en: "Dakar, Senegal" },
    quote: {
      fr: "J\u2019ai trouv\u00e9 un employeur d\u00e9sign\u00e9 en 6 semaines. Le matching est tr\u00e8s efficace.",
      en: "I found a designated employer in 6 weeks. The matching is very effective.",
    },
  },
  {
    name: "Omar R.",
    flag: "\u{1F1F9}\u{1F1F3}",
    origin: { fr: "Tunis, Tunisie", en: "Tunis, Tunisia" },
    quote: {
      fr: "Le suivi personnalis\u00e9 m\u2019a guid\u00e9 \u00e0 chaque \u00e9tape. Je suis maintenant r\u00e9sident permanent.",
      en: "The personalized guidance walked me through every step. I\u2019m now a permanent resident.",
    },
  },
];

export default function TestimonialCarousel() {
  const { lang } = useLang();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const scrollTo = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const card = el.children[index] as HTMLElement | undefined;
      if (card) {
        el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
      }
      setActive(index);
    },
    []
  );

  /* auto-advance */
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % count;
        scrollTo(next);
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [paused, count, scrollTo]);

  /* sync active dot on manual scroll */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const scrollLeft = el.scrollLeft;
      const cardWidth = (el.children[0] as HTMLElement)?.offsetWidth ?? 1;
      const idx = Math.round(scrollLeft / cardWidth);
      setActive(Math.min(idx, count - 1));
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, [count]);

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[85vw] max-w-md bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between"
            style={{ scrollSnapAlign: "center" }}
          >
            <p className="text-gray-700 text-base leading-relaxed italic mb-6">
              &ldquo;{lang === "fr" ? t.quote.fr : t.quote.en}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{t.flag}</span>
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">
                  {lang === "fr" ? t.origin.fr : t.origin.en}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* dots */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Testimonial ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: active === i ? 24 : 8,
              height: 8,
              backgroundColor: active === i ? "#1D9E75" : "#D1D5DB",
            }}
          />
        ))}
      </div>
    </div>
  );
}
