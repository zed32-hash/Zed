import { motion } from "motion/react";
import { FloatingShapes } from "./FloatingShapes";

interface HeroProps {
  dark: boolean;
}

export function Hero({ dark }: HeroProps) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 overflow-hidden"
      style={{
        background: dark
          ? "linear-gradient(160deg, #0A0914 0%, #1C1236 50%, #0E1A24 100%)"
          : "linear-gradient(160deg, #FBF9F4 0%, #E3DCF8 55%, #D9E7F9 100%)",
      }}
    >
      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
          mixBlendMode: dark ? "overlay" : "multiply",
        }}
      />

      {/* Floating shapes */}
      <FloatingShapes />

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: dark ? "rgba(124,58,237,0.15)" : "rgba(92,49,242,0.08)",
            border: `1px solid ${dark ? "rgba(124,58,237,0.35)" : "rgba(92,49,242,0.2)"}`,
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#FF844B" }}
          />
          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: dark ? "#A6A4C5" : "#7B78A8",
            }}
          >
            Now in private beta
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontFamily: "'Clash Display', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(3rem, 8vw, 7rem)",
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            color: dark ? "#F5F5FA" : "#1A173B",
            marginBottom: "1.5rem",
          }}
        >
          Where personalities{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #5C31F2, #FF844B)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            take shape.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            fontWeight: 400,
            color: dark ? "#A6A4C5" : "#7B78A8",
            maxWidth: "560px",
            margin: "0 auto 2.5rem",
            lineHeight: 1.65,
          }}
        >
          An anonymous dating space driven by vibe, not visibility. Your words do the talking — your face stays locked.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#"
            className="px-8 py-4 rounded-2xl transition-all group"
            style={{
              background: "linear-gradient(135deg, #5C31F2, #7C3AED)",
              color: "#fff",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "-0.01em",
              boxShadow: "0 8px 32px rgba(92,49,242,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
              textDecoration: "none",
              display: "inline-block",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(92,49,242,0.55), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(92,49,242,0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
          >
            Launch App →
          </a>

          <a
            href="#"
            className="px-8 py-4 rounded-2xl transition-all"
            style={{
              background: "transparent",
              color: dark ? "#F5F5FA" : "#1A173B",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              fontSize: "1rem",
              border: `1.5px solid ${dark ? "rgba(245,245,250,0.25)" : "rgba(26,23,59,0.2)"}`,
              textDecoration: "none",
              display: "inline-block",
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = dark ? "rgba(245,245,250,0.07)" : "rgba(26,23,59,0.04)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            Read the Manifest
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex items-center justify-center gap-3 mt-10"
        >
          <div className="flex -space-x-3">
            {["#a78bfa", "#f9a8d4", "#6ee7b7", "#fbbf24", "#818cf8"].map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${color}, ${color}88)`,
                  borderColor: dark ? "#0A0914" : "#FBF9F4",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              />
            ))}
          </div>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.875rem",
            color: dark ? "#A6A4C5" : "#7B78A8",
          }}>
            <strong style={{ color: dark ? "#F5F5FA" : "#1A173B" }}>4,200+</strong> aliases already dropped in
          </span>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent, ${dark ? "#0A0914" : "#FBF9F4"})`,
        }}
      />
    </section>
  );
}
