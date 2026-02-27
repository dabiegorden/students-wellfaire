"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  LineChart,
  Bell,
  Lock,
  ClipboardCheck,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Smart Complaint Filing",
    description:
      "Categorize and submit issues with intelligent forms, file attachments, and priority tagging for faster resolution.",
    color: "from-emerald-400 to-teal-500",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Communication",
    description:
      "WebSocket-powered instant messaging keeps you connected with administrators throughout the resolution process.",
    color: "from-teal-400 to-cyan-500",
  },
  {
    icon: LineChart,
    title: "Advanced Analytics",
    description:
      "Interactive dashboards reveal trends, bottlenecks, and insights to drive data-informed decisions.",
    color: "from-cyan-400 to-blue-500",
  },
  {
    icon: Bell,
    title: "Intelligent Notifications",
    description:
      "Stay informed with contextual alerts on status changes, responses, and important updates via multiple channels.",
    color: "from-blue-400 to-indigo-500",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description:
      "Bank-grade encryption, JWT authentication, and role-based access control protect your sensitive information.",
    color: "from-indigo-400 to-purple-500",
  },
  {
    icon: Zap,
    title: "Lightning Performance",
    description:
      "Optimized architecture ensures instant responses, real-time updates, and seamless user experience at scale.",
    color: "from-purple-400 to-pink-500",
  },
];

const FeaturesSection = () => {
  return (
    <section
      id="features"
      className="relative py-32 bg-zinc-950 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-150 h-150 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-linear(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 backdrop-blur-sm border border-emerald-400/20 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-400">
              Features
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            Built for the
            <br />
            <span className="bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Modern Campus
            </span>
          </h2>
          <p className="text-xl text-zinc-400 leading-relaxed font-light">
            Every feature designed to streamline welfare management and amplify
            student voices through technology.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              {/* Glow Effect */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${feature.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
              />

              {/* Card */}
              <div className="relative h-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-3xl p-8 group-hover:border-zinc-700 transition-all duration-300">
                {/* Icon */}
                <div className="relative mb-6">
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${feature.color} rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity`}
                  />
                  <div
                    className={`relative w-14 h-14 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center`}
                  >
                    <feature.icon className="w-7 h-7 text-zinc-950" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-zinc-500 leading-relaxed text-sm">
                  {feature.description}
                </p>

                {/* Hover Arrow */}
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  className="mt-6 flex items-center gap-2 text-emerald-400 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Learn more
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    <path
                      d="M1 8h14M9 1l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <p className="text-zinc-400 mb-4">
            Ready to experience the future of welfare management?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-linear-to-r from-emerald-400 to-teal-500 text-zinc-950 font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all"
          >
            View All Features
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="group-hover:translate-x-1 transition-transform"
            >
              <path
                d="M4 10h12M10 4l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
