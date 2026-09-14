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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      diagnostic_answers: {
        Row: {
          answer_text: string | null
          answer_value: string | null
          created_at: string
          diagnostic_id: string
          id: string
          question_code: string
          step: number
          updated_at: string
        }
        Insert: {
          answer_text?: string | null
          answer_value?: string | null
          created_at?: string
          diagnostic_id: string
          id?: string
          question_code: string
          step: number
          updated_at?: string
        }
        Update: {
          answer_text?: string | null
          answer_value?: string | null
          created_at?: string
          diagnostic_id?: string
          id?: string
          question_code?: string
          step?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_answers_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_audit_log: {
        Row: {
          created_at: string
          diagnostic_id: string | null
          event: string
          id: string
          payload: Json
          session_key: string | null
        }
        Insert: {
          created_at?: string
          diagnostic_id?: string | null
          event: string
          id?: string
          payload?: Json
          session_key?: string | null
        }
        Update: {
          created_at?: string
          diagnostic_id?: string | null
          event?: string
          id?: string
          payload?: Json
          session_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_audit_log_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_files: {
        Row: {
          created_at: string
          diagnostic_id: string
          file_name: string | null
          id: string
          storage_path: string
          tipo: string
        }
        Insert: {
          created_at?: string
          diagnostic_id: string
          file_name?: string | null
          id?: string
          storage_path: string
          tipo: string
        }
        Update: {
          created_at?: string
          diagnostic_id?: string
          file_name?: string | null
          id?: string
          storage_path?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_files_diagnostic_id_fkey"
            columns: ["diagnostic_id"]
            isOneToOne: false
            referencedRelation: "diagnostics"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostics: {
        Row: {
          apellido: string
          created_at: string
          email: string
          estado: Database["public"]["Enums"]["diagnostic_status"]
          id: string
          nombre: string
          nombre_proyecto: string
          progreso: number
          resume_token: string
          rol_proyecto: string
          session_key: string
          submitted_at: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          apellido: string
          created_at?: string
          email: string
          estado?: Database["public"]["Enums"]["diagnostic_status"]
          id?: string
          nombre: string
          nombre_proyecto: string
          progreso?: number
          resume_token?: string
          rol_proyecto: string
          session_key: string
          submitted_at?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          apellido?: string
          created_at?: string
          email?: string
          estado?: Database["public"]["Enums"]["diagnostic_status"]
          id?: string
          nombre?: string
          nombre_proyecto?: string
          progreso?: number
          resume_token?: string
          rol_proyecto?: string
          session_key?: string
          submitted_at?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
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
      diagnostic_add_file: {
        Args: {
          p_file_name: string
          p_resume_token: string
          p_session_key: string
          p_storage_path: string
          p_tipo: string
        }
        Returns: Json
      }
      diagnostic_resume: { Args: { p_resume_token: string }; Returns: Json }
      diagnostic_save_step: {
        Args: {
          p_answers: Json
          p_progreso: number
          p_resume_token: string
          p_session_key: string
          p_step: number
        }
        Returns: Json
      }
      diagnostic_start: {
        Args: {
          p_apellido: string
          p_email: string
          p_nombre: string
          p_nombre_proyecto: string
          p_rol_proyecto: string
          p_session_key: string
          p_telefono: string
        }
        Returns: Json
      }
      diagnostic_submit: {
        Args: { p_resume_token: string; p_session_key: string }
        Returns: Json
      }
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
      diagnostic_status: "V" | "P" | "A"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      diagnostic_status: ["V", "P", "A"],
    },
  },
} as const
