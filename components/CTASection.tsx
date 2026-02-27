"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CTASection = () => {
  return (
    <section
      id="contact"
      className="relative py-32 bg-zinc-900 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-linear-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Main Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-linear-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 rounded-[40px] blur-3xl" />

            {/* Card Content */}
            <div className="relative bg-linear-to-br from-zinc-800/90 to-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 rounded-[40px] p-12 lg:p-20 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-linear-to-tr from-teal-500/10 to-transparent rounded-full blur-3xl" />

              {/* Grid Pattern */}
              <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                  backgroundSize: "30px 30px",
                }}
              />

              {/* Content */}
              <div className="relative z-10 text-center max-w-3xl mx-auto">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/10 backdrop-blur-sm border border-emerald-400/20 mb-8"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">
                    Join the Movement
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight"
                >
                  Ready to Make
                  <br />
                  <span className="bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Your Voice Heard?
                  </span>
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-zinc-400 mb-12 leading-relaxed font-light max-w-2xl mx-auto"
                >
                  Join thousands of students using SWIS to create positive
                  change on campus. Your concerns matter start your journey
                  today.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <Link href="/register">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        className="relative overflow-hidden bg-linear-to-r from-emerald-400 to-teal-500 text-zinc-950 font-bold text-base px-10 py-7 rounded-xl hover:shadow-2xl hover:shadow-emerald-500/50 transition-all group"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          Get Started Now
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-linear-to-r from-emerald-300 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </motion.div>
                  </Link>

                  <Link href="/login">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-2 border-zinc-700 text-slate-900 font-semibold text-base px-10 py-7 rounded-xl"
                      >
                        Already a Member? Log In
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="mt-12 pt-12 border-t border-zinc-700/50"
                >
                  <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                    {[
                      { value: "2,000+", label: "Active Students" },
                      { value: "500+", label: "Issues Resolved" },
                      { value: "98%", label: "Satisfaction" },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="text-center"
                      >
                        <p className="text-2xl lg:text-3xl font-black text-white mb-1">
                          {stat.value}
                        </p>
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                          {stat.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
