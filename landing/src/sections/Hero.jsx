import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Star, Users } from 'lucide-react';

// Componente pequeño para animar los números
const AnimatedCounter = ({ value, suffix = "", decimals = 0, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: 2
  });

  useEffect(() => {
    if (inView) {
      const timeout = setTimeout(() => {
        motionValue.set(value);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [motionValue, inView, value, delay]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Number(latest).toFixed(decimals) + suffix;
      }
    });
  }, [springValue, decimals, suffix]);

  return <span ref={ref} />;
};

export default function Hero() {
  const scrollToBooking = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-20 pb-10 lg:py-0">
        {/* Decorative Elements - Ajustados para no molestar en móvil */}
        <div className="absolute top-20 right-10 w-40 h-40 md:w-72 md:h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute bottom-20 left-10 w-40 h-40 md:w-72 md:h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }} />

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left Column - Content */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 md:space-y-8 text-center lg:text-left"
            >
              {/* Social Proof Badge - AHORA VISIBLE EN MÓVIL */}
              <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-primary-100 mx-auto lg:mx-0"
              >
                <div className="bg-primary-100 p-1 rounded-full">
                  <Users className="w-3 h-3 md:w-4 md:h-4 text-primary-600" />
                </div>
                <span className="text-xs md:text-sm font-medium text-neutral-700">
                  +100 Vidas Transformadas en 2024
                </span>
              </motion.div>

              {/* Main Headline */}
              <div>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] md:leading-tight text-neutral-900"
                >
                  Transforma Tu Vida
                  {/* CORRECCIÓN AQUÍ:
                      - whitespace-nowrap: Fuerza 1 línea en Móvil (donde tenemos text-3xl).
                      - lg:whitespace-normal: Permite saltos de línea normales en Desktop (donde tenemos text-7xl), evitando que se rompa.
                  */}
                  <span className="gradient-text block mt-1 md:mt-2 pb-2 whitespace-nowrap lg:whitespace-normal">
                    Sin Dietas Restrictivas
                  </span>
                </motion.h1>

                {/* IMAGEN MÓVIL EXCLUSIVA - Ajuste de posición: object-top */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                    className="lg:hidden relative w-full max-w-[320px] mx-auto my-6 aspect-[4/5] rounded-2xl overflow-hidden shadow-xl"
                >
                  <img
                      src="/images/Doctora3.png"
                      alt="Daniela Vaca"
                      className="w-full h-full object-cover object-top"
                  />
                  {/* Floating Stat Mobile */}
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-accent-100/50">
                    <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-accent-600 fill-accent-600" />
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Satisfacción</div>
                      <div className="text-sm font-bold text-accent-700">98%</div>
                    </div>
                  </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg md:text-xl lg:text-[1.7rem] text-neutral-600 mt-4 md:mt-6 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                >
                  Nutrición personalizada basada en ciencia. Resultados reales,
                  <span className="font-semibold text-primary-700"> sostenibles y sin rebote.</span>
                </motion.p>
              </div>

              {/* Trust Indicators - Estrella Azul Aplicada */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4 items-center"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg border border-neutral-100 text-neutral-600 shadow-sm">
                  <Shield className="w-4 h-4 text-primary-600" />
                  <span className="text-xs md:text-sm font-medium">Nutricionista Certificada</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-lg border border-neutral-100 text-neutral-600 shadow-sm">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-xs md:text-sm font-medium">Método Probado</span>
                </div>
              </motion.div>

              {/* Urgency Element - Responsive */}
              <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-3 py-1"
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold uppercase tracking-wide border border-red-100 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Alta Demanda
                </div>
                <p className="text-sm font-medium text-neutral-600 text-center">
                  Solo quedan <span className="text-neutral-900 font-bold border-b-2 border-accent-200">3 cupos</span> esta semana
                </p>
              </motion.div>

              {/* CTA Buttons - Stacked on mobile, row on larger */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto"
              >
                <button
                    onClick={scrollToBooking}
                    className="btn-primary group flex items-center justify-center gap-2 w-full sm:w-auto py-3.5 md:py-3 text-base"
                >
                  Agendar Primera Consulta GRATIS
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                    onClick={() => document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-secondary w-full sm:w-auto py-3.5 md:py-3 text-base text-center justify-center"
                >
                  Calcular Mi IMC Gratis
                </button>
              </motion.div>

              {/* Social Proof Numbers - VISIBLE Y REDISEÑADO PARA MÓVIL */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="grid grid-cols-3 gap-2 md:gap-6 pt-6 md:pt-8 border-t border-neutral-200"
              >
                <div className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-primary-700">
                    <AnimatedCounter value={95} suffix="%" delay={0.9} />
                  </div>
                  <div className="text-xs md:text-sm text-neutral-600 mt-1 font-medium">Tasa de Éxito</div>
                </div>
                <div className="text-center lg:text-left border-l border-neutral-100 lg:border-none">
                  <div className="text-2xl md:text-3xl font-bold text-primary-700 flex justify-center lg:justify-start items-center gap-1">
                    <AnimatedCounter value={4.9} decimals={1} delay={0.9} />
                    <Star className="w-4 h-4 md:w-5 md:h-5 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-xs md:text-sm text-neutral-600 mt-1 font-medium">Valoración</div>
                </div>
                <div className="text-center lg:text-left border-l border-neutral-100 lg:border-none">
                  <div className="text-2xl md:text-3xl font-bold text-primary-700">
                    <AnimatedCounter value={8} suffix="+" delay={0.9} />
                  </div>
                  <div className="text-xs md:text-sm text-neutral-600 mt-1 font-medium">Años Exp.</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Image/Visual - ONLY DESKTOP (Preservado Intacto) */}
            <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:block"
            >
              <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                {/* Imagen Real */}
                <img
                    src="/images/Doctora3.png"
                    alt="Daniela Vaca - Nutricionista Certificada en Guayaquil"
                    className="w-full h-full object-cover object-top"
                    style={{ objectPosition: 'center 8%' }}
                />

                {/* Overlay Sutil */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-primary-800/10" />

                {/* Floating Stats Cards - Desktop */}
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-3 py-2.5 rounded-xl shadow-lg animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-600 leading-tight">Promedio</div>
                      <div className="text-base font-bold text-primary-700 leading-tight">-8kg</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm px-3 py-2.5 rounded-xl shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-accent-600" fill="currentColor" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-600 leading-tight">Satisfacción</div>
                      <div className="text-base font-bold text-accent-700 leading-tight">98%</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 leading-tight">Daniela Vaca</p>
                      <p className="text-xs text-neutral-600 leading-tight">Nutricionista Certificada</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator - SOLO DESKTOP */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="hidden md:block absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2 text-neutral-400">
            <span className="text-sm">Descubre más</span>
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-6 h-10 border-2 border-neutral-300 rounded-full flex items-start justify-center p-2"
            >
              <div className="w-1 h-2 bg-neutral-400 rounded-full" />
            </motion.div>
          </div>
        </motion.div>
      </section>
  );
}