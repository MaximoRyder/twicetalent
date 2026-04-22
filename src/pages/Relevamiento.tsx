import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Save, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/tt-logo-white.png";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  RelevamientoForm, initialForm, PAISES, CODIGOS_PAIS, INDUSTRIAS,
  FUNCIONALIDADES, IDIOMAS, PRESUPUESTOS,
} from "@/lib/relevamientoData";

const STORAGE_KEY = "tt_relevamiento_v1";

const stepSchemas = [
  // Step 0: contacto
  z.object({
    nombre: z.string().trim().min(1, "Requerido").max(100),
    apellido: z.string().trim().min(1, "Requerido").max(100),
    email: z.string().trim().email("Email inválido").max(255),
    pais: z.string().min(1, "Seleccioná un país"),
    ciudad: z.string().trim().min(1, "Requerido").max(120),
    sitio_web: z.string().trim().max(500).optional().or(z.literal("")),
  }),
  // Step 1: contexto
  z.object({
    industria: z.string().min(1, "Seleccioná una industria"),
    descripcion_negocio: z.string().trim().min(100, "Mínimo 100 caracteres").max(3000),
    publico_objetivo: z.string().trim().min(1, "Requerido").max(1500),
  }),
  // Step 2: tipo
  z.object({
    tipo_proyecto: z.string().min(1, "Requerido"),
    modelo_gestion: z.string().min(1, "Requerido"),
    etapa_proyecto: z.string().min(1, "Requerido"),
  }),
  // Step 3: funcionalidades (sin requeridos estrictos)
  z.object({}),
  // Step 4: diseño
  z.object({
    estado_marca: z.string().min(1, "Requerido"),
  }),
  // Step 5: referencias (opcional)
  z.object({}),
  // Step 6: idiomas
  z.object({
    multiidioma: z.enum(["si", "no"], { errorMap: () => ({ message: "Requerido" }) }),
  }),
  // Step 7: tiempos
  z.object({
    plazo: z.string().min(1, "Requerido"),
    presupuesto: z.string().min(1, "Requerido"),
  }),
  // Step 8: adicional + legales (validamos en submit)
  z.object({}),
];

const STEP_TITLES = [
  "Datos de contacto",
  "Contexto del negocio",
  "Tipo de proyecto",
  "Funcionalidades",
  "Diseño e identidad",
  "Referencias",
  "Idiomas",
  "Tiempos y presupuesto",
  "Información adicional",
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
  "Proyecto en marcha que necesita rediseño o migración",
  "Ampliación de un producto existente",
];
const ESTADOS_MARCA = [
  "Sí, tengo manual de marca completo",
  "Sí, pero solo tengo el logo",
  "No, necesito que lo desarrollen",
];
const PLAZOS = ["1 mes","2 meses","3 meses","Más de 3 meses","Lo necesito para ayer ⚡"];
const MODELOS_TRABAJO = ["Proyecto cerrado","Retainer mensual","Aún no lo sé"];
const COMO_NOS_CONOCIO = ["Recomendación","Redes sociales","Búsqueda web","Evento","Otro"];

