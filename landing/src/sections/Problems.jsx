import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { XCircle, Frown, Bed, HelpCircle, AlertCircle, Heart, CheckCircle2, Sparkles, TrendingUp } from 'lucide-react';

const problems = [
  {
    text: "Has probado mil dietas y siempre vuelves a tu peso anterior",
    icon: XCircle,
    gradient: "from-rose-500 to-pink-600",
    shadow: "hover:shadow-rose-500/25",
    featured: true
  },
  {
    text: "Te sientes cansada y sin energía durante el día",
    icon: Bed,
    gradient: "from-amber-500 to-orange-600",
    shadow: "hover:shadow-amber-500/25"
  },
  {
    text: "No sabes qué comer para alcanzar tus objetivos",
    icon: HelpCircle,
    gradient: "from-yellow-500 to-amber-600",
    shadow: "hover:shadow-yellow-500/25"
  },
  {
    text: "Las dietas genéricas de internet no funcionan para ti",
    icon: AlertCircle,
    gradient: "from-orange-500 to-red-600",
    shadow: "hover:shadow-orange-500/25",
    featured: true
  },
  {
    text: "Quieres mejorar tu salud pero no sabes por dónde empezar",
    icon: Frown,
    gradient: "from-blue-500 to-indigo-600",
    shadow: "hover:shadow-blue-500/25"
  },
  {
    text: "Tienes ansiedad por la comida o comes emocionalmente",
    icon: Heart,
    gradient: "from-purple-500 to-pink-600",
    shadow: "hover:shadow-purple-500/25"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function Problems() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
      <section className="py-24 bg-neutral-950 text-white relative overflow-hidden">

        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-950/20 via-neutral-950 to-neutral-950" />
          <svg className="w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-pattern-problems" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" className="text-primary-500" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern-problems)" />
          </svg>
        </div>

        {/* Animated Gradient Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-rose-600/10 to-orange-600/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">

          {/* Enhanced Header */}
          <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-center max-w-3xl mx-auto mb-20"
          >
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-neutral-800/80 to-neutral-900/80 border border-neutral-700/50 mb-8 backdrop-blur-md shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Problemas Comunes</span>
            </div>

            {/* Dramatic Heading */}
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
              <span className="block text-white">¿Te Suena</span>
              <span className="block bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
                Familiar?
              </span>
            </h2>

            <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
              No estás sola. <span className="text-white font-semibold">Miles de mujeres</span> enfrentan estos mismos desafíos cada día.
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12"
          >
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              const isFeatured = problem.featured;

              return (
                  <motion.div
                      key={index}
                      variants={itemVariants}
                      className={`
                        group relative rounded-2xl overflow-hidden
                        ${isFeatured ? 'md:col-span-2 lg:col-span-1' : ''}
                      `}
                  >
                    {/* Card Background with Gradient Border */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 rounded-2xl" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${problem.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`} />

                    {/* Animated Border */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${problem.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-[1px]`}>
                      <div className="w-full h-full bg-neutral-900 rounded-2xl" />
                    </div>

                    {/* Content */}
                    <div className={`relative p-6 md:p-7 backdrop-blur-sm ${problem.shadow} transition-all duration-300 group-hover:shadow-2xl`}>

                      {/* Number Badge */}
                      <div className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                        <span className="text-xs font-black text-white/40">0{index + 1}</span>
                      </div>

                      {/* Icon with Gradient */}
                      <div className="mb-5 relative">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${problem.gradient} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>
                        {/* Glow Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${problem.gradient} blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                      </div>

                      {/* Text */}
                      <p className="text-base md:text-lg font-semibold text-white leading-relaxed group-hover:text-white transition-colors duration-300">
                        {problem.text}
                      </p>

                      {/* Hover Indicator */}
                      <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className={`h-0.5 w-8 bg-gradient-to-r ${problem.gradient} rounded-full`} />
                        <span className="text-xs font-bold text-neutral-400">Tiene solución</span>
                      </div>
                    </div>
                  </motion.div>
              );
            })}
          </motion.div>

          {/* Enhanced CTA Card */}
          <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl mx-auto"
          >
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition duration-500 animate-pulse" style={{ animationDuration: '3s' }} />

              {/* Card */}
              <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 border border-emerald-500/20 rounded-3xl overflow-hidden shadow-2xl">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-50" />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-5">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="cta-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                        <path d="M0 32V0h32" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-500" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#cta-grid)" />
                  </svg>
                </div>

                <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">

                  {/* Left Content */}
                  <div className="flex items-start gap-5 flex-1">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Buenas Noticias</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                        Todo Tiene Solución
                      </h3>
                      <p className="text-base text-neutral-300 leading-relaxed">
                        Con el <span className="text-emerald-400 font-bold">enfoque personalizado correcto</span>, puedes transformar tu salud y alcanzar tus objetivos.
                      </p>
                    </div>
                  </div>

                  {/* Right CTA Button */}
                  <button
                      onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex-shrink-0 group/btn relative overflow-hidden px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Comienza Ahora
                      <TrendingUp className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </span>
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700" />
                  </button>

                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
  );
}