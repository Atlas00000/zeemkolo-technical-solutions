const quotes = [
  {
    quote:
      "They caught a power-rail sequencing issue before we ordered the next PCB spin. Saved us a full revision cycle.",
    name: "Hardware lead",
    org: "Industrial IoT startup",
  },
  {
    quote:
      "Zeemble’s lab-first notes finally matched how we train junior firmware engineers on the bench.",
    name: "Training coordinator",
    org: "Regional engineering academy",
  },
  {
    quote:
      "Consultation was practical — scoped agenda, schematic review, and a clear firmware next-step list.",
    name: "Founder",
    org: "Consumer electronics prototype",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-brand-mist px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm tracking-[0.2em] text-brand-signal uppercase">
          Client voices
        </p>
        <h2 className="mt-3 font-display text-3xl text-brand-ink md:text-4xl">
          Trusted where the schematics meet the schedule
        </h2>
        <ul className="mt-12 space-y-10">
          {quotes.map((item) => (
            <li key={item.quote} className="border-l-2 border-brand-signal pl-5">
              <blockquote className="max-w-3xl font-display text-xl leading-snug text-brand-ink md:text-2xl">
                “{item.quote}”
              </blockquote>
              <p className="mt-3 text-sm text-brand-steel">
                {item.name} · {item.org}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
