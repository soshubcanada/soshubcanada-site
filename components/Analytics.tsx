'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

/* ─────────── Google Analytics 4 ─────────── */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // G-XXXXXXXXXX

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    fbq: (...args: unknown[]) => void;
    clarity: (...args: unknown[]) => void;
  }
}

function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || typeof window.gtag !== 'function') return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('config', GA_ID, { page_path: url });
  }, [pathname, searchParams]);

  if (!GA_ID) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}

/* ─────────── Meta / Facebook Pixel ─────────── */
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!FB_PIXEL_ID || typeof window.fbq !== 'function') return;
    window.fbq('track', 'PageView');
  }, [pathname]);

  if (!FB_PIXEL_ID) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}

/* ─────────── Microsoft Clarity (heatmaps + sessions) ─────────── */
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

function MicrosoftClarity() {
  if (!CLARITY_ID) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window,document,"clarity","script","${CLARITY_ID}");
        `,
      }}
    />
  );
}

/* ─────────── Event Tracking Utility ─────────── */
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  // GA4
  if (GA_ID && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Meta Pixel custom event
  if (FB_PIXEL_ID && typeof window.fbq === 'function') {
    window.fbq('trackCustom', action, { category, label, value });
  }
}

/* Pre-defined events for immigration site */
export const events = {
  ctaClick: (label: string) => trackEvent('cta_click', 'conversion', label),
  evaluationStart: () => trackEvent('evaluation_start', 'funnel', 'admissibilite'),
  evaluationComplete: (programs: number) => trackEvent('evaluation_complete', 'funnel', `${programs}_programs`, programs),
  whatsappClick: (page: string) => trackEvent('whatsapp_click', 'contact', page),
  phoneClick: (page: string) => trackEvent('phone_click', 'contact', page),
  newsletterSubscribe: () => trackEvent('newsletter_subscribe', 'engagement'),
  programView: (name: string) => trackEvent('program_view', 'content', name),
  faqOpen: (question: string) => trackEvent('faq_open', 'engagement', question),
};

/* ─────────── UTM Parameter Persistence ─────────── */
function UTMHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const utmData: Record<string, string> = {};
    let hasUTM = false;

    utmKeys.forEach(key => {
      const val = searchParams.get(key);
      if (val) {
        utmData[key] = val;
        hasUTM = true;
      }
    });

    if (hasUTM) {
      // Store UTM params for 30 days
      utmData._timestamp = new Date().toISOString();
      sessionStorage.setItem('soshub_utm', JSON.stringify(utmData));
      localStorage.setItem('soshub_utm', JSON.stringify(utmData));
    }
  }, [searchParams]);

  return null;
}

/* ─────────── Main Export ─────────── */
export function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <VercelAnalytics />
      <SpeedInsights />
      <GoogleAnalytics />
      <MetaPixel />
      <MicrosoftClarity />
      <UTMHandler />
    </Suspense>
  );
}
