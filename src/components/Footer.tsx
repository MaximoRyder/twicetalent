import { Instagram } from "lucide-react";
import logo from "@/assets/tt-logo-white.png";

const Footer = () => {
  return (
    <footer className="px-6 md:px-12 lg:px-20 xl:px-32 py-12 border-t border-accent/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Twice Talent" className="h-6 w-auto" />
        <span className="tt-label text-muted-foreground">Twice Talent</span>
      </div>
      <div className="flex items-center gap-6">
        <a
          href="https://www.instagram.com/twicetalent/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de Twice Talent"
          className="group flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
        >
          <Instagram className="h-4 w-4" strokeWidth={1.5} />
          <span className="tt-label text-xs hidden sm:inline">@twicetalent</span>
        </a>
        <p className="text-xs text-muted-foreground tracking-wide">
          © {new Date().getFullYear()} Twice Talent. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
