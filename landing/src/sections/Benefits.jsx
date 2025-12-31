import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Heart, Zap, TrendingUp, Smile, Shield, ArrowRight, Star } from 'lucide-react';

const benefits = [
  {
    icon: Heart,
    title: "Relación Saludable con la Comida",
    description: "Sin prohibiciones ni culpa. Aprende a disfrutar comiendo mientras alcanzas tus objetivos. Desarrolla una relación positiva con la comida que durará toda la vida.",
    stat: "98%",
    statLabel: "Sin culpa al comer",
    color: "rose",
    position: "left"
  },
  {
    icon: Zap,
    title: "Más Energía y Vitalidad",
    description: "Despierta con ganas cada mañana. Nutrición real que te impulsa durante todo el día sin bajones de energía. Optimiza tu metabolismo y recupera tu vitalidad natural.",
    stat: "3x",
    statLabel: "Más energía",
    color: "amber",
    position: "right"
  },
  {
    icon: TrendingUp,
    title: "Resultados Sostenibles",
    description: "Pierde peso de forma saludable y mantén los resultados a largo plazo. Adiós al efecto rebote para siempre. Promedio de -8kg en 3 meses con cambios permanentes.",
    stat: "-8kg",
    statLabel: "Promedio en 3 meses",
    color: "blue",
    position: "left"
  },
  {
    icon: Smile,
    title: "Mejora Tu Autoestima",
    description: "Siéntete segura y confiada cada día. El cambio físico es solo el comienzo de tu nueva versión. Desarrolla seguridad y confianza que transformarán todas las áreas de tu vida.",
    stat: "95%",
    statLabel: "Mayor confianza",
    color: "violet",
    position: "right"
  },
  {
    icon: Shield,
    title: "Prevención de Enfermedades",
    description: "Reduce riesgos de diabetes, hipertensión y problemas cardiovasculares con ciencia respaldada. Prevención activa basada en protocolos médicos validados internacionalmente.",
    stat: "-40%",
    statLabel: "Reducción de riesgo",
    color: "indigo",
    position: "left"
  },
  {
    icon: Check,
    title: "Plan 100% Personalizado",
    description: "Adaptado exclusivamente a tu estilo de vida, gustos, presupuesto y objetivos únicos. No hay dos planes iguales. El tuyo está diseñado específicamente para ti y se ajusta semana a semana.",
    stat: "100%",
    statLabel: "Personalizado para ti",
    color: "emerald",
    position: "right"
  }
];

const colorMap = {
  rose: { gradient: "from-rose-500 via-pink-500 to-rose-600", bg: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-500/20" },
  amber: { gradient: "from-amber-500 via-orange-500 to-amber-600", bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-500/20" },
  blue: { gradient: "from-blue-500 via-primary-500 to-blue-600", bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-500/20" },
  violet: { gradient: "from-violet-500 via-purple-500 to-violet-600", bg: "bg-violet-500", light: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-500/20" },
  indigo: { gradient: "from-indigo-500 via-blue-500 to-indigo-600", bg: "bg-indigo-500", light: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-500/20" },
  emerald: { gradient: "from-emerald-500 via-teal-500 to-emerald-600", bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-500/20" }
};

export default function Benefits() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
      <section className="py-24 bg-white relative overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.04),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">

          {/* Header */}
          <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 tracking-tight leading-tight">
              Transforma Tu Vida
              <span className="block mt-1 text-primary-600">
                En Todos los Niveles
              </span>
            </h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
              Beneficios integrales respaldados por ciencia y cientos de casos de éxito
            </p>
          </motion.div>

          {/* SPLIT SCREEN BENEFITS */}
          <div className="space-y-24">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const colors = colorMap[benefit.color];
              const isLeft = benefit.position === "left";

              return (
                  <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 60 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.7, delay: index * 0.15 }}
                      className="group"
                  >
                    <div className={`flex flex-col ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>

                      {/* Visual Side */}
                      <div className="flex-1">
                        <div className="relative">
                          {/* Large Icon Container */}
                          <div className={`
                            relative w-full aspect-square max-w-xs md:max-w-sm mx-auto rounded-3xl overflow-hidden
                            bg-gradient-to-br ${colors.gradient}
                            group-hover:scale-105 transition-transform duration-500
                          `}>
                            {/* Pattern Overlay */}
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,white_2px,transparent_2px)] bg-[size:24px_24px]" />

                            {/* Animated Rings */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="absolute w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/30 animate-ping" />
                              <div className="absolute w-36 h-36 md:w-48 md:h-48 rounded-full border-2 border-white/20" />
                              <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full border border-white/10" />
                            </div>

                            {/* Icon */}
                            <div className="relative h-full flex items-center justify-center">
                              <Icon className="w-24 h-24 md:w-40 md:h-40 text-white drop-shadow-2xl" strokeWidth={1.5} />
                            </div>

                            {/* Stat Badge - OPCIÓN A: REDUCCIÓN MODERADA */}
                            <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2">
                              <div className="bg-white/95 backdrop-blur-sm rounded-lg md:rounded-xl px-3 py-1.5 md:px-5 md:py-3 shadow-2xl border border-white/50">
                                <div className="text-center">
                                  <div className={`text-xl md:text-3xl font-bold bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent mb-0.5`}>
                                    {benefit.stat}
                                  </div>
                                  <div className="text-[9px] md:text-[11px] text-neutral-600 font-semibold uppercase tracking-wide whitespace-nowrap">
                                    {benefit.statLabel}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Side */}
                      <div className="flex-1">
                        <div className={`max-w-xl ${isLeft ? 'lg:pl-8' : 'lg:pr-8'}`}>
                          {/* Step Number */}
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.light} mb-6`}>
                            <span className={`text-sm font-bold ${colors.text}`}>
                              Beneficio {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 leading-tight">
                            {benefit.title}
                          </h3>

                          {/* Description */}
                          <p className="text-lg text-neutral-600 leading-relaxed mb-8">
                            {benefit.description}
                          </p>

                          {/* CTA Button */}
                          <button
                              onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
                              className={`
                                group/btn inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold
                                bg-gradient-to-r ${colors.gradient} text-white
                                hover:shadow-xl hover:scale-105 transition-all duration-200
                              `}
                          >
                            Comenzar Ahora
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
              );
            })}
          </div>

          {/* Final CTA */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-24"
          >
            <div className="relative overflow-hidden rounded-2xl bg-black">

              {/* Content */}
              <div className="relative px-6 py-10 md:px-12 md:py-12 text-center">
                <div className="max-w-4xl mx-auto">

                  {/* Avatares y Rating */}
                  <div className="flex items-center justify-center gap-3 mb-5">
                    <div className="flex -space-x-2">
                      {[1,2,3,4,5].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full bg-neutral-700 border-2 border-black" />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {[1,2,3,4,5].map(i => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                      <span className="ml-1 font-semibold text-white text-sm">4.9/5</span>
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                    ¿Lista para Cambiar Tu Vida?
                  </h3>

                  {/* Descripción */}
                  <p className="text-lg text-neutral-300 mb-8">
                    Únete a más de 500 mujeres que ya lograron sus objetivos
                  </p>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group inline-flex items-center gap-2 px-7 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Agendar Consulta Gratis
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => document.getElementById('testimonios')?.scrollIntoView({ behavior: 'smooth' })}
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-neutral-800 text-white rounded-xl font-semibold hover:bg-neutral-700 transition-all duration-200"
                    >
                      Ver Testimonios
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
  );
}