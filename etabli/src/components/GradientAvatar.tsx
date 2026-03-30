import React from "react";

interface GradientAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

const GRADIENTS = [
  "linear-gradient(135deg, #085041, #1D9E75)",
  "linear-gradient(135deg, #1D9E75, #34D399)",
  "linear-gradient(135deg, #D97706, #FBBF24)",
  "linear-gradient(135deg, #003DA5, #3B82F6)",
  "linear-gradient(135deg, #085041, #D97706)",
  "linear-gradient(135deg, #003DA5, #1D9E75)",
  "linear-gradient(135deg, #1D9E75, #D97706)",
  "linear-gradient(135deg, #003DA5, #085041)",
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (words[0]?.[0] ?? "?").toUpperCase();
}

export default function GradientAvatar({
  name,
  size = 48,
  className = "",
}: GradientAvatarProps) {
  const index = hashName(name) % GRADIENTS.length;
  const initials = getInitials(name);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: GRADIENTS[index],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.38,
        lineHeight: 1,
        flexShrink: 0,
      }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
