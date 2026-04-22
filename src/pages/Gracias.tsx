import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import logo from "@/assets/tt-logo-white.png";

const Gracias = () => {
  useEffect(() => {
    document.title = "Gracias | Twice Talent";
    const meta = document.querySelector('meta[name="robots"]');
    if (meta) {
      meta.setAttribute("content", "noindex, nofollow");
    } else {
      const m = document.createElement("meta");
      m.name = "robots";
      m.content = "noindex, nofollow";
      document.head.appendChild(m);
    }
    return () => {
      const m = document.querySelector('meta[name="robots"]');
      if (m) m.setAttribute("content", "index, follow");
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 py-6 bg-background/80 backdrop-blur-md border-b border-border/40">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Twice Talent" className="h-8 w-auto" />
          <span className="tt-label text-foreground tracking-[0.15em] hidden sm:inline">
            Twice Talent
          </span>
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-20">
        <div className="max-w-2xl text-center">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-8" strokeWidth={1.2} />
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
            Recibimos tu relevamiento
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Gracias por tomarte el tiempo de contarnos sobre tu proyecto. Vamos a revisar
            la información con detenimiento.
          </p>
          <p className="text-base text-muted-foreground mb-12 leading-relaxed">
            Te vamos a contactar en un plazo estimado de <strong className="text-foreground">48 a 72 horas hábiles</strong> con
            una primera devolución y, si corresponde, una propuesta formal.
          </p>

          <div className="border border-border/40 rounded-lg p-6 mb-12 text-left bg-card/30">
            <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground mb-3">
              Próximos pasos
            </p>
            <ol className="space-y-2 text-sm text-foreground/80">
              <li>1. Análisis interno del relevamiento.</li>
              <li>2. Reunión breve para alinear alcance y expectativas.</li>
              <li>3. Envío de propuesta con tiempos y presupuesto.</li>
            </ol>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 tt-btn-secondary text-xs py-3 px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Gracias;
