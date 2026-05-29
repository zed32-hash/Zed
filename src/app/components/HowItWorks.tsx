import { motion } from "motion/react";
import { ShieldOff, MessageSquare, Eye } from "lucide-react";

interface HowItWorksProps {
  dark: boolean;
}

const cards = [
  {
    id: 1,
    icon: ShieldOff,
    tag: "01 / Identity Lock",
    title: "Masked from the start.",
    body: "Randomized avatars, zero data leaks, and a custom alias that protects your real identity. The system doesn't know who you are — and neither do they.",
    accentLight: "#5C31F2",
    accentDark: "#7C3AED",
    iconBgLight: "rgba(92,49,242,0.1)",
    iconBgDark: "rgba(124,58,237,0.15)",
  },
  {
    id: 2,
    icon: MessageSquare,
    tag: "02 / The Crucible",
    title: "20 messages. Make them count.",
    body: "Automated daily limits mean every word matters. No spam, no shallow scroll. Just sharp conversation that reveals who you actually are.",
    accentLight: "#FF844B",
    accentDark: "#FF5353",
    iconBgLight: "rgba(255,132,75,0.1)",
    iconBgDark: "rgba(255,83,83,0.15)",
  },
  {
    id: 3,
    icon: Eye,
    tag: "03 / Tiered Unlocks",
    title: "Depth clears the blur.",
    body: "Deep conversations gradually lift the veil. The more you connect, the more you see. Photos, voice, real name — earned, never handed out.",
    accentLight: "#06b6d4",
    accentDark: "#22d3ee",
    iconBgLight: "rgba(6,182,212,0.1)",
    iconBgDark: "rgba(34,211,238,0.12)",
  },
];

export function HowItWorks({ dark }: HowItWorksProps) {
  return (
    <section
      className="relative py-24 px-6 overflow-hidden"
      style={{
        background: dark
          ? "linear-gradient(180deg, #0A0914 0%, #0E0B1E 100%)"
          : "linear-gradient(180deg, #FBF9F4 0%, #F4F0FC 100%)",
      }}
    >
      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
          mixBlendMode: dark ? "overlay" : "multiply",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: dark ? "#7C3AED" : "#5C31F2",
              marginBottom: "1rem",
            }}
          >
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "'Clash Display', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: dark ? "#F5F5FA" : "#1A173B",
            }}
          >
            Three rules that change everything.
          </motion.h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative p-8 rounded-3xl overflow-hidden group"
                style={{
                  background: dark
                    ? "rgba(28,18,54,0.6)"
                    : "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${dark ? "rgba(124,58,237,0.2)" : "rgba(92,49,242,0.12)"}`,
                  boxShadow: dark
                    ? "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
                    : "0 8px 40px rgba(92,49,242,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                {/* Background accent glow */}
                <div
                  className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: dark ? card.accentDark : card.accentLight }}
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: dark ? card.iconBgDark : card.iconBgLight,
                    border: `1px solid ${dark ? `${card.accentDark}33` : `${card.accentLight}22`}`,
                  }}
                >
                  <Icon size={22} style={{ color: dark ? card.accentDark : card.accentLight }} />
                </div>

                {/* Tag */}
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: dark ? card.accentDark : card.accentLight,
                    marginBottom: "0.75rem",
                  }}
                >
                  {card.tag}
                </p>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "'Clash Display', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.4rem",
                    lineHeight: 1.2,
                    color: dark ? "#F5F5FA" : "#1A173B",
                    marginBottom: "1rem",
                  }}
                >
                  {card.title}
                </h3>

                {/* Body */}
                <p
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "0.925rem",
                    lineHeight: 1.65,
                    color: dark ? "#A6A4C5" : "#7B78A8",
                  }}
                >
                  {card.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
