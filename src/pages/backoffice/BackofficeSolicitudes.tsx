import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RequireSuperadmin from "@/components/backoffice/RequireSuperadmin";
import BackofficeLayout from "@/components/backoffice/BackofficeLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Search, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Solicitud {
  id: string;
  created_at: string;
  nombre: string | null;
  apellido: string | null;
  email: string | null;
  telefono: string | null;
  pais: string | null;
  logo_brand: number | null;
  website: number | null;
  clarity: number | null;
  validation: number | null;
  funding: boolean | null;
  budget: string | null;
  urgency: number | null;
  readiness_score: number | null;
}

const fmtDate = (s: string) =>
  new Date(s).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const scoreColor = (n: number | null) => {
  if (n == null) return "text-muted-foreground";
  if (n >= 70) return "text-emerald-400";
  if (n >= 40) return "text-amber-400";
  return "text-rose-400";
};

function SolicitudesInner() {
  const [rows, setRows] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Solicitud | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("solicitudes")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setRows(data as Solicitud[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) =>
      [r.nombre, r.apellido, r.email, r.pais, r.telefono]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s)),
    );
  }, [rows, q]);

  const exportCSV = () => {
    const headers = [
      "fecha",
      "nombre",
      "apellido",
      "email",
      "telefono",
      "pais",
      "readiness_score",
      "logo_brand",
      "website",
      "clarity",
      "validation",
      "funding",
      "budget",
      "urgency",
    ];
    const csv = [
      headers.join(","),
      ...filtered.map((r) =>
        [
          fmtDate(r.created_at),
          r.nombre,
          r.apellido,
          r.email,
          r.telefono,
          r.pais,
          r.readiness_score,
          r.logo_brand,
          r.website,
          r.clarity,
          r.validation,
          r.funding,
          r.budget,
          r.urgency,
        ]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solicitudes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Diagnóstico</div>
          <h1 className="text-3xl" style={{ fontFamily: "Space Grotesk", fontWeight: 500 }}>
            Solicitudes <span className="text-muted-foreground">({rows.length})</span>
          </h1>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, país..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-normal px-4 py-3">Fecha</th>
                <th className="text-left font-normal px-4 py-3">Nombre</th>
                <th className="text-left font-normal px-4 py-3">Email</th>
                <th className="text-left font-normal px-4 py-3">País</th>
                <th className="text-left font-normal px-4 py-3">Budget</th>
                <th className="text-right font-normal px-4 py-3">Score</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    {r.nombre} {r.apellido}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.pais}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.budget}</td>
                  <td className={`px-4 py-3 text-right font-medium ${scoreColor(r.readiness_score)}`}>
                    {r.readiness_score ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(r)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Space Grotesk", fontWeight: 500 }}>
              {selected?.nombre} {selected?.apellido}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-4 text-sm pt-2">
              <Field label="Email" v={selected.email} />
              <Field label="Teléfono" v={selected.telefono} />
              <Field label="País" v={selected.pais} />
              <Field label="Fecha" v={fmtDate(selected.created_at)} />
              <Field label="Logo / Marca" v={selected.logo_brand} />
              <Field label="Website" v={selected.website} />
              <Field label="Claridad" v={selected.clarity} />
              <Field label="Validación" v={selected.validation} />
              <Field label="Funding" v={selected.funding ? "Sí" : "No"} />
              <Field label="Budget" v={selected.budget} />
              <Field label="Urgencia" v={selected.urgency} />
              <Field
                label="Readiness"
                v={selected.readiness_score}
                className={scoreColor(selected.readiness_score)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, v, className }: { label: string; v: any; className?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">{label}</div>
      <div className={className || ""}>{v ?? "—"}</div>
    </div>
  );
}

export default function BackofficeSolicitudes() {
  return (
    <RequireSuperadmin>
      <BackofficeLayout>
        <SolicitudesInner />
      </BackofficeLayout>
    </RequireSuperadmin>
  );
}
