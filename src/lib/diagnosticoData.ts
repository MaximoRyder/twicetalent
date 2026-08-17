import type { IconName } from "@/components/ui/Icon";

export type Option = { value: string; label: string; desc?: string };

export type QuestionType =
  | "radio"
  | "multi"
  | "text"
  | "textarea"
  | "number"
  | "file"
  | "files";

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
  multiple?: boolean;
  /** Render condicional: se muestra si la respuesta de `code` esta en `values` */
  showIf?: { code: string; values: string[] };
  /** Layout: ocupa media columna en desktop */
  half?: boolean;
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

const SI_PARCIAL_NO: Option[] = [
  { value: "si", label: "Sí" },
  { value: "parcial", label: "Parcial" },
  { value: "no", label: "No" },
];

/** Bloques del relevamiento de desarrollo inmobiliario */
export const STEPS: Step[] = [
  {
    key: "contacto",
    title: "Contacto",
    eyebrow: "Bloque 01",
    icon: "User",
    questions: [],
  },
  {
    key: "lotes",
    title: "Lotes y precios",
    eyebrow: "Bloque 02",
    icon: "LandPlot",
    questions: [
      {
        code: "precio_lote_tipo",
        label: "Precio actual de un lote tipo en USD",
        type: "number",
        half: true,
        placeholder: "Ej: 85000",
      },
      {
        code: "precio_por_m2",
        label: "Precio por metro cuadrado en USD",
        type: "number",
        half: true,
        placeholder: "Ej: 45",
      },
      {
        code: "precio_lote_min",
        label: "Precio del lote más económico en USD",
        type: "number",
        half: true,
        placeholder: "Ej: 60000",
      },
      {
        code: "precio_lote_max",
        label: "Precio del lote más alto en USD",
        type: "number",
        half: true,
        placeholder: "Ej: 240000",
      },
      {
        code: "precio_estado",
        label: "El precio es",
        type: "radio",
        options: [
          { value: "definitivo", label: "Definitivo" },
          { value: "estimativo", label: "Estimativo" },
          { value: "en_evaluacion", label: "En evaluación" },
        ],
      },
      {
        code: "superficie_promedio_m2",
        label: "Superficie promedio por lote en m2",
        type: "number",
        half: true,
        placeholder: "Ej: 1500",
      },
      {
        code: "lotes_total_masterplan",
        label: "Total de lotes previstos en el masterplan completo",
        type: "number",
        half: true,
        placeholder: "Ej: 420",
      },
      {
        code: "lotes_disponibles_hoy",
        label: "Lotes disponibles para vender hoy",
        type: "number",
        half: true,
        placeholder: "Ej: 80",
      },
      {
        code: "lotes_con_instrumento",
        label: "Lotes con boleto o escritura firmada",
        type: "number",
        half: true,
        placeholder: "Ej: 12",
      },
      {
        code: "lotes_reservados_sin_instrumento",
        label: "Lotes reservados sin instrumento firmado",
        type: "number",
        half: true,
        placeholder: "Ej: 5",
      },
      {
        code: "lanzamiento_primera_etapa",
        label: "Mes y año objetivo para lanzar la venta de la primera etapa",
        type: "text",
        half: true,
        maxLength: 60,
        placeholder: "Ej: marzo 2027",
      },
      {
        code: "lotes_primera_etapa",
        label: "Cantidad de lotes de esa primera etapa",
        type: "number",
        half: true,
        placeholder: "Ej: 60",
      },
      {
        code: "plano_comercial_file",
        label: "Plano comercial",
        help: "Plano de subdivisión o masterplan con lotes identificados, si existe. PDF, imagen o DWG, hasta 50 MB.",
        type: "file",
        fileTipo: "plano_comercial",
        accept: ".pdf,.png,.jpg,.jpeg,.webp,.dwg,.dxf",
      },
    ],
  },
  {
    key: "marca",
    title: "Marca, web y gestión de interesados",
    eyebrow: "Bloque 03",
    icon: "Globe",
    questions: [
      {
        code: "nombre_estado",
        label: "El nombre actual del proyecto es",
        type: "radio",
        options: [
          { value: "definitivo", label: "Definitivo" },
          { value: "provisorio", label: "Provisorio" },
          { value: "abierto", label: "Abierto a propuesta profesional" },
        ],
      },
      {
        code: "identidad_visual",
        label: "Identidad visual",
        type: "radio",
        options: [
          { value: "manual", label: "Logo y manual de marca definidos" },
          { value: "solo_logo", label: "Solo logo" },
          { value: "sin_identidad", label: "Sin identidad definida" },
        ],
      },
      {
        code: "web_estado",
        label: "Web",
        type: "radio",
        options: [
          { value: "sin_web", label: "No hay web ni dominio" },
          { value: "dominio", label: "Dominio comprado sin web" },
          { value: "publicada", label: "Hay web publicada" },
        ],
      },
      {
        code: "web_url",
        label: "URL del dominio o de la web",
        type: "text",
        maxLength: 200,
        placeholder: "https://",
        showIf: { code: "web_estado", values: ["dominio", "publicada"] },
      },
      {
        code: "redes_activas",
        label: "Redes sociales activas del proyecto",
        type: "multi",
        options: [
          { value: "instagram", label: "Instagram" },
          { value: "linkedin", label: "LinkedIn" },
          { value: "facebook", label: "Facebook" },
          { value: "youtube", label: "YouTube" },
          { value: "ninguna", label: "Ninguna" },
        ],
      },
      {
        code: "gestiona_comunicacion",
        label: "Quién gestiona hoy la comunicación del proyecto",
        type: "text",
        maxLength: 200,
        placeholder: "Nombre, rol o \"nadie\"",
      },
      {
        code: "registro_interesados",
        label: "Cómo se registran hoy los interesados en comprar",
        type: "radio",
        options: [
          { value: "whatsapp", label: "WhatsApp" },
          { value: "excel", label: "Planilla Excel" },
          { value: "correo", label: "Correo" },
          { value: "inmobiliaria", label: "Inmobiliaria externa" },
          { value: "no_se_registran", label: "No se registran" },
        ],
      },
      {
        code: "puede_tomar_sena",
        label: "Hoy se puede tomar una seña o reserva formal",
        type: "radio",
        options: [
          { value: "si", label: "Sí" },
          { value: "no", label: "No" },
          { value: "depende", label: "Depende del caso" },
        ],
      },
      {
        code: "instrumento_reserva",
        label: "Instrumento que se firma ante una reserva",
        type: "text",
        maxLength: 200,
        placeholder: "Ej: boleto de reserva, o \"ninguno\"",
      },
      {
        code: "material_comercial",
        label: "Material comercial disponible",
        type: "multi",
        options: [
          { value: "fotos", label: "Fotos profesionales" },
          { value: "video_drone", label: "Video drone" },
          { value: "renders", label: "Renders 3D" },
          { value: "carpeta_venta", label: "Carpeta de venta" },
          { value: "textos_ingles", label: "Textos en inglés" },
          { value: "nada", label: "Nada listo" },
        ],
      },
    ],
  },
  {
    key: "capital",
    title: "Capital, gestión y habilitaciones",
    eyebrow: "Bloque 04",
    icon: "Landmark",
    questions: [
      {
        code: "carpeta_inversores",
        label: "Carpeta para inversores",
        type: "radio",
        options: [
          { value: "completa", label: "Completa con proyecciones financieras" },
          { value: "visual", label: "Solo presentación visual" },
          { value: "no_existe", label: "No existe" },
        ],
      },
      {
        code: "flujo_fondos_etapa",
        label: "Incluye flujo de fondos proyectado por etapa",
        type: "radio",
        options: SI_PARCIAL_NO,
      },
      {
        code: "capex_tir_payback",
        label: "Incluye CAPEX por etapa, TIR y payback",
        type: "radio",
        options: SI_PARCIAL_NO,
      },
      {
        code: "capital_buscado_usd",
        label: "Monto de capital que se busca en USD",
        type: "number",
        half: true,
        placeholder: "Ej: 3500000",
      },
      {
        code: "capital_para_etapa",
        label: "Para qué etapa",
        type: "text",
        half: true,
        maxLength: 200,
        placeholder: "Ej: infraestructura etapa 1",
      },
      {
        code: "inversores_conversacion",
        label: "Inversores en conversación activa",
        type: "radio",
        options: [
          { value: "si", label: "Sí" },
          { value: "contactos", label: "Hubo contactos sin avanzar" },
          { value: "no", label: "No" },
        ],
      },
      {
        code: "mensura_subdivision",
        label: "Estado de la mensura de subdivisión",
        type: "radio",
        options: [
          { value: "aprobada", label: "Aprobada e inscripta" },
          { value: "en_tramite", label: "En trámite" },
          { value: "no_iniciada", label: "No iniciada" },
        ],
      },
      {
        code: "aprobaciones_vigentes",
        label: "Aprobaciones vigentes hoy",
        type: "multi",
        options: [
          { value: "urbanistico", label: "Certificado urbanístico" },
          { value: "ambiental", label: "Habilitación ambiental" },
          { value: "arqueologico", label: "Estudio de impacto arqueológico" },
          { value: "turismo", label: "Aval de turismo" },
          { value: "ninguna", label: "Ninguna vigente" },
          { value: "no_se", label: "No sé" },
        ],
      },
      {
        code: "falta_para_escriturar",
        label: "Qué falta para poder escriturar un lote",
        type: "textarea",
        maxLength: 1500,
        placeholder: "Trámites pendientes, plazos, responsables",
      },
      {
        code: "coordina_avance",
        label: "Quién coordina hoy el avance general del proyecto",
        type: "text",
        maxLength: 200,
        placeholder: "Nombre y rol, o \"nadie asignado\"",
      },
      {
        code: "cronograma",
        label: "Existe cronograma de obra y de ventas",
        type: "radio",
        options: [
          { value: "si_documentado", label: "Sí documentado" },
          { value: "parcial", label: "Parcial" },
          { value: "no", label: "No" },
        ],
      },
      {
        code: "decisor_marca_web",
        label: "Quién decide sobre marca, web y estrategia comercial",
        type: "text",
        maxLength: 200,
        placeholder: "Nombre y rol",
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
        code: "acciones_ejecutadas",
        label: "Acciones ya ejecutadas en el terreno",
        type: "multi",
        options: [
          { value: "revegetacion", label: "Revegetación con especies nativas" },
          { value: "laguna", label: "Formación de laguna" },
          { value: "pozos_agua", label: "Pozos de agua" },
          { value: "top_soil", label: "Manejo de top soil" },
          { value: "dunas", label: "Restauración de dunas" },
          { value: "accesos", label: "Apertura de accesos" },
          { value: "otras", label: "Otras" },
          { value: "ninguna", label: "Ninguna" },
        ],
      },
      {
        code: "cifras_medidas",
        label: "Hay cifras medidas de esas acciones",
        type: "radio",
        options: [
          { value: "si_numeros", label: "Sí, con números" },
          { value: "estimado", label: "Solo estimado" },
          { value: "no_medido", label: "No se midió" },
        ],
      },
      {
        code: "documentacion_existente",
        label: "Documentación existente",
        type: "multi",
        options: [
          { value: "fotos_fechadas", label: "Fotos fechadas" },
          { value: "informes_firmados", label: "Informes técnicos firmados" },
          { value: "mediciones_terceros", label: "Mediciones de terceros" },
          { value: "permisos_ambientales", label: "Permisos ambientales" },
          { value: "ninguna", label: "Ninguna" },
        ],
      },
      {
        code: "detalle_acciones",
        label: "Detalle de qué se hizo y en qué fechas",
        type: "textarea",
        maxLength: 2000,
        placeholder: "Acción, superficie o volumen, fecha, responsable",
      },
      {
        code: "interes_impacto_medido",
        label:
          "Interés en mostrar impacto medido y verificable a inversores e instituciones",
        type: "radio",
        options: [
          { value: "prioritario", label: "Sí, es prioritario" },
          { value: "mas_adelante", label: "Sí, más adelante" },
          { value: "a_evaluar", label: "A evaluar" },
        ],
      },
      {
        code: "sostenibilidad_files",
        label: "Adjuntar informes o registros",
        help: "Puedes subir varios archivos, hasta 50 MB cada uno.",
        type: "files",
        fileTipo: "sostenibilidad",
        multiple: true,
        accept: ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx",
      },
    ],
  },
];

export const TOTAL_STEPS = STEPS.length;

export const MAX_FILE_MB = 50;

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
  telefono: "",
  nombre_proyecto: "",
};
