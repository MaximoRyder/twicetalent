-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'user');

-- Tabla de roles (separada del usuario, evita escalada de privilegios)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función security definer para chequear roles sin recursión
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policies user_roles: cada usuario puede ver sus propios roles; superadmin ve todo
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Superadmins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));

-- Reemplazar policies de SELECT en solicitudes y relevamientos por superadmin only
DROP POLICY IF EXISTS "Only authenticated can read solicitudes" ON public.solicitudes;
DROP POLICY IF EXISTS "Only authenticated can read relevamientos" ON public.relevamientos;

CREATE POLICY "Only superadmins can read solicitudes"
ON public.solicitudes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Only superadmins can read relevamientos"
ON public.relevamientos FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'superadmin'));