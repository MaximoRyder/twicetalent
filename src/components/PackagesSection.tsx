import { useScrollReveal } from "@/hooks/useScrollReveal";

const packages = [
  {
    name: "Starter",
    range: "Idea → Validation",
    desc: "Define hypotheses, test assumptions, and decide if the idea is worth building.",
  },
  {
    name: "Build",
    range: "Validation → MVP",
    desc: "Design, develop, and ship a focused product built to learn — not to impress.",
  },
  {
    name: "Launch",
    range: "MVP → Go-to-market",
    desc: "Prepare for market, refine narrative, and position for investors or first revenue.",
  },
];

const PackagesSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="tt-section border-t border-border">
      <div ref={ref} className="tt-fade-up">
        <p className="tt-label mb-4">Packages</p>
        <h2 className="tt-headline-lg text-foreground max-w-3xl mb-16 md:mb-24">
          Three paths. One system.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="bg-background p-8 md:p-12 flex flex-col justify-between min-h-[280px]"
            >
              <div>
                <h3 className="tt-headline-md text-foreground mb-2">
                  {pkg.name}
                </h3>
                <p className="tt-label text-accent mb-6">{pkg.range}</p>
              </div>
              <p className="tt-body">{pkg.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
