import { Link } from "react-router-dom";
import PurkinjeLayer from "../components/PurkinjeLayer.jsx";
import { PROJECTS, STATUS_STYLES } from "../data/projects.js";

function StatusPill({ project }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] ${
        STATUS_STYLES[project.status] ?? STATUS_STYLES.active
      }`}
    >
      {project.statusLabel}
    </span>
  );
}

function Stats({ project, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-x-8 gap-y-3 ${className}`}>
      {project.stats.map((s) => (
        <div key={s.l}>
          <div className="font-serif text-xl leading-none text-[#211c17]">
            {s.n}
          </div>
          <div className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[#9c8c7a]">
            {s.l}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- variant A: minimal ledger (closest to the home page) ----
function Ledger() {
  return (
    <div className="mt-12 divide-y divide-[#d8cec2] border-y border-[#d8cec2]">
      {PROJECTS.map((p) => (
        <Link
          key={p.slug}
          to={`/work/${p.slug}`}
          className="group grid gap-2 py-6 md:grid-cols-[1fr_auto] md:items-baseline"
        >
          <div>
            <span className="text-[1.05rem] text-[#2f2923] transition-colors group-hover:text-[#7d5e3f]">
              {p.title}
            </span>
            <p className="mt-2 max-w-xl text-[0.95rem] leading-7 text-[#66594d]">
              {p.tagline}
            </p>
          </div>
          <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-2">
            <StatusPill project={p} />
            <time className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[#9c8c7a]">
              {p.updated}
            </time>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ---- variant B: ledger with inline metrics ----
function LedgerRich() {
  return (
    <div className="mt-12 divide-y divide-[#d8cec2] border-y border-[#d8cec2]">
      {PROJECTS.map((p) => (
        <Link key={p.slug} to={`/work/${p.slug}`} className="group block py-7">
          <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-baseline">
            <span className="text-[1.1rem] text-[#2f2923] transition-colors group-hover:text-[#7d5e3f]">
              {p.title}
            </span>
            <div className="flex items-center gap-3">
              <StatusPill project={p} />
              <time className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[#9c8c7a]">
                {p.updated}
              </time>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-[0.95rem] leading-7 text-[#66594d]">
            {p.tagline}
          </p>
          <Stats project={p} className="mt-5" />
        </Link>
      ))}
    </div>
  );
}

// ---- variant C: cards ----
function Cards() {
  return (
    <div className="mt-12 grid gap-5">
      {PROJECTS.map((p) => (
        <Link
          key={p.slug}
          to={`/work/${p.slug}`}
          className="group rounded-2xl border border-[#d8cec2] bg-[#fdfbf6] p-7 transition-colors hover:border-[#bba78f]"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-[1.15rem] text-[#211c17] transition-colors group-hover:text-[#7d5e3f]">
              {p.title}
            </h2>
            <StatusPill project={p} />
          </div>
          <p className="mt-3 max-w-2xl text-[0.95rem] leading-7 text-[#66594d]">
            {p.tagline}
          </p>
          <Stats
            project={p}
            className="mt-6 border-t border-[#e1d8cc] pt-5"
          />
          <div className="mt-5 flex items-baseline gap-2 text-[0.85rem] text-[#76695c]">
            <span className="text-[#7d5e3f]">●</span>
            <span>{p.latest}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

const VARIANTS = {
  ledger: { Component: Ledger, label: "A · Ledger" },
  rich: { Component: LedgerRich, label: "B · Ledger + metrics" },
  cards: { Component: Cards, label: "C · Cards" },
};

export default function Projects({ variant = "ledger" }) {
  const { Component } = VARIANTS[variant] ?? VARIANTS.ledger;

  return (
    <main className="relative isolate min-h-screen overflow-hidden text-[#2f2923]">
      <PurkinjeLayer variant="veil" />

      <Link
        to="/"
        className="fixed left-4 top-4 z-50 font-mono text-xs uppercase tracking-[0.18em] text-[#9a8b7a] transition-colors hover:text-[#352e27]"
      >
        &larr; home
      </Link>

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 md:py-24">
        <section className="landing-rise">
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.28em] text-[#9c8c7a]">
            Current work
          </p>
          <h1 className="max-w-2xl text-[clamp(2.4rem,6vw,4rem)] font-light leading-[0.95] text-[#211c17]">
            What I'm building
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#66594d]">
            A live view of active research and projects. Each updates as the work
            moves — open one for the full picture.
          </p>

          <Component />

          {/* dev-only variant switcher; remove once a layout is chosen */}
          <nav className="mt-14 flex flex-wrap gap-2 border-t border-[#d8cec2] pt-6">
            <span className="mr-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[#9c8c7a]">
              Preview layout
            </span>
            <Link
              to="/work"
              className="rounded-full border border-[#d8cec2] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[#76695c] transition-colors hover:border-[#9c8c7a] hover:text-[#2f2923]"
            >
              A · Ledger
            </Link>
            <Link
              to="/work-b"
              className="rounded-full border border-[#d8cec2] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[#76695c] transition-colors hover:border-[#9c8c7a] hover:text-[#2f2923]"
            >
              B · Ledger + metrics
            </Link>
            <Link
              to="/work-c"
              className="rounded-full border border-[#d8cec2] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[#76695c] transition-colors hover:border-[#9c8c7a] hover:text-[#2f2923]"
            >
              C · Cards
            </Link>
          </nav>
        </section>
      </div>
    </main>
  );
}
