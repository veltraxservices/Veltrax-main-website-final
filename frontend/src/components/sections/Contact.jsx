import React, { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { api, formatApiError } from "../../lib/api";
import { useLanguage } from "../../contexts/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const onChange = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      setSuccess(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || t("contact.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      ref={ref}
      data-testid="contact-section"
      className="relative py-24 sm:py-36 bg-[#0A0A0A] border-t border-white/5"
    >
      <div className="vx-container grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6 flex flex-col justify-between"
        >
          <div>
            <span className="vx-overline">— {t("contact.eyebrow")}</span>
            <h2 className="mt-6 font-display text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-[-0.03em] leading-[1.02] uppercase">
              {t("contact.title")}{" "}
              <span className="italic font-serif-editorial text-white/80">
                {t("contact.title_em")}
              </span>
            </h2>
            <p className="mt-8 text-white/65 text-base sm:text-lg font-light max-w-md leading-relaxed">
              {t("contact.subtitle")}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 sm:gap-10 max-w-md">
            <div>
              <span className="vx-overline">Email</span>
              <p className="mt-2 text-white text-base font-light break-all">
                veltrax.services@gmail.com
              </p>
            </div>
            <div>
              <span className="vx-overline">Location</span>
              <p className="mt-2 text-white text-base font-light">Athens · Greece</p>
            </div>
          </div>
        </motion.div>

        {/* Right - form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-6"
        >
          {success ? (
            <div
              data-testid="contact-success"
              className="border border-white/20 p-10 sm:p-14 flex flex-col items-start gap-6 bg-white/[0.02]"
            >
              <span className="w-12 h-12 border border-white flex items-center justify-center">
                <Check size={20} />
              </span>
              <p className="font-display text-white text-2xl sm:text-3xl font-light tracking-tight">
                {t("contact.success")}
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="vx-link text-white/60 hover:text-white text-sm tracking-widest uppercase"
                data-testid="contact-new-message"
              >
                ↩ {t("contact.submit")}
              </button>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              data-testid="contact-form"
              className="flex flex-col gap-8"
            >
              <div>
                <label className="vx-overline block mb-2">{t("contact.name")}</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={onChange("name")}
                  data-testid="contact-input-name"
                  className="vx-input"
                  placeholder="—"
                />
              </div>

              <div>
                <label className="vx-overline block mb-2">{t("contact.email")}</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={onChange("email")}
                  data-testid="contact-input-email"
                  className="vx-input"
                  placeholder="hello@example.com"
                />
              </div>

              <div>
                <label className="vx-overline block mb-2">{t("contact.message")}</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={onChange("message")}
                  data-testid="contact-input-message"
                  className="vx-input resize-none"
                  placeholder="—"
                />
              </div>

              {error && (
                <p
                  data-testid="contact-error"
                  className="text-red-300/80 text-sm font-light"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                data-testid="contact-submit-button"
                className="vx-btn-primary self-start disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t("contact.sending") : t("contact.submit")}
                <ArrowUpRight size={16} />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
