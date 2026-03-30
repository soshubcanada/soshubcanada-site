"use client";

const BRAND_COLORS = ["#085041", "#1D9E75", "#D97706", "#003DA5"];

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  duration: number;
  delay: number;
  isCircle: boolean;
}

function seededParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < 10; i++) {
    const seed = (i * 7 + 3) % 100;
    particles.push({
      x: (seed * 9.7) % 100,
      y: (seed * 6.3) % 100,
      size: 4 + (seed % 9),
      color: BRAND_COLORS[i % BRAND_COLORS.length],
      opacity: 0.05 + (seed % 10) * 0.01,
      duration: 8 + (seed % 13),
      delay: (seed % 10),
      isCircle: i % 3 !== 0,
    });
  }
  return particles;
}

const particles = seededParticles();

export default function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.opacity,
            borderRadius: p.isCircle ? "50%" : "3px",
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
