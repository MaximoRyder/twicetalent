import { motion } from "framer-motion";

const FinalCTASection = () => {
  return (
    <section id="contact" className="tt-section border-t border-accent/20">
      <div className="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="tt-label mb-4 text-accent">Siguiente Paso</p>
          <h2 className="tt-headline-lg text-foreground mb-8">
            Deja de adivinar.
            <br />
            Empieza a aprender.
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="tt-body mb-12">
            En 30 minutos sales con hipótesis claras, el primer experimento
            definido y los próximos 7 días planificados.
          </p>
          <a href="#diagnostic" className="tt-btn-primary">
            Cuéntame y Conversemos
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTASection;
