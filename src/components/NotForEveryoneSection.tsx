import { useScrollReveal } from "@/hooks/useScrollReveal";

const NotForEveryoneSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="tt-section border-t border-border">
      <div ref={ref} className="tt-fade-up tt-grid">
        <div className="md:col-span-5">
          <p className="tt-label mb-4">Barreras de Entrada</p>
          <h2 className="tt-headline-lg text-foreground">No es para todos.</h2>
        </div>
        <div className="md:col-span-5 md:col-start-7 flex items-end">
          <ul className="space-y-4">
            <li className="tt-body border-l-2 border-accent pl-6">
              No construimos MVPs grandes sin validación.
            </li>
            <li className="tt-body border-l-2 border-accent pl-6">
              No decimos que sí a todo. Optimizamos para resultados.
            </li>
            <li className="tt-body border-l-2 border-accent pl-6">
              Si no vas a medir y cambiar, esto no funciona.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default NotForEveryoneSection;
