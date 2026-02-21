import { motion } from "framer-motion";
import bgTexture from "@/assets/bg-texture-3.jpg";

const PackagesSection = () => {
  const packages = [
    {
      name: "Starter",
      range: "Idea → Validación",
      desc: "Definimos hipótesis, testeamos supuestos y decidimos juntos si vale la pena construir.",
    },
    {
      name: "Build",
      range: "Validación → MVP",
      desc: "Diseñamos, desarrollamos y lanzamos un producto enfocado en aprender, no en impresionar.",
    },
    {
      name: "Launch",
      range: "MVP → Go-to-market",
      desc: "Te preparamos para el mercado, afinamos la narrativa y te posicionamos frente a inversores.",
    },
  ];

  return (
    <section className="relative tt-section border-t border-border overflow-hidden">
      <img
        src={bgTexture}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
        loading="lazy"
      />
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="tt-label mb-4">Paquetes</p>
          <h2 className="tt-headline-lg text-foreground max-w-3xl mb-16 md:mb-24">
            Tres caminos. Un sistema.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.name}
              className="bg-background/80 backdrop-blur-sm p-8 md:p-12 flex flex-col justify-between min-h-[280px]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <h3 className="tt-headline-md text-foreground mb-2">
                  {pkg.name}
                </h3>
                <p className="tt-label text-accent mb-6">{pkg.range}</p>
              </div>
              <p className="tt-body">{pkg.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PackagesSection;
