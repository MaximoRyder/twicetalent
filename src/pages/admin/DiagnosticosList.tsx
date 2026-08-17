import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RequireAdmin from "@/components/backoffice/RequireAdmin";
import BackofficeLayout from "@/components/backoffice/BackofficeLayout";
import { Input } from "@/components/ui/input";
import AppButton from "@/components/ui/AppButton";
import Icon from "@/components/ui/Icon";
import { t } from "@/lib/i18n";
import { STEPS } from "@/lib/diagnosticoData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Row = {
  id: string;
  created_at: string;
  submitted_at: string | null;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol_proyecto: string;
  nombre_proyecto: string;
  estado: "V" | "P" | "A";
  progreso: number;
};

type Answer = {
  question_code: string;
  answer_value: string | null;
  answer_text: string | null;
  step: number;
};

type FileRow = { tipo: string; storage_path: string; file_name: string | null };

const ESTADO_LABEL: Record<Row["estado"], string> = {
  V: "Completo",
  P: "Pendiente",
  A: "Archivado",
};

const questionLabel = (code: string) => {
  for (const s of STEPS) {
    const q = s.questions.find((x) => x.code === code);
    if (q) return q.label;
  }
  return code;
};

const optionLabel = (code: string, value: string) => {
  for (const s of STEPS) {
    const q = s.questions.find((x) => x.code === code);
    if (q?.options) {
      return value
        .split(",")
        .map((v) => q.options!.find((o) => o.value === v)?.label ?? v)
        .join(", ");
    }
  }
  return value;
};

function Content() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<Row | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("diagnostics")
        .select(
          "id,created_at,submitted_at,nombre,apellido,email,telefono,rol_proyecto,nombre_proyecto,estado,progreso"
        )
        .order("created_at", { ascending: false });
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const openDetail = async (row: Row) => {
    setDetail(row);
    setDetailLoading(true);
    const [a, f] = await Promise.all([
      supabase
        .from("diagnostic_answers")
        .select("question_code,answer_value,answer_text,step")
        .eq("diagnostic_id", row.id)
        .order("step"),
      supabase
        .from("diagnostic_files")
        .select("tipo,storage_path,file_name")
        .eq("diagnostic_id", row.id),
    ]);
    setAnswers((a.data as Answer[]) ?? []);
    setFiles((f.data as FileRow[]) ?? []);
    setDetailLoading(false);
  };

  const download = async (path: string) => {
    const { data } = await supabase.storage.from("diagnostic-files").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.nombre, r.apellido, r.email, r.nombre_proyecto].join(" ").toLowerCase().includes(s)
    );
  }, [rows, q]);

  const exportCsv = () => {
    const head = ["Fecha", "Nombre", "Apellido", "Email", "Telefono", "Proyecto", "Rol", "Estado", "Progreso"];
    const body = filtered.map((r) => [
      new Date(r.created_at).toLocaleString("es-UY"),
      r.nombre,
      r.apellido,
      r.email,
      r.telefono ?? "",
      r.nombre_proyecto,
      r.rol_proyecto,
      ESTADO_LABEL[r.estado],
      `${r.progreso}%`,
    ]);
    const csv = [head, ...body]
      .map((line) => line.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnosticos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 sm:p-8 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="tt-label mb-1">Backoffice</p>
          <h1 className="text-2xl font-medium" style={{ fontFamily: "Space Grotesk" }}>
            {t("admin.diagnosticos.title")}
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative">
            <Icon
              name="Search"
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("admin.diagnosticos.search")}
              className="pl-9 w-full sm:w-72"
            />
          </div>
          <AppButton variant="secondary" iconLeft="Download" onClick={exportCsv} className="py-3 text-xs">
            CSV
          </AppButton>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Icon name="Loader2" size={22} className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-16 text-center">
          {t("admin.diagnosticos.empty")}
        </p>
      ) : (
        <>
          {/* mobile: cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => openDetail(r)}
                className="w-full text-left border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium break-words" style={{ fontFamily: "Space Grotesk" }}>
                      {r.nombre_proyecto}
                    </p>
                    <p className="text-xs text-muted-foreground break-words">
                      {r.nombre} {r.apellido}
                    </p>
                    <p className="text-xs text-muted-foreground break-all">{r.email}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-accent shrink-0">
                    {ESTADO_LABEL[r.estado]}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  {new Date(r.created_at).toLocaleString("es-UY")} · {r.progreso}%
                </p>
              </button>
            ))}
          </div>

          {/* desktop: tabla */}
          <div className="hidden md:block border border-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Proyecto</th>
                  <th className="px-4 py-3 font-medium">Contacto</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Avance</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString("es-UY")}
                    </td>
                    <td className="px-4 py-3 break-words max-w-[220px]">{r.nombre_proyecto}</td>
                    <td className="px-4 py-3 break-words max-w-[240px]">
                      <div>{r.nombre} {r.apellido}</div>
                      <div className="text-xs text-muted-foreground break-all">{r.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] uppercase tracking-[0.15em] ${
                          r.estado === "V" ? "text-accent" : "text-muted-foreground"
                        }`}
                      >
                        {ESTADO_LABEL[r.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.progreso}%</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openDetail(r)}
                        className="text-muted-foreground hover:text-accent"
                        aria-label="Ver detalle"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "Space Grotesk" }}>
              {detail?.nombre_proyecto}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="tt-label mb-1">Contacto</p>
                  <p className="break-words">
                    {detail.nombre} {detail.apellido} · {detail.rol_proyecto}
                  </p>
                  <p className="text-muted-foreground break-all">{detail.email}</p>
                  {detail.telefono && <p className="text-muted-foreground">{detail.telefono}</p>}
                </div>
                <div>
                  <p className="tt-label mb-1">Estado</p>
                  <p>
                    {ESTADO_LABEL[detail.estado]} · {detail.progreso}%
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(detail.created_at).toLocaleString("es-UY")}
                  </p>
                </div>
              </div>

              {detailLoading ? (
                <Icon name="Loader2" size={18} className="animate-spin text-muted-foreground" />
              ) : (
                <>
                  <div className="space-y-4">
                    {answers.map((a) => (
                      <div key={a.question_code} className="border-t border-border pt-3">
                        <p className="tt-label mb-1 break-words">{questionLabel(a.question_code)}</p>
                        <p className="break-words whitespace-pre-wrap">
                          {a.answer_text?.trim()
                            ? a.answer_text
                            : a.answer_value
                              ? optionLabel(a.question_code, a.answer_value)
                              : "-"}
                        </p>
                      </div>
                    ))}
                  </div>

                  {files.length > 0 && (
                    <div className="border-t border-border pt-3">
                      <p className="tt-label mb-2">Adjuntos</p>
                      <div className="flex flex-wrap gap-2">
                        {files.map((f) => (
                          <button
                            key={f.storage_path}
                            onClick={() => download(f.storage_path)}
                            className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs hover:border-accent break-all"
                          >
                            <Icon name="Paperclip" size={13} />
                            {f.file_name ?? f.tipo}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DiagnosticosList() {
  return (
    <RequireAdmin>
      <BackofficeLayout>
        <Content />
      </BackofficeLayout>
    </RequireAdmin>
  );
}
