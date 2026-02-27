"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/public/assets/hero-bg.jpg";
import Image from "next/image";
import { useRef } from "react";
import Link from "next/link";

const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-zinc-950"
    >
      {/* Animated Background */}
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src={heroBg}
          alt="University campus"
          className="w-full h-full object-cover opacity-20"
          loading="eager"
          fill
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-zinc-950/50 via-zinc-950/80 to-zinc-950" />
      </motion.div>

      {/* linear Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 -right-48 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-32 -left-32 w-150 h-150 bg-teal-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-linear(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-linear(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 container mx-auto px-6 lg:px-12 pt-32 pb-20"
      >
        <div className="max-w-5xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl" />
              <div className="relative px-4 py-2 rounded-full bg-zinc-900/50 backdrop-blur-sm border border-emerald-400/20 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">
                  Catholic University of Ghana
                </span>
              </div>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight text-white leading-[1.05] mb-8"
          >
            Student Welfare
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Reimagined
              </span>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute bottom-2 left-0 right-0 h-3 bg-linear-to-r from-emerald-400/30 to-teal-400/30 z-0 origin-left"
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg sm:text-xl lg:text-2xl text-zinc-400 mb-12 max-w-3xl leading-relaxed font-light"
          >
            A transformative platform where student voices drive real change.
            Submit complaints, track progress, and engage with administration
            through intelligent, transparent workflows.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/complaints">
                <Button
                  size="lg"
                  className="relative overflow-hidden bg-linear-to-r from-emerald-400 to-teal-500 text-zinc-950 font-bold text-base px-10 py-7 rounded-xl hover:shadow-2xl hover:shadow-emerald-500/50 transition-all group cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Submit a Complaint
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-linear-to-r from-emerald-300 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/track-response">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-zinc-700 text-slate-900 font-semibold text-base px-10 py-7 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Track Response
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl"
          >
            {[
              { value: "500+", label: "Issues Resolved", trend: "+23%" },
              { value: "2,000+", label: "Active Students", trend: "+45%" },
              { value: "98%", label: "Satisfaction Rate", trend: "+5%" },
              { value: "< 2hrs", label: "Response Time", trend: "-30%" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-6 group-hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-3xl lg:text-4xl font-black text-white">
                      {stat.value}
                    </p>
                    <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-400/10">
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 font-medium">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
