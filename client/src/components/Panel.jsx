import { motion } from "framer-motion";

export default function Panel({ className = "", children, delay = 0, hover = true }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      whileHover={hover ? { scale: 1.015, boxShadow: "0 0 0 1px rgba(59,130,246,0.18), 0 16px 44px rgba(0,0,0,0.28)" } : undefined}
      className={`glass-panel card-border rounded-[28px] ${className}`}
    >
      {children}
    </motion.section>
  );
}
