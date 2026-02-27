"use client";

import { motion } from "framer-motion";
import { UserPlus, FileText, MessageCircle, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    description:
      "Quick registration with university credentials. Verify your identity and join the SWIS community in under 2 minutes.",
    highlight: "2 min setup",
  },
  {
    icon: FileText,
    step: "02",
    title: "Submit Your Concern",
    description:
      "Describe your issue with our intelligent form. Add attachments, select categories, and set priority levels for optimal routing.",
    highlight: "Smart routing",
  },
  {
    icon: MessageCircle,
    step: "03",
    title: "Real-Time Engagement",
    description:
      "Track status updates live. Chat directly with administrators, receive notifications, and watch your issue progress through resolution stages.",
    highlight: "Live updates",
  },
  {
    icon: CheckCircle2,
    step: "04",
    title: "Resolution & Feedback",
    description:
      "Get detailed resolution reports, provide feedback on the process, and help improve the system for everyone.",
    highlight: "Continuous improvement",
  },
];

const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="relative py-32 bg-zinc-900 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-48 -left-48 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-32 -right-32 w-125 h-125 bg-emerald-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-24"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 backdrop-blur-sm border border-teal-400/20 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-sm font-semibold text-teal-400">
              How It Works
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            Your Journey to
            <br />
            <span className="bg-linear-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Resolution
            </span>
          </h2>
          <p className="text-xl text-zinc-400 leading-relaxed font-light">
            Four simple steps from complaint to resolution. Transparent,
            efficient, and designed for you.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-32 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-zinc-700 to-transparent" />

          <div className="grid lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative"
              >
                {/* Timeline Dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 + 0.3 }}
                  className="relative mx-auto w-24 h-24 mb-8 lg:mb-12"
                >
                  {/* Outer Pulse Ring */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                    className="absolute inset-0 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 blur-xl"
                  />

                  {/* Main Circle */}
                  <div className="relative w-full h-full rounded-full bg-linear-to-br from-emerald-400 to-teal-500 p-0.5 shadow-2xl shadow-emerald-500/50">
                    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                      <step.icon className="w-10 h-10 text-emerald-400" />
                    </div>
                  </div>

                  {/* Step Number Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 + 0.5 }}
                    className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-linear-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg"
                  >
                    <span className="text-sm font-black text-zinc-950">
                      {step.step}
                    </span>
                  </motion.div>
                </motion.div>

                {/* Content Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 + 0.4 }}
                  whileHover={{ y: -5 }}
                  className="relative group"
                >
                  {/* Glow on Hover */}
                  <div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-6 group-hover:border-emerald-500/30 transition-all">
                    {/* Highlight Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">
                        {step.highlight}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {/* Mobile Connection Line */}
                {i < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-6">
                    <motion.div
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.15 + 0.6 }}
                      className="w-0.5 h-12 bg-linear-to-b from-emerald-400 to-teal-500 origin-top"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-24 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { value: "< 5min", label: "Avg. Submission Time" },
            { value: "24/7", label: "Support Available" },
            { value: "98%", label: "Resolution Rate" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl lg:text-4xl font-black text-white mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
