import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ─── */
interface SliderQuestion {
  type: "slider";
  id: string;
  label: string;
  description: string;
}

interface SegmentQuestion {
  type: "segment";
  id: string;
  label: string;
  description: string;
  options: string[];
}

interface ToggleQuestion {
  type: "toggle";
  id: string;
  label: string;
  description: string;
  onLabel: string;
  offLabel: string;
}

type Question = SliderQuestion | SegmentQuestion | ToggleQuestion;

/* ─── Data ─── */
const questions: Question[] = [
  {
    type: "segment",
    id: "stage",
    label: "Etapa actual",
    description: "¿En qué fase se encuentra tu proyecto?",
    options: ["Idea", "MVP", "Tracción", "Escala"],
  },
  {
    type: "slider",
    id: "clarity",
    label: "Claridad del problema",
    description: "¿Qué tan definido está el problema que resuelves?",
  },
  {
    type: "slider",
    id: "validation",
    label: "Validación de mercado",
    description: "¿Cuánta evidencia real tienes de que el mercado lo necesita?",
  },
  {
    type: "slider",
    id: "execution",
    label: "Capacidad de ejecución",
    description: "¿Qué tan preparado está tu equipo para ejecutar?",
  },
  {
    type: "slider",
    id: "technical",
    label: "Madurez técnica",
    description: "¿Qué tan avanzado está tu producto o prototipo?",
  },
  {
    type: "toggle",
    id: "funding",
    label: "Financiamiento",
    description: "¿Cuentas con capital para los próximos 6 meses?",
    onLabel: "Sí",
    offLabel: "No",
  },
  {
    type: "slider",
    id: "urgency",
    label: "Urgencia de lanzamiento",
    description: "¿Qué tan crítico es lanzar en los próximos 90 días?",
  },
];

/* ─── Helpers ─── */
const getLevel = (v: number): string => {
  if (v >= 80) return "Muy alto";
  if (v >= 60) return "Alto";
  if (v >= 40) return "Medio";
  if (v >= 20) return "Bajo";
  return "Muy bajo";
};

const getReadinessLabel = (score: number) => {
  if (score >= 80) return { label: "Alta preparación", desc: "Tu proyecto tiene bases sólidas. Estás listo para ejecutar con método y escalar con confianza." };
  if (score >= 60) return { label: "Preparación moderada", desc: "Hay fundamentos pero necesitas refinar áreas clave antes de escalar. Un sprint estratégico de 2 semanas podría cambiar tu trayectoria." };
  if (score >= 40) return { label: "En desarrollo", desc: "Tienes la visión pero falta estructura. Necesitas validar supuestos y construir capacidad de ejecución antes de invertir más." };
  return { label: "Fase exploratoria", desc: "Estás en etapa temprana. Una sesión diagnóstica te ayudará a definir los próximos pasos concretos y evitar errores costosos." };
};

