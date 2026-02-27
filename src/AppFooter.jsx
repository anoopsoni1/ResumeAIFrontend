import { motion } from "framer-motion";

/**
 * Shared footer matching Templates.jsx for larger screens.
 * Simple one-liner: border-t, max-w-6xl, text-zinc-500, copyright.
 */
export default function AppFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="relative z-10 border-t border-white/10 py-6 mt-12"
    >
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-500">
        © 2025 ResumeAI. All rights reserved.
      </div>
    </motion.footer>
  );
}
