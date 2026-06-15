"use client";
import { motion } from "framer-motion";

/** A soft veil that fades away on first paint. */
export default function Veil() {
  return (
    <motion.div
      className="veil"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 0.2, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: "none" }}
    />
  );
}
