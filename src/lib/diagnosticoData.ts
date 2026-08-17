import type { IconName } from "@/components/ui/Icon";

export type Option = { value: string; label: string; desc?: string };

export type QuestionType = "radio" | "multi" | "text" | "textarea" | "file";

export interface Question {
  code: string;
  label: string;
  help?: string;
  type: QuestionType;
  required?: boolean;
  options?: Option[];
  placeholder?: string;
  maxLength?: number;
  fileTipo?: "plano_comercial" | "sostenibilidad";
  accept?: string;
}

export interface Step {
  key: string;
  title: string;
  eyebrow: string;
  icon: IconName;
  questions: Question[];
}

export const ROLES_PROYECTO: Option[] = [
  { value: "propietario", label: "Propietario" },
  { value: "socio", label: "Socio" },
  { value: "gerente", label: "Gerente" },
  { value: "asesor_externo", label: "Asesor externo" },
];

/** Pasos 1 a 4 (el paso 0 es contacto y vive en columnas propias) */
export const STEPS: Step[] = [
  {
    key: "contacto",
    title: "Contacto",
    eyebrow: "Bloque 01",
    icon: "User",
    questions: [],
  },
  {
    key: "producto",
    title: "Producto y precio",
    eyebrow: "Bloque 02",
    icon: "Package",
    questions: [
      {
        code: "producto_definido",
        label: "¿Qué tan definido está el producto o servicio?",
        type: "radio",
        required: true,
        options: [
          { value: "definido", label: "Definido", desc: "Sé exactamente qué vendo y a quién" },
          { value: "parcial", label: "Parcialmente definido", desc: "Tengo la idea, faltan detalles" },
          { value: "explorando", label: "En exploración", desc: "Todavía estoy validando el concepto" },
        ],
      },
      {
        code: "ticket_promedio",
        label: "Ticket promedio estimado por venta",
        type: "radio",
        required: true,
        options: [
          { value: "menos_20", label: "Menos de USD 20" },
          { value: "20_50", label: "USD 20 a 50" },
          { value: "50_150", label: "USD 50 a 150" },
          { value: "150_500", label: "USD 150 a 500" },
          { value: "mas_500", label: "Más de USD 500" },
          { value: "no_definido", label: "Todavía no lo definí" },
        ],
      },
      {
        code: "margen_conocido",
        label: "¿Conoces el margen de contribución por unidad vendida?",
        type: "radio",
        required: true,
        options: [
          { value: "si_calculado", label: "Sí, está calculado" },
          { value: "aproximado", label: "Tengo una estimación" },
          { value: "no", label: "No lo tengo" },
        ],
      },
      {
        code: "precio_validado",
        label: "¿El precio fue validado con clientes reales?",
        type: "radio",
        required: true,
        options: [
          { value: "si", label: "Sí, ya vendí a ese precio" },
          { value: "parcial", label: "Solo con pruebas o consultas" },
          { value: "no", label: "No, es un precio teórico" },
        ],
      },
      {
        code: "capacidad_produccion",
        label: "Capacidad de producción o atención actual",
        help: "Volumen mensual que puedes sostener hoy sin sumar recursos.",
        type: "textarea",
        maxLength: 800,
        placeholder: "Ej: 120 unidades por mes con el equipo actual",
      },
    ],
  },
  {
    key: "digital",
    title: "Digital, marca y reservas",
    eyebrow: "Bloque 03",
    icon: "Globe",
    questions: [
      {
        code: "tiene_web",
        label: "¿Tienes sitio web propio?",
        type: "radio",
        required: true,
        options: [
          { value: "si_activo", label: "Sí, activo y actualizado" },
          { value: "si_desactualizado", label: "Sí, pero desactualizado" },
          { value: "no", label: "No tengo" },
        ],
      },
      {
        code: "canales_digitales",
        label: "Canales digitales activos",
        help: "Selecciona todos los que uses hoy.",
        type: "multi",
        options: [
          { value: "instagram", label: "Instagram" },
          { value: "facebook", label: "Facebook" },
          { value: "tiktok", label: "TikTok" },
          { value: "linkedin", label: "LinkedIn" },
          { value: "whatsapp", label: "WhatsApp Business" },
          { value: "marketplace", label: "Marketplaces" },
          { value: "ninguno", label: "Ninguno" },
        ],
      },
      {
        code: "identidad_marca",
        label: "Estado de la identidad de marca",
        type: "radio",
        required: true,
        options: [
          { value: "manual", label: "Manual de marca completo" },
          { value: "logo", label: "Solo logo" },
          { value: "nada", label: "Sin identidad definida" },
        ],
      },
      {
        code: "sistema_reservas",
        label: "¿Gestionas reservas o turnos?",
        type: "radio",
        required: true,
        options: [
          { value: "sistema", label: "Sí, con un sistema" },
          { value: "manual", label: "Sí, de forma manual" },
          { value: "no_aplica", label: "No aplica a mi negocio" },
        ],
      },
      {
        code: "plano_comercial_file",
        label: "Plano o layout comercial",
        help: "PDF o imagen del local, stand o distribución. Opcional.",
        type: "file",
        fileTipo: "plano_comercial",
        accept: ".pdf,.png,.jpg,.jpeg,.webp",
      },
    ],
  },
  {
    key: "capital",
    title: "Capital y habilitaciones",
    eyebrow: "Bloque 04",
    icon: "Landmark",
    questions: [
      {
        code: "capital_disponible",
        label: "Capital disponible para ejecutar",
        type: "radio",
        required: true,
        options: [
          { value: "menos_5k", label: "Menos de USD 5.000" },
          { value: "5k_15k", label: "USD 5.000 a 15.000" },
          { value: "15k_50k", label: "USD 15.000 a 50.000" },
          { value: "mas_50k", label: "Más de USD 50.000" },
          { value: "sin_definir", label: "Sin definir" },
        ],
      },
      {
        code: "financiamiento_externo",
        label: "¿Buscas financiamiento externo?",
        type: "radio",
        required: true,
        options: [
          { value: "no", label: "No, capital propio" },
          { value: "en_gestion", label: "En gestión" },
          { value: "si_obtenido", label: "Sí, ya obtenido" },
        ],
      },
      {
        code: "habilitaciones",
        label: "Estado de habilitaciones y permisos",
        type: "radio",
        required: true,
        options: [
          { value: "completas", label: "Completas" },
          { value: "en_tramite", label: "En trámite" },
          { value: "no_iniciadas", label: "No iniciadas" },
          { value: "no_aplica", label: "No aplica" },
        ],
      },
      {
        code: "plazo_apertura",
        label: "Plazo objetivo de lanzamiento o apertura",
        type: "radio",
        required: true,
        options: [
          { value: "1_mes", label: "Dentro de 1 mes" },
          { value: "3_meses", label: "Dentro de 3 meses" },
          { value: "6_meses", label: "Dentro de 6 meses" },
          { value: "mas_6", label: "Más de 6 meses" },
        ],
      },
    ],
  },
  {
    key: "sostenibilidad",
    title: "Sostenibilidad",
    eyebrow: "Bloque 05",
    icon: "Leaf",
    questions: [
      {
        code: "practicas_sostenibles",
        label: "Prácticas sostenibles ya implementadas",
        type: "multi",
        options: [
          { value: "residuos", label: "Gestión de residuos" },
          { value: "energia", label: "Eficiencia energética" },
          { value: "proveedores", label: "Proveedores locales" },
          { value: "packaging", label: "Packaging responsable" },
          { value: "impacto_social", label: "Impacto social" },
          { value: "ninguna", label: "Ninguna todavía" },
        ],
      },
      {
        code: "medicion_impacto",
        label: "¿Mides el impacto de esas prácticas?",
        type: "radio",
        required: true,
        options: [
          { value: "si_indicadores", label: "Sí, con indicadores" },
          { value: "informal", label: "De forma informal" },
          { value: "no", label: "No lo mido" },
        ],
      },
      {
        code: "sostenibilidad_file",
        label: "Informe o certificación de sostenibilidad",
        help: "Adjunta el documento si lo tienes. Opcional.",
        type: "file",
        fileTipo: "sostenibilidad",
        accept: ".pdf,.png,.jpg,.jpeg,.webp",
      },
      {
        code: "comentarios",
        label: "Algo más que debamos saber",
        type: "textarea",
        maxLength: 1500,
        placeholder: "Contexto, restricciones, objetivos del próximo trimestre",
      },
    ],
  },
];

export const TOTAL_STEPS = STEPS.length;

export const progressForStep = (stepIndex: number) =>
  Math.round(((stepIndex + 1) / TOTAL_STEPS) * 100);

export interface ContactState {
  nombre: string;
  apellido: string;
  rol_proyecto: string;
  email: string;
  telefono: string;
  nombre_proyecto: string;
}

export const initialContact: ContactState = {
  nombre: "",
  apellido: "",
  rol_proyecto: "",
  email: "",
  telefono: "+598 ",
  nombre_proyecto: "",
};
