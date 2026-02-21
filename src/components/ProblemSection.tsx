import { useScrollReveal } from "@/hooks/useScrollReveal";

const ProblemSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="tt-section">
      <div ref={ref} className="tt-fade-up tt-grid">
        <div className="md:col-span-5">
          <p className="tt-label mb-4">El Problema</p>
          <h2 className="tt-headline-lg text-foreground">
            Construir es fácil.
            <br />
            Construir lo correcto, no.
          </h2>
        </div>
        <div className="md:col-span-5 md:col-start-7 flex items-end">
          <p className="tt-body">
            La mayoría de los proyectos no fallan por falta de esfuerzo. Fallan
            por validación tardía, presupuesto desperdiciado y construir lo
            incorrecto.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
