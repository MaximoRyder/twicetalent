import { motion } from "framer-motion";
import heroVideo from "@/assets/hero-video.mp4";

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-end">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-background/80" />

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 xl:px-32 pb-16 md:pb-24 lg:pb-32">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="tt-label mb-6 text-accent"
        >
          Laboratorio de Ejecución
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="tt-headline-xl text-foreground max-w-5xl"
        >
          Once is luck.
          <br />
          Twice is talent.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="tt-body max-w-2xl mt-8 mb-12"
        >
          Tienes una idea. Aquí te ayudamos a construirla, validarla y lanzarla.
          Sin rodeos. Con método.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a href="#contact" className="tt-btn-primary">
            Agendar Llamada Diagnóstica
          </a>
          <a href="#process" className="tt-btn-secondary">
            Ver el Proceso
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
