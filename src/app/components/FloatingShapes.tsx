import { motion } from "motion/react";

const shapes = [
  {
    id: 1,
    type: "heart",
    className: "top-[8%] left-[6%] w-20 h-20",
    gradient: "from-[#a78bfa] to-[#7C3AED]",
    delay: 0,
    duration: 6,
    rotate: -15,
  },
  {
    id: 2,
    type: "sphere",
    className: "top-[15%] right-[8%] w-28 h-28",
    gradient: "from-[#FF844B] to-[#f97316]",
    delay: 1.2,
    duration: 7,
    rotate: 0,
  },
  {
    id: 3,
    type: "ztwist",
    className: "bottom-[20%] left-[4%] w-24 h-24",
    gradient: "from-[#5C31F2] to-[#818cf8]",
    delay: 0.6,
    duration: 8,
    rotate: 20,
  },
  {
    id: 4,
    type: "blob",
    className: "bottom-[30%] right-[5%] w-20 h-20",
    gradient: "from-[#FF844B] to-[#fbbf24]",
    delay: 2,
    duration: 5.5,
    rotate: -20,
  },
  {
    id: 5,
    type: "heart",
    className: "top-[45%] left-[2%] w-14 h-14",
    gradient: "from-[#f9a8d4] to-[#ec4899]",
    delay: 0.9,
    duration: 7,
    rotate: 10,
  },
  {
    id: 6,
    type: "sphere",
    className: "top-[55%] right-[3%] w-16 h-16",
    gradient: "from-[#6ee7b7] to-[#06b6d4]",
    delay: 1.5,
    duration: 6.5,
    rotate: 0,
  },
];

function HeartShape({ gradient }: { gradient: string }) {
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} shadow-2xl`}
      style={{
        borderRadius: "50% 50% 45% 45% / 60% 60% 40% 40%",
        clipPath: "path('M 50 85 C 10 55 0 35 0 25 C 0 5 18 0 30 0 C 40 0 48 8 50 15 C 52 8 60 0 70 0 C 82 0 100 5 100 25 C 100 35 90 55 50 85 Z')",
        filter: "drop-shadow(0 8px 24px rgba(92,49,242,0.35))",
      }}
    />
  );
}

function SphereShape({ gradient }: { gradient: string }) {
  return (
    <div className={`w-full h-full rounded-full bg-gradient-to-br ${gradient}`}
      style={{
        boxShadow: "inset -6px -6px 18px rgba(0,0,0,0.2), inset 4px 4px 12px rgba(255,255,255,0.25), 0 12px 40px rgba(92,49,242,0.3)",
      }}
    />
  );
}

function ZShape({ gradient }: { gradient: string }) {
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
      style={{
        borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
        boxShadow: "0 12px 40px rgba(92,49,242,0.4), inset 2px 2px 8px rgba(255,255,255,0.2)",
      }}
    >
      <span style={{
        fontFamily: "'Clash Display', sans-serif",
        fontWeight: 700,
        fontSize: "2rem",
        color: "rgba(255,255,255,0.9)",
        textShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}>Z</span>
    </div>
  );
}

function BlobShape({ gradient }: { gradient: string }) {
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient}`}
      style={{
        borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
        boxShadow: "0 12px 40px rgba(255,132,75,0.35), inset 2px 2px 8px rgba(255,255,255,0.25)",
      }}
    />
  );
}

export function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute ${shape.className}`}
          initial={{ y: 0, rotate: shape.rotate }}
          animate={{
            y: [0, -18, 0, 12, 0],
            rotate: [shape.rotate, shape.rotate + 8, shape.rotate - 5, shape.rotate + 3, shape.rotate],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {shape.type === "heart" && <HeartShape gradient={shape.gradient} />}
          {shape.type === "sphere" && <SphereShape gradient={shape.gradient} />}
          {shape.type === "ztwist" && <ZShape gradient={shape.gradient} />}
          {shape.type === "blob" && <BlobShape gradient={shape.gradient} />}
        </motion.div>
      ))}

      {/* Ambient blobs */}
      <div
        className="absolute top-[-10%] left-[20%] w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #7C3AED, transparent)" }}
      />
      <div
        className="absolute bottom-[-5%] right-[15%] w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #FF844B, transparent)" }}
      />
    </div>
  );
}
