import { useScrollReveal } from "@/hooks/useScrollReveal";

const FinalCTASection = () => {
  const ref = useScrollReveal();

  return (
    <section id="contact" className="tt-section border-t border-border">
      <div ref={ref} className="tt-fade-up max-w-3xl">
        <p className="tt-label mb-4">Next Step</p>
        <h2 className="tt-headline-lg text-foreground mb-8">
          Stop guessing.
          <br />
          Start learning.
        </h2>
        <p className="tt-body mb-12">
          In 30 minutes you'll leave with clear hypotheses, the first experiment,
          and the next 7 days defined.
        </p>
        <a href="#" className="tt-btn-primary">
          Book a Diagnostic Call
        </a>
      </div>
    </section>
  );
};

export default FinalCTASection;
