import { motion } from "framer-motion";

const ProblemSection = () => {
  return (
    <section className="tt-section border-t border-accent/20">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <motion.div
          className="md:col-span-5"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="tt-label mb-4 text-accent">El Problema</p>
          <h2 className="tt-headline-lg text-foreground">
            Construir es fácil.
            <br />
            Construir lo correcto, no.
          </h2>
        </motion.div>
        <motion.div
          className="md:col-span-5 md:col-start-7 flex items-end"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="tt-body">
            La mayoría de los proyectos no fallan porque el equipo no labure.
            Fallan porque validan tarde, gastan de más y construyen algo que
            nadie necesitaba.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
