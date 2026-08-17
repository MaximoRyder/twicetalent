import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, FileText, ClipboardList, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/backoffice/login", { replace: true });
  };

  const navItems = [
    { to: "/backoffice/solicitudes", label: "Solicitudes", icon: FileText },
    { to: "/backoffice/relevamientos", label: "Relevamientos", icon: ClipboardList },
    { to: "/admin/diagnosticos", label: "Diagnósticos", icon: Stethoscope },
  ];


  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-60 border-r border-border bg-card flex flex-col">
        <div className="px-5 py-6 border-b border-border">
          <Link to="/backoffice/solicitudes" className="block">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Twice Talent</div>
            <div className="text-lg font-medium" style={{ fontFamily: "Space Grotesk" }}>
              Backoffice
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" strokeWidth={1.5} />
            Cerrar sesión
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
