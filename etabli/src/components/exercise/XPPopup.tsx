"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

/**
 * Flying +XP animation that appears anywhere on screen.
 * Automatically removes itself after animation completes.
 */

interface XPPopupProps {
  amount: number;
  /** Unique key to trigger new popup (change to show again) */
  trigger: number;
}

export default function XPPopup({ amount, trigger }: XPPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (!visible || amount === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="xp-fly flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-lg">
        <Sparkles size={18} />
        +{amount} XP
      </div>
    </div>
  );
}
