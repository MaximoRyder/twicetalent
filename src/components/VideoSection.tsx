import { motion } from "framer-motion";

const VideoSection = () => {
  return (
    <section className="tt-section border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="tt-label mb-4">Mirá el Concepto</p>
        <h2 className="tt-headline-lg text-foreground max-w-3xl mb-12 md:mb-16">
          Así pensamos la ejecución.
        </h2>
      </motion.div>

      <motion.div
        className="relative w-full aspect-video bg-secondary overflow-hidden"
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <iframe
          src="https://www.youtube.com/embed/pjKz32Actd0?rel=0&modestbranding=1"
          title="Twice Talent — Once is luck. Twice is talent."
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </motion.div>
    </section>
  );
};

export default VideoSection;
