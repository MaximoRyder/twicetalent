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
  type DiagnosticSession,
  type AnswerPayload,
} from "@/lib/diagnosticoApi";

const LS_KEY = "tt_diagnostico_v1";
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

  useEffect(() => {
    document.title = t("diagnostico.meta.title");
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("diagnostico.meta.description"));
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

  const toggleMulti = (code: string, value: string) => {
    const currentVal = (answers[code] as string[]) ?? [];
    const next =
      value === "ninguno" || value === "ninguna"
        ? currentVal.includes(value)
          ? []
          : [value]
        : currentVal.includes(value)
          ? currentVal.filter((v) => v !== value)
          : [...currentVal.filter((v) => v !== "ninguno" && v !== "ninguna"), value];
    setAnswer(code, next);
  };


  const answersForStep = (q: Question[]): AnswerPayload[] =>
    q
      .filter((question) => question.type !== "file")
      .map((question) => {
        const v = answers[question.code];
        if (v === undefined) return null;
        return {
          question_code: question.code,
          answer_value: Array.isArray(v) ? v.join(",") : v,
          answer_text: question.type === "textarea" || question.type === "text" ? String(v) : null,
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
      return STEPS[index].questions
        .filter((q) => q.required)
        .filter((q) => {
          const v = answers[q.code];
          return Array.isArray(v) ? v.length === 0 : !v;
        })
        .map((q) => q.code);
    },
    [contact, answers]
  );

  /** Persiste lo que haya del paso actual, sin bloquear la navegacion */
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

  const goToStep = async (target: number) => {
    if (target === step || busy) return;
    setBusy(true);
    try {
      await persistCurrent(step);
      setErrors({});
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
    // ultimo paso: recien aca validamos todo
    setBusy(true);
    try {
      await persistCurrent(step);
      const incomplete = STEPS.map((_, i) => ({ i, missing: missingForStep(i) })).filter(
        (x) => x.missing.length > 0
      );
      if (incomplete.length > 0) {
        const first = incomplete[0];
        const e: Record<string, string> = {};
        first.missing.forEach((c) => {
          e[c] = c === "email" ? t("diagnostico.error.email") : t("diagnostico.required");
        });
        setErrors(e);
        setStep(first.i);
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.error(
          `Faltan campos en: ${incomplete.map((x) => STEPS[x.i].title).join(", ")}`
        );
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

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepList = useMemo(
    () => STEPS.map((s, i) => ({ ...s, index: i, complete: missingForStep(i).length === 0 })),
    [missingForStep]
  );


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
                        onChange={(v) => setContact({ ...contact, nombre: v })}
                        error={errors.nombre}
                        maxLength={100}
                        placeholder="Martina"
                      />
                    </div>
                    <div>
                      <FieldLabel required>{t("diagnostico.field.apellido")}</FieldLabel>
                      <TextField
                        value={contact.apellido}
                        onChange={(v) => setContact({ ...contact, apellido: v })}
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
                        onChange={(v) => setContact({ ...contact, email: v })}
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
                      onChange={(v) => setContact({ ...contact, nombre_proyecto: v })}
                      error={errors.nombre_proyecto}
                      maxLength={150}
                      placeholder="Nombre comercial o de trabajo"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {current.questions.map((q) => (
                    <div key={q.code}>
                      <FieldLabel required={q.required}>{q.label}</FieldLabel>
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
                        <textarea
                          value={(answers[q.code] as string) ?? ""}
                          maxLength={q.maxLength}
                          placeholder={q.placeholder}
                          onChange={(e) => setAnswer(q.code, e.target.value)}
                          rows={4}
                          className="w-full bg-background border border-border focus:border-accent px-4 py-3 text-sm text-foreground font-['Space_Grotesk'] placeholder:text-muted-foreground/50 focus:outline-none transition-colors resize-y"
                        />
                      )}

                      {q.type === "file" && (
                        <div className="border border-dashed border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3">
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
                              disabled={uploading === q.code}
                              onChange={(e) => handleFile(q, e.target.files?.[0] ?? null)}
                            />
                          </label>
                          <span className="text-xs text-muted-foreground break-all min-w-0">
                            {files[q.code]?.name ?? "PDF o imagen, hasta 10 MB"}
                          </span>
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
                <AppButton
                  onClick={goNext}
                  loading={busy}
                  iconRight={step === TOTAL_STEPS - 1 ? "Check" : "ArrowRight"}
                  className="w-full sm:w-auto"
                >
                  {step === TOTAL_STEPS - 1 ? t("diagnostico.submit") : t("diagnostico.next")}
                </AppButton>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
};

export default Diagnostico;
