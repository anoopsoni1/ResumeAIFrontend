import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

const STORAGE_KEY = "resumeai_pwa_dismissed";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    let timer;
    if (visible) {
      timer = setTimeout(() => setVisible(false), 10000);
    }
    return () => clearTimeout(timer);
  }, [visible]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome !== "accepted") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2"
        >
          <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/95 shadow-xl shadow-indigo-500/10 backdrop-blur-xl">
            {/* subtle gradient accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/60 to-transparent" />

            <div className="flex items-start gap-4 p-4 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
                <Download className="h-5 w-5" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">Install ResumeAI</p>
                <p className="mt-0.5 text-sm text-slate-300">
                  Add to your home screen for quick access and a smoother experience.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleInstall}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    Install
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    Not now
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
