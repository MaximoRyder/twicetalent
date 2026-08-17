import { supabase } from "@/integrations/supabase/client";
import type { ContactState } from "@/lib/diagnosticoData";

/**
 * DAL unica para el diagnostico publico.
 * Todas las escrituras pasan por funciones del backend (validacion server-side
 * + idempotencia). El cliente nunca escribe directo en las tablas.
 */

export interface DiagnosticSession {
  id: string;
  resume_token: string;
  estado: "V" | "P" | "A";
}

export type AnswerPayload = {
  question_code: string;
  answer_value?: string | null;
  answer_text?: string | null;
};

const unwrap = <T,>(data: unknown): T => data as T;

export async function startDiagnostic(
  sessionKey: string,
  contact: ContactState
): Promise<DiagnosticSession> {
  const { data, error } = await supabase.rpc("diagnostic_start", {
    p_session_key: sessionKey,
    p_nombre: contact.nombre,
    p_apellido: contact.apellido,
    p_rol_proyecto: contact.rol_proyecto,
    p_email: contact.email,
    p_telefono: contact.telefono || null,
    p_nombre_proyecto: contact.nombre_proyecto,
  });
  if (error) throw new Error(error.message);
  return unwrap<DiagnosticSession>(data);
}

export async function saveStep(
  sessionKey: string,
  resumeToken: string,
  step: number,
  answers: AnswerPayload[],
  progreso: number
): Promise<void> {
  const { error } = await supabase.rpc("diagnostic_save_step", {
    p_session_key: sessionKey,
    p_resume_token: resumeToken,
    p_step: step,
    p_answers: answers,
    p_progreso: progreso,
  });
  if (error) throw new Error(error.message);
}

export async function addFileRecord(
  sessionKey: string,
  resumeToken: string,
  tipo: "plano_comercial" | "sostenibilidad",
  storagePath: string,
  fileName: string
): Promise<void> {
  const { error } = await supabase.rpc("diagnostic_add_file", {
    p_session_key: sessionKey,
    p_resume_token: resumeToken,
    p_tipo: tipo,
    p_storage_path: storagePath,
    p_file_name: fileName,
  });
  if (error) throw new Error(error.message);
}

export async function uploadDiagnosticFile(
  diagnosticId: string,
  tipo: "plano_comercial" | "sostenibilidad",
  file: File
): Promise<string> {
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
  const path = `${diagnosticId}/${tipo}/${Date.now()}_${safeName}`;
  const { error } = await supabase.storage
    .from("diagnostic-files")
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw new Error(error.message);
  return path;
}

export async function submitDiagnostic(
  sessionKey: string,
  resumeToken: string
): Promise<{ id: string; already: boolean }> {
  const { data, error } = await supabase.rpc("diagnostic_submit", {
    p_session_key: sessionKey,
    p_resume_token: resumeToken,
  });
  if (error) throw new Error(error.message);
  return unwrap<{ id: string; already: boolean }>(data);
}

export async function resumeDiagnostic(resumeToken: string) {
  const { data, error } = await supabase.rpc("diagnostic_resume", {
    p_resume_token: resumeToken,
  });
  if (error) throw new Error(error.message);
  return data as unknown as {
    id: string;
    session_key: string;
    resume_token: string;
    estado: "V" | "P" | "A";
    progreso: number;
    contacto: ContactState;
    answers: { question_code: string; answer_value: string | null; answer_text: string | null; step: number }[];
  };
}
