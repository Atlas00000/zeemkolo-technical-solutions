import Link from "next/link";

export function ConsultationCta() {
  return (
    <section className="border-t border-brand-steel/10 bg-[#e8eef2] px-6 py-20">
      <div className="mx-auto max-w-6xl md:flex md:items-end md:justify-between md:gap-10">
        <div className="max-w-2xl">
          <p className="text-sm tracking-[0.2em] text-brand-signal uppercase">
            Next step
          </p>
          <h2 className="mt-3 font-display text-3xl text-brand-ink md:text-4xl">
            Book an engineering consultation
          </h2>
          <p className="mt-3 text-brand-steel/80">
            Pick a slot, share your brief, and receive a calendar invite. Ideal for
            firmware reviews, prototype risk checks, and product architecture sessions.
          </p>
        </div>
        <Link
          href="/consultation"
          className="mt-8 inline-block shrink-0 bg-brand-ink px-6 py-3 text-sm text-white md:mt-0"
        >
          Open booking
        </Link>
      </div>
    </section>
  );
}
