import { useScrollReveal } from "@/hooks/useScrollReveal";

const stages = [
  { num: "01", title: "Discovery & Positioning" },
  { num: "02", title: "Brand & Identity" },
  { num: "03", title: "Commercial Assets" },
  { num: "04", title: "Digital Presence" },
  { num: "05", title: "Validation" },
  { num: "06", title: "POC / MVP" },
  { num: "07", title: "QA & Release" },
  { num: "08", title: "Investor Readiness" },
];

const PipelineSection = () => {
  const ref = useScrollReveal();

  return (
    <section id="process" className="tt-section border-t border-border">
      <div ref={ref} className="tt-fade-up">
        <p className="tt-label mb-4">End-to-End Idea Lab</p>
        <h2 className="tt-headline-lg text-foreground max-w-3xl mb-16 md:mb-24">
          From idea to launch — end to end.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {stages.map((stage) => (
            <div
              key={stage.num}
              className="bg-background p-8 md:p-10 group transition-colors duration-500 hover:bg-secondary"
            >
              <span className="tt-label text-muted-foreground block mb-4">
                {stage.num}
              </span>
              <h3 className="tt-headline-md text-foreground text-lg">
                {stage.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PipelineSection;
