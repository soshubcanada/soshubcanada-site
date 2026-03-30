export default function HeroDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large circle — top right */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1D9E75, #085041)",
          opacity: 0.1,
          filter: "blur(80px)",
        }}
      />
      {/* Medium circle — bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "-8%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "linear-gradient(225deg, #003DA5, #1D9E75)",
          opacity: 0.08,
          filter: "blur(100px)",
        }}
      />
      {/* Small rounded rectangle — center left */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "5%",
          width: 200,
          height: 200,
          borderRadius: 40,
          background: "linear-gradient(180deg, #D97706, #1D9E75)",
          opacity: 0.08,
          filter: "blur(60px)",
        }}
      />
      {/* Extra subtle accent — top left */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "30%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "linear-gradient(315deg, #085041, #003DA5)",
          opacity: 0.06,
          filter: "blur(90px)",
        }}
      />
    </div>
  );
}
