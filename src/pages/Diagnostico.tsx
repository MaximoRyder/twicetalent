import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Icon from "@/components/ui/Icon";
import AppButton from "@/components/ui/AppButton";
import { t } from "@/lib/i18n";
import logo from "@/assets/tt-logo-white.png";
import {
  STEPS,
  TOTAL_STEPS,
  ROLES_PROYECTO,
  MAX_FILE_MB,
  initialContact,
  progressForStep,
  type ContactState,
  type Question,
} from "@/lib/diagnosticoData";
import {
  startDiagnostic,
  saveStep,
  submitDiagnostic,
  uploadDiagnosticFile,
  addFileRecord,
  resumeDiagnostic,
  type DiagnosticSession,
  type AnswerPayload,
} from "@/lib/diagnosticoApi";

const LS_KEY = "tt_diagnostico_v2";
const easing = [0.16, 1, 0.3, 1] as const;

type AnswerMap = Record<string, string | string[]>;
type UploadedFile = { name: string; path: string };
type FileMap = Record<string, UploadedFile[]>;

interface Persisted {
  sessionKey: string;
  session: DiagnosticSession | null;
  contact: ContactState;
  answers: AnswerMap;
  files: FileMap;
  step: number;
}

const newKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const loadPersisted = (): Persisted => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Persisted;
      if (p?.sessionKey) return { ...p, files: p.files ?? {} };
    }
  } catch {
    /* estado local corrupto: se reinicia */
  }
  return {
    sessionKey: newKey(),
    session: null,
    contact: initialContact,
    answers: {},
    files: {},
    step: 0,
  };
};

/* ───────── primitivas visuales ───────── */

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2 font-['Space_Grotesk'] font-medium">
    {children} {required && <span className="text-accent">*</span>}
  </label>
);

