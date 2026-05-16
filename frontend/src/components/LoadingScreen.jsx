import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOGO_SRC = "/brand/veltrax-logo.png";

const LoadingScreen = ({ onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 1900);
    const t3 = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-testid="loading-screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            filter: "blur(20px)",
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0A]"
        >
          <motion.div
            animate={{
              y: phase === 2 ? -28 : 0,
              opacity: phase === 2 ? 0 : 1,
              scale: phase === 2 ? 0.96 : 1,
            }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, filter: "blur(14px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
              data-testid="loading-logo"
            >
              <img
                src={LOGO_SRC}
                alt="Veltrax"
                draggable={false}
                className="w-[260px] sm:w-[340px] md:w-[420px] h-auto select-none"
              />
              {/* shimmer line under wordmark */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: phase >= 1 ? 1 : 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-[1px] w-32 bg-white/70 origin-left"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
