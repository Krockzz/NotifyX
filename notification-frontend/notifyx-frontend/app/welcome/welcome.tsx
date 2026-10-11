
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Code2,
  // Github,
  Layers3,
  Zap,
} from "lucide-react";

type FeatureCardProps = {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
  accent: "violet" | "cyan" | "fuchsia";
};

export function Welcome() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b14] text-white selection:bg-violet-500/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[130px]" />
        <div className="absolute right-0 top-[35%] h-80 w-80 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20">
            <Zap className="h-5 w-5 text-white" />
          </div>

          <span className="text-lg font-bold tracking-tight">
            Notify<span className="text-violet-400">X</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a
            href="https://reactrouter.com/"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-white"
          >
            Documentation
          </a>
          <a href="#about" className="transition hover:text-white">
            About
          </a>
        </nav>

        <a
          href="#features"
          className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium transition hover:border-violet-400/50 hover:bg-violet-500/10"
        >
          Explore
          <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-16 lg:grid-cols-2 lg:px-10 lg:pb-32 lg:pt-24">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-4 py-2 text-xs font-medium tracking-wide text-violet-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            EVENT-DRIVEN NOTIFICATIONS
          </div>

          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Every event.
            <br />
            Every channel.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              One platform.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            Build reliable notification workflows for your applications.
            Connect events to notification channels through one unified
            platform designed for developers.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#features"
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-3.5 font-medium shadow-xl shadow-violet-900/30 transition hover:-translate-y-0.5 hover:shadow-violet-700/30"
            >
              Explore NotifyX
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>

            <a
              href="https://reactrouter.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3.5 font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <Code2 className="h-4 w-4" />
              Developer docs
            </a>
          </div>

          <div className="mt-12 flex items-center gap-4 text-sm text-slate-500">
            <div className="flex -space-x-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#080b14] bg-violet-500">
                <Code2 className="h-4 w-4 text-white" />
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#080b14] bg-cyan-600">
                <Layers3 className="h-4 w-4 text-white" />
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#080b14] bg-fuchsia-600">
                <Zap className="h-4 w-4 text-white" />
              </span>
            </div>

            <p>
              <span className="text-slate-300">One unified API</span>
              <span className="mx-2">·</span>
              Event-driven by design
            </p>
          </div>
        </div>

        {/* Notification system visualization */}
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute inset-8 rounded-full bg-violet-600/20 blur-[80px]" />

          <div className="relative rounded-3xl border border-white/10 bg-[#101421]/90 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-7">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
              <div>
                <p className="text-sm font-medium text-white">
                  Notification pipeline
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Event processing overview
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1.5 text-xs text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Ready
              </div>
            </div>

            <div className="relative flex min-h-[300px] items-center justify-center">
              <div className="absolute h-64 w-64 rounded-full border border-violet-400/20" />
              <div className="absolute h-48 w-48 rounded-full border border-cyan-400/20" />
              <div className="absolute h-32 w-32 rounded-full border border-white/10" />

              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl border border-violet-300/30 bg-gradient-to-br from-violet-500/30 to-cyan-500/20 shadow-2xl shadow-violet-600/20">
                <Zap className="h-11 w-11 text-violet-200" />
              </div>

              <div className="absolute left-[12%] top-[25%] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#171d2c] shadow-lg">
                <Code2 className="h-5 w-5 text-cyan-300" />
              </div>

              <div className="absolute right-[12%] top-[25%] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#171d2c] shadow-lg">
                <Zap className="h-5 w-5 text-amber-300" />
              </div>

              <div className="absolute bottom-[12%] left-[25%] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#171d2c] shadow-lg">
                <Layers3 className="h-5 w-5 text-fuchsia-300" />
              </div>

              <div className="absolute bottom-[12%] right-[25%] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#171d2c] shadow-lg">
                <ArrowDownRight className="h-5 w-5 text-emerald-300" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Architecture</p>
                <p className="mt-2 text-sm font-medium text-slate-200">
                  Event-driven
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-xs text-slate-500">Delivery</p>
                <p className="mt-2 text-sm font-medium text-slate-200">
                  Multi-channel
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -right-3 top-20 hidden rounded-xl border border-white/10 bg-[#171d2c] px-4 py-3 shadow-xl sm:block">
            <p className="text-xs text-slate-500">Workflow</p>
            <p className="mt-1 text-sm font-medium text-cyan-300">
              Event → Notify
            </p>
          </div>

          <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-white/10 bg-[#171d2c] px-4 py-3 shadow-xl sm:block">
            <p className="text-xs text-slate-500">Built for</p>
            <p className="mt-1 text-sm font-medium text-violet-300">
              Modern applications
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative z-10 border-t border-white/[0.08] bg-white/[0.015]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              The platform
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Notifications made{" "}
              <span className="text-slate-500">simpler.</span>
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              Bring event processing and notification delivery together
              through a consistent developer experience.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <FeatureCard
              icon={<Code2 className="h-5 w-5" />}
              number="01"
              title="Developer friendly"
              description="Integrate application events through a clean, consistent API designed for developers."
              accent="violet"
            />

            <FeatureCard
              icon={<Layers3 className="h-5 w-5" />}
              number="02"
              title="Unified workflows"
              description="Organize notification workflows and connect events to the channels your application needs."
              accent="cyan"
            />

            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              number="03"
              title="Reliable delivery"
              description="Build toward resilient notification processing with clear delivery and failure-handling workflows."
              accent="fuchsia"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="about"
        className="relative z-10 border-t border-white/[0.08]"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>
            © {new Date().getFullYear()} NotifyX. Built for developers.
          </p>

          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
           
       
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  number,
  title,
  description,
  accent,
}: FeatureCardProps) {
  const accents = {
    violet: "text-violet-300 bg-violet-400/10 border-violet-400/20",
    cyan: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
    fuchsia:
      "text-fuchsia-300 bg-fuchsia-400/10 border-fuchsia-400/20",
  };

  return (
    <article className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.045]">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${accents[accent]}`}
        >
          {icon}
        </div>

        <span className="text-sm font-medium text-slate-600">
          {number}
        </span>
      </div>

      <h3 className="mt-7 text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-400">
        {description}
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 transition group-hover:text-white">
        Learn more
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </article>
  );
}
