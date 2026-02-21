import { useScrollReveal } from "@/hooks/useScrollReveal";

const packages = [
  {
    name: "Starter",
    range: "Idea → Validación",
    desc: "Definir hipótesis, testear supuestos y decidir si la idea vale la pena construirse.",
  },
  {
    name: "Build",
    range: "Validación → MVP",
    desc: "Diseñar, desarrollar y lanzar un producto enfocado en aprender — no en impresionar.",
  },
  {
    name: "Launch",
    range: "MVP → Go-to-market",
    desc: "Preparar para el mercado, refinar narrativa y posicionar para inversores o primer revenue.",
  },
];

const PackagesSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="tt-section border-t border-border">
      <div ref={ref} className="tt-fade-up">
        <p className="tt-label mb-4">Paquetes</p>
        <h2 className="tt-headline-lg text-foreground max-w-3xl mb-16 md:mb-24">
          Tres caminos. Un sistema.
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
