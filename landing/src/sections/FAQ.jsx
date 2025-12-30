import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Plus, Minus, HelpCircle, MessageCircle, ArrowRight } from 'lucide-react';

const faqs = [
  {
    question: "¿La primera consulta realmente es gratis?",
    answer: "Sí, 100% gratis y sin compromiso. Es una sesión de 45 minutos donde conoceremos tus objetivos, analizaremos tu situación actual y te explicaremos cómo podemos ayudarte. No hay letra pequeña ni cargos ocultos."
  },
  {
    question: "¿Cuánto tiempo toma ver resultados?",
    answer: "La mayoría de nuestras pacientes comienzan a ver cambios en las primeras 2-3 semanas. Los resultados varían según tus objetivos y compromiso, pero con nuestro método personalizado, verás progreso constante desde el inicio."
  },
  {
    question: "¿Tendré que dejar de comer lo que me gusta?",
    answer: "¡Para nada! Nuestro enfoque no se trata de prohibiciones sino de balance. Aprenderás a incluir tus alimentos favoritos de forma inteligente mientras alcanzas tus objetivos. Nada de pasar hambre ni sentirte privada."
  },
  {
    question: "¿El plan se adapta a mi presupuesto?",
    answer: "Absolutamente. Creamos planes con alimentos accesibles y realistas para tu situación. No necesitas comprar productos costosos o suplementos especiales. Trabajamos con alimentos que ya conoces y puedes conseguir fácilmente."
  },
  {
    question: "¿Qué pasa si tengo condiciones médicas?",
    answer: "Trabajamos de cerca con pacientes con diabetes, hipertensión, problemas tiroideos, SOP, y otras condiciones. El plan se adapta completamente a tus necesidades médicas. De hecho, muchas pacientes mejoran significativamente sus marcadores de salud."
  },
  {
    question: "¿Recibiré seguimiento y apoyo continuo?",
    answer: "Sí, el seguimiento es parte fundamental del programa. Tendrás consultas regulares, acceso directo por WhatsApp para resolver dudas, y ajustaremos tu plan según tus avances. Nunca estarás sola en este proceso."
  },
  {
    question: "¿Qué incluye el plan nutricional?",
    answer: "Plan de alimentación personalizado, menús semanales, lista de compras, recetas fáciles, guía de porciones, estrategias para comer fuera, manejo de antojos, y apoyo continuo. Todo adaptado a tu estilo de vida."
  },
  {
    question: "¿Funciona si ya he probado otras dietas sin éxito?",
    answer: "Precisamente por eso nuestro enfoque es diferente. No son dietas temporales sino un cambio de hábitos sostenible. Identificamos por qué las dietas anteriores no funcionaron y creamos una estrategia que sí se adapte a tu vida real."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0); // Primera pregunta abierta por defecto
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
      <section className="py-24 bg-neutral-50 relative overflow-hidden">

        {/* --- SVG Background Pattern (Dots) --- */}
        <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-pattern-faq" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" className="text-neutral-300" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern-faq)" />
          </svg>
        </div>

        {/* Decorative Blob (Solo el azul inferior izquierdo, se eliminó el verde derecho) */}
        <div className="absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 w-[600px] h-[600px] bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 max-w-4xl">

          {/* Header */}
          <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
          >
          <span className="inline-block px-4 py-1.5 bg-white text-primary-700 rounded-full font-bold text-xs tracking-wider mb-6 border border-neutral-200 shadow-sm">
            PREGUNTAS FRECUENTES
          </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 tracking-tight leading-tight">
              Resolvemos Tus
              <span className="block mt-1 text-primary-600">
              Dudas Más Comunes
            </span>
            </h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
              Todo lo que necesitas saber antes de comenzar tu transformación. Transparencia total desde el primer día.
            </p>
          </motion.div>

          {/* FAQ List */}
          <div className="space-y-4 mb-20">
            {faqs.map((faq, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={`
                group rounded-2xl border transition-all duration-300 overflow-hidden bg-white
                ${openIndex === index
                        ? 'border-primary-200 shadow-lg shadow-primary-900/5'
                        : 'border-neutral-200 hover:border-primary-200/50 hover:shadow-md'
                    }
              `}
                >
                  <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                <span className={`text-lg font-bold pr-8 transition-colors duration-300 ${openIndex === index ? 'text-primary-700' : 'text-neutral-800 group-hover:text-primary-600'}`}>
                  {faq.question}
                </span>

                    {/* Icon Container */}
                    <div className={`
                  flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                  ${openIndex === index
                        ? 'bg-primary-600 text-white rotate-180'
                        : 'bg-neutral-100 text-neutral-500 group-hover:bg-primary-50 group-hover:text-primary-600'
                    }
                `}>
                      {openIndex === index ? (
                          <Minus className="w-4 h-4" strokeWidth={3} />
                      ) : (
                          <Plus className="w-4 h-4" strokeWidth={3} />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {openIndex === index && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 text-neutral-600 leading-relaxed border-t border-transparent">
                            {/* Decorative left line for answer */}
                            <div className="flex gap-4">
                              <div className="w-0.5 min-h-full bg-primary-100 rounded-full hidden sm:block"></div>
                              <p className="flex-1 text-[0.95rem]">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
            ))}
          </div>

          {/* --- NUEVO CTA HORIZONTAL PREMIUM --- */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="relative rounded-2xl bg-neutral-900 overflow-hidden shadow-2xl shadow-neutral-900/20">

              {/* Background Decor */}
              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-neutral-800 to-transparent opacity-50 pointer-events-none"></div>
              <div className="absolute -left-10 -bottom-24 w-64 h-64 bg-primary-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
              {/* Se eliminó el acento verde aquí también para evitar "manchas" adicionales */}

              <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">

                {/* Left Side: Text */}
                <div className="flex items-start gap-6 max-w-2xl">
                  <div className="hidden md:flex w-14 h-14 rounded-xl bg-neutral-800 border border-neutral-700 items-center justify-center flex-shrink-0 text-primary-400">
                    <HelpCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      ¿No encontraste lo que buscabas?
                    </h3>
                    <p className="text-neutral-400 text-lg leading-relaxed">
                      Cada cuerpo es único y es normal tener dudas específicas. Hablemos directamente.
                    </p>
                  </div>
                </div>

                {/* Right Side: Button */}
                <div className="flex-shrink-0">
                  <button
                      onClick={() => document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })}
                      className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-neutral-900 rounded-xl font-bold text-base hover:bg-neutral-200 transition-all duration-300 shadow-lg hover:shadow-white/10 hover:-translate-y-0.5"
                  >
                    <MessageCircle className="w-5 h-5 text-primary-600" />
                    <span>Hablar con Especialista</span>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </section>
  );
}