import logo from "@/assets/tt-logo-white.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 py-6 bg-background/80 backdrop-blur-md border-b border-border/40">
      <a href="#" className="flex items-center gap-3">
        <img src={logo} alt="Twice Talent" className="h-8 w-auto" />
        <span className="tt-label text-foreground tracking-[0.15em] hidden sm:inline">
          Twice Talent
        </span>
      </a>
      <a href="#diagnostic" className="tt-btn-secondary text-xs py-3 px-6">
        Cuéntame y Conversemos
      </a>
    </nav>
  );
};

export default Navbar;
