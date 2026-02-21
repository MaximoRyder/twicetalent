import { useScrollReveal } from "@/hooks/useScrollReveal";

const MethodSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="tt-section border-t border-border">
      <div ref={ref} className="tt-fade-up tt-grid">
        <div className="md:col-span-5">
          <p className="tt-label mb-4">Método</p>
          <h2 className="tt-headline-lg text-foreground">
            Ciclos cortos.
            <br />
            Ejecución estructurada.
          </h2>
        </div>
        <div className="md:col-span-5 md:col-start-7 flex items-end">
          <p className="tt-body">
            Cada ciclo termina con un entregable y una decisión: continuar,
            ajustar o descartar.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MethodSection;
