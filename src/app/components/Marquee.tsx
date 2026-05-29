import { motion } from "motion/react";

interface MarqueeProps {
  dark: boolean;
}

const items = [
  "BLIND DATE HAPPY HOUR STARTS TONIGHT AT 8:00 PM LOCAL TIME",
  "GET READY TO DROP IN",
  "ZERO PHOTOS · PURE VIBE",
  "YOUR ALIAS. YOUR RULES.",
  "THE 20-MSG CRUCIBLE IS LIVE",
  "GHOST MODE UNLOCKED",
];

export function Marquee({ dark }: MarqueeProps) {
  const text = items.join("  •  ");
  const repeated = `${text}  •  ${text}  •  `;

  return (
    <div
      className="overflow-hidden py-4 relative"
      style={{
        background: dark
          ? "linear-gradient(90deg, #5C31F2, #7C3AED)"
          : "linear-gradient(90deg, #1A173B, #5C31F2)",
        borderTop: `1px solid ${dark ? "rgba(124,58,237,0.5)" : "rgba(26,23,59,0.3)"}`,
        borderBottom: `1px solid ${dark ? "rgba(124,58,237,0.5)" : "rgba(26,23,59,0.3)"}`,
      }}
    >
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, "-50%"] }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <span
          style={{
            fontFamily: "'Clash Display', sans-serif",
            fontWeight: 600,
            fontSize: "0.8rem",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.92)",
            textTransform: "uppercase",
            paddingRight: "2rem",
          }}
        >
          {repeated}
        </span>
        <span
          aria-hidden
          style={{
            fontFamily: "'Clash Display', sans-serif",
            fontWeight: 600,
            fontSize: "0.8rem",
            letterSpacing: "0.12em",
            color: "rgba(255,255,255,0.92)",
            textTransform: "uppercase",
          }}
        >
          {repeated}
        </span>
      </motion.div>
    </div>
  );
}
