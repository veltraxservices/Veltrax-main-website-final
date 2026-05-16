import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const Navigation = () => {
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const goSection = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const links = [
    { id: "services", label: t("nav.services") },
    { id: "process", label: t("nav.process") },
    { id: "approach", label: t("nav.work") },
    { id: "contact", label: t("nav.contact") },
  ];

  return (
    <header
      data-testid="main-nav"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-2xl bg-[#0A0A0A]/70 border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="vx-container flex items-center justify-between h-[72px]">
        <Link
          to="/"
          data-testid="nav-logo"
          className="flex items-center"
          aria-label="Veltrax"
        >
          <img
            src="/brand/veltrax-logo.png"
            alt="Veltrax"
            draggable={false}
            className="h-16 w-16 sm:h-20 sm:w-20 select-none"
            style={{ objectFit: "contain" }}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={goSection(l.id)}
              data-testid={`nav-link-${l.id}`}
              className="vx-link text-white/80 hover:text-white text-sm font-medium tracking-wide uppercase font-display transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center text-xs font-display tracking-widest uppercase">
            <button
              data-testid="lang-toggle-el"
              onClick={() => setLang("el")}
              className={`px-2 py-1 transition-colors ${
                lang === "el" ? "text-white" : "text-white/40 hover:text-white"
              }`}
            >
              GR
            </button>
            <span className="text-white/20">/</span>
            <button
              data-testid="lang-toggle-en"
              onClick={() => setLang("en")}
              className={`px-2 py-1 transition-colors ${
                lang === "en" ? "text-white" : "text-white/40 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>

          <a
            href="#contact"
            onClick={goSection("contact")}
            data-testid="nav-start-cta"
            className="hidden md:inline-flex items-center justify-center px-5 py-2.5 border border-white/40 text-white text-xs font-display tracking-[0.16em] uppercase hover:bg-white hover:text-black transition-colors duration-300"
          >
            {t("nav.start")}
          </a>

          <button
            data-testid="nav-mobile-toggle"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-white"
            aria-label="menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-white/10"
          >
            <div className="vx-container py-8 flex flex-col gap-6">
              {links.map((l) => (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  onClick={goSection(l.id)}
                  data-testid={`nav-mobile-link-${l.id}`}
                  className="font-display text-white text-2xl tracking-tight uppercase"
                >
                  {l.label}
                </a>
              ))}
              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  data-testid="nav-mobile-lang-el"
                  onClick={() => setLang("el")}
                  className={`px-3 py-2 text-xs tracking-widest uppercase ${
                    lang === "el" ? "bg-white text-black" : "border border-white/30 text-white"
                  }`}
                >
                  GR
                </button>
                <button
                  data-testid="nav-mobile-lang-en"
                  onClick={() => setLang("en")}
                  className={`px-3 py-2 text-xs tracking-widest uppercase ${
                    lang === "en" ? "bg-white text-black" : "border border-white/30 text-white"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navigation;
