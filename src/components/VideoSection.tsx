import { motion } from "framer-motion";

const VideoSection = () => {
  return (
    <section className="px-6 md:px-12 lg:px-20 xl:px-32 py-16 border-t border-accent/20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
        <motion.div
          className="md:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="tt-label mb-4 text-accent">Once is luck. Twice is talent.</p>
          <h2 className="tt-headline-lg text-foreground">
            Una es suerte.
            <br />
            Dos es talento.
          </h2>
        </motion.div>

        <motion.div
          className="md:col-span-6 md:col-start-7"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="relative w-full aspect-video bg-secondary overflow-hidden">
            <iframe
              src="https://www.youtube-nocookie.com/embed/pjKz32Actd0?rel=0&modestbranding=1"
              title="Twice Talent — Once is luck. Twice is talent."
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
