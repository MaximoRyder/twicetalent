import { motion } from "framer-motion";

const VideoSection = () => {
  return (
    <section className="px-6 md:px-12 lg:px-20 xl:px-32 py-16 border-t border-border">
      <motion.div
        className="max-w-xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1 }}
      >
        <p className="tt-label mb-6 text-muted-foreground">Concepto</p>
        <div className="relative w-full aspect-video bg-secondary overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/pjKz32Actd0?rel=0&modestbranding=1"
            title="Twice Talent — Once is luck. Twice is talent."
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default VideoSection;
