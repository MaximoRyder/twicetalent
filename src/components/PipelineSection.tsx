import { motion } from "framer-motion";

const stages = [
  { num: "01", title: "Discovery & Posicionamiento" },
  { num: "02", title: "Marca & Identidad" },
  { num: "03", title: "Activos Comerciales" },
  { num: "04", title: "Presencia Digital" },
  { num: "05", title: "Validación" },
  { num: "06", title: "POC / MVP" },
  { num: "07", title: "QA & Release" },
  { num: "08", title: "Investor Readiness" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const PipelineSection = () => {
  return (
    <section id="process" className="tt-section border-t border-accent/20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="tt-label mb-4 text-accent">Tu idea, de punta a punta</p>
        <h2 className="tt-headline-lg text-foreground max-w-3xl mb-16 md:mb-24">
          De la idea al lanzamiento. Todo el camino.
        </h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {stages.map((stage) => (
          <motion.div
            key={stage.num}
            variants={itemVariants}
            className="bg-background p-8 md:p-10 group transition-colors duration-500 hover:bg-secondary"
          >
            <span className="tt-label text-accent block mb-4">
              {stage.num}
            </span>
            <h3 className="tt-headline-md text-foreground text-lg">
              {stage.title}
            </h3>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default PipelineSection;
