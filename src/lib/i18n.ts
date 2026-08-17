/**
 * Minimal i18n layer (es-neutral por defecto).
 * Uso: t('diagnostico.title')
 */

type Dict = Record<string, string>;

const es: Dict = {
  "diagnostico.meta.title": "Diagnóstico de Desarrollo | Twice Talent",
  "diagnostico.meta.description":
    "Relevamiento del desarrollo inmobiliario: lotes y precios, marca y web, capital y habilitaciones, sostenibilidad.",
  "diagnostico.eyebrow": "Diagnóstico",
  "diagnostico.title": "Diagnóstico del desarrollo",
  "diagnostico.subtitle":
    "Cinco bloques. Se guarda a medida que avanzas y puedes retomarlo cuando quieras.",
  "diagnostico.progress": "Progreso",
  "diagnostico.saving": "Guardando",
  "diagnostico.saved": "Guardado",
  "diagnostico.back": "Anterior",
  "diagnostico.next": "Continuar",
  "diagnostico.submit": "Enviar diagnóstico",
  "diagnostico.later": "Continuar después",
  "diagnostico.later.title": "Link para retomar",
  "diagnostico.later.body":
    "Guarda este link. Con él puedes retomar el formulario donde lo dejaste.",
  "diagnostico.later.copy": "Copiar link",
  "diagnostico.later.copied": "Link copiado",
  "diagnostico.later.needContact":
    "Completa nombre, apellido, email y nombre del proyecto para generar el link.",
  "diagnostico.required": "Requerido",
  "diagnostico.optional": "Opcional",
  "diagnostico.file.max": "El archivo supera los 50 MB",
  "diagnostico.file.attached": "Archivo adjuntado",
  "diagnostico.error.generic": "No pudimos guardar. Intenta nuevamente.",
  "diagnostico.error.email": "Email inválido",

  "diagnostico.step.contacto": "Contacto",
  "diagnostico.step.lotes": "Lotes y precios",
  "diagnostico.step.marca": "Marca, web y gestión de interesados",
  "diagnostico.step.capital": "Capital, gestión y habilitaciones",
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
