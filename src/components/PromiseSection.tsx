import { useScrollReveal } from "@/hooks/useScrollReveal";

const PromiseSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="tt-section border-t border-border">
      <div ref={ref} className="tt-fade-up tt-grid">
        <div className="md:col-span-5">
          <p className="tt-label mb-4">The Promise</p>
          <h2 className="tt-headline-lg text-foreground">
            Failing isn't the enemy.
            <br />
            Delayed learning is.
          </h2>
        </div>
        <div className="md:col-span-5 md:col-start-7 flex items-end">
          <p className="tt-body">
            We help founders fail earlier — cheaper — with method. Short
            cycles. Real deliverables. Decisions based on evidence.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PromiseSection;
