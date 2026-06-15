import { createFileRoute } from "@tanstack/react-router";
import ninjaAsset from "@/assets/cele_ninja.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agentix — Quietly engineering what comes next." },
      {
        name: "description",
        content:
          "Agentix is a Cyprus-based technology development company designing high-performance software frameworks and intelligent systems. Currently in stealth.",
      },
      { property: "og:title", content: "Agentix — Stealth Phase" },
      {
        property: "og:description",
        content:
          "High-performance software frameworks and intelligent systems. Engineered in Limassol, Cyprus.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const accent = "#10B981";
  const smoke = "#1F252E";
  const slate = "#8E939E";
  const off = "#F3F4F6";
  const bg = "#0D0F12";
  const black = "#0A0B0D";

  return (
    <div style={{ backgroundColor: bg, color: off, minHeight: "100vh" }}>
      {/* HEADER */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backdropFilter: "blur(16px)",
          backgroundColor: "rgba(13, 15, 18, 0.7)",
          borderBottom: `1px solid ${smoke}`,
        }}
      >
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 flex items-center justify-between h-16">
          <div className="text-sm font-semibold tracking-[0.3em]" style={{ color: off }}>
            AGENTIX
          </div>
          <div
            className="hidden sm:flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm"
            style={{ color: slate, border: `1px solid ${smoke}` }}
          >
            <span
              className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span>[ STEALTH PHASE // PROTOCOL ACTIVATED ]</span>
          </div>
          <div
            className="sm:hidden flex items-center gap-2 font-mono-tech text-[10px]"
            style={{ color: slate }}
          >
            <span
              className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            STEALTH
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ borderBottom: `1px solid ${smoke}` }}>
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${ninjaAsset.url})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center",
            backgroundSize: "contain",
            opacity: 0.4,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${bg} 0%, ${bg} 35%, rgba(13,15,18,0.55) 70%, rgba(13,15,18,0.85) 100%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="relative mx-auto max-w-[1400px] px-8 md:px-12 pt-48 pb-40 md:pt-56 md:pb-48">
          <div
            className="font-mono-tech text-[11px] uppercase tracking-[0.25em] mb-10 flex items-center gap-3"
            style={{ color: slate }}
          >
            <span
              className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            00 // Introduction
          </div>
          <h1
            className="font-semibold tracking-[-0.03em] leading-[1.02] max-w-[980px]"
            style={{ color: off, fontSize: "clamp(2.75rem, 6.5vw, 5.75rem)" }}
          >
            Quietly engineering
            <br />
            what comes next.
          </h1>
          <p
            className="mt-10 text-base md:text-lg leading-relaxed"
            style={{ color: slate, maxWidth: "620px" }}
          >
            Agentix is a technology development company based in Cyprus. We design
            high-performance software frameworks and intelligent systems, currently operating in
            stealth as we prepare our foundational ecosystem.
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ borderBottom: `1px solid ${smoke}` }}>
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 py-36 md:py-[140px] grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div
              className="font-mono-tech text-[11px] uppercase tracking-[0.25em]"
              style={{ color: slate }}
            >
              01 // Architecture
            </div>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <h2
              className="font-semibold tracking-[-0.02em] leading-[1.1]"
              style={{ color: off, fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              Purpose-built technology.
            </h2>
            <div
              className="mt-10 space-y-6 text-base md:text-lg leading-relaxed"
              style={{ color: slate }}
            >
              <p>
                Great systems aren't rushed; they are deliberately engineered. At Agentix, our team
                of developers and architects is dedicated to solving complex digital infrastructure
                challenges from our hub in Cyprus.
              </p>
              <p>
                We prefer to let the architecture speak for itself. Right now, our focus is entirely
                internal—building, refining, and testing a new paradigm of digital interaction. We
                are quiet because we are busy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALIZATIONS */}
      <section style={{ borderBottom: `1px solid ${smoke}` }}>
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 py-36 md:py-[140px]">
          <div
            className="font-mono-tech text-[11px] uppercase tracking-[0.25em] mb-16"
            style={{ color: slate }}
          >
            02 // Areas of Focus
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            {[
              {
                n: "001",
                t: "Core Infrastructure",
                d: "Developing highly scalable, low-latency backends capable of supporting heavy data loads and seamless real-time processing.",
              },
              {
                n: "002",
                t: "Behavioral Ecosystems",
                d: "Mapping sophisticated engagement loops and logic structures that make digital spaces feel more intuitive, responsive, and dynamic.",
              },
              {
                n: "003",
                t: "Systemic Optimization",
                d: "Refining the subtle mechanics where user experience and complex software engineering meet, ensuring stability at scale.",
              },
            ].map((c, i) => (
              <div
                key={c.n}
                className="px-0 md:px-10 py-10 md:py-4"
                style={{ borderLeft: i === 0 ? "none" : `1px solid ${smoke}` }}
              >
                <div
                  className="font-mono-tech text-[11px] tracking-[0.2em]"
                  style={{ color: accent }}
                >
                  {c.n}
                </div>
                <h3
                  className="mt-6 text-2xl font-medium tracking-[-0.01em]"
                  style={{ color: off }}
                >
                  {c.t}
                </h3>
                <p className="mt-5 text-[15px] leading-relaxed" style={{ color: slate }}>
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATUS */}
      <section style={{ borderBottom: `1px solid ${smoke}` }}>
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 py-36 md:py-[140px] grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div
              className="font-mono-tech text-[11px] uppercase tracking-[0.25em]"
              style={{ color: slate }}
            >
              03 // Timeline
            </div>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <h2
              className="font-semibold tracking-[-0.02em] leading-[1.1]"
              style={{ color: off, fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              In Development.
            </h2>
            <p
              className="mt-10 text-base md:text-lg leading-relaxed"
              style={{ color: slate }}
            >
              Our current project is taking shape behind the scenes. We are steadily moving toward a
              phase where our frameworks will be ready for integration. Until then, we remain
              focused on the code.
            </p>
            <div
              className="mt-12 flex items-center gap-3 font-mono-tech text-[11px] uppercase tracking-[0.25em]"
              style={{ color: slate }}
            >
              <span
                className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
              System status: building
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: black }}>
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 py-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div
              className="font-mono-tech font-bold text-sm tracking-[0.15em]"
              style={{ color: off }}
            >
              AGENTIX LTD
            </div>
            <div
              className="mt-4 font-mono-tech text-xs leading-relaxed"
              style={{ color: slate }}
            >
              Tech Hub // Limassol, Cyprus
            </div>
            <div
              className="mt-2 font-mono-tech text-xs leading-relaxed"
              style={{ color: slate }}
            >
              Operational Phase: Stealth / Infrastructure Verification
            </div>
          </div>
          <div className="md:text-right">
            <div
              className="font-mono-tech text-[11px] uppercase tracking-[0.25em]"
              style={{ color: slate }}
            >
              Inquiries & Collaborations
            </div>
            <a
              href="mailto:nfoi@agentix-tech.net"
              className="mt-4 inline-block font-mono-tech text-sm underline underline-offset-4 decoration-1"
              style={{ color: off, textDecorationColor: smoke }}
            >
              nfoi@agentix-tech.net
            </a>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${smoke}` }}>
          <div
            className="mx-auto max-w-[1400px] px-8 md:px-12 py-6 font-mono-tech text-[10px] uppercase tracking-[0.2em]"
            style={{ color: "#4a5058" }}
          >
            © 2026 Agentix Ltd. All rights reserved. // Connection Secure & Encrypted.
          </div>
        </div>
      </footer>
    </div>
  );
}