import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Youtube, Music2, Mail } from "lucide-react";
import { api } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    youtube: "",
    instagram: "",
    tiktok: "",
    email: "",
  });

  useEffect(() => {
    let mounted = true;
    api
      .get("/settings")
      .then(({ data }) => mounted && setSettings(data))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const socials = [
    settings.instagram && {
      key: "instagram",
      url: settings.instagram,
      Icon: Instagram,
      label: "Instagram",
    },
    settings.youtube && {
      key: "youtube",
      url: settings.youtube,
      Icon: Youtube,
      label: "YouTube",
    },
    settings.tiktok && {
      key: "tiktok",
      url: settings.tiktok,
      Icon: Music2,
      label: "TikTok",
    },
  ].filter(Boolean);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      data-testid="main-footer"
      className="relative bg-[#0A0A0A] border-t border-white/10 pt-20 sm:pt-28 pb-10"
    >
      <div className="vx-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/10">
          <div className="lg:col-span-6">
            <Link
              to="/"
              data-testid="footer-logo"
              className="inline-flex items-center"
              aria-label="Veltrax"
            >
              <img
                src="/brand/veltrax-logo.png"
                alt="Veltrax"
                draggable={false}
                className="w-40 sm:w-52 lg:w-60 h-auto select-none"
              />
            </Link>
            <p className="mt-6 text-white/55 text-base sm:text-lg font-light max-w-md">
              {t("footer.tagline")}
            </p>
          </div>

          <div className="lg:col-span-2">
            <span className="vx-overline">{t("footer.nav_label")}</span>
            <ul className="mt-5 space-y-3">
              {["services", "process", "approach", "contact"].map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={scrollTo(id)}
                    data-testid={`footer-link-${id}`}
                    className="vx-link text-white/70 hover:text-white text-base font-light"
                  >
                    {t(id === "approach" ? "nav.work" : `nav.${id}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <span className="vx-overline">{t("footer.contact_label")}</span>
            <ul className="mt-5 space-y-3">
              {settings.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    data-testid="footer-email-link"
                    className="vx-link inline-flex items-center gap-2 text-white/70 hover:text-white text-base font-light"
                  >
                    <Mail size={14} />
                    {settings.email}
                  </a>
                </li>
              )}
              <li className="text-white/70 text-base font-light">Athens · Greece</li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <span className="vx-overline">{t("footer.social_label")}</span>
            <ul className="mt-5 space-y-3">
              {socials.length === 0 ? (
                <li className="text-white/30 text-base font-light">—</li>
              ) : (
                socials.map(({ key, url, Icon, label }) => (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      data-testid={`footer-social-${key}`}
                      className="vx-link inline-flex items-center gap-2 text-white/70 hover:text-white text-base font-light"
                    >
                      <Icon size={14} />
                      {label}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white/40 text-xs tracking-widest uppercase font-display">
          <p>
            © {new Date().getFullYear()} Veltrax. {t("footer.rights")}
          </p>
          <Link
            to="/admin/login"
            data-testid="footer-admin-link"
            className="vx-link hover:text-white"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
