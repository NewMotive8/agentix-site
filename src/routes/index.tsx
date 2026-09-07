import { createFileRoute } from "@tanstack/react-router";
import ninjaAsset from "@/assets/nomad5_final.png.asset.json";
import markAsset from "@/assets/agentix-mark.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agentix — Defence. Cyber. Security." },
      {
        name: "description",
        content:
          "Agentix connects specialised technology, software and security capabilities with defence and government procurement opportunities.",
      },
      { property: "og:title", content: "Agentix — Defence. Cyber. Security." },
      {
        property: "og:description",
        content:
          "Strategic integration for complex procurement. Technology, software and security capabilities aligned with defence and government requirements.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
          <div className="flex items-center gap-3">
            <img
              src={markAsset.url}
              alt="Agentix logo"
              width={465}
              height={522}
              className="h-8 w-auto"
            />
            <span className="text-sm font-semibold tracking-[0.3em]" style={{ color: off }}>
              AGENTIX
            </span>
          </div>
          <div
            className="hidden sm:flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm"
            style={{ color: slate, border: `1px solid ${smoke}` }}
          >
            <span
              className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <span>DEFENCE · CYBER · SECURITY</span>
          </div>
          <div
            className="sm:hidden flex items-center gap-2 font-mono-tech text-[10px]"
            style={{ color: slate }}
          >
            <span
              className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: accent }}
            />
            AGENTIX
          </div>
        </div>
      </header>

      {/* 01 — HERO */}
      <section className="relative overflow-hidden" style={{ borderBottom: `1px solid ${smoke}` }}>
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${ninjaAsset.url})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center right",
            backgroundSize: "cover",
            opacity: 0.85,
            filter: "brightness(1.4) contrast(1.2)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, ${bg} 0%, ${bg} 45%, rgba(13,15,18,0.25) 70%, rgba(13,15,18,0.45) 100%)`,
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
            01 // Introduction
          </div>
          <div
            className="font-mono-tech text-[11px] uppercase tracking-[0.3em] mb-8"
            style={{ color: accent }}
          >
            DEFENCE. CYBER. SECURITY.
          </div>
          <h1
            className="font-semibold tracking-[-0.03em] leading-[1.02] max-w-[980px]"
            style={{ color: off, fontSize: "clamp(2.75rem, 6.5vw, 5.75rem)" }}
          >
            Strategic integration
            <br />
            for complex procurement.
          </h1>
          <p
            className="mt-10 text-base md:text-lg leading-relaxed"
            style={{ color: slate, maxWidth: "720px" }}
          >
            Agentix connects specialised technology, software and security capabilities with defence and government procurement opportunities.
          </p>
        </div>
      </section>

      {/* 02 — WHAT WE DO */}
      <section style={{ borderBottom: `1px solid ${smoke}` }}>
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 py-36 md:py-[140px] grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div
              className="font-mono-tech text-[11px] uppercase tracking-[0.25em]"
              style={{ color: slate }}
            >
              02 // What We Do
            </div>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <h2
              className="font-semibold tracking-[-0.02em] leading-[1.1]"
              style={{ color: off, fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              Technology. Procurement. Integration.
            </h2>
            <div
              className="mt-10 space-y-6 text-base md:text-lg leading-relaxed"
              style={{ color: slate }}
            >
              <p>
                Agentix operates across the intersection of defence requirements and specialised technology.
              </p>
              <p>
                We identify relevant capabilities, connect them with the right partners and build the commercial and technical pathways required to bring them into procurement and deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — AREAS OF FOCUS */}
      <section style={{ borderBottom: `1px solid ${smoke}` }}>
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 py-36 md:py-[140px]">
          <div
            className="font-mono-tech text-[11px] uppercase tracking-[0.25em] mb-16"
            style={{ color: slate }}
          >
            03 // Areas of Focus
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "001",
                t: "DEFENCE TECHNOLOGY",
                d: "Specialised equipment, systems and mission-critical technologies for defence and government requirements.",
              },
              {
                n: "002",
                t: "CYBER & SECURITY",
                d: "Cybersecurity, secure infrastructure, intelligence and protective technologies.",
              },
              {
                n: "003",
                t: "SOFTWARE & SYSTEMS",
                d: "Specialised software, platforms, AI-enabled systems and bespoke technology solutions for demanding operational environments.",
              },
              {
                n: "004",
                t: "PROCUREMENT & INTEGRATION",
                d: "Connecting requirements with qualified suppliers, OEMs and technology partners — from identification through delivery.",
              },
            ].map((c, i) => (
              <div
                key={c.n}
                className="px-0 md:px-8 py-10 md:py-4"
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

      {/* 04 — PROCUREMENT */}
      <section style={{ borderBottom: `1px solid ${smoke}` }}>
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 py-36 md:py-[140px] grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div
              className="font-mono-tech text-[11px] uppercase tracking-[0.25em]"
              style={{ color: slate }}
            >
              05 // Procurement
            </div>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <h2
              className="font-semibold tracking-[-0.02em] leading-[1.1]"
              style={{ color: off, fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              From requirement to capability.
            </h2>
            <div
              className="mt-10 space-y-6 text-base md:text-lg leading-relaxed"
              style={{ color: slate }}
            >
              <p>
                We work across the procurement chain — identifying requirements, sourcing capable partners, establishing technical fit and coordinating the path toward qualification, contracting and delivery.
              </p>
            </div>
            <div
              className="mt-12 flex flex-wrap items-center gap-4 md:gap-6 font-mono-tech text-[11px] uppercase tracking-[0.2em]"
              style={{ color: off }}
            >
              <span>Requirement</span>
              <span style={{ color: smoke }}>→</span>
              <span>Capability</span>
              <span style={{ color: smoke }}>→</span>
              <span>Integration</span>
              <span style={{ color: smoke }}>→</span>
              <span>Procurement</span>
            </div>
          </div>
        </div>
      </section>

      {/* 06 — OPERATING PRINCIPLE */}
      <section style={{ borderBottom: `1px solid ${smoke}` }}>
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 py-36 md:py-[140px] grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <div
              className="font-mono-tech text-[11px] uppercase tracking-[0.25em]"
              style={{ color: slate }}
            >
              06 // Operating Principle
            </div>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <h2
              className="font-semibold tracking-[-0.02em] leading-[1.1]"
              style={{ color: off, fontSize: "clamp(2rem, 4vw, 3.25rem)" }}
            >
              Selective by design.
            </h2>
            <div
              className="mt-10 space-y-6 text-base md:text-lg leading-relaxed"
              style={{ color: slate }}
            >
              <p>We don't publish every programme, partner or capability.</p>
              <p>
                Agentix works selectively on defence, cyber, security and technology opportunities where specialised knowledge and international relationships can make the difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 07 — FINAL CTA */}
      <section style={{ borderBottom: `1px solid ${smoke}` }}>
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 py-36 md:py-[140px] text-center">
          <div
            className="font-mono-tech text-[11px] uppercase tracking-[0.25em] mb-10"
            style={{ color: slate }}
          >
            07 // Enquiry
          </div>
          <h2
            className="font-semibold tracking-[-0.02em] leading-[1.1] mx-auto"
            style={{ color: off, fontSize: "clamp(2rem, 4vw, 3.25rem)", maxWidth: "900px" }}
          >
            A requirement. A capability. A conversation.
          </h2>
          <p
            className="mt-8 text-base md:text-lg leading-relaxed mx-auto"
            style={{ color: slate, maxWidth: "640px" }}
          >
            For defence organisations, government-facing programmes, technology companies and specialised suppliers.
          </p>
          <a
            href="mailto:nfoi@agentix-tech.net"
            className="mt-12 inline-flex items-center gap-3 font-mono-tech text-sm uppercase tracking-[0.2em] px-8 py-4 rounded-sm transition-colors duration-200"
            style={{
              color: off,
              border: `1px solid ${smoke}`,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.08)";
              e.currentTarget.style.borderColor = accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.borderColor = smoke;
            }}
          >
            Start a confidential enquiry
            <span style={{ color: accent }}>→</span>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: black }}>
        <div className="mx-auto max-w-[1400px] px-8 md:px-12 py-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <img
              src={markAsset.url}
              alt="Agentix"
              width={465}
              height={522}
              loading="lazy"
              className="h-16 w-auto"
            />
            <div
              className="mt-4 font-mono-tech font-bold text-sm tracking-[0.15em]"
              style={{ color: off }}
            >
              AGENTIX LTD
            </div>
            <div
              className="mt-4 font-mono-tech text-xs leading-relaxed"
              style={{ color: slate }}
            >
              Defence · Cyber · Security
            </div>
            <div
              className="mt-2 font-mono-tech text-xs leading-relaxed"
              style={{ color: slate }}
            >
              Limassol, Cyprus
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
