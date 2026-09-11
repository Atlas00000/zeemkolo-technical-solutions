const services = [
  {
    title: "Firmware & embedded design",
    body: "MCU bring-up, peripheral drivers, and production-ready firmware architecture for your product.",
  },
  {
    title: "Hardware prototyping",
    body: "Schematic review, PCB guidance, and lab validation so your first boards behave in the field.",
  },
  {
    title: "Product engineering consults",
    body: "Scoped working sessions for roadmaps, risk review, and go-to-market technical decisions.",
  },
];

export function ServicesGrid() {
  return (
    <section className="border-t border-brand-steel/10 bg-brand-mist px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm tracking-[0.2em] text-brand-signal uppercase">
          Services
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl text-brand-ink md:text-4xl">
          Engineering support from bench to shipment
        </h2>
        <p className="mt-3 max-w-2xl text-brand-steel/80">
          Zeemkolo Technical Solutions partners with teams shipping real hardware — not slide decks alone.
        </p>
        <ul className="mt-12 grid gap-10 md:grid-cols-3">
          {services.map((service) => (
            <li key={service.title} className="border-t border-brand-steel/20 pt-5">
              <h3 className="font-display text-xl text-brand-ink">{service.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-steel">{service.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
