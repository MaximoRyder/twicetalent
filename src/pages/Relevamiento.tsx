import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import {
  ArrowLeft, ArrowRight, Check, Loader2, User, Building2, Layers,
  SlidersHorizontal, Palette, Sparkles, Languages, Clock, FileText,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/tt-logo-white.png";
import {
  RelevamientoForm, initialForm, PAISES, CODIGOS_PAIS, INDUSTRIAS,
  FUNCIONALIDADES, IDIOMAS,
} from "@/lib/relevamientoData";

const STORAGE_KEY = "tt_relevamiento_v1";

const stepSchemas = [
  z.object({
    nombre: z.string().trim().min(1, "Requerido").max(100),
    apellido: z.string().trim().min(1, "Requerido").max(100),
    email: z.string().trim().email("Email inválido").max(255),
    pais: z.string().min(1, "Selecciona un país"),
    ciudad: z.string().trim().min(1, "Requerido").max(120),
    sitio_web: z.string().trim().max(500).optional().or(z.literal("")),
  }),
  z.object({
    industria: z.string().min(1, "Selecciona una industria"),
    descripcion_negocio: z.string().trim().min(100, "Mínimo 100 caracteres").max(3000),
    publico_objetivo: z.string().trim().min(1, "Requerido").max(1500),
  }),
  z.object({
    tipo_proyecto: z.string().min(1, "Requerido"),
    modelo_gestion: z.string().min(1, "Requerido"),
    etapa_proyecto: z.string().min(1, "Requerido"),
  }),
  z.object({}),
  z.object({ estado_marca: z.string().min(1, "Requerido") }),
  z.object({}),
  z.object({
    multiidioma: z.enum(["si", "no"], { errorMap: () => ({ message: "Requerido" }) }),
  }),
  z.object({
    plazo: z.string().min(1, "Requerido"),
  }),
  z.object({}),
];

const STEPS = [
  { title: "Contacto", icon: User },
  { title: "Contexto", icon: Building2 },
  { title: "Tipo de Proyecto", icon: Layers },
  { title: "Funcionalidades", icon: SlidersHorizontal },
  { title: "Diseño", icon: Palette },
  { title: "Referencias", icon: Sparkles },
  { title: "Idiomas", icon: Languages },
  { title: "Tiempos", icon: Clock },
  { title: "Cierre", icon: FileText },
];

const TIPOS_PROYECTO = ["Plataforma","Aplicación móvil","Webapp","Ecommerce","Landing page","Otro"];
const MODELOS_GESTION = [
  { value: "autogestion", label: "Autogestión", desc: "El cliente administra contenido por su cuenta" },
  { value: "estatica", label: "Estática", desc: "Sin panel de administración" },
  { value: "mixta", label: "Mixta", desc: "Algunas secciones autogestionables" },
];
const ETAPAS = [
  "Idea inicial",
  "Proyecto en validación",
  "En marcha — necesita rediseño o migración",
  "Ampliación de un producto existente",
];
const ESTADOS_MARCA = [
  "Tengo manual de marca completo",
  "Solo tengo el logo",
  "No tengo, necesito que lo desarrollen",
];
const PLAZOS = [
  { v: "1 mes", desc: "Ejecución acelerada" },
  { v: "2 meses", desc: "Ritmo intensivo" },
  { v: "3 meses", desc: "Plazo estándar" },
  { v: "Más de 3 meses", desc: "Construcción extendida" },
  { v: "Lo necesito para ayer", desc: "Prioridad máxima" },
];
const MODELOS_TRABAJO = ["Proyecto cerrado","Retainer mensual","Aún no lo sé"];
const COMO_NOS_CONOCIO = ["Recomendación","Redes sociales","Búsqueda web","Evento","Otro"];

/* ───────── Reusable primitives ───────── */
const easing = [0.16, 1, 0.3, 1] as const;

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2 font-['Space_Grotesk'] font-medium">
    {children} {required && <span className="text-accent">*</span>}
  </label>
);

