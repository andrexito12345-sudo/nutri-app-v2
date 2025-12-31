import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { XCircle, Bed, HelpCircle, AlertCircle, Frown, Heart, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

const problems = [
  {
    icon: XCircle,
    title: "Efecto Yo-Yo",
    text: "Has probado mil dietas y siempre vuelves a tu peso anterior",
    iconColor: "#fb7185", // rose-400
    bgColor: "rgba(251, 113, 133, 0.1)",
    borderColor: "rgba(251, 113, 133, 0.2)",
    badgeGradient: "from-rose-500 to-rose-600"
  },
  {
    icon: Bed,
    title: "Fatiga Constante",
    text: "Te sientes cansada y sin energía durante el día",
    iconColor: "#fbbf24", // amber-400
    bgColor: "rgba(251, 191, 36, 0.1)",
    borderColor: "rgba(251, 191, 36, 0.2)",
    badgeGradient: "from-amber-500 to-amber-600"
  },
  {
    icon: HelpCircle,
    title: "Desorientación",
    text: "No sabes qué comer para alcanzar tus objetivos",
    iconColor: "#facc15", // yellow-400
    bgColor: "rgba(250, 204, 21, 0.1)",
    borderColor: "rgba(250, 204, 21, 0.2)",
    badgeGradient: "from-yellow-500 to-yellow-600"
  },
  {
    icon: AlertCircle,
    title: "Fracaso Repetido",
    text: "Las dietas genéricas de internet no funcionan para ti",
    iconColor: "#fb923c", // orange-400
    bgColor: "rgba(251, 146, 60, 0.1)",
    borderColor: "rgba(251, 146, 60, 0.2)",
    badgeGradient: "from-orange-500 to-orange-600"
  },
  {
    icon: Frown,
    title: "Sin Guía",
    text: "Quieres mejorar tu salud pero no sabes por dónde empezar",
    iconColor: "#60a5fa", // blue-400
    bgColor: "rgba(96, 165, 250, 0.1)",
    borderColor: "rgba(96, 165, 250, 0.2)",
    badgeGradient: "from-blue-500 to-blue-600"
  },
  {
    icon: Heart,
    title: "Comer Emocional",
    text: "Tienes ansiedad por la comida o comes emocionalmente",
    iconColor: "#c084fc", // purple-400
    bgColor: "rgba(192, 132, 252, 0.1)",
    borderColor: "rgba(192, 132, 252, 0.2)",
    badgeGradient: "from-purple-500 to-purple-600"
  }
];

export default function Problems() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
      <section className="py-24 bg-neutral-950 text-white relative overflow-hidden">

        {/* Background with Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-neutral-950 to-neutral-950" />

        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-pattern-timeline" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" className="text-primary-500" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern-timeline)" />
          </svg>
        </div>

        <div className="max-w-5xl mx-auto px-4 relative z-10">

          {/* Header */}
          <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-xs font-bold text-primary-300 uppercase tracking-wider">El Camino del Cambio</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              <span className="text-white">Tu Historia</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">
                Empieza Aquí
              </span>
            </h2>

            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Identifica dónde estás ahora para saber hacia dónde te diriges.
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line - Desktop */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary-500/30 to-transparent" />

            {/* Problems Timeline */}
            <div className="space-y-12 md:space-y-20">
              {problems.map((problem, index) => {
                const Icon = problem.icon;
                const isEven = index % 2 === 0;

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: index * 0.15 }}
                        className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8`}
                    >
                      {/* Card */}
                      <div className="flex-1 group">
                        <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 hover:border-primary-500/50 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-primary-500/10">

                          {/* Number Badge with Gradient */}
                          <div className={`absolute -top-4 ${isEven ? 'left-6' : 'right-6'} w-8 h-8 rounded-full bg-gradient-to-br ${problem.badgeGradient} flex items-center justify-center text-xs font-black text-white shadow-lg`}>
                            {index + 1}
                          </div>

                          <div className="flex items-start gap-4">
                            {/* Icon Container with Inline Styles */}
                            <div
                                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                                style={{
                                  backgroundColor: problem.bgColor,
                                  borderWidth: '1px',
                                  borderStyle: 'solid',
                                  borderColor: problem.borderColor
                                }}
                            >
                              <Icon
                                  className="w-6 h-6"
                                  strokeWidth={2}
                                  style={{ color: problem.iconColor }}
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-2">{problem.title}</h3>
                              <p className="text-neutral-400 leading-relaxed">{problem.text}</p>
                            </div>
                          </div>

                          {/* Timeline Dot - Desktop */}
                          <div className={`hidden md:flex absolute top-1/2 -translate-y-1/2 ${isEven ? '-right-[1.6rem]' : '-left-[1.6rem]'} w-6 h-6 rounded-full bg-neutral-900 border-2 border-primary-500 items-center justify-center z-10`}>
                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                          </div>
                        </div>
                      </div>

                      {/* Spacer for alignment */}
                      <div className="hidden md:block flex-1" />
                    </motion.div>
                );
              })}
            </div>
          </div>

          {/* Final CTA */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-20 text-center"
          >
            <div className="inline-block relative group max-w-2xl w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-500" />

              <div className="relative bg-neutral-900 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
                    <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-black text-white mb-2">
                      Rompe Este Ciclo Ahora
                    </h3>
                    <p className="text-neutral-300">
                      Con el plan correcto, cada uno de estos problemas tiene solución.
                    </p>
                  </div>

                  <button
                      onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex-shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 group/btn"
                  >
                    <span className="flex items-center gap-2">
                      Comenzar
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
  );
}