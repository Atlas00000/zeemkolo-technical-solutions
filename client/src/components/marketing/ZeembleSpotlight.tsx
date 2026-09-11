import Link from "next/link";

export function ZeembleSpotlight() {
  return (
    <section className="relative overflow-hidden bg-brand-steel px-6 py-20 text-white">
      <div
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-brand-signal/20 blur-3xl marketing-glow"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <p className="text-sm tracking-[0.2em] text-brand-signal uppercase">
            Zeemble Program
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">
            Learn embedded systems the way the lab teaches it
          </h2>
          <p className="mt-4 max-w-xl text-white/75">
            Lesson notes, code, schematics, and progress tracking for verified Zeemble
            students. Guests can preview Module 1; matric holders unlock the full library
            and forum.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/zeemble"
              className="bg-brand-signal px-5 py-3 text-sm font-medium text-white"
            >
              Open the course library
            </Link>
            <Link
              href="/sign-up"
              className="border border-white/30 px-5 py-3 text-sm text-white"
            >
              Enroll / sign up
            </Link>
          </div>
        </div>
        <div className="border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
          <p className="font-display text-5xl text-brand-signal">ZMB</p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Each student receives a matric number at signup. It gates full lesson access,
            forum writes, and downloads — without handing identity off to a custom password
            store.
          </p>
        </div>
      </div>
    </section>
  );
}
