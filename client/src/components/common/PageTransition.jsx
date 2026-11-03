import React from "react";
import { motion } from "framer-motion";

/**
 * Enveloppe de transition de page (Framer Motion).
 * Micro-animation physique (150ms) : legere translation verticale + opacite.
 * Conforme aux principes Emil Kowalski : pas de scale(0), pas de fondu lent.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
