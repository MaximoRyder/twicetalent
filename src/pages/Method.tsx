import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/tt-logo-white.png";

// ── Data ──────────────────────────────────────────────

type StepType = "qa" | "dev" | "neutral" | "release" | "both";

interface Step {
  num: number;
  emoji: string;
  title: string;
  type: StepType;
  owners?: StepType[];
  desc: string;
  details?: string[];
}

interface Feedback {
  text: string;
  afterStep: number;
}

const steps: Step[] = [
  {
    num: 1, emoji: "💡", title: "Requerimiento funcional", type: "neutral",
    desc: "Se baja el requerimiento funcional. Qué se necesita y por qué.",
  },
  {
    num: 2, emoji: "📋", title: "US Recargada Funcional", type: "qa", owners: ["qa"],
    desc: "Área QA arma la especificación funcional completa. Sin código, sin arquitectura.",
    details: [
      "Objetivo y alcance", "Fuera de alcance", "Comportamiento esperado paso a paso",
      "Precondiciones visibles", "Acceptance criteria medibles", "Excepciones funcionales por rol",
      "Reglas visibles de UI (maxlength, tooltips, cursores, estilos, tipografías, tamaños)",
      "Criterios de responsive y breakpoints", "Reglas funcionales (filtros, orden, paginación)",
      "Mensajes de error exactos", "Estados de componentes (hover, disabled, loading, error)",
      "Iconografía y grillas", "Escritura de test cases funcionales", "Checklist de QA",
    ],
  },
  {
    num: 3, emoji: "🔍", title: "Revisión e Iteración", type: "dev", owners: ["dev"],
    desc: "Área Dev revisa la US y corrige junto con Área QA hasta que esté completa.",
    details: [
      "Detección de vacíos funcionales", "Corrección de lógica y ambigüedades",
      "Validación de restricciones técnicas", "Evaluación de impacto en datos",
      "Ajuste de criterios de aceptación", "Confirmación de viabilidad técnica",
    ],
  },
  {
    num: 4, emoji: "⚡", title: "Prompt / Implementación con IA", type: "dev", owners: ["dev"],
    desc: "Con la US aprobada, Área Dev promptea y construye.",
  },
  {
    num: 5, emoji: "🧪", title: "Testing técnico", type: "both", owners: ["dev", "qa"],
    desc: "Validación de la implementación a nivel técnico.",
    details: [
      "Lógica de negocio técnica", "Integridad y persistencia de datos",
      "Integración con APIs y servicios", "Seguridad (OAuth, tokens, rate limit)",
      "Edge cases", "Performance y carga", "Regresión técnica",
    ],
  },
  {
    num: 6, emoji: "✅", title: "Testing funcional", type: "qa", owners: ["qa"],
    desc: "Validación contra la US aprobada. Lo visible, lo que el usuario ve y toca.",
    details: [
      "El flujo principal funciona de punta a punta", "Los campos aceptan/rechazan lo definido",
      "Maxlength se respeta en cada campo", "El cursor inicia donde corresponde",
      "No hay saltos erráticos de cursor", "Los tooltips aparecen cuando corresponde",
      "El estilo visual coincide con lo definido", "La iconografía es la correcta",
      "Filtros y orden funcionan visualmente", "Paginación responde según lo esperado",
      "Validación cross-browser", "En mobile/tablet no se rompe",
      "Los mensajes de error son los definidos", "Botones y acciones responden correctamente",
      "Ejecución de test cases escritos en la US", "Se cumplen todos los acceptance criteria",
    ],
  },
  {
    num: 7, emoji: "🔧", title: "Ajustes", type: "dev", owners: ["dev"],
    desc: "Se corrigen desvíos encontrados en el testing.",
  },
  {
    num: 8, emoji: "🚀", title: "Release", type: "release",
    desc: "Se libera la funcionalidad.",
  },
];

const feedbacks: Feedback[] = [
  { afterStep: 3, text: "Retroalimentación → vuelve a US Recargada si hay correcciones (ciclo iterativo hasta aprobación)" },
  { afterStep: 7, text: "Retroalimentación → vuelve a Testing funcional para revalidar los ajustes realizados" },
];

