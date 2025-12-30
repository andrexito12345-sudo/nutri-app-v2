import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { XCircle, Frown, Bed, HelpCircle, AlertCircle, Heart, CheckCircle2 } from 'lucide-react';

const problems = [
  {
    text: "Has probado mil dietas y siempre vuelves a tu peso anterior",
    icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "group-hover:border-rose-400/50"
  },
  {
    text: "Te sientes cansada y sin energía durante el día",
    icon: Bed,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "group-hover:border-amber-400/50"
  },
  {
    text: "No sabes qué comer para alcanzar tus objetivos",
    icon: HelpCircle,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "group-hover:border-yellow-400/50"
  },
  {
    text: "Las dietas genéricas de internet no funcionan para ti",
    icon: AlertCircle,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "group-hover:border-orange-400/50"
  },
  {
    text: "Quieres mejorar tu salud pero no sabes por dónde empezar",
    icon: Frown,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "group-hover:border-blue-400/50"
  },
  {
    text: "Tienes ansiedad por la comida o comes emocionalmente",
    icon: Heart,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "group-hover:border-purple-400/50"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function Problems() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
      <section className="py-24 bg-neutral-950 text-white relative overflow-hidden">

        {/* --- SVG Background Pattern --- */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" className="text-neutral-700" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern)" />
          </svg>
        </div>

        {/* --- Decorative SVG Blob (Top Right) --- */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-primary-900/20 rounded-full blur-3xl pointer-events-none" />

        {/* --- Decorative SVG Blob (Bottom Left) --- */}
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

        {/* Changed 'container' to 'max-w-5xl' to make the whole section more compact */}
        <div className="max-w-5xl mx-auto px-4 relative z-10">

          {/* Header Section */}
          <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="text-center max-w-2xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/80 border border-neutral-700 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-medium text-neutral-300 uppercase tracking-wider">Identificación de Problemas</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
              ¿Te Identificas con Alguna de Estas Situaciones?
            </h2>
            <p className="text-lg text-neutral-400 leading-relaxed">
              No estás sola. Miles de personas enfrentan estos mismos desafíos cada día.
            </p>
          </motion.div>

          {/* Grid Section */}
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                  <motion.div
                      key={index}
                      variants={itemVariants}
                      className={`
                  group relative p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md
                  hover:bg-neutral-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50
                  ${problem.border}
                `}
                  >
                    {/* Card Glow Effect */}
                    <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${problem.bg.replace('/10', '/30')}`} />

                    <div className="relative z-10">
                      <div className="flex items-start gap-4">
                        {/* Icon Container */}
                        <div className={`
                      flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center 
                      transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                      ${problem.bg} ${problem.color}
                    `}>
                          <Icon className="w-6 h-6" strokeWidth={1.5} />
                        </div>

                        {/* Text Content */}
                        <div>
                          <div className="flex items-center gap-2 mb-2 opacity-80">
                            <XCircle className="w-3 h-3 text-red-500/80" />
                            <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">Punto de Dolor</span>
                          </div>
                          <p className="text-neutral-200 font-medium leading-relaxed text-base">
                            {problem.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
              );
            })}
          </motion.div>

          {/* "Good News" Call to Action */}
          <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-12 text-center"
          >
            <div className="inline-block relative group max-w-lg mx-auto w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl px-6 py-5 shadow-2xl">
                <div className="flex items-center gap-4 text-left justify-center">

                  {/* SVG Icon for Good News */}
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      La Buena Noticia Es...
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Todo esto tiene <span className="text-emerald-400 font-bold">solución con el enfoque correcto</span>.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
  );
}