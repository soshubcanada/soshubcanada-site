export function WavePattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <g stroke="#1D9E75" fill="none" opacity="0.05">
          <path d="M0 30 Q150 10 300 30 Q450 50 600 30 Q750 10 900 30 Q1050 50 1200 30 Q1350 10 1500 30" strokeWidth="2" />
          <path d="M0 70 Q150 50 300 70 Q450 90 600 70 Q750 50 900 70 Q1050 90 1200 70 Q1350 50 1500 70" strokeWidth="1.5" />
          <path d="M0 110 Q150 90 300 110 Q450 130 600 110 Q750 90 900 110 Q1050 130 1200 110 Q1350 90 1500 110" strokeWidth="2" />
          <path d="M0 150 Q150 130 300 150 Q450 170 600 150 Q750 130 900 150 Q1050 170 1200 150 Q1350 130 1500 150" strokeWidth="1.5" />
          <path d="M0 190 Q150 170 300 190 Q450 210 600 190 Q750 170 900 190 Q1050 210 1200 190 Q1350 170 1500 190" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

export function TopoPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#085041" fill="none" opacity="0.04" strokeWidth="1">
          {/* Contour group 1 — center */}
          <ellipse cx="50%" cy="45%" rx="320" ry="200" />
          <ellipse cx="50%" cy="45%" rx="260" ry="160" />
          <ellipse cx="50%" cy="45%" rx="200" ry="120" />
          <ellipse cx="50%" cy="45%" rx="140" ry="85" />
          <ellipse cx="50%" cy="45%" rx="80" ry="50" />
          <ellipse cx="50%" cy="45%" rx="35" ry="22" />
          {/* Contour group 2 — offset top-right */}
          <ellipse cx="75%" cy="30%" rx="180" ry="110" />
          <ellipse cx="75%" cy="30%" rx="130" ry="80" />
          <ellipse cx="75%" cy="30%" rx="80" ry="50" />
          <ellipse cx="75%" cy="30%" rx="35" ry="22" />
          {/* Contour group 3 — offset bottom-left */}
          <ellipse cx="20%" cy="70%" rx="150" ry="90" />
          <ellipse cx="20%" cy="70%" rx="100" ry="60" />
          <ellipse cx="20%" cy="70%" rx="50" ry="30" />
        </g>
      </svg>
    </div>
  );
}

export function GridDotPattern() {
  const spacing = 40;
  const cols = 40;
  const rows = 25;

  const dots: React.ReactElement[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const isLarge = (row + col) % 3 === 0;
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={col * spacing + spacing / 2}
          cy={row * spacing + spacing / 2}
          r={isLarge ? 1.5 : 1}
          fill="#085041"
          opacity={isLarge ? 0.06 : 0.03}
        />
      );
    }
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        {dots}
      </svg>
    </div>
  );
}

export function DiagonalLinesPattern() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="diag-lines"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="20"
              stroke="#D97706"
              strokeWidth="1"
              opacity="0.05"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diag-lines)" />
      </svg>
    </div>
  );
}
