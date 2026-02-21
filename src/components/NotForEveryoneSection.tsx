import { motion } from "framer-motion";

const NotForEveryoneSection = () => {
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
          <p className="tt-label mb-4">Honestidad</p>
          <h2 className="tt-headline-lg text-foreground">No es para todos.</h2>
        </motion.div>
        <motion.div
          className="md:col-span-5 md:col-start-7 flex items-end"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <ul className="space-y-4">
            <li className="tt-body border-l-2 border-accent pl-6">
              No construimos MVPs enormes sin validar primero.
            </li>
            <li className="tt-body border-l-2 border-accent pl-6">
              No decimos que sí a todo. Optimizamos para resultados.
            </li>
            <li className="tt-body border-l-2 border-accent pl-6">
              Si no estás dispuesto a medir y cambiar, esto no es para vos.
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default NotForEveryoneSection;
