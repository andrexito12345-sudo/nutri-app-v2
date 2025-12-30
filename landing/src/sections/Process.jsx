import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, ClipboardList, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    number: "01",
    icon: Calendar,
    title: "Agenda Tu Primera Consulta",
    description: "100% gratis y sin compromiso. Conoceremos tus objetivos, historial y estilo de vida en una sesión de diagnóstico.",
    cta: "Reserva en 2 minutos",
    color: "bg-primary-50 text-primary-600",
    gradientText: "from-primary-100 to-primary-200", // Para el número de fondo
    barColor: "bg-primary-500", // Barra inferior
    border: "group-hover:border-primary-100"
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "Recibe Tu Plan Personalizado",
    description: "Diseñamos un plan nutricional único para ti. Adaptado a tus gustos, horarios y presupuesto. Sin dietas genéricas.",
    cta: "100% a tu medida",
    color: "bg-accent-50 text-accent-600",
    gradientText: "from-accent-100 to-accent-200",
    barColor: "bg-accent-500",
    border: "group-hover:border-accent-100"
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Acompañamiento Continuo",
    description: "Seguimiento semanal, ajustes según tus avances y soporte constante vía WhatsApp. Nunca estarás sola.",
    cta: "Soporte ilimitado",
    color: "bg-primary-50 text-primary-600",
    gradientText: "from-primary-100 to-primary-200",
    barColor: "bg-primary-500",
    border: "group-hover:border-primary-100"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function Process() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
      <section className="py-24 bg-white relative overflow-hidden">

        {/* --- SVG Background Pattern (Dots) --- */}
        <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-pattern-process" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" className="text-neutral-300" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern-process)" />
          </svg>
        </div>

        {/* Decorative Blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary-50/40 to-accent-50/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">

          {/* Header */}
          <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-20"
          >
          <span className="inline-block px-4 py-1.5 bg-neutral-100 text-neutral-600 rounded-full font-bold text-xs tracking-wider mb-6 border border-neutral-200 shadow-sm">
            PROCESO SIMPLE
          </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 tracking-tight leading-tight">
              Cómo Funciona
              <span className="block mt-1 text-primary-600">
              En Solo 3 Pasos
            </span>
            </h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
              Sin complicaciones. Un proceso probado que te llevará del punto A al punto B de forma efectiva y sostenible.
            </p>
          </motion.div>

          {/* Steps Grid */}
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="grid md:grid-cols-3 gap-8 relative"
          >
            {/* Decorative Connecting Line (Desktop) - Improved */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 -z-10"></div>
            {/* Dots on line ends */}
            <div className="hidden md:block absolute top-[47px] left-[15%] w-1.5 h-1.5 rounded-full bg-neutral-300 -z-10"></div>
            <div className="hidden md:block absolute top-[47px] right-[15%] w-1.5 h-1.5 rounded-full bg-neutral-300 -z-10"></div>


            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                  <motion.div
                      key={index}
                      variants={itemVariants}
                      className={`
                  group relative bg-white p-8 rounded-3xl border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
                  hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden
                  ${step.border}
                `}
                  >
                    {/* Interactive Bottom Bar */}
                    <div className={`absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-500 ease-out ${step.barColor}`} />

                    {/* Big Number Background - More Artistic */}
                    <div className={`
                  absolute -top-2 right-4 text-8xl font-black font-display select-none opacity-20 
                  bg-gradient-to-br ${step.gradientText} bg-clip-text text-transparent
                  transition-all duration-500 group-hover:scale-110 group-hover:opacity-30
                `}>
                      {step.number}
                    </div>

                    {/* Icon Container */}
                    <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ${step.color}`}>
                      <Icon className="w-8 h-8" strokeWidth={1.5} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-neutral-900 mb-3 relative z-10">
                      {step.title}
                    </h3>
                    <p className="text-neutral-500 leading-relaxed mb-8 text-base relative z-10">
                      {step.description}
                    </p>

                    {/* CTA Badge / Link */}
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 group-hover:text-primary-600 transition-colors">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                      {step.cta}
                    </div>

                  </motion.div>
              );
            })}
          </motion.div>

          {/* CTA Button Final */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-20"
          >
            <button
                onClick={() => document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-primary-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-primary-600/20 hover:bg-primary-700 hover:shadow-primary-600/30 transition-all transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />

              <span className="relative">Comenzar Mi Transformación</span>
              <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-sm text-neutral-500 mt-5 font-medium flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Sin compromiso • Primera consulta gratis
            </p>
          </motion.div>

        </div>
      </section>
  );
}