'use client';

import Link from 'next/link';
import { events } from '@/components/Analytics';
import type { ComponentProps } from 'react';

type TrackedLinkProps = ComponentProps<typeof Link> & {
  trackLabel: string;
};

export function TrackedLink({ trackLabel, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        events.ctaClick(trackLabel);
        onClick?.(e);
      }}
    />
  );
}

type TrackedAnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  trackLabel: string;
  trackType?: 'whatsapp' | 'phone' | 'cta';
};

export function TrackedAnchor({ trackLabel, trackType = 'cta', onClick, ...props }: TrackedAnchorProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        if (trackType === 'whatsapp') events.whatsappClick(trackLabel);
        else if (trackType === 'phone') events.phoneClick(trackLabel);
        else events.ctaClick(trackLabel);
        onClick?.(e);
      }}
    />
  );
}
