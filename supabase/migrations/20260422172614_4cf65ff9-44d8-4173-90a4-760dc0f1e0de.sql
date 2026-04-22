
CREATE TABLE public.relevamientos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Sección 1: Contacto
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  telefono_codigo_pais TEXT,
  empresa TEXT,
  rol TEXT,
  pais TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  sitio_web TEXT,

  -- Sección 2: Contexto del negocio
  industria TEXT NOT NULL,
  industria_otro TEXT,
  descripcion_negocio TEXT NOT NULL,
  publico_objetivo TEXT NOT NULL,
  competencia TEXT,

  -- Sección 3: Tipo de proyecto
  tipo_proyecto TEXT NOT NULL,
  tipo_proyecto_otro TEXT,
  modelo_gestion TEXT NOT NULL,
  etapa_proyecto TEXT NOT NULL,

  -- Sección 4: Funcionalidades (array)
  funcionalidades TEXT[] DEFAULT ARRAY[]::TEXT[],
  funcionalidades_otras TEXT,
  pasarela_pagos TEXT,
  crm_detalle TEXT,

  -- Sección 5: Diseño
  estado_marca TEXT NOT NULL,
  archivos_links TEXT,
  referencias_esteticas TEXT,

  -- Sección 6: Referencias
  sitios_referencia TEXT,
  que_te_gusta TEXT,
  que_evitar TEXT,

  -- Sección 7: Idiomas
  multiidioma BOOLEAN NOT NULL DEFAULT false,
  idiomas TEXT[] DEFAULT ARRAY[]::TEXT[],
  idioma_principal TEXT,
  idiomas_otros TEXT,

  -- Sección 8: Tiempos y presupuesto
  plazo TEXT NOT NULL,
  fecha_limite TEXT,
  presupuesto TEXT NOT NULL,
  modelo_trabajo TEXT,

  -- Sección 9: Adicional
  comentarios TEXT,
  como_nos_conocio TEXT,
  acepta_privacidad BOOLEAN NOT NULL DEFAULT false,
  acepta_contacto BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.relevamientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert relevamientos"
ON public.relevamientos
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Only authenticated can read relevamientos"
ON public.relevamientos
FOR SELECT
TO authenticated
USING (true);

CREATE INDEX idx_relevamientos_created_at ON public.relevamientos(created_at DESC);
CREATE INDEX idx_relevamientos_email ON public.relevamientos(email);
