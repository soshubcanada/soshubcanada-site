export default function MontrealSkyline() {
  return (
    <svg
      viewBox="0 0 600 300"
      width="100%"
      height="auto"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Abstract Montreal skyline illustration"
    >
      {/* Sky background */}
      <rect width="600" height="300" fill="#003DA5" opacity="0.1" rx="4" />

      {/* Clouds */}
      <g opacity="0.15" fill="#003DA5">
        <ellipse cx="90" cy="50" rx="35" ry="12" />
        <ellipse cx="110" cy="46" rx="25" ry="10" />
        <ellipse cx="430" cy="35" rx="40" ry="11" />
        <ellipse cx="455" cy="31" rx="28" ry="9" />
        <ellipse cx="260" cy="60" rx="30" ry="9" />
      </g>

      {/* Olympic Stadium arc — left side */}
      <g opacity="0.85">
        <path
          d="M60 220 Q65 120 100 100 L105 105 Q70 125 65 220 Z"
          fill="#085041"
        />
        <ellipse cx="82" cy="220" rx="40" ry="12" fill="#085041" opacity="0.9" />
        <path
          d="M62 215 Q80 200 100 215"
          stroke="#1D9E75"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
      </g>

      {/* Biosphere dome — right of stadium */}
      <g opacity="0.8">
        <path
          d="M150 220 A40 40 0 0 1 230 220 Z"
          fill="#085041"
        />
        <path
          d="M160 220 A32 32 0 0 1 220 220"
          stroke="#1D9E75"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M170 220 A24 24 0 0 1 210 220"
          stroke="#1D9E75"
          strokeWidth="1"
          fill="none"
          opacity="0.3"
        />
        <line x1="190" y1="180" x2="190" y2="220" stroke="#1D9E75" strokeWidth="1" opacity="0.3" />
        <line x1="165" y1="200" x2="215" y2="200" stroke="#1D9E75" strokeWidth="1" opacity="0.3" />
      </g>

      {/* Downtown buildings — varying heights */}
      <g fill="#085041">
        <rect x="240" y="130" width="22" height="90" opacity="0.9" rx="1" />
        <rect x="266" y="110" width="18" height="110" opacity="0.85" rx="1" />
        <rect x="288" y="145" width="25" height="75" opacity="0.95" rx="1" />
        <rect x="370" y="120" width="20" height="100" opacity="0.9" rx="1" />
        <rect x="394" y="140" width="24" height="80" opacity="0.85" rx="1" />
        <rect x="422" y="155" width="16" height="65" opacity="0.9" rx="1" />
        <rect x="442" y="135" width="20" height="85" opacity="0.88" rx="1" />
      </g>

      {/* Building window accents */}
      <g fill="#1D9E75" opacity="0.3">
        <rect x="244" y="140" width="4" height="4" rx="0.5" />
        <rect x="252" y="140" width="4" height="4" rx="0.5" />
        <rect x="244" y="155" width="4" height="4" rx="0.5" />
        <rect x="252" y="155" width="4" height="4" rx="0.5" />
        <rect x="270" y="120" width="4" height="4" rx="0.5" />
        <rect x="270" y="135" width="4" height="4" rx="0.5" />
        <rect x="375" y="130" width="3" height="3" rx="0.5" />
        <rect x="381" y="130" width="3" height="3" rx="0.5" />
        <rect x="375" y="145" width="3" height="3" rx="0.5" />
        <rect x="381" y="145" width="3" height="3" rx="0.5" />
      </g>

      {/* Mont-Royal with cross — center, tallest */}
      <g>
        <path
          d="M270 220 Q310 70 350 220 Z"
          fill="#085041"
          opacity="0.9"
        />
        <path
          d="M285 220 Q310 100 335 220 Z"
          fill="#1D9E75"
          opacity="0.25"
        />
        {/* Cross on top */}
        <rect x="307" y="72" width="6" height="28" fill="#D97706" opacity="0.8" rx="1" />
        <rect x="300" y="80" width="20" height="5" fill="#D97706" opacity="0.8" rx="1" />
      </g>

      {/* Jacques-Cartier bridge silhouette — bottom */}
      <g opacity="0.7">
        <path
          d="M0 250 Q75 235 150 242 Q225 248 300 240 Q375 232 450 238 Q525 244 600 248"
          stroke="#085041"
          strokeWidth="3"
          fill="none"
        />
        {/* Bridge supports */}
        <line x1="100" y1="242" x2="100" y2="260" stroke="#085041" strokeWidth="2" />
        <line x1="200" y1="244" x2="200" y2="260" stroke="#085041" strokeWidth="2" />
        <line x1="300" y1="240" x2="300" y2="260" stroke="#085041" strokeWidth="2" />
        <line x1="400" y1="236" x2="400" y2="260" stroke="#085041" strokeWidth="2" />
        <line x1="500" y1="242" x2="500" y2="260" stroke="#085041" strokeWidth="2" />
        {/* Bridge cables */}
        <path
          d="M100 242 Q150 228 200 244"
          stroke="#1D9E75"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M300 240 Q350 226 400 236"
          stroke="#1D9E75"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />
      </g>

      {/* St. Lawrence River — wavy lines at bottom */}
      <g opacity="0.5">
        <path
          d="M0 270 Q50 262 100 270 Q150 278 200 270 Q250 262 300 270 Q350 278 400 270 Q450 262 500 270 Q550 278 600 270"
          stroke="#1D9E75"
          strokeWidth="2"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M0 280 Q50 273 100 280 Q150 287 200 280 Q250 273 300 280 Q350 287 400 280 Q450 273 500 280 Q550 287 600 280"
          stroke="#1D9E75"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M0 290 Q60 284 120 290 Q180 296 240 290 Q300 284 360 290 Q420 296 480 290 Q540 284 600 290"
          stroke="#1D9E75"
          strokeWidth="1"
          fill="none"
          opacity="0.3"
        />
      </g>

      {/* Maple leaf accent — near the mountain */}
      <g transform="translate(355, 185) scale(0.6)" opacity="0.7">
        <path
          d="M10 0 L12 7 L19 7 L13 11 L15 18 L10 14 L5 18 L7 11 L1 7 L8 7 Z"
          fill="#D97706"
        />
      </g>
    </svg>
  );
}
