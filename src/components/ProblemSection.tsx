import { useScrollReveal } from "@/hooks/useScrollReveal";

const ProblemSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="tt-section">
      <div ref={ref} className="tt-fade-up tt-grid">
        <div className="md:col-span-5">
          <p className="tt-label mb-4">The Problem</p>
          <h2 className="tt-headline-lg text-foreground">
            Building is easy.
            <br />
            Building the right thing is not.
          </h2>
        </div>
        <div className="md:col-span-5 md:col-start-7 flex items-end">
          <p className="tt-body">
            Most projects don't fail from lack of effort. They fail from late
            validation, wasted budget, and building the wrong thing.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
