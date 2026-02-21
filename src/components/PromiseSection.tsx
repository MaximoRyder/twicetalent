import { useScrollReveal } from "@/hooks/useScrollReveal";

const PromiseSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="tt-section border-t border-border">
      <div ref={ref} className="tt-fade-up tt-grid">
        <div className="md:col-span-5">
          <p className="tt-label mb-4">La Promesa</p>
          <h2 className="tt-headline-lg text-foreground">
            Fallar no es el enemigo.
            <br />
            Aprender tarde, sí.
          </h2>
        </div>
        <div className="md:col-span-5 md:col-start-7 flex items-end">
          <p className="tt-body">
            Ayudamos a founders a equivocarse antes — más barato — con método.
            Ciclos cortos. Entregables reales. Decisiones basadas en evidencia.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PromiseSection;
