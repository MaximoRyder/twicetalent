import { motion } from "framer-motion";
import bgTexture from "@/assets/bg-texture-1.jpg";

const ProblemSection = () => {
  return (
    <section className="relative tt-section overflow-hidden">
      <img
        src={bgTexture}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
        loading="lazy"
      />
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <motion.div
          className="md:col-span-5"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="tt-label mb-4">El Problema</p>
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
            La mayoría de los proyectos no fallan por falta de esfuerzo. Fallan
            por validación tardía, presupuesto desperdiciado y construir lo
            incorrecto.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