const TextField = ({
  value, onChange, placeholder, error, type = "text", maxLength,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  error?: string; type?: string; maxLength?: number;
}) => (
  <>
    <input
      type={type}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-background border px-4 py-3 text-sm text-foreground font-['Space_Grotesk'] placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${
        error ? "border-destructive" : "border-border focus:border-accent"
      }`}
    />
    {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
  </>
);

const TextAreaField = ({
  value, onChange, placeholder, error, rows = 4, maxLength,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  error?: string; rows?: number; maxLength?: number;
}) => (
  <>
    <textarea
      rows={rows}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-background border px-4 py-3 text-sm text-foreground font-['Space_Grotesk'] placeholder:text-muted-foreground/50 focus:outline-none transition-colors resize-none ${
        error ? "border-destructive" : "border-border focus:border-accent"
      }`}
    />
    {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
  </>
);

const SelectField = ({
  value, onChange, options, placeholder, error,
}: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string; error?: string;
}) => (
  <>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-background border px-4 py-3 text-sm text-foreground font-['Space_Grotesk'] focus:outline-none transition-colors appearance-none pr-10 ${
          error ? "border-destructive" : "border-border focus:border-accent"
        } ${!value ? "text-muted-foreground/60" : ""}`}
      >
        <option value="" disabled>{placeholder ?? "Selecciona"}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-foreground bg-background">
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none"
        viewBox="0 0 12 12" fill="none"
      >
        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
    {error && <p className="text-xs text-destructive mt-1.5">{error}</p>}
  </>
);

const OptionCard = ({
  selected, onClick, title, desc, compact,
}: {
  selected: boolean; onClick: () => void; title: string; desc?: string; compact?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left border transition-all duration-200 ${
      compact ? "px-4 py-3" : "px-5 py-4"
    } ${
      selected
        ? "border-accent bg-accent/5"
        : "border-border bg-card/30 hover:border-muted-foreground/40"
    }`}
  >
    <div className="flex items-start gap-3">
      <span
        className={`mt-1 w-3 h-3 border flex items-center justify-center flex-shrink-0 transition-colors ${
          selected ? "border-accent" : "border-muted-foreground/40"
        }`}
      >
        {selected && <span className="w-1.5 h-1.5 bg-accent" />}
      </span>
      <div className="flex-1">
        <p className="text-sm text-foreground font-['Space_Grotesk'] font-medium">{title}</p>
        {desc && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>}
      </div>
    </div>
  </button>
);

