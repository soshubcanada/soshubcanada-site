'use client';
import { useEffect } from 'react';

export default function CrmError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') console.error(error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Une erreur est survenue</h2>
        <p className="text-sm text-gray-500 mb-6">Le module CRM a rencontré un problème. Veuillez réessayer.</p>
        <button onClick={reset} className="px-6 py-2.5 bg-[#1B2559] text-white rounded-lg text-sm font-medium hover:bg-[#1B2559]/90 transition-colors">
          Réessayer
        </button>
      </div>
    </div>
  );
}
