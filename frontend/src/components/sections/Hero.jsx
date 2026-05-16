import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const HERO_IMG =
  "https://static.prod-images.emergentagent.com/jobs/b457d1cd-e986-407e-8de4-689a0cc924dd/images/1cc4540df140c290fb41fef25dff97a010cce576ecfe9c144bf5cb6a3a0fb51d.png";

const Hero = () => {
  const { t } = useLanguage();
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const scrollDown = () => {
    const el = document.getElementById("services");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollContact = (e) => {
    e.preventDefault();
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollWork = (e) => {
    e.preventDefault();
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  // Reveal animation for headline lines
  const lineVariants = {
    hidden: { y: 110, opacity: 0 },
    show: (i) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 1.1,
        ease: [0.22, 1, 0.36, 1],
        delay: 2.4 + i * 0.12, // wait for loading screen
      },
    }),
  };

  const lines = ["hero.title_l1", "hero.title_l2", "hero.title_l3", "hero.title_l4"];

  return (
    <section
      ref={sectionRef}
      id="home"
      data-testid="hero-section"
      className="relative min-h-screen w-full overflow-hidden flex flex-col justify-end pt-28 sm:pt-32 pb-16 sm:pb-24"
    >
      {/* Parallax background image */}
      <motion.div
        style={{ y: yBg, scale, opacity }}
        className="absolute inset-0 z-0"
      >
        <img
          src={HERO_IMG}
          alt=""
          className="w-full h-[120%] object-cover vx-grayscale"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-[#0A0A0A]/55 to-[#0A0A0A]" />
        <div className="absolute inset-0 bg-[#0A0A0A]/30" />
      </motion.div>

      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1] opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="vx-container relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 mb-10"
        >
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="vx-overline text-white/70">{t("hero.eyebrow")}</span>
        </motion.div>

        <h1 className="font-display text-white font-light tracking-[-0.04em] leading-[0.92] text-[13vw] sm:text-[11vw] md:text-[9vw] lg:text-[7.5vw] xl:text-[6.8vw] uppercase max-w-[1400px]">
          {lines.map((key, i) => (
            <span key={key} className="block overflow-hidden">
              <motion.span
                custom={i}
                initial="hidden"
                animate="show"
                variants={lineVariants}
                className="block"
              >
                {t(key)}{" "}
                {i === 2 && (
                  <span className="inline-block align-middle mx-3 sm:mx-4">
                    <span className="inline-block w-[0.9em] h-[0.9em] rounded-full border border-white/40 align-middle" />
                  </span>
                )}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.0, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-end"
        >
          <p
            data-testid="hero-subtitle"
            className="md:col-span-7 lg:col-span-6 text-white/70 text-base sm:text-lg leading-relaxed font-light max-w-xl"
          >
            {t("hero.subtitle")}
          </p>

          <div className="md:col-span-5 lg:col-span-6 flex flex-col sm:flex-row gap-4 sm:justify-end">
            <button
              type="button"
              onClick={scrollContact}
              data-testid="hero-cta-primary"
              className="vx-btn-primary group"
            >
              {t("hero.cta_primary")}
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </button>
            <button
              type="button"
              onClick={scrollWork}
              data-testid="hero-cta-secondary"
              className="vx-btn-ghost"
            >
              {t("hero.cta_secondary")}
            </button>
          </div>
        </motion.div>

        <motion.button
          type="button"
          onClick={scrollDown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.4, duration: 0.7 }}
          data-testid="hero-scroll-indicator"
          className="absolute right-6 sm:right-12 lg:right-20 bottom-12 hidden md:flex flex-col items-center gap-3 text-white/60 hover:text-white transition-colors"
        >
          <span className="vx-overline rotate-90 origin-center mt-12">
            {t("hero.scroll")}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={16} />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;
