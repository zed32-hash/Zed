import { useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  dark: boolean;
  onToggleDark: () => void;
  onLaunchApp?: () => void;
}

export function Navbar({ dark, onToggleDark, onLaunchApp }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
      style={{
        background: dark
          ? "rgba(10, 9, 20, 0.7)"
          : "rgba(251, 249, 244, 0.7)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${dark ? "rgba(124,58,237,0.2)" : "rgba(92,49,242,0.1)"}`,
      }}
    >
      {/* Logo */}
      <a href="#" className="flex items-center gap-2 group">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #5C31F2, #7C3AED)",
            boxShadow: "0 4px 16px rgba(92,49,242,0.4)",
          }}
        >
          <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, color: "#fff", fontSize: "1.1rem" }}>Z</span>
        </div>
        <span
          style={{
            fontFamily: "'Clash Display', sans-serif",
            fontWeight: 700,
            fontSize: "1.4rem",
            color: dark ? "#F5F5FA" : "#1A173B",
            letterSpacing: "-0.02em",
          }}
        >
          ZED
        </span>
      </a>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8">
        {["About", "Manifesto", "Waitlist"].map((link) => (
          <a
            key={link}
            href="#"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 500,
              fontSize: "0.9rem",
              color: dark ? "#A6A4C5" : "#7B78A8",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = dark ? "#F5F5FA" : "#1A173B")}
            onMouseLeave={(e) => (e.currentTarget.style.color = dark ? "#A6A4C5" : "#7B78A8")}
          >
            {link}
          </a>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleDark}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: dark ? "rgba(124,58,237,0.15)" : "rgba(92,49,242,0.08)",
            border: `1px solid ${dark ? "rgba(124,58,237,0.3)" : "rgba(92,49,242,0.15)"}`,
            color: dark ? "#A6A4C5" : "#7B78A8",
          }}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          onClick={onLaunchApp}
          className="hidden md:flex items-center px-5 py-2 rounded-xl transition-all"
          style={{
            background: "linear-gradient(135deg, #5C31F2, #7C3AED)",
            color: "#fff",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600,
            fontSize: "0.875rem",
            boxShadow: "0 4px 16px rgba(92,49,242,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            border: "none",
            cursor: "pointer",
          }}
        >
          Launch App
        </button>

        <button
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ color: dark ? "#A6A4C5" : "#7B78A8" }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 p-4 flex flex-col gap-2"
            style={{
              background: dark ? "rgba(10,9,20,0.95)" : "rgba(251,249,244,0.95)",
              backdropFilter: "blur(20px)",
              borderBottom: `1px solid ${dark ? "rgba(124,58,237,0.2)" : "rgba(92,49,242,0.1)"}`,
            }}
          >
            {["About", "Manifesto", "Waitlist"].map((link) => (
              <a
                key={link}
                href="#"
                className="px-4 py-3 rounded-xl"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 500,
                  color: dark ? "#A6A4C5" : "#7B78A8",
                  textDecoration: "none",
                }}
              >
                {link}
              </a>
            ))}
            <a
              href="#"
              className="px-5 py-3 rounded-xl text-center mt-2"
              style={{
                background: "linear-gradient(135deg, #5C31F2, #7C3AED)",
                color: "#fff",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Launch App
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
