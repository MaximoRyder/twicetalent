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

type Relevamiento = Record<string, any> & { id: string; created_at: string };

const fmtDate = (s: string) =>
  new Date(s).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function RelevamientosInner() {
  const [rows, setRows] = useState<Relevamiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Relevamiento | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("relevamientos")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setRows(data as Relevamiento[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) =>
      [r.nombre, r.apellido, r.email, r.empresa, r.pais, r.industria, r.tipo_proyecto]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s)),
    );
  }, [rows, q]);

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = Object.keys(filtered[0]);
    const csv = [
      headers.join(","),
      ...filtered.map((r) =>
        headers
          .map((h) => {
            const v = r[h];
            const s = Array.isArray(v) ? v.join("; ") : v == null ? "" : String(v);
            return `"${s.replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relevamientos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Brief largo</div>
          <h1 className="text-3xl" style={{ fontFamily: "Space Grotesk", fontWeight: 500 }}>
            Relevamientos <span className="text-muted-foreground">({rows.length})</span>
          </h1>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, empresa, email..."
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
                <th className="text-left font-normal px-4 py-3">Empresa</th>
                <th className="text-left font-normal px-4 py-3">Email</th>
                <th className="text-left font-normal px-4 py-3">País</th>
                <th className="text-left font-normal px-4 py-3">Industria</th>
                <th className="text-left font-normal px-4 py-3">Proyecto</th>
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
                  <td className="px-4 py-3 text-muted-foreground">{r.empresa || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.pais}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.industria}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.tipo_proyecto}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(r)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Space Grotesk", fontWeight: 500 }}>
              {selected?.nombre} {selected?.apellido}
              {selected?.empresa ? ` · ${selected.empresa}` : ""}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 pt-2">
              {Object.entries(selected)
                .filter(([k]) => k !== "id")
                .map(([k, v]) => (
                  <div key={k} className="border-b border-border/50 pb-3">
                    <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">
                      {k.replace(/_/g, " ")}
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {Array.isArray(v)
                        ? v.length
                          ? v.join(", ")
                          : "—"
                        : v === null || v === ""
                          ? "—"
                          : typeof v === "boolean"
                            ? v
                              ? "Sí"
                              : "No"
                            : k === "created_at"
                              ? fmtDate(String(v))
                              : String(v)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BackofficeRelevamientos() {
  return (
    <RequireSuperadmin>
      <BackofficeLayout>
        <RelevamientosInner />
      </BackofficeLayout>
    </RequireSuperadmin>
  );
}
