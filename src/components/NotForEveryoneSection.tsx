import { useScrollReveal } from "@/hooks/useScrollReveal";

const NotForEveryoneSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="tt-section border-t border-border">
      <div ref={ref} className="tt-fade-up tt-grid">
        <div className="md:col-span-5">
          <p className="tt-label mb-4">Entry Barriers</p>
          <h2 className="tt-headline-lg text-foreground">Not for everyone.</h2>
        </div>
        <div className="md:col-span-5 md:col-start-7 flex items-end">
          <ul className="space-y-4">
            <li className="tt-body border-l-2 border-border pl-6">
              We don't build large MVPs without validation.
            </li>
            <li className="tt-body border-l-2 border-border pl-6">
              We don't say yes to everything. We optimize for outcomes.
            </li>
            <li className="tt-body border-l-2 border-border pl-6">
              If you won't measure and change, this won't work.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default NotForEveryoneSection;