const Relevamiento = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RelevamientoForm>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [restored, setRestored] = useState(false);

  // SEO
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
      "Completá el relevamiento inicial para que el equipo de Twice Talent prepare una propuesta formal para tu proyecto digital.",
    );
  }, []);

  // Cargar borrador
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm({ ...initialForm, ...parsed.form });
        setStep(parsed.step ?? 0);
        setRestored(true);
      }
    } catch {}
  }, []);

  // Autoguardado
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step }));
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [form, step]);

  const totalSteps = STEP_TITLES.length;
  const progress = useMemo(() => Math.round(((step + 1) / totalSteps) * 100), [step, totalSteps]);

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
    const schema = stepSchemas[step];
    const result = schema.safeParse(form);
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
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, totalSteps - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    // Honeypot
    if (form.website_hp) {
      toast({ title: "Error", description: "No se pudo enviar el formulario.", variant: "destructive" });
      return;
    }
    if (!form.acepta_privacidad || !form.acepta_contacto) {
      toast({ title: "Aceptaciones requeridas", description: "Debés aceptar la política de privacidad y la autorización de contacto.", variant: "destructive" });
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
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error al enviar", description: err.message || "Intentá de nuevo en unos minutos.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const errorText = (key: string) =>
    errors[key] ? <p className="text-sm text-destructive mt-1.5">{errors[key]}</p> : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 py-6 bg-background/80 backdrop-blur-md border-b border-border/40">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Twice Talent" className="h-8 w-auto" />
          <span className="tt-label text-foreground tracking-[0.15em] hidden sm:inline">
            Twice Talent
          </span>
        </Link>
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Volver
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-10">
          <p className="tt-label text-muted-foreground tracking-[0.2em] mb-4">Relevamiento de proyecto</p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
            Contanos sobre tu proyecto
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Este formulario nos permite entender el alcance, los tiempos y el presupuesto necesarios
            para preparar una propuesta formal y honesta. Tomate el tiempo que necesites — tu progreso
            se guarda automáticamente.
          </p>
          {restored && (
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground border border-border/40 rounded-md px-3 py-2 bg-card/30">
              <Save className="w-3.5 h-3.5" />
              Retomamos tu progreso desde donde lo dejaste.
            </div>
          )}
        </header>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground">
            <span>Paso {step + 1} de {totalSteps} — {STEP_TITLES[step]}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Honeypot */}
        <input
          type="text"
          name="website"
          value={form.website_hp}
          onChange={(e) => update("website_hp", e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="absolute opacity-0 pointer-events-none h-0 w-0"
          aria-hidden="true"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* STEP 0 */}
            {step === 0 && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input id="nombre" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} />
                    {errorText("nombre")}
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input id="apellido" value={form.apellido} onChange={(e) => update("apellido", e.target.value)} />
                    {errorText("apellido")}
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                  {errorText("email")}
                </div>
                <div>
                  <Label>Teléfono o WhatsApp</Label>
                  <div className="flex gap-2">
                    <Select value={form.telefono_codigo_pais} onValueChange={(v) => update("telefono_codigo_pais", v)}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CODIGOS_PAIS.map((c, i) => (
                          <SelectItem key={`${c.code}-${c.country}-${i}`} value={c.code}>
                            {c.country} {c.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input value={form.telefono} onChange={(e) => update("telefono", e.target.value)} placeholder="11 1234 5678" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="empresa">Empresa u organización</Label>
                    <Input id="empresa" value={form.empresa} onChange={(e) => update("empresa", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="rol">Rol o cargo</Label>
                    <Input id="rol" value={form.rol} onChange={(e) => update("rol", e.target.value)} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>País *</Label>
                    <Select value={form.pais} onValueChange={(v) => update("pais", v)}>
                      <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                      <SelectContent>
                        {PAISES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errorText("pais")}
                  </div>
                  <div>
                    <Label htmlFor="ciudad">Localidad o ciudad *</Label>
                    <Input id="ciudad" value={form.ciudad} onChange={(e) => update("ciudad", e.target.value)} />
                    {errorText("ciudad")}
                  </div>
                </div>
                <div>
                  <Label htmlFor="sitio_web">Sitio web o redes actuales</Label>
                  <Input id="sitio_web" value={form.sitio_web} onChange={(e) => update("sitio_web", e.target.value)} placeholder="https://..." />
                </div>
              </>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div>
                  <Label>Industria o rubro *</Label>
                  <Select value={form.industria} onValueChange={(v) => update("industria", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                    <SelectContent>
                      {INDUSTRIAS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errorText("industria")}
                </div>
                {form.industria === "Otro" && (
                  <div>
                    <Label htmlFor="industria_otro">Especificá la industria</Label>
                    <Input id="industria_otro" value={form.industria_otro} onChange={(e) => update("industria_otro", e.target.value)} />
                  </div>
                )}
                <div>
                  <Label htmlFor="descripcion_negocio">Descripción del negocio y problema a resolver *</Label>
                  <Textarea
                    id="descripcion_negocio"
                    value={form.descripcion_negocio}
                    onChange={(e) => update("descripcion_negocio", e.target.value)}
                    rows={5}
                    placeholder="Contanos brevemente a qué se dedica tu negocio y qué necesitás resolver con este proyecto"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{form.descripcion_negocio.length} / 100 mínimo</p>
                  {errorText("descripcion_negocio")}
                </div>
                <div>
                  <Label htmlFor="publico_objetivo">Público objetivo *</Label>
                  <Textarea id="publico_objetivo" value={form.publico_objetivo} onChange={(e) => update("publico_objetivo", e.target.value)} rows={3} />
                  {errorText("publico_objetivo")}
                </div>
                <div>
                  <Label htmlFor="competencia">¿Tenés competencia directa que quieras mencionar?</Label>
                  <Textarea id="competencia" value={form.competencia} onChange={(e) => update("competencia", e.target.value)} rows={3} />
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div>
                  <Label className="mb-3 block">Tipo de proyecto *</Label>
                  <RadioGroup value={form.tipo_proyecto} onValueChange={(v) => update("tipo_proyecto", v)}>
                    {TIPOS_PROYECTO.map((t) => (
                      <div key={t} className="flex items-center space-x-2">
                        <RadioGroupItem value={t} id={`tp-${t}`} />
                        <Label htmlFor={`tp-${t}`} className="font-normal cursor-pointer">{t}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {form.tipo_proyecto === "Otro" && (
                    <Input className="mt-3" placeholder="Especificá" value={form.tipo_proyecto_otro} onChange={(e) => update("tipo_proyecto_otro", e.target.value)} />
                  )}
                  {errorText("tipo_proyecto")}
                </div>
                <div>
                  <Label className="mb-3 block">Modelo de gestión *</Label>
                  <RadioGroup value={form.modelo_gestion} onValueChange={(v) => update("modelo_gestion", v)}>
                    {MODELOS_GESTION.map((m) => (
                      <div key={m.value} className="flex items-start space-x-2">
                        <RadioGroupItem value={m.value} id={`mg-${m.value}`} className="mt-1" />
                        <Label htmlFor={`mg-${m.value}`} className="font-normal cursor-pointer">
                          <span className="block">{m.label}</span>
                          <span className="text-xs text-muted-foreground">{m.desc}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errorText("modelo_gestion")}
                </div>
                <div>
                  <Label className="mb-3 block">Etapa actual del proyecto *</Label>
                  <RadioGroup value={form.etapa_proyecto} onValueChange={(v) => update("etapa_proyecto", v)}>
                    {ETAPAS.map((e) => (
                      <div key={e} className="flex items-center space-x-2">
                        <RadioGroupItem value={e} id={`et-${e}`} />
                        <Label htmlFor={`et-${e}`} className="font-normal cursor-pointer">{e}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errorText("etapa_proyecto")}
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <p className="text-sm text-muted-foreground">Marcá todas las funcionalidades que considerás necesarias.</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {FUNCIONALIDADES.map((f) => (
                    <div key={f} className="flex items-start space-x-2">
                      <Checkbox
                        id={`fn-${f}`}
                        checked={form.funcionalidades.includes(f)}
                        onCheckedChange={() => toggleArray("funcionalidades", f)}
                        className="mt-0.5"
                      />
                      <Label htmlFor={`fn-${f}`} className="font-normal cursor-pointer text-sm leading-snug">{f}</Label>
                    </div>
                  ))}
                </div>
                {form.funcionalidades.includes("Integración de pagos") && (
                  <div>
                    <Label htmlFor="pasarela_pagos">¿Qué pasarela de pagos? (Mercado Pago, Stripe, PayPal, etc.)</Label>
                    <Input id="pasarela_pagos" value={form.pasarela_pagos} onChange={(e) => update("pasarela_pagos", e.target.value)} />
                  </div>
                )}
                {form.funcionalidades.includes("Integración con CRM o herramientas externas") && (
                  <div>
                    <Label htmlFor="crm_detalle">¿Cuáles?</Label>
                    <Input id="crm_detalle" value={form.crm_detalle} onChange={(e) => update("crm_detalle", e.target.value)} />
                  </div>
                )}
                <div>
                  <Label htmlFor="funcionalidades_otras">Otras funcionalidades</Label>
                  <Textarea id="funcionalidades_otras" value={form.funcionalidades_otras} onChange={(e) => update("funcionalidades_otras", e.target.value)} rows={3} />
                </div>
              </>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <>
                <div>
                  <Label className="mb-3 block">¿Contás con logo e identidad de marca? *</Label>
                  <RadioGroup value={form.estado_marca} onValueChange={(v) => update("estado_marca", v)}>
                    {ESTADOS_MARCA.map((e) => (
                      <div key={e} className="flex items-center space-x-2">
                        <RadioGroupItem value={e} id={`em-${e}`} />
                        <Label htmlFor={`em-${e}`} className="font-normal cursor-pointer">{e}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errorText("estado_marca")}
                </div>
                <div>
                  <Label htmlFor="archivos_links">Links a archivos (logo, manual de marca, referencias)</Label>
                  <Textarea
                    id="archivos_links"
                    value={form.archivos_links}
                    onChange={(e) => update("archivos_links", e.target.value)}
                    rows={3}
                    placeholder="Pegá enlaces de Google Drive, Dropbox, WeTransfer, etc."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Por ahora trabajamos con enlaces externos. Si preferís enviarnos archivos directamente, lo coordinamos por email.
                  </p>
                </div>
                <div>
                  <Label htmlFor="referencias_esteticas">Referencias estéticas o estilo deseado</Label>
                  <Textarea id="referencias_esteticas" value={form.referencias_esteticas} onChange={(e) => update("referencias_esteticas", e.target.value)} rows={3} />
                </div>
              </>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <>
                <div>
                  <Label htmlFor="sitios_referencia">Sitios web o aplicaciones de referencia</Label>
                  <Textarea
                    id="sitios_referencia"
                    value={form.sitios_referencia}
                    onChange={(e) => update("sitios_referencia", e.target.value)}
                    rows={4}
                    placeholder={"https://ejemplo.com — me gusta el sistema de filtros\nhttps://otro.com — la estética general"}
                  />
                </div>
                <div>
                  <Label htmlFor="que_te_gusta">¿Qué te gusta de esas referencias?</Label>
                  <Textarea id="que_te_gusta" value={form.que_te_gusta} onChange={(e) => update("que_te_gusta", e.target.value)} rows={3} />
                </div>
                <div>
                  <Label htmlFor="que_evitar">¿Hay algo que NO querés que tenga el proyecto?</Label>
                  <Textarea id="que_evitar" value={form.que_evitar} onChange={(e) => update("que_evitar", e.target.value)} rows={3} />
                </div>
              </>
            )}

            {/* STEP 6 */}
            {step === 6 && (
              <>
                <div>
                  <Label className="mb-3 block">¿El proyecto será multiidioma? *</Label>
                  <RadioGroup value={form.multiidioma} onValueChange={(v) => update("multiidioma", v as "si" | "no")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="mi-si" />
                      <Label htmlFor="mi-si" className="font-normal cursor-pointer">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="mi-no" />
                      <Label htmlFor="mi-no" className="font-normal cursor-pointer">No</Label>
                    </div>
                  </RadioGroup>
                  {errorText("multiidioma")}
                </div>
                {form.multiidioma === "si" && (
                  <>
                    <div>
                      <Label className="mb-3 block">Idiomas</Label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {IDIOMAS.map((i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <Checkbox
                              id={`id-${i}`}
                              checked={form.idiomas.includes(i)}
                              onCheckedChange={() => toggleArray("idiomas", i)}
                            />
                            <Label htmlFor={`id-${i}`} className="font-normal cursor-pointer">{i}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="idiomas_otros">Otros idiomas</Label>
                      <Input id="idiomas_otros" value={form.idiomas_otros} onChange={(e) => update("idiomas_otros", e.target.value)} />
                    </div>
                    <div>
                      <Label>Idioma principal</Label>
                      <Select value={form.idioma_principal} onValueChange={(v) => update("idioma_principal", v)}>
                        <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                        <SelectContent>
                          {[...form.idiomas, ...(form.idiomas_otros ? [form.idiomas_otros] : [])].map((i) => (
                            <SelectItem key={i} value={i}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </>
            )}

            {/* STEP 7 */}
            {step === 7 && (
              <>
                <div>
                  <Label className="mb-3 block">Plazo deseado *</Label>
                  <RadioGroup value={form.plazo} onValueChange={(v) => update("plazo", v)}>
                    {PLAZOS.map((p) => (
                      <div key={p} className="flex items-center space-x-2">
                        <RadioGroupItem value={p} id={`pl-${p}`} />
                        <Label htmlFor={`pl-${p}`} className="font-normal cursor-pointer">{p}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {errorText("plazo")}
                </div>
                <div>
                  <Label htmlFor="fecha_limite">¿Hay una fecha límite específica?</Label>
                  <Input id="fecha_limite" value={form.fecha_limite} onChange={(e) => update("fecha_limite", e.target.value)} placeholder="Lanzamiento, evento, temporada..." />
                </div>
                <div>
                  <Label>Rango de presupuesto estimado (USD) *</Label>
                  <Select value={form.presupuesto} onValueChange={(v) => update("presupuesto", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                    <SelectContent>
                      {PRESUPUESTOS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errorText("presupuesto")}
                </div>
                <div>
                  <Label className="mb-3 block">¿Cómo imaginás el modelo de trabajo?</Label>
                  <RadioGroup value={form.modelo_trabajo} onValueChange={(v) => update("modelo_trabajo", v)}>
                    {MODELOS_TRABAJO.map((m) => (
                      <div key={m} className="flex items-center space-x-2">
                        <RadioGroupItem value={m} id={`mt-${m}`} />
                        <Label htmlFor={`mt-${m}`} className="font-normal cursor-pointer">{m}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}

            {/* STEP 8 */}
            {step === 8 && (
              <>
                <div>
                  <Label htmlFor="comentarios">¿Hay algo más que quieras contarnos?</Label>
                  <Textarea id="comentarios" value={form.comentarios} onChange={(e) => update("comentarios", e.target.value)} rows={4} />
                </div>
                <div>
                  <Label>¿Cómo nos conociste?</Label>
                  <Select value={form.como_nos_conocio} onValueChange={(v) => update("como_nos_conocio", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccioná" /></SelectTrigger>
                    <SelectContent>
                      {COMO_NOS_CONOCIO.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Resumen */}
                <div className="border border-border/40 rounded-lg p-5 bg-card/30 space-y-2 text-sm">
                  <p className="tt-label text-muted-foreground tracking-[0.15em] mb-3">Resumen</p>
                  <p><strong>Contacto:</strong> {form.nombre} {form.apellido} · {form.email}</p>
                  <p><strong>Ubicación:</strong> {form.ciudad}, {form.pais}</p>
                  <p><strong>Tipo:</strong> {form.tipo_proyecto}{form.tipo_proyecto === "Otro" && form.tipo_proyecto_otro ? ` (${form.tipo_proyecto_otro})` : ""} · {form.modelo_gestion}</p>
                  <p><strong>Etapa:</strong> {form.etapa_proyecto}</p>
                  <p><strong>Funcionalidades:</strong> {form.funcionalidades.length > 0 ? `${form.funcionalidades.length} seleccionadas` : "Ninguna"}</p>
                  <p><strong>Plazo:</strong> {form.plazo} · <strong>Presupuesto:</strong> {form.presupuesto}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acepta_privacidad"
                      checked={form.acepta_privacidad}
                      onCheckedChange={(c) => update("acepta_privacidad", Boolean(c))}
                      className="mt-0.5"
                    />
                    <Label htmlFor="acepta_privacidad" className="font-normal cursor-pointer text-sm leading-snug">
                      Acepto la política de privacidad y el tratamiento de mis datos personales para los fines descritos. *
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acepta_contacto"
                      checked={form.acepta_contacto}
                      onCheckedChange={(c) => update("acepta_contacto", Boolean(c))}
                      className="mt-0.5"
                    />
                    <Label htmlFor="acepta_contacto" className="font-normal cursor-pointer text-sm leading-snug">
                      Autorizo a Twice Talent a contactarme por los canales provistos. *
                    </Label>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-border/40">
          <button
            type="button"
            onClick={prev}
            disabled={step === 0 || submitting}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Anterior
          </button>

          {step < totalSteps - 1 ? (
            <button
              type="button"
              onClick={next}
              className="tt-btn-primary inline-flex items-center gap-2 text-xs py-3 px-6"
            >
              Siguiente <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="tt-btn-primary inline-flex items-center gap-2 text-xs py-3 px-6 disabled:opacity-60"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
              ) : (
                <><Check className="w-4 h-4" /> Enviar relevamiento</>
              )}
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Tu progreso se guarda automáticamente en este dispositivo.
        </p>
      </main>
    </div>
  );
};

export default Relevamiento;
