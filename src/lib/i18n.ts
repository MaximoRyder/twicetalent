/**
 * Minimal i18n layer (es-neutral por defecto).
 * Uso: t('diagnostico.title')
 */

type Dict = Record<string, string>;

const es: Dict = {
  "diagnostico.meta.title": "Diagnóstico de Proyecto | Twice Talent",
  "diagnostico.meta.description":
    "Completa el diagnóstico inicial de tu proyecto: producto, precio, presencia digital, capital y sostenibilidad. Respuesta en 48 horas.",
  "diagnostico.eyebrow": "Diagnóstico",
  "diagnostico.title": "Diagnóstico de proyecto",
  "diagnostico.subtitle":
    "Cinco bloques cortos. Se guarda a medida que avanzas, puedes retomarlo cuando quieras.",
  "diagnostico.progress": "Progreso",
  "diagnostico.saving": "Guardando",
  "diagnostico.saved": "Guardado",
  "diagnostico.back": "Anterior",
  "diagnostico.next": "Continuar",
  "diagnostico.submit": "Enviar diagnóstico",
  "diagnostico.required": "Requerido",
  "diagnostico.optional": "Opcional",
  "diagnostico.error.generic": "No pudimos guardar. Intenta nuevamente.",
  "diagnostico.error.email": "Email inválido",

  "diagnostico.step.contacto": "Contacto",
  "diagnostico.step.producto": "Producto y precio",
  "diagnostico.step.digital": "Digital, marca y reservas",
  "diagnostico.step.capital": "Capital y habilitaciones",
  "diagnostico.step.sostenibilidad": "Sostenibilidad",

  "diagnostico.field.nombre": "Nombre",
  "diagnostico.field.apellido": "Apellido",
  "diagnostico.field.rol": "Rol en el proyecto",
  "diagnostico.field.email": "Email",
  "diagnostico.field.telefono": "Teléfono",
  "diagnostico.field.proyecto": "Nombre del proyecto",

  "diagnostico.done.title": "Diagnóstico recibido",
  "diagnostico.done.body":
    "Ya tenemos tu información. Revisamos cada caso a mano y respondemos dentro de las 48 horas hábiles.",
  "diagnostico.done.ref": "Referencia",
  "diagnostico.done.home": "Volver al inicio",

  "admin.diagnosticos.title": "Diagnósticos",
  "admin.diagnosticos.empty": "Todavía no hay diagnósticos registrados.",
  "admin.diagnosticos.search": "Buscar por nombre, email o proyecto",
};

const dictionaries: Record<string, Dict> = { es };
let locale = "es";

export const setLocale = (l: string) => {
  if (dictionaries[l]) locale = l;
};

export const t = (key: string, fallback?: string): string =>
  dictionaries[locale]?.[key] ?? fallback ?? key;