/* ─── Component ─── */
const DiagnosticSection = () => {
  const [answers, setAnswers] = useState<Record<string, number | string | boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);

  // Auto-save indicator
  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    setAutoSaved(true);
    const t = setTimeout(() => setAutoSaved(false), 1500);
    return () => clearTimeout(t);
  }, [answers]);

  const setValue = useCallback((id: string, value: number | string | boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const progress = useMemo(() => {
    const answered = questions.filter((q) => answers[q.id] !== undefined).length;
    return Math.round((answered / questions.length) * 100);
  }, [answers]);

  const readinessScore = useMemo(() => {
    const sliderIds = ["clarity", "validation", "execution", "technical", "urgency"];
    const sliderAvg =
      sliderIds.reduce((sum, id) => sum + (typeof answers[id] === "number" ? (answers[id] as number) : 0), 0) /
      sliderIds.length;

    const stageBonus =
      answers.stage === "Escala" ? 15 : answers.stage === "Tracción" ? 10 : answers.stage === "MVP" ? 5 : 0;
    const fundingBonus = answers.funding === true ? 10 : 0;

    return Math.min(100, Math.round(sliderAvg * 0.75 + stageBonus + fundingBonus));
  }, [answers]);

  const canSubmit = progress === 100;
  const readiness = getReadinessLabel(readinessScore);

  const easing = [0.16, 1, 0.3, 1];

  return (
    <section id="diagnostic" className="tt-section border-t border-accent/20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: easing }}
        >
          <p className="tt-label mb-4 text-accent">Diagnóstico Estratégico</p>
          <h2 className="tt-headline-lg text-foreground mb-4">
            Cuéntame y Hablemos.
          </h2>
          <p className="tt-body mb-12">
            Evalúa la preparación real de tu proyecto. No es un formulario — es un
            instrumento de lectura estratégica.
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="tt-label text-muted-foreground">Progreso</span>
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {autoSaved && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-accent flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                    Guardado
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="text-sm font-medium text-foreground font-['Space_Grotesk']">
                {progress}%
              </span>
            </div>
          </div>
          <div className="w-full h-1 bg-secondary rounded-none overflow-hidden">
            <motion.div
              className="h-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: easing }}
            />
          </div>
        </motion.div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: easing }}
              className="border border-border p-6 bg-card/50 backdrop-blur-sm"
            >
              {q.type === "slider" && (
                <SliderInput
                  question={q}
                  value={(answers[q.id] as number) ?? 0}
                  onChange={(v) => setValue(q.id, v)}
                  answered={answers[q.id] !== undefined}
                />
              )}
              {q.type === "segment" && (
                <SegmentInput
                  question={q}
                  value={answers[q.id] as string}
                  onChange={(v) => setValue(q.id, v)}
                />
              )}
              {q.type === "toggle" && (
                <ToggleInput
                  question={q}
                  value={answers[q.id] as boolean}
                  onChange={(v) => setValue(q.id, v)}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Results */}
        <AnimatePresence>
          {canSubmit && !showResults && (
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: easing }}
            >
              <button
                onClick={() => setShowResults(true)}
                className="tt-btn-primary"
              >
                Ver mi diagnóstico
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: easing }}
              className="mt-16 border border-accent/30 p-8 md:p-12 bg-card/60 backdrop-blur-sm"
            >
              {/* Score ring */}
              <div className="flex flex-col items-center mb-10">
                <div className="relative w-36 h-36 mb-6">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="hsl(var(--secondary))"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="hsl(var(--accent))"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 52}
                      initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                      animate={{
                        strokeDashoffset: 2 * Math.PI * 52 * (1 - readinessScore / 100),
                      }}
                      transition={{ duration: 1.2, ease: easing }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      className="text-3xl font-medium text-foreground font-['Space_Grotesk']"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {readinessScore}%
                    </motion.span>
                  </div>
                </div>
                <h3 className="tt-headline-md text-foreground mb-2">{readiness.label}</h3>
                <p className="tt-body text-center max-w-lg">{readiness.desc}</p>
              </div>

              {/* Dimension breakdown */}
              <div className="space-y-4 mb-10">
                <p className="tt-label text-accent mb-4">Desglose por dimensión</p>
                {questions
                  .filter((q) => q.type === "slider")
                  .map((q) => {
                    const val = (answers[q.id] as number) ?? 0;
                    return (
                      <div key={q.id} className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground w-40 shrink-0 font-['Space_Grotesk']">
                          {q.label}
                        </span>
                        <div className="flex-1 h-1.5 bg-secondary rounded-none overflow-hidden">
                          <motion.div
                            className="h-full bg-accent/70"
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            transition={{ duration: 0.8, ease: easing }}
                          />
                        </div>
                        <span className="text-sm text-foreground w-10 text-right font-['Space_Grotesk']">
                          {val}%
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* CTA */}
              <div className="text-center pt-6 border-t border-border">
                <p className="tt-body mb-6">
                  ¿Listo para convertir este diagnóstico en un plan de acción?
                </p>
                <button className="tt-btn-primary">
                  Enviar
                </button>
                <p className="text-xs text-muted-foreground mt-4">
                  Recibirás una respuesta personalizada en menos de 24 horas.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ─── Slider Input ─── */
const SliderInput = ({
  question,
  value,
  onChange,
  answered,
}: {
  question: SliderQuestion;
  value: number;
  onChange: (v: number) => void;
  answered: boolean;
}) => {
  const level = getLevel(value);

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: answered
                ? `hsl(var(--accent))`
                : `hsl(var(--muted-foreground))`,
            }}
          />
          <span className="text-sm font-medium text-foreground font-['Space_Grotesk']">
            {question.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground font-['Space_Grotesk']">
            {value}%
          </span>
          <span className="text-xs text-muted-foreground">{level}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4 ml-4">{question.description}</p>
      <div className="relative group">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="diagnostic-slider w-full"
        />
      </div>
    </div>
  );
};

/* ─── Segment Input ─── */
const SegmentInput = ({
  question,
  value,
  onChange,
}: {
  question: SegmentQuestion;
  value: string | undefined;
  onChange: (v: string) => void;
}) => (
  <div>
    <div className="flex items-center gap-2 mb-1">
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: value
            ? `hsl(var(--accent))`
            : `hsl(var(--muted-foreground))`,
        }}
      />
      <span className="text-sm font-medium text-foreground font-['Space_Grotesk']">
        {question.label}
      </span>
    </div>
    <p className="text-xs text-muted-foreground mb-4 ml-4">{question.description}</p>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {question.options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`py-3 px-4 text-sm font-['Space_Grotesk'] font-medium tracking-wide border transition-all duration-300 ${
            value === opt
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

/* ─── Toggle Input ─── */
const ToggleInput = ({
  question,
  value,
  onChange,
}: {
  question: ToggleQuestion;
  value: boolean | undefined;
  onChange: (v: boolean) => void;
}) => (
  <div>
    <div className="flex items-center gap-2 mb-1">
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: value !== undefined
            ? `hsl(var(--accent))`
            : `hsl(var(--muted-foreground))`,
        }}
      />
      <span className="text-sm font-medium text-foreground font-['Space_Grotesk']">
        {question.label}
      </span>
    </div>
    <p className="text-xs text-muted-foreground mb-4 ml-4">{question.description}</p>
    <div className="flex gap-2">
      {[
        { label: question.offLabel, val: false },
        { label: question.onLabel, val: true },
      ].map((opt) => (
        <button
          key={opt.label}
          onClick={() => onChange(opt.val)}
          className={`py-3 px-8 text-sm font-['Space_Grotesk'] font-medium tracking-wide border transition-all duration-300 ${
            value === opt.val
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export default DiagnosticSection;
