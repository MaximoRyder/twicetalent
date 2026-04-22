import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function RequireSuperadmin({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "ok" | "deny">("loading");

  useEffect(() => {
    let mounted = true;

    const check = async (userId: string | null) => {
      if (!userId) {
        if (mounted) setStatus("deny");
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "superadmin")
        .maybeSingle();
      if (!mounted) return;
      if (error || !data) {
        setStatus("deny");
      } else {
        setStatus("ok");
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session?.user?.id ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      check(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (status === "deny") {
      navigate(`/backoffice/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [status, navigate, location.pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (status === "ok") return <>{children}</>;
  return null;
}
