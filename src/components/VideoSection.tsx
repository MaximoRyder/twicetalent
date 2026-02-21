import { useScrollReveal } from "@/hooks/useScrollReveal";

const VideoSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="tt-section border-t border-border">
      <div ref={ref} className="tt-fade-up">
        <p className="tt-label mb-4">Mirá el Concepto</p>
        <h2 className="tt-headline-lg text-foreground max-w-3xl mb-12 md:mb-16">
          Así pensamos la ejecución.
        </h2>

        <div className="relative w-full aspect-video bg-secondary overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/pjKz32Actd0?rel=0&modestbranding=1"
            title="Twice Talent — Once is luck. Twice is talent."
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
