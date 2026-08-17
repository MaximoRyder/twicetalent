CREATE TYPE public.diagnostic_status AS ENUM ('V', 'P', 'A');

CREATE TABLE public.diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key uuid NOT NULL UNIQUE,
  resume_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  nombre text NOT NULL,
  apellido text NOT NULL,
  rol_proyecto text NOT NULL,
  email text NOT NULL,
  telefono text,
  nombre_proyecto text NOT NULL,
  estado public.diagnostic_status NOT NULL DEFAULT 'P',
  progreso smallint NOT NULL DEFAULT 0,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.diagnostic_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id uuid NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  step smallint NOT NULL,
  question_code text NOT NULL,
  answer_value text,
  answer_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (diagnostic_id, question_code)
);
CREATE INDEX idx_diagnostic_answers_diag ON public.diagnostic_answers(diagnostic_id);

CREATE TABLE public.diagnostic_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id uuid NOT NULL REFERENCES public.diagnostics(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  file_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_diagnostic_files_diag ON public.diagnostic_files(diagnostic_id);

CREATE TABLE public.diagnostic_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id uuid REFERENCES public.diagnostics(id) ON DELETE SET NULL,
  session_key uuid,
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_diagnostic_audit_diag ON public.diagnostic_audit_log(diagnostic_id);

GRANT SELECT ON public.diagnostics TO authenticated;
GRANT ALL ON public.diagnostics TO service_role;
GRANT SELECT ON public.diagnostic_answers TO authenticated;
GRANT ALL ON public.diagnostic_answers TO service_role;
GRANT SELECT ON public.diagnostic_files TO authenticated;
GRANT ALL ON public.diagnostic_files TO service_role;
GRANT SELECT ON public.diagnostic_audit_log TO authenticated;
GRANT SELECT, INSERT ON public.diagnostic_audit_log TO service_role;

ALTER TABLE public.diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read diagnostics" ON public.diagnostics
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read diagnostic answers" ON public.diagnostic_answers
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read diagnostic files" ON public.diagnostic_files
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can read diagnostic audit log" ON public.diagnostic_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_diagnostics_updated_at BEFORE UPDATE ON public.diagnostics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_diagnostic_answers_updated_at BEFORE UPDATE ON public.diagnostic_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.diagnostic_start(
  p_session_key uuid,
  p_nombre text,
  p_apellido text,
  p_rol_proyecto text,
  p_email text,
  p_telefono text,
  p_nombre_proyecto text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; v_token uuid; v_estado public.diagnostic_status;
BEGIN
  IF p_session_key IS NULL THEN RAISE EXCEPTION 'session_key requerido'; END IF;
  IF btrim(coalesce(p_nombre,'')) = '' OR btrim(coalesce(p_apellido,'')) = '' THEN
    RAISE EXCEPTION 'Nombre y apellido son obligatorios'; END IF;
  IF coalesce(p_email,'') !~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$' THEN
    RAISE EXCEPTION 'Email invalido'; END IF;
  IF p_rol_proyecto NOT IN ('propietario','socio','gerente','asesor_externo') THEN
    RAISE EXCEPTION 'Rol invalido'; END IF;
  IF btrim(coalesce(p_nombre_proyecto,'')) = '' THEN
    RAISE EXCEPTION 'Nombre del proyecto obligatorio'; END IF;

  SELECT id, resume_token, estado INTO v_id, v_token, v_estado
  FROM public.diagnostics WHERE session_key = p_session_key;

  IF v_id IS NULL THEN
    INSERT INTO public.diagnostics (session_key, nombre, apellido, rol_proyecto, email, telefono, nombre_proyecto, progreso)
    VALUES (p_session_key, btrim(p_nombre), btrim(p_apellido), p_rol_proyecto, lower(btrim(p_email)), p_telefono, btrim(p_nombre_proyecto), 20)
    RETURNING id, resume_token, estado INTO v_id, v_token, v_estado;
    INSERT INTO public.diagnostic_audit_log (diagnostic_id, session_key, event, payload)
    VALUES (v_id, p_session_key, 'created', jsonb_build_object('email', lower(btrim(p_email))));
  ELSIF v_estado = 'P' THEN
    UPDATE public.diagnostics SET nombre = btrim(p_nombre), apellido = btrim(p_apellido),
      rol_proyecto = p_rol_proyecto, email = lower(btrim(p_email)), telefono = p_telefono,
      nombre_proyecto = btrim(p_nombre_proyecto), progreso = GREATEST(progreso, 20)
    WHERE id = v_id;
    INSERT INTO public.diagnostic_audit_log (diagnostic_id, session_key, event, payload)
    VALUES (v_id, p_session_key, 'contact_updated', '{}'::jsonb);
  END IF;

  RETURN jsonb_build_object('id', v_id, 'resume_token', v_token, 'estado', v_estado);
END; $$;

CREATE OR REPLACE FUNCTION public.diagnostic_save_step(
  p_session_key uuid,
  p_resume_token uuid,
  p_step smallint,
  p_answers jsonb,
  p_progreso smallint
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; v_estado public.diagnostic_status; v_item jsonb;
BEGIN
  SELECT id, estado INTO v_id, v_estado FROM public.diagnostics
  WHERE session_key = p_session_key AND resume_token = p_resume_token;
  IF v_id IS NULL THEN RAISE EXCEPTION 'Diagnostico no encontrado'; END IF;
  IF v_estado <> 'P' THEN RAISE EXCEPTION 'El diagnostico ya fue enviado'; END IF;
  IF p_step < 0 OR p_step > 4 THEN RAISE EXCEPTION 'Paso invalido'; END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(coalesce(p_answers, '[]'::jsonb)) LOOP
    IF btrim(coalesce(v_item->>'question_code','')) = '' THEN CONTINUE; END IF;
    INSERT INTO public.diagnostic_answers (diagnostic_id, step, question_code, answer_value, answer_text)
    VALUES (v_id, p_step, v_item->>'question_code', v_item->>'answer_value', v_item->>'answer_text')
    ON CONFLICT (diagnostic_id, question_code)
    DO UPDATE SET answer_value = EXCLUDED.answer_value, answer_text = EXCLUDED.answer_text, step = EXCLUDED.step;
  END LOOP;

  UPDATE public.diagnostics
  SET progreso = GREATEST(progreso, LEAST(coalesce(p_progreso, 0), 100))
  WHERE id = v_id;

  INSERT INTO public.diagnostic_audit_log (diagnostic_id, session_key, event, payload)
  VALUES (v_id, p_session_key, 'step_saved', jsonb_build_object('step', p_step, 'count', jsonb_array_length(coalesce(p_answers,'[]'::jsonb))));

  RETURN jsonb_build_object('ok', true, 'id', v_id);
END; $$;

CREATE OR REPLACE FUNCTION public.diagnostic_add_file(
  p_session_key uuid,
  p_resume_token uuid,
  p_tipo text,
  p_storage_path text,
  p_file_name text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  SELECT id INTO v_id FROM public.diagnostics
  WHERE session_key = p_session_key AND resume_token = p_resume_token AND estado = 'P';
  IF v_id IS NULL THEN RAISE EXCEPTION 'Diagnostico no encontrado'; END IF;
  IF p_tipo NOT IN ('plano_comercial','sostenibilidad') THEN RAISE EXCEPTION 'Tipo invalido'; END IF;

  INSERT INTO public.diagnostic_files (diagnostic_id, tipo, storage_path, file_name)
  VALUES (v_id, p_tipo, p_storage_path, p_file_name)
  ON CONFLICT (storage_path) DO NOTHING;

  INSERT INTO public.diagnostic_audit_log (diagnostic_id, session_key, event, payload)
  VALUES (v_id, p_session_key, 'file_added', jsonb_build_object('tipo', p_tipo, 'path', p_storage_path));

  RETURN jsonb_build_object('ok', true);
END; $$;

CREATE OR REPLACE FUNCTION public.diagnostic_submit(
  p_session_key uuid,
  p_resume_token uuid
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; v_estado public.diagnostic_status;
BEGIN
  SELECT id, estado INTO v_id, v_estado FROM public.diagnostics
  WHERE session_key = p_session_key AND resume_token = p_resume_token;
  IF v_id IS NULL THEN RAISE EXCEPTION 'Diagnostico no encontrado'; END IF;
  IF v_estado = 'V' THEN RETURN jsonb_build_object('ok', true, 'id', v_id, 'already', true); END IF;
  IF v_estado = 'A' THEN RAISE EXCEPTION 'Diagnostico archivado'; END IF;

  UPDATE public.diagnostics SET estado = 'V', progreso = 100, submitted_at = now() WHERE id = v_id;
  INSERT INTO public.diagnostic_audit_log (diagnostic_id, session_key, event, payload)
  VALUES (v_id, p_session_key, 'submitted', '{}'::jsonb);

  RETURN jsonb_build_object('ok', true, 'id', v_id, 'already', false);
END; $$;

CREATE OR REPLACE FUNCTION public.diagnostic_resume(
  p_resume_token uuid
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.diagnostics%ROWTYPE; v_answers jsonb;
BEGIN
  SELECT * INTO v_row FROM public.diagnostics WHERE resume_token = p_resume_token;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'Diagnostico no encontrado'; END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'question_code', question_code, 'answer_value', answer_value, 'answer_text', answer_text, 'step', step)), '[]'::jsonb)
  INTO v_answers FROM public.diagnostic_answers WHERE diagnostic_id = v_row.id;

  RETURN jsonb_build_object(
    'id', v_row.id, 'session_key', v_row.session_key, 'resume_token', v_row.resume_token,
    'estado', v_row.estado, 'progreso', v_row.progreso,
    'contacto', jsonb_build_object('nombre', v_row.nombre, 'apellido', v_row.apellido,
      'rol_proyecto', v_row.rol_proyecto, 'email', v_row.email, 'telefono', v_row.telefono,
      'nombre_proyecto', v_row.nombre_proyecto),
    'answers', v_answers);
END; $$;

GRANT EXECUTE ON FUNCTION public.diagnostic_start(uuid,text,text,text,text,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.diagnostic_save_step(uuid,uuid,smallint,jsonb,smallint) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.diagnostic_add_file(uuid,uuid,text,text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.diagnostic_submit(uuid,uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.diagnostic_resume(uuid) TO anon, authenticated;

CREATE POLICY "Public can upload diagnostic files" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'diagnostic-files');

CREATE POLICY "Admins can read diagnostic files bucket" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'diagnostic-files'
    AND (public.has_role(auth.uid(), 'superadmin') OR public.has_role(auth.uid(), 'admin')));