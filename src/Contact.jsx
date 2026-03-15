import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import Particles from "./Lighting.jsx";
import { HiMail, HiLocationMarker, HiPhone, HiChat } from "react-icons/hi";
import { Send, Sparkles } from "lucide-react";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

import { API_BASE } from "./config.js";

const fadeUp = { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };
const stagger = { animate: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } } };

const CONTACT_CARDS = [
  {
    icon: HiMail,
    title: "Email",
    value: "support@resumeai.com",
    href: "mailto:support@resumeai.com",
    delay: 0,
  },
  {
    icon: HiPhone,
    title: "Phone",
    value: "+91 9981872498",
    href: "tel:+91 9981872498",
    delay: 0.05,
  },
  {
    icon: HiLocationMarker,
    title: "Office",
    value: "123 Resume Street, Tech City",
    href: "#",
    delay: 0.1,
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status.text) setStatus({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", text: "" });
    try {
      await axios.post(`${API_BASE}/mail`, form);
      setStatus({ type: "success", text: "Thanks! We'll get back to you within 24 hours." });
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      setStatus({ type: "error", text: "Something went wrong. Please try again or email us directly." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none min-h-screen w-full mix-blend-screen">
        <Particles
          particleColors={["#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>
      <div className="absolute inset-0 z-1 bg-linear-to-b from-black/50 via-black/40 to-black/60" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <AppHeader />

        <main className="flex-1 flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <div className="w-full max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-12 sm:mb-16"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-amber-400 text-sm font-medium mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <HiChat className="w-4 h-4" /> We reply within 24 hours
              </motion.span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
                Get in <span className="bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Touch</span>
              </h1>
              <p className="mt-4 text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
                Have a question or feedback? Drop us a line—we’d love to hear from you.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              {CONTACT_CARDS.map((item, i) => (
                <motion.a
                  key={item.title}
                  href={item.href}
                  variants={fadeUp}
                  className="group rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 sm:p-6 hover:border-amber-500/40 hover:bg-white/[0.08] transition-all duration-300"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="text-xl" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-1">{item.title}</p>
                  <p className="text-white font-semibold">{item.value}</p>
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              className="mt-8 sm:mt-10"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="rounded-2xl border border-white/10 bg-white/6 backdrop-blur-xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/30">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-semibold text-white">Send a message</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white placeholder-slate-500 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white placeholder-slate-500 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white placeholder-slate-500 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white placeholder-slate-500 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 focus:outline-none resize-none transition-all"
                      placeholder="Tell us what's on your mind..."
                    />
                  </div>
                  {status.text && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm font-medium ${status.type === "success" ? "text-amber-400" : "text-red-400"}`}
                    >
                      {status.text}
                    </motion.p>
                  )}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {submitting ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>

            <motion.p
              className="mt-8 text-center text-slate-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Prefer email?{" "}
              <a href="mailto:support@resumeai.com" className="text-amber-400 hover:text-amber-300 font-medium">
                support@resumeai.com
              </a>
            </motion.p>
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  );
}
