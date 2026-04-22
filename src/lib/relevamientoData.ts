export const PAISES = [
  "Argentina","Bolivia","Brasil","Chile","Colombia","Costa Rica","Cuba","Ecuador","El Salvador",
  "España","Estados Unidos","Guatemala","Honduras","México","Nicaragua","Panamá","Paraguay",
  "Perú","Puerto Rico","República Dominicana","Uruguay","Venezuela","Otro",
];

export const CODIGOS_PAIS = [
  { code: "+54", country: "AR" },
  { code: "+591", country: "BO" },
  { code: "+55", country: "BR" },
  { code: "+56", country: "CL" },
  { code: "+57", country: "CO" },
  { code: "+506", country: "CR" },
  { code: "+593", country: "EC" },
  { code: "+503", country: "SV" },
  { code: "+34", country: "ES" },
  { code: "+1", country: "US" },
  { code: "+502", country: "GT" },
  { code: "+504", country: "HN" },
  { code: "+52", country: "MX" },
  { code: "+505", country: "NI" },
  { code: "+507", country: "PA" },
  { code: "+595", country: "PY" },
  { code: "+51", country: "PE" },
  { code: "+1", country: "PR" },
  { code: "+1", country: "DO" },
  { code: "+598", country: "UY" },
  { code: "+58", country: "VE" },
];

export const INDUSTRIAS = [
  "Tecnología / SaaS","E-commerce / Retail","Salud / Wellness","Educación","Finanzas / Fintech",
  "Inmobiliario","Gastronomía / Hotelería","Servicios profesionales","Industria / Manufactura",
  "Agro","Turismo","Medios / Entretenimiento","ONG / Sin fines de lucro","Arte / Diseño",
  "Logística","Construcción","Otro",
];

export const FUNCIONALIDADES = [
  "Integración con WhatsApp",
  "Google Maps o mapas interactivos",
  "Formulario de contacto",
  "Visualización y filtrado de información (catálogos, listados, buscadores)",
  "Galerías de imágenes o videos",
  "Integración de pagos",
  "Registro e inicio de sesión de usuarios",
  "Panel de administración",
  "Blog o sección de novedades",
  "Newsletter o captura de leads",
  "Chat en vivo",
  "Integración con redes sociales",
  "Integración con CRM o herramientas externas",
  "Reservas o turnos online",
  "Sistema de reseñas o calificaciones",
  "Notificaciones por email o push",
  "Analítica y reportes",
  "Accesibilidad (cumplimiento WCAG)",
];

export const IDIOMAS = ["Español","Inglés","Portugués","Francés","Italiano","Alemán"];

export const PRESUPUESTOS = [
  "Menos de USD 3.000",
  "USD 3.000 – 7.000",
  "USD 7.000 – 15.000",
  "USD 15.000 – 30.000",
  "USD 30.000 – 60.000",
  "Más de USD 60.000",
  "Prefiero conversarlo",
];

export interface RelevamientoForm {
  // Honeypot antispam
  website_hp: string;

  // 1
  nombre: string;
  apellido: string;
  email: string;
  telefono_codigo_pais: string;
  telefono: string;
  empresa: string;
  rol: string;
  pais: string;
  ciudad: string;
  sitio_web: string;

  // 2
  industria: string;
  industria_otro: string;
  descripcion_negocio: string;
  publico_objetivo: string;
  competencia: string;

  // 3
  tipo_proyecto: string;
  tipo_proyecto_otro: string;
  modelo_gestion: string;
  etapa_proyecto: string;

  // 4
  funcionalidades: string[];
  funcionalidades_otras: string;
  pasarela_pagos: string;
  crm_detalle: string;

  // 5
  estado_marca: string;
  archivos_links: string;
  referencias_esteticas: string;

  // 6
  sitios_referencia: string;
  que_te_gusta: string;
  que_evitar: string;

  // 7
  multiidioma: "si" | "no" | "";
  idiomas: string[];
  idioma_principal: string;
  idiomas_otros: string;

  // 8
  plazo: string;
  fecha_limite: string;
  presupuesto: string;
  modelo_trabajo: string;

  // 9
  comentarios: string;
  como_nos_conocio: string;
  acepta_privacidad: boolean;
  acepta_contacto: boolean;
}

export const initialForm: RelevamientoForm = {
  website_hp: "",
  nombre: "",
  apellido: "",
  email: "",
  telefono_codigo_pais: "+54",
  telefono: "",
  empresa: "",
  rol: "",
  pais: "",
  ciudad: "",
  sitio_web: "",
  industria: "",
  industria_otro: "",
  descripcion_negocio: "",
  publico_objetivo: "",
  competencia: "",
  tipo_proyecto: "",
  tipo_proyecto_otro: "",
  modelo_gestion: "",
  etapa_proyecto: "",
  funcionalidades: [],
  funcionalidades_otras: "",
  pasarela_pagos: "",
  crm_detalle: "",
  estado_marca: "",
  archivos_links: "",
  referencias_esteticas: "",
  sitios_referencia: "",
  que_te_gusta: "",
  que_evitar: "",
  multiidioma: "",
  idiomas: [],
  idioma_principal: "",
  idiomas_otros: "",
  plazo: "",
  fecha_limite: "",
  presupuesto: "",
  modelo_trabajo: "",
  comentarios: "",
  como_nos_conocio: "",
  acepta_privacidad: false,
  acepta_contacto: false,
};
