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
        <div className="max-w-2xl w-full">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-xs uppercase tracking-[0.2em] text-accent font-['Space_Grotesk'] font-medium">
              Relevamiento recibido
            </span>
          </div>

          <div className="border border-border bg-card/50 p-8 md:p-12">
            <CheckCircle2 className="w-12 h-12 text-accent mb-8" strokeWidth={1.2} />
            <h1 className="tt-headline-lg text-foreground mb-5">
              Lo recibimos. Ahora nos toca leerlo bien.
            </h1>
            <p className="tt-body text-secondary-foreground mb-4">
              Gracias por tomarte el tiempo de contarnos sobre tu proyecto. Vamos a revisar
              la información con la atención que merece.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Te contactaremos en un plazo de{" "}
              <strong className="text-foreground font-['Space_Grotesk'] font-medium">
                48 a 72 horas hábiles
              </strong>{" "}
              con una primera devolución y, si corresponde, una propuesta formal.
            </p>

            <div className="mt-10 pt-8 border-t border-border">
              <p className="tt-label text-muted-foreground mb-5">Próximos pasos</p>
              <ol className="space-y-4">
                {[
                  "Análisis interno del relevamiento",
                  "Reunión breve para alinear alcance y expectativas",
                  "Envío de propuesta con tiempos y presupuesto",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-accent font-['Space_Grotesk'] font-medium tabular-nums mt-0.5">
                      0{i + 1}
                    </span>
                    <span className="text-sm text-foreground/85 font-['Space_Grotesk']">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors font-['Space_Grotesk'] font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Gracias;
