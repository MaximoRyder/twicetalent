import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    type: "slider",
    id: "logo_brand",
    label: "Logo y Redes Sociales",
    description: "¿Tienes identidad visual y presencia en redes sociales?",
  },
  {
    type: "slider",
    id: "website",
    label: "Página Web",
    description: "¿Tienes un sitio web funcional para tu proyecto?",
  },
  {
    type: "slider",
    id: "clarity",
    label: "Conocimiento del problema",
    description: "¿Qué tan bien entiendes el problema que resuelves?",
  },
  {
    type: "slider",
    id: "validation",
    label: "Validación del mercado",
    description: "¿Cuánta evidencia real tienes de que el mercado lo necesita?",
  },
  {
    type: "toggle",
    id: "funding",
    label: "Financiamiento",
    description: "¿Cuentas con capital para invertir en este proyecto?",
    onLabel: "Sí",
    offLabel: "No",
  },
  {
    type: "segment",
    id: "budget",
    label: "Presupuesto disponible",
    description: "¿Con cuánto capital cuentas para invertir?",
    options: ["< $5K", "$5K–$15K", "$15K–$50K", "> $50K"],
  },
  {
    type: "slider",
    id: "urgency",
    label: "Urgencia",
    description: "¿Qué tan crítico es avanzar en los próximos 90 días?",
  },
];

/* ─── Helpers ─── */
const contextualLevels: Record<string, string[]> = {
  logo_brand: [
    "Sin identidad aún",
    "Primeros bocetos",
    "Identidad en desarrollo",
    "Marca presente",
    "Marca posicionada",
  ],
  website: [
    "Sin sitio web",
    "Landing básica",
    "Sitio en construcción",
    "Sitio funcional",
    "Experiencia completa",
  ],
  clarity: [
    "Explorando la idea",
    "Conociendo el contexto",
    "Tomando forma",
    "Bien definido",
    "Cristalino",
  ],
  validation: [
    "Sin datos aún",
    "Primeras señales",
    "Evidencia parcial",
    "Mercado responde",
    "Demanda confirmada",
  ],
  urgency: [
    "Sin prisa",
    "Puede esperar",
    "Pronto sería ideal",
    "El reloj corre",
    "Ayer era tarde",
  ],
};