const qaZone = {
  title: "Área QA",
  items: [
    "Objetivo y alcance funcional", "Comportamiento esperado (paso a paso del usuario)",
    "Acceptance criteria medibles", "Escritura de test cases funcionales",
    "Reglas visibles: maxlength, tooltips, cursores, estilos", "Tipografías, tamaños, iconografía",
    "Criterios responsive y breakpoints", "Excepciones funcionales (ej: superadmin salta validación X)",
    "Paginación, filtros y orden a nivel visible", "Mensajes de error textuales",
    "Estados de componentes (hover, disabled, loading, error)", "Ejecución de test cases contra la US",
    "Validación funcional manual completa",
  ],
  forbidden: [
    "Gherkin / pseudocódigo", "Arquitectura / API / SQL", "Seguridad profunda (OAuth, tokens, state)",
    "Performance técnica", "Logs / persistencia interna", "Prompts / decisiones de IA",
  ],
};

const devZone = {
  title: "Área Dev",
  items: [
    "Bajar el requerimiento funcional", "Revisar e iterar la US con Área QA",
    "Definir arquitectura y stack", "Promptear y construir con IA",
    "Lógica de negocio técnica", "Integridad de datos y persistencia",
    "Seguridad (OAuth, tokens, rate limit)", "Testing técnico completo",
    "Edge cases", "Fix de desvíos post testing", "Release",
  ],
  forbidden: [
    "Escribir Gherkin técnico", "Definir DoR técnico", "Evaluar logs o performance",
    "Decidir sobre flows de auth", "Validar persistencia de datos",
  ],
};

const templateBlocks = [
  { title: "1. Definición", items: ["Título claro y corto", "Objetivo: qué problema resuelve", "Alcance: qué entra", "Fuera de alcance: qué no entra"] },
  { title: "2. Comportamiento esperado", items: ["Paso a paso desde el usuario", "Qué ve, qué toca, qué pasa", "Excepciones funcionales", "Precondiciones visibles"] },
  { title: "3. Reglas visibles / UI", items: ["Maxlength por campo", "Tipos de dato esperados", "Tooltips y textos de ayuda", "Cursores e inicio de cursor", "Estilos, tipografías, tamaños", "Iconografía", "Grillas y breakpoints responsive", "Estados de componentes"] },
  { title: "4. Reglas funcionales", items: ["Filtros visibles (AND/OR, asc/desc)", "Criterios de paginación", "Orden por defecto", "Excepciones por rol (superadmin, etc.)", "Mensajes de error exactos", "Combinaciones de estados"] },
  { title: "5. Acceptance criteria", items: ["Medibles y verificables", "En lenguaje natural, no Gherkin", '"El campo X acepta máximo 50 caracteres"', '"Al filtrar por fecha, se ordena desc"', '"En mobile, el menú colapsa a hamburguesa"'] },
  { title: "6. Test cases funcionales", items: ["Casos del flujo principal (happy path)", "Casos de validación de campos", "Casos de error previsibles", "Casos de responsive", "Casos de excepciones por rol", "Casos de filtros, orden y paginación"] },
  { title: "7. Checklist de QA", items: ["Validaciones visibles a ejecutar", "Campos, tooltips, cursores", "Estilos e iconografía", "Responsive en dispositivos clave", "Mensajes y estados de componentes"] },
  { title: "8. Mockup / evidencia visual", items: ["Capturas, wireframes, Figma", "Screenshots anotados", "Prototipos o diagramas de flujo", "Referencia visual del resultado esperado"] },
];

// ── Helpers ──────────────────────────────────────────

