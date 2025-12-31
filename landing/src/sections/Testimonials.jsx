import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, CalendarCheck, CheckCircle2, Sparkles, ArrowRight, Heart } from 'lucide-react';

const testimonials = [
  {
    name: "María González",
    age: 34,
    result: "Perdí 12kg",
    initials: "MG",
    rating: 5,
    text: "Después de años probando dietas que no funcionaban, finalmente encontré un enfoque que se adapta a mi vida.",
    gradient: "from-rose-500 to-pink-600",
    row: 1
  },
  {
    name: "Carmen Ruiz",
    age: 45,
    result: "Controlé diabetes",
    initials: "CR",
    rating: 5,
    text: "En solo 3 meses de seguir el plan de Daniela, mis análisis mejoraron significativamente.",
    gradient: "from-blue-500 to-cyan-600",
    row: 1
  },
  {
    name: "Laura Mendoza",
    age: 28,
    result: "Más energía",
    initials: "LM",
    rating: 5,
    text: "Daniela identificó deficiencias nutricionales que ningún médico había detectado.",
    gradient: "from-amber-500 to-orange-600",
    row: 1
  },
  {
    name: "Ana Pérez",
    age: 38,
    result: "15kg sin rebote",
    initials: "AP",
    rating: 5,
    text: "Lo mejor es que te enseña a comer para toda la vida. Han pasado 6 meses sin rebote.",
    gradient: "from-purple-500 to-pink-600",
    row: 2
  },
  {
    name: "Patricia Silva",
    age: 52,
    result: "Salud cardiovascular",
    initials: "PS",
    rating: 5,
    text: "En 4 meses, todos mis marcadores mejoraron y evité medicamentos.",
    gradient: "from-emerald-500 to-teal-600",
    row: 2
  },
  {
    name: "Sofía Torres",
    age: 31,
    result: "Sin problemas digestivos",
    initials: "ST",
    rating: 5,
    text: "En pocas semanas, mis síntomas de intestino irritable desaparecieron casi por completo.",
    gradient: "from-indigo-500 to-purple-600",
    row: 2
  },
  {
    name: "Isabella Moreno",
    age: 29,
    result: "Piel radiante",
    initials: "IM",
    rating: 5,
    text: "No solo bajé de peso, mi piel mejoró increíblemente y todos me preguntan qué hago.",
    gradient: "from-pink-500 to-rose-600",
    row: 1
  },
  {
    name: "Valentina Castro",
    age: 36,
    result: "Control hormonal",
    initials: "VC",
    rating: 5,
    text: "Mis ciclos se regularon y mi ánimo mejoró notablemente con el plan personalizado.",
    gradient: "from-violet-500 to-purple-600",
    row: 2
  }
];

