'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

const notifications = [
  { name: 'Amina B.', city: 'Casablanca', action: 'a obtenu son CSQ', time: 'il y a 2h' },
  { name: 'Karim M.', city: 'Alger', action: 'a reçu son ITA', time: 'il y a 4h' },
  { name: 'Fatima Z.', city: 'Tunis', action: 'a complété son évaluation', time: 'il y a 15 min' },
  { name: 'Youssef E.', city: 'Rabat', action: 'a déposé son dossier', time: 'il y a 1h' },
  { name: 'Nadia K.', city: 'Oran', action: 'a obtenu son permis de travail', time: 'il y a 3h' },
  { name: 'Mehdi R.', city: 'Marrakech', action: 'a commencé son plan d\'action', time: 'il y a 30 min' },
  { name: 'Leila S.', city: 'Sfax', action: 'a complété son évaluation', time: 'il y a 8 min' },
];

export function SocialProofToast() {
  const [current, setCurrent] = useState<number | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // First toast after 8 seconds
    const initialDelay = setTimeout(() => {
      setCurrent(0);
      setShow(true);
    }, 8000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (current === null) return;

    // Hide after 4 seconds
    const hideTimer = setTimeout(() => setShow(false), 4000);

    // Show next after 20-35s (random interval for realism)
    const nextTimer = setTimeout(() => {
      const next = (current + 1) % notifications.length;
      setCurrent(next);
      setShow(true);
    }, 20000 + Math.random() * 15000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [current]);

  if (current === null || !show) return null;

  const n = notifications[current];

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 md:left-6 z-40 animate-slide-in-left">
      <div
        className="glass-white rounded-xl px-4 py-3 shadow-xl border border-gray-100 max-w-[300px] cursor-pointer hover:shadow-2xl transition-shadow"
        onClick={() => setShow(false)}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy">
              {n.name} <span className="font-normal text-gray-400">de {n.city}</span>
            </p>
            <p className="text-xs text-gray-500 font-sans">{n.action}</p>
            <p className="text-[10px] text-gray-300 font-sans mt-1">{n.time}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
