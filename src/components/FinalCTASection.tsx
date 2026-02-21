import { useScrollReveal } from "@/hooks/useScrollReveal";

const FinalCTASection = () => {
  const ref = useScrollReveal();

  return (
    <section id="contact" className="tt-section border-t border-border">
      <div ref={ref} className="tt-fade-up max-w-3xl">
        <p className="tt-label mb-4">Siguiente Paso</p>
        <h2 className="tt-headline-lg text-foreground mb-8">
          Dejá de adivinar.
          <br />
          Empezá a aprender.
        </h2>
        <p className="tt-body mb-12">
          En 30 minutos te vas con hipótesis claras, el primer experimento
          definido y los próximos 7 días planificados.
        </p>
        <a href="#" className="tt-btn-primary">
          Agendar Llamada Diagnóstica
        </a>
      </div>
    </section>
  );
};

export default FinalCTASection;
