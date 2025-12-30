import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Heart, Zap, TrendingUp, Smile, Shield, ArrowRight, Star } from 'lucide-react';

const benefits = [
  {
    icon: Heart,
    title: "Relación Saludable con la Comida",
    description: "Sin prohibiciones ni culpa. Aprende a disfrutar comiendo mientras alcanzas tus objetivos.",
    color: "text-rose-600",
    bg: "bg-primary-100",
    border: "group-hover:border-rose-200"
  },
  {
    icon: Zap,
    title: "Más Energía y Vitalidad",
    description: "Despierta con ganas. Nutrición real que te impulsa durante todo el día sin bajones.",
    color: "text-amber-600",
    bg: "bg-primary-100",
    border: "group-hover:border-amber-200"
  },
  {
    icon: TrendingUp,
    title: "Resultados Sostenibles",
    description: "Pierde peso de forma saludable y mantén los resultados a largo plazo. Adiós al efecto rebote.",
    // Restaurado al color Primary de tu marca
    color: "text-primary-600",
    bg: "bg-primary-100",
    border: "group-hover:border-primary-200"
  },
  {
    icon: Smile,
    title: "Mejora Tu Autoestima",
    description: "Siéntete segura y confiada. El cambio físico es solo el comienzo de tu nueva versión.",
    color: "text-violet-600",
    bg: "bg-primary-100",
    border: "group-hover:border-violet-200"
  },
  {
    icon: Shield,
    title: "Prevención de Enfermedades",
    description: "Reduce riesgos de diabetes, hipertensión y problemas cardiovasculares con ciencia.",
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "group-hover:border-blue-200"
  },
  {
    icon: Check,
    title: "Plan 100% Personalizado",
    description: "Adaptado a tu estilo de vida, gustos, presupuesto y objetivos únicos. Hecho para ti.",
    // Usamos el color Accent (Teal) o Green para variedad, aquí mantengo índigo/verde según preferencia,
    // pero usaré Accent si quieres que coincida con tu paleta secundaria. Lo dejaré en Emerald/Green por semántica de "Check".
    color: "text-emerald-600",
    bg: "bg-primary-100",
    border: "group-hover:border-emerald-200"
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

export default function Benefits() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
      <section className="py-24 bg-white relative overflow-hidden">

        {/* --- SVG Background Pattern (Subtle Grid) --- */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="small-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#small-grid)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#d1d5db" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative Blob - Usando Primary */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
        <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-primary-50/50 rounded-full blur-3xl pointer-events-none" />

        {/* Contenedor ajustado a max-w-6xl para equilibrio perfecto */}
        <div className="max-w-6xl mx-auto px-4 relative z-10">

          {/* Header */}
          <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-20"
          >
          <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full font-bold text-xs tracking-wider mb-6 border border-primary-100 shadow-sm">
            RESULTADOS REALES
          </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 tracking-tight leading-tight">
              Lo Que Lograrás con
              {/* CORREGIDO: Usando text-primary-600 estricto */}
              <span className="block mt-1 text-primary-600">
              Nuestro Acompañamiento
            </span>
            </h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
              Un enfoque integral que transforma no solo tu cuerpo, sino tu mente y tu bienestar general para siempre.
            </p>
          </motion.div>

          {/* Grid de Beneficios */}
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                  <motion.div
                      key={index}
                      variants={itemVariants}
                      className={`
                  group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 
                  border border-neutral-100 hover:-translate-y-1 ${benefit.border}
                `}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${benefit.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${benefit.color}`} strokeWidth={2} />
                    </div>

                    {/* Título hover cambia a primary-700 */}
                    <h3 className="text-xl font-bold mb-3 text-neutral-900 group-hover:text-primary-700 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-neutral-500 leading-relaxed text-base">
                      {benefit.description}
                    </p>
                  </motion.div>
              );
            })}
          </motion.div>

          {/* Success Cases CTA - Restaurado a colores Primary */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-20"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-2xl">
              {/* Decorative Background Elements (adaptados para fondo azul) */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-white rounded-full blur-3xl opacity-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-64 h-64 bg-primary-900 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

              <div className="relative z-10 px-10 py-10 md:px-12 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8">

                <div className="text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-600 bg-primary-500"></div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                      <span className="text-sm font-semibold text-primary-100">4.9/5</span>
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                    Casos de Éxito Reales
                  </h3>
                  <p className="text-primary-100 text-lg">
                    Más de 500 personas ya han transformado sus vidas.
                  </p>
                </div>

                <button
                    onClick={() => document.getElementById('testimonios')?.scrollIntoView({ behavior: 'smooth' })}
                    className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-primary-700 transition-all duration-200 bg-white rounded-xl hover:bg-primary-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-primary-700 text-base shadow-lg"
                >
                  Ver Testimonios
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>

              </div>
            </div>
          </motion.div>

        </div>
      </section>
  );
}