const getLevel = (v: number, questionId?: string): string => {
  if (questionId && contextualLevels[questionId]) {
    const levels = contextualLevels[questionId];
    if (v >= 80) return levels[4];
    if (v >= 60) return levels[3];
    if (v >= 40) return levels[2];
    if (v >= 20) return levels[1];
    return levels[0];
  }
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

/* ─── Main Component ─── */
interface DiagnosticDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LATAM_SPAIN_COUNTRIES = [
  "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica", "Cuba",
  "Ecuador", "El Salvador", "España", "Guatemala", "Honduras", "México",
  "Nicaragua", "Panamá", "Paraguay", "Perú", "Puerto Rico",
  "República Dominicana", "Uruguay", "Venezuela",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/;

const DiagnosticDialog = ({ open, onOpenChange }: DiagnosticDialogProps) => {
  const [answers, setAnswers] = useState<Record<string, number | string | boolean>>({});
  const [contact, setContact] = useState({ nombre: "", apellido: "", email: "", telefono: "", pais: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [autoSaved, setAutoSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const resetAll = useCallback(() => {
    setAnswers({});
    setContact({ nombre: "", apellido: "", email: "", telefono: "", pais: "" });
    setTouched({});
    setAutoSaved(false);
    setSubmitting(false);
    setSubmitted(false);
    setConfirmClose(false);
  }, []);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && !submitted) {
      // User trying to close before submitting — confirm
      const hasData = Object.keys(answers).length > 0 ||
        Object.values(contact).some((v) => v.trim() !== "");
      if (hasData) {
        setConfirmClose(true);
        return;
      }
    }
    if (!newOpen && submitted) {
      resetAll();
    }
    onOpenChange(newOpen);
  }, [submitted, answers, contact, onOpenChange, resetAll]);

  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    setAutoSaved(true);
    const t = setTimeout(() => setAutoSaved(false), 1500);
    return () => clearTimeout(t);
  }, [answers]);

  const setValue = useCallback((id: string, value: number | string | boolean) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const setContactField = useCallback((field: string, value: string) => {
    if (field === "telefono") {
      // Solo permitir números, +, espacios, guiones, paréntesis
      const cleaned = value.replace(/[^\d+\s\-()]/g, "");
      setContact((prev) => ({ ...prev, [field]: cleaned }));
    } else if (field === "nombre" || field === "apellido") {
      // Solo letras, espacios, acentos
      const cleaned = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, "");
      setContact((prev) => ({ ...prev, [field]: cleaned }));
    } else {
      setContact((prev) => ({ ...prev, [field]: value }));
    }
  }, []);

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (touched.nombre && contact.nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres";
    if (touched.apellido && contact.apellido.trim().length < 2) e.apellido = "Mínimo 2 caracteres";
    if (touched.email && !EMAIL_REGEX.test(contact.email.trim())) e.email = "Email inválido";
    if (touched.telefono && !PHONE_REGEX.test(contact.telefono.trim())) e.telefono = "Teléfono inválido";
    if (touched.pais && contact.pais.trim() === "") e.pais = "Selecciona un país";
    return e;
  }, [contact, touched]);

  const contactValid = contact.nombre.trim().length >= 2 &&
    contact.apellido.trim().length >= 2 &&
    EMAIL_REGEX.test(contact.email.trim()) &&
    PHONE_REGEX.test(contact.telefono.trim()) &&
    contact.pais.trim() !== "";

  const contactComplete = contactValid;

  const progress = useMemo(() => {
    const questionsAnswered = questions.filter((q) => answers[q.id] !== undefined).length;
    const contactFields = [contact.nombre, contact.apellido, contact.email, contact.telefono, contact.pais];
    const contactAnswered = contactFields.filter((f) => f.trim() !== "").length;
    const total = questions.length + 5;
    return Math.round(((questionsAnswered + contactAnswered) / total) * 100);
  }, [answers, contact]);

  const readinessScore = useMemo(() => {
    const sliderIds = ["logo_brand", "website", "clarity", "validation", "urgency"];
    const sliderAvg =
      sliderIds.reduce((sum, id) => sum + (typeof answers[id] === "number" ? (answers[id] as number) : 0), 0) /
      sliderIds.length;
    const fundingBonus = answers.funding === true ? 10 : 0;
    return Math.min(100, Math.round(sliderAvg * 0.9 + fundingBonus));
  }, [answers]);

  const allQuestionsAnswered = questions.every((q) => answers[q.id] !== undefined);
  const canSubmit = allQuestionsAnswered && contactValid;
  const readiness = getReadinessLabel(readinessScore);
  const easing = [0.16, 1, 0.3, 1];

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const { error } = await supabase.from("solicitudes").insert({
      nombre: contact.nombre.trim(),
      apellido: contact.apellido.trim(),
      email: contact.email.trim(),
      telefono: contact.telefono.trim(),
      pais: contact.pais.trim(),
      logo_brand: typeof answers.logo_brand === "number" ? answers.logo_brand : 0,
      website: typeof answers.website === "number" ? answers.website : 0,
      clarity: typeof answers.clarity === "number" ? answers.clarity : 0,
      validation: typeof answers.validation === "number" ? answers.validation : 0,
      funding: answers.funding === true,
      budget: typeof answers.budget === "string" ? answers.budget : null,
      urgency: typeof answers.urgency === "number" ? answers.urgency : 0,
      readiness_score: readinessScore,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Hubo un error al enviar. Intenta de nuevo.");
    } else {
      setSubmitted(true);
      toast.success("¡Diagnóstico enviado con éxito!");
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [answers, contact, readinessScore, canSubmit]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border p-0 gap-0 [&>button]:z-20 [&>button]:top-5 [&>button]:right-6">
        <DialogTitle className="sr-only">Diagnóstico Estratégico</DialogTitle>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border px-6 md:px-8 pr-14 py-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <p className="tt-label text-accent">Diagnóstico Estratégico</p>
              <span className="text-sm font-medium text-foreground font-['Space_Grotesk']">
                {progress}%
              </span>
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
            </div>
          </div>
          <div className="w-full h-1 bg-secondary rounded-none overflow-hidden">
            <motion.div
              className="h-full bg-accent"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: easing }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="px-6 md:px-8 py-6">
          <h2 className="tt-headline-md text-foreground mb-2">
            Cuéntame y Conversemos.
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            Evalúa la preparación real de tu proyecto. No es un formulario — es un
            instrumento de lectura estratégica.
          </p>

          {/* Questions */}
          <div className="space-y-5">
            {questions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: easing }}
                className="border border-border p-5 bg-card/50"
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

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easing }}
            className="border border-border p-5 bg-card/50 mt-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: contactComplete ? `hsl(var(--accent))` : `hsl(var(--muted-foreground))` }} />
              <span className="text-sm font-medium text-foreground font-['Space_Grotesk']">Tus datos de contacto</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nombre *</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  maxLength={40}
                  value={contact.nombre}
                  onChange={(e) => setContactField("nombre", e.target.value)}
                  onBlur={() => markTouched("nombre")}
                  className={`w-full bg-background border px-3 py-2.5 text-sm text-foreground font-['Space_Grotesk'] placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${errors.nombre ? "border-red-500" : "border-border focus:border-accent"}`}
                />
                {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Apellido *</label>
                <input
                  type="text"
                  placeholder="Tu apellido"
                  maxLength={40}
                  value={contact.apellido}
                  onChange={(e) => setContactField("apellido", e.target.value)}
                  onBlur={() => markTouched("apellido")}
                  className={`w-full bg-background border px-3 py-2.5 text-sm text-foreground font-['Space_Grotesk'] placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${errors.apellido ? "border-red-500" : "border-border focus:border-accent"}`}
                />
                {errors.apellido && <p className="text-xs text-red-500 mt-1">{errors.apellido}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  maxLength={100}
                  value={contact.email}
                  onChange={(e) => setContactField("email", e.target.value)}
                  onBlur={() => markTouched("email")}
                  className={`w-full bg-background border px-3 py-2.5 text-sm text-foreground font-['Space_Grotesk'] placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${errors.email ? "border-red-500" : "border-border focus:border-accent"}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Teléfono *</label>
                <input
                  type="tel"
                  placeholder="+54 11 1234 5678"
                  maxLength={20}
                  value={contact.telefono}
                  onChange={(e) => setContactField("telefono", e.target.value)}
                  onBlur={() => markTouched("telefono")}
                  className={`w-full bg-background border px-3 py-2.5 text-sm text-foreground font-['Space_Grotesk'] placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${errors.telefono ? "border-red-500" : "border-border focus:border-accent"}`}
                />
                {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">País *</label>
                <select
                  value={contact.pais}
                  onChange={(e) => setContactField("pais", e.target.value)}
                  onBlur={() => markTouched("pais")}
                  className={`w-full bg-background border px-3 py-2.5 text-sm text-foreground font-['Space_Grotesk'] focus:outline-none transition-colors appearance-none ${
                    contact.pais === "" ? "text-muted-foreground/50" : ""
                  } ${errors.pais ? "border-red-500" : "border-border focus:border-accent"}`}
                >
                  <option value="" disabled>Selecciona tu país</option>
                  {LATAM_SPAIN_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.pais && <p className="text-xs text-red-500 mt-1">{errors.pais}</p>}
              </div>
            </div>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: easing }}
                className="mt-10 border border-accent/30 p-6 md:p-8 bg-card/60"
              >
                {/* Score ring */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-28 h-28 mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
                      <motion.circle
                        cx="60" cy="60" r="52" fill="none"
                        stroke="hsl(var(--accent))" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 52}
                        initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - readinessScore / 100) }}
                        transition={{ duration: 1.2, ease: easing }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        className="text-2xl font-medium text-foreground font-['Space_Grotesk']"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {readinessScore}%
                      </motion.span>
                    </div>
                  </div>
                  <h3 className="tt-headline-md text-foreground mb-1">{readiness.label}</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">{readiness.desc}</p>
                </div>

                {/* Breakdown */}
                <div className="space-y-3 mb-8">
                  <p className="tt-label text-accent mb-3">Desglose por dimensión</p>
                  {questions
                    .filter((q) => q.type === "slider")
                    .map((q) => {
                      const val = (answers[q.id] as number) ?? 0;
                      return (
                        <div key={q.id} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-32 shrink-0 font-['Space_Grotesk']">
                            {q.label}
                          </span>
                          <div className="flex-1 h-1.5 bg-secondary overflow-hidden">
                            <motion.div
                              className="h-full bg-accent/70"
                              initial={{ width: 0 }}
                              animate={{ width: `${val}%` }}
                              transition={{ duration: 0.8, ease: easing }}
                            />
                          </div>
                          <span className="text-xs text-foreground w-8 text-right font-['Space_Grotesk']">
                            {val}%
                          </span>
                        </div>
                      );
                    })}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA Submit */}
          <div className="mt-8 text-center">
            {!submitted ? (
              <button
                onClick={() => {
                  if (!canSubmit) {
                    ["nombre", "apellido", "email", "telefono", "pais"].forEach((f) => markTouched(f));
                    toast.error("Completa todos los campos correctamente antes de enviar.");
                    return;
                  }
                  handleSubmit();
                }}
                disabled={submitting}
                className={`tt-btn-primary disabled:opacity-50 ${!canSubmit ? "opacity-60" : ""}`}
              >
                {submitting ? "Enviando..." : "Enviar información"}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-4 space-y-4"
              >
                <p className="text-sm text-accent font-medium">✓ Información enviada con éxito</p>
                <p className="text-xs text-muted-foreground">
                  Recibirás una respuesta personalizada en menos de 24 horas.
                </p>
                <button
                  onClick={() => {
                    resetAll();
                    onOpenChange(false);
                  }}
                  className="tt-btn-secondary"
                >
                  Cerrar
                </button>
              </motion.div>
            )}
          </div>
          <div ref={bottomRef} />
        </div>
      </DialogContent>

      {/* Confirm close popup */}
      <Dialog open={confirmClose} onOpenChange={setConfirmClose}>
        <DialogContent className="max-w-sm bg-background border-border p-6 gap-0">
          <DialogTitle className="tt-headline-md text-foreground mb-2">¿Salir del diagnóstico?</DialogTitle>
          <p className="text-sm text-muted-foreground mb-6">
            Si cierras ahora, perderás todo el progreso y tendrás que empezar de nuevo.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setConfirmClose(false)}
              className="tt-btn-secondary text-sm py-2.5 px-5"
            >
              Continuar
            </button>
            <button
              onClick={() => {
                resetAll();
                onOpenChange(false);
              }}
              className="tt-btn-primary text-sm py-2.5 px-5 bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/80 hover:text-destructive-foreground"
            >
              Salir
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

/* ─── Slider Input ─── */
const SliderInput = ({
  question, value, onChange, answered,
}: {
  question: SliderQuestion; value: number; onChange: (v: number) => void; answered: boolean;
}) => {
  const level = getLevel(value, question.id);
  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: answered ? `hsl(var(--accent))` : `hsl(var(--muted-foreground))` }} />
          <span className="text-sm font-medium text-foreground font-['Space_Grotesk']">{question.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground font-['Space_Grotesk']">{value}%</span>
          <span className="text-xs text-muted-foreground">{level}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4 ml-4">{question.description}</p>
      <input type="range" min={0} max={100} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="diagnostic-slider w-full" />
    </div>
  );
};

/* ─── Segment Input ─── */
const SegmentInput = ({
  question, value, onChange,
}: {
  question: SegmentQuestion; value: string | undefined; onChange: (v: string) => void;
}) => (
  <div>
    <div className="flex items-center gap-2 mb-1">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: value ? `hsl(var(--accent))` : `hsl(var(--muted-foreground))` }} />
      <span className="text-sm font-medium text-foreground font-['Space_Grotesk']">{question.label}</span>
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
  question, value, onChange,
}: {
  question: ToggleQuestion; value: boolean | undefined; onChange: (v: boolean) => void;
}) => (
  <div>
    <div className="flex items-center gap-2 mb-1">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: value !== undefined ? `hsl(var(--accent))` : `hsl(var(--muted-foreground))` }} />
      <span className="text-sm font-medium text-foreground font-['Space_Grotesk']">{question.label}</span>
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

export default DiagnosticDialog;
