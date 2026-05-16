import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";

const STUDIO_IMG =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80";
const DETAIL_IMG =
  "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=1200&q=80";

const Approach = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yImg = useTransform(scrollYProgress, [0, 1], ["-6%", "10%"]);

  const principles = t("approach.principles");

  return (
    <section
      id="approach"
      ref={ref}
      data-testid="approach-section"
      className="relative py-24 sm:py-36 bg-[#0A0A0A] border-t border-white/5 overflow-hidden"
    >
      <div className="vx-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Left photo - sticky-ish parallax */}
          <div className="lg:col-span-6 relative">
            <motion.div
              style={{ y: yImg }}
              className="relative w-full h-[420px] sm:h-[560px] lg:h-[680px] overflow-hidden"
            >
              <img
                src={STUDIO_IMG}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover vx-grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
              <div className="absolute left-6 bottom-6 right-6 flex items-end justify-between">
                <span className="vx-overline text-white/70">— Studio · 01</span>
                <span className="font-display text-white/40 text-xs tracking-[0.3em]">
                  ATH · GR
                </span>
              </div>
            </motion.div>
            {/* small inset image */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block absolute -right-8 -bottom-12 w-56 h-72 overflow-hidden border-4 border-[#0A0A0A] shadow-2xl"
            >
              <img
                src={DETAIL_IMG}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover vx-grayscale"
              />
            </motion.div>
          </div>

          {/* Right content */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <span className="vx-overline">— {t("approach.eyebrow")}</span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 font-display text-white text-4xl sm:text-5xl lg:text-6xl font-light tracking-[-0.03em] leading-[1.04] uppercase"
            >
              {t("approach.title")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 text-white/65 text-base sm:text-lg font-light leading-relaxed max-w-xl"
            >
              {t("approach.subtitle")}
            </motion.p>

            <div className="mt-12 space-y-px bg-white/10 border-t border-white/10">
              {Array.isArray(principles) &&
                principles.map((p, i) => (
                  <motion.div
                    key={p.t}
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{
                      duration: 0.7,
                      delay: 0.2 + i * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    data-testid={`approach-item-${i}`}
                    className="bg-[#0A0A0A] grid grid-cols-12 gap-4 py-6 group"
                  >
                    <span className="col-span-2 font-display text-white/30 text-sm tracking-[0.3em] pt-1">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="col-span-10">
                      <h4 className="font-display text-white text-xl sm:text-2xl font-light tracking-tight">
                        {p.t}
                      </h4>
                      <p className="mt-2 text-white/55 text-sm sm:text-base font-light max-w-lg">
                        {p.d}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Approach;
