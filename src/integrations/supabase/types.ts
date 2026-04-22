export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      relevamientos: {
        Row: {
          acepta_contacto: boolean
          acepta_privacidad: boolean
          apellido: string
          archivos_links: string | null
          ciudad: string
          comentarios: string | null
          como_nos_conocio: string | null
          competencia: string | null
          created_at: string
          crm_detalle: string | null
          descripcion_negocio: string
          email: string
          empresa: string | null
          estado_marca: string
          etapa_proyecto: string
          fecha_limite: string | null
          funcionalidades: string[] | null
          funcionalidades_otras: string | null
          id: string
          idioma_principal: string | null
          idiomas: string[] | null
          idiomas_otros: string | null
          industria: string
          industria_otro: string | null
          modelo_gestion: string
          modelo_trabajo: string | null
          multiidioma: boolean
          nombre: string
          pais: string
          pasarela_pagos: string | null
          plazo: string
          presupuesto: string
          publico_objetivo: string
          que_evitar: string | null
          que_te_gusta: string | null
          referencias_esteticas: string | null
          rol: string | null
          sitio_web: string | null
          sitios_referencia: string | null
          telefono: string | null
          telefono_codigo_pais: string | null
          tipo_proyecto: string
          tipo_proyecto_otro: string | null
        }
        Insert: {
          acepta_contacto?: boolean
          acepta_privacidad?: boolean
          apellido: string
          archivos_links?: string | null
          ciudad: string
          comentarios?: string | null
          como_nos_conocio?: string | null
          competencia?: string | null
          created_at?: string
          crm_detalle?: string | null
          descripcion_negocio: string
          email: string
          empresa?: string | null
          estado_marca: string
          etapa_proyecto: string
          fecha_limite?: string | null
          funcionalidades?: string[] | null
          funcionalidades_otras?: string | null
          id?: string
          idioma_principal?: string | null
          idiomas?: string[] | null
          idiomas_otros?: string | null
          industria: string
          industria_otro?: string | null
          modelo_gestion: string
          modelo_trabajo?: string | null
          multiidioma?: boolean
          nombre: string
          pais: string
          pasarela_pagos?: string | null
          plazo: string
          presupuesto: string
          publico_objetivo: string
          que_evitar?: string | null
          que_te_gusta?: string | null
          referencias_esteticas?: string | null
          rol?: string | null
          sitio_web?: string | null
          sitios_referencia?: string | null
          telefono?: string | null
          telefono_codigo_pais?: string | null
          tipo_proyecto: string
          tipo_proyecto_otro?: string | null
        }
        Update: {
          acepta_contacto?: boolean
          acepta_privacidad?: boolean
          apellido?: string
          archivos_links?: string | null
          ciudad?: string
          comentarios?: string | null
          como_nos_conocio?: string | null
          competencia?: string | null
          created_at?: string
          crm_detalle?: string | null
          descripcion_negocio?: string
          email?: string
          empresa?: string | null
          estado_marca?: string
          etapa_proyecto?: string
          fecha_limite?: string | null
          funcionalidades?: string[] | null
          funcionalidades_otras?: string | null
          id?: string
          idioma_principal?: string | null
          idiomas?: string[] | null
          idiomas_otros?: string | null
          industria?: string
          industria_otro?: string | null
          modelo_gestion?: string
          modelo_trabajo?: string | null
          multiidioma?: boolean
          nombre?: string
          pais?: string
          pasarela_pagos?: string | null
          plazo?: string
          presupuesto?: string
          publico_objetivo?: string
          que_evitar?: string | null
          que_te_gusta?: string | null
          referencias_esteticas?: string | null
          rol?: string | null
          sitio_web?: string | null
          sitios_referencia?: string | null
          telefono?: string | null
          telefono_codigo_pais?: string | null
          tipo_proyecto?: string
          tipo_proyecto_otro?: string | null
        }
        Relationships: []
      }
      solicitudes: {
        Row: {
          apellido: string | null
          budget: string | null
          clarity: number | null
          created_at: string
          email: string | null
          funding: boolean | null
          id: string
          logo_brand: number | null
          nombre: string | null
          pais: string | null
          readiness_score: number | null
          telefono: string | null
          urgency: number | null
          validation: number | null
          website: number | null
        }
        Insert: {
          apellido?: string | null
          budget?: string | null
          clarity?: number | null
          created_at?: string
          email?: string | null
          funding?: boolean | null
          id?: string
          logo_brand?: number | null
          nombre?: string | null
          pais?: string | null
          readiness_score?: number | null
          telefono?: string | null
          urgency?: number | null
          validation?: number | null
          website?: number | null
        }
        Update: {
          apellido?: string | null
          budget?: string | null
          clarity?: number | null
          created_at?: string
          email?: string | null
          funding?: boolean | null
          id?: string
          logo_brand?: number | null
          nombre?: string | null
          pais?: string | null
          readiness_score?: number | null
          telefono?: string | null
          urgency?: number | null
          validation?: number | null
          website?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["superadmin", "admin", "user"],
    },
  },
} as const
