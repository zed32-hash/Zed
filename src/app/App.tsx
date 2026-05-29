import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Marquee } from "./components/Marquee";
import { HowItWorks } from "./components/HowItWorks";
import { HappyHour } from "./components/HappyHour";
import { Footer } from "./components/Footer";

export default function App() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(prefersDark);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Navbar dark={dark} onToggleDark={() => setDark((d) => !d)} />
      <Hero dark={dark} />
      <Marquee dark={dark} />
      <HowItWorks dark={dark} />
      <HappyHour dark={dark} />
      <Footer dark={dark} />
    </div>
  );
}