const typeColors: Record<StepType, { dot: string; text: string; border: string; bg: string }> = {
  qa:      { dot: "bg-amber-500/10 border-amber-500/25", text: "text-amber-400", border: "border-amber-500/25", bg: "bg-amber-500/8" },
  dev:     { dot: "bg-blue-500/10 border-blue-500/25",   text: "text-blue-400",  border: "border-blue-500/25",  bg: "bg-blue-500/8" },
  neutral: { dot: "bg-secondary border-border",          text: "text-purple-400", border: "border-border",       bg: "bg-secondary" },
  release: { dot: "bg-emerald-500/10 border-emerald-500/25", text: "text-emerald-400", border: "border-emerald-500/25", bg: "bg-emerald-500/8" },
  both:    { dot: "bg-gradient-to-br from-amber-500/10 to-blue-500/10 border-border", text: "text-foreground", border: "border-border", bg: "bg-secondary" },
};

const ownerBadge = (type: StepType) => {
  if (type === "qa") return "bg-amber-500/10 text-amber-500 border-amber-500/25";
  if (type === "dev") return "bg-blue-500/10 text-blue-500 border-blue-500/25";
  return "";
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

// ── Components ──────────────────────────────────────────

const OwnerBadge = ({ type }: { type: StepType }) => (
  <span className={`font-mono text-[0.62rem] uppercase tracking-[1.5px] font-semibold px-2 py-0.5 border ${ownerBadge(type)}`}>
    {type === "qa" ? "Área QA" : "Área Dev"}
  </span>
);

const DetailList = ({ items, type }: { items: string[]; type: StepType }) => (
  <ul className={`mt-3 p-4 bg-secondary/60 border border-border rounded-none text-[0.82rem] text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1`}>
    {items.map((item, i) => (
      <li key={i} className="pl-4 relative py-0.5">
        <span className={`absolute left-0 text-xs ${typeColors[type].text}`}>→</span>
        {item}
      </li>
    ))}
  </ul>
);

const FeedbackArrow = ({ text }: { text: string }) => (
  <motion.div
    variants={fadeUp}
    className="flex items-center gap-3 ml-[68px] my-1 px-4 py-2 bg-orange-500/5 border border-dashed border-orange-500/30 text-orange-400 font-mono text-xs font-medium"
  >
    <span className="text-base flex-shrink-0">↩</span>
    {text}
  </motion.div>
);

const ZoneCard = ({ title, items, forbidden, type }: { title: string; items: string[]; forbidden: string[]; type: "qa" | "dev" }) => {
  const c = typeColors[type];
  return (
    <motion.div variants={fadeUp} className={`${c.bg} border ${c.border} p-6 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${type === "qa" ? "bg-amber-500" : "bg-blue-500"}`} />
      <h3 className={`font-mono text-sm font-semibold mb-4 ${c.text}`}>{title}</h3>
      <ul className="text-[0.82rem] text-muted-foreground space-y-1">
        {items.map((item, i) => (
          <li key={i} className="pl-4 relative">
            <span className="absolute left-0 text-muted-foreground text-xs">→</span>{item}
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-dashed border-border">
        <p className="font-mono text-[0.65rem] uppercase tracking-[1.5px] text-destructive/80 mb-2">Fuera de perímetro</p>
        <ul className="text-[0.78rem] text-muted-foreground/60 space-y-0.5">
          {forbidden.map((item, i) => (
            <li key={i} className="pl-4 relative line-through">
              <span className="absolute left-0 text-destructive no-underline text-xs">✗</span>{item}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

// ── Page ──────────────────────────────────────────

const Method = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 py-6 bg-background/80 backdrop-blur-md border-b border-border/40">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Twice Talent" className="h-8 w-auto" />
          <span className="tt-label text-foreground tracking-[0.15em] hidden sm:inline">Twice Talent</span>
        </Link>
        <Link to="/" className="tt-btn-secondary text-xs py-3 px-6 flex items-center gap-2">
          <ArrowLeft size={14} /> Volver
        </Link>
      </nav>

      <div className="max-w-[960px] mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <motion.header
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="tt-headline-lg text-foreground mb-3">
            Proceso: US Recargada Funcional
          </h1>
          <p className="tt-body max-w-xl mx-auto mb-6">
            Flujo de trabajo completo desde el requerimiento hasta el release.
            Dos áreas, perímetros claros, cero zonas grises.
          </p>
          <div className="inline-block px-5 py-2 bg-secondary border border-border text-muted-foreground text-sm font-semibold font-mono">
            <span className="text-amber-400">QA</span> define y valida lo funcional &nbsp;·&nbsp; <span className="text-blue-400">Dev</span> revisa, construye y libera
          </div>
        </motion.header>

        {/* Timeline */}
        <section className="mb-16">
          <p className="tt-label mb-5 text-accent">Flujo completo — 8 pasos</p>

          <motion.div
            className="relative flex flex-col"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* Timeline line */}
            <div className="absolute left-[28px] top-7 bottom-7 w-[2px] bg-border" />

            {steps.map((step) => {
              const c = typeColors[step.type];
              const feedback = feedbacks.find(f => f.afterStep === step.num);
              return (
                <div key={step.num}>
                  <motion.div variants={fadeUp} className="flex items-start gap-5 relative z-[1] py-2">
                    <div className={`w-14 h-14 flex items-center justify-center text-2xl flex-shrink-0 border-[1.5px] ${c.dot}`}>
                      {step.emoji}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <span className="font-mono text-[0.65rem] text-muted-foreground min-w-[14px]">{step.num}</span>
                        <span className={`font-semibold text-base ${c.text}`}>{step.title}</span>
                        {step.owners?.map(o => <OwnerBadge key={o} type={o} />)}
                      </div>
                      <p className="text-muted-foreground text-sm">{step.desc}</p>
                      {step.details && <DetailList items={step.details} type={step.type} />}
                    </div>
                  </motion.div>
                  {feedback && <FeedbackArrow text={feedback.text} />}
                </div>
              );
            })}
          </motion.div>
        </section>

        {/* Zones */}
        <section className="mb-16">
          <p className="tt-label mb-5 text-accent">Perímetros — responsabilidad por área</p>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <ZoneCard type="qa" title={qaZone.title} items={qaZone.items} forbidden={qaZone.forbidden} />
            <ZoneCard type="dev" title={devZone.title} items={devZone.items} forbidden={devZone.forbidden} />
          </motion.div>
        </section>

        {/* US Template */}
        <section className="mb-16">
          <p className="tt-label mb-5 text-accent">Plantilla — US Recargada Funcional (paso 2)</p>
          <motion.div
            className="bg-secondary/60 border border-amber-500/25 p-7 relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400" />
            <h3 className="font-mono text-base text-amber-400 font-semibold mb-6">Entregable de Área QA</h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {templateBlocks.map((block, i) => (
                <motion.div key={i} variants={fadeUp} className="p-4 bg-background/60 border border-border">
                  <h4 className="font-mono text-[0.72rem] uppercase tracking-[1.2px] text-amber-500 mb-2">{block.title}</h4>
                  <ul className="text-[0.8rem] text-muted-foreground space-y-0.5">
                    {block.items.map((item, j) => (
                      <li key={j} className="pl-3.5 relative">
                        <span className="absolute left-0 text-amber-500 text-xs">→</span>{item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Bottom rule */}
        <motion.div
          className="text-center p-7 bg-secondary/60 border border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-foreground leading-loose">
            <span className="font-mono font-semibold text-sm">
              <span className="text-amber-400">Área QA</span> participa en el paso 2 y en el paso 6.
            </span>
            <br />
            Especificación funcional al inicio. Validación funcional al final.
            <br /><br />
            <span className="font-mono font-semibold text-sm">
              <span className="text-blue-400">Área Dev</span> gestiona los pasos 1, 3, 4, 5, 7 y 8.
            </span>
            <br />
            Requerimiento, revisión e iteración, construcción, testing técnico, ajustes y release.
            <br /><br />
            <span className="text-muted-foreground text-sm">
              Los ciclos de retroalimentación entre pasos 3↩2 y 7↩6 garantizan calidad sin bloqueos.
            </span>
            <br />
            <span className="text-muted-foreground text-sm">
              Cada área opera dentro de su perímetro. Sin zonas grises.
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Method;
