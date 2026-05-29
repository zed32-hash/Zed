interface FooterProps {
  dark: boolean;
}

const links = {
  Product: ["Features", "Manifesto", "Roadmap", "Changelog"],
  Company: ["About", "Blog", "Press", "Careers"],
  Legal: ["Privacy", "Terms", "Cookie Policy", "Licenses"],
};

export function Footer({ dark }: FooterProps) {
  return (
    <footer
      className="relative py-20 px-6"
      style={{
        background: dark ? "#0A0914" : "#FBF9F4",
        borderTop: `1px solid ${dark ? "rgba(124,58,237,0.15)" : "rgba(92,49,242,0.08)"}`,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-5">
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
            </div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.9rem",
                lineHeight: 1.65,
                color: dark ? "#A6A4C5" : "#7B78A8",
                maxWidth: "280px",
              }}
            >
              The anonymous dating space where who you are matters more than what you look like.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4
                style={{
                  fontFamily: "'Clash Display', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: dark ? "#F5F5FA" : "#1A173B",
                  marginBottom: "1.25rem",
                }}
              >
                {section}
              </h4>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "0.875rem",
                        color: dark ? "#A6A4C5" : "#7B78A8",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = dark ? "#F5F5FA" : "#1A173B")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = dark ? "#A6A4C5" : "#7B78A8")}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: `1px solid ${dark ? "rgba(124,58,237,0.12)" : "rgba(92,49,242,0.08)"}` }}
        >
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.8rem",
              color: dark ? "#A6A4C5" : "#7B78A8",
            }}
          >
            © 2026 Zed Technologies Inc. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.8rem",
              color: dark ? "#A6A4C5" : "#7B78A8",
            }}
          >
            Made with anonymity in mind.{" "}
            <span style={{ color: dark ? "#7C3AED" : "#5C31F2" }}>@ShadowDev99</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
