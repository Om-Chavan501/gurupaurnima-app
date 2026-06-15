"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/** Soft veil that fades away once — on the very first visit of a session.
 *  Skipped on subsequent client navigations to keep transitions snappy. */
export default function Veil() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!sessionStorage.getItem("gp.veil.shown")) {
        setShow(true);
        sessionStorage.setItem("gp.veil.shown", "1");
      }
    } catch { /* private mode etc. */ }
  }, []);

  if (!show) return null;
  return (
    <motion.div
      className="veil"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: "none" }}
      onAnimationComplete={() => setShow(false)}
    />
  );
}
