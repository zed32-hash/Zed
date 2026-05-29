import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";

interface HappyHourProps {
  dark: boolean;
}

function getNextHappyHour() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(20, 0, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  return target;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function HappyHour({ dark }: HappyHourProps) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, getNextHappyHour().getTime() - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative py-32 px-6 overflow-hidden"
      style={{
        background: dark
          ? "linear-gradient(135deg, #0E0B1E 0%, #1C1236 50%, #0E1A24 100%)"
          : "linear-gradient(135deg, #E3DCF8 0%, #D9E7F9 100%)",
      }}
    >
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
          mixBlendMode: dark ? "overlay" : "multiply",
        }}
      />

      {/* Large ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: dark ? "rgba(124,58,237,0.15)" : "rgba(92,49,242,0.1)" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: dark ? "rgba(255,83,83,0.12)" : "rgba(255,132,75,0.1)",
            border: `1px solid ${dark ? "rgba(255,83,83,0.3)" : "rgba(255,132,75,0.25)"}`,
          }}
        >
          <Zap size={14} style={{ color: dark ? "#FF5353" : "#FF844B" }} />
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: dark ? "#FF5353" : "#FF844B",
          }}>
            Blind Date Happy Hour
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: "'Clash Display', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2rem, 5vw, 3.75rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: dark ? "#F5F5FA" : "#1A173B",
            marginBottom: "1.25rem",
          }}
        >
          Tonight's drop starts in
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "1rem",
            color: dark ? "#A6A4C5" : "#7B78A8",
            marginBottom: "3rem",
            lineHeight: 1.6,
          }}
        >
          Every night at 8 PM, anonymous matching opens wide for 60 minutes. No filters, no bias — just personalities colliding.
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex items-end justify-center gap-4 mb-12"
        >
          {[
            { value: pad(timeLeft.h), label: "Hours" },
            { value: pad(timeLeft.m), label: "Minutes" },
            { value: pad(timeLeft.s), label: "Seconds" },
          ].map((unit, i) => (
            <div key={unit.label} className="flex items-end gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="rounded-2xl px-6 py-4 min-w-[5rem] text-center"
                  style={{
                    background: dark
                      ? "rgba(28,18,54,0.8)"
                      : "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(16px)",
                    border: `1px solid ${dark ? "rgba(124,58,237,0.25)" : "rgba(92,49,242,0.15)"}`,
                    boxShadow: dark
                      ? "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)"
                      : "0 4px 24px rgba(92,49,242,0.1), inset 0 1px 0 rgba(255,255,255,0.9)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Clash Display', sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(2.5rem, 6vw, 4rem)",
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                      color: dark ? "#F5F5FA" : "#1A173B",
                      display: "block",
                    }}
                  >
                    {unit.value}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: dark ? "#A6A4C5" : "#7B78A8",
                    marginTop: "0.6rem",
                  }}
                >
                  {unit.label}
                </span>
              </div>
              {i < 2 && (
                <span
                  style={{
                    fontFamily: "'Clash Display', sans-serif",
                    fontWeight: 700,
                    fontSize: "3rem",
                    lineHeight: 1,
                    color: dark ? "rgba(245,245,250,0.3)" : "rgba(26,23,59,0.2)",
                    marginBottom: "1.8rem",
                  }}
                >
                  :
                </span>
              )}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.a
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          href="#"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl"
          style={{
            background: dark
              ? "linear-gradient(135deg, #FF5353, #FF844B)"
              : "linear-gradient(135deg, #FF844B, #f97316)",
            color: "#fff",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            letterSpacing: "-0.01em",
            boxShadow: "0 8px 32px rgba(255,132,75,0.4)",
            textDecoration: "none",
          }}
        >
          <Zap size={18} />
          Set My Reminder
        </motion.a>
      </div>
    </section>
  );
}
