interface IconProps {
  className?: string;
}

export function HousingIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="housing-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#085041" />
          <stop offset="100%" stopColor="#1D9E75" />
        </linearGradient>
      </defs>
      {/* House body */}
      <rect x="12" y="22" width="24" height="18" rx="2" fill="url(#housing-grad)" opacity="0.9" />
      {/* Roof */}
      <path d="M8 24 L24 10 L40 24 Z" fill="url(#housing-grad)" />
      {/* Door */}
      <rect x="20" y="30" width="8" height="10" rx="1" fill="#E1F5EE" opacity="0.8" />
      {/* Window */}
      <rect x="14" y="26" width="5" height="5" rx="0.5" fill="#E1F5EE" opacity="0.6" />
      <rect x="29" y="26" width="5" height="5" rx="0.5" fill="#E1F5EE" opacity="0.6" />
      {/* Maple leaf on roof */}
      <g transform="translate(22, 12) scale(0.45)">
        <path d="M10 0 L12 7 L19 7 L13 11 L15 18 L10 14 L5 18 L7 11 L1 7 L8 7 Z" fill="#D97706" opacity="0.9" />
      </g>
      {/* Chimney */}
      <rect x="30" y="13" width="4" height="8" rx="0.5" fill="#085041" opacity="0.8" />
    </svg>
  );
}

export function EmploymentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="employ-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1D9E75" />
          <stop offset="100%" stopColor="#085041" />
        </linearGradient>
      </defs>
      {/* Briefcase body */}
      <rect x="8" y="18" width="32" height="22" rx="3" fill="url(#employ-grad)" opacity="0.9" />
      {/* Handle */}
      <path d="M18 18 V14 A2 2 0 0 1 20 12 H28 A2 2 0 0 1 30 14 V18" stroke="url(#employ-grad)" strokeWidth="2.5" fill="none" />
      {/* Center clasp */}
      <rect x="21" y="24" width="6" height="4" rx="1" fill="#E1F5EE" opacity="0.8" />
      {/* Divider line */}
      <line x1="8" y1="28" x2="40" y2="28" stroke="#E1F5EE" strokeWidth="0.5" opacity="0.3" />
      {/* Upward arrow */}
      <g transform="translate(34, 8)">
        <path d="M4 12 L4 2 M1 5 L4 1 L7 5" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
      </g>
    </svg>
  );
}

export function FrenchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="french-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6B21A8" />
          <stop offset="100%" stopColor="#1D9E75" />
        </linearGradient>
      </defs>
      {/* Speech bubble */}
      <path
        d="M6 8 H42 A3 3 0 0 1 45 11 V30 A3 3 0 0 1 42 33 H18 L10 40 V33 H6 A3 3 0 0 1 3 30 V11 A3 3 0 0 1 6 8 Z"
        fill="url(#french-grad)"
        opacity="0.9"
      />
      {/* "Bonjour" text */}
      <text
        x="24"
        y="23"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#E1F5EE"
        fontSize="9"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        Bonjour
      </text>
      {/* Accent dots */}
      <circle cx="13" cy="15" r="1" fill="#E1F5EE" opacity="0.4" />
      <circle cx="35" cy="28" r="1" fill="#E1F5EE" opacity="0.4" />
    </svg>
  );
}

export function AdminIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="admin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#003DA5" />
          <stop offset="100%" stopColor="#1D9E75" />
        </linearGradient>
      </defs>
      {/* Clipboard */}
      <rect x="10" y="8" width="28" height="34" rx="3" fill="url(#admin-grad)" opacity="0.9" />
      {/* Clip */}
      <rect x="18" y="5" width="12" height="7" rx="2" fill="#085041" />
      <rect x="20" y="6" width="8" height="5" rx="1.5" fill="#E1F5EE" opacity="0.4" />
      {/* Lines */}
      <line x1="16" y1="20" x2="32" y2="20" stroke="#E1F5EE" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <line x1="16" y1="25" x2="28" y2="25" stroke="#E1F5EE" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <line x1="16" y1="30" x2="30" y2="30" stroke="#E1F5EE" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      {/* Checkmark */}
      <path d="M26 33 L30 37 L38 26" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
      {/* Stamp accent */}
      <circle cx="35" cy="38" r="5" fill="#D97706" opacity="0.2" />
    </svg>
  );
}

export function DailyLifeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="daily-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#1D9E75" />
        </linearGradient>
      </defs>
      {/* Coffee cup */}
      <path d="M10 18 H30 L28 40 H12 Z" fill="url(#daily-grad)" opacity="0.9" rx="2" />
      {/* Cup handle */}
      <path d="M30 22 Q38 22 38 28 Q38 34 30 34" stroke="url(#daily-grad)" strokeWidth="2.5" fill="none" opacity="0.8" />
      {/* Coffee surface */}
      <ellipse cx="20" cy="20" rx="9" ry="2" fill="#E1F5EE" opacity="0.3" />
      {/* Steam */}
      <path d="M16 14 Q14 10 16 6" stroke="#1D9E75" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round" />
      <path d="M20 12 Q18 8 20 4" stroke="#1D9E75" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round" />
      <path d="M24 14 Q22 10 24 6" stroke="#1D9E75" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round" />
      {/* Snowflake */}
      <g transform="translate(38, 8)" stroke="#003DA5" strokeWidth="1.2" opacity="0.6" strokeLinecap="round">
        <line x1="0" y1="-5" x2="0" y2="5" />
        <line x1="-4.3" y1="-2.5" x2="4.3" y2="2.5" />
        <line x1="-4.3" y1="2.5" x2="4.3" y2="-2.5" />
        <line x1="0" y1="-5" x2="-1.5" y2="-3.5" />
        <line x1="0" y1="-5" x2="1.5" y2="-3.5" />
        <line x1="0" y1="5" x2="-1.5" y2="3.5" />
        <line x1="0" y1="5" x2="1.5" y2="3.5" />
      </g>
    </svg>
  );
}

export function ÉtablissementIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="immig-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#085041" />
          <stop offset="100%" stopColor="#003DA5" />
        </linearGradient>
      </defs>
      {/* Passport body */}
      <rect x="10" y="6" width="28" height="36" rx="3" fill="url(#immig-grad)" opacity="0.9" />
      {/* Inner border */}
      <rect x="13" y="9" width="22" height="30" rx="1.5" stroke="#E1F5EE" strokeWidth="0.5" fill="none" opacity="0.3" />
      {/* Passport circle emblem */}
      <circle cx="24" cy="22" r="7" stroke="#E1F5EE" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="24" cy="22" r="4" stroke="#E1F5EE" strokeWidth="0.5" fill="none" opacity="0.3" />
      {/* Lines inside */}
      <line x1="17" y1="33" x2="31" y2="33" stroke="#E1F5EE" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      <line x1="19" y1="36" x2="29" y2="36" stroke="#E1F5EE" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      {/* Maple leaf bookmark */}
      <g transform="translate(33, 4)">
        <rect x="0" y="0" width="8" height="16" rx="1" fill="#D97706" opacity="0.85" />
        <path d="M4 4 L5 6.5 L7.5 6.5 L5.5 8 L6.2 10.5 L4 9 L1.8 10.5 L2.5 8 L0.5 6.5 L3 6.5 Z" fill="#E1F5EE" opacity="0.9" />
        <path d="M1 16 L4 13 L7 16" fill="#D97706" opacity="0.85" />
      </g>
    </svg>
  );
}
