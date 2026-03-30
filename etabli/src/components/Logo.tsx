// ========================================================
// SOS Hub Canada - Logo Component
// Usage: <Logo size={40} /> or <Logo size={80} variant="white" />
// ========================================================

interface LogoProps {
  size?: number;
  variant?: 'default' | 'white' | 'dark';
  className?: string;
}

export function Logo({ size = 40, variant = 'default', className = '' }: LogoProps) {
  const sosColor = variant === 'white' ? '#FFFFFF' : '#1B2559';
  const hubColor = variant === 'white' ? '#D4A03C' : '#D4A03C';
  const bracketColor = variant === 'white' ? '#FFFFFF' : '#1B2559';

  const w = size * 2.33;
  const h = size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 120"
      width={w}
      height={h}
      className={className}
      aria-label="SOS Hub Canada"
    >
      {/* Left bracket */}
      <path d="M10 10 H30 V18 H18 V102 H30 V110 H10 V10Z" fill={bracketColor} />
      {/* Right bracket */}
      <path d="M250 10 H270 V110 H250 V102 H262 V18 H250 V10Z" fill={bracketColor} />
      {/* SOS text */}
      <text x="140" y="72" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="62" fill={sosColor} letterSpacing="-1">SOS</text>
      {/* HUB text */}
      <text x="140" y="105" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="36" fill={hubColor} letterSpacing="8">HUB</text>
    </svg>
  );
}

// Inline SVG string for use in HTML templates (contracts, emails)
export function getLogoSVGString(variant: 'default' | 'white' = 'default'): string {
  const sosColor = variant === 'white' ? '#FFFFFF' : '#1B2559';
  const hubColor = '#D4A03C';
  const bracketColor = variant === 'white' ? '#FFFFFF' : '#1B2559';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" width="200" height="86">
    <path d="M10 10 H30 V18 H18 V102 H30 V110 H10 V10Z" fill="${bracketColor}"/>
    <path d="M250 10 H270 V110 H250 V102 H262 V18 H250 V10Z" fill="${bracketColor}"/>
    <text x="140" y="72" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="62" fill="${sosColor}" letter-spacing="-1">SOS</text>
    <text x="140" y="105" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="36" fill="${hubColor}" letter-spacing="8">HUB</text>
  </svg>`;
}