const CheckCard = ({
  checked, onClick, label,
}: { checked: boolean; onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left border transition-all duration-200 px-4 py-3 ${
      checked ? "border-accent bg-accent/5" : "border-border bg-card/30 hover:border-muted-foreground/40"
    }`}
  >
    <div className="flex items-start gap-3">
      <span
        className={`mt-0.5 w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${
          checked ? "border-accent bg-accent" : "border-muted-foreground/40"
        }`}
      >
        {checked && <Check className="w-3 h-3 text-accent-foreground" strokeWidth={3} />}
      </span>
      <span className="text-sm text-foreground font-['Space_Grotesk'] leading-snug">{label}</span>
    </div>
  </button>
);

const SectionCard = ({
  number, title, description, children,
}: {
  number: string; title: string; description?: string; children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: easing }}
    className="border border-border bg-card/50 p-6 md:p-8"
  >
    <div className="flex items-center gap-3 mb-1">
      <span className="w-2 h-2 rounded-full bg-accent" />
      <span className="text-xs uppercase tracking-[0.2em] text-accent font-['Space_Grotesk'] font-medium">
        {number}
      </span>
    </div>
    <h2 className="tt-headline-md text-foreground mt-2 mb-2">{title}</h2>
    {description && (
      <p className="text-sm text-muted-foreground mb-7 leading-relaxed max-w-2xl">{description}</p>
    )}
    <div className="space-y-6 mt-6">{children}</div>
  </motion.div>
);

/* ───────── Page ───────── */
const Relevamiento = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RelevamientoForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [restored, setRestored] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Relevamiento de Proyecto | Twice Talent";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      "Relevamiento estratégico para preparar una propuesta formal de tu proyecto digital.",
    );
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm({ ...initialForm, ...parsed.form });
        setStep(parsed.step ?? 0);
        setRestored(true);
        setTimeout(() => setRestored(false), 4000);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step }));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 1200);
      } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [form, step]);

  const totalSteps = STEPS.length;
  const progress = useMemo(
    () => Math.round(((step + 1) / totalSteps) * 100),
    [step, totalSteps],
  );

  const update = <K extends keyof RelevamientoForm>(k: K, v: RelevamientoForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k as string]: "" }));
  };

  const toggleArray = (key: "funcionalidades" | "idiomas", value: string) => {
    setForm((f) => {
      const arr = f[key];
      return { ...f, [key]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  };

  const validateStep = (): boolean => {
    const result = stepSchemas[step].safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => {
    if (!validateStep()) {
      toast.error("Revisa los campos marcados antes de continuar.");
      return;
    }
    setStep((s) => Math.min(s + 1, totalSteps - 1));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async () => {
    if (form.website_hp) return;
    if (!form.acepta_privacidad || !form.acepta_contacto) {
      toast.error("Debes aceptar la política de privacidad y la autorización de contacto.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim().toLowerCase(),
        telefono: form.telefono.trim() || null,
        telefono_codigo_pais: form.telefono ? form.telefono_codigo_pais : null,
        empresa: form.empresa.trim() || null,
        rol: form.rol.trim() || null,
        pais: form.pais,
        ciudad: form.ciudad.trim(),
        sitio_web: form.sitio_web.trim() || null,
        industria: form.industria,
        industria_otro: form.industria === "Otro" ? form.industria_otro.trim() || null : null,
        descripcion_negocio: form.descripcion_negocio.trim(),
        publico_objetivo: form.publico_objetivo.trim(),
        competencia: form.competencia.trim() || null,
        tipo_proyecto: form.tipo_proyecto,
        tipo_proyecto_otro: form.tipo_proyecto === "Otro" ? form.tipo_proyecto_otro.trim() || null : null,
        modelo_gestion: form.modelo_gestion,
        etapa_proyecto: form.etapa_proyecto,
        funcionalidades: form.funcionalidades,
        funcionalidades_otras: form.funcionalidades_otras.trim() || null,
        pasarela_pagos: form.pasarela_pagos.trim() || null,
        crm_detalle: form.crm_detalle.trim() || null,
        estado_marca: form.estado_marca,
        archivos_links: form.archivos_links.trim() || null,
        referencias_esteticas: form.referencias_esteticas.trim() || null,
        sitios_referencia: form.sitios_referencia.trim() || null,
        que_te_gusta: form.que_te_gusta.trim() || null,
        que_evitar: form.que_evitar.trim() || null,
        multiidioma: form.multiidioma === "si",
        idiomas: form.multiidioma === "si" ? form.idiomas : [],
        idioma_principal: form.multiidioma === "si" ? form.idioma_principal || null : null,
        idiomas_otros: form.multiidioma === "si" ? form.idiomas_otros.trim() || null : null,
        plazo: form.plazo,
        fecha_limite: form.fecha_limite.trim() || null,
        presupuesto: form.presupuesto,
        modelo_trabajo: form.modelo_trabajo || null,
        comentarios: form.comentarios.trim() || null,
        como_nos_conocio: form.como_nos_conocio || null,
        acepta_privacidad: form.acepta_privacidad,
        acepta_contacto: form.acepta_contacto,
      };
      const { error } = await supabase.from("relevamientos").insert(payload);
      if (error) throw error;
      localStorage.removeItem(STORAGE_KEY);
      navigate("/relevamiento/gracias");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Intenta de nuevo en unos minutos.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const stepNum = (n: number) => `0${n + 1}`.slice(-2);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 bg-background/85 backdrop-blur-md border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Twice Talent" className="h-7 w-auto" />
          <span className="tt-label text-foreground tracking-[0.2em] hidden sm:inline">
            Twice Talent
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <AnimatePresence>
            {autoSaved && (
              <motion.span
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-accent flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                Guardado
              </motion.span>
            )}
          </AnimatePresence>
          <Link to="/" className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors font-['Space_Grotesk']">
            Volver
          </Link>
        </div>
      </nav>

      <div ref={topRef} />

      {/* Top progress bar */}
      <div className="fixed top-[68px] left-0 right-0 z-40 h-px bg-border">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: easing }}
        />
      </div>

      <main className="max-w-6xl mx-auto px-6 md:px-12 pt-32 pb-24">
        {/* Header */}
        <header className="mb-12 max-w-3xl">
          <p className="tt-label text-accent mb-4">Relevamiento Estratégico</p>
          <h1 className="tt-headline-lg text-foreground mb-5">
            Construyamos juntos los cimientos de tu proyecto.
          </h1>
          <p className="tt-body text-secondary-foreground">
            Este relevamiento nos permite leer el alcance, los tiempos y la inversión necesaria para
            preparar una propuesta formal y honesta. No es un checklist, es un instrumento de lectura
            estratégica. Tu progreso se guarda automáticamente.
          </p>
          <AnimatePresence>
            {restored && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 inline-flex items-center gap-2 text-xs text-accent border border-accent/30 bg-accent/5 px-3 py-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Retomamos tu progreso desde donde lo dejaste.
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <div className="grid lg:grid-cols-[260px_1fr] gap-10 lg:gap-16">
          {/* Stepper sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <p className="tt-label text-muted-foreground mb-6">
                Paso {stepNum(step)} / {stepNum(totalSteps - 1)}
              </p>
              <ol className="space-y-1">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const active = i === step;
                  const completed = i < step;
                  return (
                    <li key={s.title}>
                      <button
                        type="button"
                        onClick={() => completed && setStep(i)}
                        disabled={!completed && !active}
                        className={`w-full flex items-center gap-3 py-2.5 pl-3 pr-2 border-l-2 transition-all duration-200 text-left ${
                          active
                            ? "border-accent text-foreground bg-accent/5"
                            : completed
                              ? "border-accent/40 text-muted-foreground hover:text-foreground hover:bg-card/40 cursor-pointer"
                              : "border-border text-muted-foreground/50 cursor-default"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-['Space_Grotesk'] font-medium tabular-nums opacity-60">
                          {stepNum(i)}
                        </span>
                        <span className="text-xs font-['Space_Grotesk'] font-medium leading-tight">
                          {s.title}
                        </span>
                        {completed && <Check className="ml-auto w-3 h-3 text-accent" strokeWidth={2} />}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>

          {/* Form column */}
          <div className="min-w-0">
            {/* Mobile stepper */}
            <div className="lg:hidden mb-8 flex items-center justify-between">
              <span className="tt-label text-accent">
                {stepNum(step)} / {stepNum(totalSteps - 1)} · {STEPS[step].title}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">{progress}%</span>
            </div>

            {/* Honeypot */}
            <input
              type="text" name="website" value={form.website_hp}
              onChange={(e) => update("website_hp", e.target.value)}
              tabIndex={-1} autoComplete="off" aria-hidden="true"
              className="absolute opacity-0 pointer-events-none h-0 w-0"
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: easing }}
              >
                {step === 0 && (
                  <SectionCard
                    number="01 — Contacto"
                    title="¿Quién está al otro lado?"
                    description="Necesitamos identificar quién impulsa el proyecto y dónde opera."
                  >
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <FieldLabel required>Nombre</FieldLabel>
                        <TextField value={form.nombre} onChange={(v) => update("nombre", v)} error={errors.nombre} placeholder="Tu nombre" />
                      </div>
                      <div>
                        <FieldLabel required>Apellido</FieldLabel>
                        <TextField value={form.apellido} onChange={(v) => update("apellido", v)} error={errors.apellido} placeholder="Tu apellido" />
                      </div>
                    </div>
                    <div>
                      <FieldLabel required>Email</FieldLabel>
                      <TextField value={form.email} onChange={(v) => update("email", v)} error={errors.email} type="email" placeholder="tu@email.com" />
                    </div>
                    <div>
                      <FieldLabel>Teléfono o WhatsApp</FieldLabel>
                      <div className="grid grid-cols-[140px_1fr] gap-3">
                        <SelectField
                          value={form.telefono_codigo_pais}
                          onChange={(v) => update("telefono_codigo_pais", v)}
                          options={CODIGOS_PAIS.map((c, i) => ({ value: c.code, label: `${c.country} ${c.code}` })).filter((o, i, a) => a.findIndex(x => x.label === o.label) === i)}
                        />
                        <TextField value={form.telefono} onChange={(v) => update("telefono", v)} placeholder="11 1234 5678" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <FieldLabel>Empresa u organización</FieldLabel>
                        <TextField value={form.empresa} onChange={(v) => update("empresa", v)} placeholder="Nombre de la empresa" />
                      </div>
                      <div>
                        <FieldLabel>Rol o cargo</FieldLabel>
                        <TextField value={form.rol} onChange={(v) => update("rol", v)} placeholder="Tu rol" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <FieldLabel required>País</FieldLabel>
                        <SelectField
                          value={form.pais} onChange={(v) => update("pais", v)} error={errors.pais}
                          options={PAISES.map((p) => ({ value: p, label: p }))}
                        />
                      </div>
                      <div>
                        <FieldLabel required>Localidad o ciudad</FieldLabel>
                        <TextField value={form.ciudad} onChange={(v) => update("ciudad", v)} error={errors.ciudad} placeholder="Tu ciudad" />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Sitio web o redes actuales</FieldLabel>
                      <TextField value={form.sitio_web} onChange={(v) => update("sitio_web", v)} placeholder="https://..." />
                    </div>
                  </SectionCard>
                )}

                {step === 1 && (
                  <SectionCard
                    number="02 — Contexto"
                    title="¿De qué se trata tu negocio?"
                    description="Cuanto más claro lo pintes, más precisa será nuestra propuesta."
                  >
                    <div>
                      <FieldLabel required>Industria o rubro</FieldLabel>
                      <SelectField
                        value={form.industria} onChange={(v) => update("industria", v)} error={errors.industria}
                        options={INDUSTRIAS.map((i) => ({ value: i, label: i }))}
                      />
                    </div>
                    {form.industria === "Otro" && (
                      <div>
                        <FieldLabel>Especifica la industria</FieldLabel>
                        <TextField value={form.industria_otro} onChange={(v) => update("industria_otro", v)} />
                      </div>
                    )}
                    <div>
                      <FieldLabel required>Descripción del negocio y problema a resolver</FieldLabel>
                      <TextAreaField
                        value={form.descripcion_negocio}
                        onChange={(v) => update("descripcion_negocio", v)}
                        rows={6} maxLength={3000} error={errors.descripcion_negocio}
                        placeholder="Cuéntanos brevemente a qué se dedica tu negocio y qué necesitas resolver con este proyecto."
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                        <span>Mínimo 100 caracteres</span>
                        <span className={form.descripcion_negocio.length >= 100 ? "text-accent" : ""}>
                          {form.descripcion_negocio.length} / 3000
                        </span>
                      </div>
                    </div>
                    <div>
                      <FieldLabel required>Público objetivo</FieldLabel>
                      <TextAreaField
                        value={form.publico_objetivo}
                        onChange={(v) => update("publico_objetivo", v)}
                        rows={3} error={errors.publico_objetivo}
                        placeholder="¿A quién le hablas? Edad, contexto, necesidades clave."
                      />
                    </div>
                    <div>
                      <FieldLabel>Competencia directa que quieras mencionar</FieldLabel>
                      <TextAreaField
                        value={form.competencia}
                        onChange={(v) => update("competencia", v)}
                        rows={3}
                        placeholder="Nombres, links o referencias de quienes hacen algo similar."
                      />
                    </div>
                  </SectionCard>
                )}

                {step === 2 && (
                  <SectionCard
                    number="03 — Tipo de Proyecto"
                    title="¿Qué vamos a construir?"
                    description="Definir la naturaleza del producto orienta toda la arquitectura."
                  >
                    <div>
                      <FieldLabel required>Tipo de proyecto</FieldLabel>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {TIPOS_PROYECTO.map((t) => (
                          <OptionCard
                            key={t}
                            selected={form.tipo_proyecto === t}
                            onClick={() => update("tipo_proyecto", t)}
                            title={t}
                            compact
                          />
                        ))}
                      </div>
                      {form.tipo_proyecto === "Otro" && (
                        <div className="mt-3">
                          <TextField
                            value={form.tipo_proyecto_otro}
                            onChange={(v) => update("tipo_proyecto_otro", v)}
                            placeholder="Especifica el tipo de proyecto"
                          />
                        </div>
                      )}
                      {errors.tipo_proyecto && <p className="text-xs text-destructive mt-2">{errors.tipo_proyecto}</p>}
                    </div>

                    <div>
                      <FieldLabel required>Modelo de gestión</FieldLabel>
                      <div className="grid gap-3">
                        {MODELOS_GESTION.map((m) => (
                          <OptionCard
                            key={m.value}
                            selected={form.modelo_gestion === m.value}
                            onClick={() => update("modelo_gestion", m.value)}
                            title={m.label}
                            desc={m.desc}
                          />
                        ))}
                      </div>
                      {errors.modelo_gestion && <p className="text-xs text-destructive mt-2">{errors.modelo_gestion}</p>}
                    </div>

                    <div>
                      <FieldLabel required>Etapa actual del proyecto</FieldLabel>
                      <div className="grid gap-3">
                        {ETAPAS.map((e) => (
                          <OptionCard
                            key={e}
                            selected={form.etapa_proyecto === e}
                            onClick={() => update("etapa_proyecto", e)}
                            title={e}
                            compact
                          />
                        ))}
                      </div>
                      {errors.etapa_proyecto && <p className="text-xs text-destructive mt-2">{errors.etapa_proyecto}</p>}
                    </div>
                  </SectionCard>
                )}

                {step === 3 && (
                  <SectionCard
                    number="04 — Funcionalidades"
                    title="¿Qué necesita hacer el producto?"
                    description="Marca todo lo que considerás necesario. Si dudas, mejor incluirlo y lo conversamos."
                  >
                    <div className="grid sm:grid-cols-2 gap-3">
                      {FUNCIONALIDADES.map((f) => (
                        <CheckCard
                          key={f}
                          checked={form.funcionalidades.includes(f)}
                          onClick={() => toggleArray("funcionalidades", f)}
                          label={f}
                        />
                      ))}
                    </div>
                    {form.funcionalidades.includes("Integración de pagos") && (
                      <div>
                        <FieldLabel>¿Qué pasarela de pagos?</FieldLabel>
                        <TextField
                          value={form.pasarela_pagos}
                          onChange={(v) => update("pasarela_pagos", v)}
                          placeholder="Mercado Pago, Stripe, PayPal, etc."
                        />
                      </div>
                    )}
                    {form.funcionalidades.includes("Integración con CRM o herramientas externas") && (
                      <div>
                        <FieldLabel>¿Qué herramientas o CRM?</FieldLabel>
                        <TextField
                          value={form.crm_detalle}
                          onChange={(v) => update("crm_detalle", v)}
                          placeholder="HubSpot, Salesforce, Notion, Zapier..."
                        />
                      </div>
                    )}
                    <div>
                      <FieldLabel>Otras funcionalidades específicas</FieldLabel>
                      <TextAreaField
                        value={form.funcionalidades_otras}
                        onChange={(v) => update("funcionalidades_otras", v)}
                        rows={3}
                        placeholder="Cualquier capacidad puntual que no esté listada arriba."
                      />
                    </div>
                  </SectionCard>
                )}

                {step === 4 && (
                  <SectionCard
                    number="05 — Diseño"
                    title="¿Cuál es el estado de tu identidad?"
                    description="Saber dónde estás parado define cuánto trabajo de marca implica el proyecto."
                  >
                    <div>
                      <FieldLabel required>¿Cuentas con logo e identidad?</FieldLabel>
                      <div className="grid gap-3">
                        {ESTADOS_MARCA.map((e) => (
                          <OptionCard
                            key={e}
                            selected={form.estado_marca === e}
                            onClick={() => update("estado_marca", e)}
                            title={e}
                          />
                        ))}
                      </div>
                      {errors.estado_marca && <p className="text-xs text-destructive mt-2">{errors.estado_marca}</p>}
                    </div>
                    <div>
                      <FieldLabel>Links a archivos (logo, manual de marca, referencias)</FieldLabel>
                      <TextAreaField
                        value={form.archivos_links}
                        onChange={(v) => update("archivos_links", v)}
                        rows={3}
                        placeholder="Pega enlaces de Google Drive, Dropbox, WeTransfer, etc."
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Trabajamos con enlaces externos. Si prefieres enviarnos archivos, lo coordinamos por email.
                      </p>
                    </div>
                    <div>
                      <FieldLabel>Referencias estéticas o estilo deseado</FieldLabel>
                      <TextAreaField
                        value={form.referencias_esteticas}
                        onChange={(v) => update("referencias_esteticas", v)}
                        rows={3}
                        placeholder="Adjetivos, sensaciones, paletas o moodboards que tengas en mente."
                      />
                    </div>
                  </SectionCard>
                )}

                {step === 5 && (
                  <SectionCard
                    number="06 — Referencias"
                    title="¿Qué te inspira y qué evitar?"
                    description="Las referencias no son para copiar, son para alinear el lenguaje."
                  >
                    <div>
                      <FieldLabel>Sitios o aplicaciones de referencia</FieldLabel>
                      <TextAreaField
                        value={form.sitios_referencia}
                        onChange={(v) => update("sitios_referencia", v)}
                        rows={4}
                        placeholder={"https://ejemplo.com — me gusta el sistema de filtros\nhttps://otro.com — la estética general"}
                      />
                    </div>
                    <div>
                      <FieldLabel>¿Qué te gusta de esas referencias?</FieldLabel>
                      <TextAreaField
                        value={form.que_te_gusta}
                        onChange={(v) => update("que_te_gusta", v)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <FieldLabel>¿Hay algo que NO quieres en el proyecto?</FieldLabel>
                      <TextAreaField
                        value={form.que_evitar}
                        onChange={(v) => update("que_evitar", v)}
                        rows={3}
                        placeholder="Patrones, colores, prácticas o tonos que descartas."
                      />
                    </div>
                  </SectionCard>
                )}

                {step === 6 && (
                  <SectionCard
                    number="07 — Idiomas"
                    title="¿En qué idiomas operará?"
                  >
                    <div>
                      <FieldLabel required>¿El proyecto será multiidioma?</FieldLabel>
                      <div className="grid grid-cols-2 gap-3 max-w-sm">
                        <OptionCard
                          selected={form.multiidioma === "no"}
                          onClick={() => update("multiidioma", "no")}
                          title="No" compact
                        />
                        <OptionCard
                          selected={form.multiidioma === "si"}
                          onClick={() => update("multiidioma", "si")}
                          title="Sí" compact
                        />
                      </div>
                      {errors.multiidioma && <p className="text-xs text-destructive mt-2">{errors.multiidioma}</p>}
                    </div>
                    {form.multiidioma === "si" && (
                      <>
                        <div>
                          <FieldLabel>Idiomas</FieldLabel>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {IDIOMAS.map((i) => (
                              <CheckCard
                                key={i}
                                checked={form.idiomas.includes(i)}
                                onClick={() => toggleArray("idiomas", i)}
                                label={i}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <FieldLabel>Otros idiomas</FieldLabel>
                          <TextField
                            value={form.idiomas_otros}
                            onChange={(v) => update("idiomas_otros", v)}
                            placeholder="Ej: Catalán, Japonés"
                          />
                        </div>
                        {(form.idiomas.length > 0 || form.idiomas_otros) && (
                          <div>
                            <FieldLabel>Idioma principal</FieldLabel>
                            <SelectField
                              value={form.idioma_principal}
                              onChange={(v) => update("idioma_principal", v)}
                              options={[
                                ...form.idiomas.map((i) => ({ value: i, label: i })),
                                ...(form.idiomas_otros ? [{ value: form.idiomas_otros, label: form.idiomas_otros }] : []),
                              ]}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </SectionCard>
                )}

                {step === 7 && (
                  <SectionCard
                    number="08 — Tiempos y presupuesto"
                    title="¿En qué marco económico y temporal nos movemos?"
                    description="Este punto define el tipo de propuesta que podemos preparar. Sin presupuesto no hay alcance."
                  >
                    <div>
                      <FieldLabel required>Plazo deseado</FieldLabel>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {PLAZOS.map((p) => (
                          <OptionCard
                            key={p.v}
                            selected={form.plazo === p.v}
                            onClick={() => update("plazo", p.v)}
                            title={p.v}
                            desc={p.desc}
                          />
                        ))}
                      </div>
                      {errors.plazo && <p className="text-xs text-destructive mt-2">{errors.plazo}</p>}
                    </div>
                    <div>
                      <FieldLabel>¿Hay una fecha límite específica?</FieldLabel>
                      <TextField
                        value={form.fecha_limite}
                        onChange={(v) => update("fecha_limite", v)}
                        placeholder="Lanzamiento, evento, temporada..."
                      />
                    </div>
                    <div>
                      <FieldLabel required>Rango de presupuesto estimado (USD)</FieldLabel>
                      <SelectField
                        value={form.presupuesto}
                        onChange={(v) => update("presupuesto", v)}
                        error={errors.presupuesto}
                        options={PRESUPUESTOS.map((p) => ({ value: p, label: p }))}
                      />
                    </div>
                    <div>
                      <FieldLabel>Modelo de trabajo imaginado</FieldLabel>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {MODELOS_TRABAJO.map((m) => (
                          <OptionCard
                            key={m}
                            selected={form.modelo_trabajo === m}
                            onClick={() => update("modelo_trabajo", m)}
                            title={m}
                            compact
                          />
                        ))}
                      </div>
                    </div>
                  </SectionCard>
                )}

                {step === 8 && (
                  <SectionCard
                    number="09 — Cierre"
                    title="Lo último. Revisa y envíanos."
                    description="Cualquier detalle final antes de leer tu relevamiento con atención."
                  >
                    <div>
                      <FieldLabel>¿Hay algo más que quieras contarnos?</FieldLabel>
                      <TextAreaField
                        value={form.comentarios}
                        onChange={(v) => update("comentarios", v)}
                        rows={4}
                      />
                    </div>
                    <div>
                      <FieldLabel>¿Cómo nos conociste?</FieldLabel>
                      <SelectField
                        value={form.como_nos_conocio}
                        onChange={(v) => update("como_nos_conocio", v)}
                        options={COMO_NOS_CONOCIO.map((c) => ({ value: c, label: c }))}
                      />
                    </div>

                    {/* Resumen */}
                    <div className="border border-accent/30 bg-accent/5 p-5 mt-2">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-4 h-4 text-accent" strokeWidth={1.5} />
                        <p className="tt-label text-accent">Resumen del relevamiento</p>
                      </div>
                      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                          <dt className="text-muted-foreground text-xs uppercase tracking-[0.15em] mb-1">Contacto</dt>
                          <dd className="text-foreground font-['Space_Grotesk']">{form.nombre} {form.apellido}</dd>
                          <dd className="text-muted-foreground text-xs">{form.email}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground text-xs uppercase tracking-[0.15em] mb-1">Ubicación</dt>
                          <dd className="text-foreground font-['Space_Grotesk']">{form.ciudad}, {form.pais}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground text-xs uppercase tracking-[0.15em] mb-1">Tipo</dt>
                          <dd className="text-foreground font-['Space_Grotesk']">
                            {form.tipo_proyecto}{form.tipo_proyecto === "Otro" && form.tipo_proyecto_otro ? ` · ${form.tipo_proyecto_otro}` : ""}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground text-xs uppercase tracking-[0.15em] mb-1">Etapa</dt>
                          <dd className="text-foreground font-['Space_Grotesk']">{form.etapa_proyecto}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground text-xs uppercase tracking-[0.15em] mb-1">Funcionalidades</dt>
                          <dd className="text-foreground font-['Space_Grotesk']">{form.funcionalidades.length} seleccionadas</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground text-xs uppercase tracking-[0.15em] mb-1">Plazo · Presupuesto</dt>
                          <dd className="text-foreground font-['Space_Grotesk']">{form.plazo} · {form.presupuesto}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="space-y-3 pt-2">
                      <button
                        type="button"
                        onClick={() => update("acepta_privacidad", !form.acepta_privacidad)}
                        className="w-full flex items-start gap-3 text-left group"
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${
                            form.acepta_privacidad ? "border-accent bg-accent" : "border-muted-foreground/40 group-hover:border-foreground"
                          }`}
                        >
                          {form.acepta_privacidad && <Check className="w-3 h-3 text-accent-foreground" strokeWidth={3} />}
                        </span>
                        <span className="text-sm text-foreground/85 font-['Space_Grotesk'] leading-snug">
                          Acepto la política de privacidad y el tratamiento de mis datos personales para los fines descritos. <span className="text-accent">*</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => update("acepta_contacto", !form.acepta_contacto)}
                        className="w-full flex items-start gap-3 text-left group"
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${
                            form.acepta_contacto ? "border-accent bg-accent" : "border-muted-foreground/40 group-hover:border-foreground"
                          }`}
                        >
                          {form.acepta_contacto && <Check className="w-3 h-3 text-accent-foreground" strokeWidth={3} />}
                        </span>
                        <span className="text-sm text-foreground/85 font-['Space_Grotesk'] leading-snug">
                          Autorizo a Twice Talent a contactarme por los canales provistos. <span className="text-accent">*</span>
                        </span>
                      </button>
                    </div>
                  </SectionCard>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <button
                type="button"
                onClick={prev}
                disabled={step === 0 || submitting}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-['Space_Grotesk'] font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Anterior
              </button>

              {step < totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="tt-btn-primary inline-flex items-center gap-2 py-3.5 px-7 text-xs"
                >
                  Continuar <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="tt-btn-primary inline-flex items-center gap-2 py-3.5 px-7 text-xs disabled:opacity-60"
                >
                  {submitting ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando</>
                  ) : (
                    <>Enviar relevamiento <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground/70 text-center mt-6 uppercase tracking-[0.18em] font-['Space_Grotesk']">
              Tu progreso se guarda automáticamente en este dispositivo
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Relevamiento;
