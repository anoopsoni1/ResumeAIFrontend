import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

const TOAST_DURATION_MS = 4500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, "success"), [addToast]);
  const error = useCallback((msg) => addToast(msg, "error"), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div
      className="fixed top-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none w-full max-w-sm sm:max-w-md px-4 sm:px-0"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const isError = toast.type === "error";
  const progressRef = useRef(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const t = setTimeout(onClose, TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [onClose]);

  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    startTime.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const pct = Math.min(100, (elapsed / TOAST_DURATION_MS) * 100);
      el.style.transform = `scaleX(${1 - pct / 100})`;
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const Icon = isError ? XCircle : CheckCircle2;
  const iconCls = isError ? "text-red-400" : "text-emerald-400";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 100, scale: 0.9, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`pointer-events-auto rounded-2xl shadow-2xl border overflow-hidden backdrop-blur-xl ${
        isError
          ? "bg-red-950/80 border-red-500/40 text-red-100 shadow-red-500/10"
          : "bg-emerald-950/80 border-emerald-500/40 text-emerald-100 shadow-emerald-500/10"
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.05 }}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isError ? "bg-red-500/20" : "bg-emerald-500/20"}`}
        >
          <Icon className={`h-5 w-5 ${iconCls}`} />
        </motion.span>
        <p className="text-sm font-medium flex-1 pt-0.5 pr-1">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition-all duration-200 -mt-0.5 -mr-0.5"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={progressRef}
        className={`h-1 w-full origin-left rounded-b-2xl ${isError ? "bg-red-500/50" : "bg-emerald-500/50"}`}
        style={{ transform: "scaleX(1)" }}
      />
    </motion.div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
