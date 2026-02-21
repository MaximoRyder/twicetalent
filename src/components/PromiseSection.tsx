import { motion } from "framer-motion";

const PromiseSection = () => {
  return (
    <section className="tt-section border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <motion.div
          className="md:col-span-5"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="tt-label mb-4">Lo que hacemos</p>
          <h2 className="tt-headline-lg text-foreground">
            Te ayudamos a equivocarte
            <br />
            rápido, barato y con método.
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
            Equivocarse no es el problema. El problema es hacerlo tarde, caro y
            sin aprender nada. Aquí trabajamos en ciclos cortos con entregables
            reales. Si algo no funciona, lo sabes rápido y ajustas.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PromiseSection;
