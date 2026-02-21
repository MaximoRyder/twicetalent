import { motion } from "framer-motion";
import bgTexture from "@/assets/bg-texture-3.jpg";

const MethodSection = () => {
  return (
    <section className="relative tt-section border-t border-border overflow-hidden">
      <img
        src={bgTexture}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
        loading="lazy"
      />
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <motion.div
          className="md:col-span-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="tt-label mb-4">Método</p>
          <h2 className="tt-headline-lg text-foreground">
            Ciclos cortos.
            <br />
            Decisiones claras.
          </h2>
        </motion.div>
        <motion.div
          className="md:col-span-5 md:col-start-7 flex items-end"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="tt-body">
            Cada ciclo termina con algo concreto y una pregunta simple:
            ¿seguimos, ajustamos o descartamos? Sin vueltas.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default MethodSection;