const TextField = ({
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  maxLength?: number;
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

const OptionCard = ({
  label,
  desc,
  selected,
  onClick,
  multi,
}: {
  label: string;
  desc?: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`w-full text-left border px-4 py-3.5 transition-all duration-200 flex items-start gap-3 ${
      selected
        ? "border-accent bg-accent/10"
        : "border-border hover:border-muted-foreground/60 bg-background"
    }`}
  >
    <span
      className={`mt-0.5 h-4 w-4 shrink-0 border flex items-center justify-center ${
        multi ? "" : "rounded-full"
      } ${selected ? "border-accent bg-accent" : "border-border"}`}
    >
      {selected && <Icon name="Check" size={11} className="text-background" strokeWidth={3} />}
    </span>
    <span className="min-w-0">
      <span className="block text-sm text-foreground font-['Space_Grotesk'] break-words">{label}</span>
      {desc && <span className="block text-xs text-muted-foreground mt-1 break-words">{desc}</span>}
    </span>
  </button>
);

/* ───────── página ───────── */

const Diagnostico = () => {
  const bootRef = useRef<Persisted>(loadPersisted());
  const [sessionKey] = useState(bootRef.current.sessionKey);
  const [session, setSession] = useState<DiagnosticSession | null>(bootRef.current.session);
  const [contact, setContact] = useState<ContactState>(bootRef.current.contact);
  const [answers, setAnswers] = useState<AnswerMap>(bootRef.current.answers);
  const [files, setFiles] = useState<FileMap>(bootRef.current.files);
  const [step, setStep] = useState(bootRef.current.step);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [laterOpen, setLaterOpen] = useState(false);
  const [focusPending, setFocusPending] = useState(false);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);

  useEffect(() => {
    document.title = t("diagnostico.meta.title");
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("diagnostico.meta.description"));
  }, []);

  /**
   * Recuperacion de sesion: token de la URL (/diagnostico?r=<token>) o token
   * persistido en el navegador. El backend es la fuente de verdad.
   */
  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("r");
    const token = urlToken ?? bootRef.current.session?.resume_token ?? null;
    if (!token) return;
    (async () => {
      try {
        const d = await resumeDiagnostic(token);
        if (d.estado !== "P") return;
        setSession({ id: d.id, resume_token: d.resume_token, estado: d.estado });
        setContact({ ...initialContact, ...d.contacto });
        const allQuestions = STEPS.flatMap((s) => s.questions);
        const map: AnswerMap = {};
        d.answers.forEach((a) => {
          const q = allQuestions.find((x) => x.code === a.question_code);
          const raw = a.answer_text ?? a.answer_value ?? "";
          map[a.question_code] = q?.type === "multi" ? raw.split(",").filter(Boolean) : raw;
        });
        setAnswers((prev) => ({ ...prev, ...map }));
        setRecovered(true);
        setFocusPending(true);
      } catch {
        /* token invalido: se continua con el estado local */
      }
    })();
  }, []);

  useEffect(() => {
    if (done) return;
    const payload: Persisted = { sessionKey, session, contact, answers, files, step };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
  }, [sessionKey, session, contact, answers, files, step, done]);

  const current = STEPS[step];
  const progress = done ? 100 : progressForStep(step) - (step === 0 ? 5 : 0);

  const setAnswer = useCallback((code: string, value: string | string[]) => {
    setAnswers((a) => ({ ...a, [code]: value }));
    setErrors((e) => ({ ...e, [code]: "" }));
  }, []);

  const EXCLUSIVE = ["ninguno", "ninguna", "nada", "no_se_registran"];

  const toggleMulti = (code: string, value: string) => {
    const currentVal = (answers[code] as string[]) ?? [];
    const next = EXCLUSIVE.includes(value)
      ? currentVal.includes(value)
        ? []
        : [value]
      : currentVal.includes(value)
        ? currentVal.filter((v) => v !== value)
        : [...currentVal.filter((v) => !EXCLUSIVE.includes(v)), value];
    setAnswer(code, next);
  };


  /** Una pregunta condicional solo cuenta si su condicion se cumple */
  const isVisible = useCallback(
    (question: Question) => {
      if (!question.showIf) return true;
      const v = answers[question.showIf.code];
      const val = Array.isArray(v) ? v : [v ?? ""];
      return val.some((x) => question.showIf!.values.includes(String(x)));
    },
    [answers]
  );

  const answersForStep = (q: Question[]): AnswerPayload[] =>
    q
      .filter((question) => question.type !== "file" && question.type !== "files")
      .filter(isVisible)
      .map((question) => {
        const v = answers[question.code];
        if (v === undefined || v === "") return null;
        return {
          question_code: question.code,
          answer_value: Array.isArray(v) ? v.join(",") : v,
          answer_text:
            question.type === "textarea" || question.type === "text" ? String(v) : null,
        };
      })
      .filter(Boolean) as AnswerPayload[];

  /** Crea la sesion en backend si el contacto minimo esta completo */
  const ensureSession = async (): Promise<DiagnosticSession | null> => {
    if (session) return session;
    if (missingForStep(0).length > 0) return null;
    const s = await startDiagnostic(sessionKey, contact);
    setSession(s);
    return s;
  };

  const handleFiles = async (question: Question, list: FileList | null) => {
    if (!list || list.length === 0) return;
    const s = await ensureSession();
    if (!s) {
      toast.error(t("diagnostico.later.needContact"));
      return;
    }
    setUploading(question.code);
    try {
      for (const file of Array.from(list)) {
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
          toast.error(t("diagnostico.file.max"));
          continue;
        }
        const path = await uploadDiagnosticFile(s.id, question.fileTipo!, file);
        await addFileRecord(sessionKey, s.resume_token, question.fileTipo!, path, file.name);
        setFiles((f) => {
          const prev = f[question.code] ?? [];
          const next = question.multiple ? [...prev, { name: file.name, path }] : [{ name: file.name, path }];
          return { ...f, [question.code]: next };
        });
      }
      toast.success(t("diagnostico.file.attached"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("diagnostico.error.generic"));
    } finally {
      setUploading(null);
    }
  };

  /** Devuelve los codigos faltantes de un paso (0 = contacto) */
  const missingForStep = useCallback(
    (index: number): string[] => {
      if (index === 0) {
        const m: string[] = [];
        if (!contact.nombre.trim()) m.push("nombre");
        if (!contact.apellido.trim()) m.push("apellido");
        if (!contact.rol_proyecto) m.push("rol_proyecto");
        if (!/^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/.test(contact.email.trim())) m.push("email");
        if (!contact.nombre_proyecto.trim()) m.push("nombre_proyecto");
        return m;
      }
      // Todo campo visible es obligatorio, salvo los adjuntos
      return STEPS[index].questions
        .filter((q) => q.type !== "file" && q.type !== "files")
        .filter(isVisible)
        .filter((q) => {
          const v = answers[q.code];
          return Array.isArray(v) ? v.length === 0 : !String(v ?? "").trim();
        })
        .map((q) => q.code);
    },
    [contact, answers, isVisible]
  );

  const allMissingByStep = useCallback(() => {
    return STEPS.map((s, i) => ({
      i,
      key: s.key,
      title: s.title,
      missing: missingForStep(i),
    })).filter((x) => x.missing.length > 0);
  }, [missingForStep]);

  const buildAllErrors = (): Record<string, string> => {
    const e: Record<string, string> = {};
    allMissingByStep().forEach((x) => {
      x.missing.forEach((c) => {
        e[c] = c === "email" ? t("diagnostico.error.email") : t("diagnostico.required");
      });
    });
    return e;
  };

  const persistCurrent = async (index: number) => {
    try {
      if (index === 0) {
        if (missingForStep(0).length === 0 && !session) {
          const s = await startDiagnostic(sessionKey, contact);
          setSession(s);
        }
        return;
      }
      if (!session) return;
      await saveStep(
        sessionKey,
        session.resume_token,
        index,
        answersForStep(STEPS[index].questions),
        progressForStep(index)
      );
    } catch {
      /* guardado best-effort: no bloquea la navegacion */
    }
  };

  /** Cambios pendientes de sincronizar con el backend */
  useEffect(() => {
    dirtyRef.current = true;
  }, [answers, contact]);

  /** Bloque 1 completo: se crea el registro (estado P) y su token de sesion */
  useEffect(() => {
    if (done || session || savingRef.current) return;
    if (missingForStep(0).length > 0) return;
    savingRef.current = true;
    startDiagnostic(sessionKey, contact)
      .then(setSession)
      .catch(() => undefined)
      .finally(() => {
        savingRef.current = false;
      });
  }, [contact, session, done, sessionKey, missingForStep]);

  /** Autoguardado cada 20 segundos si hubo cambios */
  useEffect(() => {
    if (done) return;
    const id = window.setInterval(async () => {
      if (!dirtyRef.current || savingRef.current) return;
      savingRef.current = true;
      dirtyRef.current = false;
      try {
        await persistCurrent(0);
        if (step > 0) await persistCurrent(step);
      } catch {
        dirtyRef.current = true;
      } finally {
        savingRef.current = false;
      }
    }, 20000);
    return () => window.clearInterval(id);
  });

  /** Al recuperar sesion, posicionar en el primer bloque incompleto */
  useEffect(() => {
    if (!focusPending) return;
    const first = STEPS.findIndex((_, i) => missingForStep(i).length > 0);
    setStep(first === -1 ? TOTAL_STEPS - 1 : first);
    setFocusPending(false);
  }, [focusPending, missingForStep]);


  const goToStep = async (target: number) => {
    if (target === step || busy) return;
    setBusy(true);
    try {
      await persistCurrent(step);
      setErrors((prev) => {
        // mantener errores globales si el resumen esta activo, limpiar solo el del campo seleccionado
        if (showSummary) return prev;
        return {};
      });
      setStep(target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setBusy(false);
    }
  };

  const goNext = async () => {
    if (step < TOTAL_STEPS - 1) {
      await goToStep(step + 1);
      return;
    }
    // ultimo paso: validamos todo
    setBusy(true);
    try {
      await persistCurrent(step);
      const incomplete = allMissingByStep();
      if (incomplete.length > 0) {
        const e = buildAllErrors();
        setErrors(e);
        setShowSummary(true);
        setStep(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.error(`Faltan ${incomplete.reduce((acc, x) => acc + x.missing.length, 0)} campos por completar`);
        return;
      }
      let s = session;
      if (!s) {
        s = await startDiagnostic(sessionKey, contact);
        setSession(s);
      }
      // aseguramos todas las respuestas persistidas antes del submit
      for (let i = 1; i < TOTAL_STEPS; i++) {
        await saveStep(
          sessionKey,
          s.resume_token,
          i,
          answersForStep(STEPS[i].questions),
          progressForStep(i)
        );
      }
      const res = await submitDiagnostic(sessionKey, s.resume_token);
      setRef(res.id);
      setDone(true);
      localStorage.removeItem(LS_KEY);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("diagnostico.error.generic"));
    } finally {
      setBusy(false);
    }
  };

  const resumeLink = session
    ? `${window.location.origin}/diagnostico?r=${session.resume_token}`
    : "";

  const handleLater = async () => {
    setBusy(true);
    try {
      const s = await ensureSession();
      if (!s) {
        toast.error(t("diagnostico.later.needContact"));
        return;
      }
      await persistCurrent(step);
      dirtyRef.current = false;
      setLaterOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("diagnostico.error.generic"));
    } finally {
      setBusy(false);
    }
  };

  const copyResumeLink = async () => {
    try {
      await navigator.clipboard.writeText(resumeLink);
      toast.success(t("diagnostico.later.copied"));
    } catch {
      toast.error(t("diagnostico.error.generic"));
    }
  };

  const goBack = () => {
    setErrors((prev) => {
      if (showSummary) return prev;
      return {};
    });
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const stepList = useMemo(
    () => STEPS.map((s, i) => ({ ...s, index: i, complete: missingForStep(i).length === 0 })),
    [missingForStep]
  );

  const labelForCode = (code: string, stepIndex: number): string => {
    if (stepIndex === 0) {
      const map: Record<string, string> = {
        nombre: t("diagnostico.field.nombre"),
        apellido: t("diagnostico.field.apellido"),
        rol_proyecto: t("diagnostico.field.rol"),
        email: t("diagnostico.field.email"),
        nombre_proyecto: t("diagnostico.field.proyecto"),
      };
      return map[code] || code;
    }
    const q = STEPS[stepIndex].questions.find((x) => x.code === code);
    return q?.label || code;
  };

  const incompleteSummary = useMemo(() => allMissingByStep(), [allMissingByStep]);

  const SummaryPanel = () => {
    if (!showSummary || incompleteSummary.length === 0) return null;
    return (
      <div className="bg-card border-y border-border">
        <div className="px-5 sm:px-8 lg:px-16 py-5 max-w-6xl mx-auto">
          <div className="flex items-start gap-3 mb-4">
            <Icon name="AlertCircle" size={18} className="text-destructive mt-0.5 shrink-0" />
            <div>
              <h2 className="text-sm font-['Space_Grotesk'] font-medium text-foreground">
                Faltan campos por completar
              </h2>
              <p className="text-xs text-muted-foreground">
                Hacé clic en un bloque o campo para ir directamente a completarlo.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSummary(false)}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground uppercase tracking-widest"
            >
              Cerrar
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {incompleteSummary.map((x) => (
              <div
                key={x.key}
                className="border border-border bg-background p-4"
              >
                <button
                  type="button"
                  onClick={() => goToStep(x.i)}
                  className="w-full text-left flex items-center gap-2 mb-2 group"
                >
                  <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-['Space_Grotesk']">
                    {x.i === 0 ? "Bloque 01" : STEPS[x.i].eyebrow}
                  </span>
                  <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    {x.title}
                  </span>
                  <Icon name="ArrowRight" size={12} className="text-muted-foreground ml-auto" />
                </button>
                <ul className="space-y-1.5">
                  {x.missing.map((c) => (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => goToStep(x.i)}
                        className="text-xs text-destructive hover:text-foreground text-left underline underline-offset-2 decoration-destructive/50 hover:decoration-transparent transition-colors"
                      >
                        {labelForCode(c, x.i)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };




  if (done) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-20">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easing }}
          className="w-full max-w-xl border border-border bg-card p-8 sm:p-12"
        >
          <div className="h-12 w-12 border border-accent flex items-center justify-center mb-8">
            <Icon name="Check" size={20} className="text-accent" strokeWidth={2} />
          </div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-accent mb-4 font-['Space_Grotesk']">
            {t("diagnostico.eyebrow")}
          </p>
          <h1 className="tt-headline-md mb-4">{t("diagnostico.done.title")}</h1>
          <p className="tt-body mb-8">{t("diagnostico.done.body")}</p>
          {ref && (
            <p className="text-xs text-muted-foreground mb-8 break-words font-mono">
              {t("diagnostico.done.ref")}: {ref}
            </p>
          )}
          <Link to="/">
            <AppButton variant="secondary" iconLeft="ArrowLeft" fullWidth>
              {t("diagnostico.done.home")}
            </AppButton>
          </Link>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* header mobile-first */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-16 py-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="Twice Talent" className="h-6 w-auto" />
            <span className="tt-label hidden sm:inline">Twice Talent</span>
          </Link>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-['Space_Grotesk']">
            {step + 1}/{TOTAL_STEPS}
          </span>
        </div>
        <div className="h-px w-full bg-secondary">
          <div
            className="h-px bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {recovered && (
        <div className="bg-accent/10 border-b border-accent/40">
          <div className="px-5 sm:px-8 lg:px-16 py-3 max-w-6xl mx-auto flex items-start gap-3">
            <Icon name="History" size={16} className="text-accent mt-0.5 shrink-0" />
            <p className="text-xs sm:text-sm text-foreground break-words">
              {t("diagnostico.recovered")}
            </p>
            <button
              type="button"
              onClick={() => setRecovered(false)}
              className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground shrink-0"
            >
              {t("diagnostico.later.close")}
            </button>
          </div>
        </div>
      )}

      <SummaryPanel />

      <div className="px-5 sm:px-8 lg:px-16 py-10 lg:py-16 max-w-6xl mx-auto lg:grid lg:grid-cols-12 lg:gap-12">

        {/* stepper: horizontal en mobile, lateral en desktop */}
        <aside className="lg:col-span-4 mb-10 lg:mb-0">
          <div className="lg:sticky lg:top-28">
            <p className="text-[11px] uppercase tracking-[0.24em] text-accent mb-3 font-['Space_Grotesk']">
              {t("diagnostico.eyebrow")}
            </p>
            <h1 className="tt-headline-md mb-3">{t("diagnostico.title")}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              {t("diagnostico.subtitle")}
            </p>
            <ol className="flex lg:block gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-5 px-5 lg:mx-0 lg:px-0">
              {stepList.map((s) => {
                const active = s.index === step;
                const complete = s.complete;
                return (
                  <li
                    key={s.key}
                    className="shrink-0 lg:py-1"
                    aria-current={active ? "step" : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => goToStep(s.index)}
                      disabled={busy}
                      className="flex items-center gap-3 text-left w-full group disabled:opacity-60"
                    >
                      <span
                        className={`h-7 w-7 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-['Space_Grotesk'] transition-colors ${
                          complete
                            ? active
                              ? "border-accent bg-accent text-background"
                              : "border-accent bg-accent/20 text-accent"
                            : active
                              ? "border-accent text-accent"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {complete ? (
                          <Icon name="Check" size={12} strokeWidth={3} />
                        ) : (
                          s.index + 1
                        )}
                      </span>
                      <span
                        className={`text-xs whitespace-nowrap lg:whitespace-normal font-['Space_Grotesk'] flex items-center gap-1.5 ${
                          active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {s.title}
                        {!complete && (
                          <Icon
                            name="AlertCircle"
                            size={12}
                            className="text-muted-foreground/70"
                          />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}

            </ol>
          </div>
        </aside>

        {/* contenido */}
        <section className="lg:col-span-8 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: easing }}
              className="border border-border bg-card p-5 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                <span className="h-9 w-9 border border-accent/50 flex items-center justify-center">
                  <Icon name={current.icon} size={16} className="text-accent" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-['Space_Grotesk']">
                    {current.eyebrow}
                  </p>
                  <h2 className="text-base sm:text-lg font-['Space_Grotesk'] font-medium break-words">
                    {current.title}
                  </h2>
                </div>
              </div>

              {step === 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel required>{t("diagnostico.field.nombre")}</FieldLabel>
                      <TextField
                        value={contact.nombre}
                        onChange={(v) => {
                          setContact({ ...contact, nombre: v });
                          setErrors((e) => ({ ...e, nombre: "" }));
                        }}
                        error={errors.nombre}
                        maxLength={100}
                        placeholder="Martina"
                      />
                    </div>
                    <div>
                      <FieldLabel required>{t("diagnostico.field.apellido")}</FieldLabel>
                      <TextField
                        value={contact.apellido}
                        onChange={(v) => {
                          setContact({ ...contact, apellido: v });
                          setErrors((e) => ({ ...e, apellido: "" }));
                        }}
                        error={errors.apellido}
                        maxLength={100}
                        placeholder="Fernández"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>{t("diagnostico.field.rol")}</FieldLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ROLES_PROYECTO.map((r) => (
                        <OptionCard
                          key={r.value}
                          label={r.label}
                          selected={contact.rol_proyecto === r.value}
                          onClick={() => {
                            setContact({ ...contact, rol_proyecto: r.value });
                            setErrors((e) => ({ ...e, rol_proyecto: "" }));
                          }}
                        />
                      ))}
                    </div>
                    {errors.rol_proyecto && (
                      <p className="text-xs text-destructive mt-1.5">{errors.rol_proyecto}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel required>{t("diagnostico.field.email")}</FieldLabel>
                      <TextField
                        type="email"
                        value={contact.email}
                        onChange={(v) => {
                          setContact({ ...contact, email: v });
                          setErrors((e) => ({ ...e, email: "" }));
                        }}
                        error={errors.email}
                        maxLength={255}
                        placeholder="nombre@empresa.com"
                      />
                    </div>
                    <div>
                      <FieldLabel>{t("diagnostico.field.telefono")}</FieldLabel>
                      <TextField
                        value={contact.telefono}
                        onChange={(v) => setContact({ ...contact, telefono: v })}
                        maxLength={30}
                        placeholder="+598 99 123 456"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>{t("diagnostico.field.proyecto")}</FieldLabel>
                    <TextField
                      value={contact.nombre_proyecto}
                      onChange={(v) => {
                        setContact({ ...contact, nombre_proyecto: v });
                        setErrors((e) => ({ ...e, nombre_proyecto: "" }));
                      }}
                      error={errors.nombre_proyecto}
                      maxLength={150}
                      placeholder="Nombre comercial o de trabajo"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-8">
                  {current.questions.filter(isVisible).map((q) => (
                    <div key={q.code} className={q.half ? "sm:col-span-1" : "sm:col-span-2"}>
                      <FieldLabel required={q.type !== "file" && q.type !== "files"}>
                        {q.label}
                      </FieldLabel>
                      {q.help && (
                        <p className="text-xs text-muted-foreground mb-3 -mt-1 break-words">{q.help}</p>
                      )}

                      {q.type === "radio" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options!.map((o) => (
                            <OptionCard
                              key={o.value}
                              label={o.label}
                              desc={o.desc}
                              selected={answers[q.code] === o.value}
                              onClick={() => setAnswer(q.code, o.value)}
                            />
                          ))}
                        </div>
                      )}

                      {q.type === "multi" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options!.map((o) => (
                            <OptionCard
                              key={o.value}
                              multi
                              label={o.label}
                              desc={o.desc}
                              selected={((answers[q.code] as string[]) ?? []).includes(o.value)}
                              onClick={() => toggleMulti(q.code, o.value)}
                            />
                          ))}
                        </div>
                      )}

                      {q.type === "textarea" && (
                        <>
                          <textarea
                            value={(answers[q.code] as string) ?? ""}
                            maxLength={q.maxLength}
                            placeholder={q.placeholder}
                            onChange={(e) => setAnswer(q.code, e.target.value)}
                            rows={4}
                            className={`w-full bg-background border px-4 py-3 text-sm text-foreground font-['Space_Grotesk'] placeholder:text-muted-foreground/50 focus:outline-none transition-colors resize-y ${
                              errors[q.code] ? "border-destructive" : "border-border focus:border-accent"
                            }`}
                          />
                          {errors[q.code] && (
                            <p className="text-xs text-destructive mt-1.5">{errors[q.code]}</p>
                          )}
                        </>
                      )}

                      {(q.type === "text" || q.type === "number") && (
                        <TextField
                          type={q.type === "number" ? "number" : "text"}
                          value={(answers[q.code] as string) ?? ""}
                          maxLength={q.maxLength}
                          placeholder={q.placeholder}
                          error={errors[q.code]}
                          onChange={(v) => setAnswer(q.code, v)}
                        />
                      )}

                      {(q.type === "file" || q.type === "files") && (
                        <div className="border border-dashed border-border p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <label className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-['Space_Grotesk'] text-foreground cursor-pointer border border-border px-4 py-3 hover:border-accent transition-colors">
                              <Icon
                                name={uploading === q.code ? "Loader2" : "Upload"}
                                size={14}
                                className={uploading === q.code ? "animate-spin" : ""}
                              />
                              Adjuntar
                              <input
                                type="file"
                                className="hidden"
                                accept={q.accept}
                                multiple={q.multiple}
                                disabled={uploading === q.code}
                                onChange={(e) => handleFiles(q, e.target.files)}
                              />
                            </label>
                            <span className="text-xs text-muted-foreground min-w-0">
                              Hasta {MAX_FILE_MB} MB por archivo
                            </span>
                          </div>
                          {(files[q.code] ?? []).length > 0 && (
                            <ul className="space-y-1.5">
                              {(files[q.code] ?? []).map((f) => (
                                <li
                                  key={f.path}
                                  className="flex items-start gap-2 text-xs text-foreground break-all"
                                >
                                  <Icon name="Paperclip" size={12} className="mt-0.5 text-accent" />
                                  <span className="min-w-0">{f.name}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {errors[q.code] && (
                        <p className="text-xs text-destructive mt-1.5">{errors[q.code]}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-10 pt-6 border-t border-border flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                {step > 0 ? (
                  <AppButton variant="ghost" iconLeft="ArrowLeft" onClick={goBack} disabled={busy}>
                    {t("diagnostico.back")}
                  </AppButton>
                ) : (
                  <span className="hidden sm:block" />
                )}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <AppButton
                    onClick={goNext}
                    loading={busy}
                    iconRight={step === TOTAL_STEPS - 1 ? "Check" : "ArrowRight"}
                    className="w-full sm:w-auto"
                  >
                    {step === TOTAL_STEPS - 1 ? t("diagnostico.submit") : t("diagnostico.next")}
                  </AppButton>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
};

export default Diagnostico;
