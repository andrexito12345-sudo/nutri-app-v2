import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Quote, Users, TrendingUp, Award, CalendarCheck, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

const testimonials = [
  {
    name: "María González",
    age: 34,
    result: "Perdí 12kg en 4 meses",
    image: "👩",
    rating: 5,
    text: "Después de años probando dietas que no funcionaban, finalmente encontré un enfoque que se adapta a mi vida. Daniela no solo me ayudó a perder peso, sino que cambió completamente mi relación con la comida.",
    transformation: "De talla 14 a talla 8"
  },
  {
    name: "Carmen Ruiz",
    age: 45,
    result: "Controlé mi diabetes",
    image: "👩‍🦰",
    rating: 5,
    text: "Mi médico estaba preocupado por mis niveles de glucosa. En solo 3 meses de seguir el plan de Daniela, mis análisis mejoraron significativamente. Me siento con más energía.",
    transformation: "Hemoglobina de 8.2 a 6.1"
  },
  {
    name: "Laura Mendoza",
    age: 28,
    result: "Recuperé mi energía",
    image: "👱‍♀️",
    rating: 5,
    text: "Siempre estaba cansada y sin ganas de nada. Daniela identificó deficiencias nutricionales que ningún médico había detectado. Ahora me levanto con energía y mi piel se ve radiante.",
    transformation: "De 8 a 2 tazas de café"
  },
  {
    name: "Ana Pérez",
    age: 38,
    result: "15kg menos, sin rebote",
    image: "👩‍🦱",
    rating: 5,
    text: "Lo mejor es que te enseña a comer para toda la vida. Han pasado 6 meses desde que llegué a mi peso ideal y lo he mantenido sin esfuerzo. Esto no es una dieta, es un cambio de estilo de vida.",
    transformation: "Peso estable 6 meses"
  },
  {
    name: "Patricia Silva",
    age: 52,
    result: "Salud cardiovascular",
    image: "👵",
    rating: 5,
    text: "Tenía colesterol y presión alta. Mi doctor me dijo que necesitaba cambiar urgentemente. Daniela creó un plan delicioso. En 4 meses, todos mis marcadores mejoraron y evité medicamentos.",
    transformation: "Presión de 150/95 a 120/80"
  },
  {
    name: "Sofía Torres",
    age: 31,
    result: "Adiós problemas digestivos",
    image: "👩‍💼",
    rating: 5,
    text: "Años sufriendo de intestino irritable. Daniela identificó alimentos que me causaban problemas y creó un plan personalizado. En pocas semanas, mis síntomas desaparecieron casi por completo.",
    transformation: "Sin dolor diario"
  }
];

const stats = [
  { value: "500+", numericValue: 500, label: "Pacientes Felices", icon: Users },
  { value: "95%", numericValue: 95, label: "Tasa de Éxito", icon: TrendingUp },
  { value: "4.9/5", numericValue: 4.9, label: "Valoración", icon: Star },
  { value: "8+", numericValue: 8, label: "Años de Experiencia", icon: Award },
];

// Componente contador que reinicia desde 0
function AnimatedNumber({ value, suffix = "", delay = 0 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (suffix === '/5') return latest.toFixed(1);
    return Math.round(latest);
  });

  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    count.set(0);
    const controls = animate(count, value, {
      duration: 2,
      delay: delay,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (suffix === '/5') {
          setDisplayValue(latest.toFixed(1));
        } else {
          setDisplayValue(Math.round(latest).toString());
        }
      }
    });

    return controls.stop;
  }, [value, delay, suffix]);

  return <>{displayValue}{suffix}</>;
}

