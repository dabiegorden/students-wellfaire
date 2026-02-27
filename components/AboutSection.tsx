"use client";

import { motion } from "framer-motion";
import { Target, Eye, Users, Sparkles } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "Revolutionize campus welfare through technology that amplifies student voices and drives institutional accountability.",
    stat: "100%",
    statLabel: "Commitment",
  },
  {
    icon: Eye,
    title: "Radical Transparency",
    description:
      "Every complaint tracked, documented, and resolved with complete visibility ensuring accountability at every stage.",
    stat: "Real-time",
    statLabel: "Updates",
  },
  {
    icon: Users,
    title: "Student-First Design",
    description:
      "Built with students for students intuitive interfaces, instant communication, and insights that drive real change.",
    stat: "2,000+",
    statLabel: "Active Users",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative py-32 bg-zinc-950 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-150 h-150 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-125 h-125 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* Diagonal Pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            rgba(255,255,255,0.05) 40px,
            rgba(255,255,255,0.05) 80px
          )`,
        }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 backdrop-blur-sm border border-cyan-400/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-400">
                About SWIS
              </span>
            </motion.div>

            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight leading-tight">
              Transforming
              <br />
              <span className="bg-linear-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Campus Welfare
              </span>
            </h2>

            {/* Description */}
            <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
              <p>
                The{" "}
                <span className="text-white font-semibold">
                  Student Welfare Insights System
                </span>{" "}
                is more than a platform it's a movement toward transparent,
                responsive, and data-driven welfare management at Catholic
                University of Ghana.
              </p>
              <p>
                We're replacing fragmented processes with an intelligent system
                that empowers both students and administrators to create
                meaningful change.
              </p>
            </div>

            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-zinc-800"
            >
              {[
                { value: "500+", label: "Issues Resolved" },
                { value: "< 2hrs", label: "Response Time" },
                { value: "98%", label: "Satisfaction" },
              ].map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <p className="text-3xl font-black text-white mb-1">
                    {metric.value}
                  </p>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                    {metric.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Values Cards */}
          <div className="space-y-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ x: 10 }}
                className="group relative"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-linear-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Card */}
                <div className="relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-8 group-hover:border-emerald-500/30 transition-all">
                  <div className="flex items-start gap-6">
                    {/* Icon */}
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-linear-to-br from-emerald-400 to-teal-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                      <div className="relative w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <value.icon className="w-8 h-8 text-zinc-950" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {value.title}
                        </h3>
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-black text-emerald-400">
                            {value.stat}
                          </p>
                          <p className="text-xs text-zinc-500 font-medium">
                            {value.statLabel}
                          </p>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-24 max-w-4xl mx-auto text-center"
        >
          <div className="relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-8xl text-emerald-400/10 font-serif">
              "
            </div>
            <p className="text-2xl lg:text-3xl font-light text-zinc-300 italic leading-relaxed relative z-10">
              Your voice matters. Your concerns are heard.
              <br />
              <span className="text-emerald-400 font-medium">
                Together, we build a better campus.
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