export default function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const row1 = testimonials.filter(t => t.row === 1);
  const row2 = testimonials.filter(t => t.row === 2);

  return (
      <section id="testimonios" className="py-24 bg-white relative overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-50 via-white to-neutral-50" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.3]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-wall" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M0 32V0h32" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-neutral-200" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-wall)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">

          {/* Header */}
          <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-12 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-100 mb-6">
              <Heart className="w-4 h-4 text-primary-600 fill-primary-600" />
              <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">Wall of Love</span>
            </div>

            <h2 className="text-3xl md:text-6xl font-black mb-4 md:mb-6 leading-tight px-4">
              <span className="text-neutral-900">Más de </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600">
                500 Mujeres
              </span>
              <br />
              <span className="text-neutral-900">Ya lo Lograron</span>
            </h2>

            <p className="text-base md:text-lg text-neutral-600 px-4">
              Lee lo que nuestras pacientes tienen que decir sobre su experiencia.
            </p>
          </motion.div>

          {/* MOBILE: Static Grid */}
          <div className="block md:hidden mb-12">
            <div className="grid grid-cols-1 gap-4 px-2">
              {testimonials.slice(0, 4).map((testimonial, index) => (
                  <motion.div
                      key={`mobile-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <TestimonialCard testimonial={testimonial} isMobile={true} />
                  </motion.div>
              ))}
            </div>
          </div>

          {/* DESKTOP: Marquee Rows */}
          <div className="hidden md:block space-y-6 mb-16 overflow-hidden">

            {/* Row 1 - Left to Right */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8 }}
                className="relative"
            >
              <div className="flex gap-4 animate-marquee-slow">
                {[...row1, ...row1].map((testimonial, index) => (
                    <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </motion.div>

            {/* Row 2 - Right to Left */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
            >
              <div className="flex gap-4 animate-marquee-slow-reverse">
                {[...row2, ...row2].map((testimonial, index) => (
                    <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </motion.div>

          </div>

          {/* CTA Card - Clean & Simple (NO STATS) */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="max-w-4xl mx-auto"
          >
            <div className="relative group">
              {/* Animated Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 rounded-2xl md:rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-500" />

              {/* Card */}
              <div className="relative rounded-2xl md:rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-neutral-800 shadow-2xl overflow-hidden">

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-gradient-to-br from-primary-600/20 to-purple-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 md:w-48 h-32 md:h-48 bg-gradient-to-tr from-pink-600/20 to-orange-600/20 rounded-full blur-3xl" />

                <div className="relative z-10 p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">

                    {/* Left: Icon & Text */}
                    <div className="flex-1 text-center md:text-left w-full">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                        <Sparkles className="w-4 h-4 text-primary-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Empieza Hoy</span>
                      </div>

                      <h3 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">
                        Únete a Ellas
                      </h3>

                      <p className="text-neutral-300 text-base md:text-lg mb-6 md:mb-0">
                        Agenda tu primera consulta gratuita y descubre cómo podemos ayudarte.
                      </p>
                    </div>

                    {/* Right: CTA Button */}
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <button
                          onClick={() => document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' })}
                          className="group/btn w-full md:w-auto px-6 md:px-8 py-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-black text-base md:text-lg shadow-[0_10px_40px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_50px_rgba(37,99,235,0.5)] hover:scale-105 transition-all duration-300"
                      >
                        <span className="flex items-center justify-center gap-2 md:gap-3">
                          <CalendarCheck className="w-5 md:w-6 h-5 md:h-6" strokeWidth={2.5} />
                          <span className="whitespace-nowrap">Agendar Consulta Gratis</span>
                          <ArrowRight className="w-4 md:w-5 h-4 md:h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </span>
                      </button>

                      <p className="mt-4 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Últimos cupos disponibles esta semana
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        <style jsx>{`
          @keyframes marquee-slow {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          
          @keyframes marquee-slow-reverse {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }

          .animate-marquee-slow {
            animation: marquee-slow 40s linear infinite;
          }

          .animate-marquee-slow-reverse {
            animation: marquee-slow-reverse 40s linear infinite;
          }

          .animate-marquee-slow:hover,
          .animate-marquee-slow-reverse:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>
  );
}

// Componente de Card Compacto
function TestimonialCard({ testimonial, isMobile = false }) {
  return (
      <div className={`${isMobile ? 'w-full' : 'flex-shrink-0 w-[320px] md:w-[380px]'} p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow-lg hover:border-neutral-300 transition-all duration-300 group`}>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
            <span className="text-white font-black text-xs">{testimonial.initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-neutral-900 text-sm leading-tight truncate">{testimonial.name}</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">{testimonial.age} años</span>
              <span className="text-neutral-300">•</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Result Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 border border-primary-100 mb-3">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
          <span className="text-xs font-bold text-primary-700">{testimonial.result}</span>
        </div>

        {/* Quote */}
        <p className={`text-neutral-600 text-sm leading-relaxed ${isMobile ? '' : 'line-clamp-3'}`}>
          "{testimonial.text}"
        </p>
      </div>
  );
}