export default function Testimonials() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(3);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentIndex, itemsPerPage]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView]);

  const maxIndex = Math.max(0, testimonials.length - itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  return (
      <section id="testimonios" className="py-24 bg-white relative overflow-hidden">

        <div className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dot-pattern-testi" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" className="text-neutral-200" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-pattern-testi)" />
          </svg>
        </div>

        <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-50/60 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10">

          <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-neutral-50 text-neutral-600 rounded-full font-bold text-xs tracking-wider mb-6 border border-neutral-100 shadow-sm">
              HISTORIAS REALES
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 tracking-tight leading-tight">
              Lo Que Dicen Nuestras
              <span className="block mt-1 text-primary-600">
                Pacientes Satisfechas
              </span>
            </h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
              Resultados tangibles. Más allá de la pérdida de peso, transformamos vidas y hábitos para siempre.
            </p>
          </motion.div>

          <div className="relative mb-24 group/carousel">

            <div className="hidden md:block">
              <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary-600 hover:scale-110 transition-all focus:outline-none"
                  aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-neutral-100 flex items-center justify-center text-neutral-400 hover:text-primary-600 hover:scale-110 transition-all focus:outline-none"
                  aria-label="Siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-hidden px-2 py-8 -mx-2">
              <motion.div
                  className="flex gap-8"
                  initial={false}
                  animate={{ x: `-${currentIndex * (100 / testimonials.length)}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ width: `${(testimonials.length / itemsPerPage) * 100}%` }}
              >
                {testimonials.map((testimonial, index) => (
                    <div
                        key={index}
                        className="relative px-0"
                        style={{ width: `${100 / testimonials.length}%` }}
                    >
                      <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 h-full flex flex-col relative group hover:-translate-y-1">

                        <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-3xl shadow-inner">
                              {testimonial.image}
                            </div>
                            <div>
                              <h4 className="font-bold text-neutral-900 text-lg leading-tight">{testimonial.name}</h4>
                              <p className="text-sm text-neutral-400">{testimonial.age} años</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5 bg-neutral-50 px-2 py-1 rounded-lg">
                            {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>

                        <div className="mb-5">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 font-semibold text-sm w-full">
                            <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
                            <span className="truncate">{testimonial.result}</span>
                          </div>
                        </div>

                        <div className="relative mb-6 flex-grow">
                          <Quote className="absolute -top-2 -left-2 w-6 h-6 text-primary-100 -z-10 opacity-50" />
                          <p className="text-neutral-600 leading-relaxed text-[0.95rem] pl-2">
                            "{testimonial.text}"
                          </p>
                        </div>

                        <div className="pt-4 border-t border-dashed border-neutral-200 flex items-center gap-3 mt-auto">
                          <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-4 h-4 text-accent-600" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Transformación</p>
                            <p className="text-sm font-bold text-neutral-800 truncate">{testimonial.transformation}</p>
                          </div>
                        </div>

                      </div>
                    </div>
                ))}
              </motion.div>
            </div>

            <div className="flex justify-center gap-3 mt-4">
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`transition-all duration-300 rounded-full h-2 ${
                          currentIndex === idx
                              ? "bg-primary-600 w-8"
                              : "bg-neutral-200 w-2 hover:bg-primary-300"
                      }`}
                      aria-label={`Ir a diapositiva ${idx + 1}`}
                  />
              ))}
            </div>

          </div>

          {/* TRUST INDICATORS - MINIMALISTA Y PROFESIONAL */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative max-w-6xl mx-auto"
          >
            {/* DESKTOP - GRID CON NÚMEROS ANIMADOS */}
            <div className="hidden md:grid md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const suffix = stat.value.includes('%') ? '%' :
                    stat.value.includes('+') ? '+' :
                        stat.value.includes('/') ? '/5' : '';

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.7 + (index * 0.1) }}
                        className="relative bg-gradient-to-b from-white to-neutral-50/50 rounded-3xl p-8 border border-neutral-100/50 shadow-sm hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Icono minimalista */}
                      <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-8 h-8 text-primary-600" strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Número con animación desde 0 */}
                      <div className="text-center mb-3">
                        <div className="text-5xl font-bold text-neutral-900 tracking-tight">
                          {hasAnimated && <AnimatedNumber value={stat.numericValue} suffix={suffix} delay={0.8 + (index * 0.15)} />}
                        </div>
                      </div>

                      {/* Label */}
                      <p className="text-center text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                        {stat.label}
                      </p>
                    </motion.div>
                );
              })}
            </div>

            {/* MOBILE - CARRUSEL MINIMALISTA */}
            <div className="md:hidden">
              <div className="overflow-hidden rounded-3xl">
                <AnimatePresence mode="wait">
                  <motion.div
                      key={currentStatIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="relative bg-gradient-to-b from-white to-neutral-50/30 rounded-3xl p-12 border border-neutral-100 shadow-lg"
                  >
                    {(() => {
                      const stat = stats[currentStatIndex];
                      const Icon = stat.icon;
                      const suffix = stat.value.includes('%') ? '%' :
                          stat.value.includes('+') ? '+' :
                              stat.value.includes('/') ? '/5' : '';

                      return (
                          <div className="text-center">
                            {/* Icono */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-50 mb-8"
                            >
                              <Icon className="w-10 h-10 text-primary-600" strokeWidth={1.5} />
                            </motion.div>

                            {/* Número animado desde 0 */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-6xl font-bold text-neutral-900 mb-4 tracking-tight"
                            >
                              <AnimatedNumber value={stat.numericValue} suffix={suffix} delay={0.3} />
                            </motion.div>

                            {/* Label */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-sm font-semibold text-neutral-500 uppercase tracking-wider"
                            >
                              {stat.label}
                            </motion.p>
                          </div>
                      );
                    })()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Indicadores minimalistas */}
              <div className="flex justify-center gap-2 mt-6">
                {stats.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentStatIndex(idx)}
                        className={`transition-all duration-300 rounded-full ${
                            currentStatIndex === idx
                                ? "bg-primary-600 w-8 h-2"
                                : "bg-neutral-200 w-2 h-2"
                        }`}
                        aria-label={`Ver estadística ${idx + 1}`}
                    />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-20"
          >
            <p className="text-2xl font-semibold text-neutral-900 mb-8">
              ¿Lista para ser la próxima historia de éxito?
            </p>
            <button
                onClick={() => document.getElementById('agendar')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative inline-flex items-center gap-3 px-10 py-5 bg-neutral-900 text-white rounded-xl font-bold text-lg shadow-xl shadow-neutral-900/20 hover:bg-neutral-800 hover:scale-105 transition-all duration-300"
            >
              <CalendarCheck className="w-5 h-5 text-primary-400" />
              Agendar Mi Primera Consulta Gratis
            </button>
          </motion.div>

        </div>
      </section>
  );
}